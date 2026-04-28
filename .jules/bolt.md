## 2026-04-28 - router: optimize update processing hot path
learning: replacing Object.keys().filter() with for...in loops in high-frequency paths (like update dispatching) significantly reduces GC pressure and improves throughput. skipping async scene lookups in 'core' mode yielded the largest gain (~45%).
action: always check for 'mode' flags to skip expensive middleware or state lookups in hot paths.
