import { createHash } from "node:crypto";
import { ApiClient } from "./api/client";
import { GramClient } from "./gram";
import {
  addRedactionToken,
  formatProxyProbeMessage,
  highlightId,
  highlightUsername,
  log,
  stringifyForLog,
} from "./logger";
import {
  createWebhookHandler,
  PollingTransport,
  validateWebhookSecretToken,
  WebhookTransport,
} from "./polling";
import { UpdateRouter } from "./router";
import type { BaseContext } from "../context";
import type { MiddlewareFn } from "../middleware/types";
import { SceneManager } from "../scenes";
import type {
  BotModule,
  BotOptions,
  BotRuntimeConfig,
  BotWebhookConfig,
  CreateWebhookAdapter,
  CreateWebhookOptions,
  Constructor,
  HookErrorClass,
  HookErrorEnvelope,
  LaunchOptions,
} from "./types";
import type { Update, User } from "../types/telegram";

/** Bot entry: API, routing, scenes, transport. */
class Bot {
  public readonly api: ApiClient;
  public readonly gram: GramClient;
  public readonly scenes: SceneManager;
  private readonly router: UpdateRouter;
  private polling?: PollingTransport;
  private webhook?: WebhookTransport;
  private readonly lazyModules: Array<() => Promise<{ default?: BotModule } | BotModule>> = [];
  private webhookConfig?: BotWebhookConfig;
  private debugEnabled: boolean;
  private initialized = false;

  /**
   * @param options.token - Required; other fields optional (polling, proxy, `mode`, …)
   */
  constructor(private readonly options: BotOptions) {
    addRedactionToken(options.token);
    this.api = new ApiClient(options.token, options.apiBaseUrl, {
      userAgent: options.userAgent,
      timeoutMs: options.timeoutMs,
      proxy: options.proxy,
    });
    this.gram = new GramClient(this.api);
    this.scenes = new SceneManager();
    this.router = new UpdateRouter(this.api, this.scenes, {
      mode: options.mode ?? "full",
    });
    this.debugEnabled = Boolean(options.debug);
    this.api.setDebug(this.debugEnabled);
  }

