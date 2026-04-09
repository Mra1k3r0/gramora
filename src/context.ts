import type { ApiClient } from "./core/api-client";
import {
  GramClient,
  type AnimationOptions,
  type AudioOptions,
  type DocOptions,
  type PhotoOptions,
  type SendOptions,
  type StickerOptions,
  type VideoOptions,
  type VoiceOptions,
  type SendMediaGroupOptions,
} from "./core/gram-client";
import type { InputMediaPhoto } from "./types/api-methods";
import type { MessageForKind } from "./types/context";
import type { InputFile, MessageContentKind, ReplyMarkup, Update } from "./types/telegram";

export interface SceneControl {
  name?: string;
  step?: number;
  state: Record<string, unknown>;
  enter: (sceneName: string) => Promise<void>;
  leave: () => Promise<void>;
  next: () => Promise<void>;
}

export interface BaseContextOptions {
  update: Update;
  api: ApiClient;
  scene?: SceneControl;
  match?: string[];
}

export class BaseContext {
  public readonly update: Update;
  public readonly api: ApiClient;
  public readonly gram: GramClient;
  public readonly message;
  public readonly callbackQuery;
  public readonly inlineQuery;
  public readonly scene: SceneControl;
  public match?: string[];

  constructor(options: BaseContextOptions) {
    this.update = options.update;
    this.api = options.api;
    this.gram = new GramClient(options.api, {
      chatId: options.update.message?.chat.id ?? options.update.callback_query?.message?.chat.id,
    });
    this.message = options.update.message;
    this.callbackQuery = options.update.callback_query;
    this.inlineQuery = options.update.inline_query;
    this.scene = options.scene ?? {
      state: {},
      enter: async () => {},
      leave: async () => {},
      next: async () => {},
    };
    this.match = options.match;
  }

  get chatId(): number | undefined {
    return this.message?.chat.id ?? this.callbackQuery?.message?.chat.id;
  }
  get fromId(): number | undefined {
    return this.message?.from?.id ?? this.callbackQuery?.from.id ?? this.inlineQuery?.from.id;
  }
  get text(): string | undefined {
    return this.message && "text" in this.message ? this.message.text : undefined;
  }

  async reply(text: string, reply_markup?: ReplyMarkup) {
    return this.gram.send(text, reply_markup);
  }

  async send(text: string, replyMarkup?: ReplyMarkup): Promise<unknown>;
  async send(options: SendOptions): Promise<unknown>;
  async send(textOrOptions: string | SendOptions, replyMarkup?: ReplyMarkup) {
    if (typeof textOrOptions === "string") {
      return this.gram.send(textOrOptions, replyMarkup);
    }
    return this.gram.send(textOrOptions);
  }

  async photo(photo: InputFile, caption?: string): Promise<unknown>;
  async photo(options: PhotoOptions): Promise<unknown>;
  async photo(photoOrOptions: InputFile | PhotoOptions, caption?: string) {
    if (
      typeof photoOrOptions === "string" ||
      "path" in photoOrOptions ||
      "buffer" in photoOrOptions ||
      "stream" in photoOrOptions
    ) {
      return this.gram.photo(photoOrOptions, caption);
    }
    return this.gram.photo(photoOrOptions);
  }

  async doc(document: InputFile, caption?: string): Promise<unknown>;
  async doc(options: DocOptions): Promise<unknown>;
  async doc(documentOrOptions: InputFile | DocOptions, caption?: string) {
    if (
      typeof documentOrOptions === "string" ||
      "path" in documentOrOptions ||
      "buffer" in documentOrOptions ||
      "stream" in documentOrOptions
    ) {
      return this.gram.doc(documentOrOptions, caption);
    }
    return this.gram.doc(documentOrOptions);
  }

