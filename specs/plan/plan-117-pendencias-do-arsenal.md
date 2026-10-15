---
tipo: "plan"
titulo: "Fechar as pendencias do arsenal do Design Engine antes de os temas serem refeitos"
objetivo: "Resolver, antes de os temas embarcados serem refeitos, tudo que o arsenal do Design Engine oferece e nao entrega: ligar os tokens que nao desenham, retirar os redundantes e manter aqui o registro vivo das pendencias que a plan-110 for achando"
dominio: "Design Engine / Arsenal / Tokens"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "design-engine", "tokens", "arsenal", "temas", "pendencias"]
relacionados: ["[[02-design-engine]]", "[[04-contrato-de-tokens-e-paridade]]", "[[09-temas-e-presets]]", "[[10-seguranca-e-acessibilidade]]", "[[00-regras-e-invariantes]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "arquitetura/02-design-engine.md + arquitetura/04-contrato-de-tokens-e-paridade.md + specs/09-temas-e-presets.md"
---

# 1. Objetivo

Antes de refazer os 19 temas, **o arsenal que eles vão usar entrega o que promete**: todo token que o schema (e o
painel) oferece muda a tela, ou sai do schema. Esta plan é também o **registro vivo** das pendências do arsenal que a
`plan-110` for descobrindo: cada achado entra na tabela da §3, é resolvido em lote aqui, e só então os temas são
ajustados.

# 2. Contexto

O lote 1 da `plan-110` (2026-10-15) abriu os 120 tokens de cartões, sobreposições e tabelas, um a um, no leitor e no
navegador, e encontrou **sete que o schema e o painel oferecem e nada desenha** (anexo
`plan-110-tokens-funcionais.md` §4; hoje na exceção `achado-lote-1` do gate de documentação e no GUIA §6.4). O dono
decidiu (2026-10-15): **ligar cinco e retirar dois**, e anotar aqui as próximas pendências, resolvendo-as antes de
ajustar os temas. O dono valida só no importador, no fim (`8.0.0-rc.1`), então cada ligação precisa se provar sozinha.

**Medido no lote 1 da `plan-110`, conferido pelo revisor (2026-10-15):**

| Token | Hoje | Decisão |
|---|---|---|
| `cardActionClickScale` | `SarakActionCard.tsx:59` calcula `clickScale` e não o usa | **ligar** |
| `imageCardHoverZoom` | o `whileHover` está na camada da imagem; o véu e o conteúdo, por cima, recebem o ponteiro: a camada nunca é "hovered" | **ligar** |
| `cardSpotlightOpacity` | 4 cartões escrevem `data-spotlight` e `.spotlight-effect`; nenhuma regra CSS os lê | **ligar** |
| `borderBeamEnabled` | `.border-beam-effect` sem regra; `@keyframes beam-rotate` e `@property --beam-angle` existem em `_animations.css:21-30` | **ligar** |
| `cardSearchBorderBeamActive` | idem, no cartão de busca em foco | **ligar** |
| `cardContentAlignment` | só o `getCardStyles` morto o lê; ligá-lo com o padrão `start` agruparia o conteúdo no topo de todo cartão (hoje `cardTextAlign` já decide: `left` → `justify-between`) | **retirar** |
| `tableActionPosition` | `useTableLayoutStyles` calcula e ninguém consome; a `SarakTable` não tem coluna de ações nem API para ela | **retirar** |

**Decisão de desenho registrada (a confirmar pelo executor contra o código):** o spotlight **segue o cursor** — um
hook compartilhado pelos quatro cartões grava `--sarak-spot-x`/`--sarak-spot-y` no cartão (ponteiro fino; em toque ou
sem movimento, o gradiente cai no centro). Sem o hook, a descrição do token mente.

**Efeito sobre quem já consome:** spotlight (padrão 0,1), zoom (1,05), escala do clique (0,96) e o beam do campo de
busca (`true`) passam a **desenhar por padrão**. É mudança visível, vai na nota MAJOR da `## 8.0.0`, e o
`sarak-sovereign` (lote 6 da `plan-110`) fixa os valores padrão estéticos — por isso esta plan **não** altera
nenhum `defaultValue`.

# 3. Escopo

## 3.1 Dentro
- **Ligar:** `src/components/atomic/Cards/` (`SarakActionCard`, `SarakSearchCard`, `SarakTitleCard`) e
  `src/components/atomic/Templates/` (`SarakCoreCard`, `SarakImageCard`); o hook novo do spotlight junto deles;
  `src/styles/` (`_cards.css` e/ou `_animations.css`, a regra do `.spotlight-effect` e do `.border-beam-effect`).
- **Retirar:** `src/core/Design/schema/{cards,tables}.ts`, `src/core/Design/catalog/partitions/` e
  `theme_table_mapping.json` (paridade), `src/core/Provider/generated/` (por `npm run token-types`),
  `src/core/Provider/utils/removedTokenKeys.ts`, os tipos extras em `src/core/Provider/types.ts` /
  `payloadExtraKeys.ts`, e o código morto (`getCardStyles` em `useStructuralStyles.ts`, `actionColumnAlignmentClass`
  em `useTableLayoutStyles.ts`) — pela skill `ui-refatorar-componente`.
- **Documentar:** o `usage`/`kind`/`modeDependent`/`interactsWith` dos cinco ligados no schema, e a saída deles da
  exceção `achado-lote-1` (`gates/allowlists/tokenDocumentationPending.json`); `sarak-ui/GUIA-FRONTEND.md` (§6.4 e o
  mapa) e `.agents/skills/ui-integra-consumidor/`; `docs/migracoes.md` (`## 8.0.0`).
- **Provar:** testes de componente, o caso de navegador (`browser-tests/`, cena nova no harness) e o gate de leitor.
- `specs/plan/anexos/plan-110-tokens-funcionais.md` — acrescentar o desfecho dos sete (o executor).

## 3.2 Fora
- Qualquer `defaultValue` (é o lote 5/6 da `plan-110`) e qualquer tema.
- Token novo, opção nova de token existente, ou qualquer funcionalidade que não seja o desenho prometido pelo
  próprio token (ex.: **não** criar API de ações de linha na `SarakTable`).
- Specs em `specs/` (a síntese é do revisor).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `arquitetura/02-design-engine.md` (§9, §10.2, §10.6, §10.8-§10.11) | como o motor emite e como o componente lê; cascata e variável com dono |
| Spec fixa | `arquitetura/04-contrato-de-tokens-e-paridade.md` | a paridade que a retirada de token respeita |
| Spec fixa | `specs/10-seguranca-e-acessibilidade.md` §2.4 | movimento reduzido e toque |
| Spec fixa | `specs/00-regras-e-invariantes.md` (R33, R40-R44) | contrato público, token sem leitor, cascata, variável, cor fixa |
| Anexo | `specs/plan/anexos/plan-110-tokens-funcionais.md` §4 | a medição que originou a plan |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| **Skill** | `ui-arquitetura-design` · `ui-refatorar-componente` · `ui-novo-componente` | CSS do motor, remoção de token sem quebrar paridade |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `test-unitario` | sempre |
| Código | `src/components/atomic/Cards/SarakActionCard.tsx` · `src/components/atomic/Cards/SarakSearchCard.tsx` · `src/components/atomic/Cards/SarakTitleCard.tsx` · `src/components/atomic/Templates/SarakImageCard.tsx` · `src/components/atomic/Templates/components/SarakCoreCard.tsx` · `src/styles/_animations.css` · `src/core/Provider/manifest.ts` | os leitores e as variáveis emitidas |
| Código | `gates/allowlists/tokenDocumentationPending.json` · `gates/scripts/contrato/check-token-documentation.ts` · `gates/scripts/contrato/check-token-reader.mjs` | a exceção que esvazia e o gate de leitor |

# 5. Instruções de execução

## 5.1 O registro vivo das pendências

> **Regra de entrada:** só o **revisor** acrescenta linha, entre lotes, quando a `plan-110` (ou outra) achar algo do
> arsenal que o schema/painel oferece e não entrega, ou que o importador precisa e não existe. Cada linha tem
> **decisão** (ligar · retirar · documentar · aceitar) e **lote**. Item sem decisão do dono fica como *candidata*.
> A plan só fecha (🟢) com a tabela sem linha aberta.

| # | Pendência | Origem | Decisão | Lote | Estado |
|---|---|---|---|---|---|
| P1 | `cardActionClickScale` — ligar o escalonamento do botão de ação ao clicar | plan-110 lote 1 | ligar | 1 | aberta |
| P2 | `imageCardHoverZoom` — o zoom da imagem de capa no hover nunca dispara | plan-110 lote 1 | ligar | 1 | aberta |
| P3 | `cardSpotlightOpacity` — o spotlight que segue o cursor não tem regra CSS | plan-110 lote 1 | ligar | 1 | aberta |
| P4 | `borderBeamEnabled` — o traço luminoso na borda do cartão não tem regra CSS | plan-110 lote 1 | ligar | 2 | aberta |
| P5 | `cardSearchBorderBeamActive` — o traço no cartão de busca em foco | plan-110 lote 1 | ligar | 2 | aberta |
| P6 | `cardContentAlignment` — redundante com `cardTextAlign`; ligá-lo regride o layout | plan-110 lote 1 | retirar | 3 | aberta |
| P7 | `tableActionPosition` — a tabela não tem coluna de ações | plan-110 lote 1 | retirar | 3 | aberta |
| P8 | `getCardStyles` morto e `structuralConsumer` de `cardImagePosition`/`cardContentAlignment` o citando; `cardVariant` com `axis: 'texture'` | plan-110 lote 1 (backlog 34) | retirar/corrigir | 3 | aberta |
| C1 | *(candidata)* fontes só pelo Google Fonts: offline cai na fonte de reserva (achado A11 do anexo de direção) | plan-110 lote 0 | **a decidir pelo dono**: aceitar e documentar · ou embarcar fontes | — | candidata |
| C2 | *(candidata)* 7 `tokenId` duplicados e 28 entradas sem leitor nas partições do catálogo (backlog 7) | plan-88 | a triar | — | candidata |
| C3 | *(candidata)* `--sarak-font-size` emitida em runtime e fora de `tokens.cssVars` (backlog 6) | plan-88 | a triar | — | candidata |

## 5.2 Os lotes

**Em todo lote:** cada token é aberto no leitor e **conferido no navegador por diferença de estilo computado**, como
no lote 1 da `plan-110`; o valor devolvido não prova a tela. Cor sempre de token (a primária ou o brilho do cartão),
**nenhum valor fixo** (R43); nenhum `!important` em seletor amplo (R41); a variável emitida tem um dono (R42).
**Movimento reduzido** (`reducedMotion` do token e `prefers-reduced-motion`) zera spotlight animado, zoom, escala e
beam. Nada carrega informação só pelo efeito. Nota na `## 8.0.0`; gerados regenerados (`guide`/`dev-kit` por último).

**Lote 1 — P1, P2, P3 (movimento do cartão).**
1. P1: o botão de ação do `SarakActionCard` encolhe a `cardActionClickScale` no clique/toque (`whileTap`); o
   `whileTap={{ scale: 0.95 }}` fixo da linha 134 passa a ler o mesmo token se for o mesmo elemento, ou fica
   justificado.
2. P2: o zoom vale ao passar o ponteiro sobre **o cartão inteiro** (`whileHover`/variants no pai, não na camada que
   nunca recebe o ponteiro); `imageCardHoverZoom` 1 = sem zoom; o `SarakImageCard` e o que o reutiliza.
3. P3: a regra `.spotlight-effect` desenha o gradiente radial da primária do tema com a opacidade do token (0 =
   nada); o hook compartilhado segue o cursor nos quatro cartões (e a `SarakCoreCard`); **sem custo quando o token é
   0** (o hook não registra listener).
4. `usage`/`kind`/`modeDependent`/`interactsWith` dos três no schema; saem da exceção do gate.

**Lote 2 — P4, P5 (o traço luminoso).**
5. A regra `.border-beam-effect` desenha um anel de gradiente cônico que gira com `--beam-angle` (a animação e o
   `@property` já existem), mascarado para ocupar só a borda; cor da primária do tema; **o raio acompanha o raio do
   cartão** (`--sarak-card-radius`).
6. `borderBeamEnabled` liga em qualquer cartão; `cardSearchBorderBeamActive` desenha só com o campo em foco.
   Desligado, nenhuma animação roda e nenhum nó extra pesa. Custo medido: o executor reporta o impacto de ter
   dezenas de cartões com o beam ligado e registra o aviso no `usage`.
7. Documentar (schema, GUIA); sair da exceção.

**Lote 3 — P6, P7, P8 (retirada) e fechamento da tabela.**
8. Retirar `cardContentAlignment` e `tableActionPosition` do schema, das partições do catálogo, do mapeamento de
   tema, dos tipos gerados e dos tipos extras, **com** a entrada em `REMOVED_TOKEN_KEYS` (o valor salvo cai no
   padrão, com aviso) — pela `ui-refatorar-componente`, mantendo a paridade 1:1:1 verde.
9. Apagar o código morto (P8) e corrigir o `axis` de `cardVariant`.
10. Nota MAJOR (retirada de chave do payload) em `## 8.0.0`; GUIA §6.4 e o mapa do kit atualizados; as sete
    entradas `achado-lote-1` somem da exceção do gate.
11. Conferir as **candidatas** da §5.1: o executor lê C1–C3 e relata o estado atual de cada uma (achado, não
    correção); o revisor decide.

**Lotes seguintes:** abertos pelo revisor quando a tabela da §5.1 ganhar linha. Cada novo lote repete o método.

# 6. Critérios de aceite

- [ ] P1–P5: cada token muda o estilo computado no navegador (par valor-padrão × extremo, em repouso, hover, foco e
  pressionado conforme o caso); testes de componente e **caso de navegador** novo com mutação.
- [ ] Movimento reduzido zera os cinco efeitos; token em zero/desligado não registra listener nem anima.
- [ ] P6–P8: os dois tokens fora do schema, das partições, do mapeamento e dos tipos; entrada em
  `REMOVED_TOKEN_KEYS`; tema salvo com a chave não quebra (aviso e padrão); paridade 1:1:1, `token-reader:check` e
  `token-types:check` verdes; código morto removido.
- [ ] `usage` dos cinco ligados no schema; exceção `achado-lote-1` vazia; GUIA §6.4 sem os sete.
- [ ] Nenhum `defaultValue` alterado; nenhum tema alterado; nenhuma cor fixa.
- [ ] Tabela da §5.1 sem linha aberta (candidatas decididas pelo dono ou movidas para o backlog).
- [ ] Suíte completa verde numa passada; `tsc` 0; `audit:baseline` sem regressão; Anel 1; `cromo-css-real:check`;
  catálogo, kit e barril em dia; Anel 0 simulado: 0.

# 7. Como verificar (uso do revisor)

- Cada token ligado: ler o leitor no diff e **medir a diferença de estilo computado** no navegador, fora do resumo;
  mutação (remover a regra/o `whileTap` derruba o teste/caso).
- Retirada: `grep` do id em `src/`, `sarak-ui/`, `docs/` (só `removedTokenKeys` e a nota restam); carregar um
  payload com a chave e ver o aviso.
- `git diff --stat` → só a §3.1 e os gerados. Nenhum `defaultValue`.
- `npm run build` + `npm run cromo-css-real:check` · `npx vitest run` · `npx tsc --noEmit` ·
  `npm run audit:baseline -- --with-tsc` · Anel 1 · Anel 0.

# 8. Destino da síntese

**Destino:** `specs/arquitetura/02-design-engine.md + specs/arquitetura/04-contrato-de-tokens-e-paridade.md + specs/09-temas-e-presets.md`

- **`02` §10:** o que o spotlight, o traço luminoso, o zoom e a escala do clique desenham, e o que cada um lê.
- **`04`:** os dois tokens retirados e a regra "token oferecido muda a tela ou sai" como fato do contrato.
- **`09`:** os efeitos de cartão como alavancas disponíveis a tema.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido nem reescrito. -->

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->
