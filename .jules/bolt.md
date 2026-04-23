## 2025-05-15 - [Avoid expensive serialization in hot paths]

**Learning:** In `Gramora`, the `processUpdate` method was performing recursive object sanitization (`sanitizeForLog`) and colorized stringification (`stringifyForLog`) for every update, even when debug logging was disabled. These operations are CPU-intensive and caused a significant performance bottleneck (limiting throughput to ~26k updates/sec).
**Action:** Always guard expensive data preparation for logging with an explicit check for the debug flag (e.g., `if (this.debugEnabled)`) to ensure the hot path remains fast.

## 2026-04-22 - [Optimizing Update Dispatching]

**Learning:** Linear iteration through registered handlers in 'UpdateRouter' caused O(N) complexity, significantly slowing down bots with many handlers. Consolidation of indexing into specialized Maps and arrays reduced dispatching overhead.
**Action:** Always prefer indexed lookups (Map/Set) or typed grouping over linear array searches in performance-critical hot paths like update processing.
