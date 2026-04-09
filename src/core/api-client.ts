import type {
  TelegramApiMethods,
  TelegramMethodName,
  TelegramResponse,
} from "../types/api-methods";
import { basename, extname } from "node:path";
import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { Blob } from "node:buffer";
import { fetch, FormData, ProxyAgent, type Dispatcher } from "undici";
import type { InputFile } from "../types/telegram";
import type { BotOptions, BotRuntimeConfig } from "./types";
import { log, stringifyForLog } from "./logger";

export const DEFAULT_BOT_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

type ClientNetworkOptions = Pick<BotOptions, "userAgent" | "timeoutMs" | "proxy">;
const UPLOAD_FIELDS = new Set([
  "photo",
  "document",
  "audio",
  "video",
  "animation",
  "voice",
  "sticker",
]);

export class TelegramApiError extends Error {
  constructor(
    message: string,
    public readonly errorCode?: number,
    public readonly method?: string,
  ) {
    super(message);
    this.name = "TelegramApiError";
  }
}

export class ApiClient {
  private readonly endpoint: string;
  private network: Required<Pick<ClientNetworkOptions, "userAgent" | "timeoutMs">> &
    Pick<ClientNetworkOptions, "proxy">;
  private dispatcher?: Dispatcher;
  private debugEnabled = false;

  constructor(token: string, baseUrl = "https://api.telegram.org", network?: ClientNetworkOptions) {
    this.endpoint = `${baseUrl}/bot${token}`;
    this.network = { userAgent: DEFAULT_BOT_USER_AGENT, timeoutMs: 15000, proxy: undefined };
    this.configureNetwork(network ?? {});
  }

  configureNetwork(config: BotRuntimeConfig) {
    this.network = {
      userAgent: config.userAgent ?? this.network.userAgent ?? DEFAULT_BOT_USER_AGENT,
      timeoutMs: config.timeoutMs ?? this.network.timeoutMs ?? 15000,
      proxy: config.proxy ?? this.network.proxy,
    };
    this.dispatcher = this.network.proxy ? new ProxyAgent(this.network.proxy) : undefined;
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
    for await (const chunk of stream) {
      if (chunk instanceof Uint8Array) chunks.push(Buffer.from(chunk));
      else chunks.push(Buffer.from(chunk));
    }
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
      const response = await fetch(`${this.endpoint}/${String(method)}`, {
        method: "POST",
        headers: {
          "User-Agent": this.network.userAgent,
          ...(body.isMultipart ? {} : { "Content-Type": "application/json" }),
        },
        body: body.body,
        dispatcher: this.dispatcher,
        signal: AbortSignal.timeout(requestTimeoutMs),
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
  answerCallbackQuery(params: TelegramApiMethods["answerCallbackQuery"]["params"]) {
    return this.call("answerCallbackQuery", params);
  }
  deleteMessage(params: TelegramApiMethods["deleteMessage"]["params"]) {
    return this.call("deleteMessage", params);
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
  sendMediaGroup(params: TelegramApiMethods["sendMediaGroup"]["params"]) {
    return this.call("sendMediaGroup", params);
  }
  sendPoll(params: TelegramApiMethods["sendPoll"]["params"]) {
    return this.call("sendPoll", params);
  }
  stopPoll(params: TelegramApiMethods["stopPoll"]["params"]) {
    return this.call("stopPoll", params);
  }
}
