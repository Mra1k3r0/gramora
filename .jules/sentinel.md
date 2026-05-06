## 2026-05-06 - [webhook path security & log masking]
vulnerability: [webhook paths and PII could leak in logs; webhook path comparison was susceptible to timing attacks]
learning: [automatic redaction should cover all variations of a secret (e.g., default and custom paths). timing-safe comparisons are essential for any secret-based routing]
prevention: [always register generated or user-provided secrets with the redaction registry. use timingSafeEqual for all secret/path comparisons]
