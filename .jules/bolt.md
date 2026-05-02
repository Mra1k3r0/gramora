## 2025-05-15 - optimization: skip scene lookup in core mode
learning: the linear iteration bottleneck in handleUpdate was previously optimized by adding metadata extraction, but the scene manager's session lookup (buildControl) remained a synchronous-but-awaited bottleneck for 'core' mode users who don't need scenes. moving it behind the mode guard and making sceneControl optional in the internal pipeline improves throughput.
action: always identify optional features (like session/scenes) that can be short-circuited early in the update hot path.
