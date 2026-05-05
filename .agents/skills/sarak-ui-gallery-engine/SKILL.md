---
name: sarak-ui-gallery-engine
description: Mission Skill for expanding and refining the Sarak UI Gallery and Design Engine (v12.0).
---

# Skill: Sarak UI Gallery Engine (v12.0)

This skill governs the expansion and technical refinement of the Sarak Design Engine Gallery. It ensures that all UI specimens (Cards, Typography, Presets, etc.) are implemented with high industrial fidelity and synchronized with the `MASTER_DESIGN_MAP` (v12.0.0).

## Sovereign Dependencies
To execute this skill with excellence, you **MUST** first read and follow the core industrial guidelines:
- [sarak-ui-core-specialist](../sarak-ui-core-specialist/SKILL.md) - The definitive authority for UI Engineering.

## Architectural Rules (v12.0 — MANDATORY)

> **All gallery data must come from `src/core/Design/presets/`.** Never hardcode tokens inline.

| Gallery Component | Data Source |
|---|---|
| `PresetsGallery.tsx` | `THEME_EFFECTS` from `presets/animations` |
| `TypographyGallery.tsx` | `THEME_FONTS` from `presets/typography` |
| `LanguageTab.tsx` | `LANGUAGES` from `core/Discovery/constants` |
| `LayoutTab.tsx` | `DENSITY`, `NAVIGATION_STYLES`, `SCALES` from `presets/layout`; `THEME_FONTS` from `presets/typography` |
| `PaletteSelector.tsx` | `COLOR_PALETTES` from `presets/colors` |

## Gallery Panel Structure (DesignEngine)
```
src/features/DesignEngine/
  Canvas/
    Galleries/
      PresetsGallery.tsx    — Theme effect selection
      TypographyGallery.tsx — Font family browsing
    PreviewCanvas.tsx       — Live 1:1 design preview
  Panels/
    LanguageTab.tsx         — i18n language selector
    LayoutTab.tsx           — Density, nav style, scale
  DesignEngineContainer.tsx — Orchestrator
```

## When Adding a New Gallery Category
1. Source all data from the appropriate `src/core/Design/presets/*.ts` module.
2. If the data does not exist, create it in the correct preset module first.
3. The `PRESETS_LIBRARY` hub (`presets/index.ts`) must be updated to re-export any new constants.
4. Add the corresponding token to the relevant schema in `src/core/Design/schema/*.ts`.
5. Validate: run `npm run build` — zero errors required.

## Operational Documentation
1. [Definition](./1_definicao.md) - Goal, scope, and target categories.
2. [Workflow Instructions](./2_instrucoes.md) - Step-by-step for implementing new categories.
3. [Rules & Limits](./3_regras_e_limites.md) - Prohibitions and architectural constraints.
4. [Validation Checklist](./4_validacao.md) - Quality gate for "Digital Twin" compliance.

---
**Sarak Mission Control v12.0**  
*Continuity, Fidelity, and Industrial Growth.*
