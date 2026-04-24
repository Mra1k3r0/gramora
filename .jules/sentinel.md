## 2025-05-14 - [Sensitive Key Masking Bypass via Naming Conventions]

**Vulnerability:** Redaction logic in `stringifyForLog` could be bypassed by using alternative naming conventions (e.g., camelCase `secretToken` vs snake_case `secret_token`) because the check was case-sensitive and literal.
**Learning:** Security-sensitive key lists must be case-insensitive and normalize for common naming separators (like underscores) to prevent accidental data leaks through varied property naming.
**Prevention:** Always normalize keys (lowercase, remove separators) before checking against a known-sensitive key registry.
