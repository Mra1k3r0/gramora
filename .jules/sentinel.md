# Sentinel Journal

## 2025-05-21 - [hardening]
vulnerability: potential leak of pii in logs and lack of defense-in-depth on webhooks.
learning: webhook endpoints should always include security headers (nosniff, deny) to prevent clickjacking and mime-sniffing. logger should be proactive in masking pii like emails and phone numbers.
prevention: maintain an expanded list of sensitive keys in the logger and enforce security headers at the framework level for all webhooks.
