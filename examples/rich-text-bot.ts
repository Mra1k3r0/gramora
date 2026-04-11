import { Gramora, renderTelegramRichText } from "../src";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error("Set TELEGRAM_BOT_TOKEN before running the example.");

const bot = new Gramora({ token });

/** Markdown-ish source; `renderTelegramRichText` turns it into Telegram HTML. */
const demoMarkdown = `
**Gramora rich text demo**

Mix *italic* and _italic_, **bold** and __bold__, and \`inline code\` like \`npm run build\`.

**JavaScript**
\`\`\`js
export async function greet(name: string) {
  const msg = \`Hello, \${name}!\`;
  return msg;
}
\`\`\`

**C++**
\`\`\`cpp
#include <iostream>

int main() {
  std::cout << "Hello, Gramora\\n";
  return 0;
}
\`\`\`

End with a one-liner: use \`parseMode: "HTML"\` with \`renderTelegramRichText(...)\`.
`.trim();

bot.command("start", async (ctx) => {
  await ctx.reply({
    text: renderTelegramRichText(
      "**Rich text bot**\\n\\nTry /demo for fenced code, bold, italic, and inline code.",
    ),
    parseMode: "HTML",
  });
});

bot.command("demo", async (ctx) => {
  await ctx.reply({
    text: renderTelegramRichText(demoMarkdown),
    parseMode: "HTML",
  });
});

bot.onText(async (ctx) => {
  const raw = ctx.text?.trim();
  if (!raw || raw.startsWith("/")) return;

  await ctx.reply({
    text: renderTelegramRichText(`You sent:\\n\\n${raw}`),
    parseMode: "HTML",
  });
});

void bot.launch();
