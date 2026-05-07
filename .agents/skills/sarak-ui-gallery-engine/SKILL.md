# Skill: Sarak UI Gallery Engine (v12.0)

This skill governs the expansion and technical refinement of the Sarak Design Engine Gallery. It ensures that all UI specimens (Cards, Typography, Presets, etc.) are implemented with high industrial fidelity and synchronized with the `MASTER_DESIGN_MAP` (v12.0.0) under the **3-Pillar Taxonomy**.

## Sovereign Dependencies
To execute this skill with excellence, you **MUST** first read and follow the core industrial guidelines:
- [sarak-ui-core-specialist](../sarak-ui-core-specialist/SKILL.md) - The definitive authority for UI Engineering and the 3-Pillar Architecture.

## 🏛️ Gallery Pillar Integration (v12.0)

When adding or modifying a gallery category, it must be nested within its sovereign pillar in `ThemeCustomizationTab.tsx`:

| Pillar | Gallery Types | Data Source |
|---|---|---|
| **Identidade** | Presets, Fonts, Layout Styles | `presets/typography`, `presets/layout` |
| **Estética** | Palettes, Glassmorphism, Animations | `presets/colors`, `presets/animations` |
| **Visual** | Component Specs, Data Grids, Chats | `presets/data`, `core/Discovery` |

## ⚙️ Workflow for New Gallery Categories

1.  **Define Tokens**: Ensure all tokens used by the gallery exist in `src/core/Design/master-map.ts`.
2.  **Source Data**: All gallery data must come from `src/core/Design/presets/`. Never hardcode specimens.
3.  **Draft Hook Integration**: Use the `draft` state from `useDesignDraft` to render the specimens. The gallery must reflect what the user is currently editing, not the live system state.
4.  **UI Injection**: Add the new gallery section to the appropriate pillar in `ThemeCustomizationTab.tsx`.

## 🛠️ Operational Rules
*   **Live Preview**: All gallery selections must trigger `updateDraft`, never a direct system apply.
*   **Fidelity**: Gallery specimens must be 1:1 replicas of how the component will look in production.
*   **Zero Logic in UI**: Gallery components should be purely presentational, receiving data and change handlers as props.

---
**Sarak Mission Control v12.0**  
*Continuity, Fidelity, and Industrial Growth.*
