## 2025-05-15 - [webhook hardening]
vulnerability: potential exposure of secret webhook paths in logs and missing security headers on webhook endpoints.
learning: deterministic secret paths derived from tokens are still sensitive and should be treated like tokens for log redaction. public endpoints should always have basic security headers to prevent MIME-sniffing and framing attacks.
prevention: automatically register generated or configured secret paths for redaction; always set standard security headers in webhook handlers.
