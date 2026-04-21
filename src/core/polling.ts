import { timingSafeEqual } from "node:crypto";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { ApiClient } from "./api-client";
import type { BotHooks } from "./types";
import type { Update } from "../types/telegram";
import { RateLimitError } from "./errors";

type UpdateHandler = (update: Update) => Promise<void>;

function headerSingleValue(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

/** Compare webhook secret without early exit on first differing byte (length must match). */
function timingSafeSecretEqual(incoming: string, expected: string): boolean {
  const a = Buffer.from(incoming, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
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
    },
  ) {}

  async start(options?: { timeout?: number; limit?: number; allowedUpdates?: string[] }) {
    this.running = true;
    let retryDelayMs = 1000;
    const maxRetryDelayMs = 30000;

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

        // 429: use Telegram's retry_after instead of exponential backoff
        const delayMs = error instanceof RateLimitError ? error.retryAfter * 1000 : retryDelayMs;

        this.options?.onPollingError?.(error, delayMs);
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
  ) {}

  async start(options: { port: number; path?: string; secretToken?: string }) {
    const targetPath = options.path ?? "/webhook";
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
      const contentType = req.headers["content-type"];
      if (typeof contentType !== "string" || !contentType.includes("application/json")) {
        res.statusCode = 415;
        res.end("unsupported media type");
        return;
      }
      const chunks: Buffer[] = [];
      let totalSize = 0;
      const maxBodyBytes = 1_048_576;
      req.on("data", (chunk) => {
        chunks.push(Buffer.from(chunk));
        totalSize += Buffer.byteLength(chunk);
        if (totalSize > maxBodyBytes) {
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
