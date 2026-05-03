import type { BaseContext } from "../context";
import type { MiddlewareFn } from "../middleware/types";
import type { Update } from "../types/telegram";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Dispatcher, FormData as UndiciFormData } from "undici";

export type Constructor<T = object> = new (...args: unknown[]) => T;

export type HookErrorSource = "update" | "polling" | "webhook";
export type HookErrorClass =
  | "rate_limit"
  | "network"
  | "api"
  | "validation"
  | "timeout"
  | "unknown";

export interface HookErrorEnvelope {
  source: HookErrorSource;
  class: HookErrorClass;
  retryable: boolean;
  message: string;
  timestamp: number;
}

/**
 * Lifecycle hooks for observing updates without coupling to middleware.
 * @see BotOptions.hooks
 */
export interface BotHooks {
  /** Called when a handler or middleware throws during update processing. */
  onUpdateError?: (update: Update, error: unknown, meta: HookErrorEnvelope) => void;
  /** Called after an update is fully processed. @param durationMs - Handler wall time in ms. */
  onUpdateProcessed?: (update: Update, durationMs: number) => void;
  /** Called when a `getUpdates` network request fails (polling transport only). @param retryDelayMs - How long polling will wait before retrying. */
  onPollingError?: (error: unknown, retryDelayMs: number, meta: HookErrorEnvelope) => void;
  /** Optional unified hook for structured runtime errors across transports. */
  onRuntimeError?: (meta: HookErrorEnvelope, error: unknown, update?: Update) => void;
}

export interface BotModuleHost {
  use: (mw: MiddlewareFn<BaseContext>) => BotModuleHost;
  command: (name: string, handler: (gram: BaseContext) => Promise<void> | void) => BotModuleHost;
  onText: (handler: (gram: BaseContext) => Promise<void> | void) => BotModuleHost;
  onMessage: (handler: (gram: BaseContext) => Promise<void> | void) => BotModuleHost;
  onCallback: (
    pattern: string,
    handler: (gram: BaseContext) => Promise<void> | void,
  ) => BotModuleHost;
  onShippingQuery: (handler: (gram: BaseContext) => Promise<void> | void) => BotModuleHost;
  onPreCheckoutQuery: (handler: (gram: BaseContext) => Promise<void> | void) => BotModuleHost;
  onChatMember: (handler: (gram: BaseContext) => Promise<void> | void) => BotModuleHost;
  onMyChatMember: (handler: (gram: BaseContext) => Promise<void> | void) => BotModuleHost;
  onChatJoinRequest: (handler: (gram: BaseContext) => Promise<void> | void) => BotModuleHost;
  onMessageReaction: (handler: (gram: BaseContext) => Promise<void> | void) => BotModuleHost;
  onMessageReactionCount: (handler: (gram: BaseContext) => Promise<void> | void) => BotModuleHost;
  onBusinessConnection: (handler: (gram: BaseContext) => Promise<void> | void) => BotModuleHost;
  onBusinessMessage: (handler: (gram: BaseContext) => Promise<void> | void) => BotModuleHost;
  onEditedBusinessMessage: (handler: (gram: BaseContext) => Promise<void> | void) => BotModuleHost;
  onDeletedBusinessMessages: (
    handler: (gram: BaseContext) => Promise<void> | void,
  ) => BotModuleHost;
  onFilter: <T extends Update>(
    filter: (update: Update) => update is T,
    handler: (gram: BaseContext & { update: T }) => Promise<void> | void,
  ) => BotModuleHost;
}

export type BotModule = (bot: BotModuleHost) => void;

/** POST body for Telegram Bot API calls (JSON string or undici multipart `FormData`). */
export type TelegramHttpPostBody = string | UndiciFormData;

export interface TelegramHttpTransportResponse {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

/**
 * Custom Bot API POST handler. When set, built-in `proxy` is not used for Bot API calls.
 * @beta — wire your own client (e.g. axios + proxy agents); multipart uses undici `FormData`.
 */
export type TelegramHttpTransport = (request: {
  url: string;
  headers: Record<string, string>;
  body?: TelegramHttpPostBody;
  timeoutMs: number;
  signal: AbortSignal;
}) => Promise<TelegramHttpTransportResponse>;

export interface BotRuntimeConfig {
  userAgent?: string;
  timeoutMs?: number;
  /**
   * Proxy URL or an undici `Dispatcher` (e.g. `new ProxyAgent({ uri })`).
   * `configure({ proxy: undefined })` clears a previously set value.
   */
  proxy?: string | Dispatcher;
  /** @beta Custom Bot API POST handler (`TelegramHttpTransport`); skips built-in undici path. */
  httpTransport?: TelegramHttpTransport;
  debug?: boolean;
}

export interface BotOptions {
  token: string;
  apiBaseUrl?: string;
  /** Observability hooks; called by the bot runtime, not middleware. */
  hooks?: BotHooks;
  polling?: {
    timeout?: number;
    limit?: number;
    /**
     * Update type strings for getUpdates, e.g. `message`, `chat_member`.
     * @see https://core.telegram.org/bots/api#getupdates
     */
    allowedUpdates?: string[];
  };
  userAgent?: string;
  timeoutMs?: number;
  /** @see BotRuntimeConfig.proxy */
  proxy?: string | Dispatcher;
  /** @beta @see BotRuntimeConfig.httpTransport */
  httpTransport?: TelegramHttpTransport;
  debug?: boolean;
  mode?: "full" | "core";
  operations?: {
    /** Per-update handler timeout in milliseconds. Disabled when undefined or <= 0. */
    handlerTimeoutMs?: number;
    /** Emit debug logs when webhook path or secret token mismatches. */
    logWebhookRejects?: boolean;
    /** Polling error logs mode. `quiet` disables runtime logs, hooks still fire. */
    pollingRetryLogs?: "quiet" | "structured";
    /** Max accepted webhook body size in bytes. Defaults to 1 MiB. */
    webhookMaxBodyBytes?: number;
    /** Allowed webhook content types. Defaults to `["application/json"]`. */
    webhookAllowedContentTypes?: string[];
    /** Polling retry backoff start in milliseconds. Defaults to 1000. */
    pollingRetryBaseMs?: number;
    /** Polling retry backoff max in milliseconds. Defaults to 30000. */
    pollingRetryMaxMs?: number;
    /** Error classes eligible for polling retries. Defaults to all common retry classes. */
    pollingRetryOn?: Array<"rate_limit" | "network" | "api" | "unknown">;
  };
}

export interface LaunchOptions {
  transport?: "polling" | "webhook";
  webhook?: BotWebhookConfig;
}

export interface BotWebhookConfig {
  domain?: string;
  port: number;
  path?: string;
  secretToken?: string;
}

export interface CreateWebhookOptions {
  domain?: string;
  path?: string;
  secretToken?: string;
}

export interface CreateWebhookAdapter {
  path: string;
  handler: (req: IncomingMessage, res: ServerResponse) => void;
  setWebhook?: () => Promise<boolean>;
}
