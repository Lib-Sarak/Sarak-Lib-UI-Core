---
tipo: "spec"
titulo: "Generalizar SarakCoreCard / SarakCardGrid (remover domínio LLM da variante default)"
dominio: "Componentes UI Base / Templates"
status: "🟢 Concluída (2026-07-25) — painel dirigido por `mapping.details`; `price_in`/`price_out`/`context` fora do tipo; `SarakCardGridProps` agora é público"
prioridade: "Média"
tags: ["spec", "contrato-de-componente", "follow-up", "cardgrid", "paridade"]
relacionados: ["30-fechamento-achados-pos-selo", "03-padrao-e-taxonomia-biblioteca-atomica"]
---

# 1. Visão Geral e Descrição do Problema

Durante a execução da Spec 30 (generalização do `SarakActionCard`), a varredura por strings de UI hardcoded encontrou o MESMO defeito num componente de superfície MAIOR: `SarakCoreCard` (`src/components/atomic/Templates/components/SarakCoreCard.tsx`) é a variante **`"classic"`** de `SarakCardGrid` — a variante **DEFAULT** quando o manifesto não declara `variant`. Ela tem embutido o mesmo domínio de catálogo de modelos LLM que o `SarakActionCard` tinha:

- Painel fixo "Custo In (1M)" / "Custo Out (1M)" (linhas 116-128 de `SarakCoreCard.tsx`).
- "Janela de Contexto" com aritmética de domínio `Number(context) / 1000` (linhas 129-134).
- Bloco expansível fixo "Descrição Técnica" / "Tokenizer" (linhas 160-174).
- Default do subtítulo `'Modelo'` (linha 81) — mesmo problema do `SarakActionCard` original.

O vazamento vai além do componente: a própria **interface pública** `SarakCardGridProps.mapping` (`src/components/atomic/Templates/SarakCardGrid.tsx`, linhas 36-47) declara os campos `price_in?`, `price_out?`, `context?` NO TIPO — já publicados no catálogo gerado (`docs/manifest-catalog.md`, seção `SarakCardGrid`, aprox. linha 777). Isso é diferente do `SarakActionCard` (que recebia `mapping?: Record<string, string>` solto, sem tipo fechado) — aqui a mudança é **quebra de contrato tipado**, não apenas de comportamento.

## 1.1 Por que isto NÃO entrou na Spec 30

Decisão do mantenedor (2026-07-21, registrada em `00-progresso.md`): a Spec 30 nomeia explicitamente só `SarakActionCard.tsx`. `SarakCoreCard`/`SarakCardGrid` ficaram de fora porque:
1. É o caminho **default** do grid mais usado — maior superfície de regressão.
2. `SarakCardGrid.mapping` é tipo público **já publicado** — remover campos dele é quebra de contrato do consumidor, exige nota de migração formal.
3. Merece teste de caracterização do `SarakCoreCard` (hoje coberto só indiretamente por `SarakCardGrid.test.tsx`, sem suíte dedicada) ANTES do refactor, não durante.

# 2. Regras de Negócio (Solução)

## 2.1 Teste de caracterização ANTES do refactor
- Criar `SarakCoreCard.test.tsx` (`src/components/atomic/Templates/components/__tests__/`) cobrindo o comportamento ATUAL (variant classic com `price_in`/`price_out`/`context`/`tokenizer`/`description`) via snapshot, para servir de rede de segurança do refactor seguinte.

## 2.2 Generalizar `SarakCoreCard`
- Mesma filosofia da Spec 30 §2.5: painel de "Custo In/Out"/"Janela de Contexto"/"Tokenizer" vira genérico, dirigido por `mapping.details` (array de pares `{ label, value }` já formatados pelo consumidor — sem aritmética embutida).
- Default do `subtitle` deixa de ser `'Modelo'` (vira vazio/configurável).
- Preservar as demais seções (input/output capacities, botões Ver Specs/ExternalLink) — fora do escopo desta generalização, a menos que também tenham domínio embutido (auditar ao executar).

## 2.3 Remover campos LLM do tipo público `SarakCardGridProps.mapping`
- Remover `price_in?`, `price_out?`, `context?` da interface `mapping` de `SarakCardGridProps` (`SarakCardGrid.tsx`).
- **BREAKING CHANGE de tipo público** — produzir nota de migração (quem usava esses campos passa a usar `mapping.details` apontando para um array pré-formatado no item).
- Regenerar o catálogo (`npm run catalog`) — a seção `SarakCardGrid` em `docs/manifest-catalog.md` reflete o tipo novo.

## 2.4 Nota de migração
- Documentar em `docs/manifest-catalog.md` (ou changelog, conforme convenção do repositório) a mudança de `mapping.price_in/price_out/context` → `mapping.details`, com o exemplo do "antes"/"depois".
- Atualizar a linha temporária inserida pela Spec 30 no catálogo/skill (a que aponta "SarakCardGrid/SarakCoreCard pendentes de generalização") — remover a nota de pendência quando esta spec fechar.

