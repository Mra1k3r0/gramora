## 2026-05-16 - [sharing frozen arrays]
learning: shared command arguments were being cloned and re-frozen in every handler dispatch, leading to redundant heap allocations. by pre-freezing in the parser and sharing a static empty array, we avoid [N handlers * 2] allocations per command update.
action: reuse pre-parsed/frozen objects in dispatch pipelines; avoid [...spread] on objects intended to be immutable.

## 2026-05-16 - [if-chain vs for-in]
learning: property enumeration via for...in on every telegram Update object adds measurable overhead in high-throughput scenarios. an explicit if-chain for common types (message, callback_query) provides a faster dispatch path.
action: use if-chain fast-paths for highly repetitive object type discovery before falling back to enumeration.
