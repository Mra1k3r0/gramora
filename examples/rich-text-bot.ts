import { Gramora, renderTelegramRichText } from "../src";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error("Set TELEGRAM_BOT_TOKEN before running the example.");

const bot = new Gramora({ token });

const demoMarkdown = `
**Gramora rich text demo**

Mix *italic* and _italic_, **bold** and __bold__, \`inline code\`, ~~strike~~, and ||spoiler text|| (e.g. \`npm run build\`).

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

bot.command("start", async (gram) => {
  await gram.reply({
    text: renderTelegramRichText(
      "**Rich text bot**\\n\\nTry /demo for fenced code, bold, italic, and inline code.",
    ),
    parseMode: "HTML",
  });
});

bot.command("demo", async (gram) => {
  await gram.reply({
    text: renderTelegramRichText(demoMarkdown),
    parseMode: "HTML",
  });
});

bot.onText(async (gram) => {
  const raw = gram.text?.trim();
  if (!raw || raw.startsWith("/")) return; // commands handled by bot.command

  await gram.reply({
    text: renderTelegramRichText(`You sent:\\n\\n${raw}`),
    parseMode: "HTML",
  });
});

void bot.launch();
