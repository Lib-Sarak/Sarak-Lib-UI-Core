# Skill: Sarak Logic Decoupling (v6.8)

This skill is responsible for the elimination of technical coupling, ensuring that modules communicate exclusively through network calls (API), without dependence on internal shared libraries.

## ⚖️ Decoupling Principles
- **End of Shared-Lib**: Prohibition of using global utility packages that create build dependence between modules.
- **Protective Micro-Clients**: Each module must implement its own API clients or use native browser/system standards.
- **Agnostic Contracts**: Use of `manifest.json` to delegate orchestration to the interface layer.
- **Technical Nomenclature**: Use of terms like "Redundancy," "Fallback," and "Interface" instead of praise adjectives.

## 📂 Reference Files
1. [Definition](./1_definicao.md) - Why code coupling prevents scaling.
2. [Operational Instructions](./2_instrucoes.md) - Procedures for package cleanup and call refactoring.
3. [Rules and Limits](./3_regras_e_limites.md) - What is permitted in terms of type duplication (DRY vs De-coupling).
4. [Validation Checklist](./4_validacao.md) - Runtime independence audit.

---
**Sarak Systems Engineering v6.8**
**Focus on Autonomy and Scalability**
