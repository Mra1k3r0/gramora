import type { MiddlewareFn } from "../types";
import type { BaseContext } from "../../context";
import { log } from "../../core/logger";

export const logger = (): MiddlewareFn<BaseContext> => async (ctx, next) => {
  const start = Date.now();
  await next();
  log("info", "mw.logger", `update=${ctx.update.update_id} elapsed=${Date.now() - start}ms`);
};
