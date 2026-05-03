import { describe, it, expect } from "vitest";
import { stringifyForLog } from "../src/core/logger";

const stripAnsi = (text: string): string => {
  return text.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, "");
};

describe("Logger Enhancements", () => {
  it("should mask new sensitive keys", () => {
    const obj = {
      proxy: "http://user:pass@proxy.com",
      cookie: "session=123",
      credential: "secret-value",
    };
    const log = stripAnsi(stringifyForLog(obj));
    expect(log).toContain('"proxy": "[MASKED]"');
    expect(log).toContain('"cookie": "[MASKED]"');
    expect(log).toContain('"credential": "[MASKED]"');
  });

  it("should mask keys with common suffixes", () => {
    const obj = {
      api_key: "key123",
      db_pwd: "password123",
      admin_pass: "pass123",
    };
    const log = stripAnsi(stringifyForLog(obj));
    expect(log).toContain('"api_key": "[MASKED]"');
    expect(log).toContain('"db_pwd": "[MASKED]"');
    expect(log).toContain('"admin_pass": "[MASKED]"');
  });

  it("should truncate deep objects", () => {
    const root: Record<string, unknown> = {};
    let curr = root;
    for (let i = 0; i < 25; i++) {
      const next = {};
      curr.next = next;
      curr = next as Record<string, unknown>;
    }
    const log = stripAnsi(stringifyForLog(root));
    expect(log).toContain("[DEPTH_EXCEEDED]");
  });

  it("should include name and code in Error objects", () => {
    const err = new Error("test error") as Error & { code: string };
    err.code = "ECONNRESET";
    const log = stripAnsi(stringifyForLog(err));
    expect(log).toContain('"name": "Error"');
    expect(log).toContain('"code": "ECONNRESET"');
    expect(log).toContain('"message": "test error"');
  });

  it("should handle circular references via depth limit", () => {
    const a: Record<string, unknown> = { name: "circle" };
    a.self = a;
    const log = stripAnsi(stringifyForLog(a));
    expect(log).toContain("[DEPTH_EXCEEDED]");
  });
});
