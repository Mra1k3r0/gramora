import { Gramora } from "../src";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error("Set TELEGRAM_BOT_TOKEN before running the example.");

const bot = new Gramora({ token, mode: "core" }).configure({
  userAgent: "MyCustomBot/1.0 (+https://example.com)",
  timeoutMs: 20000,
  proxy: "http://127.0.0.1:8080",
  debug: true,
});

bot.command("start", async (gram) => {
  await gram.send("Bot config example is running.");
});

void bot.launch();
// bot.launch().catch((err) => {
//   console.error("Bot launch failed:", err);
//   process.exit(1);
// });
