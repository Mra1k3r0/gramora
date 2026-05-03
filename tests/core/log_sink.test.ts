import { afterEach, describe, expect, it, vi } from "vitest";
import { Gramora } from "../../src/core/bot";
import {
  addRedactionToken,
  clearLogSinkForTests,
  clearRedactionTokensForTests,
  log,
  setGramoraLogSink,
  stringifyForLog,
} from "../../src/core/logger";

const dummyToken = "123456789:ABCDEFGHIJKLMNOPQRSTUVWXYZabcd";

afterEach(() => {
  vi.restoreAllMocks();
  clearRedactionTokensForTests();
  clearLogSinkForTests();
});

describe("logSink", () => {
  it("invokes sink with redacted plain message and skips console for info", () => {
    const sink = vi.fn();
    setGramoraLogSink(sink);
    const spyLog = vi.spyOn(console, "log").mockImplementation(() => {});
    const secret = "super-secret-token";
    addRedactionToken(secret);
    log("info", "scope.test", `hello ${secret}`);
    expect(sink).toHaveBeenCalledWith("info", "scope.test", "hello [REDACTED]");
    expect(spyLog).not.toHaveBeenCalled();
  });

  it("routes warn and error to sink without console", () => {
    const sink = vi.fn();
    setGramoraLogSink(sink);
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    log("warn", "w", "x");
    log("error", "e", "y");
    expect(sink).toHaveBeenNthCalledWith(1, "warn", "w", "x");
    expect(sink).toHaveBeenNthCalledWith(2, "error", "e", "y");
    expect(console.warn).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });

  it("strips ANSI from sink payload", () => {
    const sink = vi.fn();
    setGramoraLogSink(sink);
    log("debug", "api", stringifyForLog({ ok: true }));
    const [, , msg] = sink.mock.calls[0];
    expect(msg).not.toContain("\x1b");
  });

  it("Gramora constructor registers logSink", () => {
    const sink = vi.fn();
    new Gramora({ token: dummyToken, logSink: sink });
    log("info", "x", "plain");
    expect(sink).toHaveBeenCalledWith("info", "x", "plain");
  });

  it("configure replaces or clears logSink", () => {
    const first = vi.fn();
    const second = vi.fn();
    const bot = new Gramora({ token: dummyToken, logSink: first });
    log("info", "a", "m1");
    expect(first).toHaveBeenCalledTimes(1);

    bot.configure({ logSink: second });
    log("info", "b", "m2");
    expect(second).toHaveBeenCalledWith("info", "b", "m2");

    const spyLog = vi.spyOn(console, "log").mockImplementation(() => {});
    bot.configure({ logSink: undefined });
    log("info", "c", "m3");
    expect(spyLog).toHaveBeenCalled();
    expect(spyLog.mock.calls[0][0]).toContain("m3");
  });
});
