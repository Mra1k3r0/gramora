import { Gramora, Keyboard } from "../src";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error("Set TELEGRAM_BOT_TOKEN before running the example.");

const bot = new Gramora({ token });

bot.command("menu", async (gram) => {
  await gram.send(
    "Choose an action",
    Keyboard.inline()
      .text("Show profile", "menu:profile")
      .row()
      .text("Show settings", "menu:settings")
      .build(),
  );
});

bot.onCallback("menu:*", async (gram) => {
  const target = gram.match?.[0] ?? "unknown";
  await gram.answer(`Opening: ${target}`);
  await gram.send(`Selected menu: ${target}`);
});

void bot.launch();
// bot.launch().catch((err) => {
//   console.error("Bot launch failed:", err);
//   process.exit(1);
// });
