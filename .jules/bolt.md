## 2025-05-14 - [router] optimize update metadata extraction and command parsing
learning: Replacing `for...in` property enumeration with a direct `if` chain for known update types significantly reduces dispatch overhead. Sharing frozen arrays (like `EMPTY_FROZEN_ARRAY`) and avoiding redundant cloning/freezing in hot paths yields measurable throughput gains, especially for command updates.
action: Prioritize direct property access over object enumeration in update routing and reuse pre-parsed/frozen objects to minimize heap allocations.
