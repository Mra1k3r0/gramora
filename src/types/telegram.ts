export interface User {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: true;
  added_to_attachment_menu?: true;
  can_join_groups?: boolean;
  can_read_all_group_messages?: boolean;
  supports_inline_queries?: boolean;
  can_connect_to_business?: boolean;
  has_main_web_app?: boolean;
  has_topics_enabled?: true;
  allows_users_to_create_topics?: true;
  can_manage_bots?: true;
  supports_guest_queries?: true;
  supports_join_request_queries?: true;
}

export type ChatType = "private" | "group" | "supergroup" | "channel";

export interface Chat {
  id: number;
  type: ChatType;
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
}

export type ChatAction =
  | "typing"
  | "upload_photo"
  | "record_video"
  | "upload_video"
  | "record_voice"
  | "upload_voice"
  | "upload_document"
  | "choose_sticker"
  | "find_location"
  | "record_video_note"
  | "upload_video_note";

export interface ChatInviteLink {
  invite_link: string;
  creator: User;
  creates_join_request?: boolean;
  is_primary?: boolean;
  is_revoked?: boolean;
  name?: string;
  expire_date?: number;
  member_limit?: number;
  pending_join_request_count?: number;
}

export interface PhotoSize {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  file_size?: number;
}

export interface MessageEntity {
  type:
    | "mention"
    | "hashtag"
    | "cashtag"
    | "bot_command"
    | "url"
    | "email"
    | "phone_number"
    | "bold"
    | "italic"
    | "underline"
    | "strikethrough"
    | "spoiler"
    | "code"
    | "pre"
    | "text_link"
    | "text_mention"
    | "custom_emoji"
    | "blockquote"
    | "expandable_blockquote"
    | "date_time";
  offset: number;
  length: number;
  url?: string;
  user?: User;
  language?: string;
  custom_emoji_id?: string;
}

export type MessageOrigin =
  | { type: "user"; date: number; from: User; sender_chat?: Chat }
  | { type: "chat"; date: number; sender_chat: Chat; author_signature?: string }
  | { type: "channel"; date: number; chat: Chat; message_id: number; author_signature?: string }
  | { type: "hidden_user"; date: number; sender_user_name: string }
  | { type: "chat"; date: number; chat: Chat; author_signature?: string };

export interface TextQuote {
  text: string;
  entities?: MessageEntity[];
  position?: number;
  is_disabled?: boolean;
}

export interface ExternalReplyInfo {
  origin: MessageOrigin;
  chat?: Chat;
  message_id?: number;
  link_preview_options?: LinkPreviewOptions;
  animation?: Animation;
  audio?: Audio;
  document?: Document;
  photo?: PhotoSize[];
  sticker?: Sticker;
  story?: Story;
  video?: Video;
  video_note?: VideoNote;
  voice?: Voice;
  has_media_spoiler?: boolean;
}

export interface Story {
  chat: Chat;
  id: number;
}

export interface LinkPreviewOptions {
  is_disabled?: boolean;
  url?: string;
  prefer_small_media?: boolean;
  prefer_large_media?: boolean;
  show_above_text?: boolean;
}

export interface SuggestedPostInfo {
  price?: SuggestedPostPrice;
}

export interface SuggestedPostPrice {
  amount: number;
  currency: string;
}

export interface LivePhoto {
  small_file_id: string;
  small_file_unique_id: string;
  large_file_id: string;
  large_file_unique_id: string;
}

export interface Checklist {
  title: string;
  title_entities?: MessageEntity[];
  tasks: ChecklistTask[];
  others_can_add_tasks?: boolean;
  others_can_mark_tasks_as_done?: boolean;
}

export interface ChecklistTask {
  id: number;
  text: string;
  text_entities?: MessageEntity[];
  is_done?: boolean;
  is_blocked?: boolean;
  done_by_user?: User;
  done_by_chat?: Chat;
  completion_date?: number;
}

export interface ChatOwnerLeft {
  user: User;
}

export interface ChatOwnerChanged {
  from: User;
  date: number;
}

export interface MessageAutoDeleteTimerChanged {
  message_auto_delete_time: number;
}

export interface Dice {
  emoji: string;
  value: number;
}

