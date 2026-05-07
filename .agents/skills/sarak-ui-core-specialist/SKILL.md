# Skill: Sarak UI-Core Specialist (Atomic Modular Sovereignty v12.0)

This skill is the **sovereign authority** for maintaining and evolving the `Sarak-Lib-UI-Core` module. Its mission is to ensure the library remains a high-performance, agnostic, and "Plug & Play" engine that can be seamlessly integrated into any React ecosystem.

## 🏛️ Core Architecture (v12.0 — The 3 Pillars)

The Design Engine is strictly organized into 3 Pillars of Sovereignty. **ALL** new tokens, sections, or UI controls MUST be assigned to one of these pillars:

1.  **Identidade (Identity)**: The "DNA" and Structure.
    *   *Includes*: Branding, Typography, Layout, Density, and Sovereignty/Security rules.
2.  **Estética (Aesthetic)**: The "Atmosphere" and Surface.
    *   *Includes*: Colors, Textures, Glassmorphism, Animations, and Card/Container styles.
3.  **Visual (Visual)**: The "Interface" and Interaction.
    *   *Includes*: Buttons, Form Controls, Data Visualization (Charts/Grids), and Chat Dynamics.

## ⚙️ The Draft & Apply Workflow (MANDATORY)

The system operates on an **Industrial Commit Flow** to prevent accidental global changes:

1.  **Draft State**: All changes made in the UI are kept in a local `draft` object via the `useDesignDraft` hook.
2.  **Dirty-State Tracking**: Each pillar monitors its own delta. If a token in "Aesthetic" changes, the pillar is marked as `isDirty`.
3.  **Preview Isolation**: The `PreviewCanvas` renders the `draft` state (Digital Twin), while the rest of the application remains unchanged.
4.  **Granular Reset**: Users can reset a specific pillar to its original system state without affecting changes in other pillars.
5.  **Global Commit**: Changes only affect the actual system state when the **"Apply to System"** action is triggered.

## 🗺️ Source of Truth — Directory Map

| Concern | Canonical Path |
|---|---|
| Master Design Map (Schema) | `src/core/Design/master-map.ts` |
| Atomic Presets Library | `src/core/Design/presets/` |
| UI Orchestrator | `src/features/DesignEngine/Main/ThemeCustomizationTab.tsx` |
| Draft Logic & Resets | `src/features/DesignEngine/hooks/useDesignDraft.ts` |
| Design Controls & Labels | `src/features/DesignEngine/components/DesignControls.tsx` |

## 🕹️ Centralization Guide: How to Add a New Component/Control

To ensure any new component is centrally controlled by the design engine, you must follow this mandatory pipeline:

1.  **Step 1: Token Definition (Schema)**
    *   Create or update the schema in `src/core/Design/schema/`. *Example*: If creating a "Notification" system, add the tokens (color, radius, animation) to `SpecializedSchema`.
2.  **Step 2: Master Map Registration**
    *   Open `src/core/Design/master-map.ts` and ensure the new schema is included in the `MASTER_DESIGN_MAP`. This allows the draft system to monitor changes to these new tokens.
3.  **Step 3: Pillar Mapping**
    *   In `useDesignDraft.ts`, map the new schema to its corresponding pillar in the `pillarToSchemas` object. This enables the "Reset" and "Dirty State" logic for your new component.
4.  **Step 4: Sidebar Injection (UI)**
    *   In `ThemeCustomizationTab.tsx`, locate the relevant pillar (e.g., Visual) and add the new control section using `Section`, `ColorControl`, `SliderControl`, etc.
    *   *Example*: `<VisualsSection draft={draft} updateDraft={updateDraft} ... />`

## 🛡️ Golden Rule: Total Centralization
No component in the Sarak library should have "hidden" or local visual configurations. If a visual parameter exists, it **MUST** be traceable via the `MASTER_DESIGN_MAP` and editable through the `ThemeCustomizationTab`.

---
**Sarak Engineering v12.0**  
*Sovereign Design, Atomic Precision, and Industrial Control.*
