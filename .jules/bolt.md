## 2025-05-14 - Optimized Update Routing & Callback Dispatch

**Learning:** Linear iteration over registered handlers (O(N)) is a significant bottleneck as the number of handlers grows. Simple string inclusion checks (like `.includes('*')`) are insufficient to distinguish between literal triggers and regex patterns; a more comprehensive regex-special character check is required to safely separate literal matches for O(1) Map lookups.
**Action:** Always prefer Map-based indexing for literal triggers and only fall back to linear scanning for complex patterns. Ensure catch-all handlers ('\*') are explicitly checked to avoid regressions in optimized dispatch paths.
