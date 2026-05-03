import type { TelegramApiMethods, TelegramMethodName, TelegramResponse } from "../../types/api";
import { basename, extname } from "node:path";
import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { Blob } from "node:buffer";
import { fetch, FormData, ProxyAgent, Socks5ProxyAgent, type Dispatcher } from "undici";
import type { InputFile } from "../../types/telegram";
import type { BotOptions, BotRuntimeConfig } from "../types";
import { addRedactionToken, log, stringifyForLog } from "../logger";
import { TelegramApiError, RateLimitError } from "../errors";

export { TelegramApiError } from "../errors";

export const DEFAULT_BOT_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const NETWORK_OPTION_KEYS = [
  "userAgent",
  "timeoutMs",
  "proxy",
  "httpTransport",
] as const satisfies readonly (keyof BotOptions)[];

export type ClientNetworkOptions = Pick<BotOptions, (typeof NETWORK_OPTION_KEYS)[number]>;

/** Pass-through for ApiClient: only networking keys that are explicitly set on the bot. */
export function pickClientNetworkOptions(options: BotOptions): ClientNetworkOptions {
  const entries = NETWORK_OPTION_KEYS.flatMap((key) =>
    options[key] !== undefined ? ([[key, options[key]]] as const) : [],
  );
  return Object.fromEntries(entries) as ClientNetworkOptions;
}

type BotApiPostInit = {
  headers: Record<string, string>;
  body?: string | FormData;
  timeoutMs: number;
  signal: AbortSignal;
};

const UPLOAD_FIELDS = new Set([
  "photo",
  "document",
  "audio",
  "video",
  "animation",
  "voice",
  "sticker",
]);

/**
 * Typed Telegram Bot API HTTP client.
 * @see https://core.telegram.org/bots/api
 */
export class ApiClient {
  private readonly endpoint: string;
  private network: Required<Pick<ClientNetworkOptions, "userAgent" | "timeoutMs">> &
    Pick<ClientNetworkOptions, "proxy" | "httpTransport">;
  private dispatcher?: Dispatcher;
  private debugEnabled = false;

  /**
   * @param token - Bot token from BotFather
   * @param baseUrl - Bot API origin (defaults to Telegram)
   * @param network - Optional; prefer {@link pickClientNetworkOptions} from `BotOptions`
   */
  constructor(token: string, baseUrl = "https://api.telegram.org", network?: ClientNetworkOptions) {
    addRedactionToken(token);
    this.endpoint = `${baseUrl}/bot${token}`;
    this.network = {
      userAgent: DEFAULT_BOT_USER_AGENT,
      timeoutMs: 15000,
      proxy: undefined,
      httpTransport: undefined,
    };
    this.configureNetwork(network ?? {});
  }

  /** Merge runtime networking fields and refresh the undici dispatcher when applicable. */
  configureNetwork(config: BotRuntimeConfig) {
    const prev = this.network;
    this.network = {
      userAgent: config.userAgent ?? prev.userAgent ?? DEFAULT_BOT_USER_AGENT,
      timeoutMs: config.timeoutMs ?? prev.timeoutMs ?? 15000,
      proxy: "proxy" in config ? config.proxy : prev.proxy,
      httpTransport: "httpTransport" in config ? config.httpTransport : prev.httpTransport,
    };
    this.applyDispatcherFromNetwork();
  }

