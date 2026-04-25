## 2025-05-15 - Dispatching and Middleware Optimization
**Learning:** Re-composing middleware on every update and O(N) scanning of handlers were the primary bottlenecks in the router. Iterating over incoming update keys (O(K)) and using Map lookups is significantly faster than scanning all registered handlers (O(N)), especially as the bot grows.
**Action:** Always prefer pre-composing middleware chains and using O(K) property-based dispatching for update routing.
