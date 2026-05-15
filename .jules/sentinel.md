## 2025-05-15 - logging depth protection
vulnerability: denial of service (DoS) or stack overflow via deeply nested objects in debug logs
learning: core sanitization logic in Bot and ApiClient lacked recursion depth limits, unlike the central logger
prevention: always enforce a maximum recursion depth (e.g., 20) in any object traversal logic used for logging or serialization

## 2025-05-15 - webhook defense in depth
vulnerability: clickjacking and MIME-sniffing on webhook endpoints
learning: webhook handlers often lack standard security headers because they are primarily intended for API consumption, but can be targeted via browsers
prevention: always include X-Frame-Options: DENY and X-Content-Type-Options: nosniff in webhook responses
