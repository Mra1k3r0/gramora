function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function isLikelyRealCode(raw: string): boolean {
  return /[{};]|=>|\b(class|function|const|let|var|import|export|return|if|for|while)\b/.test(raw);
}

function isCommandListBlock(raw: string): boolean {
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return false;

  const commandLineCount = lines.filter((l) =>
    /^[-*•]?\s*`?\/[a-zA-Z0-9_]+`?(?:\s*[-:]\s*.+)?$/.test(l),
  ).length;

  const commandTokenCount = (raw.match(/\/[a-zA-Z0-9_]+/g) ?? []).length;
  const ratio = commandLineCount / lines.length;
  return commandTokenCount >= 2 && ratio >= 0.6 && !isLikelyRealCode(raw);
}

export interface RenderTelegramRichTextOptions {
  commandListHeuristic?: boolean;
}

export function escapeTelegramHtml(text: string): string {
  return escapeHtml(text);
}

/**
 * Escapes user input for Telegram MarkdownV2 parse mode.
 * @see https://core.telegram.org/bots/api#markdownv2-style
 */
export function escapeTelegramMarkdownV2(text: string): string {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, "\\$1");
}

/** Markdown-ish input → Telegram HTML (`parseMode: "HTML"`). */
export function renderTelegramRichText(
  input: string,
  options?: RenderTelegramRichTextOptions,
): string {
  const useCommandListHeuristic = options?.commandListHeuristic !== false;
  const codeBlocks: string[] = [];
  let text = input;

  text = text.replace(/```([a-zA-Z0-9_-]+)?\n([\s\S]*?)```/g, (_f, _lang, code) => {
    const raw = String(code).replace(/\n$/, "");

    if (useCommandListHeuristic && isCommandListBlock(raw)) {
      return `\n${raw}\n`;
    }

    const token = `@@TGCODEBLOCK${codeBlocks.length}@@`;
    codeBlocks.push(`<pre><code>${escapeHtml(raw)}</code></pre>`);
    return token;
  });
  text = text.replace(/```+/g, "");
  text = escapeHtml(text);

  text = text.replace(/`([^`\n]+)`/g, (_full, inner) => {
    const raw = String(inner).trim();
    if (/^(?:\/[a-zA-Z0-9_]+(?:\s*[-:]\s*.+)?|[-*•]\s*\/[a-zA-Z0-9_]+.*)$/.test(raw)) return raw;
    return `<code>${raw}</code>`;
  });

  text = text.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
  text = text.replace(/__([^_]+)__/g, "<b>$1</b>");
  text = text.replace(/\*([^\n*]+)\*/g, "<i>$1</i>");
  text = text.replace(/_([^\n_]+)_/g, "<i>$1</i>");
  text = text.replace(/~~([^~]+)~~/g, "<s>$1</s>");
  text = text.replace(/\|\|([^|]+)\|\|/g, "<tg-spoiler>$1</tg-spoiler>");
  text = text.replace(/`/g, "");

  for (let i = 0; i < codeBlocks.length; i++) {
    text = text.replace(`@@TGCODEBLOCK${i}@@`, codeBlocks[i]);
  }
  text = text.replace(/@@TG[A-Z0-9_]+@@/g, "");

  text = text.replace(/\n{3,}/g, "\n\n");
  return text;
}
