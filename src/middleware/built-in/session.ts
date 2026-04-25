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
  type CacheEntry = { value: T; refs: number };
  const resolveKey =
    options.key ??
    ((ctx: BaseContext) => {
      const id = ctx.fromId ?? ctx.chatId;
      return id === undefined ? undefined : String(id);
    });
  const cache = new Map<string, CacheEntry>();
  const inFlightLoads = new Map<string, Promise<T | undefined>>();

  return async (ctx, next) => {
    const key = resolveKey(ctx);
    if (!key) {
      await next();
      return;
    }

    let entry = cache.get(key);
    if (entry) {
      entry.refs += 1;
    } else {
      let pendingLoad = inFlightLoads.get(key);
      if (!pendingLoad) {
        pendingLoad = options.store.get(key);
        inFlightLoads.set(key, pendingLoad);
      }
      const loaded = await pendingLoad;
      if (inFlightLoads.get(key) === pendingLoad) {
        inFlightLoads.delete(key);
      }
      const existingEntry = cache.get(key);
      if (existingEntry) {
        existingEntry.refs += 1;
        entry = existingEntry;
      } else {
        const initial = options.initial?.() ?? ({} as T);
        entry = { value: (loaded ?? initial) as T, refs: 1 };
        cache.set(key, entry);
      }
    }

    Object.defineProperty(ctx, "session", {
      configurable: true,
      enumerable: true,
      get: () => entry.value as Record<string, unknown>,
      set: (value: Record<string, unknown>) => {
        entry.value = value as T;
      },
    });

    try {
      await next();
    } finally {
      const current = entry.value;
      if (Object.keys(current).length === 0) {
        await options.store.delete(key);
      } else {
        await options.store.set(key, current);
      }

      entry.refs -= 1;
      if (entry.refs === 0) {
        cache.delete(key);
      }
    }
  };
}
