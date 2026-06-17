## 2025-05-14 - [webhook-hardening]
vulnerability: missing security headers and request error handling in webhook transport
learning: unhardened webhook handlers can be vulnerable to mime sniffing, clickjacking, and connection leaks
prevention: always set nosniff/deny headers and implement req.on('error') in http handlers
