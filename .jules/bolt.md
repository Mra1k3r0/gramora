## 2025-05-14 - Fast-path for update kind extraction
learning: Replacing `for...in` loops with explicit `if` chains for the most common properties in high-frequency objects (like Telegram Updates) significantly reduces CPU overhead by bypassing property enumeration and prototype chain checks. Additionally, using a shared frozen empty array constant avoids redundant heap allocations and GC pressure in hot paths.
action: Always check if hot-path objects have a small, predictable set of common keys and prioritize them with direct property access.
