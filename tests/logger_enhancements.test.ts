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

    const innocent = {
      monkey: "banana",
      compass: "north",
    };
    const innocentLog = stripAnsi(stringifyForLog(innocent));
    expect(innocentLog).toContain('"monkey": "banana"');
    expect(innocentLog).toContain('"compass": "north"');
  });

  it("should truncate deep objects (hits MAX_LOG_DEPTH limit)", () => {
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

  it("should handle circular references (hits MAX_LOG_DEPTH limit)", () => {
    const a: Record<string, unknown> = { name: "circle" };
    a.self = a;
    const log = stripAnsi(stringifyForLog(a));
    expect(log).toContain("[DEPTH_EXCEEDED]");
  });

  it("should keep undefined in plain objects but filter in Errors", () => {
    const obj = { some_val: undefined };
    const log = stripAnsi(stringifyForLog(obj));
    expect(log).toContain('"some_val": undefined');

    const err = new Error("test") as Error & { extra?: string };
    err.extra = undefined;
    const errLog = stripAnsi(stringifyForLog(err));
    expect(errLog).not.toContain('"extra":');
  });

  it("should return {} for objects that become empty after filtering", () => {
    // Only happens if all keys are filtered out (like undefined in Errors)
    const err = new Error("test") as Record<string, unknown>;
    const keys = Object.getOwnPropertyNames(err);
    for (const k of keys) err[k] = undefined;
    // name and code are explicitly added in logger for Errors, so we need to clear them too if we want empty
    err.name = undefined;
    err.code = undefined;

    const log = stripAnsi(stringifyForLog(err));
    expect(log).toBe("{}");
  });
});
