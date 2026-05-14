import { describe, it, expect, vi, afterEach } from "vitest";
import { createWebhookHandler } from "../src/core/polling";
import { stringifyForLog, clearRedactionTokensForTests } from "../src/core/logger";
import { Gramora } from "../src/core/bot";

const stripAnsi = (text: string): string => {
  return text.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, "");
};

describe("Sentinel Security Verifications", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    clearRedactionTokensForTests();
  });

  it("should include security headers in webhook responses", async () => {
    const handler = createWebhookHandler({
      onUpdate: async () => {},
      path: "/hook",
    });

    const req = {
      method: "GET",
      url: "/wrong",
      on: vi.fn(),
    } as unknown as Record<string, unknown>;
    const res = {
      statusCode: 0,
      headers: {} as Record<string, string>,
      setHeader(name: string, value: string) {
        this.headers[name] = value;
      },
      end: vi.fn(),
    } as unknown as Record<string, unknown>;

    handler(req, res);

    expect(res.headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(res.headers["X-Frame-Options"]).toBe("DENY");
  });

  it("should mask new sensitive keys", () => {
    const obj = {
      email: "user@example.com",
      phone: "123456789",
      phonenumber: "987654321",
      cardnumber: "1111222233334444",
      cvv: "123",
    };
    const log = stripAnsi(stringifyForLog(obj));
    expect(log).toContain('"email": "[MASKED]"');
    expect(log).toContain('"phone": "[MASKED]"');
    expect(log).toContain('"phonenumber": "[MASKED]"');
    expect(log).toContain('"cardnumber": "[MASKED]"');
    expect(log).toContain('"cvv": "[MASKED]"');
  });

  it("should limit recursion depth in sanitizeForLog", async () => {
    const bot = new Gramora({ token: "123:ABC", mode: "core" });
    const deepObj: Record<string, unknown> = {};
    let curr = deepObj;
    for (let i = 0; i < 25; i++) {
      curr.next = {};
      curr = curr.next as Record<string, unknown>;
    }

    const sanitized = (
      bot as unknown as { sanitizeForLog: (v: unknown) => Record<string, unknown> }
    ).sanitizeForLog(deepObj);

    // Find the 20th level
    let check: unknown = sanitized;
    for (let i = 0; i < 20; i++) {
      check = (check as Record<string, unknown>).next;
    }
    expect(check).toBe("[DEPTH_EXCEEDED]");
  });

  it("should redact webhook paths in logs", async () => {
    const bot = new Gramora({ token: "123:ABC", mode: "core" });
    vi.spyOn(bot.api, "getMe").mockResolvedValue({
      id: 1,
      is_bot: true,
      first_name: "bot",
      username: "bot_user",
    });

    const customPath = "my-very-long-secret-webhook-path";
    await bot.createWebhook({ path: customPath });

    const logMsg = `Path is ${customPath}`;
    const result = stripAnsi(stringifyForLog(logMsg));
    expect(result).toContain("[REDACTED]");
    expect(result).not.toContain(customPath);
  });
});