export interface Game {
  title: string;
  description: string;
  photo: PhotoSize[];
  text?: string;
  text_entities?: MessageEntity[];
  animation?: Animation;
}

export interface Venue {
  location: Location;
  title: string;
  address: string;
  foursquare_id?: string;
  foursquare_type?: string;
  google_place_id?: string;
  google_place_type?: string;
}

export interface VideoNote {
  file_id: string;
  file_unique_id: string;
  length: number;
  duration: number;
  thumbnail?: PhotoSize;
  file_size?: number;
}

export interface GiftInfo {
  gift: Gift;
  owner?: User;
  origin?: string;
  is_upgrade_separate?: boolean;
  is_saved?: boolean;
  is_transferred?: boolean;
  can_be_upgraded?: boolean;
  was_refunded?: boolean;
  text?: string;
  text_entities?: MessageEntity[];
}

export interface UniqueGiftInfo {
  gift: UniqueGift;
  origin: string;
  last_resale_currency?: string;
  last_resale_amount?: number;
  next_transfer_date?: number;
  owned_since?: number;
}

export interface Gift {
  id: string;
  sticker: Sticker;
  star_count: number;
  upgrade_star_count?: number;
  total_count?: number;
  remaining_count?: number;
  last_resale_star_count?: number;
  publisher_chat?: Chat;
  has_colors?: boolean;
  colors?: UniqueGiftColors;
  unique_gift_variant_count?: number;
  is_premium?: boolean;
}

export interface UniqueGift {
  base_sticker: Sticker;
  name: string;
  number: number;
  model: UniqueGiftModel;
  symbol: UniqueGiftSymbol;
  backdrop: UniqueGiftBackdrop;
  owner?: User;
  origin?: string;
  gift_id?: string;
  is_from_blockchain?: boolean;
  is_premium?: boolean;
  rarity?: number;
  is_burned?: boolean;
  colors?: UniqueGiftColors;
  unique_gift_number?: number;
}

export interface UniqueGiftModel {
  name: string;
  sticker: Sticker;
  rarity?: number;
}

export interface UniqueGiftSymbol {
  name: string;
  sticker: Sticker;
  rarity?: number;
}

export interface UniqueGiftBackdrop {
  name: string;
  center_color: number;
  edge_color: number;
  pattern_color: number;
  rarity?: number;
}

export interface PaidMediaInfo {
  star_count: number;
  background_color?: string;
  cover?: PaidMediaCover;
}

export type PaidMediaCover = PhotoSize | Video;

export interface MessageBase {
  message_id: number;
  message_thread_id?: number;
  date: number;
  chat: Chat;
  from?: User;
  sender_chat?: Chat;
  sender_boost_count?: number;
  sender_business_bot?: User;
  sender_tag?: string;
  forward_origin?: MessageOrigin;
  reply_to_message?: Message;
  external_reply?: ExternalReplyInfo;
  quote?: TextQuote;
  reply_to_story?: Story;
  reply_to_checklist_task_id?: number;
  reply_to_poll_option_id?: string;
  via_bot?: User;
  guest_bot_caller_user?: User;
  guest_bot_caller_chat?: Chat;
  guest_query_id?: string;
  business_connection_id?: string;
  edit_date?: number;
  has_protected_content?: true;
  is_from_offline?: true;
  is_topic_message?: true;
  is_automatic_forward?: true;
  is_paid_post?: true;
  media_group_id?: string;
  author_signature?: string;
  paid_star_count?: number;
  text?: string;
  entities?: MessageEntity[];
  link_preview_options?: LinkPreviewOptions;
  suggested_post_info?: SuggestedPostInfo;
  effect_id?: string;
  rich_message?: unknown;
  animation?: Animation;
  audio?: Audio;
  document?: Document;
  live_photo?: LivePhoto;
  photo?: PhotoSize[];
  sticker?: Sticker;
  story?: Story;
  video?: Video;
  video_note?: VideoNote;
  voice?: Voice;
  caption?: string;
  caption_entities?: MessageEntity[];
  show_caption_above_media?: true;
  has_media_spoiler?: true;
  checklist?: Checklist;
  contact?: Contact;
  dice?: Dice;
  game?: Game;
  poll?: Poll;
  venue?: Venue;
  location?: Location;
  new_chat_members?: User[];
  left_chat_member?: User;
  chat_owner_left?: ChatOwnerLeft;
  chat_owner_changed?: ChatOwnerChanged;
  new_chat_title?: string;
  new_chat_photo?: PhotoSize[];
  delete_chat_photo?: true;
  group_chat_created?: true;
  supergroup_chat_created?: true;
  channel_chat_created?: true;
  message_auto_delete_timer_changed?: MessageAutoDeleteTimerChanged;
  pinned_message?: Message;
  invoice?: Invoice;
  successful_payment?: SuccessfulPayment;
  gift?: GiftInfo;
  unique_gift?: UniqueGiftInfo;
  gift_upgrade_sent?: true;
  paid_media?: PaidMediaInfo;
}

