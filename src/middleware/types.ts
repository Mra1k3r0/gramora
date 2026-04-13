/** Continues to the next middleware or handler. */
export type NextFn = () => Promise<void>;

/**
 * @param ctx - Context passed to handlers
 * @param next - Call once to delegate down the stack
 */
export type MiddlewareFn<C> = (ctx: C, next: NextFn) => Promise<void> | void;
