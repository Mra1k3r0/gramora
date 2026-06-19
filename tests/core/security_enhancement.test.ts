import { describe, expect, it, vi, afterEach } from "vitest";
import { Gramora } from "../src/core/bot";
import { clearRedactionTokensForTests, log, stringifyForLog } from "../src/core/logger";
import type { User } from "../src/types/telegram";

afterEach(() => {
  vi.restoreAllMocks();
  clearRedactionTokensForTests();
});

describe("Security Enhancements Verification", () => {
  it("should redact webhook paths automatically when createWebhook is called", async () => {
    const bot = new Gramora({ token: "12345:secret" });
    vi.spyOn(bot.api, "getMe").mockResolvedValue({
      id: 1,
      is_bot: true,
      first_name: "bot",
    } as unknown as User);

    const webhook = await bot.createWebhook();
    const secretPath = webhook.path;

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    log("info", "test", `Listening on ${secretPath}`);

    expect(consoleSpy).toHaveBeenCalled();
    const lastCall = consoleSpy.mock.calls[0][0];
    expect(lastCall).not.toContain(secretPath);
    expect(lastCall).toContain("[REDACTED]");
  });

  it("should mask newly added sensitive keys", () => {
    const obj = {
      email: "user@example.com",
      phone: "+123456789",
      phonenumber: "+987654321",
      cardnumber: "1111222233334444",
      cvv: "123",
    };

    const result = stringifyForLog(obj);

    // If these are not masked, these expectations will fail (once I add them to the test)
    expect(result).not.toContain("user@example.com");
    expect(result).not.toContain("+123456789");
    expect(result).not.toContain("1111222233334444");
    expect(result).toContain("[MASKED]");
  });

  it("should include security headers in webhook responses", async () => {
    const bot = new Gramora({ token: "12345:secret" });
    vi.spyOn(bot.api, "getMe").mockResolvedValue({
      id: 1,
      is_bot: true,
      first_name: "bot",
    } as unknown as User);

    const webhook = await bot.createWebhook({ path: "/hook", secretToken: "token" });
    const port = 9900 + Math.floor(Math.random() * 100);
    const { createServer } = await import("node:http");
    const server = createServer(webhook.handler);
    await new Promise<void>((resolve) => server.listen(port, resolve));

    try {
      const response = await fetch(`http://127.0.0.1:${String(port)}/hook`, {
        method: "POST",
        headers: { "x-telegram-bot-api-secret-token": "token", "content-type": "application/json" },
        body: JSON.stringify({ update_id: 1 }),
      });

      expect(response.headers.get("x-content-type-options")).toBe("nosniff");
      expect(response.headers.get("x-frame-options")).toBe("DENY");
    } finally {
      server.close();
    }
  });
});
