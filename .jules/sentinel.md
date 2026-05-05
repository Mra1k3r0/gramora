## 2025-05-15 - refined log masking
vulnerability: sensitive keys like 'key', 'pwd', and 'pass' were only masked when using specific camelCase or snake_case suffixes, leaving standalone versions or other variations potentially exposed in logs.
learning: log masking logic must account for various naming conventions and standalone keys to be robust. using a normalized key (lowercase, no separators) for suffix matching is effective but requires care to avoid over-masking innocent words.
prevention: always use normalized keys for security checks and ensure a broad set of common secret-related keywords are covered, while guarding against false positives for short, common terms.
