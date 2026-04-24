import { createHash, timingSafeEqual } from "node:crypto";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { ApiClient } from "./api-client";
import { TelegramApiError, RateLimitError, ValidationError } from "./errors";
import type { BotHooks } from "./types";
import type { Update } from "../types/telegram";
import type { HookErrorClass, HookErrorEnvelope } from "./types";

type UpdateHandler = (update: Update) => Promise<void>;

function headerSingleValue(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

/** Compare webhook secret without early exit on first differing byte; uses hashing to avoid length leaks. */
function timingSafeSecretEqual(incoming: string, expected: string): boolean {
  const hashA = createHash("sha256").update(incoming).digest();
  const hashB = createHash("sha256").update(expected).digest();
  return timingSafeEqual(hashA, hashB);
}

export function validateWebhookSecretToken(secretToken: string | undefined): void {
  if (secretToken !== undefined && (secretToken.length < 1 || secretToken.length > 256)) {
    throw new ValidationError("secretToken must be between 1 and 256 characters", "secretToken");
  }
}

export class PollingTransport {
  private running = false;
  private offset?: number;

  /**
   * @param api - API client for getUpdates
   * @param onUpdate - Called per update; must never throw (bot handles errors internally)
   * @param hooks - Optional polling-level hooks
   */
  constructor(
    private readonly api: ApiClient,
    private readonly onUpdate: UpdateHandler,
    private readonly options?: Pick<BotHooks, "onPollingError"> & {
      onRetryLog?: (error: unknown, retryDelayMs: number) => void;
      onRuntimeError?: (meta: HookErrorEnvelope, error: unknown, update?: Update) => void;
      retryBaseMs?: number;
      retryMaxMs?: number;
      retryOn?: Set<HookErrorClass>;
    },
  ) {}

  async start(options?: { timeout?: number; limit?: number; allowedUpdates?: string[] }) {
    this.running = true;
    let retryDelayMs = this.options?.retryBaseMs ?? 1000;
    const maxRetryDelayMs = this.options?.retryMaxMs ?? 30000;

    while (this.running) {
      try {
        const updates = await this.api.getUpdates({
          offset: this.offset,
          timeout: options?.timeout ?? 20,
          limit: options?.limit,
          allowed_updates: options?.allowedUpdates,
        });

        retryDelayMs = 1000;
        for (const update of updates) {
          this.offset = update.update_id + 1;
          await this.onUpdate(update);
        }
      } catch (error) {
        if (!this.running) break;

        const errorClass = classifyError(error);
        const retryOn =
          this.options?.retryOn ??
          new Set<HookErrorClass>(["rate_limit", "network", "api", "unknown"]);
        const retryable = retryOn.has(errorClass);
        const delayMs = retryable
          ? error instanceof RateLimitError
            ? error.retryAfter * 1000
            : retryDelayMs
          : 0;
        const meta: HookErrorEnvelope = {
          source: "polling",
          class: errorClass,
          retryable,
          message: error instanceof Error ? error.message : String(error),
          timestamp: Date.now(),
        };

        this.options?.onPollingError?.(error, delayMs, meta);
        this.options?.onRuntimeError?.(meta, error);
        if (!retryable) {
          throw error;
        }
        this.options?.onRetryLog?.(error, delayMs);
        await new Promise<void>((resolve) => setTimeout(resolve, delayMs));

        if (!(error instanceof RateLimitError)) {
          retryDelayMs = Math.min(retryDelayMs * 2, maxRetryDelayMs);
        }
      }
    }
  }

  stop() {
    this.running = false;
  }
}

export class WebhookTransport {
  private closeServer?: () => void;
  constructor(
    private readonly onUpdate: UpdateHandler,
    private readonly onReject?: (kind: "path" | "secret", req: IncomingMessage) => void,
    private readonly webhookOptions?: {
      maxBodyBytes?: number;
      allowedContentTypes?: string[];
      onRuntimeError?: (meta: HookErrorEnvelope, error: unknown, update?: Update) => void;
    },
  ) {}

  async start(options: { port: number; path?: string; secretToken?: string }) {
    validateWebhookSecretToken(options.secretToken);
    const targetPath = options.path ?? "/webhook";
    const maxBodyBytes = this.webhookOptions?.maxBodyBytes ?? 1_048_576;
    const allowedContentTypes = this.webhookOptions?.allowedContentTypes ?? ["application/json"];
    const server = createServer((req: IncomingMessage, res: ServerResponse) => {
      const pathOnly = (req.url ?? "").split("?")[0] ?? "";
      if (req.method !== "POST" || pathOnly !== targetPath) {
        this.onReject?.("path", req);
        res.statusCode = 404;
        res.end("not found");
        return;
      }
      if (options.secretToken) {
        const incoming = headerSingleValue(req.headers["x-telegram-bot-api-secret-token"]);
        if (typeof incoming !== "string" || !timingSafeSecretEqual(incoming, options.secretToken)) {
          this.onReject?.("secret", req);
          res.statusCode = 401;
          res.end("unauthorized");
          return;
        }
      }
      const contentType = headerSingleValue(req.headers["content-type"]);
      const isAllowedType =
        typeof contentType === "string" &&
        allowedContentTypes.some((type) => contentType.toLowerCase().includes(type.toLowerCase()));
      if (!isAllowedType) {
        this.webhookOptions?.onRuntimeError?.(
          {
            source: "webhook",
            class: "validation",
            retryable: false,
            message: "unsupported media type",
            timestamp: Date.now(),
          },
          new Error("unsupported media type"),
        );
        res.statusCode = 415;
        res.end("unsupported media type");
        return;
      }
      const chunks: Buffer[] = [];
      let totalSize = 0;
      const contentLengthRaw = headerSingleValue(req.headers["content-length"]);
      const contentLength = contentLengthRaw ? Number(contentLengthRaw) : undefined;
      if (
        typeof contentLength === "number" &&
        Number.isFinite(contentLength) &&
        contentLength > maxBodyBytes
      ) {
        this.webhookOptions?.onRuntimeError?.(
          {
            source: "webhook",
            class: "validation",
            retryable: false,
            message: "payload too large",
            timestamp: Date.now(),
          },
          new Error("payload too large"),
        );
        res.statusCode = 413;
        res.end("payload too large");
        return;
      }
      req.on("data", (chunk) => {
        chunks.push(Buffer.from(chunk));
        totalSize += Buffer.byteLength(chunk);
        if (totalSize > maxBodyBytes) {
          this.webhookOptions?.onRuntimeError?.(
            {
              source: "webhook",
              class: "validation",
              retryable: false,
              message: "payload too large",
              timestamp: Date.now(),
            },
            new Error("payload too large"),
          );
          res.statusCode = 413;
          res.end("payload too large");
          req.destroy();
        }
      });
      req.on("end", () => {
        let update: Update;
        try {
          update = JSON.parse(Buffer.concat(chunks).toString("utf8")) as Update;
        } catch {
          this.webhookOptions?.onRuntimeError?.(
            {
              source: "webhook",
              class: "validation",
              retryable: false,
              message: "bad request",
              timestamp: Date.now(),
            },
            new Error("bad request"),
          );
          res.statusCode = 400;
          res.end("bad request");
          return;
        }
        // acknowledge immediately so Telegram does not retry on handler errors
        res.statusCode = 200;
        res.end("ok");
        // onUpdate is processUpdate which handles errors internally and never throws
        void this.onUpdate(update);
      });
    });

    await new Promise<void>((resolve) => {
      server.listen(options.port, resolve);
    });
    this.closeServer = () => server.close();
  }

  stop() {
    this.closeServer?.();
  }
}

function classifyError(error: unknown): HookErrorClass {
  if (error instanceof RateLimitError) return "rate_limit";
  if (error instanceof TelegramApiError) return "api";
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("network") || msg.includes("fetch") || msg.includes("socket"))
      return "network";
  }
  return "unknown";
}