  register(controllerClass: Constructor) {
    this.router.registerController(controllerClass);
    return this;
  }
  scene(sceneClass: Constructor) {
    this.scenes.register(sceneClass);
    return this;
  }
  use(mw: MiddlewareFn<BaseContext>) {
    this.router.use(mw);
    return this;
  }
  command(name: string, handler: (gram: BaseContext) => Promise<void> | void) {
    this.router.registerSimpleHandler("command", name, handler);
    return this;
  }
  onText(handler: (gram: BaseContext) => Promise<void> | void) {
    this.router.registerSimpleHandler("on", "text", handler);
    return this;
  }
  onMessage(handler: (gram: BaseContext) => Promise<void> | void) {
    this.router.registerSimpleHandler("on", "message", handler);
    return this;
  }
  onCallback(pattern: string, handler: (gram: BaseContext) => Promise<void> | void) {
    this.router.registerSimpleHandler("callback_query", pattern, handler);
    return this;
  }
  onInline(handler: (gram: BaseContext) => Promise<void> | void) {
    this.router.registerSimpleHandler("inline_query", "*", handler);
    return this;
  }
  onInlineQuery(pattern: string, handler: (gram: BaseContext) => Promise<void> | void) {
    this.router.registerSimpleHandler("inline_query", pattern, handler);
    return this;
  }
  onShippingQuery(handler: (gram: BaseContext) => Promise<void> | void) {
    this.router.registerSimpleHandler("shipping_query", "*", handler);
    return this;
  }
  onPreCheckoutQuery(handler: (gram: BaseContext) => Promise<void> | void) {
    this.router.registerSimpleHandler("pre_checkout_query", "*", handler);
    return this;
  }
  onChatMember(handler: (gram: BaseContext) => Promise<void> | void) {
    this.router.registerSimpleHandler("chat_member", "*", handler);
    return this;
  }
  onMyChatMember(handler: (gram: BaseContext) => Promise<void> | void) {
    this.router.registerSimpleHandler("my_chat_member", "*", handler);
    return this;
  }
  onChatJoinRequest(handler: (gram: BaseContext) => Promise<void> | void) {
    this.router.registerSimpleHandler("chat_join_request", "*", handler);
    return this;
  }
  onMessageReaction(handler: (gram: BaseContext) => Promise<void> | void) {
    this.router.registerSimpleHandler("message_reaction", "*", handler);
    return this;
  }
  onMessageReactionCount(handler: (gram: BaseContext) => Promise<void> | void) {
    this.router.registerSimpleHandler("message_reaction_count", "*", handler);
    return this;
  }
  onBusinessConnection(handler: (gram: BaseContext) => Promise<void> | void) {
    this.router.registerSimpleHandler("business_connection", "*", handler);
    return this;
  }
  onBusinessMessage(handler: (gram: BaseContext) => Promise<void> | void) {
    this.router.registerSimpleHandler("business_message", "*", handler);
    return this;
  }
  onEditedBusinessMessage(handler: (gram: BaseContext) => Promise<void> | void) {
    this.router.registerSimpleHandler("edited_business_message", "*", handler);
    return this;
  }
  onDeletedBusinessMessages(handler: (gram: BaseContext) => Promise<void> | void) {
    this.router.registerSimpleHandler("deleted_business_messages", "*", handler);
    return this;
  }
  onFilter<T extends Update>(
    filter: (update: Update) => update is T,
    handler: (gram: BaseContext & { update: T }) => Promise<void> | void,
  ) {
    this.router.registerFilteredHandler(filter, async (gram) =>
      handler(gram as BaseContext & { update: T }),
    );
    return this;
  }
  module(register: BotModule) {
    register(this);
    return this;
  }
  lazyModule(loader: () => Promise<{ default?: BotModule } | BotModule>) {
    this.lazyModules.push(loader);
    return this;
  }
  configure(config: BotRuntimeConfig) {
    this.api.configureNetwork(config);
    if (typeof config.debug === "boolean") {
      this.debugEnabled = config.debug;
      this.api.setDebug(config.debug);
    }
    return this;
  }
  configureWebhook(config: BotWebhookConfig) {
    this.webhookConfig = config;
    return this;
  }

  async handleUpdate(update: Parameters<UpdateRouter["handleUpdate"]>[0]) {
    await this.processUpdate(update);
  }

  secretPathComponent() {
    // Deterministic secret path derived from token; avoids exposing plain token.
    return createHash("sha256").update(this.options.token).digest("hex").slice(0, 32);
  }

  /**
   * @param options - `transport`, webhook config, or defaults to polling
   * @throws {Error} Webhook transport when neither `options.webhook` nor `configureWebhook` was set
   */
  async launch(options?: LaunchOptions) {
    await this.initializeRuntime();

    const transport = options?.transport ?? "polling";
    if (transport === "webhook") {
      this.debug("transport", "launching webhook transport");
      const webhookConfig = options?.webhook ?? this.webhookConfig;
      if (!webhookConfig)
        throw new Error("Webhook launch requires webhook options or configureWebhook(...)");
      validateWebhookSecretToken(webhookConfig.secretToken);
      const resolvedPathRaw = webhookConfig.path ?? this.secretPathComponent();
      const resolvedPath = resolvedPathRaw.startsWith("/")
        ? resolvedPathRaw
        : `/${resolvedPathRaw}`;

      if (webhookConfig.domain) {
        const base =
          webhookConfig.domain.startsWith("http://") || webhookConfig.domain.startsWith("https://")
            ? webhookConfig.domain
            : `https://${webhookConfig.domain}`;
        const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
        await this.api.setWebhook({
          url: `${normalizedBase}${resolvedPath}`,
          ...(webhookConfig.secretToken ? { secret_token: webhookConfig.secretToken } : {}),
        });
      }

      this.webhook = new WebhookTransport(
        (update) => this.processUpdate(update),
        this.options.operations?.logWebhookRejects
          ? (kind, req) => {
              const pathOnly = (req.url ?? "").split("?")[0] ?? "";
              this.debug(
                "webhook",
                `rejected ${kind} mismatch method=${req.method ?? "unknown"} path=${pathOnly}`,
              );
            }
          : undefined,
        {
          maxBodyBytes: this.options.operations?.webhookMaxBodyBytes,
          allowedContentTypes: this.options.operations?.webhookAllowedContentTypes,
          onRuntimeError: (meta, error) => this.options.hooks?.onRuntimeError?.(meta, error),
        },
      );
      await this.webhook.start({
        ...webhookConfig,
        path: resolvedPath,
      });
      this.debug(
        "transport",
        `webhook listening on port=${webhookConfig.port} path=${resolvedPath}`,
      );
      return;
    }
    this.debug("transport", "launching polling transport");
    this.polling = new PollingTransport(this.api, (update) => this.processUpdate(update), {
      onPollingError: this.options.hooks?.onPollingError,
      onRuntimeError: this.options.hooks?.onRuntimeError,
      retryBaseMs: this.options.operations?.pollingRetryBaseMs,
      retryMaxMs: this.options.operations?.pollingRetryMaxMs,
      retryOn: this.options.operations?.pollingRetryOn
        ? new Set<HookErrorClass>(this.options.operations.pollingRetryOn)
        : undefined,
      onRetryLog:
        this.options.operations?.pollingRetryLogs === "quiet"
          ? undefined
          : (error, retryDelayMs) => {
              const reason = error instanceof Error ? error.message : String(error);
              this.debug(
                "polling",
                stringifyForLog({
                  event: "retry",
                  delayMs: retryDelayMs,
                  reason,
                }),
              );
            },
    });
    await this.polling.start({
      timeout: this.options.polling?.timeout,
      limit: this.options.polling?.limit,
      allowedUpdates: this.options.polling?.allowedUpdates,
    });
  }

