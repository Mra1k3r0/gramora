import { createHash } from "node:crypto";
import { ApiClient } from "./api-client";
import { GramClient } from "./gram-client";
import {
  formatProxyProbeMessage,
  highlightId,
  highlightUsername,
  log,
  stringifyForLog,
} from "./logger";
import { PollingTransport, WebhookTransport } from "./polling";
import { UpdateRouter } from "./update-router";
import type { BaseContext } from "../context";
import type { MiddlewareFn } from "../middleware/types";
import { SceneManager } from "../scenes";
import type {
  BotModule,
  BotOptions,
  BotRuntimeConfig,
  BotWebhookConfig,
  Constructor,
  LaunchOptions,
} from "./types";
import type { Update, User } from "../types/telegram";

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

  constructor(private readonly options: BotOptions) {
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

  async launch(options?: LaunchOptions) {
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

    const transport = options?.transport ?? "polling";
    if (transport === "webhook") {
      this.debug("transport", "launching webhook transport");
      const webhookConfig = options?.webhook ?? this.webhookConfig;
      if (!webhookConfig)
        throw new Error("Webhook launch requires webhook options or configureWebhook(...)");
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

      this.webhook = new WebhookTransport((update) => this.processUpdate(update));
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
    this.polling = new PollingTransport(this.api, (update) => this.processUpdate(update));
    await this.polling.start({
      timeout: this.options.polling?.timeout,
      limit: this.options.polling?.limit,
      allowedUpdates: this.options.polling?.allowedUpdates,
    });
  }

  stop() {
    this.polling?.stop();
    this.webhook?.stop();
    this.debug("lifecycle", "bot stopped");
  }

  private async processUpdate(update: Update) {
    const startedAt = Date.now();
    try {
      this.debug("update", `received id=${update.update_id} kind=${this.detectUpdateKind(update)}`);
      const payload = stringifyForLog(this.sanitizeForLog(update));
      const maxPayloadChars = 48_000;
      const truncated =
        payload.length > maxPayloadChars
          ? `${payload.slice(0, maxPayloadChars)}\n… (truncated, ${String(payload.length)} chars)`
          : payload;
      this.debug("payload", `body:\n${truncated}`);
      await this.router.handleUpdate(update);
      this.debug("update", `handled id=${update.update_id} in ${Date.now() - startedAt}ms`);
    } catch (error) {
      this.debug(
        "error",
        `update id=${update.update_id} failed: ${(error as Error)?.message ?? "unknown error"}`,
      );
      throw error;
    }
  }

  private detectUpdateKind(update: Update) {
    if (update.callback_query) return "callback_query";
    if (update.inline_query) return "inline_query";
    if (update.chosen_inline_result) return "chosen_inline_result";
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
}

export class Gramora extends Bot {
  constructor(options: BotOptions) {
    super(options);
  }
}
