## 2026-05-03 - [logger-dos-recursion]
vulnerability: Potential Denial of Service (DoS) via infinite recursion or stack overflow in the custom object logger when encountering circular references or extremely deep objects.
learning: The custom serialization logic in 'prettyObject' lacked a depth limit or circularity check, making it vulnerable to resource exhaustion when logging complex, nested, or self-referential structures.
prevention: Always implement a hard depth limit (e.g., MAX_LOG_DEPTH = 20) in recursive serialization functions and prefer placeholders (e.g., '[DEPTH_EXCEEDED]') over continued traversal.