export interface TextMessage extends MessageBase {
  text: string;
  entities?: MessageEntity[];
}

export interface PhotoMessage extends MessageBase {
  photo: PhotoSize[];
  caption?: string;
  caption_entities?: MessageEntity[];
}

export interface Document {
  file_id: string;
  file_unique_id: string;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
}

export interface DocumentMessage extends MessageBase {
  document: Document;
  caption?: string;
  caption_entities?: MessageEntity[];
}

export interface Video {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  duration: number;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
}

export interface Animation {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  duration: number;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
  thumbnail?: PhotoSize;
}

export interface VideoMessage extends MessageBase {
  video: Video;
  caption?: string;
  caption_entities?: MessageEntity[];
}

export interface Sticker {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  is_animated: boolean;
  is_video: boolean;
  emoji?: string;
}

export interface StickerMessage extends MessageBase {
  sticker: Sticker;
}

export interface Voice {
  file_id: string;
  file_unique_id: string;
  duration: number;
  mime_type?: string;
  file_size?: number;
}

export interface VoiceMessage extends MessageBase {
  voice: Voice;
  caption?: string;
}

export interface Contact {
  phone_number: string;
  first_name: string;
  last_name?: string;
  user_id?: number;
}

export interface ContactMessage extends MessageBase {
  contact: Contact;
}

export interface Location {
  longitude: number;
  latitude: number;
}

export interface LocationMessage extends MessageBase {
  location: Location;
}

export interface PollOption {
  text: string;
  text_entities?: MessageEntity[];
  voter_count: number;
  media?: PollMedia;
  persistent_id?: string;
  added_by_user?: User;
  added_by_chat?: Chat;
  addition_date?: number;
}

export interface PollMedia {
  photo?: PhotoSize[];
  animation?: Animation;
  video?: Video;
  document?: Document;
  emoji?: string;
}

export interface Poll {
  id: string;
  question: string;
  question_entities?: MessageEntity[];
  options: PollOption[];
  total_voter_count: number;
  is_closed: boolean;
  is_anonymous: boolean;
  type: "regular" | "quiz";
  allows_multiple_answers: boolean;
  correct_option_ids?: number[];
  explanation?: string;
  explanation_entities?: MessageEntity[];
  open_period?: number;
  close_date?: number;
  allows_revoting?: boolean;
  description?: string;
  description_entities?: MessageEntity[];
  media?: PollMedia;
  explanation_media?: PollMedia;
  members_only?: boolean;
  country_codes?: string[];
}

export interface PollMessage extends MessageBase {
  poll: Poll;
}

export type Message =
  | TextMessage
  | PhotoMessage
  | DocumentMessage
  | VideoMessage
  | StickerMessage
  | VoiceMessage
  | ContactMessage
  | LocationMessage
  | PollMessage
  | InvoiceMessage
  | SuccessfulPaymentMessage
  | MessageBase;

export interface CallbackQuery {
  id: string;
  from: User;
  message?: Message;
  inline_message_id?: string;
  chat_instance: string;
  data?: string;
  game_short_name?: string;
}

export interface InlineQuery {
  id: string;
  from: User;
  query: string;
  offset: string;
  chat_type?: ChatType;
}

export interface ChosenInlineResult {
  result_id: string;
  from: User;
  query: string;
  inline_message_id?: string;
}

export interface PollAnswer {
  poll_id: string;
  option_ids: number[];
  option_persistent_ids?: string[];
  user: User;
  voter_chat?: Chat;
  date?: number;
}

