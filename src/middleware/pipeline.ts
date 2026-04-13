import type { MiddlewareFn, NextFn } from "./types";

/**
 * @param middleware - Outer-first list (first runs first on the way in)
 * @returns Single middleware that runs the chain
 * @throws {Error} When `next()` is called more than once in the same middleware frame
 */
export function compose<C>(middleware: Array<MiddlewareFn<C>>): MiddlewareFn<C> {
  return async (ctx: C, next: NextFn) => {
    let index = -1;
    const dispatch = async (i: number): Promise<void> => {
      if (i <= index) throw new Error("next() called multiple times");
      index = i;
      const fn = i === middleware.length ? next : middleware[i];
      if (!fn) return;
      await fn(ctx, () => dispatch(i + 1));
    };
    await dispatch(0);
  };
}
