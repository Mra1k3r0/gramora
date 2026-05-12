## 2025-05-14 - [getUpdateMetadata & command args]
learning: property enumeration (for...in) and truthiness checks in the update processing hot-path add significant overhead compared to direct property access. also, redundant array spreading and freezing of command arguments for every handler runner leads to excessive heap allocations.
action: use targeted if-chains for update type extraction and share frozen argument arrays across handlers.
