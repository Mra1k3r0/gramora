import type { ApiClient } from "./core/api-client";
import {
  GramClient,
  type AnimationOptions,
  type AnswerShippingQueryOptions,
  type AudioOptions,
  type BanMemberOptions,
  type CopyOptions,
  type CreateInvoiceLinkOptions,
  type DeleteMessageOptions,
  type DeleteMessagesOptions,
  type DocOptions,
  type EditCaptionOptions,
  type EditMediaOptions,
  type EditReplyMarkupOptions,
  type EditTextOptions,
  type ForwardOptions,
  type ForumTopicCreateOptions,
  type ForumTopicEditOptions,
  type ForumTopicRefOptions,
  type GetMyCommandsOptions,
  type MemberLookupOptions,
  type PinOptions,
  type PhotoOptions,
  type PromoteMemberOptions,
  type RestrictMemberOptions,
  type CreateInviteLinkOptions,
  type SendChatActionOptions,
  type SendInvoiceOptions,
  type SendOptions,
  type SetMenuButtonOptions,
  type SetMyCommandsOptions,
  type SetMyDescriptionOptions,
  type SetMyNameOptions,
  type SetMyShortDescriptionOptions,
  type StickerOptions,
  type SetCustomTitleOptions,
  type SetPermissionsOptions,
  type UnpinOptions,
  type VideoOptions,
  type VoiceOptions,
  type SendMediaGroupOptions,
  type UnbanMemberOptions,
} from "./core/gram-client";
import type { InputMediaPhoto } from "./types/api-methods";
import type { MessageForKind } from "./types/context";
import type {
  BusinessConnection,
  BusinessMessagesDeleted,
  ChatFull,
  ChatInviteLink,
  ChatJoinRequest,
  ChatMemberUpdated,
  InlineKeyboardMarkup,
  InlineQueryResult,
  InputFile,
  InputMedia,
  Message,
  MessageContentKind,
  MessageReactionCountUpdated,
  MessageReactionUpdated,
  TextMessage,
  PreCheckoutQuery,
  ReplyMarkup,
  ShippingQuery,
  Update,
} from "./types/telegram";

export interface AnswerCallbackOptions {
  text?: string;
  showAlert?: boolean;
  url?: string;
  cacheTime?: number;
}

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

/**
 * Handler context: `update` plus `gram` with optional default chat from the payload.
 * @remarks Helpers such as `answerCallback`, `forward`, and admin methods throw if the current update lacks the required ids (see each method).
 */
export class BaseContext {
  public readonly update: Update;
  public readonly api: ApiClient;
  public readonly gram: GramClient;
  public readonly message;
  public readonly callbackQuery;
  public readonly inlineQuery;
  public readonly shippingQuery: ShippingQuery | undefined;
  public readonly preCheckoutQuery: PreCheckoutQuery | undefined;
  public readonly chatMember: ChatMemberUpdated | undefined;
  public readonly myChatMember: ChatMemberUpdated | undefined;
  public readonly chatJoinRequest: ChatJoinRequest | undefined;
  public readonly messageReaction: MessageReactionUpdated | undefined;
  public readonly messageReactionCount: MessageReactionCountUpdated | undefined;
  public readonly businessConnection: BusinessConnection | undefined;
  public readonly businessMessage: Message | undefined;
  public readonly editedBusinessMessage: Message | undefined;
  public readonly deletedBusinessMessages: BusinessMessagesDeleted | undefined;
  public readonly scene: SceneControl;
  public match?: string[];

