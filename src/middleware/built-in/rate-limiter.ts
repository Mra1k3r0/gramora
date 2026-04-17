import type { MiddlewareFn } from "../types";
import type { BaseContext } from "../../context";

/** Configuration for {@link rateLimiter}. */
export interface RateProfile {
  /** Max requests per window. Default: 30. */
  maxPerWindow?: number;
  /** Sliding window length in milliseconds. Default: 60 000 (1 minute). */
  windowMs?: number;
  /** Key updates by `"user"` (fromId) or `"chat"` (chatId). Default: `"user"`. */
  by?: "user" | "chat";
  /**
   * Called when the limit is exceeded instead of the default reply.
   * @param ctx - Current context
   */
  onExceeded?: (ctx: BaseContext) => Promise<void> | void;
}

type Bucket = { window: number; count: number };

/**
 * @param profile - Profile object or a plain number treated as `maxPerWindow` per minute per user (backwards-compatible)
 * @returns Middleware that drops updates exceeding the limit
 */
export const rateLimiter = (profile?: RateProfile | number): MiddlewareFn<BaseContext> => {
  const maxPerWindow = typeof profile === "number" ? profile : (profile?.maxPerWindow ?? 30);
  const windowMs = typeof profile === "number" ? 60_000 : (profile?.windowMs ?? 60_000);
  const by = typeof profile === "number" ? "user" : (profile?.by ?? "user");
  const onExceeded = typeof profile === "object" ? profile?.onExceeded : undefined;

  const state = new Map<number, Bucket>();

  return async (ctx, next) => {
    const key = by === "chat" ? ctx.chatId : ctx.fromId;
    if (key === undefined) return next();

    const window = Math.floor(Date.now() / windowMs);
    const bucket = state.get(key);

    if (!bucket || bucket.window !== window) {
      state.set(key, { window, count: 1 });
      return next();
    }
    if (bucket.count >= maxPerWindow) {
      if (onExceeded) {
        await onExceeded(ctx);
      } else {
        await ctx.reply("Rate limit exceeded. Try again later.");
      }
      return;
    }
    bucket.count += 1;
    return next();
  };
};
