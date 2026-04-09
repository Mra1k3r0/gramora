import type { ApiClient } from "./api-client";
import type { InputFile, ReplyMarkup } from "../types/telegram";
import type { InputMediaPhoto } from "../types/api-methods";

export interface GramClientOptions {
  chatId?: number | string;
}

export interface SendOptions {
  text: string;
  chatId?: number | string;
  replyMarkup?: ReplyMarkup;
  replyTo?: number;
  silent?: boolean;
  protect?: boolean;
}

export interface PhotoOptions {
  photo: InputFile;
  caption?: string;
  parseMode?: "Markdown" | "MarkdownV2" | "HTML";
  chatId?: number | string;
  replyMarkup?: ReplyMarkup;
  replyTo?: number;
  silent?: boolean;
  protect?: boolean;
}

export interface DocOptions {
  document: InputFile;
  caption?: string;
  parseMode?: "Markdown" | "MarkdownV2" | "HTML";
  chatId?: number | string;
  replyMarkup?: ReplyMarkup;
  replyTo?: number;
  silent?: boolean;
  protect?: boolean;
}

export interface AudioOptions {
  audio: InputFile;
  caption?: string;
  parseMode?: "Markdown" | "MarkdownV2" | "HTML";
  chatId?: number | string;
  replyMarkup?: ReplyMarkup;
  replyTo?: number;
  silent?: boolean;
  protect?: boolean;
}

export interface VideoOptions {
  video: InputFile;
  caption?: string;
  parseMode?: "Markdown" | "MarkdownV2" | "HTML";
  chatId?: number | string;
  replyMarkup?: ReplyMarkup;
  replyTo?: number;
  silent?: boolean;
  protect?: boolean;
}

export interface AnimationOptions {
  animation: InputFile;
  caption?: string;
  parseMode?: "Markdown" | "MarkdownV2" | "HTML";
  chatId?: number | string;
  replyMarkup?: ReplyMarkup;
  replyTo?: number;
  silent?: boolean;
  protect?: boolean;
}

export interface VoiceOptions {
  voice: InputFile;
  caption?: string;
  parseMode?: "Markdown" | "MarkdownV2" | "HTML";
  chatId?: number | string;
  replyMarkup?: ReplyMarkup;
  replyTo?: number;
  silent?: boolean;
  protect?: boolean;
}

export interface StickerOptions {
  sticker: InputFile;
  emoji?: string;
  chatId?: number | string;
  replyMarkup?: ReplyMarkup;
  replyTo?: number;
  silent?: boolean;
  protect?: boolean;
}

export interface SendMediaGroupOptions {
  media: InputMediaPhoto[];
  chatId?: number | string;
  silent?: boolean;
  protect?: boolean;
  replyTo?: number;
}

export class GramClient {
  constructor(
    private readonly api: ApiClient,
    private readonly options: GramClientOptions = {},
  ) {}

  withChat(chatId: number | string) {
    return new GramClient(this.api, { chatId });
  }

  async send(text: string, replyMarkup?: ReplyMarkup, chatId?: number | string): Promise<unknown>;
  async send(options: SendOptions): Promise<unknown>;
  async send(
    textOrOptions: string | SendOptions,
    replyMarkup?: ReplyMarkup,
    chatId?: number | string,
  ) {
    const normalized: SendOptions =
      typeof textOrOptions === "string"
        ? { text: textOrOptions, replyMarkup, chatId }
        : textOrOptions;
    const targetChatId = normalized.chatId ?? this.options.chatId;
    if (targetChatId === undefined) {
      throw new Error("Missing chat id. Use ctx.gram or call gram.withChat(chatId).send(...).");
    }

    return this.api.sendMessage({
      chat_id: targetChatId,
      text: normalized.text,
      ...(normalized.replyMarkup ? { reply_markup: normalized.replyMarkup } : {}),
      ...(normalized.replyTo !== undefined ? { reply_to_message_id: normalized.replyTo } : {}),
      ...(normalized.silent !== undefined ? { disable_notification: normalized.silent } : {}),
      ...(normalized.protect !== undefined ? { protect_content: normalized.protect } : {}),
    });
  }

  async photo(photo: InputFile, caption?: string, chatId?: number | string): Promise<unknown>;
  async photo(options: PhotoOptions): Promise<unknown>;
  async photo(
    photoOrOptions: InputFile | PhotoOptions,
    caption?: string,
    chatId?: number | string,
  ) {
    const normalized: PhotoOptions =
      typeof photoOrOptions !== "string" && "photo" in photoOrOptions
        ? photoOrOptions
        : { photo: photoOrOptions as InputFile, caption, chatId };
    const targetChatId = normalized.chatId ?? this.options.chatId;
    if (targetChatId === undefined) {
      throw new Error("Missing chat id. Use ctx.gram or call gram.withChat(chatId).photo(...).");
    }

    return this.api.sendPhoto({
      chat_id: targetChatId,
      photo: normalized.photo,
      ...(normalized.caption ? { caption: normalized.caption } : {}),
      ...(normalized.parseMode ? { parse_mode: normalized.parseMode } : {}),
      ...(normalized.replyMarkup ? { reply_markup: normalized.replyMarkup } : {}),
      ...(normalized.replyTo !== undefined ? { reply_to_message_id: normalized.replyTo } : {}),
      ...(normalized.silent !== undefined ? { disable_notification: normalized.silent } : {}),
      ...(normalized.protect !== undefined ? { protect_content: normalized.protect } : {}),
    });
  }

