import { describe, expect, it } from "vitest";
import { Gramora } from "../../src/core/bot";
import type { Update } from "../../src/types/telegram";

const dummyToken = "123456789:ABCDEFGHIJKLMNOPQRSTUVWXYZabcd";

function msgUpdate(chatId: number, text: string, updateId: number): Update {
  return {
    update_id: updateId,
    message: {
      message_id: updateId,
      date: Math.floor(Date.now() / 1000),
      chat: { id: chatId, type: "private" },
      from: { id: chatId, is_bot: false, first_name: "T" },
      text,
    },
  };
}

describe("conversation()", () => {
  it("runs linear steps with conv.enter / conv.next / conv.leave", async () => {
    const bot = new Gramora({ token: dummyToken });

    const trace: string[] = [];

    bot.conversation("signup", [
      async (ctx) => {
        trace.push(`s1:${ctx.text}`);
        (ctx.conv.state as { name?: string }).name = ctx.text ?? "";
        await ctx.conv.next();
      },
      async (ctx) => {
        trace.push(`s2:${ctx.text}`);
        await ctx.conv.leave();
      },
    ]);

    bot.command("start", async (ctx) => {
      trace.push("cmd");
      await ctx.conv.enter("signup");
    });

    await bot.handleUpdate(msgUpdate(101, "/start", 1));
    expect(trace).toEqual(["cmd"]);

    await bot.handleUpdate(msgUpdate(101, "Ada", 2));
    expect(trace).toEqual(["cmd", "s1:Ada"]);

    await bot.handleUpdate(msgUpdate(101, "42", 3));
    expect(trace).toEqual(["cmd", "s1:Ada", "s2:42"]);

    await bot.handleUpdate(msgUpdate(101, "ignored", 4));
    expect(trace).toEqual(["cmd", "s1:Ada", "s2:42"]);

    await bot.handleUpdate(msgUpdate(101, "/start", 5));
    expect(trace).toEqual(["cmd", "s1:Ada", "s2:42", "cmd"]);
  });

  it("clears decorator scene slot when entering a conversation", async () => {
    const bot = new Gramora({ token: dummyToken });
    const trace: string[] = [];

    bot.conversation("c1", [
      async (ctx) => {
        trace.push("conv");
        await ctx.conv.leave();
      },
    ]);

    bot.command("scene", async (ctx) => {
      await ctx.scene.enter("never_registered_scene");
      trace.push("entered_scene_slot");
      await ctx.conv.enter("c1");
    });

    await bot.handleUpdate(msgUpdate(202, "/scene", 1));
    await bot.handleUpdate(msgUpdate(202, "ping", 2));
    expect(trace).toEqual(["entered_scene_slot", "conv"]);
  });

  it("rejects duplicate conversation ids", () => {
    const bot = new Gramora({ token: dummyToken });
    bot.conversation("x", [async () => {}]);
    expect(() => bot.conversation("x", [async () => {}])).toThrow(/already registered/);
  });

  it("rejects empty step lists", () => {
    const bot = new Gramora({ token: dummyToken });
    expect(() => bot.conversation("empty", [])).toThrow(/at least one step/);
  });
});
