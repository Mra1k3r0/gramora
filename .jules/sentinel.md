## 2025-05-15 - Double-response in Webhook Handler
vulnerability: Multiple calls to `res.end()` in the webhook handler during error conditions (e.g., payload too large).
learning: When a request is destroyed or an error response is sent early in the `data` event, the `end` event may still fire, leading to a second `res.end()` call which can cause "headers already sent" errors or server crashes.
prevention: Use a local `responded` flag to track whether a response has already been sent for the current request.

## 2025-05-15 - Robust Log Masking
vulnerability: Sensitive data leakage in logs due to varying key formats (snake_case, kebab-case, camelCase) and custom naming.
learning: Key normalization should account for both underscores and hyphens. Suffix-based matching (e.g., `*token`, `*password`) provides broader coverage than an exact-match set alone.
prevention: Normalize keys by removing `[_-]` and use a combination of known sensitive keys and common suffixes for masking.