  async doc(document: InputFile, caption?: string, chatId?: number | string): Promise<unknown>;
  async doc(options: DocOptions): Promise<unknown>;
  async doc(documentOrOptions: InputFile | DocOptions, caption?: string, chatId?: number | string) {
    const normalized: DocOptions =
      typeof documentOrOptions !== "string" && "document" in documentOrOptions
        ? documentOrOptions
        : { document: documentOrOptions as InputFile, caption, chatId };
    const targetChatId = normalized.chatId ?? this.options.chatId;
    if (targetChatId === undefined) {
      throw new Error("Missing chat id. Use ctx.gram or call gram.withChat(chatId).doc(...).");
    }

    return this.api.sendDocument({
      chat_id: targetChatId,
      document: normalized.document,
      ...(normalized.caption ? { caption: normalized.caption } : {}),
      ...(normalized.parseMode ? { parse_mode: normalized.parseMode } : {}),
      ...(normalized.replyMarkup ? { reply_markup: normalized.replyMarkup } : {}),
      ...(normalized.replyTo !== undefined ? { reply_to_message_id: normalized.replyTo } : {}),
      ...(normalized.silent !== undefined ? { disable_notification: normalized.silent } : {}),
      ...(normalized.protect !== undefined ? { protect_content: normalized.protect } : {}),
    });
  }

  async audio(audio: InputFile, caption?: string, chatId?: number | string): Promise<unknown>;
  async audio(options: AudioOptions): Promise<unknown>;
  async audio(
    audioOrOptions: InputFile | AudioOptions,
    caption?: string,
    chatId?: number | string,
  ) {
    const normalized: AudioOptions =
      typeof audioOrOptions !== "string" && "audio" in audioOrOptions
        ? audioOrOptions
        : { audio: audioOrOptions as InputFile, caption, chatId };
    const targetChatId = normalized.chatId ?? this.options.chatId;
    if (targetChatId === undefined)
      throw new Error("Missing chat id. Use gram.withChat(chatId).audio(...).");
    return this.api.sendAudio({
      chat_id: targetChatId,
      audio: normalized.audio,
      ...(normalized.caption ? { caption: normalized.caption } : {}),
      ...(normalized.parseMode ? { parse_mode: normalized.parseMode } : {}),
      ...(normalized.replyMarkup ? { reply_markup: normalized.replyMarkup } : {}),
      ...(normalized.replyTo !== undefined ? { reply_to_message_id: normalized.replyTo } : {}),
      ...(normalized.silent !== undefined ? { disable_notification: normalized.silent } : {}),
      ...(normalized.protect !== undefined ? { protect_content: normalized.protect } : {}),
    });
  }

  async video(video: InputFile, caption?: string, chatId?: number | string): Promise<unknown>;
  async video(options: VideoOptions): Promise<unknown>;
  async video(
    videoOrOptions: InputFile | VideoOptions,
    caption?: string,
    chatId?: number | string,
  ) {
    const normalized: VideoOptions =
      typeof videoOrOptions !== "string" && "video" in videoOrOptions
        ? videoOrOptions
        : { video: videoOrOptions as InputFile, caption, chatId };
    const targetChatId = normalized.chatId ?? this.options.chatId;
    if (targetChatId === undefined)
      throw new Error("Missing chat id. Use gram.withChat(chatId).video(...).");
    return this.api.sendVideo({
      chat_id: targetChatId,
      video: normalized.video,
      ...(normalized.caption ? { caption: normalized.caption } : {}),
      ...(normalized.parseMode ? { parse_mode: normalized.parseMode } : {}),
      ...(normalized.replyMarkup ? { reply_markup: normalized.replyMarkup } : {}),
      ...(normalized.replyTo !== undefined ? { reply_to_message_id: normalized.replyTo } : {}),
      ...(normalized.silent !== undefined ? { disable_notification: normalized.silent } : {}),
      ...(normalized.protect !== undefined ? { protect_content: normalized.protect } : {}),
    });
  }

