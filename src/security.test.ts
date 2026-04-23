import { afterEach, describe, expect, it, vi } from "vitest";
import { WebhookTransport } from "./core/polling";
import { ValidationError } from "./core/errors";
import {
  addRedactionToken,
  clearRedactionTokensForTests,
  stringifyForLog,
  log,
} from "./core/logger";

afterEach(() => {
  vi.restoreAllMocks();
  clearRedactionTokensForTests();
});

describe("Security Log Redaction", () => {
  it("should redact registered tokens in stringifyForLog", () => {
    const token = "123456789:ABCdefGHIjklMNOpqrsTUVwxyz";
    addRedactionToken(token);

    const message = `Error connecting to https://api.telegram.org/bot${token}/getMe`;
    const result = stringifyForLog(message);

    expect(result).not.toContain(token);
    expect(result).toContain("[REDACTED]");
  });

  it("should mask sensitive keys in objects", () => {
    const obj = {
      token: "secret-token",
      password: "my-password",
      provider_token: "p-token",
      normal_field: "public",
    };

    const result = stringifyForLog(obj);

    expect(result).not.toContain("secret-token");
    expect(result).not.toContain("my-password");
    expect(result).not.toContain("p-token");
    expect(result).toContain("[MASKED]");
    expect(result).toContain("public");
  });

  it("should redact tokens in console logs", () => {
    const token = "my-super-secret-token";
    addRedactionToken(token);

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    log("info", "test", `Exposing ${token}`);

    expect(consoleSpy).toHaveBeenCalled();
    const lastCall = consoleSpy.mock.calls[0][0];
    expect(lastCall).not.toContain(token);
    expect(lastCall).toContain("[REDACTED]");
  });

  it("authorizes webhook requests with matching secret token", async () => {
    const port = 9500 + Math.floor(Math.random() * 500);
    const transport = new WebhookTransport(async () => {});
    await transport.start({ port, path: "/webhook", secretToken: "expected-secret-token" });

    try {
      const response = await fetch(`http://127.0.0.1:${String(port)}/webhook`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-telegram-bot-api-secret-token": "expected-secret-token",
        },
        body: JSON.stringify({ update_id: 1 }),
      });

      expect(response.status).toBe(200);
    } finally {
      transport.stop();
    }
  });

  it("rejects webhook requests with mismatched secret token lengths", async () => {
    const port = 9600 + Math.floor(Math.random() * 500);
    const transport = new WebhookTransport(async () => {});
    await transport.start({ port, path: "/webhook", secretToken: "very-long-expected-secret" });

    try {
      const shortMismatch = await fetch(`http://127.0.0.1:${String(port)}/webhook`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-telegram-bot-api-secret-token": "x",
        },
        body: JSON.stringify({ update_id: 2 }),
      });
      expect(shortMismatch.status).toBe(401);

      const longMismatch = await fetch(`http://127.0.0.1:${String(port)}/webhook`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-telegram-bot-api-secret-token": "another-long-but-wrong-secret-token",
        },
        body: JSON.stringify({ update_id: 3 }),
      });
      expect(longMismatch.status).toBe(401);
    } finally {
      transport.stop();
    }
  });

  it("throws ValidationError for invalid secret token lengths", async () => {
    const transport = new WebhookTransport(async () => {});

    // Empty token
    await expect(transport.start({ port: 9700, secretToken: "" })).rejects.toThrow(ValidationError);

    // Too long token (> 256 chars)
    const longToken = "a".repeat(257);
    await expect(transport.start({ port: 9701, secretToken: longToken })).rejects.toThrow(
      ValidationError,
    );
  });
});
