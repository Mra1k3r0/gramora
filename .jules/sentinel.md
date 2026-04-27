## 2025-05-15 - Enhancing sensitive data redaction in logs
vulnerability: Potential leakage of webhook secrets and other sensitive keys (e.g., those with hyphens or specific suffixes) in diagnostic logs.
learning: Relying on exact key matching and single-type normalization (underscores only) left gaps for similar sensitive keys like `access-token` or `custom_secret`.
prevention: Implement robust normalization (removing underscores and hyphens), expand the known sensitive key set, and use suffix-based matching (e.g., `*token`) to capture a wider range of sensitive data.