/**
 * Bot API update; which optional fields exist depends on `allowed_updates`.
 * @see https://core.telegram.org/bots/api#update
 */
export interface Update {
  update_id: number;
  message?: Message;
  edited_message?: Message;
  callback_query?: CallbackQuery;
  inline_query?: InlineQuery;
  chosen_inline_result?: ChosenInlineResult;
  poll_answer?: PollAnswer;
  poll?: Poll;
  shipping_query?: ShippingQuery;
  pre_checkout_query?: PreCheckoutQuery;
  chat_member?: ChatMemberUpdated;
  my_chat_member?: ChatMemberUpdated;
  chat_join_request?: ChatJoinRequest;
  message_reaction?: MessageReactionUpdated;
  message_reaction_count?: MessageReactionCountUpdated;
  business_connection?: BusinessConnection;
  business_message?: Message;
  edited_business_message?: Message;
  deleted_business_messages?: BusinessMessagesDeleted;
}

export interface InlineKeyboardButton {
  text: string;
  url?: string;
  callback_data?: string;
  web_app?: WebAppInfo;
  login_url?: LoginUrl;
  inline_web_app?: WebAppInfo;
  callback_game?: Record<string, unknown>;
  pay?: boolean;
  switch_inline_query?: string;
  switch_inline_query_current_chat?: string;
  switch_inline_query_chosen_chat?: SwitchInlineQueryChosenChat;
  copy_text?: CopyTextButton;
  forward_text?: string;
  callback_url?: string;
  icon_custom_emoji_id?: string;
  style?: "primary" | "secondary";
}

export interface InlineKeyboardMarkup {
  inline_keyboard: InlineKeyboardButton[][];
}

export interface KeyboardButton {
  text: string;
  request_contact?: boolean;
  request_location?: boolean;
}

export interface ReplyKeyboardMarkup {
  keyboard: KeyboardButton[][];
  resize_keyboard?: boolean;
  one_time_keyboard?: boolean;
  selective?: boolean;
}

export interface ReplyKeyboardRemove {
  remove_keyboard: true;
  selective?: boolean;
}

export interface ForceReply {
  force_reply: true;
  selective?: boolean;
}

export type ReplyMarkup =
  | InlineKeyboardMarkup
  | ReplyKeyboardMarkup
  | ReplyKeyboardRemove
  | ForceReply;

export interface ChatPermissions {
  can_send_messages?: boolean;
  can_send_audios?: boolean;
  can_send_documents?: boolean;
  can_send_photos?: boolean;
  can_send_videos?: boolean;
  can_send_video_notes?: boolean;
  can_send_voice_notes?: boolean;
  can_send_polls?: boolean;
  can_send_other_messages?: boolean;
  can_add_web_page_previews?: boolean;
  can_change_info?: boolean;
  can_invite_users?: boolean;
  can_pin_messages?: boolean;
  can_manage_topics?: boolean;
  can_react_to_messages?: boolean;
}

export interface Birthdate {
  day: number;
  month: number;
  year?: number;
}

export interface BusinessIntro {
  greeting_message?: string;
  start_message?: string;
  bio?: string;
}

export interface BusinessLocation {
  location?: Location;
  address: string;
}

export interface BusinessOpeningHoursInterval {
  opening_minute: number;
  closing_minute: number;
}

export interface BusinessOpeningHours {
  opening_hours: BusinessOpeningHoursInterval[];
}

export interface ChatLocation {
  location: Location;
  address: string;
}

export interface UserRating {
  rating: number;
}

export interface Audio {
  file_id: string;
  file_unique_id: string;
  duration: number;
  performer?: string;
  title?: string;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
  thumbnail?: PhotoSize;
}

export interface AcceptedGiftTypes {
  unlimited_gifts: boolean;
  limited_gifts: boolean;
  unique_gifts: boolean;
  premium_subscription: boolean;
}

export interface UniqueGiftColors {
  name_color: string;
  title_color: string;
  pattern_color: string;
  foreground_color: string;
  background_color: string;
}

