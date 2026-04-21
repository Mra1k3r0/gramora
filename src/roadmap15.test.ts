import { afterEach, describe, expect, it, vi } from "vitest";
import { Gramora } from "./core/bot";
import type { ApiClient } from "./core/api-client";
import { PollingTransport, WebhookTransport } from "./core/polling";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("roadmap #15", () => {
  it("emits structured update error envelope to hooks", async () => {
    let metaClass: string | undefined;
    let metaSource: string | undefined;
    const bot = new Gramora({
      token: "test-token",
      mode: "core",
      operations: { handlerTimeoutMs: 5 },
      hooks: {
        onUpdateError: (_update, _error, meta) => {
          metaClass = meta.class;
          metaSource = meta.source;
        },
      },
    });

    bot.onMessage(async () => {
      await new Promise((resolve) => setTimeout(resolve, 25));
    });

    await bot.handleUpdate({
      update_id: 99,
      message: {
        message_id: 1,
        date: 1_700_000_500,
        chat: { id: 1, type: "private" },
        text: "slow",
      },
    });

    expect(metaSource).toBe("update");
    expect(metaClass).toBe("timeout");
  });

  it("supports polling retry class filter and stops on non-retryable error", async () => {
    const transport = new PollingTransport(
      {
        async getUpdates() {
          throw new Error("network down");
        },
      } as unknown as ApiClient,
      async () => {},
      {
        retryOn: new Set(["rate_limit"]),
      },
    );

    await expect(transport.start({ timeout: 1 })).rejects.toThrow("network down");
  });

  it("applies webhook content type and body-size validation defaults", async () => {
    const port = 9300 + Math.floor(Math.random() * 500);
    const transport = new WebhookTransport(async () => {}, undefined, {
      maxBodyBytes: 16,
      allowedContentTypes: ["application/json"],
    });
    await transport.start({ port, path: "/webhook" });

    const unsupported = await fetch(`http://127.0.0.1:${String(port)}/webhook`, {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: "hello",
    });

    const tooLarge = await fetch(`http://127.0.0.1:${String(port)}/webhook`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ payload: "this body is definitely over sixteen bytes" }),
    });

    transport.stop();
    expect(unsupported.status).toBe(415);
    expect(tooLarge.status).toBe(413);
  });
});
