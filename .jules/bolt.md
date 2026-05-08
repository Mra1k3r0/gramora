## 2025-05-22 - [routing] avoid redundant allocations and enumerations in hot paths
learning: 'for...in' loops on Telegram 'Update' objects are expensive due to property enumeration overhead. redundant array spreading of command arguments before 'Object.freeze' causes unnecessary heap allocations.
action: use direct 'if' checks for common update types in 'getUpdateMetadata' and share a 'EMPTY_FROZEN_ARRAY' constant for empty arguments.