/** Rich chat object from getChat (subset of Bot API fields). */
export interface ChatFull extends Chat {
  is_forum?: boolean;
  photo?: { small_file_id: string; big_file_id: string };
  active_usernames?: string[];
  accent_color_id?: number;
  bio?: string;
  description?: string;
  invite_link?: string;
  pinned_message?: Message;
  permissions?: ChatPermissions;
  slow_mode_delay?: number;
  message_auto_delete_time?: number;
  has_hidden_members?: boolean;
  has_protected_content?: boolean;
  has_visible_history?: boolean;
  has_aggressive_anti_spam_enabled?: boolean;
  sticker_set_name?: string;
  can_set_sticker_set?: boolean;
  linked_chat_id?: number;
  max_reaction_count?: number;
  birthdate?: Birthdate;
  business_intro?: BusinessIntro;
  business_location?: BusinessLocation;
  business_opening_hours?: BusinessOpeningHours;
  personal_chat?: Chat;
  parent_chat?: Chat;
  available_reactions?: ReactionType[];
  background_custom_emoji_id?: string;
  profile_accent_color_id?: number;
  profile_background_custom_emoji_id?: string;
  emoji_status_custom_emoji_id?: string;
  emoji_status_expiration_date?: number;
  has_private_forwards?: true;
  has_restricted_voice_and_video_messages?: true;
  join_to_send_messages?: true;
  join_by_request?: true;
  accepted_gift_types?: AcceptedGiftTypes;
  can_send_paid_media?: true;
  unrestrict_boost_count?: number;
  custom_emoji_sticker_set_name?: string;
  location?: ChatLocation;
  rating?: UserRating;
  first_profile_audio?: Audio;
  unique_gift_colors?: UniqueGiftColors;
  paid_message_star_count?: number;
  guard_bot?: User;
}

export interface ChatAdministratorRights {
  is_anonymous: boolean;
  can_manage_chat: boolean;
  can_delete_messages: boolean;
  can_manage_video_chats: boolean;
  can_restrict_members: boolean;
  can_promote_members: boolean;
  can_change_info: boolean;
  can_invite_users: boolean;
  can_post_messages?: boolean;
  can_edit_messages?: boolean;
  can_pin_messages?: boolean;
  can_manage_topics?: boolean;
  can_post_stories?: boolean;
  can_edit_stories?: boolean;
  can_delete_stories?: boolean;
}

export type ChatMemberStatus =
  | "creator"
  | "administrator"
  | "member"
  | "restricted"
  | "left"
  | "kicked";

export interface ChatMemberBase {
  status: ChatMemberStatus;
  user: User;
}

export interface ChatMemberOwner extends ChatMemberBase {
  status: "creator";
  is_anonymous: boolean;
  custom_title?: string;
}

export interface ChatMemberAdministrator extends ChatMemberBase {
  status: "administrator";
  can_be_edited: boolean;
  is_anonymous: boolean;
  can_manage_chat: boolean;
  can_delete_messages: boolean;
  can_manage_video_chats: boolean;
  can_restrict_members: boolean;
  can_promote_members: boolean;
  can_change_info: boolean;
  can_invite_users: boolean;
  can_post_messages?: boolean;
  can_edit_messages?: boolean;
  can_pin_messages?: boolean;
  can_manage_topics?: boolean;
  custom_title?: string;
}

export interface ChatMemberMember extends ChatMemberBase {
  status: "member";
}

export interface ChatMemberRestricted extends ChatMemberBase {
  status: "restricted";
  is_member: boolean;
  can_send_messages: boolean;
  can_send_audios: boolean;
  can_send_documents: boolean;
  can_send_photos: boolean;
  can_send_videos: boolean;
  can_send_video_notes: boolean;
  can_send_voice_notes: boolean;
  can_send_polls: boolean;
  can_send_other_messages: boolean;
  can_add_web_page_previews: boolean;
  can_change_info: boolean;
  can_invite_users: boolean;
  can_pin_messages: boolean;
  can_manage_topics: boolean;
  can_react_to_messages: boolean;
  until_date: number;
}

export interface ChatMemberLeft extends ChatMemberBase {
  status: "left";
}

export interface ChatMemberBanned extends ChatMemberBase {
  status: "kicked";
  until_date: number;
}

export type ChatMember =
  | ChatMemberOwner
  | ChatMemberAdministrator
  | ChatMemberMember
  | ChatMemberRestricted
  | ChatMemberLeft
  | ChatMemberBanned;

