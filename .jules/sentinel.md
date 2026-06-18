## 2026-05-16 - [webhook hardening]
vulnerability: missing security headers and request error handling in webhook handler
learning: raw nodejs http listeners are vulnerable to socket-level errors if the 'error' event on IncomingMessage isn't handled; defense-in-depth headers (nosniff, deny) should be present even on api-only endpoints
prevention: implement 'error' listeners on request objects and set standard security headers by default in all internal http handlers
