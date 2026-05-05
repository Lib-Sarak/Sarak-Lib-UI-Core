---
name: sarak-ui-core-specialist
description: Definitive authority in Sarak UI-Core Engineering. Governs the Industrial Design Engine, Plug & Play Agnostic Integration, and Sovereign Visual Orchestration (v12.0).
---

# Skill: Sarak UI-Core Specialist (Atomic Modular Sovereignty v12.0)

This skill is the **sovereign authority** for maintaining and evolving the `Sarak-Lib-UI-Core` module. Its mission is to ensure the library remains a high-performance, agnostic, and "Plug & Play" engine that can be seamlessly integrated into any React ecosystem (Forzy, Identity, Library, etc.).

## Critical Architecture Rules (v12.0 — MANDATORY)

> **NEVER reintroduce monolithic constant files.** The old `src/constants/design-tokens.ts` is **deleted**. All design constants live in `src/core/Design/presets/`.

> **NEVER import from `src/constants/discovery.ts`** for type usage. All types (`DiscoveredModule`, `VisualContract`) must come from `src/core/Discovery/types.ts`.

## Source of Truth — Directory Map

| Concern | Canonical Path |
|---|---|
| Design tokens (atomic presets) | `src/core/Design/presets/` |
| Color palettes & primaries | `src/core/Design/presets/colors/index.ts` |
| Typography & font catalog | `src/core/Design/presets/typography/index.ts` |
| Animations & effects | `src/core/Design/presets/animations/index.ts` |
| Layout & density | `src/core/Design/presets/layout/index.ts` |
| Atmosphere presets | `src/core/Design/presets/atmosphere/index.ts` |
| Data presets | `src/core/Design/presets/data/index.ts` |
| Presets hub (aggregator) | `src/core/Design/presets/index.ts` |
| Design Map (100% schema) | `src/core/Design/master-map.ts` (v12.0.0) |
| All 10 component schemas | `src/core/Design/schema/*.ts` |
| Discovery types | `src/core/Discovery/types.ts` |
| Discovery registry | `src/core/Discovery/registry.ts` |
| Dynamic renderer | `src/core/Discovery/DynamicRenderer.tsx` |
| Shell entry | `src/core/Shell/SarakShell.tsx` |
| Provider | `src/core/Provider/SarakUIProvider.tsx` |

## Pillars of Agnostic Sovereignty (v12.0)
1. **Atomic Preset Architecture**: Design constants are strictly modular. Each domain (colors, typography, animations, layout, data, atmosphere) lives in its own `presets/` sub-module. The `presets/index.ts` aggregates all via the `PRESETS_LIBRARY` hub.
2. **Plug & Play Architecture**: The module is entirely self-contained. It provides its own state management, persistence logic, and design injection, requiring only a `SarakUIProvider` at the root.
3. **Agnostic Persistence Engine**: Support for host-defined `storageKey`, `endpoints`, and custom `onSave`/`onLoad` handlers. The library adapts to the host's storage strategy without hardcoded paths.
4. **Industrial Design Engine (v12.0)**: Absolute governance of tokens via `MASTER_DESIGN_MAP` (v12.0.0) with **Granular Sovereignty**. 10 component schemas: Shell, Identity, Typography, Atmosphere, Card, Controls, Data, Animation, Specialized, System.
5. **Manifest-Driven Discovery**: Host applications register local modules and components via the `manifest` prop, allowing the core `SarakShell` to discover and render external UI dynamically.

## MASTER_DESIGN_MAP — 10 Schemas (v12.0.0)

| Schema | File | Key Tokens |
|---|---|---|
| `ShellSchema` | `schema/shell.ts` | navigationStyle, sidebarWidth, autoHide |
| `IdentitySchema` | `schema/identity.ts` | brandName, logoUrl, brandAccent |
| `TypographySchema` | `schema/typography.ts` | fontFamily, fontSize, fontWeight |
| `AtmosphereSchema` | `schema/atmosphere.ts` | primaryColor, texture, textureOpacity, glassOpacity |
| `CardSchema` | `schema/cards.ts` | cardRadius, cardElevation, cardGlass |
| `ControlsSchema` | `schema/controls.ts` | buttonRadius, inputStyle, language |
| `DataSchema` | `schema/data.ts` | chartStyle, chartPalette, tableDensity |
| `AnimationSchema` | `schema/animations.ts` | animationSpeed, animationPreset |
| `SpecializedSchema` | `schema/specialized.ts` | chatBubbleStyle, qrSize, authDensity, authNoiseEnabled, statsVariant |
| `SystemSchema` | `schema/system.ts` | persistenceKey, debugMode |

## Key Exports (Public API via `src/index.ts`)
- `SarakUIProvider`, `useSarakUI`, `SarakShell`
- `MASTER_DESIGN_MAP`, `getDefaultDesignState`, `getAllDesignTokens`
- `PRESETS_LIBRARY`, `COLOR_PALETTES`, `COLOR_PRESETS`
- `DiscoveredModule`, `VisualContract` (types only)
- All atomic templates: `SarakTable`, `SarakStats`, `SarakAuthScreen`, `SarakSecurityOrchestrator`, etc.

## Technical Documentation Stack
1. [Design Engine & Token Injection](./1_design_engine.md) - Atomic Presets & Granular Injection (v12.0).
2. [Agnostic Integration & Persistence](./2_agnostic_integration.md) - How to "Plug & Play" (v12.0).
3. [Manifest-Driven Registration](./3_visual_contracts.md) - Component and Module discovery.
4. [Sovereign Validation Checklist](./4_validacao.md) - Rules for Industrial Quality.

---
**Sarak Engineering v12.0**  
*Atomic Sovereignty, Agnostic Precision, and Plug & Play Excellence.*