export interface ChatMemberUpdated {
  chat: Chat;
  from: User;
  date: number;
  old_chat_member: ChatMember;
  new_chat_member: ChatMember;
  invite_link?: ChatInviteLink;
}

export interface ChatJoinRequest {
  chat: Chat;
  from: User;
  user_chat_id: number;
  date: number;
  bio?: string;
  invite_link?: ChatInviteLink;
}

export type ReactionType =
  | { type: "emoji"; emoji: string }
  | { type: "custom_emoji"; custom_emoji_id: string }
  | { type: "paid" };

export interface MessageReactionUpdated {
  chat: Chat;
  message_id: number;
  date: number;
  old_reaction: ReactionType[];
  new_reaction: ReactionType[];
  user?: User;
  actor_chat?: Chat;
}

export interface ReactionCount {
  type: ReactionType;
  total_count: number;
}

export interface MessageReactionCountUpdated {
  chat: Chat;
  message_id: number;
  date: number;
  reactions: ReactionCount[];
}

export interface BusinessConnection {
  id: string;
  user: User;
  user_chat_id: number;
  date: number;
  can_reply: boolean;
  is_enabled: boolean;
}

export interface BusinessMessagesDeleted {
  business_connection_id: string;
  chat: Chat;
  message_ids: number[];
}

export interface ForumTopic {
  message_thread_id: number;
  name: string;
  icon_color: number;
  icon_custom_emoji_id?: string;
}

export interface WebAppInfo {
  url: string;
}

export interface LoginUrl {
  url: string;
  forward_text?: string;
  bot_username?: string;
  request_write_access?: boolean;
}

export interface SwitchInlineQueryChosenChat {
  query?: string;
  allow_user_chats?: boolean;
  allow_bot_chats?: boolean;
  allow_group_chats?: boolean;
  allow_channel_chats?: boolean;
}

export interface CopyTextButton {
  text: string;
}

export type MenuButton =
  | { type: "default" }
  | { type: "commands" }
  | { type: "web_app"; text: string; web_app: WebAppInfo };

export type BotCommandScope =
  | { type: "default" }
  | { type: "all_private_chats" }
  | { type: "all_group_chats" }
  | { type: "all_chat_administrators" }
  | { type: "chat"; chat_id: number | string }
  | { type: "chat_administrators"; chat_id: number | string }
  | { type: "chat_member"; chat_id: number | string; user_id: number };

export interface File {
  file_id: string;
  file_unique_id: string;
  file_size?: number;
  file_path?: string;
}

export type UploadFromPath = {
  path: string;
  filename?: string;
  mimeType?: string;
  stream?: boolean;
};

export type UploadFromBuffer = {
  buffer: Uint8Array;
  filename?: string;
  mimeType?: string;
};

export type UploadFromStream = {
  stream: NodeJS.ReadableStream;
  filename: string;
  mimeType?: string;
};

export type InputFile = string | UploadFromPath | UploadFromBuffer | UploadFromStream;

export interface InputMediaBase {
  caption?: string;
  parse_mode?: "Markdown" | "MarkdownV2" | "HTML";
}

export interface InputMediaAnimation extends InputMediaBase {
  type: "animation";
  media: InputFile;
  width?: number;
  height?: number;
  duration?: number;
}

export interface InputMediaDocument extends InputMediaBase {
  type: "document";
  media: InputFile;
}

export interface InputMediaAudio extends InputMediaBase {
  type: "audio";
  media: InputFile;
  duration?: number;
  performer?: string;
  title?: string;
}

export interface InputMediaVideo extends InputMediaBase {
  type: "video";
  media: InputFile;
  width?: number;
  height?: number;
  duration?: number;
  supports_streaming?: boolean;
}

export type InputMedia =
  | InputMediaAnimation
  | InputMediaDocument
  | InputMediaAudio
  | InputMediaVideo;

export interface InputTextMessageContent {
  message_text: string;
  parse_mode?: "Markdown" | "MarkdownV2" | "HTML";
  disable_web_page_preview?: boolean;
}

export interface InputLocationMessageContent {
  latitude: number;
  longitude: number;
}

export interface InputVenueMessageContent {
  latitude: number;
  longitude: number;
  title: string;
  address: string;
  foursquare_id?: string;
  foursquare_type?: string;
}

