## 2025-05-14 - Webhook Hardening and Log Masking
vulnerability: Potential timing attacks on webhook paths and leakage of PII/webhook paths in logs.
learning: Webhook paths can act as secrets; if they are predictable or leaked, attackers can inject unauthorized updates. Standard security headers (X-Content-Type-Options, X-Frame-Options) were missing from webhook responses.
prevention: Always use timing-safe comparisons for secrets (including paths used as tokens). Register all dynamically generated secrets/paths with the redaction engine. Enforce secure headers on all public-facing endpoints.
