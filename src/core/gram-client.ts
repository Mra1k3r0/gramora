import type { ApiClient } from "./api/client";
import { ValidationError } from "./errors";
import type {
  BotCommandScope,
  ChatAction,
  ChatAdministratorRights,
  ChatFull,
  ChatInviteLink,
  ChatMember,
  ChatPermissions,
  InlineKeyboardMarkup,
  InputFile,
  InputMedia,
  LabeledPrice,
  MenuButton,
  ForumTopic,
  ReactionType,
  ReplyMarkup,
  ShippingOption,
  StarAmount,
  StarTransactions,
} from "../types/telegram";
import type { InputMediaPhoto } from "../types/api-methods";

export interface GramClientOptions {
  chatId?: number | string;
}

export interface SendOptions {
  text: string;
  chatId?: number | string;
  parseMode?: "Markdown" | "MarkdownV2" | "HTML";
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

export interface EditTextOptions {
  text: string;
  messageId?: number;
  inlineMessageId?: string;
  chatId?: number | string;
  parseMode?: "Markdown" | "MarkdownV2" | "HTML";
  replyMarkup?: InlineKeyboardMarkup;
}

export interface EditCaptionOptions {
  messageId?: number;
  inlineMessageId?: string;
  chatId?: number | string;
  caption?: string;
  parseMode?: "Markdown" | "MarkdownV2" | "HTML";
  replyMarkup?: InlineKeyboardMarkup;
}

export interface EditReplyMarkupOptions {
  messageId?: number;
  inlineMessageId?: string;
  chatId?: number | string;
  replyMarkup?: InlineKeyboardMarkup;
}

export interface EditMediaOptions {
  media: InputMedia;
  messageId?: number;
  inlineMessageId?: string;
  chatId?: number | string;
  replyMarkup?: InlineKeyboardMarkup;
}

export interface DeleteMessageOptions {
  messageId: number;
  chatId?: number | string;
}

export interface DeleteMessagesOptions {
  messageIds: number[];
  chatId?: number | string;
}

export interface ForwardOptions {
  messageId: number;
  fromChatId: number | string;
  chatId?: number | string;
  silent?: boolean;
  protect?: boolean;
}

export interface CopyOptions {
  messageId: number;
  fromChatId: number | string;
  chatId?: number | string;
  caption?: string;
  parseMode?: "Markdown" | "MarkdownV2" | "HTML";
  replyMarkup?: ReplyMarkup;
  silent?: boolean;
  protect?: boolean;
  replyTo?: number;
}

export interface BanMemberOptions {
  userId: number;
  chatId?: number | string;
  untilDate?: number;
  revokeMessages?: boolean;
}

export interface UnbanMemberOptions {
  userId: number;
  chatId?: number | string;
  onlyIfBanned?: boolean;
}

export interface RestrictMemberOptions {
  userId: number;
  permissions: ChatPermissions;
  chatId?: number | string;
  independentPermissions?: boolean;
  untilDate?: number;
}

export interface PromoteMemberOptions extends Partial<ChatAdministratorRights> {
  userId: number;
  chatId?: number | string;
}

export interface SetPermissionsOptions {
  permissions: ChatPermissions;
  chatId?: number | string;
  independentPermissions?: boolean;
}

export interface SetCustomTitleOptions {
  userId: number;
  customTitle: string;
  chatId?: number | string;
}

export interface PinOptions {
  messageId: number;
  chatId?: number | string;
  silent?: boolean;
}

export interface UnpinOptions {
  messageId?: number;
  chatId?: number | string;
}

export interface MemberLookupOptions {
  userId: number;
  chatId?: number | string;
}

export interface ForumTopicCreateOptions {
  name: string;
  chatId?: number | string;
  iconColor?: number;
  iconCustomEmojiId?: string;
}

export interface ForumTopicEditOptions {
  chatId?: number | string;
  messageThreadId: number;
  name?: string;
  iconCustomEmojiId?: string;
}

export interface ForumTopicRefOptions {
  chatId?: number | string;
  messageThreadId: number;
}

export interface SetMyCommandsOptions {
  commands: { command: string; description: string }[];
  scope?: BotCommandScope;
  languageCode?: string;
}

export interface GetMyCommandsOptions {
  scope?: BotCommandScope;
  languageCode?: string;
}

export interface DeleteMyCommandsOptions {
  scope?: BotCommandScope;
  languageCode?: string;
}

export interface SetMenuButtonOptions {
  chatId?: number | string;
  menuButton?: MenuButton;
}

export interface SetMyNameOptions {
  name?: string;
  languageCode?: string;
}

export interface SetMyDescriptionOptions {
  description?: string;
  languageCode?: string;
}

export interface SetMyShortDescriptionOptions {
  shortDescription?: string;
  languageCode?: string;
}

export interface SendInvoiceOptions {
  chatId?: number | string;
  title: string;
  description: string;
  payload: string;
  currency: string;
  prices: LabeledPrice[];
  providerToken?: string;
  maxTipAmount?: number;
  suggestedTipAmounts?: number[];
  startParameter?: string;
  providerData?: string;
  photoUrl?: string;
  photoSize?: number;
  photoWidth?: number;
  photoHeight?: number;
  needName?: boolean;
  needPhoneNumber?: boolean;
  needEmail?: boolean;
  needShippingAddress?: boolean;
  sendPhoneNumberToProvider?: boolean;
  sendEmailToProvider?: boolean;
  isFlexible?: boolean;
  silent?: boolean;
  protect?: boolean;
  replyTo?: number;
  replyMarkup?: InlineKeyboardMarkup;
}

export interface CreateInvoiceLinkOptions {
  title: string;
  description: string;
  payload: string;
  currency: string;
  prices: LabeledPrice[];
  providerToken?: string;
  maxTipAmount?: number;
  suggestedTipAmounts?: number[];
  providerData?: string;
  photoUrl?: string;
  photoSize?: number;
  photoWidth?: number;
  photoHeight?: number;
  needName?: boolean;
  needPhoneNumber?: boolean;
  needEmail?: boolean;
  needShippingAddress?: boolean;
  sendPhoneNumberToProvider?: boolean;
  sendEmailToProvider?: boolean;
  isFlexible?: boolean;
}

export interface AnswerShippingQueryOptions {
  shippingQueryId: string;
  ok: boolean;
  shippingOptions?: ShippingOption[];
  errorMessage?: string;
}

export interface AnswerPreCheckoutQueryOptions {
  preCheckoutQueryId: string;
  ok: boolean;
  errorMessage?: string;
}

export interface SendChatActionOptions {
  action: ChatAction;
  chatId?: number | string;
  messageThreadId?: number;
  businessConnectionId?: string;
}

export interface GetStarTransactionsOptions {
  offset?: number;
  limit?: number;
}

export interface EditUserStarSubscriptionOptions {
  userId: number;
  telegramPaymentChargeId: string;
  isCanceled: boolean;
}

export interface CreateInviteLinkOptions {
  chatId?: number | string;
  name?: string;
  expireDate?: number;
  memberLimit?: number;
  createsJoinRequest?: boolean;
}

export interface JoinRequestUserOptions {
  userId: number;
  chatId?: number | string;
}

export interface SetMessageReactionOptions {
  messageId: number;
  reaction: ReactionType[];
  chatId?: number | string;
  isBig?: boolean;
}

export interface SendLocationOptions {
  latitude: number;
  longitude: number;
  chatId?: number | string;
  horizontalAccuracy?: number;
  livePeriod?: number;
  heading?: number;
  proximityAlertRadius?: number;
  silent?: boolean;
  protect?: boolean;
  replyTo?: number;
  replyMarkup?: ReplyMarkup;
  messageThreadId?: number;
  businessConnectionId?: string;
}

export interface SendVenueOptions {
  latitude: number;
  longitude: number;
  title: string;
  address: string;
  chatId?: number | string;
  foursquareId?: string;
  foursquareType?: string;
  googlePlaceId?: string;
  googlePlaceType?: string;
  silent?: boolean;
  protect?: boolean;
  replyTo?: number;
  replyMarkup?: ReplyMarkup;
  messageThreadId?: number;
  businessConnectionId?: string;
}

export interface SendContactOptions {
  phoneNumber: string;
  firstName: string;
  chatId?: number | string;
  lastName?: string;
  vcard?: string;
  silent?: boolean;
  protect?: boolean;
  replyTo?: number;
  replyMarkup?: ReplyMarkup;
  messageThreadId?: number;
  businessConnectionId?: string;
}

export interface SendDiceOptions {
  chatId?: number | string;
  emoji?: string;
  silent?: boolean;
  protect?: boolean;
  replyTo?: number;
  replyMarkup?: ReplyMarkup;
  messageThreadId?: number;
  businessConnectionId?: string;
}

export interface SendPollOptions {
  question: string;
  options: string[];
  chatId?: number | string;
  isAnonymous?: boolean;
  pollType?: "quiz" | "regular";
  allowsMultipleAnswers?: boolean;
  correctOptionId?: number;
  explanation?: string;
  explanationParseMode?: "Markdown" | "MarkdownV2" | "HTML";
  openPeriod?: number;
  closeDate?: number;
  isClosed?: boolean;
  silent?: boolean;
  protect?: boolean;
  replyTo?: number;
  replyMarkup?: ReplyMarkup;
  messageThreadId?: number;
  businessConnectionId?: string;
}

export interface StopPollOptions {
  messageId: number;
  chatId?: number | string;
  replyMarkup?: InlineKeyboardMarkup;
}

/**
 * High-level send/edit helpers; uses default `chatId` from context when set.
 * @throws {Error} When a method needs `chat_id` and neither the call options nor {@link GramClientOptions.chatId} set it — use `withChat` or `ctx.gram` from a message/callback context.
 */
export class GramClient {
  /**
   * @param api - Underlying API client
   * @param options - Optional default chat for `send` and similar
   */
  constructor(
    private readonly api: ApiClient,
    private readonly options: GramClientOptions = {},
  ) {}

