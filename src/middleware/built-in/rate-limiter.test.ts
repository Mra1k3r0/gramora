import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { rateLimiter, MAX_STATE_SIZE } from "./rate-limiter";
import type { BaseContext } from "../../context";

describe("rateLimiter middleware", () => {
  let ctx: BaseContext;
  let next: () => Promise<void>;

  beforeEach(() => {
    ctx = {
      fromId: 1,
      chatId: 1,
      reply: vi.fn().mockResolvedValue(undefined),
    } as unknown as BaseContext;
    next = vi.fn().mockResolvedValue(undefined);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should allow requests under the limit", async () => {
    const mw = rateLimiter({ maxPerWindow: 2, windowMs: 1000 });
    await mw(ctx, next);
    await mw(ctx, next);
    expect(next).toHaveBeenCalledTimes(2);
    expect(ctx.reply).not.toHaveBeenCalled();
  });

  it("should block requests over the limit", async () => {
    const mw = rateLimiter({ maxPerWindow: 2, windowMs: 1000 });
    await mw(ctx, next);
    await mw(ctx, next);
    await mw(ctx, next);
    expect(next).toHaveBeenCalledTimes(2);
    expect(ctx.reply).toHaveBeenCalledWith("Rate limit exceeded. Try again later.");
  });

  it("should reset after the window passes", async () => {
    const mw = rateLimiter({ maxPerWindow: 1, windowMs: 1000 });
    await mw(ctx, next);
    vi.advanceTimersByTime(1100);
    await mw(ctx, next);
    expect(next).toHaveBeenCalledTimes(2);
  });

  it("should handle unique users independently", async () => {
    const mw = rateLimiter({ maxPerWindow: 1, windowMs: 1000 });
    await mw(ctx, next);
    Object.defineProperty(ctx, "fromId", { value: 2 });
    await mw(ctx, next);
    expect(next).toHaveBeenCalledTimes(2);
  });

  it("should handle many unique users", async () => {
    const mw = rateLimiter({ maxPerWindow: 1, windowMs: 1000 });
    for (let i = 0; i < 50; i++) {
      Object.defineProperty(ctx, "fromId", { value: i });
      await mw(ctx, next);
    }
    expect(next).toHaveBeenCalledTimes(50);
  });

  it("should trigger cleanup and bounded eviction when reaching MAX_STATE_SIZE", async () => {
    const mw = rateLimiter({ maxPerWindow: 1, windowMs: 1000 });

    // Fill up to MAX_STATE_SIZE users
    for (let i = 1; i <= MAX_STATE_SIZE; i++) {
      Object.defineProperty(ctx, "fromId", { value: i });
      await mw(ctx, next);
    }
    expect(next).toHaveBeenCalledTimes(MAX_STATE_SIZE);

    // User 1 is already in the map. Next request from User 1 should be blocked.
    Object.defineProperty(ctx, "fromId", { value: 1 });
    await mw(ctx, next);
    expect(ctx.reply).toHaveBeenCalledWith("Rate limit exceeded. Try again later.");
    vi.mocked(ctx.reply).mockClear();

    // Add one more user to trigger eviction (10% of MAX_STATE_SIZE)
    Object.defineProperty(ctx, "fromId", { value: MAX_STATE_SIZE + 1 });
    await mw(ctx, next);

    // Bounded eviction should have removed the first 10% (1000 entries).
    // User 1 was the first entry, so it should be gone now.
    Object.defineProperty(ctx, "fromId", { value: 1 });
    await mw(ctx, next);
    expect(ctx.reply).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(MAX_STATE_SIZE + 2);

    // User MAX_STATE_SIZE should still be blocked (it was not evicted)
    Object.defineProperty(ctx, "fromId", { value: MAX_STATE_SIZE });
    await mw(ctx, next);
    expect(ctx.reply).toHaveBeenCalledWith("Rate limit exceeded. Try again later.");
  });
});
