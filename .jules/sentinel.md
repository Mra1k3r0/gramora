## 2026-04-26 - Log Redaction Hardening
**Vulnerability:** Potential credential leakage in debug logs via non-standard key names or raw string messages.
**Learning:** Fixed list of sensitive keys is insufficient for diverse user-defined properties. Webhook secret tokens were only validated but not registered for value-based redaction, leaving them exposed if printed in raw strings (e.g. error messages).
**Prevention:** Use suffix-based matching (e.g., `*token`, `*password`) on normalized keys to catch most secret variations. Explicitly register any sensitive configuration value (like `secretToken`) into the global redaction registry upon ingestion.