  async createWebhook(options?: CreateWebhookOptions): Promise<CreateWebhookAdapter> {
    await this.initializeRuntime();
    const secretToken = options?.secretToken ?? this.webhookConfig?.secretToken;
    validateWebhookSecretToken(secretToken);

    const resolvedPathRaw = options?.path ?? this.webhookConfig?.path ?? this.secretPathComponent();
    const path = resolvedPathRaw.startsWith("/") ? resolvedPathRaw : `/${resolvedPathRaw}`;
    const domain = options?.domain ?? this.webhookConfig?.domain;

    const handler = createWebhookHandler({
      onUpdate: (update) => this.processUpdate(update),
      path,
      secretToken,
      onReject: this.options.operations?.logWebhookRejects
        ? (kind, req) => {
            const pathOnly = (req.url ?? "").split("?")[0] ?? "";
            this.debug(
              "webhook",
              `rejected ${kind} mismatch method=${req.method ?? "unknown"} path=${pathOnly}`,
            );
          }
        : undefined,
      maxBodyBytes: this.options.operations?.webhookMaxBodyBytes,
      allowedContentTypes: this.options.operations?.webhookAllowedContentTypes,
      onRuntimeError: (meta, error) => this.options.hooks?.onRuntimeError?.(meta, error),
    });

    const setWebhook = domain
      ? async () => {
          const base =
            domain.startsWith("http://") || domain.startsWith("https://")
              ? domain
              : `https://${domain}`;
          const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
          return this.api.setWebhook({
            url: `${normalizedBase}${path}`,
            ...(secretToken ? { secret_token: secretToken } : {}),
          });
        }
      : undefined;

    return { path, handler, setWebhook };
  }

  stop() {
    this.polling?.stop();
    this.webhook?.stop();
    this.debug("lifecycle", "bot stopped");
  }

