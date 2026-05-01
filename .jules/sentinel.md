## 2025-05-14 - [logger] traverse Error properties for redaction
vulnerability: Error objects logged as empty literals '{}', leaking secrets in messages/stacks
learning: standard JSON/Object iteration skips non-enumerable Error properties
prevention: use Object.getOwnPropertyNames for Error instances; expand sensitive keys to include auth/authorization
