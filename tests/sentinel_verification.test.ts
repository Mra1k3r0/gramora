import { describe, expect, it, vi, afterEach } from "vitest";
import { Gramora } from "../src/core/bot";
import { WebhookTransport } from "../src/core/polling";
import { stringifyForLog, clearRedactionTokensForTests } from "../src/core/logger";

afterEach(() => {
  vi.restoreAllMocks();
  clearRedactionTokensForTests();
});

describe("Sentinel Security Enhancements", () => {
  it("webhook responses include security headers", async () => {
    const port = 9900 + Math.floor(Math.random() * 99);
    const transport = new WebhookTransport(async () => {});
    await transport.start({ port, path: "/webhook" });

    try {
      const response = await fetch(`http://127.0.0.1:${String(port)}/webhook`, {
        method: "POST",
        body: JSON.stringify({ update_id: 1 }),
        headers: { "content-type": "application/json" },
      });

      expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
      expect(response.headers.get("X-Frame-Options")).toBe("DENY");
    } finally {
      transport.stop();
    }
  });

  it("masks PII keys in logs", () => {
    const obj = {
      email: "test@example.com",
      phone: "+1234567890",
      phonenumber: "+0987654321",
      cardnumber: "1111-2222-3333-4444",
      cvv: "123",
      sessionid: "sess-123",
    };

    const result = stringifyForLog(obj);
    expect(result).not.toContain("test@example.com");
    expect(result).not.toContain("+1234567890");
    expect(result).not.toContain("1111-2222-3333-4444");
    expect(result).toContain("[MASKED]");
  });

  it("enforces depth limit in logger prettyObject", () => {
    const deep: Record<string, unknown> = {};
    let curr = deep;
    for (let i = 0; i < 25; i++) {
      const next = {};
      curr.next = next;
      curr = next;
    }

    const result = stringifyForLog(deep);
    expect(result).toContain("[DEPTH_EXCEEDED]");
  });

  it("enforces depth limit in bot sanitizeForLog", async () => {
    const bot = new Gramora({ token: "test", debug: true });
    // access private method for testing
    const sanitize = (
      bot as unknown as { sanitizeForLog: (v: unknown) => unknown }
    ).sanitizeForLog.bind(bot);

    const deep: Record<string, unknown> = {};
    let curr = deep;
    for (let i = 0; i < 25; i++) {
      const next = {};
      curr.next = next;
      curr = next;
    }

    const result = sanitize(deep) as Record<string, unknown>;
    // find the [DEPTH_EXCEEDED] marker at depth 20
    let depth = 0;
    let node = result;
    while (node && typeof node === "object" && node.next) {
      node = node.next;
      depth++;
    }
    expect(node).toBe("[DEPTH_EXCEEDED]");
    expect(depth).toBe(20);
  });
});
