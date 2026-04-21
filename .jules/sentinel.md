## 2025-05-15 - Security Log Redaction and Timing Safe Improvements

**Vulnerability:** Potential bot token leakage in logs via network error messages and lack of redaction for sensitive API fields. Also, a length-leakage in timing-safe secret comparison.
**Learning:** Network clients like `undici` often include the full URL in error messages, which in Telegram's case includes the bot token. Generic object logging without key-based redaction also risks exposing payment or webhook secrets.
**Prevention:** Implement a global redaction registry for the bot token and specific key-based masking in the logger. Hash secrets before timing-safe comparison to avoid length leaks.
