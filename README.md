# Gramora

![beta](https://img.shields.io/badge/beta-f59e0b?logo=github&logoColor=white&labelColor=6b7280)
[![9.6](https://img.shields.io/static/v1?label=&message=9.6&color=26A5E4&logo=telegram&logoColor=white&labelColor=6b7280)](https://core.telegram.org/bots/api)
![npm version](https://img.shields.io/npm/v/%40mra1k3r0%2Fgramora?label=&logo=npm&logoColor=white&labelColor=6b7280) <!-- ![npm package size](https://img.shields.io/packagephobia/install/%40mra1k3r0%2Fgramora?label=&logo=npm&logoColor=white&labelColor=6b7280) --> ![typescript usage](https://img.shields.io/github/languages/top/mra1k3r0/gramora?label=&logo=typescript&logoColor=white&labelColor=6b7280)

Advanced Telegram bot framework for TypeScript with a clean API, strong typing, and production-focused runtime controls.

## Why Gramora

- Quick API for most bots: `command`, `onText`, `onCallback`
- Advanced API when needed: decorators, modules, scenes
- Koa-style middleware pipeline (`ctx`, `next`)
- Smart sender methods with short + object styles
- Built-in runtime controls: timeout, proxy, user-agent, debug
- Polling and webhook transports with security-oriented defaults

## Installation

```bash
npm install @mra1k3r0/gramora@latest
```

## Quick Start

```ts
import { Gramora } from "@mra1k3r0/gramora";

const bot = new Gramora({ token: process.env.TELEGRAM_BOT_TOKEN! });

bot.command("start", async (gram) => {
  await gram.send("Hello from Gramora");
});

bot.onText(async (gram) => {
  await gram.send(`Echo: ${gram.text ?? ""}`);
});

void bot.launch();
// bot.launch().catch((err) => console.error("Bot launch failed:", err));
```

## Configuration

Default user-agent:

```text
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36
```

### Constructor options

| Option                   | Type               | Default          | Description                                                                                  |
| ------------------------ | ------------------ | ---------------- | -------------------------------------------------------------------------------------------- |
| `token`                  | `string`           | required         | Telegram bot token                                                                           |
| `mode`                   | `"full" \| "core"` | `"full"`         | `core` keeps runtime lightweight                                                             |
| `polling.timeout`        | `number`           | `20`             | Long-poll timeout (seconds)                                                                  |
| `polling.limit`          | `number`           | Telegram default | Max updates per poll                                                                         |
| `polling.allowedUpdates` | `string[]`         | Telegram default | Include e.g. `chat_member`, `chat_join_request`, `message_reaction` to receive those updates |
| `debug`                  | `boolean`          | `false`          | Enable runtime debug logs                                                                    |

### Runtime config (`.configure`)

| Key         | Type      | Description                                                                                                                                                                                   |
| ----------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `userAgent` | `string`  | Custom UA for Telegram API requests                                                                                                                                                           |
| `timeoutMs` | `number`  | Request timeout in milliseconds                                                                                                                                                               |
| `proxy`     | `string`  | HTTP(S) proxy URL, or `socks5://` / `socks5h://` (`socks5h` is normalized to `socks5` for undici). Uses undici `Socks5ProxyAgent` (Node may emit one experimental SOCKS5 warning per process) |
| `debug`     | `boolean` | Toggle debug logging at runtime                                                                                                                                                               |

```ts
import { Gramora } from "@mra1k3r0/gramora";

const bot = new Gramora({ token: process.env.TELEGRAM_BOT_TOKEN!, mode: "core" }).configure({
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  timeoutMs: 20000,
  proxy: "",
  debug: true,
});
```

For an authenticated HTTP CONNECT proxy, put credentials in the URL (for example `http://user:pass@host:8080`; percent-encode special characters in `user` or `pass`). Raise `timeoutMs` if the proxy is slow.

### Webhook config (`.configureWebhook`)

```ts
const bot = new Gramora({ token: process.env.TELEGRAM_BOT_TOKEN! }).configureWebhook({
  domain: "example.com",
  port: 8080,
  path: "/telegram/webhook", // optional
  secretToken: "randomAlphaNumericString", // optional
});

await bot.launch({ transport: "webhook" });
```

If `path` is omitted, Gramora auto-generates a secure token-derived path.

## Common Patterns

### Send text

```ts
bot.onText(async (gram) => {
  await gram.send(`You said: ${gram.text ?? ""}`);
});
```

```ts
await gram.send("hello");
await gram.send({ text: "reply", replyTo: gram.message?.message_id });
await gram.send({ text: "admin alert", chatId: 123456789 });
```

### Send media (short + advanced style)

```ts
await gram.photo("https://picsum.photos/500/300", "Random photo");
await gram.doc("https://example.com/report.pdf", "Report file");
await gram.video("https://example.com/video.mp4", "Video");
await gram.audio("https://example.com/song.mp3", "Audio");
await gram.animation("https://example.com/anim.gif", "Animation");
await gram.voice("https://example.com/voice.ogg", "Voice");
await gram.sticker("CAACAgUAAxkBAAIB...");
```

<details>
<summary><strong>Show advanced media examples (upload + album + options)</strong></summary>

Local upload support (path / buffer / stream):

```ts
import { createReadStream, readFileSync } from "node:fs";

await gram.video({ video: { path: "./media/demo.mp4", stream: true }, caption: "From path" });
await gram.photo({ photo: { buffer: readFileSync("./media/pic.jpg"), filename: "pic.jpg" } });
await gram.doc({
  document: { stream: createReadStream("./media/report.pdf"), filename: "report.pdf" },
  caption: "From stream",
});
```

Send multiple photos in one album:

```ts
await gram.sendMediaGroup({
  media: [
    { type: "photo", media: "https://picsum.photos/seed/1/900/600", caption: "Album cover" },
    { type: "photo", media: "https://picsum.photos/seed/2/900/600" },
    { type: "photo", media: "https://picsum.photos/seed/3/900/600" },
  ],
});
```

```ts
await gram.photo({
  photo: "https://picsum.photos/500/300",
  caption: "Random photo",
  parseMode: "HTML",
  replyTo: gram.message?.message_id,
  replyMarkup: undefined,
  silent: true,
  protect: true,
});
```

</details>

### Edit messages

```ts
bot.onCallback("edit:text", async (gram) => {
  await gram.editText("Updated text!");
});

await gram.editText({ text: "New text", messageId: 123, parseMode: "HTML" });
```

```ts
await gram.editCaption("New caption", messageId);
await gram.editReplyMarkup(Keyboard.inline().text("New button", "cb:1").build(), messageId);
await gram.editMedia({ type: "photo", media: "https://example.com/new.jpg", caption: "Swapped" });
```

### Delete messages

```ts
bot.command("del", async (gram) => {
  await gram.deleteMessage();
});

await gram.deleteMessage(messageId);
await gram.deleteMessages([101, 102, 103]);
```

### Forward and copy

```ts
await gram.forward(targetChatId);
await gram.copy(targetChatId);
```

```ts
await gram.forward({ chatId: targetChatId, fromChatId: sourceChatId, messageId: 42 });
await gram.copy({
  chatId: targetChatId,
  fromChatId: sourceChatId,
  messageId: 42,
  caption: "Copied!",
});
```

### Chat administration

```ts
const permissions = {
  can_send_messages: true,
  can_send_photos: true,
  can_send_videos: true,
  can_invite_users: false,
};

await gram.banMember(123456789);
await gram.unbanMember(123456789);
await gram.restrictMember(permissions, 123456789);
await gram.promoteMember(123456789, {
  can_delete_messages: true,
  can_restrict_members: true,
  can_invite_users: true,
});
await gram.setPermissions(permissions);
await gram.setAdminTitle("Moderator", 123456789);
```

### Group utilities

```ts
// Pin/unpin messages
await gram.pin(123); // message_id
await gram.unpin(); // unpin latest pinned
await gram.unpin(123); // unpin specific message_id
await gram.unpinAll(); // unpin all in chat

// Members
const me = await gram.getMember(gram.fromId!);
const admins = await gram.getAdmins();
const count = await gram.getMemberCount();
```

### Forum topics (supergroups)

```ts
const topic = await gram.createTopic("Support", { iconColor: 0x6fb9f0 });
await gram.editTopic({ messageThreadId: topic.message_thread_id, name: "Support / Help" });
await gram.closeTopic(topic.message_thread_id);
await gram.reopenTopic(topic.message_thread_id);
await gram.deleteTopic(topic.message_thread_id);
```

### Bot profile + commands

```ts
// Commands with scopes + localization
await bot.api.setMyCommands({
  commands: [
    { command: "start", description: "Start" },
    { command: "help", description: "Help" },
  ],
  scope: { type: "all_private_chats" },
  language_code: "en",
});

// Or via sender helpers
await bot.gram.setMyCommands({
  commands: [{ command: "start", description: "Start" }],
  scope: { type: "default" },
});

await bot.gram.getMyCommands();
await bot.gram.deleteMyCommands({ scope: { type: "default" } });

// Menu button (chat-specific or default)
await bot.gram.setMenuButton({ menuButton: { type: "commands" } });
await bot.gram.setMenuButton({
  chatId: 123456789,
  menuButton: { type: "web_app", text: "Open", web_app: { url: "https://example.com" } },
});

// Profile strings (optional localization)
await bot.gram.setMyName({ name: "Gramora Bot", languageCode: "en" });
await bot.gram.setMyDescription({ description: "Example bot", languageCode: "en" });
await bot.gram.setMyShortDescription({ shortDescription: "Demo", languageCode: "en" });
```

### Callback queries

```ts
import { Keyboard } from "@mra1k3r0/gramora";

bot.command("menu", async (gram) => {
  await gram.send(
    "Choose an action",
    Keyboard.inline()
      .text("Confirm", "action:confirm")
      .row()
      .text("Cancel", "action:cancel")
      .build(),
  );
});

bot.onCallback("action:*", async (gram) => {
  const action = gram.match?.[0];
  await gram.answer(`Clicked: ${action}`);
  await gram.send(`You selected: ${action}`);
});
```

Optional object form for `answer` (Telegram `url` / `cache_time`): `await gram.answer({ url: "https://example.com", cacheTime: 3600 });`

### Chat typing, metadata, and invite links

```ts
await gram.sendChatAction("typing");
const chat = await gram.getChat();
const link = await gram.exportInviteLink();
const scoped = await gram.createInviteLink({ name: "mods", memberLimit: 50 });
```

Use `bot.gram.withChat(chatId).sendChatAction("upload_document")` when there is no message-derived `chatId` in context.

### Middleware (Koa style)

```ts
bot.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  console.log(`update ${ctx.update.update_id} took ${Date.now() - start}ms`);
});
```

```ts
import type { BaseContext, MiddlewareFn } from "@mra1k3r0/gramora";

const authOnly: MiddlewareFn<BaseContext> = async (ctx, next) => {
  if (ctx.fromId !== 123456789) return;
  await next();
};

bot.use(authOnly);
```

### Inline mode

```ts
import { InlineResult } from "@mra1k3r0/gramora";

bot.onInline(async (gram) => {
  const results = InlineResult.builder()
    .article("Hello", InlineResult.textContent("Hello from Gramora!"), {
      description: "Send a greeting",
    })
    .article("Docs", InlineResult.textContent("https://github.com/mra1k3r0/gramora"), {
      description: "Link to docs",
    })
    .build();

  await gram.answerInline(results, { cacheTime: 10 });
});
```

<details>
<summary><strong>Show more inline result examples</strong></summary>

Single result helpers (no builder needed):

```ts
const article = InlineResult.article("Title", InlineResult.textContent("Body text"));
const photo = InlineResult.photo("https://example.com/img.jpg", "https://example.com/thumb.jpg");
await gram.answerInline([article, photo]);
```

Builder with multiple result types:

```ts
const results = InlineResult.builder()
  .photo("https://picsum.photos/500/300", "https://picsum.photos/100/60", { caption: "Random" })
  .gif("https://example.com/anim.gif", "https://example.com/anim_thumb.gif")
  .document("Report", "https://example.com/report.pdf", "application/pdf")
  .cachedPhoto("AgACAgIAAxk...")
  .build();
```

</details>

### Observability hooks

```ts
import type { BotHooks } from "@mra1k3r0/gramora";

const hooks: BotHooks = {
  onUpdateError(update, error) {
    console.error(`update ${update.update_id} failed`, error);
  },
  onUpdateProcessed(update, durationMs) {
    console.log(`update ${update.update_id} handled in ${durationMs}ms`);
  },
  onPollingError(error, retryDelayMs) {
    console.warn(`polling error, retrying in ${retryDelayMs}ms`, error);
  },
};

const bot = new Gramora({ token: process.env.TELEGRAM_BOT_TOKEN!, hooks });
```

Hooks fire from the bot runtime, not the middleware chain. `onUpdateError` is called after the built-in debug log but before the update is discarded, so you can forward errors to Sentry / Datadog without middleware.

### Rate limiter profiles

```ts
import { rateLimiter, type RateProfile } from "@mra1k3r0/gramora";

// simple: 30 actions per minute per user (backwards-compatible shorthand)
bot.use(rateLimiter(30));

// profile: 5 per 10 seconds per chat, custom exceeded handler
const profile: RateProfile = {
  maxPerWindow: 5,
  windowMs: 10_000,
  by: "chat",
  onExceeded: async (ctx) => {
    await ctx.reply("slow down please");
  },
};
bot.use(rateLimiter(profile));
```

### Structured errors

```ts
import { TelegramApiError, RateLimitError, ValidationError } from "@mra1k3r0/gramora";

try {
  await gram.send({ text: "hello" });
} catch (err) {
  if (err instanceof RateLimitError) {
    console.warn(`rate limited, retry after ${err.retryAfter}s`);
  } else if (err instanceof ValidationError) {
    console.error(`bad input field="${err.field}": ${err.message}`);
  } else if (err instanceof TelegramApiError) {
    console.error(`telegram error ${String(err.errorCode)}: ${err.message}`);
  }
}
```

`RateLimitError` extends `TelegramApiError` and carries `retryAfter` (seconds from Telegram's `parameters.retry_after`). `ValidationError` is thrown by `GramClient` and `BaseContext` before the network call when text/caption/answer text exceeds Telegram's limits (4096 / 1024 / 200 chars).

### Modules and lazy modules

```ts
import type { BotModule } from "@mra1k3r0/gramora";

export const AdminModule: BotModule = (bot) => {
  bot.command("ping", async (gram) => {
    await gram.send("pong");
  });
};
```

```ts
bot.module(AdminModule);
bot.lazyModule(() => import("./modules/admin.module").then((m) => m.AdminModule));
```

### OOP global sender

```ts
await bot.gram.withChat(123456789).send("Server started");
await bot.gram.withChat(123456789).photo("https://picsum.photos/200/200", "Health image");
```

### Decorator/scene style (full mode)

<details>
<summary><strong>Show decorator + scene example</strong></summary>

```ts
import { Command, Controller, Gramora, Scene, SceneContext, Step } from "@mra1k3r0/gramora";

@Controller()
class RegisterEntry {
  @Command("register")
  async register(ctx: SceneContext) {
    await ctx.scene.enter("register");
    await ctx.reply("What is your name?");
  }
}

@Scene("register")
class RegisterScene {
  @Step(1)
  async stepName(ctx: SceneContext) {
    ctx.scene.state.name = ctx.text ?? "Unknown";
    await ctx.scene.next();
    await ctx.reply("How old are you?");
  }

  @Step(2)
  async stepAge(ctx: SceneContext) {
    ctx.scene.state.age = ctx.text ?? "Unknown";
    await ctx.reply(
      `Saved: name=${String(ctx.scene.state.name)}, age=${String(ctx.scene.state.age)}`,
    );
    await ctx.scene.leave();
  }
}

const bot = new Gramora({ token: process.env.TELEGRAM_BOT_TOKEN!, mode: "full" });
```

</details>

## Logging and Debug

With `debug: true`, Gramora logs:

| Scope          | What you see                                                                          |
| -------------- | ------------------------------------------------------------------------------------- |
| `api.request`  | Method name + sanitized JSON params (uploads summarized, not raw bytes)               |
| `api.response` | Success: method + duration + `result` payload; Telegram errors: full `ok: false` body |
| `api.error`    | Thrown errors after a request (except long-poll aborts, see below)                    |
| `api.poll`     | `getUpdates` long-poll aborted/timed out (normal with long `timeout`)                 |
| `update`       | Each update: `update_id`, detected kind, handle duration or failure message           |
| `payload`      | Pretty-printed update JSON (truncated at ~48k chars to avoid huge logs)               |
| `transport`    | Polling vs webhook startup and listen URL/port/path                                   |
| `lifecycle`    | `getMe` identity on connect; stop events                                              |
| `mw.logger`    | If you `use(logger)` — per-update timing                                              |
| `mw.error`     | If you `use(errorHandler)` — caught handler errors                                    |

Compared to [Telegraf’s `debug` namespaces](https://github.com/telegraf/telegraf/blob/v4/src/telegraf.ts) (`telegraf:main`, `telegraf:webhook`, etc.): Gramora does **not** yet log webhook rejects (wrong path vs wrong secret) at debug level, does **not** assign per–middleware-chain namespaces, and has **no built-in handler timeout** (Telegraf defaults to 90s with timeout errors). Polling retries on errors are silent unless the failure surfaces elsewhere.

## API Overview

| Area            | Main APIs                                                                                                                                                                                                                                                                                                                                                                                                         |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bot             | `command`, `onText`, `onMessage`, `onCallback`, `onInline`, `onInlineQuery`, `onShippingQuery`, `onPreCheckoutQuery`, `onChatMember`, `onMyChatMember`, `onChatJoinRequest`, `onMessageReaction`, `onMessageReactionCount`, `onBusinessConnection`, `onBusinessMessage`, `onEditedBusinessMessage`, `onDeletedBusinessMessages`, `use`, `module`, `lazyModule`, `launch`, `stop`, `configure`, `configureWebhook` |
| Handler context | `send`, `photo`, `doc`, `audio`, `video`, `animation`, `voice`, `sticker`, `answer` (text/alert or options), `text`, `chatId`, `fromId`                                                                                                                                                                                                                                                                           |
| Edit/delete     | `editText`, `editCaption`, `editReplyMarkup`, `editMedia`, `deleteMessage`, `deleteMessages`                                                                                                                                                                                                                                                                                                                      |
| Lifecycle       | `forward`, `copy`                                                                                                                                                                                                                                                                                                                                                                                                 |
| Chat admin      | `banMember`, `unbanMember`, `restrictMember`, `promoteMember`, `setPermissions`, `setAdminTitle`                                                                                                                                                                                                                                                                                                                  |
| Group utilities | `pin`, `unpin`, `unpinAll`, `getMember`, `getAdmins`, `getMemberCount`, `createTopic`, `editTopic`, `closeTopic`, `reopenTopic`, `deleteTopic`, `sendChatAction`, `getChat`, `leaveChat`, `exportInviteLink`, `createInviteLink`                                                                                                                                                                                  |
| Bot profile     | `setMyCommands`, `getMyCommands`, `deleteMyCommands`, `setMenuButton`, `getMenuButton`, `setMyName`, `setMyDescription`, `setMyShortDescription`                                                                                                                                                                                                                                                                  |
| Payments        | `sendInvoice`, `createInvoiceLink` (Telegram payment URL), `answerShippingQuery`, `answerShipping`, `answerPreCheckoutQuery`, `refundStarPayment`                                                                                                                                                                                                                                                                 |
| Inline mode     | `answerInline`, `InlineResult.builder()`, `InlineResult.article()`, `InlineResult.photo()`, `InlineResult.textContent()`                                                                                                                                                                                                                                                                                          |
| Global sender   | `bot.gram.withChat(chatId).send/photo/editText/deleteMessage/forward/copy/...`                                                                                                                                                                                                                                                                                                                                    |
| Raw control     | `gram.api` exposes a **growing typed subset** of Bot API methods (see `ApiClient` / `TelegramApiMethods`); methods not listed there are not callable on `gram.api` yet                                                                                                                                                                                                                                            |
| Decorators      | `@Controller`, `@Command`, `@On`, `@CallbackQuery`, `@InlineQuery`, `@OnChatMember`, `@OnMyChatMember`, `@OnChatJoinRequest`, `@OnMessageReaction`, `@OnMessageReactionCount`, `@OnBusinessConnection`, `@OnBusinessMessage`, `@OnEditedBusinessMessage`, `@OnDeletedBusinessMessages`, `@Guard`, `@UseMiddleware`, `@Scene`, `@Step`                                                                             |

## Telegram Coverage

<details>
<summary><strong>Show Telegram coverage matrix</strong></summary>

| Area                                    | Status                                                                                                                         |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Core messaging                          | Implemented                                                                                                                    |
| Media sending                           | Implemented (major methods)                                                                                                    |
| Edit/delete messages                    | Implemented                                                                                                                    |
| Forward/copy messages                   | Implemented                                                                                                                    |
| Callback queries                        | Implemented                                                                                                                    |
| Inline mode                             | Implemented                                                                                                                    |
| Scenes/session                          | Implemented (core)                                                                                                             |
| Middleware                              | Implemented                                                                                                                    |
| Polling/webhook transports              | Implemented (core)                                                                                                             |
| Chat admin/moderation                   | Implemented (core methods)                                                                                                     |
| Group utilities                         | Implemented (core methods)                                                                                                     |
| Bot profile/commands                    | Implemented (core methods)                                                                                                     |
| Payments                                | Implemented (sendInvoice, createInvoiceLink, shipping/pre-checkout answers, star refunds)                                      |
| Full update/event coverage              | Improved (chat_member, my_chat_member, chat_join_request, reactions, business updates typed + routed; use `allowed_updates`)   |
| High-frequency chat APIs                | Partial (join-request approve/decline and reaction _send_ APIs on `ApiClient` still mostly missing; shortcut sends, etc.)      |
| Webhook hardening                       | Implemented (200-first ack; handler errors don't trigger Telegram retries; 429 `retry_after` respected in polling)             |
| Production safety                       | Implemented (`RateLimitError`+`ValidationError`; per-user/chat rate profiles; pre-flight length checks on text/caption/answer) |
| Dev ergonomics (filters/session/format) | Partial (middleware + scenes; no Telegraf-style filters/session/MarkdownV2 escaper bundle)                                     |

</details>

### Build Roadmap

1. Media expansion (`sendAudio`, `sendVideo`, `sendAnimation`, `sendVoice`, `sendSticker`) ![implemented](https://img.shields.io/badge/implemented-10b981)
2. Edit/delete completion (`editCaption`, `editReplyMarkup`, message lifecycle helpers) ![implemented](https://img.shields.io/badge/implemented-10b981)
3. Inline mode completion (`answerInlineQuery` + builders) ![implemented](https://img.shields.io/badge/implemented-10b981)
4. Chat administration APIs (ban/unban/restrict/promote, permissions) ![implemented](https://img.shields.io/badge/implemented-10b981)
5. Group/supergroup utilities (pin/unpin, forum topics, members) ![implemented](https://img.shields.io/badge/implemented-10b981)
6. Bot profile + command management (scopes, localized commands, menu buttons) ![implemented](https://img.shields.io/badge/implemented-10b981)
7. Payments and commerce flow (invoice, shipping, pre-checkout) ![implemented](https://img.shields.io/badge/implemented-10b981)
8. Advanced update types (chat_member, reactions, join requests, business events) ![implemented](https://img.shields.io/badge/implemented-10b981)
9. Webhook hardening (retry strategy, observability hooks) ![implemented](https://img.shields.io/badge/implemented-10b981)
10. Production safety layer (rate profiles, validation, structured errors) ![implemented](https://img.shields.io/badge/implemented-10b981)
11. High-frequency Bot API + sender parity (remaining: join-request approve/decline, reactions, `sendLocation` / `sendVenue` / `sendContact` / `sendDice`, broader `TelegramApiMethods` + `GramClient`; note `sendPoll` / `stopPoll` are on `ApiClient` only today) ![planned](https://img.shields.io/badge/planned-64748b)
12. Router ergonomics (typed update filters / narrowing, optional pluggable session outside scenes, MarkdownV2-safe escapers alongside `renderTelegramRichText`) ![planned](https://img.shields.io/badge/planned-64748b)
13. Operations/debug parity (optional debug logs for webhook path/secret mismatches, configurable handler timeout + timeout logs, quieter or structured polling retry logging) ![planned](https://img.shields.io/badge/planned-64748b)

## Run and Test

Set token (Windows cmd):

```bash
set TELEGRAM_BOT_TOKEN=your_token_here
```

Build and run:

```bash
npm run build
node dist/examples/echo-bot.js
```

## Performance Toolkit

```bash
npm run bench
npm run size
```

## Local Development

```bash
npm install
npm run check
npm run build
```

## Included Examples

- [examples/echo-bot.ts](https://github.com/mra1k3r0/gramora/blob/master/examples/echo-bot.ts)
- [examples/scene-bot.ts](https://github.com/mra1k3r0/gramora/blob/master/examples/scene-bot.ts)
- [examples/config-bot.ts](https://github.com/mra1k3r0/gramora/blob/master/examples/config-bot.ts)
- [examples/callback-menu-bot.ts](https://github.com/mra1k3r0/gramora/blob/master/examples/callback-menu-bot.ts)
- [examples/media-advanced-bot.ts](https://github.com/mra1k3r0/gramora/blob/master/examples/media-advanced-bot.ts)
- [examples/middleware-auth-bot.ts](https://github.com/mra1k3r0/gramora/blob/master/examples/middleware-auth-bot.ts)
- [examples/module-bot.ts](https://github.com/mra1k3r0/gramora/blob/master/examples/module-bot.ts)
- [examples/lazy-module-bot.ts](https://github.com/mra1k3r0/gramora/blob/master/examples/lazy-module-bot.ts)
- [examples/rich-text-bot.ts](https://github.com/mra1k3r0/gramora/blob/master/examples/rich-text-bot.ts) (`renderTelegramRichText` + `parseMode: "HTML"`)

---

> **Note**
>
> Gramora is a student/practice project exploring Telegram bot framework design in TypeScript.
> It’s inspired by [Telegraf](https://github.com/telegraf/telegraf), but it is **not** a drop-in replacement or a production-complete alternative.
>
> The API is still evolving and may include incomplete features or breaking changes.
> Use it for learning, experimentation, and prototyping, and review carefully before production use.
