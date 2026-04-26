# Gramora

![beta](https://img.shields.io/badge/beta-f59e0b?logo=github&logoColor=white&labelColor=6b7280)
[![Telegram Bot API](https://img.shields.io/static/v1?label=&message=9.6&color=26A5E4&logo=telegram&logoColor=white&labelColor=6b7280)](https://core.telegram.org/bots/api)
![npm version](https://img.shields.io/npm/v/%40mra1k3r0%2Fgramora?label=&logo=npm&logoColor=white&labelColor=6b7280)
![typescript usage](https://img.shields.io/github/languages/top/mra1k3r0/gramora?label=&logo=typescript&logoColor=white&labelColor=6b7280)

TypeScript Telegram bot framework focused on practical APIs, strong typing, and production-safe runtime controls.

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
```

## Why Gramora

- Clean API for common bots (`command`, `onText`, `onCallback`)
- Advanced mode with decorators, modules, and scenes
- Koa-style middleware pipeline (`ctx`, `next`)
- Polling and webhook transports with security defaults
- Runtime controls for debug, retries, timeout, webhook validation

## Documentation

Full documentation lives in [`DOCS.md`](./DOCS.md).

## Development

```bash
npm install
npm run verify
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
