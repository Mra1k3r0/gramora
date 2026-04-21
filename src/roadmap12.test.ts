import { describe, expect, it } from "vitest";
import { Gramora } from "./core/bot";
import type { BaseContext } from "./context";
import type { Update } from "./types/telegram";
import { escapeTelegramMarkdownV2, isMessageKind, isUpdateType, session } from "./index";

const sampleMessageUpdate: Update = {
  update_id: 1,
  message: {
    message_id: 42,
    date: 1_700_000_000,
    chat: { id: 123, type: "private" },
    text: "hi",
  },
};

describe("roadmap #12", () => {
  it("supports typed update filter handlers", async () => {
    const bot = new Gramora({ token: "test-token", mode: "core" });
    let seenMessageId: number | undefined;

    bot.onFilter(isUpdateType("message"), async (ctx) => {
      const message = ctx.update.message;
      if (!message) throw new Error("expected message update");
      seenMessageId = message.message_id;
    });

    await bot.handleUpdate(sampleMessageUpdate);
    expect(seenMessageId).toBe(42);
  });

  it("supports message-kind narrowing", () => {
    expect(isMessageKind("text")(sampleMessageUpdate)).toBe(true);
    expect(
      isMessageKind("photo")({
        update_id: 2,
        message: {
          message_id: 1,
          date: 1_700_000_001,
          chat: { id: 1, type: "private" },
        },
      }),
    ).toBe(false);
  });

  it("escapes Telegram MarkdownV2 control characters", () => {
    const escaped = escapeTelegramMarkdownV2("hey_[x](y)! #test + 1=2");
    expect(escaped).toBe("hey\\_\\[x\\]\\(y\\)\\! \\#test \\+ 1\\=2");
  });

  it("persists session state with pluggable store", async () => {
    const store = new Map<string, Record<string, unknown>>();
    const mw = session({
      store: {
        async get(key) {
          return store.get(key);
        },
        async set(key, value) {
          store.set(key, value);
        },
        async delete(key) {
          store.delete(key);
        },
      },
    });

    const ctx = {
      fromId: 99,
      chatId: 100,
      session: {},
    } as Pick<BaseContext, "fromId" | "chatId" | "session"> as BaseContext;

    await mw(ctx, async () => {
      ctx.session.counter = 1;
    });
    await mw(ctx, async () => {
      ctx.session.counter = (ctx.session.counter as number) + 1;
    });

    expect(store.get("99")?.counter).toBe(2);
  });
});
