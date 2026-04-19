# Changelog

## [0.0.9](https://github.com/Mra1k3r0/gramora/compare/v0.0.8...v0.0.9) (2026-04-19)

### What's Changed

- roadmap [#11](https://github.com/Mra1k3r0/gramora/issues/11) — join requests, reactions, and richer chat sends on api and gram clients — [`498098a`](https://github.com/Mra1k3r0/gramora/commit/498098a73e573d79d03f015f2614ff1f71f50a2f)

## [0.0.8](https://github.com/mra1k3r0/gramora/compare/v0.0.7...v0.0.8) (2026-04-17)

### What's Changed

- Added advanced Telegram update support for roadmap #8: `chat_member`, `my_chat_member`, `chat_join_request`, reactions, and business update routing/decorators — [`045a8bd`](https://github.com/mra1k3r0/gramora/commit/045a8bd).
- Added webhook and polling hardening for roadmap #9: webhook 200-first acknowledgement and polling retry handling from Telegram `retry_after` — [`d515ffe`](https://github.com/mra1k3r0/gramora/commit/d515ffe).
- Added observability hooks for runtime events: `onUpdateError`, `onUpdateProcessed`, and `onPollingError` — [`d515ffe`](https://github.com/mra1k3r0/gramora/commit/d515ffe).
- Added production safety layer for roadmap #10: `RateLimitError`, `ValidationError`, rate limiter profiles, and input length validation guards — [`d515ffe`](https://github.com/mra1k3r0/gramora/commit/d515ffe).
- Merged dependency updates: `undici`, `prettier`, `@types/node`, and `@typescript-eslint` packages — [`fa0affe`](https://github.com/mra1k3r0/gramora/commit/fa0affe), [`eb2880b`](https://github.com/mra1k3r0/gramora/commit/eb2880b), [`3fddef0`](https://github.com/mra1k3r0/gramora/commit/3fddef0), [`58ed6db`](https://github.com/mra1k3r0/gramora/commit/58ed6db), [`4b8325a`](https://github.com/mra1k3r0/gramora/commit/4b8325a).
