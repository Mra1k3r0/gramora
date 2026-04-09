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