  /**
   * @param options.update - Raw Telegram update
   * @param options.api - Bot API client
   * @param options.scene - Scene control when inside a scene
   * @param options.match - Regex groups from callback patterns
   */
  constructor(options: BaseContextOptions) {
    this.update = options.update;
    this.api = options.api;
    const u = options.update;
    this.gram = new GramClient(this.api, {
      chatId:
        u.message?.chat.id ??
        u.callback_query?.message?.chat.id ??
        u.chat_member?.chat.id ??
        u.my_chat_member?.chat.id ??
        u.chat_join_request?.chat.id ??
        u.message_reaction?.chat.id ??
        u.message_reaction_count?.chat.id ??
        u.business_message?.chat.id ??
        u.edited_business_message?.chat.id ??
        u.deleted_business_messages?.chat.id,
    });
    this.message = u.message;
    this.callbackQuery = u.callback_query;
    this.inlineQuery = u.inline_query;
    this.shippingQuery = u.shipping_query;
    this.preCheckoutQuery = u.pre_checkout_query;
    this.chatMember = u.chat_member;
    this.myChatMember = u.my_chat_member;
    this.chatJoinRequest = u.chat_join_request;
    this.messageReaction = u.message_reaction;
    this.messageReactionCount = u.message_reaction_count;
    this.businessConnection = u.business_connection;
    this.businessMessage = u.business_message;
    this.editedBusinessMessage = u.edited_business_message;
    this.deletedBusinessMessages = u.deleted_business_messages;
    this.scene = options.scene ?? {
      state: {},
      enter: async () => {},
      leave: async () => {},
      next: async () => {},
    };
    this.match = options.match;
  }

  get chatId(): number | undefined {
    return (
      this.message?.chat.id ??
      this.callbackQuery?.message?.chat.id ??
      this.chatMember?.chat.id ??
      this.myChatMember?.chat.id ??
      this.chatJoinRequest?.chat.id ??
      this.messageReaction?.chat.id ??
      this.messageReactionCount?.chat.id ??
      this.businessMessage?.chat.id ??
      this.editedBusinessMessage?.chat.id ??
      this.deletedBusinessMessages?.chat.id
    );
  }
  get fromId(): number | undefined {
    return (
      this.message?.from?.id ??
      this.callbackQuery?.from.id ??
      this.inlineQuery?.from.id ??
      this.shippingQuery?.from.id ??
      this.preCheckoutQuery?.from.id ??
      this.chatMember?.from.id ??
      this.myChatMember?.from.id ??
      this.chatJoinRequest?.from.id ??
      this.messageReaction?.user?.id ??
      this.businessConnection?.user.id
    );
  }
  get text(): string | undefined {
    const m = this.message ?? this.businessMessage ?? this.editedBusinessMessage;
    return m && "text" in m ? (m as TextMessage).text : undefined;
  }

