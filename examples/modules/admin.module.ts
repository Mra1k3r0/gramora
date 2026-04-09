import type { BotModule } from "../../src";
import type { BaseContext } from "../../src";

export const AdminModule: BotModule = (bot) => {
  bot.command("ping", async (gram: BaseContext) => {
    await gram.send("pong");
  });

  bot.command("health", async (gram: BaseContext) => {
    await gram.send("ok");
  });
};
