---
tipo: "spec"
titulo: "Generalizar SarakCoreCard / SarakCardGrid (remover domínio LLM da variante default)"
dominio: "Componentes UI Base / Templates"
status: "🔴 Planejada (follow-up da Spec 40 — decisão HITL de 2026-07-21, não bloqueia nenhum Selo)"
prioridade: "Média"
tags: ["spec", "contrato-de-componente", "follow-up", "cardgrid", "paridade"]
relacionados: ["40-fechamento-achados-pos-selo", "03-padrao-e-taxonomia-biblioteca-atomica"]
---

# 1. Visão Geral e Descrição do Problema

Durante a execução da Spec 40 (generalização do `SarakActionCard`), a varredura por strings de UI hardcoded encontrou o MESMO defeito num componente de superfície MAIOR: `SarakCoreCard` (`src/components/atomic/Templates/components/SarakCoreCard.tsx`) é a variante **`"classic"`** de `SarakCardGrid` — a variante **DEFAULT** quando o manifesto não declara `variant`. Ela tem embutido o mesmo domínio de catálogo de modelos LLM que o `SarakActionCard` tinha:

- Painel fixo "Custo In (1M)" / "Custo Out (1M)" (linhas 116-128 de `SarakCoreCard.tsx`).
- "Janela de Contexto" com aritmética de domínio `Number(context) / 1000` (linhas 129-134).
- Bloco expansível fixo "Descrição Técnica" / "Tokenizer" (linhas 160-174).
- Default do subtítulo `'Modelo'` (linha 81) — mesmo problema do `SarakActionCard` original.

O vazamento vai além do componente: a própria **interface pública** `SarakCardGridProps.mapping` (`src/components/atomic/Templates/SarakCardGrid.tsx`, linhas 36-47) declara os campos `price_in?`, `price_out?`, `context?` NO TIPO — já publicados no catálogo gerado (`docs/manifest-catalog.md`, seção `SarakCardGrid`, aprox. linha 777). Isso é diferente do `SarakActionCard` (que recebia `mapping?: Record<string, string>` solto, sem tipo fechado) — aqui a mudança é **quebra de contrato tipado**, não apenas de comportamento.

## 1.1 Por que isto NÃO entrou na Spec 40

Decisão do mantenedor (2026-07-21, registrada em `00-progresso.md`): a Spec 40 nomeia explicitamente só `SarakActionCard.tsx`. `SarakCoreCard`/`SarakCardGrid` ficaram de fora porque:
1. É o caminho **default** do grid mais usado — maior superfície de regressão.
2. `SarakCardGrid.mapping` é tipo público **já publicado** — remover campos dele é quebra de contrato do consumidor, exige nota de migração formal.
3. Merece teste de caracterização do `SarakCoreCard` (hoje coberto só indiretamente por `SarakCardGrid.test.tsx`, sem suíte dedicada) ANTES do refactor, não durante.

# 2. Regras de Negócio (Solução)

## 2.1 Teste de caracterização ANTES do refactor
- Criar `SarakCoreCard.test.tsx` (`src/components/atomic/Templates/components/__tests__/`) cobrindo o comportamento ATUAL (variant classic com `price_in`/`price_out`/`context`/`tokenizer`/`description`) via snapshot, para servir de rede de segurança do refactor seguinte.

## 2.2 Generalizar `SarakCoreCard`
- Mesma filosofia da Spec 40 §2.5: painel de "Custo In/Out"/"Janela de Contexto"/"Tokenizer" vira genérico, dirigido por `mapping.details` (array de pares `{ label, value }` já formatados pelo consumidor — sem aritmética embutida).
- Default do `subtitle` deixa de ser `'Modelo'` (vira vazio/configurável).
- Preservar as demais seções (input/output capacities, botões Ver Specs/ExternalLink) — fora do escopo desta generalização, a menos que também tenham domínio embutido (auditar ao executar).

## 2.3 Remover campos LLM do tipo público `SarakCardGridProps.mapping`
- Remover `price_in?`, `price_out?`, `context?` da interface `mapping` de `SarakCardGridProps` (`SarakCardGrid.tsx`).
- **BREAKING CHANGE de tipo público** — produzir nota de migração (quem usava esses campos passa a usar `mapping.details` apontando para um array pré-formatado no item).
- Regenerar o catálogo (`npm run catalog`) — a seção `SarakCardGrid` em `docs/manifest-catalog.md` reflete o tipo novo.

## 2.4 Nota de migração
- Documentar em `docs/manifest-catalog.md` (ou changelog, conforme convenção do repositório) a mudança de `mapping.price_in/price_out/context` → `mapping.details`, com o exemplo do "antes"/"depois".
- Atualizar a linha temporária inserida pela Spec 40 no catálogo/skill (a que aponta "SarakCardGrid/SarakCoreCard pendentes de generalização") — remover a nota de pendência quando esta spec fechar.

# 3. Critérios de Aceite
- [ ] `SarakCoreCard.test.tsx` (caracterização do comportamento atual) criado e verde ANTES do refactor.
- [ ] `SarakCoreCard` (variante `classic`) sem nenhum texto/aritmética de domínio LLM fixo; painel de detalhes dirigido por `mapping.details`.
- [ ] `SarakCardGridProps.mapping` sem `price_in`/`price_out`/`context` no tipo; catálogo regenerado.
- [ ] Nota de migração escrita (antes/depois) referenciando este breaking change.
- [ ] Nota temporária da Spec 40 sobre esta pendência removida do catálogo/skill.
- [ ] Gates verdes: `RegistryParity`, `catalog:check`, `npm run build`; `run_audit.mjs` sem regressão (baseline conhecido).

# 4. Plano de Testes (Quality Gate)
## Unitários
- [ ] `SarakCoreCard.test.tsx`: caracterização (antes) + comportamento novo (depois) — `mapping.details` renderiza pares genéricos, nenhum campo LLM fixo aparece.
- [ ] `SarakCardGrid.test.tsx`: ajustar fixtures que hoje usam `price_in`/`price_out`/`context` para o novo formato `details`, mantendo cobertura da variante `classic`.
## Build / Contrato
- [ ] `npm run catalog:check` reflete o tipo novo de `SarakCardGridProps.mapping`.
- [ ] `npm run build` verde (breaking change de tipo não quebra a compilação da própria lib, só o contrato para consumidores externos — documentado na nota de migração).
