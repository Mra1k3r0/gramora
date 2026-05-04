import { describe, it, expect } from "vitest";
import { stringifyForLog } from "../src/core/logger";

function stripAnsi(text: string): string {
  return text.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, "");
}

describe("Logger security enhancements", () => {
  it("prevents stack overflow and truncates deeply nested objects", () => {
    const deep: Record<string, unknown> = {};
    let current = deep;
    for (let i = 0; i < 50; i++) {
      const next = {};
      current.next = next;
      current = next;
    }

    const result = stripAnsi(stringifyForLog(deep));
    expect(result).toContain("[DEPTH_EXCEEDED]");
  });

  it("prevents stack overflow and truncates circular references", () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;

    const result = stripAnsi(stringifyForLog(circular));
    expect(result).toContain("[DEPTH_EXCEEDED]");
  });

  it("masks new sensitive keys and suffixes", () => {
    const sensitive = {
      proxy: "http://proxy.com",
      cookie: "session=123",
      db_pwd: "password123",
      api_key: "secret-key",
      user_pass: "my-pass",
    };

    const result = stripAnsi(stringifyForLog(sensitive));
    expect(result).toContain('"proxy": "[MASKED]"');
    expect(result).toContain('"cookie": "[MASKED]"');
    expect(result).toContain('"db_pwd": "[MASKED]"');
    expect(result).toContain('"api_key": "[MASKED]"');
    expect(result).toContain('"user_pass": "[MASKED]"');
  });
});
