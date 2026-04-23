import { describe, expect, it } from "vitest";
import { Gramora } from "./core/bot";
import type { Update } from "./types/telegram";

describe("handler ordering", () => {
  it("executes handlers in deterministic order (commands -> generic -> kind)", async () => {
    const bot = new Gramora({ token: "test", mode: "core" });
    const executionOrder: string[] = [];

    bot.onText(() => {
      executionOrder.push("onText1");
    });
    bot.command("start", () => {
      executionOrder.push("command1");
    });
    bot.onMessage(() => {
      executionOrder.push("onMessage1");
    });
    bot.command("start", () => {
      executionOrder.push("command2");
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

    // Current implementation:
    // 1. commandHandlers for "start" (command1, command2)
    // 2. onMessageHandlers (onMessage1)
    // 3. onKindHandlers for "text" (onText1)
    expect(executionOrder).toEqual(["command1", "command2", "onMessage1", "onText1"]);
  });

  it("preserves registration order within categories", async () => {
    const bot = new Gramora({ token: "test", mode: "core" });
    const executionOrder: string[] = [];

    bot.onText(() => {
      executionOrder.push("text1");
    });
    bot.onText(() => {
      executionOrder.push("text2");
    });

    const update: Update = {
      update_id: 1,
      message: {
        message_id: 1,
        date: 123,
        chat: { id: 1, type: "private" },
        text: "hello",
      },
    };

    await bot.handleUpdate(update);
    expect(executionOrder).toEqual(["text1", "text2"]);
  });
});
