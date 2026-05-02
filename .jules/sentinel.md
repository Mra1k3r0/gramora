## 2025-05-14 - [Error Object Logging]
vulnerability: Error objects logged as empty literals '{}' leaked no context but also obscured potential sensitive data within non-enumerable properties like 'message' or 'stack' if they were partially processed or had custom attributes attached.
learning: Object.entries() and Object.keys() do not capture non-enumerable properties of Error instances, leading to data loss in logs.
prevention: Use Object.getOwnPropertyNames() specifically for Error instances to ensure 'message', 'stack', and any custom fields are extracted for redaction and logging.
