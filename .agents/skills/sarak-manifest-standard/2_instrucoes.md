# Execution Workflow: Sarak Manifest Standard (v6.8)

Follow these steps to equip a module with a functional atomic identity.

## Step 1: Identity Definition
1. **ID**: Unique lowercase slug (e.g., `llm-selector`).
2. **Icon**: Valid Lucide React icon name.
3. **Category**: Technical classification (Productivity, Intelligence, System).
4. **Priority**: Display order (Higher = First).

## Step 2: Aggregated Manifest Generation
The manifest must reside at the root and be served at `/module/manifest`.

```json
{
  "contract": "v1",
  "id": "your-module",
  "label": "Friendly Name",
  "icon": "LucideIcon",
  "priority": 10,
  "endpoints": {
    "v1": {
      "data": "/api/v1/data",
      "action": "/api/v1/action"
    }
  }
}
```

## Step 3: Visual Contracts Configuration
Define how the `DynamicRenderer` should project your data:

1. **MANAGEMENT_GRID**: For lists with actions (Toggle/Delete). Requires mapping for `id`, `title`, `isActive`, and `status`.
2. **STATS**: For numerical summary cards.
3. **CARD_GRID**: For grid visualization with filters.

## Step 4: Technical Validation
- The manifest must not contain self-promotional words.
- All endpoints must be resolved via dot-notation (e.g., `v1.data`) or relative paths.
- The API response JSON must be flat to facilitate mapping.

---
**Technical Documentation v6.8**
**Standardization and Rigor**
