import type { BaseContext } from "../../context";
import type { MiddlewareFn } from "../types";

export interface SessionStore<T extends Record<string, unknown> = Record<string, unknown>> {
  get(key: string): Promise<T | undefined>;
  set(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
}

export interface SessionOptions<T extends Record<string, unknown> = Record<string, unknown>> {
  store: SessionStore<T>;
  key?: (ctx: BaseContext) => string | undefined;
  initial?: () => T;
}

/**
 * Persist `ctx.session` across updates with a pluggable key-value store.
 * Defaults to `fromId`, then `chatId`, then no-op when neither exists.
 */
export function session<T extends Record<string, unknown> = Record<string, unknown>>(
  options: SessionOptions<T>,
): MiddlewareFn<BaseContext> {
  const resolveKey =
    options.key ??
    ((ctx: BaseContext) => {
      const id = ctx.fromId ?? ctx.chatId;
      return id === undefined ? undefined : String(id);
    });

  return async (ctx, next) => {
    const key = resolveKey(ctx);
    if (!key) {
      await next();
      return;
    }

    const existing = await options.store.get(key);
    const initial = options.initial?.() ?? ({} as T);
    ctx.session = (existing ?? initial) as Record<string, unknown>;

    await next();

    const current = ctx.session as T;
    if (Object.keys(current).length === 0) {
      await options.store.delete(key);
      return;
    }
    await options.store.set(key, current);
  };
}