  private async processUpdate(update: Update) {
    const startedAt = Date.now();
    const timeoutMs = this.options.operations?.handlerTimeoutMs;
    try {
      // Performance: Only perform expensive serialization and kind detection if debug is enabled.
      // This improves update throughput by ~10x (measured via 'npm run bench').
      if (this.debugEnabled) {
        this.debug(
          "update",
          `received id=${update.update_id} kind=${this.detectUpdateKind(update)}`,
        );
        const payload = stringifyForLog(this.sanitizeForLog(update));
        const maxPayloadChars = 48_000;
        const truncated =
          payload.length > maxPayloadChars
            ? `${payload.slice(0, maxPayloadChars)}\n… (truncated, ${String(payload.length)} chars)`
            : payload;
        this.debug("payload", `body:\n${truncated}`);
      }
      await this.runWithHandlerTimeout(update, timeoutMs);
      const durationMs = Date.now() - startedAt;
      if (this.debugEnabled) {
        this.debug("update", `handled id=${update.update_id} in ${durationMs}ms`);
      }
      this.options.hooks?.onUpdateProcessed?.(update, durationMs);
    } catch (error) {
      if (this.debugEnabled) {
        this.debug(
          "error",
          `update id=${update.update_id} failed: ${(error as Error)?.message ?? "unknown error"}`,
        );
      }
      const meta: HookErrorEnvelope = {
        source: "update",
        class: this.classifyUpdateError(error),
        retryable: false,
        message: error instanceof Error ? error.message : String(error),
        timestamp: Date.now(),
      };
      this.options.hooks?.onUpdateError?.(update, error, meta);
      this.options.hooks?.onRuntimeError?.(meta, error, update);
      // do not rethrow: let polling continue the batch and webhook return 200
    }
  }

  private async runWithHandlerTimeout(update: Update, timeoutMs?: number) {
    if (!timeoutMs || timeoutMs <= 0) {
      await this.router.handleUpdate(update);
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`handler timeout after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    try {
      await Promise.race([this.router.handleUpdate(update), timeoutPromise]);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }

  private detectUpdateKind(update: Update) {
    if (update.callback_query) return "callback_query";
    if (update.inline_query) return "inline_query";
    if (update.chosen_inline_result) return "chosen_inline_result";
    if (update.shipping_query) return "shipping_query";
    if (update.pre_checkout_query) return "pre_checkout_query";
    if (update.chat_member) return "chat_member";
    if (update.my_chat_member) return "my_chat_member";
    if (update.chat_join_request) return "chat_join_request";
    if (update.message_reaction) return "message_reaction";
    if (update.message_reaction_count) return "message_reaction_count";
    if (update.business_connection) return "business_connection";
    if (update.business_message) return "business_message";
    if (update.edited_business_message) return "edited_business_message";
    if (update.deleted_business_messages) return "deleted_business_messages";
    if (update.message) return "message";
    if (update.edited_message) return "edited_message";
    if (update.poll_answer) return "poll_answer";
    if (update.poll) return "poll";
    return "unknown";
  }

  private logConnected(me: User) {
    const username = me.username ? `@${me.username}` : me.first_name;
    log(
      "info",
      "lifecycle",
      `connected as ${highlightUsername(username)} (id=${highlightId(me.id)})`,
    );
  }

  private debug(scope: string, message: string) {
    if (!this.debugEnabled) return;
    log("debug", scope, message);
  }

  private sanitizeForLog(value: unknown): unknown {
    if (value === null || typeof value !== "object") return value;
    if (Array.isArray(value)) return value.map((item) => this.sanitizeForLog(item));
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (nested === undefined) continue;
      out[key] = this.sanitizeForLog(nested);
    }
    return out;
  }

  private classifyUpdateError(error: unknown): HookErrorClass {
    if (error instanceof Error && error.message.toLowerCase().includes("timeout")) return "timeout";
    return "unknown";
  }

  private async initializeRuntime() {
    if (this.initialized) return;
    const started = Date.now();
    let me: User;
    try {
      me = await this.api.getMe();
    } catch (error) {
      if (this.api.hasProxy()) {
        const ms = Date.now() - started;
        const message = error instanceof Error ? error.message : String(error);
        log(
          "warn",
          "proxy",
          formatProxyProbeMessage({ is_working: false, speedMs: ms, error: message }),
        );
      }
      throw error;
    }
    if (this.api.hasProxy()) {
      const ms = Date.now() - started;
      log("info", "proxy", formatProxyProbeMessage({ is_working: true, speedMs: ms }));
    }
    this.logConnected(me);

    if (this.lazyModules.length > 0) {
      for (const load of this.lazyModules) {
        const mod = await load();
        const register = (typeof mod === "function" ? mod : mod.default) as BotModule | undefined;
        if (register) {
          register(this);
        }
      }
    }
    this.initialized = true;
  }
}

export class Gramora extends Bot {
  constructor(options: BotOptions) {
    super(options);
  }
}
