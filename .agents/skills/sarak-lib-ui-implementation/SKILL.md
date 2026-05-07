# Skill: Sarak Module Onboarding (Sovereign Integration v12.0)

This skill governs the integration of new independent modules into the Sarak Sovereign architecture. The goal is to ensure that any new module is 100% agnostic and visually controlled by the **Sarak Design Engine (v12.0)**.

## 🏛️ Sovereign Visual Rules (MANDATORY v12.0)

For a module to be considered "Sarak Sovereign", it must follow these rules:

1.  **Zero Hardcoded Colors**: It is strictly forbidden to use hexadecimal colors, RGB, or color names (e.g., red, blue) directly in components. Always use the CSS variables injected by the engine (e.g., `var(--theme-primary)`).
2.  **State Agnosticism**: The module must not have its own design state. It must consume the state from `useSarakUI()` provided by the `SarakUIProvider`.
3.  **Visual Contract**: Each module must define its `VisualContract` in its manifest, specifying which components it exports and how they should react to the 3 Pillars (Identity, Aesthetic, Visual).

## ⚙️ Integration Workflow

1.  **Manifest Registration**: The host app must register the module via the `manifest` prop in `SarakShell`.
2.  **Token Mapping**: If the module requires exclusive tokens, they must be added to the `SpecializedSchema` in `src/core/Design/schema/specialized.ts`.
3.  **Style Injection**: The module must use the `applySovereignStyle` utility to ensure that textures and atmospheres are correctly applied to its containers.

## 🛠️ Operational Documentation
1. [Definition](./1_definicao.md) - v12.0 Scope and goals.
2. [Operational Instructions](./2_instrucoes.md) - Technical step-by-step for integration.
3. [Rules & Limits](./3_regras_e_limites.md) - Architectural constraints.
4. [Validation Checklist](./4_validacao.md) - Acceptance criteria for the "Sovereign Stamp".

---
**Sarak Onboarding v12.0**  
*Independence, Sovereignty, and Agnostic Precision.*
