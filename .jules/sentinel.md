## 2025-05-15 - [ensuring error redaction]
vulnerability: Error objects were appearing as empty literals ('{}') in logs because their 'message' and 'stack' properties are non-enumerable, potentially causing developers to log them unsafely and bypassing redaction.
learning: standard 'Object.keys' or 'Object.entries' do not pick up non-enumerable properties on native Error instances.
prevention: use 'Object.getOwnPropertyNames' for Error instances to ensure all relevant properties are captured for logging and redaction.
