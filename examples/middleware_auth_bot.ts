import { Gramora, type MiddlewareFn, type BaseContext } from "../src";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error("Set TELEGRAM_BOT_TOKEN before running the example.");

const bot = new Gramora({ token });

const onlyAdmin: MiddlewareFn<BaseContext> = async (ctx, next) => {
  if (ctx.fromId !== 123456789) {
    await ctx.send("This bot is restricted to admin.");
    return;
  }
  await next();
};

bot.use(onlyAdmin);

bot.command("start", async (ctx) => {
  await ctx.send("Welcome admin");
});

bot.onText(async (ctx) => {
  await ctx.send(`Admin echo: ${ctx.text ?? ""}`);
});

void bot.launch();
// bot.launch().catch((err) => {
//   console.error("Bot launch failed:", err);
//   process.exit(1);
// });
