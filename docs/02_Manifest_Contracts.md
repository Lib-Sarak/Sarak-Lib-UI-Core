# 02 - Manifest Contracts (Sarak v7.0)

The Sarak ecosystem is **Manifest-Driven**. This means the UI is not hardcoded; it is projected based on a JSON contract provided by the module.

## 📄 Manifest Structure

The `manifest.json` file must follow the `Sarak Visual Contract Schema`. Below are the root properties:

- `contract`: Schema version (use `"v6.8"`).
- `id`: Unique identifier for the module.
- `label`: Display name of the module.
- `icon`: Lucide icon name.
- `endpoints`: A map of data sources.
- `visualContracts`: An array of UI components to be rendered.

## 🧩 Visual Contract Types

The `type` field in a visual contract determines which UI template `UI-Core` will use.

| Type | Description |
| :--- | :--- |
| `TABLE` | Industrial data table with search and filters. |
| `CARD_GRID` | Responsive grid of cards for item lists. |
| `STATS` | Dashboard-style metric cards. |
| `CHART` | Data visualization using the Sarak Chart Engine. |
| `FORM` | Dynamic input forms with validation. |
| `CHAT_INTERFACE` | Advanced AI communication interface. |
| `CUSTOM` | Renders a locally registered component. |

## 🔗 Field Mapping

The `mapping` object links your backend data fields to UI labels.

```json
{
  "id": "contract-01",
  "type": "TABLE",
  "label": "Active Devices",
  "endpoint": "v1.devices",
  "mapping": {
    "Serial Number": "sn",
    "Operating Temp": "telemetry.temp",
    "Status": "status"
  }
}
```

## ⚙️ Component Config

The `config` object allows for fine-tuning the template without breaking architectural sovereignty.

```json
"config": {
  "isSearchable": true,
  "defaultSort": "Serial Number",
  "chartType": "line",
  "refreshInterval": 5000
}
```

Next: [03 - System Integration](./03_System_Integration.md)
