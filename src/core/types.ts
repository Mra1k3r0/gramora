import type { BaseContext } from "../context";
import type { MiddlewareFn } from "../middleware/types";
import type { Update } from "../types/telegram";

export type Constructor<T = object> = new (...args: unknown[]) => T;

/**
 * Lifecycle hooks for observing updates without coupling to middleware.
 * @see BotOptions.hooks
 */
export interface BotHooks {
  /** Called when a handler or middleware throws during update processing. */
  onUpdateError?: (update: Update, error: unknown) => void;
  /** Called after an update is fully processed. @param durationMs - Handler wall time in ms. */
  onUpdateProcessed?: (update: Update, durationMs: number) => void;
  /** Called when a `getUpdates` network request fails (polling transport only). @param retryDelayMs - How long polling will wait before retrying. */
  onPollingError?: (error: unknown, retryDelayMs: number) => void;
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
export interface BotRuntimeConfig {
  userAgent?: string;
  timeoutMs?: number;
  proxy?: string;
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
  proxy?: string;
  debug?: boolean;
  mode?: "full" | "core";
  operations?: {
    /** Per-update handler timeout in milliseconds. Disabled when undefined or <= 0. */
    handlerTimeoutMs?: number;
    /** Emit debug logs when webhook path or secret token mismatches. */
    logWebhookRejects?: boolean;
    /** Polling error logs mode. `quiet` disables runtime logs, hooks still fire. */
    pollingRetryLogs?: "quiet" | "structured";
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
