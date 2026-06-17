
## 2025-05-14 - [webhook security hardening]
vulnerability: [lack of standard security headers and unhandled request errors in webhook transport]
learning: [exposed webhook endpoints without X-Content-Type-Options and X-Frame-Options are more susceptible to sniffing and framing attacks; unhandled request errors could potentially leak info or leave connections hanging]
prevention: [always set defense-in-depth headers (nosniff, deny) and implement explicit 'error' listeners on incoming http requests to fail securely]
