## 2025-03-05 - [timing-safe-path-validation]
vulnerability: timing-based path enumeration of secret webhook paths.
learning: although webhook paths are derived from the bot token, comparing them with `===` can leak the path length and structure via timing attacks. hashing inputs before `timingSafeEqual` allows safe comparison of variable-length secrets without throwing.
prevention: always use hashed timing-safe comparison for secret-dependent path or token validation.
