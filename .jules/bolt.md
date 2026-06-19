## 2025-05-15 - Hot path optimizations in UpdateRouter
learning: Property enumeration in 'for...in' loops on the 'Update' object is a significant bottleneck during high-throughput update processing. Replacing it with a direct 'if' chain for common types like 'message' and 'callback_query' significantly reduces per-update overhead.
action: Prioritize direct property checks over object enumeration in critical dispatch paths.

## 2025-05-15 - Command parsing allocation reduction
learning: Repeatedly cloning and freezing command arguments ('[...args]') in 'dispatchIndexedHandlers' creates unnecessary heap pressure. Passing pre-frozen arrays from the parser to the context constructor avoids these allocations.
action: Use 'Object.freeze' at the source of data creation (e.g., in 'parseCommand') to allow safe sharing of arrays across the middleware pipeline.
