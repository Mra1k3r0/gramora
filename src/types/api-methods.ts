import type {
  File,
  ForceReply,
  InlineKeyboardMarkup,
  InlineQueryResult,
  InputMedia,
  Message,
  Poll,
  ReplyMarkup,
  ReplyKeyboardMarkup,
  ReplyKeyboardRemove,
  Update,
  User,
  InputFile,
} from "./telegram";

export interface TelegramResponse<T> {
  ok: boolean;
  result: T;
  description?: string;
  error_code?: number;
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

export interface MessageId {
  message_id: number;
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
  setWebhook: { params: SetWebhookParams; result: true };
  deleteWebhook: { params: DeleteWebhookParams; result: true };
  getWebhookInfo: { params: void; result: Record<string, unknown> };
  getFile: { params: { file_id: string }; result: File };
  setMyCommands: { params: SetMyCommandsParams; result: true };
  sendMediaGroup: { params: SendMediaGroupParams; result: Message[] };
  sendPoll: {
    params: {
      chat_id: number | string;
      question: string;
      options: string[];
      is_anonymous?: boolean;
      allows_multiple_answers?: boolean;
    };
    result: Message;
  };
  stopPoll: {
    params: { chat_id: number | string; message_id: number };
    result: Poll;
  };
}

export type TelegramMethodName = keyof TelegramApiMethods;
