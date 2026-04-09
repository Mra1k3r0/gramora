export type NextFn = () => Promise<void>;
export type MiddlewareFn<C> = (ctx: C, next: NextFn) => Promise<void> | void;
