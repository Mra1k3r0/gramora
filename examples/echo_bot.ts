import { Gramora } from "../src";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error("Set TELEGRAM_BOT_TOKEN before running the example.");

const bot = new Gramora({ token });

bot.command("start", async (gram) => {
  await gram.send("Hello from Gramora. Send me a message and I will echo it.");
});

bot.onText(async (gram) => {
  await gram.send(`Echo: ${gram.text ?? ""}`);
});

void bot.launch();
// bot.launch().catch((err) => {
//   console.error("Bot launch failed:", err);
//   process.exit(1);
// });
