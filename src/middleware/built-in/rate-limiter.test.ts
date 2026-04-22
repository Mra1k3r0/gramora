import { describe, it, expect, vi, beforeEach } from "vitest";
import { rateLimiter } from "./rate-limiter";
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

  it("should trigger cleanup when reaching MAX_STATE_SIZE", async () => {
    const mw = rateLimiter({ maxPerWindow: 1, windowMs: 1000 });
    const MAX_STATE_SIZE = 10000;

    // Fill up to MAX_STATE_SIZE - 1 users
    for (let i = 1; i < MAX_STATE_SIZE; i++) {
      Object.defineProperty(ctx, "fromId", { value: i });
      await mw(ctx, next);
    }
    expect(next).toHaveBeenCalledTimes(MAX_STATE_SIZE - 1);

    // User 1 is already in the map. Next request from User 1 should be blocked.
    Object.defineProperty(ctx, "fromId", { value: 1 });
    await mw(ctx, next);
    expect(ctx.reply).toHaveBeenCalledWith("Rate limit exceeded. Try again later.");
    vi.mocked(ctx.reply).mockClear();

    // Add more users to trigger cleanup/clear
    Object.defineProperty(ctx, "fromId", { value: MAX_STATE_SIZE });
    await mw(ctx, next);

    Object.defineProperty(ctx, "fromId", { value: MAX_STATE_SIZE + 1 });
    await mw(ctx, next);

    // Since all are in the same window, none are deleted, so it clears.
    // User 1 should be allowed again.
    Object.defineProperty(ctx, "fromId", { value: 1 });
    await mw(ctx, next);
    expect(ctx.reply).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(MAX_STATE_SIZE + 2);
  });
});