  private applyDispatcherFromNetwork() {
    const { httpTransport, proxy } = this.network;
    if (httpTransport !== undefined) {
      this.dispatcher = undefined;
      return;
    }
    if (proxy === undefined || proxy === null) {
      this.dispatcher = undefined;
      return;
    }
    if (typeof proxy !== "string") {
      this.dispatcher = proxy;
      return;
    }
    const url = proxy.trim();
    if (!url) {
      this.dispatcher = undefined;
      return;
    }
    if (/^socks5(h)?:\/\//i.test(url)) {
      this.dispatcher = new Socks5ProxyAgent(url.replace(/^socks5h:\/\//i, "socks5://"));
      return;
    }
    this.dispatcher = new ProxyAgent({ uri: url });
  }

  private postBotApi(url: string, init: BotApiPostInit) {
    const { httpTransport } = this.network;
    const { headers, body, timeoutMs, signal } = init;
    return httpTransport
      ? httpTransport({ url, headers, body, timeoutMs, signal })
      : fetch(url, { method: "POST", headers, body, dispatcher: this.dispatcher, signal });
  }

  /** Whether proxy routing or a custom HTTP transport is configured (used for launch-time health logging). */
  hasProxy(): boolean {
    const { httpTransport, proxy } = this.network;
    if (httpTransport !== undefined) return true;
    if (proxy === undefined || proxy === null) return false;
    if (typeof proxy !== "string") return true;
    return Boolean(proxy.trim());
  }

  setDebug(enabled: boolean) {
    this.debugEnabled = enabled;
  }

  private sanitizeForLog(value: unknown): unknown {
    if (value === null || typeof value !== "object") return value;
    if ("buffer" in (value as Record<string, unknown>)) {
      const item = value as { filename?: string; buffer?: Uint8Array };
      return {
        kind: "buffer",
        filename: item.filename,
        bytes: item.buffer?.byteLength,
      };
    }
    if ("path" in (value as Record<string, unknown>)) {
      const item = value as { path?: string; stream?: boolean; filename?: string };
      return {
        kind: "path",
        path: item.path,
        stream: Boolean(item.stream),
        filename: item.filename,
      };
    }
    if ("stream" in (value as Record<string, unknown>)) {
      const item = value as { filename?: string };
      return { kind: "stream", filename: item.filename };
    }
    if (Array.isArray(value)) {
      return value.map((item) => this.sanitizeForLog(item));
    }
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (nested === undefined) continue;
      out[key] = this.sanitizeForLog(nested);
    }
    return out;
  }

  private isUploadObject(value: unknown): value is Exclude<InputFile, string> {
    if (!value || typeof value !== "object") return false;
    return "path" in value || "buffer" in value || "stream" in value;
  }

  private async streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    return Buffer.concat(chunks);
  }

  private defaultMimeType(filename: string): string {
    const ext = extname(filename).toLowerCase();
    if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
    if (ext === ".png") return "image/png";
    if (ext === ".gif") return "image/gif";
    if (ext === ".webp") return "image/webp";
    if (ext === ".mp4") return "video/mp4";
    if (ext === ".mp3") return "audio/mpeg";
    if (ext === ".ogg") return "audio/ogg";
    if (ext === ".pdf") return "application/pdf";
    return "application/octet-stream";
  }

  private toSafeArrayBuffer(data: Uint8Array): ArrayBuffer {
    const out = new Uint8Array(data.byteLength);
    out.set(data);
    return out.buffer;
  }

  private async toUploadPart(
    input: Exclude<InputFile, string>,
    field: string,
  ): Promise<{ blob: Blob; filename: string }> {
    if ("path" in input) {
      const filename = input.filename ?? basename(input.path) ?? `${field}.bin`;
      const bytes = input.stream
        ? await this.streamToBuffer(createReadStream(input.path))
        : await readFile(input.path);
      return {
        filename,
        blob: new Blob([this.toSafeArrayBuffer(bytes)], {
          type: input.mimeType ?? this.defaultMimeType(filename),
        }),
      };
    }
    if ("buffer" in input) {
      const filename = input.filename ?? `${field}.bin`;
      return {
        filename,
        blob: new Blob([this.toSafeArrayBuffer(input.buffer)], {
          type: input.mimeType ?? this.defaultMimeType(filename),
        }),
      };
    }
    const bytes = await this.streamToBuffer(input.stream);
    const filename = input.filename;
    return {
      filename,
      blob: new Blob([this.toSafeArrayBuffer(bytes)], {
        type: input.mimeType ?? this.defaultMimeType(filename),
      }),
    };
  }

  private async toRequestBody(
    params?: Record<string, unknown>,
  ): Promise<{ body?: string | FormData; isMultipart: boolean }> {
    if (!params) return { body: undefined, isMultipart: false };
    const entries = Object.entries(params).filter(([, value]) => value !== undefined);
    const needsMultipart = entries.some(
      ([key, value]) => UPLOAD_FIELDS.has(key) && this.isUploadObject(value),
    );
    if (!needsMultipart) {
      return { body: JSON.stringify(params), isMultipart: false };
    }

    const form = new FormData();
    for (const [key, value] of entries) {
      if (UPLOAD_FIELDS.has(key) && this.isUploadObject(value)) {
        const upload = await this.toUploadPart(value, key);
        form.append(key, upload.blob, upload.filename);
        continue;
      }
      if (typeof value === "object" && value !== null && !(value instanceof Uint8Array)) {
        form.append(key, JSON.stringify(value));
        continue;
      }
      form.append(key, String(value));
    }
    return { body: form, isMultipart: true };
  }

