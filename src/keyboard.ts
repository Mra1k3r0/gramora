import type {
  InlineKeyboardMarkup,
  ReplyKeyboardMarkup,
  ReplyKeyboardRemove,
} from "./types/telegram";

export class InlineKeyboardBuilder {
  private rows: { text: string; callback_data?: string; url?: string }[][] = [[]];

  text(text: string, callbackData: string) {
    this.rows[this.rows.length - 1].push({ text, callback_data: callbackData });
    return this;
  }

  url(text: string, url: string) {
    this.rows[this.rows.length - 1].push({ text, url });
    return this;
  }

  row() {
    this.rows.push([]);
    return this;
  }

  build(): InlineKeyboardMarkup {
    return { inline_keyboard: this.rows.filter((r) => r.length > 0) };
  }
}

export class ReplyKeyboardBuilder {
  private rows: {
    text: string;
    request_contact?: boolean;
    request_location?: boolean;
  }[][] = [[]];
  private resize = true;

  text(text: string) {
    this.rows[this.rows.length - 1].push({ text });
    return this;
  }

  contact(text: string) {
    this.rows[this.rows.length - 1].push({ text, request_contact: true });
    return this;
  }

  location(text: string) {
    this.rows[this.rows.length - 1].push({ text, request_location: true });
    return this;
  }

  row() {
    this.rows.push([]);
    return this;
  }

  noResize() {
    this.resize = false;
    return this;
  }

  build(): ReplyKeyboardMarkup {
    return {
      keyboard: this.rows.filter((r) => r.length > 0),
      resize_keyboard: this.resize,
    };
  }
}

export const removeKeyboard = (): ReplyKeyboardRemove => ({
  remove_keyboard: true,
});

export const Keyboard = {
  inline: () => new InlineKeyboardBuilder(),
  reply: () => new ReplyKeyboardBuilder(),
  remove: () => removeKeyboard(),
};
