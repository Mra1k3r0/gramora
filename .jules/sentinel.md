## 2025-05-17 - Webhook Response Hardening
vulnerability: Potential double-response/crash and missing security headers in webhook handler.
learning: Using `res.writableEnded` is a more robust way to check if a response has been sent than a local `responded` flag, especially when dealing with asynchronous error listeners.
prevention: Always include standard security headers (`nosniff`, `DENY`) and use `res.writableEnded` guards in Node.js HTTP handlers.
