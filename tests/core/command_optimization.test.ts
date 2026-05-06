import { describe, it, expect } from "vitest";
import { Gramora } from "../../src/index";
import { CommandContext } from "../../src/context";
import type { Update } from "../../src/types/telegram";

describe("Command Optimization and Correctness", () => {
  it("should handle extra spaces in command text", async () => {
    const bot = new Gramora({ token: "TEST", mode: "core" });
    let capturedCtx: CommandContext | undefined;

    bot.command("test", async (ctx) => {
      capturedCtx = ctx as CommandContext;
    });

    await bot.handleUpdate({
      update_id: 1,
      message: {
        message_id: 1,
        chat: { id: 1, type: "private" },
        text: "  /test   arg1  arg2  ",
      } as unknown as Update["message"],
    } as Update);

    expect(capturedCtx).toBeDefined();
    expect(capturedCtx?.command).toBe("/test");
    expect(capturedCtx?.args).toEqual(["arg1", "arg2"]);
  });

  it("should handle command with mention (/cmd@bot)", async () => {
    const bot = new Gramora({ token: "TEST", mode: "core" });
    let capturedCtx: CommandContext | undefined;

    bot.command("start", async (ctx) => {
      capturedCtx = ctx as CommandContext;
    });

    await bot.handleUpdate({
      update_id: 2,
      message: {
        message_id: 2,
        chat: { id: 1, type: "private" },
        text: "/start@my_bot hello world",
      } as unknown as Update["message"],
    } as Update);

    expect(capturedCtx).toBeDefined();
    expect(capturedCtx?.command).toBe("/start@my_bot");
    expect(capturedCtx?.args).toEqual(["hello", "world"]);
  });

  it("should prevent shared args mutation across multiple handlers", async () => {
    const bot = new Gramora({ token: "TEST", mode: "core" });
    let ctx1Args: readonly string[] = [];
    let ctx2Args: readonly string[] = [];

    bot.command("mutate", async (ctx) => {
      ctx1Args = (ctx as CommandContext).args;
    });

    bot.command("mutate", async (ctx) => {
      ctx2Args = (ctx as CommandContext).args;
    });

    await bot.handleUpdate({
      update_id: 3,
      message: {
        message_id: 3,
        chat: { id: 1, type: "private" },
        text: "/mutate original",
      } as unknown as Update["message"],
    } as Update);

    expect(ctx1Args).toBe(ctx2Args);
    expect(Object.isFrozen(ctx1Args)).toBe(true);
  });

  it("should correctly identify command even if text doesn't start with it (leading whitespace)", async () => {
    const bot = new Gramora({ token: "TEST", mode: "core" });
    let captured: boolean = false;
    bot.command("start", async () => {
      captured = true;
    });

    await bot.handleUpdate({
      update_id: 4,
      message: {
        message_id: 4,
        chat: { id: 1, type: "private" },
        text: "   /start",
      } as unknown as Update["message"],
    } as Update);
    expect(captured).toBe(true);
  });
});
