import "reflect-metadata";

export { Gramora } from "./core/bot";
export { ApiClient } from "./core/api-client";
export { DEFAULT_BOT_USER_AGENT } from "./core/api-client";
export { TELEGRAM_BOT_API_DOC_VERSION, TELEGRAM_BOT_API_DOCS_URL } from "./core/api-version";
export { GramClient } from "./core/gram-client";
export type { BotModule } from "./core/types";
export type { BotOptions } from "./core/types";
export type { BotRuntimeConfig } from "./core/types";
export type { BotWebhookConfig } from "./core/types";

export {
  Controller,
  Command,
  On,
  CallbackQuery,
  InlineQuery,
  Guard,
  UseMiddleware,
  Scene,
  Step,
} from "./decorators";

export {
  BaseContext,
  MessageContext,
  CommandContext,
  CallbackContext,
  InlineContext,
  SceneContext,
} from "./context";
export type { AnswerCallbackOptions } from "./context";

export { Keyboard } from "./keyboard";
export { InlineResult, InlineResultBuilder } from "./inline-result";
export { escapeTelegramHtml, renderTelegramRichText } from "./telegram-rich-text";
export type { RenderTelegramRichTextOptions } from "./telegram-rich-text";

export { Composer } from "./middleware/composer";
export type { MiddlewareFn } from "./middleware/types";

export { formatProxyProbeMessage } from "./core/logger";
export { logger } from "./middleware/built-in/logger";
export { rateLimiter } from "./middleware/built-in/rate-limiter";
export { errorHandler } from "./middleware/built-in/error-handler";

export type {
  SendInvoiceOptions,
  CreateInvoiceLinkOptions,
  CreateInviteLinkOptions,
  SendChatActionOptions,
  AnswerShippingQueryOptions,
  AnswerPreCheckoutQueryOptions,
} from "./core/gram-client";

export type * from "./types/telegram";
export type * from "./types/api-methods";
