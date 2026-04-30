## 2025-05-15 - Error Object Logging & Auth Masking
vulnerability: Error objects logged as JSON/objects often appear empty ('{}') because 'message' and 'stack' are non-enumerable, potentially hiding critical details or failing to redact sensitive info within them. Also, 'auth' and 'authorization' keys were not masked.
learning: 'Object.entries' and 'Object.keys' skip non-enumerable properties. For 'Error' instances, 'Object.getOwnPropertyNames' must be used to ensure 'message' and 'stack' are captured.
prevention: Use 'Object.getOwnPropertyNames' when stringifying or processing Error objects for logs, and ensure a robust set of sensitive keys (including 'auth' and 'authorization') is used for masking.
