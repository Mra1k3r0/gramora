import type { Message, MessageContentKind, Update } from "./telegram";

export type MessageForKind<K extends MessageContentKind> = Extract<Message, Record<K, unknown>>;

export interface TypedUpdateContext<K extends MessageContentKind> {
  update: Update;
  message: MessageForKind<K>;
}
