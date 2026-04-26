import { Gramora } from "../src";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error("Set TELEGRAM_BOT_TOKEN before running the example.");

const bot = new Gramora({ token });

bot.command("photo", async (gram) => {
  await gram.photo({
    photo: "https://picsum.photos/600/300",
    caption: "Advanced photo send",
    replyTo: gram.message?.message_id,
    silent: true,
    protect: true,
  });
});

bot.command("doc", async (gram) => {
  await gram.doc({
    document: "https://example.com/sample.pdf",
    caption: "Advanced document send",
    replyTo: gram.message?.message_id,
  });
});

bot.command("video", async (gram) => {
  await gram.video({
    video: "https://example.com/video.mp4",
    caption: "*Advanced* video send",
    parseMode: "Markdown",
    replyTo: gram.message?.message_id,
    silent: true,
  });
});

bot.command("audio", async (gram) => {
  await gram.audio({
    audio: "https://example.com/audio.mp3",
    caption: "<b>Advanced</b> audio send",
    parseMode: "HTML",
    replyTo: gram.message?.message_id,
  });
});

bot.command("animation", async (gram) => {
  await gram.animation({
    animation: "https://example.com/anim.gif",
    caption: "Advanced animation send",
    replyTo: gram.message?.message_id,
    protect: true,
  });
});

bot.command("voice", async (gram) => {
  await gram.voice({
    voice: "https://example.com/voice.ogg",
    caption: "Advanced voice send",
    replyTo: gram.message?.message_id,
  });
});

bot.command("sticker", async (gram) => {
  await gram.sticker({
    sticker: "CAACAgUAAxkBAAIB...",
    emoji: "🔥",
    replyTo: gram.message?.message_id,
  });
});

void bot.launch();
// bot.launch().catch((err) => {
//   console.error("Bot launch failed:", err);
//   process.exit(1);
// });