  /**
   * @param method - Bot API method name
   * @param params - Optional request body
   * @returns The API `result` field
   * @throws {TelegramApiError} When HTTP fails or `ok` is false in the JSON body
   * @throws Re-throws fetch, timeout (`AbortSignal`), and other network errors
   */
  async call<M extends TelegramMethodName>(
    method: M,
    params?: TelegramApiMethods[M]["params"],
  ): Promise<TelegramApiMethods[M]["result"]> {
    const startedAt = Date.now();
    const longPollTimeoutSec =
      method === "getUpdates" &&
      params &&
      typeof params === "object" &&
      "timeout" in (params as Record<string, unknown>) &&
      typeof (params as Record<string, unknown>).timeout === "number"
        ? ((params as Record<string, unknown>).timeout as number)
        : undefined;
    const requestTimeoutMs = longPollTimeoutSec
      ? Math.max(this.network.timeoutMs, longPollTimeoutSec * 1000 + 5000)
      : this.network.timeoutMs;

    if (this.debugEnabled) {
      log(
        "debug",
        "api.request",
        `${String(method)} params:\n${stringifyForLog(this.sanitizeForLog(params ?? {}))}`,
      );
    }

    try {
      const body = await this.toRequestBody(params as Record<string, unknown> | undefined);
      const headers: Record<string, string> = {
        "User-Agent": this.network.userAgent,
        ...(body.isMultipart ? {} : { "Content-Type": "application/json" }),
      };
      const signal = AbortSignal.timeout(requestTimeoutMs);
      const url = `${this.endpoint}/${String(method)}`;
      const response = await this.postBotApi(url, {
        headers,
        body: body.body,
        timeoutMs: requestTimeoutMs,
        signal,
      });

      if (!response.ok) {
        if (this.debugEnabled) {
          log(
            "error",
            "api.response",
            `${String(method)} HTTP ${response.status} in ${Date.now() - startedAt}ms`,
          );
        }
        throw new TelegramApiError(`HTTP ${response.status}`, response.status, String(method));
      }

      const payload = (await response.json()) as TelegramResponse<TelegramApiMethods[M]["result"]>;
      if (!payload.ok) {
        if (this.debugEnabled) {
          log(
            "error",
            "api.response",
            `${String(method)} failed in ${Date.now() - startedAt}ms:\n${stringifyForLog(payload)}`,
          );
        }
        if (payload.error_code === 429) {
          throw new RateLimitError(
            payload.description ?? "Too Many Requests",
            payload.parameters?.retry_after ?? 1,
            String(method),
          );
        }
        throw new TelegramApiError(
          payload.description ?? "Telegram API failed",
          payload.error_code,
          String(method),
        );
      }
      if (this.debugEnabled) {
        log(
          "debug",
          "api.response",
          `${String(method)} ok in ${Date.now() - startedAt}ms result:\n${stringifyForLog(payload.result)}`,
        );
      }
      return payload.result;
    } catch (error) {
      if (this.debugEnabled) {
        const message = (error as Error)?.message ?? "unknown error";
        const isAbortLike =
          message.toLowerCase().includes("aborted") ||
          (error as { name?: string } | null)?.name === "AbortError";
        if (method === "getUpdates" && isAbortLike) {
          log(
            "debug",
            "api.poll",
            `${String(method)} long-poll timed out in ${Date.now() - startedAt}ms`,
          );
        } else {
          log(
            "error",
            "api.error",
            `${String(method)} threw in ${Date.now() - startedAt}ms: ${message}`,
          );
        }
      }
      throw error;
    }
  }

