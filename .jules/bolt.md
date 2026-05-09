## 2026-05-09 - Array pooling and hot-path property access
learning: pooling empty frozen arrays and avoiding property enumeration (for...in) in hot paths significantly reduces heap pressure and improves throughput in high-frequency bot environments.
action: prefer direct property checks over for...in for objects with known high-frequency fields like Telegram Updates.
