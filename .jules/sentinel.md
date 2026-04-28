## 2025-05-15 - [security enhancement] redact sensitive data in Error objects
vulnerability: Error objects logged via `stringifyForLog` were previously serialized as empty objects `{}` because properties like `message` and `stack` are non-enumerable. This could allow sensitive data (e.g. tokens) within these fields to bypass the redaction logic.
learning: `Object.entries()` does not see non-enumerable properties of native JavaScript Error objects.
prevention: Use `Object.getOwnPropertyNames(error)` to extract all properties from an Error instance for logging and redaction.
