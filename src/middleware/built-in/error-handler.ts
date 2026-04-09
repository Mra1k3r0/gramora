import type { MiddlewareFn } from "../types";
import type { BaseContext } from "../../context";
import { log, stringifyForLog } from "../../core/logger";

export const errorHandler = (
  onError?: (error: unknown, ctx: BaseContext) => Promise<void> | void,
): MiddlewareFn<BaseContext> => {
  return async (ctx, next) => {
    try {
      await next();
    } catch (error) {
      if (onError) await onError(error, ctx);
      else log("error", "mw.error", stringifyForLog(error));
      if (ctx.chatId) await ctx.reply("Something went wrong while processing your request.");
    }
  };
};
