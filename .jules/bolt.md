## 2025-05-15 - property enumeration in hot paths
learning: using for...in to find the active key in a telegram update object is significantly slower than an explicit if-chain, as telegram updates always contain exactly one optional field representing the update type. property enumeration triggers overhead that is avoidable in the update processing hot path.
action: always prefer direct property checks or if-chains over for...in loops for extracting metadata from objects with known, mutually exclusive optional fields.

## 2025-05-15 - redundant array allocations for empty states
learning: repeated allocations of empty frozen arrays (e.g., Object.freeze([])) still incur heap allocation and garbage collection overhead. sharing a single frozen instance across the entire application lifetime is more efficient.
action: use a global EMPTY_FROZEN_ARRAY constant for all immutable empty collections in high-throughput paths.

## 2025-05-15 - formatting in optimized blocks
learning: optimized code blocks (like long if-chains or manual index scanning) can easily violate prettier rules if not carefully formatted. ci failures due to formatting are avoidable by running `npm run format` locally after implementation.
action: always run full verification (including formatting) after making any code changes, especially in complex optimized logic.
