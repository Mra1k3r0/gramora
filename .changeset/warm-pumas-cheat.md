---
"@mra1k3r0/gramora": patch
---

## What's Changed

- Added advanced Telegram update support for roadmap #8: `chat_member`, `my_chat_member`, `chat_join_request`, reactions, and business update routing/decorators — [`045a8bd`](https://github.com/mra1k3r0/gramora/commit/045a8bd).
- Added webhook and polling hardening for roadmap #9: webhook 200-first acknowledgement and polling retry handling from Telegram `retry_after` — [`d515ffe`](https://github.com/mra1k3r0/gramora/commit/d515ffe).
- Added observability hooks for runtime events: `onUpdateError`, `onUpdateProcessed`, and `onPollingError` — [`d515ffe`](https://github.com/mra1k3r0/gramora/commit/d515ffe).
- Added production safety layer for roadmap #10: `RateLimitError`, `ValidationError`, rate limiter profiles, and input length validation guards — [`d515ffe`](https://github.com/mra1k3r0/gramora/commit/d515ffe).
- Merged dependency updates: `undici`, `prettier`, `@types/node`, and `@typescript-eslint` packages — [`fa0affe`](https://github.com/mra1k3r0/gramora/commit/fa0affe), [`eb2880b`](https://github.com/mra1k3r0/gramora/commit/eb2880b), [`3fddef0`](https://github.com/mra1k3r0/gramora/commit/3fddef0), [`58ed6db`](https://github.com/mra1k3r0/gramora/commit/58ed6db), [`4b8325a`](https://github.com/mra1k3r0/gramora/commit/4b8325a).
