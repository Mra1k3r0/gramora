import type { ApiClient } from "./api-client";
import type {
  ChatAdministratorRights,
  ChatPermissions,
  InlineKeyboardMarkup,
  InputFile,
  InputMedia,
  ReplyMarkup,
} from "../types/telegram";
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
}