  /**
   * @param value - String to check; skipped when undefined
   * @param max - Telegram's character limit for this field
   * @param field - Field name for the error message
   * @throws {ValidationError} When the value exceeds the limit
   */
  private static assertLen(value: string | undefined, max: number, field: string): void {
    if (value !== undefined && value.length > max) {
      throw new ValidationError(`${field} exceeds ${max} chars (got ${value.length})`, field);
    }
  }

  /**
   * @param chatId - Target chat for subsequent calls on the returned client
   * @returns New client instance sharing the same API client
   */
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
    GramClient.assertLen(normalized.text, 4096, "text");
    const targetChatId = normalized.chatId ?? this.options.chatId;
    if (targetChatId === undefined) {
      throw new Error("Missing chat id. Use ctx.gram or call gram.withChat(chatId).send(...).");
    }

    return this.api.sendMessage({
      chat_id: targetChatId,
      text: normalized.text,
      ...(normalized.parseMode ? { parse_mode: normalized.parseMode } : {}),
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
    GramClient.assertLen(normalized.caption, 1024, "caption");
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
    GramClient.assertLen(normalized.caption, 1024, "caption");
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
    GramClient.assertLen(normalized.caption, 1024, "caption");
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
    GramClient.assertLen(normalized.caption, 1024, "caption");
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
    GramClient.assertLen(normalized.caption, 1024, "caption");
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
    GramClient.assertLen(normalized.caption, 1024, "caption");
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

  async editText(options: EditTextOptions) {
    const targetChatId = options.chatId ?? this.options.chatId;
    return this.api.editMessageText({
      ...(targetChatId !== undefined ? { chat_id: targetChatId } : {}),
      ...(options.messageId !== undefined ? { message_id: options.messageId } : {}),
      ...(options.inlineMessageId ? { inline_message_id: options.inlineMessageId } : {}),
      text: options.text,
      ...(options.parseMode ? { parse_mode: options.parseMode } : {}),
      ...(options.replyMarkup ? { reply_markup: options.replyMarkup } : {}),
    });
  }

  async editCaption(options: EditCaptionOptions) {
    const targetChatId = options.chatId ?? this.options.chatId;
    return this.api.editMessageCaption({
      ...(targetChatId !== undefined ? { chat_id: targetChatId } : {}),
      ...(options.messageId !== undefined ? { message_id: options.messageId } : {}),
      ...(options.inlineMessageId ? { inline_message_id: options.inlineMessageId } : {}),
      ...(options.caption !== undefined ? { caption: options.caption } : {}),
      ...(options.parseMode ? { parse_mode: options.parseMode } : {}),
      ...(options.replyMarkup ? { reply_markup: options.replyMarkup } : {}),
    });
  }

  async editReplyMarkup(options: EditReplyMarkupOptions) {
    const targetChatId = options.chatId ?? this.options.chatId;
    return this.api.editMessageReplyMarkup({
      ...(targetChatId !== undefined ? { chat_id: targetChatId } : {}),
      ...(options.messageId !== undefined ? { message_id: options.messageId } : {}),
      ...(options.inlineMessageId ? { inline_message_id: options.inlineMessageId } : {}),
      ...(options.replyMarkup ? { reply_markup: options.replyMarkup } : {}),
    });
  }

  async editMedia(options: EditMediaOptions) {
    const targetChatId = options.chatId ?? this.options.chatId;
    return this.api.editMessageMedia({
      ...(targetChatId !== undefined ? { chat_id: targetChatId } : {}),
      ...(options.messageId !== undefined ? { message_id: options.messageId } : {}),
      ...(options.inlineMessageId ? { inline_message_id: options.inlineMessageId } : {}),
      media: options.media,
      ...(options.replyMarkup ? { reply_markup: options.replyMarkup } : {}),
    });
  }

  async deleteMessage(messageId: number, chatId?: number | string): Promise<unknown>;
  async deleteMessage(options: DeleteMessageOptions): Promise<unknown>;
  async deleteMessage(messageIdOrOptions: number | DeleteMessageOptions, chatId?: number | string) {
    const normalized: DeleteMessageOptions =
      typeof messageIdOrOptions === "number"
        ? { messageId: messageIdOrOptions, chatId }
        : messageIdOrOptions;
    const targetChatId = normalized.chatId ?? this.options.chatId;
    if (targetChatId === undefined) {
      throw new Error("Missing chat id. Use gram.withChat(chatId).deleteMessage(...).");
    }
    return this.api.deleteMessage({
      chat_id: targetChatId,
      message_id: normalized.messageId,
    });
  }

  async deleteMessages(messageIds: number[], chatId?: number | string): Promise<unknown>;
  async deleteMessages(options: DeleteMessagesOptions): Promise<unknown>;
  async deleteMessages(
    messageIdsOrOptions: number[] | DeleteMessagesOptions,
    chatId?: number | string,
  ) {
    const normalized: DeleteMessagesOptions = Array.isArray(messageIdsOrOptions)
      ? { messageIds: messageIdsOrOptions, chatId }
      : messageIdsOrOptions;
    const targetChatId = normalized.chatId ?? this.options.chatId;
    if (targetChatId === undefined) {
      throw new Error("Missing chat id. Use gram.withChat(chatId).deleteMessages(...).");
    }
    return this.api.deleteMessages({
      chat_id: targetChatId,
      message_ids: normalized.messageIds,
    });
  }

  async forward(options: ForwardOptions) {
    const targetChatId = options.chatId ?? this.options.chatId;
    if (targetChatId === undefined) {
      throw new Error("Missing chat id. Use gram.withChat(chatId).forward(...).");
    }
    return this.api.forwardMessage({
      chat_id: targetChatId,
      from_chat_id: options.fromChatId,
      message_id: options.messageId,
      ...(options.silent !== undefined ? { disable_notification: options.silent } : {}),
      ...(options.protect !== undefined ? { protect_content: options.protect } : {}),
    });
  }

  async copy(options: CopyOptions) {
    const targetChatId = options.chatId ?? this.options.chatId;
    if (targetChatId === undefined) {
      throw new Error("Missing chat id. Use gram.withChat(chatId).copy(...).");
    }
    return this.api.copyMessage({
      chat_id: targetChatId,
      from_chat_id: options.fromChatId,
      message_id: options.messageId,
      ...(options.caption !== undefined ? { caption: options.caption } : {}),
      ...(options.parseMode ? { parse_mode: options.parseMode } : {}),
      ...(options.replyMarkup ? { reply_markup: options.replyMarkup } : {}),
      ...(options.silent !== undefined ? { disable_notification: options.silent } : {}),
      ...(options.protect !== undefined ? { protect_content: options.protect } : {}),
      ...(options.replyTo !== undefined ? { reply_to_message_id: options.replyTo } : {}),
    });
  }

  async banMember(userId: number, chatId?: number | string): Promise<unknown>;
  async banMember(options: BanMemberOptions): Promise<unknown>;
  async banMember(userIdOrOptions: number | BanMemberOptions, chatId?: number | string) {
    const normalized: BanMemberOptions =
      typeof userIdOrOptions === "number" ? { userId: userIdOrOptions, chatId } : userIdOrOptions;
    const targetChatId = normalized.chatId ?? this.options.chatId;
    if (targetChatId === undefined)
      throw new Error("Missing chat id. Use gram.withChat(chatId).banMember(...).");
    return this.api.banChatMember({
      chat_id: targetChatId,
      user_id: normalized.userId,
      ...(normalized.untilDate !== undefined ? { until_date: normalized.untilDate } : {}),
      ...(normalized.revokeMessages !== undefined
        ? { revoke_messages: normalized.revokeMessages }
        : {}),
    });
  }

  async unbanMember(userId: number, chatId?: number | string): Promise<unknown>;
  async unbanMember(options: UnbanMemberOptions): Promise<unknown>;
  async unbanMember(userIdOrOptions: number | UnbanMemberOptions, chatId?: number | string) {
    const normalized: UnbanMemberOptions =
      typeof userIdOrOptions === "number" ? { userId: userIdOrOptions, chatId } : userIdOrOptions;
    const targetChatId = normalized.chatId ?? this.options.chatId;
    if (targetChatId === undefined)
      throw new Error("Missing chat id. Use gram.withChat(chatId).unbanMember(...).");
    return this.api.unbanChatMember({
      chat_id: targetChatId,
      user_id: normalized.userId,
      ...(normalized.onlyIfBanned !== undefined ? { only_if_banned: normalized.onlyIfBanned } : {}),
    });
  }

  async restrictMember(options: RestrictMemberOptions) {
    const targetChatId = options.chatId ?? this.options.chatId;
    if (targetChatId === undefined)
      throw new Error("Missing chat id. Use gram.withChat(chatId).restrictMember(...).");
    return this.api.restrictChatMember({
      chat_id: targetChatId,
      user_id: options.userId,
      permissions: options.permissions,
      ...(options.independentPermissions !== undefined
        ? { use_independent_chat_permissions: options.independentPermissions }
        : {}),
      ...(options.untilDate !== undefined ? { until_date: options.untilDate } : {}),
    });
  }

  async promoteMember(options: PromoteMemberOptions) {
    const targetChatId = options.chatId ?? this.options.chatId;
    if (targetChatId === undefined)
      throw new Error("Missing chat id. Use gram.withChat(chatId).promoteMember(...).");
    return this.api.promoteChatMember({
      chat_id: targetChatId,
      user_id: options.userId,
      ...(options.is_anonymous !== undefined ? { is_anonymous: options.is_anonymous } : {}),
      ...(options.can_manage_chat !== undefined
        ? { can_manage_chat: options.can_manage_chat }
        : {}),
      ...(options.can_delete_messages !== undefined
        ? { can_delete_messages: options.can_delete_messages }
        : {}),
      ...(options.can_manage_video_chats !== undefined
        ? { can_manage_video_chats: options.can_manage_video_chats }
        : {}),
      ...(options.can_restrict_members !== undefined
        ? { can_restrict_members: options.can_restrict_members }
        : {}),
      ...(options.can_promote_members !== undefined
        ? { can_promote_members: options.can_promote_members }
        : {}),
      ...(options.can_change_info !== undefined
        ? { can_change_info: options.can_change_info }
        : {}),
      ...(options.can_invite_users !== undefined
        ? { can_invite_users: options.can_invite_users }
        : {}),
      ...(options.can_post_messages !== undefined
        ? { can_post_messages: options.can_post_messages }
        : {}),
      ...(options.can_edit_messages !== undefined
        ? { can_edit_messages: options.can_edit_messages }
        : {}),
      ...(options.can_pin_messages !== undefined
        ? { can_pin_messages: options.can_pin_messages }
        : {}),
      ...(options.can_manage_topics !== undefined
        ? { can_manage_topics: options.can_manage_topics }
        : {}),
      ...(options.can_post_stories !== undefined
        ? { can_post_stories: options.can_post_stories }
        : {}),
      ...(options.can_edit_stories !== undefined
        ? { can_edit_stories: options.can_edit_stories }
        : {}),
      ...(options.can_delete_stories !== undefined
        ? { can_delete_stories: options.can_delete_stories }
        : {}),
    });
  }

  async setPermissions(options: SetPermissionsOptions) {
    const targetChatId = options.chatId ?? this.options.chatId;
    if (targetChatId === undefined)
      throw new Error("Missing chat id. Use gram.withChat(chatId).setPermissions(...).");
    return this.api.setChatPermissions({
      chat_id: targetChatId,
      permissions: options.permissions,
      ...(options.independentPermissions !== undefined
        ? { use_independent_chat_permissions: options.independentPermissions }
        : {}),
    });
  }

  async setAdminTitle(options: SetCustomTitleOptions) {
    const targetChatId = options.chatId ?? this.options.chatId;
    if (targetChatId === undefined)
      throw new Error("Missing chat id. Use gram.withChat(chatId).setAdminTitle(...).");
    return this.api.setChatAdministratorCustomTitle({
      chat_id: targetChatId,
      user_id: options.userId,
      custom_title: options.customTitle,
    });
  }

  async pin(messageId: number, chatId?: number | string): Promise<unknown>;
  async pin(options: PinOptions): Promise<unknown>;
  async pin(messageIdOrOptions: number | PinOptions, chatId?: number | string) {
    const normalized: PinOptions =
      typeof messageIdOrOptions === "number"
        ? { messageId: messageIdOrOptions, chatId }
        : messageIdOrOptions;
    const targetChatId = normalized.chatId ?? this.options.chatId;
    if (targetChatId === undefined) {
      throw new Error("Missing chat id. Use gram.withChat(chatId).pin(...).");
    }
    return this.api.pinChatMessage({
      chat_id: targetChatId,
      message_id: normalized.messageId,
      ...(normalized.silent !== undefined ? { disable_notification: normalized.silent } : {}),
    });
  }

  async unpin(messageId?: number, chatId?: number | string): Promise<unknown>;
  async unpin(options: UnpinOptions): Promise<unknown>;
  async unpin(messageIdOrOptions?: number | UnpinOptions, chatId?: number | string) {
    const normalized: UnpinOptions =
      typeof messageIdOrOptions === "number" || messageIdOrOptions === undefined
        ? { messageId: messageIdOrOptions, chatId }
        : messageIdOrOptions;
    const targetChatId = normalized.chatId ?? this.options.chatId;
    if (targetChatId === undefined) {
      throw new Error("Missing chat id. Use gram.withChat(chatId).unpin(...).");
    }
    return this.api.unpinChatMessage({
      chat_id: targetChatId,
      ...(normalized.messageId !== undefined ? { message_id: normalized.messageId } : {}),
    });
  }

  async unpinAll(chatId?: number | string) {
    const targetChatId = chatId ?? this.options.chatId;
    if (targetChatId === undefined) {
      throw new Error("Missing chat id. Use gram.withChat(chatId).unpinAll().");
    }
    return this.api.unpinAllChatMessages({ chat_id: targetChatId });
  }

  async getMember(userId: number, chatId?: number | string): Promise<ChatMember>;
  async getMember(options: MemberLookupOptions): Promise<ChatMember>;
  async getMember(userIdOrOptions: number | MemberLookupOptions, chatId?: number | string) {
    const normalized: MemberLookupOptions =
      typeof userIdOrOptions === "number" ? { userId: userIdOrOptions, chatId } : userIdOrOptions;
    const targetChatId = normalized.chatId ?? this.options.chatId;
    if (targetChatId === undefined) {
      throw new Error("Missing chat id. Use gram.withChat(chatId).getMember(...).");
    }
    return this.api.getChatMember({ chat_id: targetChatId, user_id: normalized.userId });
  }

  async getAdmins(chatId?: number | string): Promise<ChatMember[]> {
    const targetChatId = chatId ?? this.options.chatId;
    if (targetChatId === undefined) {
      throw new Error("Missing chat id. Use gram.withChat(chatId).getAdmins().");
    }
    return this.api.getChatAdministrators({ chat_id: targetChatId });
  }

  async getMemberCount(chatId?: number | string): Promise<number> {
    const targetChatId = chatId ?? this.options.chatId;
    if (targetChatId === undefined) {
      throw new Error("Missing chat id. Use gram.withChat(chatId).getMemberCount().");
    }
    return this.api.getChatMemberCount({ chat_id: targetChatId });
  }

  async createTopic(options: ForumTopicCreateOptions): Promise<ForumTopic> {
    const targetChatId = options.chatId ?? this.options.chatId;
    if (targetChatId === undefined) {
      throw new Error("Missing chat id. Use gram.withChat(chatId).createTopic(...).");
    }
    return this.api.createForumTopic({
      chat_id: targetChatId,
      name: options.name,
      ...(options.iconColor !== undefined ? { icon_color: options.iconColor } : {}),
      ...(options.iconCustomEmojiId !== undefined
        ? { icon_custom_emoji_id: options.iconCustomEmojiId }
        : {}),
    });
  }

  async editTopic(options: ForumTopicEditOptions) {
    const targetChatId = options.chatId ?? this.options.chatId;
    if (targetChatId === undefined) {
      throw new Error("Missing chat id. Use gram.withChat(chatId).editTopic(...).");
    }
    return this.api.editForumTopic({
      chat_id: targetChatId,
      message_thread_id: options.messageThreadId,
      ...(options.name !== undefined ? { name: options.name } : {}),
      ...(options.iconCustomEmojiId !== undefined
        ? { icon_custom_emoji_id: options.iconCustomEmojiId }
        : {}),
    });
  }

  async closeTopic(options: ForumTopicRefOptions) {
    const targetChatId = options.chatId ?? this.options.chatId;
    if (targetChatId === undefined) {
      throw new Error("Missing chat id. Use gram.withChat(chatId).closeTopic(...).");
    }
    return this.api.closeForumTopic({
      chat_id: targetChatId,
      message_thread_id: options.messageThreadId,
    });
  }

  async reopenTopic(options: ForumTopicRefOptions) {
    const targetChatId = options.chatId ?? this.options.chatId;
    if (targetChatId === undefined) {
      throw new Error("Missing chat id. Use gram.withChat(chatId).reopenTopic(...).");
    }
    return this.api.reopenForumTopic({
      chat_id: targetChatId,
      message_thread_id: options.messageThreadId,
    });
  }

  async deleteTopic(options: ForumTopicRefOptions) {
    const targetChatId = options.chatId ?? this.options.chatId;
    if (targetChatId === undefined) {
      throw new Error("Missing chat id. Use gram.withChat(chatId).deleteTopic(...).");
    }
    return this.api.deleteForumTopic({
      chat_id: targetChatId,
      message_thread_id: options.messageThreadId,
    });
  }

  async setMyCommands(options: SetMyCommandsOptions) {
    return this.api.setMyCommands({
      commands: options.commands,
      ...(options.scope ? { scope: options.scope } : {}),
      ...(options.languageCode ? { language_code: options.languageCode } : {}),
    });
  }

  async getMyCommands(options: GetMyCommandsOptions = {}) {
    return this.api.getMyCommands({
      ...(options.scope ? { scope: options.scope } : {}),
      ...(options.languageCode ? { language_code: options.languageCode } : {}),
    });
  }

  async deleteMyCommands(options: DeleteMyCommandsOptions = {}) {
    return this.api.deleteMyCommands({
      ...(options.scope ? { scope: options.scope } : {}),
      ...(options.languageCode ? { language_code: options.languageCode } : {}),
    });
  }

  async setMenuButton(options: SetMenuButtonOptions = {}) {
    return this.api.setChatMenuButton({
      ...(options.chatId !== undefined ? { chat_id: options.chatId } : {}),
      ...(options.menuButton !== undefined ? { menu_button: options.menuButton } : {}),
    });
  }

  async getMenuButton(chatId?: number | string) {
    return this.api.getChatMenuButton({
      ...(chatId !== undefined ? { chat_id: chatId } : {}),
    });
  }

  async setMyName(options: SetMyNameOptions = {}) {
    return this.api.setMyName({
      ...(options.name !== undefined ? { name: options.name } : {}),
      ...(options.languageCode ? { language_code: options.languageCode } : {}),
    });
  }

  async getMyName(languageCode?: string) {
    return this.api.getMyName({ ...(languageCode ? { language_code: languageCode } : {}) });
  }

  async setMyDescription(options: SetMyDescriptionOptions = {}) {
    return this.api.setMyDescription({
      ...(options.description !== undefined ? { description: options.description } : {}),
      ...(options.languageCode ? { language_code: options.languageCode } : {}),
    });
  }

  async getMyDescription(languageCode?: string) {
    return this.api.getMyDescription({
      ...(languageCode ? { language_code: languageCode } : {}),
    });
  }

  async setMyShortDescription(options: SetMyShortDescriptionOptions = {}) {
    return this.api.setMyShortDescription({
      ...(options.shortDescription !== undefined
        ? { short_description: options.shortDescription }
        : {}),
      ...(options.languageCode ? { language_code: options.languageCode } : {}),
    });
  }

  async getMyShortDescription(languageCode?: string) {
    return this.api.getMyShortDescription({
      ...(languageCode ? { language_code: languageCode } : {}),
    });
  }

  async sendInvoice(options: SendInvoiceOptions) {
    const targetChatId = options.chatId ?? this.options.chatId;
    if (targetChatId === undefined)
      throw new Error("Missing chat id. Use gram.withChat(chatId).sendInvoice(...).");
    return this.api.sendInvoice({
      chat_id: targetChatId,
      title: options.title,
      description: options.description,
      payload: options.payload,
      currency: options.currency,
      prices: options.prices,
      ...(options.providerToken !== undefined ? { provider_token: options.providerToken } : {}),
      ...(options.maxTipAmount !== undefined ? { max_tip_amount: options.maxTipAmount } : {}),
      ...(options.suggestedTipAmounts !== undefined
        ? { suggested_tip_amounts: options.suggestedTipAmounts }
        : {}),
      ...(options.startParameter !== undefined ? { start_parameter: options.startParameter } : {}),
      ...(options.providerData !== undefined ? { provider_data: options.providerData } : {}),
      ...(options.photoUrl !== undefined ? { photo_url: options.photoUrl } : {}),
      ...(options.photoSize !== undefined ? { photo_size: options.photoSize } : {}),
      ...(options.photoWidth !== undefined ? { photo_width: options.photoWidth } : {}),
      ...(options.photoHeight !== undefined ? { photo_height: options.photoHeight } : {}),
      ...(options.needName !== undefined ? { need_name: options.needName } : {}),
      ...(options.needPhoneNumber !== undefined
        ? { need_phone_number: options.needPhoneNumber }
        : {}),
      ...(options.needEmail !== undefined ? { need_email: options.needEmail } : {}),
      ...(options.needShippingAddress !== undefined
        ? { need_shipping_address: options.needShippingAddress }
        : {}),
      ...(options.sendPhoneNumberToProvider !== undefined
        ? { send_phone_number_to_provider: options.sendPhoneNumberToProvider }
        : {}),
      ...(options.sendEmailToProvider !== undefined
        ? { send_email_to_provider: options.sendEmailToProvider }
        : {}),
      ...(options.isFlexible !== undefined ? { is_flexible: options.isFlexible } : {}),
      ...(options.silent !== undefined ? { disable_notification: options.silent } : {}),
      ...(options.protect !== undefined ? { protect_content: options.protect } : {}),
      ...(options.replyTo !== undefined ? { reply_to_message_id: options.replyTo } : {}),
      ...(options.replyMarkup ? { reply_markup: options.replyMarkup } : {}),
    });
  }

  async createInvoiceLink(options: CreateInvoiceLinkOptions): Promise<string> {
    return this.api.createInvoiceLink({
      title: options.title,
      description: options.description,
      payload: options.payload,
      currency: options.currency,
      prices: options.prices,
      ...(options.providerToken !== undefined ? { provider_token: options.providerToken } : {}),
      ...(options.maxTipAmount !== undefined ? { max_tip_amount: options.maxTipAmount } : {}),
      ...(options.suggestedTipAmounts !== undefined
        ? { suggested_tip_amounts: options.suggestedTipAmounts }
        : {}),
      ...(options.providerData !== undefined ? { provider_data: options.providerData } : {}),
      ...(options.photoUrl !== undefined ? { photo_url: options.photoUrl } : {}),
      ...(options.photoSize !== undefined ? { photo_size: options.photoSize } : {}),
      ...(options.photoWidth !== undefined ? { photo_width: options.photoWidth } : {}),
      ...(options.photoHeight !== undefined ? { photo_height: options.photoHeight } : {}),
      ...(options.needName !== undefined ? { need_name: options.needName } : {}),
      ...(options.needPhoneNumber !== undefined
        ? { need_phone_number: options.needPhoneNumber }
        : {}),
      ...(options.needEmail !== undefined ? { need_email: options.needEmail } : {}),
      ...(options.needShippingAddress !== undefined
        ? { need_shipping_address: options.needShippingAddress }
        : {}),
      ...(options.sendPhoneNumberToProvider !== undefined
        ? { send_phone_number_to_provider: options.sendPhoneNumberToProvider }
        : {}),
      ...(options.sendEmailToProvider !== undefined
        ? { send_email_to_provider: options.sendEmailToProvider }
        : {}),
      ...(options.isFlexible !== undefined ? { is_flexible: options.isFlexible } : {}),
    });
  }

  async answerShippingQuery(options: AnswerShippingQueryOptions) {
    return this.api.answerShippingQuery({
      shipping_query_id: options.shippingQueryId,
      ok: options.ok,
      ...(options.shippingOptions !== undefined
        ? { shipping_options: options.shippingOptions }
        : {}),
      ...(options.errorMessage !== undefined ? { error_message: options.errorMessage } : {}),
    });
  }

  async answerPreCheckoutQuery(options: AnswerPreCheckoutQueryOptions) {
    return this.api.answerPreCheckoutQuery({
      pre_checkout_query_id: options.preCheckoutQueryId,
      ok: options.ok,
      ...(options.errorMessage !== undefined ? { error_message: options.errorMessage } : {}),
    });
  }

  async refundStarPayment(userId: number, telegramPaymentChargeId: string) {
    return this.api.refundStarPayment({
      user_id: userId,
      telegram_payment_charge_id: telegramPaymentChargeId,
    });
  }

  async getMyStarBalance(): Promise<StarAmount> {
    return this.api.getMyStarBalance();
  }

  async getStarTransactions(options: GetStarTransactionsOptions = {}): Promise<StarTransactions> {
    return this.api.getStarTransactions({
      ...(options.offset !== undefined ? { offset: options.offset } : {}),
      ...(options.limit !== undefined ? { limit: options.limit } : {}),
    });
  }

  async editUserStarSubscription(options: EditUserStarSubscriptionOptions) {
    return this.api.editUserStarSubscription({
      user_id: options.userId,
      telegram_payment_charge_id: options.telegramPaymentChargeId,
      is_canceled: options.isCanceled,
    });
  }

  async sendChatAction(options: SendChatActionOptions) {
    const targetChatId = options.chatId ?? this.options.chatId;
    if (targetChatId === undefined)
      throw new Error("Missing chat id. Use gram.withChat(chatId).sendChatAction(...).");
    return this.api.sendChatAction({
      chat_id: targetChatId,
      action: options.action,
      ...(options.messageThreadId !== undefined
        ? { message_thread_id: options.messageThreadId }
        : {}),
      ...(options.businessConnectionId !== undefined
        ? { business_connection_id: options.businessConnectionId }
        : {}),
    });
  }

  async getChat(chatId?: number | string): Promise<ChatFull> {
    const targetChatId = chatId ?? this.options.chatId;
    if (targetChatId === undefined)
      throw new Error("Missing chat id. Use gram.withChat(chatId).getChat().");
    return this.api.getChat({ chat_id: targetChatId });
  }

  async leaveChat(chatId?: number | string) {
    const targetChatId = chatId ?? this.options.chatId;
    if (targetChatId === undefined)
      throw new Error("Missing chat id. Use gram.withChat(chatId).leaveChat().");
    return this.api.leaveChat({ chat_id: targetChatId });
  }

  async exportInviteLink(chatId?: number | string): Promise<string> {
    const targetChatId = chatId ?? this.options.chatId;
    if (targetChatId === undefined)
      throw new Error("Missing chat id. Use gram.withChat(chatId).exportInviteLink().");
    return this.api.exportChatInviteLink({ chat_id: targetChatId });
  }

  async createInviteLink(options: CreateInviteLinkOptions = {}): Promise<ChatInviteLink> {
    const targetChatId = options.chatId ?? this.options.chatId;
    if (targetChatId === undefined)
      throw new Error("Missing chat id. Use gram.withChat(chatId).createInviteLink(...).");
    return this.api.createChatInviteLink({
      chat_id: targetChatId,
      ...(options.name !== undefined ? { name: options.name } : {}),
      ...(options.expireDate !== undefined ? { expire_date: options.expireDate } : {}),
      ...(options.memberLimit !== undefined ? { member_limit: options.memberLimit } : {}),
      ...(options.createsJoinRequest !== undefined
        ? { creates_join_request: options.createsJoinRequest }
        : {}),
    });
  }

  async approveJoinRequest(userId: number, chatId?: number | string): Promise<unknown>;
  async approveJoinRequest(options: JoinRequestUserOptions): Promise<unknown>;
  async approveJoinRequest(
    userIdOrOptions: number | JoinRequestUserOptions,
    chatId?: number | string,
  ) {
    const normalized: JoinRequestUserOptions =
      typeof userIdOrOptions === "number" ? { userId: userIdOrOptions, chatId } : userIdOrOptions;
    const targetChatId = normalized.chatId ?? this.options.chatId;
    if (targetChatId === undefined) {
      throw new Error("Missing chat id. Use gram.withChat(chatId).approveJoinRequest(...).");
    }
    return this.api.approveChatJoinRequest({
      chat_id: targetChatId,
      user_id: normalized.userId,
    });
  }

  async declineJoinRequest(userId: number, chatId?: number | string): Promise<unknown>;
  async declineJoinRequest(options: JoinRequestUserOptions): Promise<unknown>;
  async declineJoinRequest(
    userIdOrOptions: number | JoinRequestUserOptions,
    chatId?: number | string,
  ) {
    const normalized: JoinRequestUserOptions =
      typeof userIdOrOptions === "number" ? { userId: userIdOrOptions, chatId } : userIdOrOptions;
    const targetChatId = normalized.chatId ?? this.options.chatId;
    if (targetChatId === undefined) {
      throw new Error("Missing chat id. Use gram.withChat(chatId).declineJoinRequest(...).");
    }
    return this.api.declineChatJoinRequest({
      chat_id: targetChatId,
      user_id: normalized.userId,
    });
  }

  async setMessageReaction(options: SetMessageReactionOptions) {
    const targetChatId = options.chatId ?? this.options.chatId;
    if (targetChatId === undefined) {
      throw new Error("Missing chat id. Use gram.withChat(chatId).setMessageReaction(...).");
    }
    return this.api.setMessageReaction({
      chat_id: targetChatId,
      message_id: options.messageId,
      reaction: options.reaction,
      ...(options.isBig !== undefined ? { is_big: options.isBig } : {}),
    });
  }

  async location(latitude: number, longitude: number, chatId?: number | string): Promise<unknown>;
  async location(options: SendLocationOptions): Promise<unknown>;
  async location(
    latOrOptions: number | SendLocationOptions,
    longitude?: number,
    chatId?: number | string,
  ) {
    const normalized: SendLocationOptions =
      typeof latOrOptions === "number"
        ? { latitude: latOrOptions, longitude: longitude as number, chatId }
        : latOrOptions;
    const targetChatId = normalized.chatId ?? this.options.chatId;
    if (targetChatId === undefined) {
      throw new Error("Missing chat id. Use gram.withChat(chatId).location(...).");
    }
    return this.api.sendLocation({
      chat_id: targetChatId,
      latitude: normalized.latitude,
      longitude: normalized.longitude,
      ...(normalized.horizontalAccuracy !== undefined
        ? { horizontal_accuracy: normalized.horizontalAccuracy }
        : {}),
      ...(normalized.livePeriod !== undefined ? { live_period: normalized.livePeriod } : {}),
      ...(normalized.heading !== undefined ? { heading: normalized.heading } : {}),
      ...(normalized.proximityAlertRadius !== undefined
        ? { proximity_alert_radius: normalized.proximityAlertRadius }
        : {}),
      ...(normalized.silent !== undefined ? { disable_notification: normalized.silent } : {}),
      ...(normalized.protect !== undefined ? { protect_content: normalized.protect } : {}),
      ...(normalized.replyTo !== undefined ? { reply_to_message_id: normalized.replyTo } : {}),
      ...(normalized.replyMarkup ? { reply_markup: normalized.replyMarkup } : {}),
      ...(normalized.messageThreadId !== undefined
        ? { message_thread_id: normalized.messageThreadId }
        : {}),
      ...(normalized.businessConnectionId !== undefined
        ? { business_connection_id: normalized.businessConnectionId }
        : {}),
    });
  }

  async venue(options: SendVenueOptions) {
    GramClient.assertLen(options.title, 64, "title");
    GramClient.assertLen(options.address, 64, "address");
    const targetChatId = options.chatId ?? this.options.chatId;
    if (targetChatId === undefined) {
      throw new Error("Missing chat id. Use gram.withChat(chatId).venue(...).");
    }
    return this.api.sendVenue({
      chat_id: targetChatId,
      latitude: options.latitude,
      longitude: options.longitude,
      title: options.title,
      address: options.address,
      ...(options.foursquareId !== undefined ? { foursquare_id: options.foursquareId } : {}),
      ...(options.foursquareType !== undefined ? { foursquare_type: options.foursquareType } : {}),
      ...(options.googlePlaceId !== undefined ? { google_place_id: options.googlePlaceId } : {}),
      ...(options.googlePlaceType !== undefined
        ? { google_place_type: options.googlePlaceType }
        : {}),
      ...(options.silent !== undefined ? { disable_notification: options.silent } : {}),
      ...(options.protect !== undefined ? { protect_content: options.protect } : {}),
      ...(options.replyTo !== undefined ? { reply_to_message_id: options.replyTo } : {}),
      ...(options.replyMarkup ? { reply_markup: options.replyMarkup } : {}),
      ...(options.messageThreadId !== undefined
        ? { message_thread_id: options.messageThreadId }
        : {}),
      ...(options.businessConnectionId !== undefined
        ? { business_connection_id: options.businessConnectionId }
        : {}),
    });
  }

  async contact(phoneNumber: string, firstName: string, chatId?: number | string): Promise<unknown>;
  async contact(options: SendContactOptions): Promise<unknown>;
  async contact(
    phoneOrOptions: string | SendContactOptions,
    firstName?: string,
    chatId?: number | string,
  ) {
    const normalized: SendContactOptions =
      typeof phoneOrOptions === "string"
        ? { phoneNumber: phoneOrOptions, firstName: firstName as string, chatId }
        : phoneOrOptions;
    GramClient.assertLen(normalized.firstName, 64, "firstName");
    GramClient.assertLen(normalized.lastName, 64, "lastName");
    GramClient.assertLen(normalized.vcard, 2048, "vcard");
    const targetChatId = normalized.chatId ?? this.options.chatId;
    if (targetChatId === undefined) {
      throw new Error("Missing chat id. Use gram.withChat(chatId).contact(...).");
    }
    return this.api.sendContact({
      chat_id: targetChatId,
      phone_number: normalized.phoneNumber,
      first_name: normalized.firstName,
      ...(normalized.lastName !== undefined ? { last_name: normalized.lastName } : {}),
      ...(normalized.vcard !== undefined ? { vcard: normalized.vcard } : {}),
      ...(normalized.silent !== undefined ? { disable_notification: normalized.silent } : {}),
      ...(normalized.protect !== undefined ? { protect_content: normalized.protect } : {}),
      ...(normalized.replyTo !== undefined ? { reply_to_message_id: normalized.replyTo } : {}),
      ...(normalized.replyMarkup ? { reply_markup: normalized.replyMarkup } : {}),
      ...(normalized.messageThreadId !== undefined
        ? { message_thread_id: normalized.messageThreadId }
        : {}),
      ...(normalized.businessConnectionId !== undefined
        ? { business_connection_id: normalized.businessConnectionId }
        : {}),
    });
  }

  async dice(emoji?: string, chatId?: number | string): Promise<unknown>;
  async dice(options: SendDiceOptions): Promise<unknown>;
  async dice(emojiOrOptions?: string | SendDiceOptions, chatId?: number | string) {
    const normalized: SendDiceOptions =
      typeof emojiOrOptions === "string" || emojiOrOptions === undefined
        ? { emoji: emojiOrOptions, chatId }
        : emojiOrOptions;
    const targetChatId = normalized.chatId ?? this.options.chatId;
    if (targetChatId === undefined) {
      throw new Error("Missing chat id. Use gram.withChat(chatId).dice(...).");
    }
    return this.api.sendDice({
      chat_id: targetChatId,
      ...(normalized.emoji !== undefined ? { emoji: normalized.emoji } : {}),
      ...(normalized.silent !== undefined ? { disable_notification: normalized.silent } : {}),
      ...(normalized.protect !== undefined ? { protect_content: normalized.protect } : {}),
      ...(normalized.replyTo !== undefined ? { reply_to_message_id: normalized.replyTo } : {}),
      ...(normalized.replyMarkup ? { reply_markup: normalized.replyMarkup } : {}),
      ...(normalized.messageThreadId !== undefined
        ? { message_thread_id: normalized.messageThreadId }
        : {}),
      ...(normalized.businessConnectionId !== undefined
        ? { business_connection_id: normalized.businessConnectionId }
        : {}),
    });
  }

  async poll(options: SendPollOptions) {
    GramClient.assertLen(options.question, 300, "question");
    GramClient.assertLen(options.explanation, 200, "explanation");
    const optCount = options.options.length;
    if (optCount < 2 || optCount > 10) {
      throw new ValidationError(`poll must have 2–10 options (got ${optCount})`, "options");
    }
    const targetChatId = options.chatId ?? this.options.chatId;
    if (targetChatId === undefined) {
      throw new Error("Missing chat id. Use gram.withChat(chatId).poll(...).");
    }
    return this.api.sendPoll({
      chat_id: targetChatId,
      question: options.question,
      options: options.options,
      ...(options.isAnonymous !== undefined ? { is_anonymous: options.isAnonymous } : {}),
      ...(options.pollType !== undefined ? { type: options.pollType } : {}),
      ...(options.allowsMultipleAnswers !== undefined
        ? { allows_multiple_answers: options.allowsMultipleAnswers }
        : {}),
      ...(options.correctOptionId !== undefined
        ? { correct_option_id: options.correctOptionId }
        : {}),
      ...(options.explanation !== undefined ? { explanation: options.explanation } : {}),
      ...(options.explanationParseMode !== undefined
        ? { explanation_parse_mode: options.explanationParseMode }
        : {}),
      ...(options.openPeriod !== undefined ? { open_period: options.openPeriod } : {}),
      ...(options.closeDate !== undefined ? { close_date: options.closeDate } : {}),
      ...(options.isClosed !== undefined ? { is_closed: options.isClosed } : {}),
      ...(options.silent !== undefined ? { disable_notification: options.silent } : {}),
      ...(options.protect !== undefined ? { protect_content: options.protect } : {}),
      ...(options.replyTo !== undefined ? { reply_to_message_id: options.replyTo } : {}),
      ...(options.replyMarkup ? { reply_markup: options.replyMarkup } : {}),
      ...(options.messageThreadId !== undefined
        ? { message_thread_id: options.messageThreadId }
        : {}),
      ...(options.businessConnectionId !== undefined
        ? { business_connection_id: options.businessConnectionId }
        : {}),
    });
  }

  async stopPoll(messageId: number, chatId?: number | string): Promise<unknown>;
  async stopPoll(options: StopPollOptions): Promise<unknown>;
  async stopPoll(messageIdOrOptions: number | StopPollOptions, chatId?: number | string) {
    const normalized: StopPollOptions =
      typeof messageIdOrOptions === "number"
        ? { messageId: messageIdOrOptions, chatId }
        : messageIdOrOptions;
    const targetChatId = normalized.chatId ?? this.options.chatId;
    if (targetChatId === undefined) {
      throw new Error("Missing chat id. Use gram.withChat(chatId).stopPoll(...).");
    }
    return this.api.stopPoll({
      chat_id: targetChatId,
      message_id: normalized.messageId,
      ...(normalized.replyMarkup ? { reply_markup: normalized.replyMarkup } : {}),
    });
  }
}
