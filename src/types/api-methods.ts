import type {
  BotCommandScope,
  ChatAction,
  ChatFull,
  ChatInviteLink,
  ChatMember,
  ChatPermissions,
  File,
  ForceReply,
  ForumTopic,
  InlineKeyboardMarkup,
  InlineQueryResult,
  InputMedia,
  LabeledPrice,
  MenuButton,
  Message,
  Poll,
  ReactionType,
  ReplyMarkup,
  ReplyKeyboardMarkup,
  ReplyKeyboardRemove,
  ShippingOption,
  Update,
  User,
  InputFile,
} from "./telegram";

export interface TelegramResponse<T> {
  ok: boolean;
  result: T;
  description?: string;
  error_code?: number;
  /** Present on error responses; `retry_after` is set on 429 responses. */
  parameters?: { retry_after?: number; migrate_to_chat_id?: number };
}

export interface GetUpdatesParams {
  offset?: number;
  limit?: number;
  timeout?: number;
  allowed_updates?: string[];
}

export interface SendMessageParams {
  chat_id: number | string;
  text: string;
  parse_mode?: "Markdown" | "MarkdownV2" | "HTML";
  reply_markup?: InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove | ForceReply;
  reply_to_message_id?: number;
  disable_notification?: boolean;
  protect_content?: boolean;
}

export interface SendPhotoParams {
  chat_id: number | string;
  photo: InputFile;
  caption?: string;
  parse_mode?: "Markdown" | "MarkdownV2" | "HTML";
  reply_markup?: ReplyMarkup;
  reply_to_message_id?: number;
  disable_notification?: boolean;
  protect_content?: boolean;
}

export interface SendDocumentParams {
  chat_id: number | string;
  document: InputFile;
  caption?: string;
  parse_mode?: "Markdown" | "MarkdownV2" | "HTML";
  reply_markup?: ReplyMarkup;
  reply_to_message_id?: number;
  disable_notification?: boolean;
  protect_content?: boolean;
}

export interface SendAudioParams {
  chat_id: number | string;
  audio: InputFile;
  caption?: string;
  parse_mode?: "Markdown" | "MarkdownV2" | "HTML";
  reply_markup?: ReplyMarkup;
  reply_to_message_id?: number;
  disable_notification?: boolean;
  protect_content?: boolean;
}

export interface SendVideoParams {
  chat_id: number | string;
  video: InputFile;
  caption?: string;
  parse_mode?: "Markdown" | "MarkdownV2" | "HTML";
  reply_markup?: ReplyMarkup;
  reply_to_message_id?: number;
  disable_notification?: boolean;
  protect_content?: boolean;
}

export interface SendAnimationParams {
  chat_id: number | string;
  animation: InputFile;
  caption?: string;
  parse_mode?: "Markdown" | "MarkdownV2" | "HTML";
  reply_markup?: ReplyMarkup;
  reply_to_message_id?: number;
  disable_notification?: boolean;
  protect_content?: boolean;
}

export interface SendVoiceParams {
  chat_id: number | string;
  voice: InputFile;
  caption?: string;
  parse_mode?: "Markdown" | "MarkdownV2" | "HTML";
  reply_markup?: ReplyMarkup;
  reply_to_message_id?: number;
  disable_notification?: boolean;
  protect_content?: boolean;
}

export interface SendStickerParams {
  chat_id: number | string;
  sticker: InputFile;
  emoji?: string;
  reply_markup?: ReplyMarkup;
  reply_to_message_id?: number;
  disable_notification?: boolean;
  protect_content?: boolean;
}

export interface EditMessageTextParams {
  chat_id?: number | string;
  message_id?: number;
  inline_message_id?: string;
  text: string;
  parse_mode?: "Markdown" | "MarkdownV2" | "HTML";
  reply_markup?: InlineKeyboardMarkup;
}

export interface EditMessageCaptionParams {
  chat_id?: number | string;
  message_id?: number;
  inline_message_id?: string;
  caption?: string;
  parse_mode?: "Markdown" | "MarkdownV2" | "HTML";
  reply_markup?: InlineKeyboardMarkup;
}

