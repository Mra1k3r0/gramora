/**
 * Functional multi-step flow without `@Scene` classes (`Gramora.prototype.conversation`).
 */
import { Gramora } from "../src";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error("Set TELEGRAM_BOT_TOKEN before running this example.");

const bot = new Gramora({ token });

bot.conversation("register", [
  async (ctx) => {
    Object.assign(ctx.conv.state, { name: ctx.text ?? "" });
    await ctx.reply("How old are you?");
    await ctx.conv.next();
  },
  async (ctx) => {
    const name = String(ctx.conv.state.name ?? "Unknown");
    await ctx.reply(`Saved: name=${name}, age=${ctx.text ?? "?"}`);
    await ctx.conv.leave();
  },
]);

bot.command("register", async (ctx) => {
  await ctx.conv.enter("register");
  await ctx.reply("What is your name?");
});

void bot.launch();
