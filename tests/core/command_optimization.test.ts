import { describe, it, expect } from "vitest";
import { Gramora } from "../../src/index";
import { CommandContext } from "../../src/context";

describe("Command Optimization and Correctness", () => {
  it("should handle extra spaces in command text", async () => {
    const bot = new Gramora({ token: "TEST", mode: "core" });
    let capturedCtx: any;

    bot.command("test", async (ctx) => {
      capturedCtx = ctx;
    });

    await bot.handleUpdate({
      update_id: 1,
      message: {
        message_id: 1,
        chat: { id: 1, type: "private" },
        text: "  /test   arg1  arg2  ",
      } as any,
    });

    expect(capturedCtx).toBeDefined();
    expect(capturedCtx.command).toBe("/test");
    expect(capturedCtx.args).toEqual(["arg1", "arg2"]);
  });

  it("should handle command with mention (/cmd@bot)", async () => {
    const bot = new Gramora({ token: "TEST", mode: "core" });
    let capturedCtx: any;

    bot.command("start", async (ctx) => {
      capturedCtx = ctx;
    });

    await bot.handleUpdate({
      update_id: 2,
      message: {
        message_id: 2,
        chat: { id: 1, type: "private" },
        text: "/start@my_bot hello world",
      } as any,
    });

    expect(capturedCtx).toBeDefined();
    expect(capturedCtx.command).toBe("/start@my_bot");
    expect(capturedCtx.args).toEqual(["hello", "world"]);
  });

  it("should prevent shared args mutation across multiple handlers", async () => {
    const bot = new Gramora({ token: "TEST", mode: "core" });
    let handler1Args: string[] = [];
    let handler2Args: string[] = [];

    bot.command("mutate", async (ctx) => {
      handler1Args = [...(ctx as CommandContext).args];
      (ctx as CommandContext).args.push("mutated");
    });

    bot.command("mutate", async (ctx) => {
      handler2Args = [...(ctx as CommandContext).args];
    });

    await bot.handleUpdate({
      update_id: 3,
      message: {
        message_id: 3,
        chat: { id: 1, type: "private" },
        text: "/mutate original",
      } as any,
    });

    expect(handler1Args).toEqual(["original"]);
    expect(handler2Args).toEqual(["original"]); // Should NOT see "mutated"
  });

  it("should correctly identify command even if text doesn't start with it (leading whitespace)", async () => {
     const bot = new Gramora({ token: "TEST", mode: "core" });
     let captured: boolean = false;
     bot.command("start", async () => { captured = true; });

     await bot.handleUpdate({
         update_id: 4,
         message: {
             message_id: 4,
             chat: { id: 1, type: "private" },
             text: "   /start"
         } as any
     });
     expect(captured).toBe(true);
  });
});
