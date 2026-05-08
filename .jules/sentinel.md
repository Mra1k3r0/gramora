## 2025-05-15 - Webhook Hardening
vulnerability: Potential for MIME sniffing attacks, UI redressing (clickjacking), and unhandled request-level errors in the webhook listener. Additionally, accidental exposure of secret webhook path components in logs.
learning: Relying on the default behavior of Node.js `http` server for webhooks can leave common web vulnerabilities open if security headers aren't explicitly set.
prevention: Always set `X-Content-Type-Options: nosniff` and `X-Frame-Options: DENY` on HTTP responses. Implement explicit `error` listeners on incoming request streams to prevent process crashes. Register all secret-derived strings (like webhook paths) for log redaction.
