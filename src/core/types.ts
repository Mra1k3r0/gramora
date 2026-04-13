import type { BaseContext } from "../context";
import type { MiddlewareFn } from "../middleware/types";

export type Constructor<T = object> = new (...args: unknown[]) => T;

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
