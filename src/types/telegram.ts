export interface User {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
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
    | "text_link";
  offset: number;
  length: number;
  url?: string;
}

export interface MessageBase {
  message_id: number;
  date: number;
  chat: Chat;
  from?: User;
  reply_to_message?: Message;
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
  voter_count: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  total_voter_count: number;
  is_closed: boolean;
  is_anonymous: boolean;
  type: "regular" | "quiz";
  allows_multiple_answers: boolean;
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
  user: User;
  option_ids: number[];
}

export interface Update {
  update_id: number;
  message?: Message;
  edited_message?: Message;
  callback_query?: CallbackQuery;
  inline_query?: InlineQuery;
  chosen_inline_result?: ChosenInlineResult;
  poll_answer?: PollAnswer;
  poll?: Poll;
}

export interface InlineKeyboardButton {
  text: string;
  callback_data?: string;
  url?: string;
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

export type MessageContentKind =
  | "text"
  | "photo"
  | "document"
  | "video"
  | "sticker"
  | "voice"
  | "contact"
  | "location"
  | "poll";