export interface InputContactMessageContent {
  phone_number: string;
  first_name: string;
  last_name?: string;
  vcard?: string;
}

export type InputMessageContent =
  | InputTextMessageContent
  | InputLocationMessageContent
  | InputVenueMessageContent
  | InputContactMessageContent;

export interface InlineQueryResultBase {
  id: string;
  reply_markup?: InlineKeyboardMarkup;
}

export interface InlineQueryResultArticle extends InlineQueryResultBase {
  type: "article";
  title: string;
  input_message_content: InputMessageContent;
  description?: string;
  thumbnail_url?: string;
  thumbnail_width?: number;
  thumbnail_height?: number;
  url?: string;
  hide_url?: boolean;
}

export interface InlineQueryResultPhoto extends InlineQueryResultBase {
  type: "photo";
  photo_url: string;
  thumbnail_url: string;
  photo_width?: number;
  photo_height?: number;
  title?: string;
  description?: string;
  caption?: string;
  parse_mode?: "Markdown" | "MarkdownV2" | "HTML";
  input_message_content?: InputMessageContent;
}

export interface InlineQueryResultGif extends InlineQueryResultBase {
  type: "gif";
  gif_url: string;
  thumbnail_url: string;
  gif_width?: number;
  gif_height?: number;
  gif_duration?: number;
  title?: string;
  caption?: string;
  parse_mode?: "Markdown" | "MarkdownV2" | "HTML";
  input_message_content?: InputMessageContent;
}

export interface InlineQueryResultVideo extends InlineQueryResultBase {
  type: "video";
  video_url: string;
  mime_type: "text/html" | "video/mp4";
  thumbnail_url: string;
  title: string;
  caption?: string;
  parse_mode?: "Markdown" | "MarkdownV2" | "HTML";
  video_width?: number;
  video_height?: number;
  video_duration?: number;
  description?: string;
  input_message_content?: InputMessageContent;
}

export interface InlineQueryResultAudio extends InlineQueryResultBase {
  type: "audio";
  audio_url: string;
  title: string;
  caption?: string;
  parse_mode?: "Markdown" | "MarkdownV2" | "HTML";
  performer?: string;
  audio_duration?: number;
  input_message_content?: InputMessageContent;
}

export interface InlineQueryResultDocument extends InlineQueryResultBase {
  type: "document";
  title: string;
  document_url: string;
  mime_type: "application/pdf" | "application/zip";
  caption?: string;
  parse_mode?: "Markdown" | "MarkdownV2" | "HTML";
  description?: string;
  thumbnail_url?: string;
  thumbnail_width?: number;
  thumbnail_height?: number;
  input_message_content?: InputMessageContent;
}

export interface InlineQueryResultVoice extends InlineQueryResultBase {
  type: "voice";
  voice_url: string;
  title: string;
  caption?: string;
  parse_mode?: "Markdown" | "MarkdownV2" | "HTML";
  voice_duration?: number;
  input_message_content?: InputMessageContent;
}

export interface InlineQueryResultLocation extends InlineQueryResultBase {
  type: "location";
  latitude: number;
  longitude: number;
  title: string;
  thumbnail_url?: string;
  thumbnail_width?: number;
  thumbnail_height?: number;
  input_message_content?: InputMessageContent;
}

export interface InlineQueryResultCachedPhoto extends InlineQueryResultBase {
  type: "photo";
  photo_file_id: string;
  title?: string;
  description?: string;
  caption?: string;
  parse_mode?: "Markdown" | "MarkdownV2" | "HTML";
  input_message_content?: InputMessageContent;
}

export interface InlineQueryResultCachedGif extends InlineQueryResultBase {
  type: "gif";
  gif_file_id: string;
  title?: string;
  caption?: string;
  parse_mode?: "Markdown" | "MarkdownV2" | "HTML";
  input_message_content?: InputMessageContent;
}

export interface InlineQueryResultCachedVideo extends InlineQueryResultBase {
  type: "video";
  video_file_id: string;
  title: string;
  description?: string;
  caption?: string;
  parse_mode?: "Markdown" | "MarkdownV2" | "HTML";
  input_message_content?: InputMessageContent;
}

