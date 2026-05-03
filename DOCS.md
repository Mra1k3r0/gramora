# Gramora Documentation

## Table of Contents

- [Getting Started](#getting-started)
- [Configuration](#configuration)
  - [Constructor Options](#constructor-options)
  - [Runtime Configuration (`configure`)](#runtime-configuration-configure)
  - [Bot API networking](#bot-api-networking)
  - [Webhook Configuration (`configureWebhook`)](#webhook-configuration-configurewebhook)
- [Core Usage Patterns](#core-usage-patterns)
  - [Sending Messages](#sending-messages)
  - [Media](#media)
  - [Editing and Deleting](#editing-and-deleting)
  - [Forward and Copy](#forward-and-copy)
  - [Location, Polls, Reactions, Join Requests](#location-polls-reactions-join-requests)
  - [Chat Administration](#chat-administration)
  - [Group Utilities](#group-utilities)
  - [Forum Topics](#forum-topics)
  - [Bot Profile and Commands](#bot-profile-and-commands)
  - [Callbacks](#callbacks)
  - [Inline Mode](#inline-mode)
- [Middleware](#middleware)
- [Observability Hooks](#observability-hooks)
- [Rate Limiter Profiles](#rate-limiter-profiles)
- [Structured Errors](#structured-errors)
- [Modules and Lazy Modules](#modules-and-lazy-modules)
- [Global Sender](#global-sender)
- [Decorator and Scene Mode](#decorator-and-scene-mode)
- [Logging and Debug](#logging-and-debug)
- [API Overview](#api-overview)
- [Telegram Coverage](#telegram-coverage)
- [Development and Validation](#development-and-validation)
- [Examples](#examples)
- [Project Notes](#project-notes)

## Getting Started

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
```

## Configuration

Default user-agent:

```text
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36
```

### Constructor Options

| Option                                  | Type                                               | Default                | Description                                                                                        |
| --------------------------------------- | -------------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------- |
| `token`                                 | `string`                                           | required               | Telegram bot token                                                                                 |
| `mode`                                  | `"full" \| "core"`                                 | `"full"`               | `core` keeps runtime lightweight                                                                   |
| `polling.timeout`                       | `number`                                           | `20`                   | Long-poll timeout (seconds)                                                                        |
| `polling.limit`                         | `number`                                           | Telegram default       | Max updates per poll                                                                               |
| `polling.allowedUpdates`                | `string[]`                                         | Telegram default       | Include update kinds like `chat_member`, `chat_join_request`, `message_reaction`                   |
| `userAgent`                             | `string`                                           | default UA             | Telegram Bot API request user-agent                                                                |
| `timeoutMs`                             | `number`                                           | `15000`                | Bot API request timeout (ms); long-polls extend automatically                                      |
| `proxy`                                 | `string` \| undici `Dispatcher`                    | none                   | URL (built-in agents) or custom dispatcher (e.g. `ProxyAgent`); [below](#bot-api-networking)       |
| `httpTransport`                         | `TelegramHttpTransport`                            | none                   | Custom POST handler instead of undici ![beta](https://img.shields.io/badge/beta-yellow?style=flat) |
| `debug`                                 | `boolean`                                          | `false`                | Enable runtime debug logs                                                                          |
| `operations.handlerTimeoutMs`           | `number`                                           | disabled               | Per-update handler timeout in ms                                                                   |
| `operations.logWebhookRejects`          | `boolean`                                          | `false`                | Debug-log webhook path/secret mismatches                                                           |
| `operations.pollingRetryLogs`           | `"quiet"\| "structured"`                           | `"structured"`         | Control polling retry debug logs                                                                   |
| `operations.webhookMaxBodyBytes`        | `number`                                           | `1048576`              | Max webhook request body size before `413`                                                         |
| `operations.webhookAllowedContentTypes` | `string[]`                                         | `["application/json"]` | Allowed webhook content types                                                                      |
| `operations.pollingRetryBaseMs`         | `number`                                           | `1000`                 | Base polling retry delay in milliseconds                                                           |
| `operations.pollingRetryMaxMs`          | `number`                                           | `30000`                | Max polling retry delay in milliseconds                                                            |
| `operations.pollingRetryOn`             | `("rate_limit"\| "network"\| "api"\| "unknown")[]` | all listed             | Retry-eligible polling error classes                                                               |

### Runtime Configuration (`configure`)

| Key             | Type                     | Description                                                                                                                  |
| --------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `userAgent`     | `string`                 | Custom UA for Telegram API requests                                                                                          |
| `timeoutMs`     | `number`                 | Request timeout in milliseconds                                                                                              |
| `proxy`         | `string` \| `Dispatcher` | URL or undici dispatcher ([below](#bot-api-networking)); `configure({ proxy: undefined })` clears                            |
| `httpTransport` | `TelegramHttpTransport`  | Replace undici for Bot API POSTs ![beta](https://img.shields.io/badge/beta-yellow?style=flat) ([below](#bot-api-networking)) |
| `debug`         | `boolean`                | Toggle debug logging at runtime                                                                                              |

```ts
const bot = new Gramora({ token: process.env.TELEGRAM_BOT_TOKEN!, mode: "core" }).configure({
  timeoutMs: 20000,
  proxy: "",
  debug: true,
});
```

#### Bot API networking

Gramora calls Telegram over [`undici`](https://undici.nodejs.org/) `fetch` unless you plug in something else:

| Option                                                                       | Still uses undici `fetch`? | Typical reason                                                                                                                                                         |
| ---------------------------------------------------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `proxy` ![URL](https://img.shields.io/badge/URL-blue?style=flat)             | Yes                        | Built-in `ProxyAgent` / `Socks5ProxyAgent` from a string.                                                                                                              |
| `proxy` ![obj](https://img.shields.io/badge/obj-orange?style=flat)           | Yes                        | Your undici [`Dispatcher`](https://undici.nodejs.org/#/docs/api/Dispatcher), e.g. `ProxyAgent` with extra options ([similar idea](https://grammy.dev/advanced/proxy)). |
| `httpTransport` ![beta](https://img.shields.io/badge/beta-yellow?style=flat) | No                         | Bring your own HTTP client (`TelegramHttpTransport`).                                                                                                                  |

**Precedence:** `httpTransport` wins over `proxy`. Same keys work in `.configure({ … })`.

**Proxy URL**

```ts
import { Gramora } from "@mra1k3r0/gramora";

const bot = new Gramora({
  token: process.env.TELEGRAM_BOT_TOKEN!,
  proxy: "http://127.0.0.1:8080",
  // proxy: "http://user:pass@proxy:8080",
  // proxy: "https://proxy.example:8443",
  // proxy: "socks5://127.0.0.1:1080",
  // proxy: "socks5h://127.0.0.1:1080", // hostname resolved via proxy
});
```

**Undici `ProxyAgent`**

```ts
import { Gramora } from "@mra1k3r0/gramora";
import { ProxyAgent } from "undici";

const bot = new Gramora({
  token: process.env.TELEGRAM_BOT_TOKEN!,
  proxy: new ProxyAgent({ uri: "http://proxy:8080" }),
  // proxy: new ProxyAgent({ uri: "https://user:pass@proxy:8443" }),
  // proxy: new Socks5ProxyAgent("socks5://127.0.0.1:1080"),
  // proxy: new Socks5ProxyAgent("socks5h://127.0.0.1:1080"),
});
```

**`httpTransport`** ![beta](https://img.shields.io/badge/beta-yellow?style=flat)

- Install **`axios`** yourself (not a Gramora dependency).
- For proxies, install **`http-proxy-agent`** / **`https-proxy-agent`** and/or **`socks-proxy-agent`** and pass `httpAgent` / `httpsAgent` into `axios.post`.

```ts
import axios from "axios";
import { Gramora, type TelegramHttpTransport } from "@mra1k3r0/gramora";
import { HttpProxyAgent } from "http-proxy-agent";
import { HttpsProxyAgent } from "https-proxy-agent";
// import { SocksProxyAgent } from "socks-proxy-agent";

const proxyUrl = "http://127.0.0.1:8080";

const httpTransport: TelegramHttpTransport = async ({ url, headers, body, timeoutMs, signal }) => {
  /* HTTP CONNECT — comment out if you use SOCKS below */
  const httpAgent = new HttpProxyAgent(proxyUrl);
  const httpsAgent = new HttpsProxyAgent(proxyUrl);

  /* SOCKS — comment out the HTTP block above when using this */
  // const socksAgent = new SocksProxyAgent("socks5://127.0.0.1:1080");
  // const httpAgent = socksAgent;
  // const httpsAgent = socksAgent;

  const { status, data } = await axios.post(url, body ?? {}, {
    headers,
    timeout: timeoutMs,
    signal,
    validateStatus: () => true,
    httpAgent,
    httpsAgent,
  });
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  };
};

const bot = new Gramora({
  token: process.env.TELEGRAM_BOT_TOKEN!,
  httpTransport,
});
```

### Webhook Configuration (`configureWebhook`)

```ts
const bot = new Gramora({ token: process.env.TELEGRAM_BOT_TOKEN! }).configureWebhook({
  domain: "example.com",
  port: 8080,
  path: "/telegram/webhook",
  secretToken: "randomAlphaNumericString",
});

await bot.launch({ transport: "webhook" });
```

If `path` is omitted, Gramora auto-generates a secure token-derived path.

## Core Usage Patterns

### Sending Messages

```ts
await gram.send("hello");
await gram.send({ text: "reply", replyTo: gram.message?.message_id });
await gram.send({ text: "admin alert", chatId: 123456789 });
```

### Media

```ts
await gram.photo("https://picsum.photos/500/300", "Random photo");
await gram.doc("https://example.com/report.pdf", "Report file");
await gram.video("https://example.com/video.mp4", "Video");
await gram.audio("https://example.com/song.mp3", "Audio");
await gram.animation("https://example.com/anim.gif", "Animation");
await gram.voice("https://example.com/voice.ogg", "Voice");
await gram.sticker("CAACAgUAAxkBAAIB...");
```

Advanced upload styles:

```ts
import { createReadStream, readFileSync } from "node:fs";

await gram.video({ video: { path: "./media/demo.mp4", stream: true }, caption: "From path" });
await gram.photo({ photo: { buffer: readFileSync("./media/pic.jpg"), filename: "pic.jpg" } });
await gram.doc({
  document: { stream: createReadStream("./media/report.pdf"), filename: "report.pdf" },
  caption: "From stream",
});
```

### Editing and Deleting

```ts
await gram.editText("Updated text");
await gram.editCaption("New caption", 123);
await gram.editReplyMarkup(undefined, 123);
await gram.deleteMessage(123);
await gram.deleteMessages([101, 102, 103]);
```

### Forward and Copy

```ts
await gram.forward({ chatId: 10001, fromChatId: 10002, messageId: 42 });
await gram.copy({ chatId: 10001, fromChatId: 10002, messageId: 42, caption: "Copied" });
```

### Location, Polls, Reactions, Join Requests

```ts
await gram.location(48.8584, 2.2945);
await gram.dice("🎲");
await gram.poll({ question: "Tea or coffee?", options: ["Tea", "Coffee"] });
await gram.stopPoll(123);
await gram.setMessageReaction({ messageId: 123, reaction: [{ type: "emoji", emoji: "👍" }] });
await gram.approveJoinRequest(123456789);
await gram.declineJoinRequest(123456789);
```

### Chat Administration

```ts
await gram.banMember(123456789);
await gram.unbanMember(123456789);
await gram.promoteMember(123456789, { can_delete_messages: true });
await gram.setAdminTitle("Moderator", 123456789);
```

### Group Utilities

```ts
await gram.pin(123);
await gram.unpin();
await gram.unpinAll();
const admins = await gram.getAdmins();
```

### Forum Topics

```ts
const topic = await gram.createTopic("Support");
await gram.editTopic({ messageThreadId: topic.message_thread_id, name: "Support / Help" });
await gram.closeTopic(topic.message_thread_id);
await gram.reopenTopic(topic.message_thread_id);
await gram.deleteTopic(topic.message_thread_id);
```

### Bot Profile and Commands

```ts
await bot.api.setMyCommands({
  commands: [{ command: "start", description: "Start" }],
  scope: { type: "default" },
});
await bot.gram.getMyCommands();
await bot.gram.setMenuButton({ menuButton: { type: "commands" } });
```

### Callbacks

```ts
bot.onCallback("action:*", async (gram) => {
  const action = gram.match?.[0];
  await gram.answer(`Clicked: ${action}`);
});
```

### Inline Mode

```ts
import { InlineResult } from "@mra1k3r0/gramora";

bot.onInline(async (gram) => {
  const results = InlineResult.builder()
    .article("Hello", InlineResult.textContent("Hello from Gramora"))
    .build();
  await gram.answerInline(results, { cacheTime: 10 });
});
```

## Middleware

```ts
bot.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  console.log(`update ${ctx.update.update_id} took ${Date.now() - start}ms`);
});
```

## Observability Hooks

```ts
const bot = new Gramora({
  token: process.env.TELEGRAM_BOT_TOKEN!,
  hooks: {
    onUpdateError(update, error) {
      console.error(`update ${update.update_id} failed`, error);
    },
  },
});
```

## Rate Limiter Profiles

```ts
import { rateLimiter } from "@mra1k3r0/gramora";

bot.use(rateLimiter(30));
bot.use(
  rateLimiter({
    maxPerWindow: 5,
    windowMs: 10_000,
    by: "chat",
  }),
);
```

## Structured Errors

```ts
import { RateLimitError, TelegramApiError, ValidationError } from "@mra1k3r0/gramora";
```

`RateLimitError` extends `TelegramApiError` and includes `retryAfter`.  
`ValidationError` is thrown before network calls for invalid input shapes/limits.

## Modules and Lazy Modules

```ts
import type { BotModule } from "@mra1k3r0/gramora";

export const AdminModule: BotModule = (bot) => {
  bot.command("ping", async (gram) => {
    await gram.send("pong");
  });
};

bot.module(AdminModule);
bot.lazyModule(() => import("./modules/admin.module").then((m) => m.AdminModule));
```

## Global Sender

```ts
await bot.gram.withChat(123456789).send("Server started");
await bot.gram.withChat(123456789).photo("https://picsum.photos/200/200", "Health image");
```

## Decorator and Scene Mode

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
}
```

## Logging and Debug

With `debug: true`, Gramora emits structured logs for:

- `api.request`, `api.response`, `api.error`, `api.poll`
- `update`, `payload`, `transport`, `lifecycle`

Operational toggles:

- `operations.logWebhookRejects`
- `operations.handlerTimeoutMs`
- `operations.pollingRetryLogs`

## API Overview

| Area            | Main APIs                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bot             | `command`, `onText`, `onMessage`, `onCallback`, `onInline`, `onInlineQuery`, `onShippingQuery`, `onPreCheckoutQuery`, `onChatMember`, `onMyChatMember`, `onChatJoinRequest`, `onMessageReaction`, `onMessageReactionCount`, `onBusinessConnection`, `onBusinessMessage`, `onEditedBusinessMessage`, `onDeletedBusinessMessages`, `onFilter`, `use`, `module`, `lazyModule`, `launch`, `stop`, `configure`, `configureWebhook` |
| Handler context | `send`, `photo`, `doc`, `audio`, `video`, `animation`, `voice`, `sticker`, `location`, `venue`, `contact`, `dice`, `poll`, `stopPoll`, `approveJoinRequest`, `declineJoinRequest`, `setMessageReaction`, `answer` (text/alert or options), `text`, `chatId`, `fromId`                                                                                                                                                         |
| Edit/delete     | `editText`, `editCaption`, `editReplyMarkup`, `editMedia`, `deleteMessage`, `deleteMessages`                                                                                                                                                                                                                                                                                                                                  |
| Lifecycle       | `forward`, `copy`                                                                                                                                                                                                                                                                                                                                                                                                             |
| Chat admin      | `banMember`, `unbanMember`, `restrictMember`, `promoteMember`, `setPermissions`, `setAdminTitle`                                                                                                                                                                                                                                                                                                                              |
| Group utilities | `pin`, `unpin`, `unpinAll`, `getMember`, `getAdmins`, `getMemberCount`, `createTopic`, `editTopic`, `closeTopic`, `reopenTopic`, `deleteTopic`, `sendChatAction`, `getChat`, `leaveChat`, `exportInviteLink`, `createInviteLink`                                                                                                                                                                                              |
| Bot profile     | `setMyCommands`, `getMyCommands`, `deleteMyCommands`, `setMenuButton`, `getMenuButton`, `setMyName`, `setMyDescription`, `setMyShortDescription`                                                                                                                                                                                                                                                                              |
| Payments        | `sendInvoice`, `createInvoiceLink` (Telegram payment URL), `answerShippingQuery`, `answerShipping`, `answerPreCheckoutQuery`, `getMyStarBalance`, `getStarTransactions`, `refundStarPayment`, `editUserStarSubscription`                                                                                                                                                                                                      |
| Inline mode     | `answerInline`, `InlineResult.builder()`, `InlineResult.article()`, `InlineResult.photo()`, `InlineResult.textContent()`                                                                                                                                                                                                                                                                                                      |
| Global sender   | `bot.gram.withChat(chatId).send/photo/editText/deleteMessage/forward/copy/...`                                                                                                                                                                                                                                                                                                                                                |
| Raw control     | `gram.api` exposes a growing typed subset of Bot API methods (see `ApiClient` and `TelegramApiMethods`)                                                                                                                                                                                                                                                                                                                       |
| Decorators      | `@Controller`, `@Command`, `@On`, `@CallbackQuery`, `@InlineQuery`, `@OnChatMember`, `@OnMyChatMember`, `@OnChatJoinRequest`, `@OnMessageReaction`, `@OnMessageReactionCount`, `@OnBusinessConnection`, `@OnBusinessMessage`, `@OnEditedBusinessMessage`, `@OnDeletedBusinessMessages`, `@Guard`, `@UseMiddleware`, `@Scene`, `@Step`                                                                                         |

## Telegram Coverage

| Area                                    | Status                                                                                                                                                                      |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Core messaging                          | Implemented                                                                                                                                                                 |
| Media sending                           | Implemented (major methods)                                                                                                                                                 |
| Edit/delete messages                    | Implemented                                                                                                                                                                 |
| Forward/copy messages                   | Implemented                                                                                                                                                                 |
| Callback queries                        | Implemented                                                                                                                                                                 |
| Inline mode                             | Implemented                                                                                                                                                                 |
| Scenes/session                          | Implemented (core)                                                                                                                                                          |
| Middleware                              | Implemented                                                                                                                                                                 |
| Polling/webhook transports              | Implemented (core)                                                                                                                                                          |
| Chat admin/moderation                   | Implemented (core methods)                                                                                                                                                  |
| Group utilities                         | Implemented (core methods)                                                                                                                                                  |
| Bot profile/commands                    | Implemented (core methods)                                                                                                                                                  |
| Payments                                | Implemented (sendInvoice, createInvoiceLink, shipping/pre-checkout answers, recurring-payment fields, Stars balance/transactions/subscription controls, star refunds)       |
| Full update/event coverage              | Improved (chat_member, my_chat_member, chat_join_request, reactions, business updates typed + routed; use `allowed_updates`)                                                |
| High-frequency chat APIs                | Implemented (join-request approve/decline, `setMessageReaction`, location/venue/contact/dice/poll shortcuts on `GramClient`; matching `ApiClient` and `TelegramApiMethods`) |
| Webhook hardening                       | Implemented (200-first ack; handler errors do not trigger Telegram retries; 429 `retry_after` respected in polling)                                                         |
| Production safety                       | Implemented (`RateLimitError` and `ValidationError`; per-user/chat rate profiles; pre-flight length checks on text/caption/answer)                                          |
| Dev ergonomics (filters/session/format) | Implemented (`onFilter` + typed update guards, pluggable `session(...)` middleware, MarkdownV2 escapers)                                                                    |

## Development and Validation

```bash
set TELEGRAM_BOT_TOKEN=your_token_here

npm install
npm run check
npm run build
npm run test
npm run verify
npm run bench
npm run size
```

## Examples

- [`examples/echo_bot.ts`](./examples/echo_bot.ts)
- [`examples/scene_bot.ts`](./examples/scene_bot.ts)
- [`examples/config_bot.ts`](./examples/config_bot.ts)
- [`examples/callback_menu_bot.ts`](./examples/callback_menu_bot.ts)
- [`examples/media_advanced_bot.ts`](./examples/media_advanced_bot.ts)
- [`examples/middleware_auth_bot.ts`](./examples/middleware_auth_bot.ts)
- [`examples/module_bot.ts`](./examples/module_bot.ts)
- [`examples/lazy_module_bot.ts`](./examples/lazy_module_bot.ts)
- [`examples/rich_text_bot.ts`](./examples/rich_text_bot.ts)

## Project Notes

> Gramora is an evolving framework project inspired by [Telegraf](https://github.com/telegraf/telegraf).
> It is not a drop-in replacement, and APIs may evolve with breaking changes.