export interface EditMessageReplyMarkupParams {
  chat_id?: number | string;
  message_id?: number;
  inline_message_id?: string;
  reply_markup?: InlineKeyboardMarkup;
}

export interface EditMessageMediaParams {
  chat_id?: number | string;
  message_id?: number;
  inline_message_id?: string;
  media: InputMedia;
  reply_markup?: InlineKeyboardMarkup;
}

export interface AnswerCallbackQueryParams {
  callback_query_id: string;
  text?: string;
  show_alert?: boolean;
  url?: string;
  cache_time?: number;
}

export interface AnswerInlineQueryParams {
  inline_query_id: string;
  results: InlineQueryResult[];
  cache_time?: number;
  is_personal?: boolean;
  next_offset?: string;
  button?: {
    text: string;
    web_app?: { url: string };
    start_parameter?: string;
  };
}

export interface DeleteMessageParams {
  chat_id: number | string;
  message_id: number;
}

export interface DeleteMessagesParams {
  chat_id: number | string;
  message_ids: number[];
}

export interface ForwardMessageParams {
  chat_id: number | string;
  from_chat_id: number | string;
  message_id: number;
  disable_notification?: boolean;
  protect_content?: boolean;
}

export interface CopyMessageParams {
  chat_id: number | string;
  from_chat_id: number | string;
  message_id: number;
  caption?: string;
  parse_mode?: "Markdown" | "MarkdownV2" | "HTML";
  reply_markup?: ReplyMarkup;
  disable_notification?: boolean;
  protect_content?: boolean;
  reply_to_message_id?: number;
}

export interface BanChatMemberParams {
  chat_id: number | string;
  user_id: number;
  until_date?: number;
  revoke_messages?: boolean;
}

export interface UnbanChatMemberParams {
  chat_id: number | string;
  user_id: number;
  only_if_banned?: boolean;
}

export interface RestrictChatMemberParams {
  chat_id: number | string;
  user_id: number;
  permissions: ChatPermissions;
  use_independent_chat_permissions?: boolean;
  until_date?: number;
}

export interface PromoteChatMemberParams {
  chat_id: number | string;
  user_id: number;
  is_anonymous?: boolean;
  can_manage_chat?: boolean;
  can_delete_messages?: boolean;
  can_manage_video_chats?: boolean;
  can_restrict_members?: boolean;
  can_promote_members?: boolean;
  can_change_info?: boolean;
  can_invite_users?: boolean;
  can_post_messages?: boolean;
  can_edit_messages?: boolean;
  can_pin_messages?: boolean;
  can_manage_topics?: boolean;
  can_post_stories?: boolean;
  can_edit_stories?: boolean;
  can_delete_stories?: boolean;
}

export interface SetChatPermissionsParams {
  chat_id: number | string;
  permissions: ChatPermissions;
  use_independent_chat_permissions?: boolean;
}

export interface SetChatAdministratorCustomTitleParams {
  chat_id: number | string;
  user_id: number;
  custom_title: string;
}

export interface SetWebhookParams {
  url: string;
  secret_token?: string;
  allowed_updates?: string[];
  drop_pending_updates?: boolean;
}

export interface DeleteWebhookParams {
  drop_pending_updates?: boolean;
}

export interface BotCommand {
  command: string;
  description: string;
}

export interface SetMyCommandsParams {
  commands: BotCommand[];
  scope?: BotCommandScope;
  language_code?: string;
}

export interface DeleteMyCommandsParams {
  scope?: BotCommandScope;
  language_code?: string;
}

export interface GetMyCommandsParams {
  scope?: BotCommandScope;
  language_code?: string;
}

export interface InputMediaPhoto {
  type: "photo";
  media: InputFile;
  caption?: string;
  parse_mode?: "Markdown" | "MarkdownV2" | "HTML";
}

export interface SendMediaGroupParams {
  chat_id: number | string;
  media: InputMediaPhoto[];
  disable_notification?: boolean;
  protect_content?: boolean;
  reply_to_message_id?: number;
}

export interface PinChatMessageParams {
  chat_id: number | string;
  message_id: number;
  disable_notification?: boolean;
}

