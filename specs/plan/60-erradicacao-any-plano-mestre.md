---
tipo: "plano-mestre"
titulo: "Plano Mestre — Erradicação de `any` (Campanha de Adequação)"
dominio: "Sarak-Lib-UI-Core (Adequação)"
status: "🟡 Em Andamento (484 → 454; Spec 61 parcial)"
prioridade: "Média"
tags: ["spec", "plano-mestre", "any", "adequacao", "type-safety", "campanha"]
relacionados: ["00-indice-plano-expansao", "50-finalizacao-adequacao-e-entrega", "61-erradicacao-any-nucleo", "62-erradicacao-any-componentes", "63-erradicacao-any-design-engine", "64-erradicacao-any-constantes-e-fechamento", "65-foundation-design-state"]
---

# 1. Visão Geral
Mestre da **campanha dedicada de quitação da dívida de `any`** — a única regra estrutural reprovada pelo auditor (`auditor_typescript.mjs`). Operacionaliza, em ondas próprias, a **Regra 1 da Spec 50** (`any` residual → 0), front-loadando o trabalho que hoje está adiado para a Finalização.

> **Por que campanha própria:** a Spec 50 trata o `any` como uma linha entre cinco tarefas de fechamento. O volume real (**~484 ocorrências em ~124 arquivos**) é grande o suficiente para virar um eixo de trabalho com fatiamento por *blast radius*, rede de caracterização e gate por fatia. Quando esta campanha zerar o baseline, a **Regra 1 da Spec 50 fica satisfeita** (a Spec 50 apenas confirma o verde).

# 2. Baseline (laudo do auditor — referência, não-vinculante a contagem exata)
Snapshot da varredura `node .agents/skills/ui-auditoria-modulo/scripts/auditor_typescript.mjs`:

| Fatia (spec) | Escopo | Ocorrências (aprox.) |
|---|---|---|
| **61** | `src/core/**` (Provider · Shell · Design · Discovery) | ~134 |
| **62** | `src/components/**` (atomic · engines) | ~179 |
| **63** | `src/features/DesignEngine/**` | ~165 |
| **64** | `src/constants/**` + varredura final + fechamento | ~6 + resíduo |
| | **Total baseline** | **~484** |

> Hotspot único a vigiar: `src/core/Discovery/components/ContractRenderer.tsx` concentra **39** ocorrências sozinho (cabe na Spec 61, mas é tarefa de **alto risco** — ver §4).

## 2.1 Estado da campanha (commit 1)
**484 → 454** (−30). Spec 61 com a parte autônoma (risco baixo/médio) concluída e verde — ver Spec 61 §1.1 para a lista de arquivos.

**Refinamento de sequência (achado-fundação):** o padrão `design: any` domina o restante e **não** se resolve por arquivo — `SarakThemePayload` é estrito demais (domínio fechado) e `Record<string,unknown>` cascateia para `features/` (valor de token usado como CSS). Por isso a campanha ganha um **batch transversal de Foundation** que precede o resto: definir o **tipo-fundação do design-state** (`SarakDesignState`, Opção C) e então varrer junto todos os sites `design:any` (Provider core + Shell + color-engine/presets) **e** seus consumidores em `features/` (atravessa Specs 61↔62↔63). **Especificado na Spec 65.** Os demais batches HITL: `ContractRenderer`+`types.ts` (Discovery) e `manifest.ts`.

> **Ordem revisada:** **Foundation (Spec 65)** → restante de 61 (Discovery `ContractRenderer`+`types.ts`) → 62 → 63 (já desbloqueadas pela 65) → 64. A 65 é o de-risco de maior alavancagem.

# 3. Leis da Campanha (inegociáveis)
1. **Comportamento preservado.** Nenhum refactor de tipo pode mudar runtime. Toda fatia segue a skill **`code-adequacao`**: rede de **testes de caracterização** captura o comportamento ATUAL **antes** de tocar o arquivo.
2. **`any` → tipo real, não `any` disfarçado.** A ordem de preferência de substituição é:
   1. **Tipo/interface próprio** (o correto na maioria dos casos de props/config).
   2. **Genéricos** (`<T>`) quando a função é realmente paramétrica.
   3. **`unknown` + narrowing** (type guard) quando a fronteira é dinâmica de verdade.
   4. **Cast pontual tipado** (`as Foo`) só quando há contrato externo conhecido.
   - **Proibido:** trocar `any` por `any` renomeado, `as any`, ou `// @ts-ignore` para silenciar. `@ts-expect-error` **só** com comentário justificando contrato externo inevitável — e conta como exceção a registrar na Spec 64.
3. **Gate por fatia.** Uma fatia (61/62/63/64) só fecha quando:
   - `auditor_typescript.mjs` reporta **0** `any` no escopo daquela fatia (o baseline da fatia cai a zero);
   - `npx tsc --noEmit` = **0 erros** (a tipagem nova não introduziu erro);
   - `npx vitest run` (no escopo) sem falha nova — caracterização verde = comportamento intacto.
4. **Sem afrouxar o auditor.** Proibido excluir pastas do `auditor_typescript.mjs` ou relaxar a regra para baixar a contagem (vide regra da skill `ui-auditoria-modulo`).
5. **Limpeza oportunista continua valendo** (§0.6 do índice): se outra spec tocar um arquivo desta lista antes da campanha chegar nele, ela limpa o arquivo e a fatia correspondente só herda o resíduo.

# 4. Roteamento por Risco (HITL)
Reusa a régua da skill `code-adequacao`:
- **Baixo/médio risco** (props de componente, hooks de estilo, configs locais): adequação direta com caracterização. Elegível a delegação (agente `code-adequador`) se o usuário acionar o `/code3-adequar`.
- **Alto risco** (arquivos densos / coração de runtime — ex.: `ContractRenderer.tsx`, builders de charts, `useDesignManager`, `manifest.ts`): adequação na **thread principal com HITL**, caracterização reforçada antes de tocar.

# 5. Ordem de Build (Ondas)
Núcleo primeiro (maior alavancagem e mais dependentes), conforme recomendação do índice §0:

1. **Spec 61 — Núcleo (`core/`)** → fundação tipada irradia segurança para todos os consumidores.
2. **Spec 62 — Componentes (`components/`)** → maior volume; depende de tipos do núcleo já firmes.
3. **Spec 63 — Design Engine (`features/`)** → camada de configuração; menos crítica, alto volume.
4. **Spec 64 — Constantes + varredura final + fechamento** → zera o resíduo, registra exceções `@ts-expect-error` (se houver) e confirma a **Regra 1 da Spec 50**.

# 6. Critérios de Aceite (Campanha)
- [ ] Specs 61, 62, 63 e 64 com `[x]` (cada uma com seu escopo a 0 `any`).
- [ ] `auditor_typescript.mjs` = **0 violações** na base inteira.
- [ ] `run_audit.mjs` 100% verde (7/7 auditores).
- [ ] `npx tsc --noEmit` = 0 erros; `npx vitest run` sem regressão.
- [ ] **Regra 1 da Spec 50** marcada como satisfeita (baseline quitado por esta campanha).

# 7. Plano de Testes (Quality Gate)
## Testes Unitários
- [ ] **Deve** manter verdes os testes de caracterização criados em cada fatia durante e após o refactor de tipos (comportamento idêntico).
## Testes de Contrato (Tipos)
- [ ] **Deve** garantir que `npx tsc --noEmit` permanece em 0 erros ao final de cada fatia (a tipagem real não quebrou o contrato público).
