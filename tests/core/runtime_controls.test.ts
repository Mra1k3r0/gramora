import { afterEach, describe, expect, it, vi } from "vitest";
import { Gramora } from "../../src/core/bot";
import type { ApiClient } from "../../src/core/api/client";
import { PollingTransport, WebhookTransport } from "../../src/core/polling";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("runtime controls", () => {
  it("applies handler timeout and reports through update error hook", async () => {
    let timeoutError: unknown;
    const bot = new Gramora({
      token: "test-token",
      mode: "core",
      operations: { handlerTimeoutMs: 10 },
      hooks: {
        onUpdateError: (_update, error) => {
          timeoutError = error;
        },
      },
    });

    bot.onMessage(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    await bot.handleUpdate({
      update_id: 10,
      message: {
        message_id: 1,
        date: 1_700_000_100,
        chat: { id: 1, type: "private" },
        text: "slow",
      },
    });

    expect(timeoutError).toBeInstanceOf(Error);
    expect((timeoutError as Error).message).toContain("handler timeout");
  });

  it("emits structured polling retry log callback", async () => {
    let retries = 0;
    const transport = new PollingTransport(
      {
        async getUpdates() {
          throw new Error("network down");
        },
      } as unknown as ApiClient,
      async () => {},
      {
        onRetryLog: () => {
          retries += 1;
          transport.stop();
        },
      },
    );

    await transport.start({ timeout: 1 });
    expect(retries).toBe(1);
  });

  it("calls webhook reject callback for path mismatch", async () => {
    const port = 8800 + Math.floor(Math.random() * 500);
    let rejected = false;
    const transport = new WebhookTransport(
      async () => {},
      (kind) => {
        if (kind === "path") rejected = true;
      },
    );
    await transport.start({ port, path: "/expected" });

    const response = await fetch(`http://127.0.0.1:${String(port)}/wrong`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ update_id: 1 }),
    });

    transport.stop();
    expect(response.status).toBe(404);
    expect(rejected).toBe(true);
  });
});
