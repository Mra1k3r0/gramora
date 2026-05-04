
## 2025-05-15 - Enforced log depth and expanded masking
vulnerability: Potential DoS via stack overflow in recursive logger and sensitive data leakage.
learning: Loggers that recursively stringify objects are vulnerable to deeply nested or circular structures (log bombs).
prevention: Always enforce a maximum recursion depth in logging utilities and use a broad set of sensitive key patterns for masking.