export interface UnpinChatMessageParams {
  chat_id: number | string;
  message_id?: number;
}

export interface UnpinAllChatMessagesParams {
  chat_id: number | string;
}

export interface GetChatMemberParams {
  chat_id: number | string;
  user_id: number;
}

export interface GetChatAdministratorsParams {
  chat_id: number | string;
}

export interface GetChatMemberCountParams {
  chat_id: number | string;
}

export interface CreateForumTopicParams {
  chat_id: number | string;
  name: string;
  icon_color?: number;
  icon_custom_emoji_id?: string;
}

export interface EditForumTopicParams {
  chat_id: number | string;
  message_thread_id: number;
  name?: string;
  icon_custom_emoji_id?: string;
}

export interface CloseForumTopicParams {
  chat_id: number | string;
  message_thread_id: number;
}

export interface ReopenForumTopicParams {
  chat_id: number | string;
  message_thread_id: number;
}

export interface DeleteForumTopicParams {
  chat_id: number | string;
  message_thread_id: number;
}

export interface SetChatMenuButtonParams {
  chat_id?: number | string;
  menu_button?: MenuButton;
}

export interface GetChatMenuButtonParams {
  chat_id?: number | string;
}

export interface SetMyNameParams {
  name?: string;
  language_code?: string;
}

export interface GetMyNameParams {
  language_code?: string;
}

export interface BotName {
  name: string;
}

export interface SetMyDescriptionParams {
  description?: string;
  language_code?: string;
}

export interface GetMyDescriptionParams {
  language_code?: string;
}

export interface BotDescription {
  description: string;
}

export interface SetMyShortDescriptionParams {
  short_description?: string;
  language_code?: string;
}

export interface GetMyShortDescriptionParams {
  language_code?: string;
}

export interface BotShortDescription {
  short_description: string;
}

export interface MessageId {
  message_id: number;
}

export interface SendInvoiceParams {
  chat_id: number | string;
  title: string;
  description: string;
  payload: string;
  currency: string;
  prices: LabeledPrice[];
  provider_token?: string;
  max_tip_amount?: number;
  suggested_tip_amounts?: number[];
  start_parameter?: string;
  provider_data?: string;
  photo_url?: string;
  photo_size?: number;
  photo_width?: number;
  photo_height?: number;
  need_name?: boolean;
  need_phone_number?: boolean;
  need_email?: boolean;
  need_shipping_address?: boolean;
  send_phone_number_to_provider?: boolean;
  send_email_to_provider?: boolean;
  is_flexible?: boolean;
  disable_notification?: boolean;
  protect_content?: boolean;
  reply_to_message_id?: number;
  reply_markup?: InlineKeyboardMarkup;
}

export interface CreateInvoiceLinkParams {
  title: string;
  description: string;
  payload: string;
  currency: string;
  prices: LabeledPrice[];
  provider_token?: string;
  max_tip_amount?: number;
  suggested_tip_amounts?: number[];
  provider_data?: string;
  photo_url?: string;
  photo_size?: number;
  photo_width?: number;
  photo_height?: number;
  need_name?: boolean;
  need_phone_number?: boolean;
  need_email?: boolean;
  need_shipping_address?: boolean;
  send_phone_number_to_provider?: boolean;
  send_email_to_provider?: boolean;
  is_flexible?: boolean;
}

export interface AnswerShippingQueryParams {
  shipping_query_id: string;
  ok: boolean;
  shipping_options?: ShippingOption[];
  error_message?: string;
}

export interface AnswerPreCheckoutQueryParams {
  pre_checkout_query_id: string;
  ok: boolean;
  error_message?: string;
}

export interface RefundStarPaymentParams {
  user_id: number;
  telegram_payment_charge_id: string;
}

export interface SendChatActionParams {
  chat_id: number | string;
  action: ChatAction;
  message_thread_id?: number;
  business_connection_id?: string;
}

export interface GetChatParams {
  chat_id: number | string;
}

export interface LeaveChatParams {
  chat_id: number | string;
}

