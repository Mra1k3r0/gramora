import { describe, it, expect, vi } from "vitest";
import { addRedactionToken, stringifyForLog, log } from "./core/logger";

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

    consoleSpy.mockRestore();
  });
});
