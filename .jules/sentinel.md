## 2025-05-15 - [webhook-hardening]
vulnerability: webhook path discovery via timing attacks and missing security headers
learning: standard string comparison is not timing-safe and can leak path information byte-by-byte
prevention: use timing-safe comparison (hashing + timingSafeEqual) for all sensitive string matching, including paths and tokens
