import { afterEach, describe, expect, it, vi } from "vitest";
import { createServer } from "node:http";
import { Gramora } from "../../src/core/bot";
import { WebhookTransport } from "../../src/core/polling";
import { ValidationError } from "../../src/core/errors";
import {
  addRedactionToken,
  clearRedactionTokensForTests,
  stringifyForLog,
  log,
} from "../../src/core/logger";

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
      secret_token: "s-token",
      secretToken: "camel-s-token",
      providerToken: "camel-p-token",
      normal_field: "public",
    };

    const result = stringifyForLog(obj);

    expect(result).not.toContain("secret-token");
    expect(result).not.toContain("my-password");
    expect(result).not.toContain("p-token");
    expect(result).not.toContain("s-token");
    expect(result).not.toContain("camel-s-token");
    expect(result).not.toContain("camel-p-token");
    expect(result).toContain("[MASKED]");
    expect(result).toContain("public");
  });

  it("should mask apiKey keys in objects", () => {
    const obj = {
      apiKey: "secret-api-key",
      api_key: "snake-api-key",
      apikey: "simple-api-key",
    };

    const result = stringifyForLog(obj);

    expect(result).not.toContain("secret-api-key");
    expect(result).not.toContain("snake-api-key");
    expect(result).not.toContain("simple-api-key");
    expect(result).toContain("[MASKED]");
  });

  it("should mask other common sensitive keys and suffixes", () => {
    const obj = {
      access_token: "access-token-val",
      auth_token: "auth-token-val",
      session_id: "session-id-val",
      certificate: "cert-val",
      passphrase: "passphrase-val",
      mySecret: "my-secret-val",
      userPassword: "user-password-val",
      customToken: "custom-token-val",
      appPassphrase: "app-passphrase-val",
    };

    const result = stringifyForLog(obj);

    expect(result).not.toContain("access-token-val");
    expect(result).not.toContain("auth-token-val");
    expect(result).not.toContain("session-id-val");
    expect(result).not.toContain("cert-val");
    expect(result).not.toContain("passphrase-val");
    expect(result).not.toContain("my-secret-val");
    expect(result).not.toContain("user-password-val");
    expect(result).not.toContain("custom-token-val");
    expect(result).not.toContain("app-passphrase-val");
    expect(result).toContain("[MASKED]");
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

  it("throws ValidationError for invalid secret token characters", async () => {
    const transport = new WebhookTransport(async () => {});

    // Invalid character (symbol)
    await expect(transport.start({ port: 9702, secretToken: "invalid!token" })).rejects.toThrow(
      ValidationError,
    );

    // Invalid character (space)
    await expect(transport.start({ port: 9703, secretToken: "invalid token" })).rejects.toThrow(
      ValidationError,
    );
  });

  it("fails fast before webhook side effects when secret token is invalid", async () => {
    const bot = new Gramora({
      token: "123456789:ABCdefGHIjklMNOpqrsTUVwxyz",
      mode: "core",
    });
    const getMeSpy = vi.spyOn(bot.api, "getMe").mockResolvedValue({
      id: 1,
      is_bot: true,
      first_name: "bot",
      username: "bot_user",
    });
    const setWebhookSpy = vi.spyOn(bot.api, "setWebhook").mockResolvedValue(true);

    await expect(
      bot.launch({
        transport: "webhook",
        webhook: {
          port: 9800,
          domain: "https://example.com",
          secretToken: "x".repeat(257),
        },
      }),
    ).rejects.toThrow(ValidationError);

    expect(getMeSpy).toHaveBeenCalledTimes(1);
    expect(setWebhookSpy).not.toHaveBeenCalled();
  });

  it("createWebhook returns adapter with deferred setWebhook call", async () => {
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
    const setWebhookSpy = vi.spyOn(bot.api, "setWebhook").mockResolvedValue(true);

    const webhook = await bot.createWebhook({
      domain: "example.com",
      path: "/incoming",
      secretToken: "expected_secret",
    });

    expect(webhook.path).toBe("/incoming");
    expect(webhook.setWebhook).toBeTypeOf("function");
    expect(setWebhookSpy).not.toHaveBeenCalled();

    await webhook.setWebhook?.();
    expect(setWebhookSpy).toHaveBeenCalledWith({
      url: "https://example.com/incoming",
      secret_token: "expected_secret",
    });
  });

  it("createWebhook adapter handles updates on existing http server", async () => {
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

    let seenMessage = false;
    bot.onMessage(() => {
      seenMessage = true;
    });

    const webhook = await bot.createWebhook({
      path: "/hook",
      secretToken: "hook_secret",
    });
    const port = 9850 + Math.floor(Math.random() * 300);
    const server = createServer(webhook.handler);
    await new Promise<void>((resolve) => server.listen(port, resolve));

    try {
      const response = await fetch(`http://127.0.0.1:${String(port)}/hook`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-telegram-bot-api-secret-token": "hook_secret",
        },
        body: JSON.stringify({
          update_id: 500,
          message: {
            message_id: 1,
            date: 1_700_000_001,
            chat: { id: 1, type: "private" },
            text: "ping",
          },
        }),
      });
      expect(response.status).toBe(200);
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
      expect(seenMessage).toBe(true);
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
  });
});
