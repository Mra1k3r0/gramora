import type { MessageContentKind, Update } from "./types/telegram";

export type UpdateType =
  | "message"
  | "edited_message"
  | "callback_query"
  | "inline_query"
  | "chosen_inline_result"
  | "poll_answer"
  | "poll"
  | "shipping_query"
  | "pre_checkout_query"
  | "chat_member"
  | "my_chat_member"
  | "chat_join_request"
  | "message_reaction"
  | "message_reaction_count"
  | "business_connection"
  | "business_message"
  | "edited_business_message"
  | "deleted_business_messages";

export type UpdateByType<T extends UpdateType> = Update & Required<Pick<Update, T>>;
export type UpdateFilter<T extends Update = Update> = (update: Update) => update is T;

/** Type guard for Telegram update objects by top-level field. */
export function isUpdateType<T extends UpdateType>(type: T): UpdateFilter<UpdateByType<T>> {
  return (update: Update): update is UpdateByType<T> => update[type] !== undefined;
}

/** Type guard for message updates by content kind, e.g. `text`, `photo`, `poll`. */
export function isMessageKind<K extends MessageContentKind>(
  kind: K,
): UpdateFilter<Update & { message: Record<K, unknown> }> {
  return (update: Update): update is Update & { message: Record<K, unknown> } =>
    Boolean(update.message && kind in update.message);
}
