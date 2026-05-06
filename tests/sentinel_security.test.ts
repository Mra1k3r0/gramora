import { describe, it, expect, vi, afterEach } from "vitest";
import { stringifyForLog, clearRedactionTokensForTests, log } from "../src/core/logger";
import { Gramora } from "../src/core/bot";
import { timingSafeSecretEqual } from "../src/core/polling";

const stripAnsi = (text: string): string => {
  return text.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, "");
};

describe("Sentinel Security Enhancements", () => {
  afterEach(() => {
    clearRedactionTokensForTests();
    vi.restoreAllMocks();
  });

  it("should mask new PII keys in logger", () => {
    const obj = {
      email: "test@example.com",
      phone: "123456789",
      cardnumber: "1111-2222-3333-4444",
      cvv: "123",
    };
    const result = stripAnsi(stringifyForLog(obj));
    expect(result).toContain('"email": "[MASKED]"');
    expect(result).toContain('"phone": "[MASKED]"');
    expect(result).toContain('"cardnumber": "[MASKED]"');
    expect(result).toContain('"cvv": "[MASKED]"');
  });

  it("should redact webhook secret path in logs", async () => {
    const bot = new Gramora({
      token: "123456789:ABCdefGHIjklMNOpqrsTUVwxyz",
      mode: "core",
    });
    vi.spyOn(bot.api, "getMe").mockResolvedValue({
      id: 1,
      is_bot: true,
      first_name: "bot",
      username: "bot_user",
    });

    const secretPath = bot.secretPathComponent();

    // createWebhook should register the secretPath for redaction
    await bot.createWebhook({
      domain: "example.com",
    });

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    log("info", "test", `Path is ${secretPath}`);

    expect(consoleSpy).toHaveBeenCalled();
    const lastCallDefault = consoleSpy.mock.calls[0][0];
    expect(lastCallDefault).not.toContain(secretPath);
    expect(lastCallDefault).toContain("[REDACTED]");

    // Custom path redaction
    const customPath = "my-custom-webhook-path";
    await bot.createWebhook({
      path: customPath,
    });
    log("info", "test", `Custom path is ${customPath}`);
    const lastCallCustom = consoleSpy.mock.calls[1][0];
    expect(lastCallCustom).not.toContain(customPath);
    expect(lastCallCustom).toContain("[REDACTED]");
  });

  it("timingSafeSecretEqual should correctly compare strings", () => {
    expect(timingSafeSecretEqual("abc", "abc")).toBe(true);
    expect(timingSafeSecretEqual("abc", "def")).toBe(false);
    expect(timingSafeSecretEqual("abc", "abcd")).toBe(false);
  });

  it("should enforce depth limit in sanitizeForLog (Bot)", () => {
    const bot = new Gramora({
      token: "123456789:ABCdefGHIjklMNOpqrsTUVwxyz",
      mode: "core",
    });

    const deepObj: Record<string, unknown> = {};
    let current = deepObj;
    for (let i = 0; i < 25; i++) {
      const next = {};
      current.child = next;
      current = next as Record<string, unknown>;
    }

    const sanitized = (
      bot as unknown as { sanitizeForLog: (v: unknown) => unknown }
    ).sanitizeForLog(deepObj) as Record<string, unknown>;

    let depth = 0;
    let node = sanitized;
    while (node && node.child && node.child !== "[DEPTH_EXCEEDED]") {
      node = node.child as Record<string, unknown>;
      depth++;
    }
    expect(node.child).toBe("[DEPTH_EXCEEDED]");
    expect(depth).toBe(20);
  });
});