export interface ExportChatInviteLinkParams {
  chat_id: number | string;
}

export interface CreateChatInviteLinkParams {
  chat_id: number | string;
  name?: string;
  expire_date?: number;
  member_limit?: number;
  creates_join_request?: boolean;
}

export interface ApproveChatJoinRequestParams {
  chat_id: number | string;
  user_id: number;
}

export interface DeclineChatJoinRequestParams {
  chat_id: number | string;
  user_id: number;
}

export interface SetMessageReactionParams {
  chat_id: number | string;
  message_id: number;
  reaction: ReactionType[];
  is_big?: boolean;
}

export interface SendLocationParams {
  chat_id: number | string;
  latitude: number;
  longitude: number;
  horizontal_accuracy?: number;
  live_period?: number;
  heading?: number;
  proximity_alert_radius?: number;
  disable_notification?: boolean;
  protect_content?: boolean;
  reply_to_message_id?: number;
  reply_markup?: ReplyMarkup;
  message_thread_id?: number;
  business_connection_id?: string;
}

export interface SendVenueParams {
  chat_id: number | string;
  latitude: number;
  longitude: number;
  title: string;
  address: string;
  foursquare_id?: string;
  foursquare_type?: string;
  google_place_id?: string;
  google_place_type?: string;
  disable_notification?: boolean;
  protect_content?: boolean;
  reply_to_message_id?: number;
  reply_markup?: ReplyMarkup;
  message_thread_id?: number;
  business_connection_id?: string;
}

export interface SendContactParams {
  chat_id: number | string;
  phone_number: string;
  first_name: string;
  last_name?: string;
  vcard?: string;
  disable_notification?: boolean;
  protect_content?: boolean;
  reply_to_message_id?: number;
  reply_markup?: ReplyMarkup;
  message_thread_id?: number;
  business_connection_id?: string;
}

export interface SendDiceParams {
  chat_id: number | string;
  emoji?: string;
  disable_notification?: boolean;
  protect_content?: boolean;
  reply_to_message_id?: number;
  reply_markup?: ReplyMarkup;
  message_thread_id?: number;
  business_connection_id?: string;
}

export interface SendPollParams {
  chat_id: number | string;
  question: string;
  options: string[];
  is_anonymous?: boolean;
  type?: "quiz" | "regular";
  allows_multiple_answers?: boolean;
  correct_option_id?: number;
  explanation?: string;
  explanation_parse_mode?: "Markdown" | "MarkdownV2" | "HTML";
  open_period?: number;
  close_date?: number;
  is_closed?: boolean;
  disable_notification?: boolean;
  protect_content?: boolean;
  reply_to_message_id?: number;
  reply_markup?: ReplyMarkup;
  message_thread_id?: number;
  business_connection_id?: string;
}

export interface StopPollParams {
  chat_id: number | string;
  message_id: number;
  reply_markup?: InlineKeyboardMarkup;
}

