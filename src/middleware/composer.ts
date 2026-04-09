import { compose } from "./pipeline";
import type { MiddlewareFn } from "./types";

export class Composer<C> {
  private readonly middleware: Array<MiddlewareFn<C>> = [];
  use(...fns: Array<MiddlewareFn<C>>) {
    this.middleware.push(...fns);
    return this;
  }
  middlewareFn() {
    return compose(this.middleware);
  }
  list() {
    return [...this.middleware];
  }
}