  async reply(text: string, replyMarkup?: ReplyMarkup): Promise<unknown>;
  async reply(options: SendOptions): Promise<unknown>;
  async reply(textOrOptions: string | SendOptions, replyMarkup?: ReplyMarkup) {
    const replyTo =
      this.message?.message_id ??
      this.businessMessage?.message_id ??
      this.editedBusinessMessage?.message_id;
    if (typeof textOrOptions === "string") {
      return this.gram.send({
        text: textOrOptions,
        replyMarkup,
        ...(replyTo !== undefined ? { replyTo } : {}),
      });
    }
    return this.gram.send({
      ...textOrOptions,
      replyTo: textOrOptions.replyTo ?? replyTo,
    });
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

  async editText(
    text: string,
    messageId?: number,
    replyMarkup?: InlineKeyboardMarkup,
  ): Promise<unknown>;
  async editText(options: EditTextOptions): Promise<unknown>;
  async editText(
    textOrOptions: string | EditTextOptions,
    messageId?: number,
    replyMarkup?: InlineKeyboardMarkup,
  ) {
    if (typeof textOrOptions === "string") {
      const resolvedId = messageId ?? this.callbackQuery?.message?.message_id;
      return this.gram.editText({ text: textOrOptions, messageId: resolvedId, replyMarkup });
    }
    if (textOrOptions.messageId === undefined && !textOrOptions.inlineMessageId) {
      textOrOptions.messageId = this.callbackQuery?.message?.message_id;
    }
    return this.gram.editText(textOrOptions);
  }

  async editCaption(caption: string, messageId?: number): Promise<unknown>;
  async editCaption(options: EditCaptionOptions): Promise<unknown>;
  async editCaption(captionOrOptions: string | EditCaptionOptions, messageId?: number) {
    if (typeof captionOrOptions === "string") {
      const resolvedId = messageId ?? this.callbackQuery?.message?.message_id;
      return this.gram.editCaption({ caption: captionOrOptions, messageId: resolvedId });
    }
    if (captionOrOptions.messageId === undefined && !captionOrOptions.inlineMessageId) {
      captionOrOptions.messageId = this.callbackQuery?.message?.message_id;
    }
    return this.gram.editCaption(captionOrOptions);
  }

  async editReplyMarkup(replyMarkup: InlineKeyboardMarkup, messageId?: number): Promise<unknown>;
  async editReplyMarkup(options: EditReplyMarkupOptions): Promise<unknown>;
  async editReplyMarkup(
    markupOrOptions: InlineKeyboardMarkup | EditReplyMarkupOptions,
    messageId?: number,
  ) {
    if ("inline_keyboard" in markupOrOptions) {
      const resolvedId = messageId ?? this.callbackQuery?.message?.message_id;
      return this.gram.editReplyMarkup({ replyMarkup: markupOrOptions, messageId: resolvedId });
    }
    if (markupOrOptions.messageId === undefined && !markupOrOptions.inlineMessageId) {
      markupOrOptions.messageId = this.callbackQuery?.message?.message_id;
    }
    return this.gram.editReplyMarkup(markupOrOptions);
  }

  async editMedia(media: InputMedia, messageId?: number): Promise<unknown>;
  async editMedia(options: EditMediaOptions): Promise<unknown>;
  async editMedia(mediaOrOptions: InputMedia | EditMediaOptions, messageId?: number) {
    if ("type" in mediaOrOptions) {
      const resolvedId = messageId ?? this.callbackQuery?.message?.message_id;
      return this.gram.editMedia({ media: mediaOrOptions, messageId: resolvedId });
    }
    if (mediaOrOptions.messageId === undefined && !mediaOrOptions.inlineMessageId) {
      mediaOrOptions.messageId = this.callbackQuery?.message?.message_id;
    }
    return this.gram.editMedia(mediaOrOptions);
  }

  async deleteMessage(messageId?: number): Promise<unknown>;
  async deleteMessage(options: DeleteMessageOptions): Promise<unknown>;
  async deleteMessage(messageIdOrOptions?: number | DeleteMessageOptions) {
    if (typeof messageIdOrOptions === "number" || messageIdOrOptions === undefined) {
      const resolvedId = messageIdOrOptions ?? this.message?.message_id;
      if (resolvedId === undefined) throw new Error("No message_id available in current context");
      return this.gram.deleteMessage(resolvedId);
    }
    return this.gram.deleteMessage(messageIdOrOptions);
  }

  async deleteMessages(messageIds: number[]): Promise<unknown>;
  async deleteMessages(options: DeleteMessagesOptions): Promise<unknown>;
  async deleteMessages(messageIdsOrOptions: number[] | DeleteMessagesOptions) {
    if (Array.isArray(messageIdsOrOptions)) {
      return this.gram.deleteMessages(messageIdsOrOptions);
    }
    return this.gram.deleteMessages(messageIdsOrOptions);
  }

  async forward(toChatId: number | string, messageId?: number): Promise<unknown>;
  async forward(options: ForwardOptions): Promise<unknown>;
  async forward(toChatIdOrOptions: number | string | ForwardOptions, messageId?: number) {
    if (typeof toChatIdOrOptions === "number" || typeof toChatIdOrOptions === "string") {
      const resolvedId = messageId ?? this.message?.message_id;
      if (resolvedId === undefined) throw new Error("No message_id available in current context");
      const fromChatId = this.chatId;
      if (fromChatId === undefined) throw new Error("No chat_id available in current context");
      return this.gram.forward({
        chatId: toChatIdOrOptions,
        fromChatId,
        messageId: resolvedId,
      });
    }
    return this.gram.forward(toChatIdOrOptions);
  }

  async copy(toChatId: number | string, messageId?: number): Promise<unknown>;
  async copy(options: CopyOptions): Promise<unknown>;
  async copy(toChatIdOrOptions: number | string | CopyOptions, messageId?: number) {
    if (typeof toChatIdOrOptions === "number" || typeof toChatIdOrOptions === "string") {
      const resolvedId = messageId ?? this.message?.message_id;
      if (resolvedId === undefined) throw new Error("No message_id available in current context");
      const fromChatId = this.chatId;
      if (fromChatId === undefined) throw new Error("No chat_id available in current context");
      return this.gram.copy({
        chatId: toChatIdOrOptions,
        fromChatId,
        messageId: resolvedId,
      });
    }
    return this.gram.copy(toChatIdOrOptions);
  }

  async pin(messageId: number): Promise<unknown>;
  async pin(options: PinOptions): Promise<unknown>;
  async pin(messageIdOrOptions: number | PinOptions) {
    if (typeof messageIdOrOptions === "number") return this.gram.pin(messageIdOrOptions);
    return this.gram.pin(messageIdOrOptions);
  }

  async unpin(messageId?: number): Promise<unknown>;
  async unpin(options: UnpinOptions): Promise<unknown>;
  async unpin(messageIdOrOptions?: number | UnpinOptions) {
    if (typeof messageIdOrOptions === "number" || messageIdOrOptions === undefined) {
      return this.gram.unpin(messageIdOrOptions);
    }
    return this.gram.unpin(messageIdOrOptions);
  }

  async unpinAll(): Promise<unknown> {
    return this.gram.unpinAll();
  }

  async getMember(userId?: number): Promise<unknown>;
  async getMember(options: MemberLookupOptions): Promise<unknown>;
  async getMember(userIdOrOptions?: number | MemberLookupOptions) {
    if (typeof userIdOrOptions === "number" || userIdOrOptions === undefined) {
      const resolvedUserId = userIdOrOptions ?? this.fromId;
      if (resolvedUserId === undefined) throw new Error("No user_id available in current context");
      return this.gram.getMember(resolvedUserId);
    }
    return this.gram.getMember(userIdOrOptions);
  }

  async getAdmins(): Promise<unknown> {
    return this.gram.getAdmins();
  }

  async getMemberCount(): Promise<unknown> {
    return this.gram.getMemberCount();
  }

  async createTopic(name: string): Promise<unknown>;
  async createTopic(options: ForumTopicCreateOptions): Promise<unknown>;
  async createTopic(nameOrOptions: string | ForumTopicCreateOptions) {
    if (typeof nameOrOptions === "string") return this.gram.createTopic({ name: nameOrOptions });
    return this.gram.createTopic(nameOrOptions);
  }

  async editTopic(options: ForumTopicEditOptions): Promise<unknown> {
    return this.gram.editTopic(options);
  }

  async closeTopic(messageThreadId: number): Promise<unknown>;
  async closeTopic(options: ForumTopicRefOptions): Promise<unknown>;
  async closeTopic(idOrOptions: number | ForumTopicRefOptions) {
    if (typeof idOrOptions === "number")
      return this.gram.closeTopic({ messageThreadId: idOrOptions });
    return this.gram.closeTopic(idOrOptions);
  }

  async reopenTopic(messageThreadId: number): Promise<unknown>;
  async reopenTopic(options: ForumTopicRefOptions): Promise<unknown>;
  async reopenTopic(idOrOptions: number | ForumTopicRefOptions) {
    if (typeof idOrOptions === "number")
      return this.gram.reopenTopic({ messageThreadId: idOrOptions });
    return this.gram.reopenTopic(idOrOptions);
  }

  async deleteTopic(messageThreadId: number): Promise<unknown>;
  async deleteTopic(options: ForumTopicRefOptions): Promise<unknown>;
  async deleteTopic(idOrOptions: number | ForumTopicRefOptions) {
    if (typeof idOrOptions === "number")
      return this.gram.deleteTopic({ messageThreadId: idOrOptions });
    return this.gram.deleteTopic(idOrOptions);
  }

  async setMyCommands(options: SetMyCommandsOptions): Promise<unknown> {
    return this.gram.setMyCommands(options);
  }

  async getMyCommands(options?: GetMyCommandsOptions): Promise<unknown> {
    return this.gram.getMyCommands(options ?? {});
  }

  async deleteMyCommands(options?: GetMyCommandsOptions): Promise<unknown> {
    return this.gram.deleteMyCommands(options ?? {});
  }

  async setMenuButton(options?: SetMenuButtonOptions): Promise<unknown> {
    return this.gram.setMenuButton(options ?? {});
  }

  async getMenuButton(chatId?: number | string): Promise<unknown> {
    return this.gram.getMenuButton(chatId);
  }

  async setMyName(options?: SetMyNameOptions): Promise<unknown> {
    return this.gram.setMyName(options ?? {});
  }

  async getMyName(languageCode?: string): Promise<unknown> {
    return this.gram.getMyName(languageCode);
  }

  async setMyDescription(options?: SetMyDescriptionOptions): Promise<unknown> {
    return this.gram.setMyDescription(options ?? {});
  }

  async getMyDescription(languageCode?: string): Promise<unknown> {
    return this.gram.getMyDescription(languageCode);
  }

  async setMyShortDescription(options?: SetMyShortDescriptionOptions): Promise<unknown> {
    return this.gram.setMyShortDescription(options ?? {});
  }

  async getMyShortDescription(languageCode?: string): Promise<unknown> {
    return this.gram.getMyShortDescription(languageCode);
  }

  async banMember(userId?: number): Promise<unknown>;
  async banMember(options: BanMemberOptions): Promise<unknown>;
  async banMember(userIdOrOptions?: number | BanMemberOptions) {
    if (typeof userIdOrOptions === "number" || userIdOrOptions === undefined) {
      const resolvedUserId = userIdOrOptions ?? this.fromId;
      if (resolvedUserId === undefined) throw new Error("No user_id available in current context");
      return this.gram.banMember(resolvedUserId);
    }
    return this.gram.banMember(userIdOrOptions);
  }

  async unbanMember(userId: number): Promise<unknown>;
  async unbanMember(options: UnbanMemberOptions): Promise<unknown>;
  async unbanMember(userIdOrOptions: number | UnbanMemberOptions) {
    if (typeof userIdOrOptions === "number") {
      return this.gram.unbanMember(userIdOrOptions);
    }
    return this.gram.unbanMember(userIdOrOptions);
  }

  async restrictMember(
    permissions: SetPermissionsOptions["permissions"],
    userId?: number,
  ): Promise<unknown>;
  async restrictMember(options: RestrictMemberOptions): Promise<unknown>;
  async restrictMember(
    permissionsOrOptions: SetPermissionsOptions["permissions"] | RestrictMemberOptions,
    userId?: number,
  ) {
    if (!("permissions" in permissionsOrOptions)) {
      const resolvedUserId = userId ?? this.fromId;
      if (resolvedUserId === undefined) throw new Error("No user_id available in current context");
      return this.gram.restrictMember({
        userId: resolvedUserId,
        permissions: permissionsOrOptions,
      });
    }
    return this.gram.restrictMember(permissionsOrOptions);
  }

  async promoteMember(options: PromoteMemberOptions): Promise<unknown>;
  async promoteMember(
    userId: number,
    rights?: Omit<PromoteMemberOptions, "userId" | "chatId">,
  ): Promise<unknown>;
  async promoteMember(
    optionsOrUserId: PromoteMemberOptions | number,
    rights?: Omit<PromoteMemberOptions, "userId" | "chatId">,
  ) {
    if (typeof optionsOrUserId === "number") {
      return this.gram.promoteMember({ userId: optionsOrUserId, ...(rights ?? {}) });
    }
    return this.gram.promoteMember(optionsOrUserId);
  }

  async setPermissions(options: SetPermissionsOptions): Promise<unknown>;
  async setPermissions(permissions: SetPermissionsOptions["permissions"]): Promise<unknown>;
  async setPermissions(
    optionsOrPermissions: SetPermissionsOptions | SetPermissionsOptions["permissions"],
  ) {
    if ("permissions" in optionsOrPermissions) {
      return this.gram.setPermissions(optionsOrPermissions);
    }
    return this.gram.setPermissions({ permissions: optionsOrPermissions });
  }

  async setAdminTitle(customTitle: string, userId?: number): Promise<unknown>;
  async setAdminTitle(options: SetCustomTitleOptions): Promise<unknown>;
  async setAdminTitle(customTitleOrOptions: string | SetCustomTitleOptions, userId?: number) {
    if (typeof customTitleOrOptions === "string") {
      const resolvedUserId = userId ?? this.fromId;
      if (resolvedUserId === undefined) throw new Error("No user_id available in current context");
      return this.gram.setAdminTitle({ customTitle: customTitleOrOptions, userId: resolvedUserId });
    }
    return this.gram.setAdminTitle(customTitleOrOptions);
  }

  async answer(options: AnswerCallbackOptions): Promise<unknown>;
  async answer(text?: string, showAlert?: boolean): Promise<unknown>;
  async answer(textOrOptions?: string | AnswerCallbackOptions, showAlert?: boolean) {
    if (!this.callbackQuery?.id) throw new Error("No callback query available in current context");
    if (typeof textOrOptions === "object" && textOrOptions !== null) {
      return this.api.answerCallbackQuery({
        callback_query_id: this.callbackQuery.id,
        ...(textOrOptions.text !== undefined ? { text: textOrOptions.text } : {}),
        ...(textOrOptions.showAlert !== undefined ? { show_alert: textOrOptions.showAlert } : {}),
        ...(textOrOptions.url !== undefined ? { url: textOrOptions.url } : {}),
        ...(textOrOptions.cacheTime !== undefined ? { cache_time: textOrOptions.cacheTime } : {}),
      });
    }
    return this.api.answerCallbackQuery({
      callback_query_id: this.callbackQuery.id,
      text: textOrOptions,
      ...(showAlert !== undefined ? { show_alert: showAlert } : {}),
    });
  }

  async answerInline(
    results: InlineQueryResult[],
    options?: { cacheTime?: number; isPersonal?: boolean; nextOffset?: string },
  ) {
    if (!this.inlineQuery?.id) throw new Error("No inline query available in current context");
    return this.api.answerInlineQuery({
      inline_query_id: this.inlineQuery.id,
      results,
      ...(options?.cacheTime !== undefined ? { cache_time: options.cacheTime } : {}),
      ...(options?.isPersonal !== undefined ? { is_personal: options.isPersonal } : {}),
      ...(options?.nextOffset !== undefined ? { next_offset: options.nextOffset } : {}),
    });
  }

  async sendInvoice(options: SendInvoiceOptions) {
    return this.gram.sendInvoice(options);
  }

  async createInvoiceLink(options: CreateInvoiceLinkOptions): Promise<string> {
    return this.gram.createInvoiceLink(options);
  }

  async answerShippingQuery(options: AnswerShippingQueryOptions) {
    return this.gram.answerShippingQuery(options);
  }

  async answerPreCheckoutQuery(ok: boolean, errorMessage?: string) {
    if (!this.preCheckoutQuery?.id)
      throw new Error("No pre-checkout query available in current context");
    return this.gram.answerPreCheckoutQuery({
      preCheckoutQueryId: this.preCheckoutQuery.id,
      ok,
      ...(errorMessage !== undefined ? { errorMessage } : {}),
    });
  }

  async answerShipping(options: Omit<AnswerShippingQueryOptions, "shippingQueryId">) {
    if (!this.shippingQuery?.id) throw new Error("No shipping query available in current context");
    return this.gram.answerShippingQuery({
      shippingQueryId: this.shippingQuery.id,
      ...options,
    });
  }

  async sendChatAction(
    action: SendChatActionOptions["action"],
    messageThreadId?: number,
  ): Promise<unknown> {
    return this.gram.sendChatAction({
      action,
      ...(this.chatId !== undefined ? { chatId: this.chatId } : {}),
      ...(messageThreadId !== undefined ? { messageThreadId } : {}),
    });
  }

  async getChat(): Promise<ChatFull> {
    const id = this.chatId;
    if (id === undefined) throw new Error("No chat_id available in current context");
    return this.gram.getChat(id);
  }

  async leaveChat(): Promise<unknown> {
    const id = this.chatId;
    if (id === undefined) throw new Error("No chat_id available in current context");
    return this.gram.leaveChat(id);
  }

  async exportInviteLink(): Promise<string> {
    const id = this.chatId;
    if (id === undefined) throw new Error("No chat_id available in current context");
    return this.gram.exportInviteLink(id);
  }

  async createInviteLink(
    options?: Omit<CreateInviteLinkOptions, "chatId">,
  ): Promise<ChatInviteLink> {
    const id = this.chatId;
    if (id === undefined) throw new Error("No chat_id available in current context");
    return this.gram.createInviteLink({ chatId: id, ...options });
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

  get inlineQueryId(): string | undefined {
    return this.inlineQuery?.id;
  }
}

export class SceneContext extends BaseContext {}
