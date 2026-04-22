## 2025-05-15 - [Avoid expensive serialization in hot paths]

**Learning:** In `Gramora`, the `processUpdate` method was performing recursive object sanitization (`sanitizeForLog`) and colorized stringification (`stringifyForLog`) for every update, even when debug logging was disabled. These operations are CPU-intensive and caused a significant performance bottleneck (limiting throughput to ~26k updates/sec).
**Action:** Always guard expensive data preparation for logging with an explicit check for the debug flag (e.g., `if (this.debugEnabled)`) to ensure the hot path remains fast.