# 3. Critérios de Aceite
- [x] `SarakCoreCard.test.tsx` (caracterização do comportamento atual) criado e verde ANTES do refactor — 7 casos + snapshot do card LLM, rodados verdes antes de qualquer edição no componente (snapshot arquivado fora do repo como evidência do "antes").
- [x] `SarakCoreCard` (variante `classic`) sem nenhum texto/aritmética de domínio LLM fixo; painel de detalhes dirigido por `mapping.details`.
- [x] `SarakCardGridProps.mapping` sem `price_in`/`price_out`/`context` no tipo; catálogo regenerado. **Além do previsto:** o tipo passou a ser EXPORTADO publicamente (estava na allowlist `BARREL_PROPS_EXCLUSIONS` justamente esperando esta spec).
- [x] Nota de migração escrita (antes/depois) — `docs/migracoes.md` (novo; `docs/` é publicado no pacote).
- [x] Nota temporária de pendência removida. **Correção factual:** a nota da Spec 30 vivia na skill `ui-integra-escrever-manifesto`, REMOVIDA junto com o motor de manifesto (Spec 46) — já não existia. A pendência viva era a entrada `SarakCardGrid` em `scripts/barrelExclusions.mjs` (deixada pela Spec 40.1), essa sim removida aqui.
- [x] Gates verdes: `catalog:check`, `barrel:check` (78 componentes, 0 faltas), `npm run build` (DTS 110,26 KB), `package:check` (55 arquivos — +1 = `docs/migracoes.md`); `run_audit.mjs` **no baseline exato** (2 falhas: 1 hardcode `SarakTypography:42` + 3 ghostvars). *(`RegistryParity` não existe mais — saiu com o motor de manifesto na Spec 46.)*

# 4. Plano de Testes (Quality Gate)
## Unitários
- [x] `SarakCoreCard.test.tsx`: caracterização (antes) + comportamento novo (depois) — `mapping.details` renderiza pares genéricos, nenhum campo LLM fixo aparece (10 casos, incl. asserção negativa varrendo as 9 strings de domínio).
- [x] `SarakCardGrid.test.tsx`: nenhuma fixture usava `price_in`/`price_out`/`context` (o arquivo era só um smoke de import) — nada a ajustar; a cobertura da variante `classic` vive no `SarakCoreCard.test.tsx`.
## Build / Contrato
- [x] `npm run catalog:check` reflete o tipo novo de `SarakCardGridProps.mapping`.
- [x] `npm run build` verde; `dist/index.d.ts` sem nenhuma ocorrência de `price_in`/`price_out` e com `type SarakCardGridProps` exportado.

# 5. Achados da execução (fora do previsto na spec)

1. **Zero consumidor real do `SarakCardGrid`.** Grep no ERP Earendel (único consumidor real, 4 web apps): nenhuma ocorrência de `SarakCardGrid`/`SarakCoreCard`/`price_in`. O breaking change de tipo não tem vítima conhecida — mesmo desfecho da Spec 30 com o `SarakActionCard`.
2. **O tipo nunca chegou a ser público.** A spec o descrevia como "já publicado"; ele estava documentado no catálogo, mas EXCLUÍDO do barril (`BARREL_PROPS_EXCLUSIONS`) pela Spec 40.1 exatamente para não congelar o domínio LLM. A quebra real é do *catálogo*, não da tipagem importada.
3. **Domínio além do painel (auditado, conforme §2.2).** Também eram texto fixo de domínio, e viraram dado: `"Ver Specs"`/`"Fechar"` (→ `expand_label`/`collapse_label`, defaults neutros), `"Descrição Técnica"` (→ `description_label`), `"Input/Output Capacities"` (→ `input_caps_label`/`output_caps_label`) e o `getCapIcon`, que trocava o ícone do chip por palavra-chave de LLM (`vision`/`web`/`chat`) — agora ícone neutro único. O bloco `Tokenizer` foi removido (cabe em `details`).
4. **O expansor virou condicional.** Sem `mapping.description` não há painel para abrir; o botão deixou de ser renderizado em vez de abrir uma gaveta vazia.
5. **Bug do gerador de catálogo, corrigido de raiz.** `generate-component-catalog.mjs` copiava o texto do tipo CRU: os `// v6.3` (e qualquer JSDoc de campo inline) iam parar dentro da célula da tabela. Adicionado `typeTextOf()` (remove comentários antes de colapsar o espaço em branco) — sem isso, documentar os campos novos por JSDoc deixaria a célula ilegível. Único efeito no catálogo inteiro: a própria linha do `SarakCardGrid`.