  async animation(
    animation: InputFile,
    caption?: string,
    chatId?: number | string,
  ): Promise<unknown>;
  async animation(options: AnimationOptions): Promise<unknown>;
  async animation(
    animationOrOptions: InputFile | AnimationOptions,
    caption?: string,
    chatId?: number | string,
  ) {
    const normalized: AnimationOptions =
      typeof animationOrOptions !== "string" && "animation" in animationOrOptions
        ? animationOrOptions
        : { animation: animationOrOptions as InputFile, caption, chatId };
    const targetChatId = normalized.chatId ?? this.options.chatId;
    if (targetChatId === undefined)
      throw new Error("Missing chat id. Use gram.withChat(chatId).animation(...).");
    return this.api.sendAnimation({
      chat_id: targetChatId,
      animation: normalized.animation,
      ...(normalized.caption ? { caption: normalized.caption } : {}),
      ...(normalized.parseMode ? { parse_mode: normalized.parseMode } : {}),
      ...(normalized.replyMarkup ? { reply_markup: normalized.replyMarkup } : {}),
      ...(normalized.replyTo !== undefined ? { reply_to_message_id: normalized.replyTo } : {}),
      ...(normalized.silent !== undefined ? { disable_notification: normalized.silent } : {}),
      ...(normalized.protect !== undefined ? { protect_content: normalized.protect } : {}),
    });
  }

  async voice(voice: InputFile, caption?: string, chatId?: number | string): Promise<unknown>;
  async voice(options: VoiceOptions): Promise<unknown>;
  async voice(
    voiceOrOptions: InputFile | VoiceOptions,
    caption?: string,
    chatId?: number | string,
  ) {
    const normalized: VoiceOptions =
      typeof voiceOrOptions !== "string" && "voice" in voiceOrOptions
        ? voiceOrOptions
        : { voice: voiceOrOptions as InputFile, caption, chatId };
    const targetChatId = normalized.chatId ?? this.options.chatId;
    if (targetChatId === undefined)
      throw new Error("Missing chat id. Use gram.withChat(chatId).voice(...).");
    return this.api.sendVoice({
      chat_id: targetChatId,
      voice: normalized.voice,
      ...(normalized.caption ? { caption: normalized.caption } : {}),
      ...(normalized.parseMode ? { parse_mode: normalized.parseMode } : {}),
      ...(normalized.replyMarkup ? { reply_markup: normalized.replyMarkup } : {}),
      ...(normalized.replyTo !== undefined ? { reply_to_message_id: normalized.replyTo } : {}),
      ...(normalized.silent !== undefined ? { disable_notification: normalized.silent } : {}),
      ...(normalized.protect !== undefined ? { protect_content: normalized.protect } : {}),
    });
  }

  async sticker(sticker: InputFile, chatId?: number | string): Promise<unknown>;
  async sticker(options: StickerOptions): Promise<unknown>;
  async sticker(stickerOrOptions: InputFile | StickerOptions, chatId?: number | string) {
    const normalized: StickerOptions =
      typeof stickerOrOptions !== "string" && "sticker" in stickerOrOptions
        ? stickerOrOptions
        : { sticker: stickerOrOptions as InputFile, chatId };
    const targetChatId = normalized.chatId ?? this.options.chatId;
    if (targetChatId === undefined)
      throw new Error("Missing chat id. Use gram.withChat(chatId).sticker(...).");
    return this.api.sendSticker({
      chat_id: targetChatId,
      sticker: normalized.sticker,
      ...(normalized.emoji ? { emoji: normalized.emoji } : {}),
      ...(normalized.replyMarkup ? { reply_markup: normalized.replyMarkup } : {}),
      ...(normalized.replyTo !== undefined ? { reply_to_message_id: normalized.replyTo } : {}),
      ...(normalized.silent !== undefined ? { disable_notification: normalized.silent } : {}),
      ...(normalized.protect !== undefined ? { protect_content: normalized.protect } : {}),
    });
  }

  async sendMediaGroup(media: InputMediaPhoto[], chatId?: number | string): Promise<unknown>;
  async sendMediaGroup(options: SendMediaGroupOptions): Promise<unknown>;
  async sendMediaGroup(
    mediaOrOptions: InputMediaPhoto[] | SendMediaGroupOptions,
    chatId?: number | string,
  ) {
    const normalized: SendMediaGroupOptions = Array.isArray(mediaOrOptions)
      ? { media: mediaOrOptions, chatId }
      : mediaOrOptions;
    const targetChatId = normalized.chatId ?? this.options.chatId;
    if (targetChatId === undefined) {
      throw new Error("Missing chat id. Use gram.withChat(chatId).sendMediaGroup(...).");
    }
    return this.api.sendMediaGroup({
      chat_id: targetChatId,
      media: normalized.media,
      ...(normalized.silent !== undefined ? { disable_notification: normalized.silent } : {}),
      ...(normalized.protect !== undefined ? { protect_content: normalized.protect } : {}),
      ...(normalized.replyTo !== undefined ? { reply_to_message_id: normalized.replyTo } : {}),
    });
  }
}
