## 2025-05-14 - reduce allocations and optimize update metadata extraction
learning: identified for...in loop in getUpdateMetadata as a significant bottleneck for update throughput. combined with redundant array allocations in command dispatch, these hotspots limited framework performance.
action: implement if-chain for metadata extraction and use shared frozen arrays (EMPTY_FROZEN_ARRAY) for command arguments to minimize heap pressure and bypass enumeration overhead.
