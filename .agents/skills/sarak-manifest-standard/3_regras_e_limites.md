# Rules and Limits: Sarak Manifest Standard (v6.8)

To maintain compliance, follow these restrictions:

1. **PROHIBITED Absolute URLs**: Never put `http://localhost:3000` in the manifest. Use relative paths or keys that the orchestrator resolves dynamically.
2. **NEVER use unknown icons**: Use only icon names present in **Lucide React** (e.g., `Database`, `Zap`, `Settings`). Check the exact spelling (CamelCase).
3. **DO NOT include logic in the JSON**: The manifest is strictly metadata. Do not attempt to pass functions or scripts inside it.
4. **Category LIMIT**: Use only pre-defined categories (AI Tools, System, Data, Communication, Utilities). If a new one is needed, update the Master Skill `@sarak-lib`.
5. **DO NOT ignore Versioning**: The `version` field in the manifest must be updated whenever the module's API contract changes.
6. **PROHIBITED Promotional Language**: Do not use marketing or self-promotional terms (matrix, super, mega, master, etc.) in labels or descriptions.
