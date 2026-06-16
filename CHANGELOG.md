# Changelog

## [0.4.0](https://github.com/Mra1k3r0/gramora/compare/v0.3.0...v0.4.0) (2026-06-16)

### What's Changed

- fixed harden transport, session, and context handling — [`323f608`](https://github.com/Mra1k3r0/gramora/commit/323f60883542f2e22cfb39c5beae36035840d0ee)
- fixed remove redundant default assignments in location and contact — [`8efb26d`](https://github.com/Mra1k3r0/gramora/commit/8efb26d1bb61ce0b98b4745fe166e54c8e257e99)
- improved redundant allocations in update hot path ([#50](https://github.com/Mra1k3r0/gramora/issues/50)) — [`b77d259`](https://github.com/Mra1k3r0/gramora/commit/b77d2593c9506420e654d12b7f74b2409ba4050c)
- fixed escape github releaseBodyTemplate newline and linkify squash-merge (#nn) in changelog — [`6c0cf76`](https://github.com/Mra1k3r0/gramora/commit/6c0cf76424f8cc5419478c0f573b0b5f04178378)
- added align Telegram Bot API types with 9.6–10.1 — [`5cc9863`](https://github.com/Mra1k3r0/gramora/commit/5cc98630456babf8e3038c7a0923571402dbbdd1)
- added missing Bot API 9.6–10.1 type fields — [`cf122ba`](https://github.com/Mra1k3r0/gramora/commit/cf122ba6a0b8b34117c6d0b5e6467bbf4f22c287)

## [0.3.0](https://github.com/Mra1k3r0/gramora/compare/v0.2.0...v0.3.0) (2026-05-05)

### What's Changed

- fixed tighten release note bullets (preset + 0.2.0 entry) — [`af043db`](https://github.com/Mra1k3r0/gramora/commit/af043db3e4b25d3a91ae6c5b8e472469bbf418f0)
- added createTransport adapters and webhook helpers layout — [`96d6851`](https://github.com/Mra1k3r0/gramora/commit/96d6851231b8fc553635992bb1f1003cfa56f7de)
- improved command parsing and context allocation ([#47](https://github.com/Mra1k3r0/gramora/issues/47)) — [`28ded7f`](https://github.com/Mra1k3r0/gramora/commit/28ded7f4269892c2ff793e7f7761e8cf1fc6bd53)
- improved command parsing and context initialization ([#46](https://github.com/Mra1k3r0/gramora/issues/46)) — [`0d32e2d`](https://github.com/Mra1k3r0/gramora/commit/0d32e2d5bc8ae0f94355133bec33c8650fdad5ea)

## [0.2.0](https://github.com/Mra1k3r0/gramora/compare/v0.1.1...v0.2.0) (2026-05-03)

### What's Changed

- added pluggable Bot API transport and proxy options — [`74b13ae`](https://github.com/Mra1k3r0/gramora/commit/74b13aeb57a6df871a8a440b23bdbdb02b48c119)
- added functional multi-step bot.conversation flows — [`672ccf4`](https://github.com/Mra1k3r0/gramora/commit/672ccf4a43f5ec3ef91c47a9be944edbbea0db1d)
- added optional GramoraLogSink for structured logs — [`015fc6a`](https://github.com/Mra1k3r0/gramora/commit/015fc6a3d7ca97b3426f692c19fa711e6beff883)
- improved allocations in parseCommand — [`33d5561`](https://github.com/Mra1k3r0/gramora/commit/33d5561d789b88d99d8ff5fa20b89e4226b364a8) closes ([#35](https://github.com/Mra1k3r0/gramora/issues/35))
- improved update processing hot path — [`758f782`](https://github.com/Mra1k3r0/gramora/commit/758f782983f2d32a7445e19059fe4abeb38b7a17)

## [0.1.1](https://github.com/Mra1k3r0/gramora/compare/v0.1.0...v0.1.1) (2026-04-28)

### What's Changed

- perf(context): lazy load context properties and reuse chat id — [`26e8afe`](https://github.com/Mra1k3r0/gramora/commit/26e8afe6e2172a28329bd594ede5a91df05a4be9)

## [0.1.0](https://github.com/Mra1k3r0/gramora/compare/v0.0.16...v0.1.0) (2026-04-26)

### What's Changed

- feat: add webhook adapter and normalize file naming — [`4248bfb`](https://github.com/Mra1k3r0/gramora/commit/4248bfbfcfbc3a83aff8990160c9aaedf332d45e)

## [0.0.16](https://github.com/Mra1k3r0/gramora/compare/v0.0.15...v0.0.16) (2026-04-25)

### What's Changed

- make session middleware safe under concurrent updates — [`af20cdb`](https://github.com/Mra1k3r0/gramora/commit/af20cdb92617abb473de7158d6e025127af543a1)

## [0.0.15](https://github.com/Mra1k3r0/gramora/compare/v0.0.14...v0.0.15) (2026-04-24)

### What's Changed

- validate webhook secret before remote webhook setup — [`54bbbc2`](https://github.com/Mra1k3r0/gramora/commit/54bbbc295ff225af95e8b617f44c2c0fa2a94b53)

## [0.0.14](https://github.com/Mra1k3r0/gramora/compare/v0.0.13...v0.0.14) (2026-04-24)

### What's Changed

- sync lockfile after dependency merges — [`5ec636b`](https://github.com/Mra1k3r0/gramora/commit/5ec636b47c055d3fff2d40f7e6c3cb368499cbf5)

## [0.0.13](https://github.com/Mra1k3r0/gramora/compare/v0.0.12...v0.0.13) (2026-04-23)

### What's Changed

- harden token redaction and webhook secret tests — [`54efc03`](https://github.com/Mra1k3r0/gramora/commit/54efc03ea0d836938786994337b6a99d0927b8b1)

## [0.0.12](https://github.com/Mra1k3r0/gramora/compare/v0.0.11...v0.0.12) (2026-04-21)

### What's Changed

- add resilience defaults and ci artifacts for roadmap #15 — [`5c61014`](https://github.com/Mra1k3r0/gramora/commit/5c6101424b50e975fd522b73cc8d1cbd527171e6)

## [0.0.11](https://github.com/Mra1k3r0/gramora/compare/v0.0.10...v0.0.11) (2026-04-21)

### What's Changed

- complete stars paid-flow api coverage — [`586d179`](https://github.com/Mra1k3r0/gramora/commit/586d1791ed9fb8ce15c6c9405c26dde04b769b9d)

## [0.0.10](https://github.com/Mra1k3r0/gramora/compare/v0.0.9...v0.0.10) (2026-04-21)

### What's Changed

- implement roadmap #12 router ergonomics — [`616cdc0`](https://github.com/Mra1k3r0/gramora/commit/616cdc01aceb23ddd7524bab6e1daf1a94bb81a5)
- implement roadmap #13 operations debug parity — [`de81e04`](https://github.com/Mra1k3r0/gramora/commit/de81e04f02b02c56a280f304738170272a2746b7)

## [0.0.9](https://github.com/Mra1k3r0/gramora/compare/v0.0.8...v0.0.9) (2026-04-19)

### What's Changed

- roadmap #11 — join requests, reactions, and richer chat sends on api and gram clients — [`498098a`](https://github.com/Mra1k3r0/gramora/commit/498098a73e573d79d03f015f2614ff1f71f50a2f)

## [0.0.8](https://github.com/mra1k3r0/gramora/compare/v0.0.7...v0.0.8) (2026-04-17)

### What's Changed

- Added advanced Telegram update support for roadmap #8: `chat_member`, `my_chat_member`, `chat_join_request`, reactions, and business update routing/decorators — [`045a8bd`](https://github.com/mra1k3r0/gramora/commit/045a8bd).
- Added webhook and polling hardening for roadmap #9: webhook 200-first acknowledgement and polling retry handling from Telegram `retry_after` — [`d515ffe`](https://github.com/mra1k3r0/gramora/commit/d515ffe).
- Added observability hooks for runtime events: `onUpdateError`, `onUpdateProcessed`, and `onPollingError` — [`d515ffe`](https://github.com/mra1k3r0/gramora/commit/d515ffe).
- Added production safety layer for roadmap #10: `RateLimitError`, `ValidationError`, rate limiter profiles, and input length validation guards — [`d515ffe`](https://github.com/mra1k3r0/gramora/commit/d515ffe).
- Merged dependency updates: `undici`, `prettier`, `@types/node`, and `@typescript-eslint` packages — [`fa0affe`](https://github.com/mra1k3r0/gramora/commit/fa0affe), [`eb2880b`](https://github.com/mra1k3r0/gramora/commit/eb2880b), [`3fddef0`](https://github.com/mra1k3r0/gramora/commit/3fddef0), [`58ed6db`](https://github.com/mra1k3r0/gramora/commit/58ed6db), [`4b8325a`](https://github.com/mra1k3r0/gramora/commit/4b8325a).