  async audio(audio: InputFile, caption?: string): Promise<unknown>;
  async audio(options: AudioOptions): Promise<unknown>;
  async audio(audioOrOptions: InputFile | AudioOptions, caption?: string) {
    if (
      typeof audioOrOptions === "string" ||
      "path" in audioOrOptions ||
      "buffer" in audioOrOptions ||
      "stream" in audioOrOptions
    ) {
      return this.gram.audio(audioOrOptions, caption);
    }
    return this.gram.audio(audioOrOptions);
  }

  async video(video: InputFile, caption?: string): Promise<unknown>;
  async video(options: VideoOptions): Promise<unknown>;
  async video(videoOrOptions: InputFile | VideoOptions, caption?: string) {
    if (
      typeof videoOrOptions === "string" ||
      "path" in videoOrOptions ||
      "buffer" in videoOrOptions ||
      "stream" in videoOrOptions
    ) {
      return this.gram.video(videoOrOptions, caption);
    }
    return this.gram.video(videoOrOptions);
  }

  async animation(animation: InputFile, caption?: string): Promise<unknown>;
  async animation(options: AnimationOptions): Promise<unknown>;
  async animation(animationOrOptions: InputFile | AnimationOptions, caption?: string) {
    if (
      typeof animationOrOptions === "string" ||
      "path" in animationOrOptions ||
      "buffer" in animationOrOptions ||
      "stream" in animationOrOptions
    )
      return this.gram.animation(animationOrOptions, caption);
    return this.gram.animation(animationOrOptions);
  }

  async voice(voice: InputFile, caption?: string): Promise<unknown>;
  async voice(options: VoiceOptions): Promise<unknown>;
  async voice(voiceOrOptions: InputFile | VoiceOptions, caption?: string) {
    if (
      typeof voiceOrOptions === "string" ||
      "path" in voiceOrOptions ||
      "buffer" in voiceOrOptions ||
      "stream" in voiceOrOptions
    ) {
      return this.gram.voice(voiceOrOptions, caption);
    }
    return this.gram.voice(voiceOrOptions);
  }

  async sticker(sticker: InputFile): Promise<unknown>;
  async sticker(options: StickerOptions): Promise<unknown>;
  async sticker(stickerOrOptions: InputFile | StickerOptions) {
    if (
      typeof stickerOrOptions === "string" ||
      "path" in stickerOrOptions ||
      "buffer" in stickerOrOptions ||
      "stream" in stickerOrOptions
    ) {
      return this.gram.sticker(stickerOrOptions);
    }
    return this.gram.sticker(stickerOrOptions);
  }

  async sendMediaGroup(media: InputMediaPhoto[]): Promise<unknown>;
  async sendMediaGroup(options: SendMediaGroupOptions): Promise<unknown>;
  async sendMediaGroup(mediaOrOptions: InputMediaPhoto[] | SendMediaGroupOptions) {
    if (Array.isArray(mediaOrOptions)) {
      return this.gram.sendMediaGroup(mediaOrOptions);
    }
    return this.gram.sendMediaGroup(mediaOrOptions);
  }

  async answer(text?: string, show_alert?: boolean) {
    if (!this.callbackQuery?.id) throw new Error("No callback query available in current context");
    return this.api.answerCallbackQuery({
      callback_query_id: this.callbackQuery.id,
      text,
      show_alert,
    });
  }
}

export class MessageContext<K extends MessageContentKind> extends BaseContext {
  declare message: MessageForKind<K>;
  constructor(options: BaseContextOptions) {
    super(options);
    this.message = options.update.message as MessageForKind<K>;
  }
}

export class CommandContext<C extends string = string> extends BaseContext {
  public readonly command: C;
  public readonly args: string[];

  constructor(options: BaseContextOptions) {
    super(options);
    const [raw, ...rest] = (this.text ?? "").trim().split(/\s+/);
    this.command = raw as C;
    this.args = rest;
  }
}

export class CallbackContext extends BaseContext {
  get data() {
    return this.callbackQuery?.data;
  }
}

export class InlineContext extends BaseContext {
  get query() {
    return this.inlineQuery?.query;
  }
}

export class SceneContext extends BaseContext {}