  getMe() {
    return this.call("getMe");
  }
  getUpdates(params: TelegramApiMethods["getUpdates"]["params"]) {
    return this.call("getUpdates", params);
  }
  sendMessage(params: TelegramApiMethods["sendMessage"]["params"]) {
    return this.call("sendMessage", params);
  }
  sendPhoto(params: TelegramApiMethods["sendPhoto"]["params"]) {
    return this.call("sendPhoto", params);
  }
  sendDocument(params: TelegramApiMethods["sendDocument"]["params"]) {
    return this.call("sendDocument", params);
  }
  sendAudio(params: TelegramApiMethods["sendAudio"]["params"]) {
    return this.call("sendAudio", params);
  }
  sendVideo(params: TelegramApiMethods["sendVideo"]["params"]) {
    return this.call("sendVideo", params);
  }
  sendAnimation(params: TelegramApiMethods["sendAnimation"]["params"]) {
    return this.call("sendAnimation", params);
  }
  sendVoice(params: TelegramApiMethods["sendVoice"]["params"]) {
    return this.call("sendVoice", params);
  }
  sendSticker(params: TelegramApiMethods["sendSticker"]["params"]) {
    return this.call("sendSticker", params);
  }
  editMessageText(params: TelegramApiMethods["editMessageText"]["params"]) {
    return this.call("editMessageText", params);
  }
  editMessageCaption(params: TelegramApiMethods["editMessageCaption"]["params"]) {
    return this.call("editMessageCaption", params);
  }
  editMessageReplyMarkup(params: TelegramApiMethods["editMessageReplyMarkup"]["params"]) {
    return this.call("editMessageReplyMarkup", params);
  }
  editMessageMedia(params: TelegramApiMethods["editMessageMedia"]["params"]) {
    return this.call("editMessageMedia", params);
  }
  answerCallbackQuery(params: TelegramApiMethods["answerCallbackQuery"]["params"]) {
    return this.call("answerCallbackQuery", params);
  }
  answerInlineQuery(params: TelegramApiMethods["answerInlineQuery"]["params"]) {
    return this.call("answerInlineQuery", params);
  }
  deleteMessage(params: TelegramApiMethods["deleteMessage"]["params"]) {
    return this.call("deleteMessage", params);
  }
  deleteMessages(params: TelegramApiMethods["deleteMessages"]["params"]) {
    return this.call("deleteMessages", params);
  }
  forwardMessage(params: TelegramApiMethods["forwardMessage"]["params"]) {
    return this.call("forwardMessage", params);
  }
  copyMessage(params: TelegramApiMethods["copyMessage"]["params"]) {
    return this.call("copyMessage", params);
  }
  banChatMember(params: TelegramApiMethods["banChatMember"]["params"]) {
    return this.call("banChatMember", params);
  }
  unbanChatMember(params: TelegramApiMethods["unbanChatMember"]["params"]) {
    return this.call("unbanChatMember", params);
  }
  restrictChatMember(params: TelegramApiMethods["restrictChatMember"]["params"]) {
    return this.call("restrictChatMember", params);
  }
  promoteChatMember(params: TelegramApiMethods["promoteChatMember"]["params"]) {
    return this.call("promoteChatMember", params);
  }
  setChatPermissions(params: TelegramApiMethods["setChatPermissions"]["params"]) {
    return this.call("setChatPermissions", params);
  }
  setChatAdministratorCustomTitle(
    params: TelegramApiMethods["setChatAdministratorCustomTitle"]["params"],
  ) {
    return this.call("setChatAdministratorCustomTitle", params);
  }
  setWebhook(params: TelegramApiMethods["setWebhook"]["params"]) {
    return this.call("setWebhook", params);
  }
  deleteWebhook(params?: TelegramApiMethods["deleteWebhook"]["params"]) {
    return this.call("deleteWebhook", params);
  }
  getWebhookInfo() {
    return this.call("getWebhookInfo");
  }
  getFile(params: TelegramApiMethods["getFile"]["params"]) {
    return this.call("getFile", params);
  }
  setMyCommands(params: TelegramApiMethods["setMyCommands"]["params"]) {
    return this.call("setMyCommands", params);
  }
  deleteMyCommands(params: TelegramApiMethods["deleteMyCommands"]["params"] = {}) {
    return this.call("deleteMyCommands", params);
  }
  getMyCommands(params: TelegramApiMethods["getMyCommands"]["params"] = {}) {
    return this.call("getMyCommands", params);
  }
  setChatMenuButton(params: TelegramApiMethods["setChatMenuButton"]["params"] = {}) {
    return this.call("setChatMenuButton", params);
  }
  getChatMenuButton(params: TelegramApiMethods["getChatMenuButton"]["params"] = {}) {
    return this.call("getChatMenuButton", params);
  }
  setMyName(params: TelegramApiMethods["setMyName"]["params"] = {}) {
    return this.call("setMyName", params);
  }
  getMyName(params: TelegramApiMethods["getMyName"]["params"] = {}) {
    return this.call("getMyName", params);
  }
  setMyDescription(params: TelegramApiMethods["setMyDescription"]["params"] = {}) {
    return this.call("setMyDescription", params);
  }
  getMyDescription(params: TelegramApiMethods["getMyDescription"]["params"] = {}) {
    return this.call("getMyDescription", params);
  }
  setMyShortDescription(params: TelegramApiMethods["setMyShortDescription"]["params"] = {}) {
    return this.call("setMyShortDescription", params);
  }
  getMyShortDescription(params: TelegramApiMethods["getMyShortDescription"]["params"] = {}) {
    return this.call("getMyShortDescription", params);
  }
  sendMediaGroup(params: TelegramApiMethods["sendMediaGroup"]["params"]) {
    return this.call("sendMediaGroup", params);
  }
  pinChatMessage(params: TelegramApiMethods["pinChatMessage"]["params"]) {
    return this.call("pinChatMessage", params);
  }
  unpinChatMessage(params: TelegramApiMethods["unpinChatMessage"]["params"]) {
    return this.call("unpinChatMessage", params);
  }
  unpinAllChatMessages(params: TelegramApiMethods["unpinAllChatMessages"]["params"]) {
    return this.call("unpinAllChatMessages", params);
  }
  getChatMember(params: TelegramApiMethods["getChatMember"]["params"]) {
    return this.call("getChatMember", params);
  }
  getChatAdministrators(params: TelegramApiMethods["getChatAdministrators"]["params"]) {
    return this.call("getChatAdministrators", params);
  }
  getChatMemberCount(params: TelegramApiMethods["getChatMemberCount"]["params"]) {
    return this.call("getChatMemberCount", params);
  }
  createForumTopic(params: TelegramApiMethods["createForumTopic"]["params"]) {
    return this.call("createForumTopic", params);
  }
  editForumTopic(params: TelegramApiMethods["editForumTopic"]["params"]) {
    return this.call("editForumTopic", params);
  }
  closeForumTopic(params: TelegramApiMethods["closeForumTopic"]["params"]) {
    return this.call("closeForumTopic", params);
  }
  reopenForumTopic(params: TelegramApiMethods["reopenForumTopic"]["params"]) {
    return this.call("reopenForumTopic", params);
  }
  deleteForumTopic(params: TelegramApiMethods["deleteForumTopic"]["params"]) {
    return this.call("deleteForumTopic", params);
  }
  approveChatJoinRequest(params: TelegramApiMethods["approveChatJoinRequest"]["params"]) {
    return this.call("approveChatJoinRequest", params);
  }
  declineChatJoinRequest(params: TelegramApiMethods["declineChatJoinRequest"]["params"]) {
    return this.call("declineChatJoinRequest", params);
  }
  setMessageReaction(params: TelegramApiMethods["setMessageReaction"]["params"]) {
    return this.call("setMessageReaction", params);
  }
  sendLocation(params: TelegramApiMethods["sendLocation"]["params"]) {
    return this.call("sendLocation", params);
  }
  sendVenue(params: TelegramApiMethods["sendVenue"]["params"]) {
    return this.call("sendVenue", params);
  }
  sendContact(params: TelegramApiMethods["sendContact"]["params"]) {
    return this.call("sendContact", params);
  }
  sendDice(params: TelegramApiMethods["sendDice"]["params"]) {
    return this.call("sendDice", params);
  }
  sendPoll(params: TelegramApiMethods["sendPoll"]["params"]) {
    return this.call("sendPoll", params);
  }
  stopPoll(params: TelegramApiMethods["stopPoll"]["params"]) {
    return this.call("stopPoll", params);
  }
  sendInvoice(params: TelegramApiMethods["sendInvoice"]["params"]) {
    return this.call("sendInvoice", params);
  }
  createInvoiceLink(params: TelegramApiMethods["createInvoiceLink"]["params"]) {
    return this.call("createInvoiceLink", params);
  }
  answerShippingQuery(params: TelegramApiMethods["answerShippingQuery"]["params"]) {
    return this.call("answerShippingQuery", params);
  }
  answerPreCheckoutQuery(params: TelegramApiMethods["answerPreCheckoutQuery"]["params"]) {
    return this.call("answerPreCheckoutQuery", params);
  }
  getMyStarBalance() {
    return this.call("getMyStarBalance");
  }
  getStarTransactions(params: TelegramApiMethods["getStarTransactions"]["params"] = {}) {
    return this.call("getStarTransactions", params);
  }
  refundStarPayment(params: TelegramApiMethods["refundStarPayment"]["params"]) {
    return this.call("refundStarPayment", params);
  }
  editUserStarSubscription(params: TelegramApiMethods["editUserStarSubscription"]["params"]) {
    return this.call("editUserStarSubscription", params);
  }
  sendChatAction(params: TelegramApiMethods["sendChatAction"]["params"]) {
    return this.call("sendChatAction", params);
  }
  getChat(params: TelegramApiMethods["getChat"]["params"]) {
    return this.call("getChat", params);
  }
  leaveChat(params: TelegramApiMethods["leaveChat"]["params"]) {
    return this.call("leaveChat", params);
  }
  exportChatInviteLink(params: TelegramApiMethods["exportChatInviteLink"]["params"]) {
    return this.call("exportChatInviteLink", params);
  }
  createChatInviteLink(params: TelegramApiMethods["createChatInviteLink"]["params"]) {
    return this.call("createChatInviteLink", params);
  }
}