export interface InlineQueryResultCachedDocument extends InlineQueryResultBase {
  type: "document";
  document_file_id: string;
  title: string;
  description?: string;
  caption?: string;
  parse_mode?: "Markdown" | "MarkdownV2" | "HTML";
  input_message_content?: InputMessageContent;
}

export interface InlineQueryResultCachedSticker extends InlineQueryResultBase {
  type: "sticker";
  sticker_file_id: string;
  input_message_content?: InputMessageContent;
}

export type InlineQueryResult =
  | InlineQueryResultArticle
  | InlineQueryResultPhoto
  | InlineQueryResultGif
  | InlineQueryResultVideo
  | InlineQueryResultAudio
  | InlineQueryResultDocument
  | InlineQueryResultVoice
  | InlineQueryResultLocation
  | InlineQueryResultCachedPhoto
  | InlineQueryResultCachedGif
  | InlineQueryResultCachedVideo
  | InlineQueryResultCachedDocument
  | InlineQueryResultCachedSticker;

export interface LabeledPrice {
  label: string;
  amount: number;
}

export interface Invoice {
  title: string;
  description: string;
  start_parameter: string;
  currency: string;
  total_amount: number;
}

export interface ShippingAddress {
  country_code: string;
  state: string;
  city: string;
  street_line1: string;
  street_line2: string;
  post_code: string;
}

export interface OrderInfo {
  name?: string;
  phone_number?: string;
  email?: string;
  shipping_address?: ShippingAddress;
}

export interface ShippingOption {
  id: string;
  title: string;
  prices: LabeledPrice[];
}

export interface SuccessfulPayment {
  currency: string;
  total_amount: number;
  invoice_payload: string;
  subscription_expiration_date?: number;
  is_recurring?: true;
  is_first_recurring?: true;
  shipping_option_id?: string;
  order_info?: OrderInfo;
  telegram_payment_charge_id: string;
  provider_payment_charge_id: string;
}

export interface StarAmount {
  amount: number;
  nanostar_amount?: number;
}

export interface TransactionPartnerUser {
  type: "user";
  transaction_type:
    | "invoice_payment"
    | "paid_media_payment"
    | "gift_purchase"
    | "premium_purchase"
    | "business_account_transfer";
  user: User;
  invoice_payload?: string;
  paid_media_payload?: string;
  subscription_period?: number;
  premium_subscription_duration?: number;
}

export interface TransactionPartnerChat {
  type: "chat";
  chat: Chat;
}

export interface TransactionPartnerAffiliateProgram {
  type: "affiliate_program";
  sponsor_user?: User;
  commission_per_mille: number;
}

export interface TransactionPartnerFragment {
  type: "fragment";
  withdrawal_state?: unknown;
}

export interface TransactionPartnerTelegramAds {
  type: "telegram_ads";
}

export interface TransactionPartnerTelegramApi {
  type: "telegram_api";
  request_count: number;
}

export interface TransactionPartnerOther {
  type: "other";
}

export type TransactionPartner =
  | TransactionPartnerUser
  | TransactionPartnerChat
  | TransactionPartnerAffiliateProgram
  | TransactionPartnerFragment
  | TransactionPartnerTelegramAds
  | TransactionPartnerTelegramApi
  | TransactionPartnerOther;

export interface StarTransaction {
  id: string;
  amount: number;
  nanostar_amount?: number;
  date: number;
  source?: TransactionPartner;
  receiver?: TransactionPartner;
}

export interface StarTransactions {
  transactions: StarTransaction[];
}

export interface ShippingQuery {
  id: string;
  from: User;
  invoice_payload: string;
  shipping_address: ShippingAddress;
}

export interface PreCheckoutQuery {
  id: string;
  from: User;
  currency: string;
  total_amount: number;
  invoice_payload: string;
  shipping_option_id?: string;
  order_info?: OrderInfo;
}

export interface InvoiceMessage extends MessageBase {
  invoice: Invoice;
}

export interface SuccessfulPaymentMessage extends MessageBase {
  successful_payment: SuccessfulPayment;
}

export type MessageContentKind =
  | "text"
  | "photo"
  | "document"
  | "video"
  | "sticker"
  | "voice"
  | "contact"
  | "location"
  | "poll"
  | "invoice"
  | "successful_payment";
