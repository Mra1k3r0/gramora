# Gramora

![Beta](https://img.shields.io/badge/status-beta-orange)
![npm](https://img.shields.io/npm/v/%40mra1k3r0%2Fgramora)
![npm package size](https://img.shields.io/packagephobia/install/%40mra1k3r0%2Fgramora)

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

| Option                   | Type               | Default          | Description                      |
| ------------------------ | ------------------ | ---------------- | -------------------------------- |
| `token`                  | `string`           | required         | Telegram bot token               |
| `mode`                   | `"full" \| "core"` | `"full"`         | `core` keeps runtime lightweight |
| `polling.timeout`        | `number`           | `20`             | Long-poll timeout (seconds)      |
| `polling.limit`          | `number`           | Telegram default | Max updates per poll             |
| `polling.allowedUpdates` | `string[]`         | Telegram default | Restrict update types            |
| `debug`                  | `boolean`          | `false`          | Enable runtime debug logs        |

### Runtime config (`.configure`)

| Key         | Type      | Description                         |
| ----------- | --------- | ----------------------------------- |
| `userAgent` | `string`  | Custom UA for Telegram API requests |
| `timeoutMs` | `number`  | Request timeout in milliseconds     |
| `proxy`     | `string`  | Proxy URL (`http://` or `https://`) |
| `debug`     | `boolean` | Toggle debug logging at runtime     |

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

- outgoing Telegram API requests (`api.request`)
- incoming API responses (`api.response`)
- update routing and payload body
- startup lifecycle and transport events

## API Overview

| Area            | Main APIs                                                                                                                        |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Bot             | `command`, `onText`, `onMessage`, `onCallback`, `use`, `module`, `lazyModule`, `launch`, `stop`, `configure`, `configureWebhook` |
| Handler context | `send`, `photo`, `doc`, `audio`, `video`, `animation`, `voice`, `sticker`, `answer`, `text`, `chatId`, `fromId`                  |
| Global sender   | `bot.gram.withChat(chatId).send/photo/doc/...`                                                                                   |
| Raw control     | `gram.api.*` for full Telegram method-level access                                                                               |
| Decorators      | `@Controller`, `@Command`, `@On`, `@CallbackQuery`, `@InlineQuery`, `@Guard`, `@UseMiddleware`, `@Scene`, `@Step`                |

## Telegram Coverage

<details>
<summary><strong>Show Telegram coverage matrix</strong></summary>

| Area                       | Status                      |
| -------------------------- | --------------------------- |
| Core messaging             | Partial                     |
| Media sending              | Implemented (major methods) |
| Callback queries           | Implemented                 |
| Inline mode                | Partial                     |
| Scenes/session             | Implemented (core)          |
| Middleware                 | Implemented                 |
| Polling/webhook transports | Implemented (core)          |
| Chat admin/moderation      | Not implemented             |
| Payments                   | Not implemented             |
| Full update/event coverage | Partial                     |

</details>

### Build Roadmap

1. Media expansion (`sendAudio`, `sendVideo`, `sendAnimation`, `sendVoice`, `sendSticker`) ![implemented](https://img.shields.io/badge/implemented-10b981)
2. Edit/delete completion (`editCaption`, `editReplyMarkup`, message lifecycle helpers) ![soon](https://img.shields.io/badge/soon-6366f1)
3. Inline mode completion (`answerInlineQuery` + builders) ![soon](https://img.shields.io/badge/soon-6366f1)
4. Chat administration APIs (ban/unban/restrict/promote, permissions) ![soon](https://img.shields.io/badge/soon-6366f1)
5. Group/supergroup utilities (pin/unpin, forum topics, members) ![soon](https://img.shields.io/badge/soon-6366f1)
6. Bot profile + command management (scopes, localized commands, menu buttons) ![soon](https://img.shields.io/badge/soon-6366f1)
7. Payments and commerce flow (invoice, shipping, pre-checkout) ![soon](https://img.shields.io/badge/soon-6366f1)
8. Advanced update types (chat_member, reactions, join requests, business events) ![soon](https://img.shields.io/badge/soon-6366f1)
9. Webhook hardening (retry strategy, observability hooks) ![soon](https://img.shields.io/badge/soon-6366f1)
10. Production safety layer (rate profiles, validation, structured errors) ![soon](https://img.shields.io/badge/soon-6366f1)

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

- `examples/echo-bot.ts`
- `examples/scene-bot.ts`
- `examples/config-bot.ts`
- `examples/callback-menu-bot.ts`
- `examples/media-advanced-bot.ts`
- `examples/middleware-auth-bot.ts`
- `examples/module-bot.ts`
- `examples/lazy-module-bot.ts`

---

### Note

This project is a student/practice project created to explore Telegram bot framework design in TypeScript.
It is inspired by ideas from [Telegraf](https://github.com/telegraf/telegraf), but it is not intended to be a drop-in replacement or a production-complete alternative yet.

Gramora is still evolving and may include incomplete features, rough edges, or breaking changes while the architecture and API are being refined.
Use it for learning, experimentation, and prototyping, and please review carefully before using it in production workloads.
