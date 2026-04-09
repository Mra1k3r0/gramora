import { Gramora } from "../src";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error("Set TELEGRAM_BOT_TOKEN before running the example.");

const bot = new Gramora({ token });

const flowState = new Map<number, { step: 1 | 2; name?: string }>();

bot.command("register", async (gram) => {
  if (!gram.chatId) return;
  flowState.set(gram.chatId, { step: 1 });
  await gram.send("What is your name?");
});

bot.onText(async (gram) => {
  if (!gram.chatId || !gram.text) return;
  const state = flowState.get(gram.chatId);
  if (!state) return;

  if (state.step === 1) {
    flowState.set(gram.chatId, { step: 2, name: gram.text });
    await gram.send("How old are you?");
    return;
  }

  await gram.send(`Saved profile: name=${state.name ?? "Unknown"}, age=${gram.text}`);
  flowState.delete(gram.chatId);
});

void bot.launch();
// bot.launch().catch((err) => {
//   console.error("Bot launch failed:", err);
//   process.exit(1);
// });
