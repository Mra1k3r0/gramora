## 2025-05-15 - [core] harden webhook handling and log masking
vulnerability: [DoS/Stack Overflow] Deeply nested or circular objects passed to debug logging could cause a crash via stack overflow in 'sanitizeForLog'.
learning: [Architectural Gap] Core logging utilities lacked recursion depth protections.
prevention: [Depth Limits] Implement a standard 'MAX_LOG_DEPTH' or recursion counter in all object-scanning utilities.
