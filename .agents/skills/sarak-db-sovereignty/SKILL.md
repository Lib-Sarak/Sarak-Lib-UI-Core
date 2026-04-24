# Skill: Sarak Data Sovereignty (v6.8)

This skill ensures that each module is the sole owner of its data, having its own schema, migrations, and independent initialization processes.

## ⚖️ Sovereignty Principles
- **Schema Isolation**: Each module must operate in a dedicated SQL namespace to avoid collisions.
- **Migration Independence**: The lifecycle of a module's tables must not depend on other services.
- **Prohibition of Cross-FKs**: Foreign keys pointing to tables in other modules are prohibited; use ID references and API validation.
- **Technical Nomenclature**: Use of self-promotional terms in table descriptions or processes is prohibited.

## 📂 Reference Files
1. [Definition](./1_definicao.md) - The principle of Persistence Independence.
2. [Operational Instructions](./2_instrucoes.md) - How to configure schemas and isolated asynchronous sessions.
3. [Rules and Limits](./3_regras_e_limites.md) - What is permitted in cross-schema queries.
4. [Validation Checklist](./4_validacao.md) - SQL independence audit.

---
**Sarak Data Engineering v6.8**
**Focus on Integrity and Decoupling**
