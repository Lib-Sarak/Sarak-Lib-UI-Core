---
tipo: "spec"
titulo: "Finalização, Adequação e Entrega do Plano"
dominio: "Sarak-Lib-UI-Core (Finalização)"
status: "🔴 A Implementar"
prioridade: "Média"
tags: ["spec", "finalizacao", "entrega", "any", "documentacao", "importador"]
relacionados: ["00-indice-plano-expansao", "34-conferencia-funcional-do-manifesto", "30-contrato-importador-renderer"]
---

# 1. Visão Geral
Spec de **fechamento do plano**: o que executar **depois** que as Ondas 0–6 estiverem concluídas (ou em paralelo, em baixa prioridade). Consolida a quitação da dívida residual, a documentação de consumo e o guia do importador, deixando o módulo **publicável** e o auditor 100% verde.

# 2. Regras de Negócio (Tarefas de Finalização)
- **Regra 1 — Adequação do `any` residual:** O que sobrar do baseline (492) que a **limpeza oportunista** não cobriu é zerado aqui, por pasta/onda, com **rede de testes de caracterização antes de cada refactor** (skill `code-adequacao`). Meta: baseline → **0**, auditor de `any` verde.
- **Regra 2 — Sub-auditor da Conferência:** Garantir que o `auditor_manifesto.mjs` (Spec 34) está implementado e agregado ao `run_audit.mjs` — caso não tenha sido feito junto da Onda 0. A auditoria passa a ter 7 auditores 100% verdes.
- **Regra 3 — Documentação de Consumo:** Atualizar `specs/specs/08-consumo-externo-e-integracao` + README com a API do `<SarakManifestRenderer />` (`payload`, `dataStore`, `networkInterceptor`, `routerInterceptor`, `routes`) e exemplos de manifesto executáveis.
- **Regra 4 — Guia/Skill do Importador:** Reescrever/atualizar a skill `ui-integra-consumidor` para a **nova API de ingestão de JSON** (não mais só tokens de tema), incluindo o contrato de interceptors, o data store e o registro de componentes customizados (Spec 22).
- **Regra 5 — Higiene e Entrega:** Remover harness/mocks temporários e dead code (skill `code-limpeza-projeto`); rodar o gate de pré-entrega (autoria/licença/documentação via `code-entrega`); confirmar o build `dist` (`tsup`) sem erro e os exports do `src/index.ts` limpos.

# 3. Critérios de Aceite
- [x] Auditor de `any` = **0** (baseline quitado).
- [x] `run_audit.mjs` 100% verde (incl. a Conferência Funcional como 7º auditor).
- [ ] README e `specs/specs/08` documentam a API do Renderer com exemplo de manifesto rodável.
- [ ] `ui-integra-consumidor` reflete a ingestão de manifesto (interceptors + data store + registro de custom).
- [ ] `npm run build` gera o `dist` sem erro; `src/index.ts` exporta apenas o contrato público.

# 4. Plano de Testes (Quality Gate)

## Testes Unitários
- [ ] **Deve** manter os testes de caracterização verdes durante a adequação de `any` (comportamento preservado).

## Testes de Contrato (API)
- [ ] **Deve** validar que o `src/index.ts` exporta o `SarakManifestRenderer` e os tipos públicos (`ManifestNode`, `SarakDataStore`, `ComponentType`).

## Testes E2E (Integração)
- [ ] Montar um app de exemplo (importador de teste) seguindo a documentação atualizada e confirmar que ele renderiza um manifesto multi-página real ponta a ponta.
