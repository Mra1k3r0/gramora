## 2025-05-15 - Dispatch logic and argument freezing
learning: removing sorting logic in dispatchIndexedHandlers is a breaking change because it discards handler registration order, which is a core contract.
action: keep sorting logic for matchedKinds but optimize the enumeration and metadata extraction. reuse a shared EMPTY_FROZEN_ARRAY instead of Object.freeze([]).
