import { describe, expect, it } from "vitest";
import { Gramora } from "../../src/core/bot";
import type { Update } from "../../src/types/telegram";
import type { BaseContext, CommandContext } from "../../src/context";

describe("command and argument parsing", () => {
  it("parses command without arguments", async () => {
    const bot = new Gramora({ token: "test", mode: "core" });
    let capturedCtx: BaseContext | undefined;

    bot.command("start", (ctx) => {
      capturedCtx = ctx;
    });

    const update: Update = {
      update_id: 1,
      message: {
        message_id: 1,
        date: 123,
        chat: { id: 1, type: "private" },
        text: "/start",
      },
    };

    await bot.handleUpdate(update);
    expect(capturedCtx).toBeDefined();
    expect((capturedCtx as CommandContext).command).toBe("/start");
    expect((capturedCtx as CommandContext).args).toEqual([]);
  });

  it("parses command with arguments", async () => {
    const bot = new Gramora({ token: "test", mode: "core" });
    let capturedCtx: CommandContext | undefined;

    bot.command("search", (ctx) => {
      capturedCtx = ctx as CommandContext;
    });

    const update: Update = {
      update_id: 1,
      message: {
        message_id: 1,
        date: 123,
        chat: { id: 1, type: "private" },
        text: "/search  query   term  ",
      },
    };

    await bot.handleUpdate(update);
    expect(capturedCtx?.command).toBe("/search");
    expect(capturedCtx?.args).toEqual(["query", "term"]);
  });

  it("handles commands with mentions", async () => {
    const bot = new Gramora({ token: "test", mode: "core" });
    let capturedCtx: CommandContext | undefined;

    bot.command("help", (ctx) => {
      capturedCtx = ctx as CommandContext;
    });

    const update: Update = {
      update_id: 1,
      message: {
        message_id: 1,
        date: 123,
        chat: { id: 1, type: "private" },
        text: "/help@bot_username arg1",
      },
    };

    await bot.handleUpdate(update);
    expect(capturedCtx?.command).toBe("/help@bot_username");
    expect(capturedCtx?.args).toEqual(["arg1"]);
  });

  it("shallow copies args to prevent side effects", async () => {
    const bot = new Gramora({ token: "test", mode: "core" });
    let ctx1: CommandContext | undefined;
    let ctx2: CommandContext | undefined;

    bot.command("test", (ctx) => {
      if (!ctx1) {
        ctx1 = ctx as CommandContext;
        ctx1.args.push("mutated");
      } else {
        ctx2 = ctx as CommandContext;
      }
    });

    const update: Update = {
      update_id: 1,
      message: {
        message_id: 1,
        date: 123,
        chat: { id: 1, type: "private" },
        text: "/test arg",
      },
    };

    // Register second handler for the same command
    bot.command("test", (ctx) => {
      ctx2 = ctx as CommandContext;
    });

    await bot.handleUpdate(update);

    expect(ctx1?.args).toEqual(["arg", "mutated"]);
    expect(ctx2?.args).toEqual(["arg"]); // Should not be mutated by first handler
  });

  it("caches chatId after first access", async () => {
    const update: Update = {
      update_id: 1,
      message: {
        message_id: 1,
        date: 123,
        chat: { id: 12345, type: "private" },
        text: "hello",
      },
    };

    const bot = new Gramora({ token: "test", mode: "core" });
    let capturedCtx: BaseContext | undefined;
    bot.onText((ctx) => {
      capturedCtx = ctx;
    });

    await bot.handleUpdate(update);

    const initialId = capturedCtx?.chatId;
    expect(initialId).toBe(12345);

    // Mutate internal update to see if it uses cache
    if (capturedCtx?.update.message) {
      (capturedCtx.update.message as Record<string, unknown>).chat = { id: 99999 };
    }
    expect(capturedCtx?.chatId).toBe(12345);
  });
});
