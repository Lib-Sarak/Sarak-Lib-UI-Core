---
tipo: "spec"
titulo: "Erradicação de `any` — Constantes + Varredura Final e Fechamento"
dominio: "Sarak-Lib-UI-Core (Adequação)"
status: "🔴 A Implementar"
prioridade: "Média"
tags: ["spec", "any", "adequacao", "constants", "fechamento", "baseline-zero"]
relacionados: ["60-erradicacao-any-plano-mestre", "61-erradicacao-any-nucleo", "62-erradicacao-any-componentes", "63-erradicacao-any-design-engine", "50-finalizacao-adequacao-e-entrega"]
---

# 1. Visão Geral
Fatia **4 (final)** da campanha (Spec 60): quita o resíduo em **`src/constants/**`**, faz a **varredura de fechamento** sobre toda a base e **confirma o baseline em 0**. É o passo que oficializa a **Regra 1 da Spec 50** como satisfeita.

# 2. Escopo

## 2.1 `src/constants/` (~5)
- `icon-packs.tsx` — 3 · `discovery.ts` — 2

## 2.2 Varredura de fechamento (toda a base)
Após 61/62/63 fecharem, rodar o auditor sobre **`src/**` inteiro** e adequar qualquer ocorrência:
- **residual** não prevista (arquivo novo entrou via outra spec depois do baseline);
- **reintroduzida** (regressão que escapou ao gate de alguma fatia).

# 3. Regras de Negócio
- **Regra 1 — Zero absoluto:** ao fim desta spec, `auditor_typescript.mjs` deve reportar **0** `any` em `src/**`. Não há resíduo tolerado (o baseline §0.6 do índice deixa de existir).
- **Regra 2 — Registro de exceções:** se alguma camada exigir `@ts-expect-error` por contrato externo inevitável (ex.: tipo de lib sem `@types`), **catalogar** aqui: arquivo, linha, motivo. Cada exceção precisa de comentário no código + entrada nesta spec. Meta: **lista vazia**; qualquer item é decisão HITL.
- **Regra 3 — Sincronizar o índice:** atualizar `00-indice-plano-expansao.md` §0.6 — trocar "`any` (492 ocorrências) é dívida pré-existente" por "baseline quitado pela campanha 60–64" — e marcar a **Regra 1 da Spec 50** como concluída.
- **Regra 4 — Hierarquia de substituição** conforme Spec 60 §3.2. Proibido `as any`/`@ts-ignore`.

# 4. Critérios de Aceite
- [ ] `auditor_typescript.mjs` = **0** em `src/**` (base inteira).
- [ ] `run_audit.mjs` 100% verde (7/7 auditores).
- [ ] `npx tsc --noEmit` = 0 erros; `npx vitest run` sem regressão.
- [ ] Tabela de exceções `@ts-expect-error` desta spec preenchida (idealmente vazia) e justificada.
- [ ] Índice §0.6 atualizado + Regra 1 da Spec 50 marcada satisfeita.

# 5. Plano de Testes (Quality Gate)
## Testes Unitários
- [ ] **Deve** manter toda a suíte de caracterização das fatias 61–63 verde na varredura final (nenhuma regressão acumulada).
## Testes de Contrato (Tipos)
- [ ] **Deve** confirmar, via `tsc --noEmit` global em 0 erros, que a base atingiu o estado **Zero Any** declarado como lei absoluta no índice (§0.1).

# 6. Tabela de Exceções (`@ts-expect-error`) — preencher na execução
| Arquivo | Linha | Motivo (contrato externo) | Aprovado por (HITL) |
|---|---|---|---|
| _(meta: vazia)_ | | | |
