# Skill: Sarak Atomic Security (v6.8)

This skill defines decentralized protection protocols, ensuring that each module performs its own network authentication validation, following the Zero Trust model.

## ⚖️ Security Principles
- **Decentralized Validation**: The module does not trust validations performed by external layers without proof via token or signature.
- **Credential Isolation**: API keys and sensitive tokens are never shared between modules; each service manages its own "Vault."
- **Principle of Least Privilege**: Access to endpoints is restricted to the minimum necessary for the contract's operation.
- **Technical Nomenclature**: Use of terms like "Authentication," "Authorization," "Payload," "Hashing," and "JWT."

## 📂 Reference Files
1. [Definition](./1_definicao.md) - Atomic Security Architecture.
2. [Operational Instructions](./2_instrucoes.md) - Implementation of Token Verifiers and Middlewares.
3. [Rules and Limits](./3_regras_e_limites.md) - Best practices for secret transport and storage.
4. [Validation Checklist](./4_validacao.md) - Security compliance audit.

---
**Sarak Security Engineering v6.8**
**Focus on Integrity and Resilience**
