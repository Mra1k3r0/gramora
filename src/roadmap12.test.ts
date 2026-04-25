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

  it("shares in-flight session state across concurrent updates for the same key", async () => {
    let getCalls = 0;
    const store = new Map<string, Record<string, unknown>>([["99", { counter: 0 }]]);
    const mw = session({
      store: {
        async get(key) {
          getCalls += 1;
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

    let releaseGate: (() => void) | undefined;
    const gate = new Promise<void>((resolve) => {
      releaseGate = resolve;
    });
    const started: number[] = [];
    const run = async (id: number) => {
      const ctx = {
        fromId: 99,
        chatId: 100,
        session: {},
      } as Pick<BaseContext, "fromId" | "chatId" | "session"> as BaseContext;

      await mw(ctx, async () => {
        started.push(id);
        if (started.length === 2) releaseGate?.();
        await gate;
        ctx.session.counter = Number(ctx.session.counter ?? 0) + 1;
      });
    };

    await Promise.all([run(1), run(2)]);

    expect(getCalls).toBe(1);
    expect(store.get("99")?.counter).toBe(2);
  });

  it("persists reassigned session objects correctly", async () => {
    const store = new Map<string, Record<string, unknown>>([["77", { counter: 1 }]]);
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
      fromId: 77,
      chatId: 100,
      session: {},
    } as Pick<BaseContext, "fromId" | "chatId" | "session"> as BaseContext;

    await mw(ctx, async () => {
      ctx.session = { replaced: true };
    });

    expect(store.get("77")).toEqual({ replaced: true });
  });
});
