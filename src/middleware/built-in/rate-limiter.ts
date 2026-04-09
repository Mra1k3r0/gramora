import type { MiddlewareFn } from "../types";
import type { BaseContext } from "../../context";

export const rateLimiter = (maxPerMinute = 30): MiddlewareFn<BaseContext> => {
  const state = new Map<number, { minute: number; count: number }>();
  return async (ctx, next) => {
    const userId = ctx.fromId;
    if (!userId) return next();
    const minute = Math.floor(Date.now() / 60000);
    const current = state.get(userId);
    if (!current || current.minute !== minute) {
      state.set(userId, { minute, count: 1 });
      return next();
    }
    if (current.count >= maxPerMinute) {
      await ctx.reply("Rate limit exceeded. Try again in a minute.");
      return;
    }
    current.count += 1;
    await next();
  };
};
