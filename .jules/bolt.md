## 2025-05-15 - Command Dispatch Argument Shift
learning: structural changes to internal dispatch methods (like `runControllerRunner`) are high-risk for argument shifts that `tsc` might not catch if types are too permissive or if the shift happens in a way that satisfies signatures but breaks logic.
action: verify all call sites (especially in `dispatchIndexedHandlers`) after changing internal parameter orders or adding new optional arguments. re-run targeted functional tests for the affected handler types.
