## 2026-05-11 - Optimize update kind detection and command args
learning: Direct property checks for common Telegram update types are faster than 'for...in' enumeration when extracting metadata. Reusing frozen arrays (EMPTY_FROZEN_ARRAY) for command arguments reduces heap allocations in hot paths.
action: Prioritize direct property access in update processing loops.
