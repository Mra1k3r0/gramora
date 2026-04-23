## 2025-05-15 - Security Log Redaction and Timing Safe Improvements

**Vulnerability:** Potential bot token leakage in logs via network error messages and lack of redaction for sensitive API fields. Also, a length-leakage in timing-safe secret comparison.
**Learning:** Network clients like `undici` often include the full URL in error messages, which in Telegram's case includes the bot token. Generic object logging without key-based redaction also risks exposing payment or webhook secrets.
**Prevention:** Implement a global redaction registry for the bot token and specific key-based masking in the logger. Hash secrets before timing-safe comparison to avoid length leaks.

## 2025-06-12 - Memory Exhaustion (DoS) in Rate Limiter

**Vulnerability:** Denial of Service via memory exhaustion in `rateLimiter` middleware.
**Learning:** Stateful tracking mechanisms (like `Map`) that store entries per unique user/chat ID without cleanup can be exploited by attackers sending requests from many unique IDs, leading to OOM.
**Prevention:** Enforce a maximum capacity (`MAX_STATE_SIZE`) on internal state Maps and implement a cleanup routine to prune expired entries or clear the state as a fail-safe.