export interface TelegramApiMethods {
  getMe: { params: void; result: User };
  getUpdates: { params: GetUpdatesParams; result: Update[] };
  sendMessage: { params: SendMessageParams; result: Message };
  sendPhoto: { params: SendPhotoParams; result: Message };
  sendDocument: { params: SendDocumentParams; result: Message };
  sendAudio: { params: SendAudioParams; result: Message };
  sendVideo: { params: SendVideoParams; result: Message };
  sendAnimation: { params: SendAnimationParams; result: Message };
  sendVoice: { params: SendVoiceParams; result: Message };
  sendSticker: { params: SendStickerParams; result: Message };
  editMessageText: { params: EditMessageTextParams; result: Message | true };
  editMessageCaption: { params: EditMessageCaptionParams; result: Message | true };
  editMessageReplyMarkup: { params: EditMessageReplyMarkupParams; result: Message | true };
  editMessageMedia: { params: EditMessageMediaParams; result: Message | true };
  answerCallbackQuery: { params: AnswerCallbackQueryParams; result: true };
  answerInlineQuery: { params: AnswerInlineQueryParams; result: true };
  deleteMessage: { params: DeleteMessageParams; result: true };
  deleteMessages: { params: DeleteMessagesParams; result: true };
  forwardMessage: { params: ForwardMessageParams; result: Message };
  copyMessage: { params: CopyMessageParams; result: MessageId };
  banChatMember: { params: BanChatMemberParams; result: true };
  unbanChatMember: { params: UnbanChatMemberParams; result: true };
  restrictChatMember: { params: RestrictChatMemberParams; result: true };
  promoteChatMember: { params: PromoteChatMemberParams; result: true };
  setChatPermissions: { params: SetChatPermissionsParams; result: true };
  setChatAdministratorCustomTitle: { params: SetChatAdministratorCustomTitleParams; result: true };
  setWebhook: { params: SetWebhookParams; result: true };
  deleteWebhook: { params: DeleteWebhookParams; result: true };
  getWebhookInfo: { params: void; result: Record<string, unknown> };
  getFile: { params: { file_id: string }; result: File };
  setMyCommands: { params: SetMyCommandsParams; result: true };
  deleteMyCommands: { params: DeleteMyCommandsParams; result: true };
  getMyCommands: { params: GetMyCommandsParams; result: BotCommand[] };
  setChatMenuButton: { params: SetChatMenuButtonParams; result: true };
  getChatMenuButton: { params: GetChatMenuButtonParams; result: MenuButton };
  setMyName: { params: SetMyNameParams; result: true };
  getMyName: { params: GetMyNameParams; result: BotName };
  setMyDescription: { params: SetMyDescriptionParams; result: true };
  getMyDescription: { params: GetMyDescriptionParams; result: BotDescription };
  setMyShortDescription: { params: SetMyShortDescriptionParams; result: true };
  getMyShortDescription: { params: GetMyShortDescriptionParams; result: BotShortDescription };
  sendMediaGroup: { params: SendMediaGroupParams; result: Message[] };
  pinChatMessage: { params: PinChatMessageParams; result: true };
  unpinChatMessage: { params: UnpinChatMessageParams; result: true };
  unpinAllChatMessages: { params: UnpinAllChatMessagesParams; result: true };
  getChatMember: { params: GetChatMemberParams; result: ChatMember };
  getChatAdministrators: { params: GetChatAdministratorsParams; result: ChatMember[] };
  getChatMemberCount: { params: GetChatMemberCountParams; result: number };
  createForumTopic: { params: CreateForumTopicParams; result: ForumTopic };
  editForumTopic: { params: EditForumTopicParams; result: true };
  closeForumTopic: { params: CloseForumTopicParams; result: true };
  reopenForumTopic: { params: ReopenForumTopicParams; result: true };
  deleteForumTopic: { params: DeleteForumTopicParams; result: true };
  approveChatJoinRequest: { params: ApproveChatJoinRequestParams; result: true };
  declineChatJoinRequest: { params: DeclineChatJoinRequestParams; result: true };
  setMessageReaction: { params: SetMessageReactionParams; result: true };
  sendLocation: { params: SendLocationParams; result: Message };
  sendVenue: { params: SendVenueParams; result: Message };
  sendContact: { params: SendContactParams; result: Message };
  sendDice: { params: SendDiceParams; result: Message };
  sendPoll: { params: SendPollParams; result: Message };
  stopPoll: { params: StopPollParams; result: Poll };
  sendInvoice: { params: SendInvoiceParams; result: Message };
  createInvoiceLink: { params: CreateInvoiceLinkParams; result: string };
  answerShippingQuery: { params: AnswerShippingQueryParams; result: true };
  answerPreCheckoutQuery: { params: AnswerPreCheckoutQueryParams; result: true };
  refundStarPayment: { params: RefundStarPaymentParams; result: true };
  sendChatAction: { params: SendChatActionParams; result: true };
  getChat: { params: GetChatParams; result: ChatFull };
  leaveChat: { params: LeaveChatParams; result: true };
  exportChatInviteLink: { params: ExportChatInviteLinkParams; result: string };
  createChatInviteLink: { params: CreateChatInviteLinkParams; result: ChatInviteLink };
}

export type TelegramMethodName = keyof TelegramApiMethods;
