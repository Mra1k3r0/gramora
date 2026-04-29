## 2026-04-29 - Context State Identity
learning: implementing a shared dummy object for performance (to reduce allocations) can introduce functional regressions if that object contains mutable state. using a getter that returns a new object literal ensures isolation across updates but breaks identity within a single update's lifecycle (e.g. middleware cannot persist state to the object).
action: ensure stateful properties in shared dummy objects are initialized per-instance if mutation is possible, or use a shared frozen object if mutation is forbidden.
