## 2026-05-01 - Optimization of Update Hot Path
learning: Skipping expensive asynchronous scene session lookups in lightweight ('core') mode significantly improves update throughput. Combining property extraction into a single-pass loop with a switch statement further reduces overhead in the hot path.
action: Always check if expensive middleware or session lookups can be bypassed based on the operational mode.
