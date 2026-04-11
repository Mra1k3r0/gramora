import { timingSafeEqual } from "node:crypto";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { ApiClient } from "./api-client";
import type { Update } from "../types/telegram";

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
  constructor(
    private readonly api: ApiClient,
    private readonly onUpdate: UpdateHandler,
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
      } catch {
        if (!this.running) {
          break;
        }
        await new Promise<void>((resolve) => setTimeout(resolve, retryDelayMs));
        retryDelayMs = Math.min(retryDelayMs * 2, maxRetryDelayMs);
      }
    }
  }

  stop() {
    this.running = false;
  }
}

export class WebhookTransport {
  private closeServer?: () => void;
  constructor(private readonly onUpdate: UpdateHandler) {}

  async start(options: { port: number; path?: string; secretToken?: string }) {
    const targetPath = options.path ?? "/webhook";
    const server = createServer((req: IncomingMessage, res: ServerResponse) => {
      const pathOnly = (req.url ?? "").split("?")[0] ?? "";
      if (req.method !== "POST" || pathOnly !== targetPath) {
        res.statusCode = 404;
        res.end("not found");
        return;
      }
      if (options.secretToken) {
        const incoming = headerSingleValue(req.headers["x-telegram-bot-api-secret-token"]);
        if (typeof incoming !== "string" || !timingSafeSecretEqual(incoming, options.secretToken)) {
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
      req.on("end", async () => {
        try {
          const update = JSON.parse(Buffer.concat(chunks).toString("utf8")) as Update;
          await this.onUpdate(update);
          res.statusCode = 200;
          res.end("ok");
        } catch {
          res.statusCode = 400;
          res.end("bad request");
        }
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
