## 2026-05-15 - Optimize update metadata and command arguments
learning: Replacing 'for...in' property enumeration with direct 'if' checks for common Telegram update types significantly reduces overhead in the hot path. Reusing pre-frozen arrays for command arguments avoids redundant heap allocations and spread operations.
action: Prioritize direct property access over iteration for known object structures in high-frequency dispatch logic.
