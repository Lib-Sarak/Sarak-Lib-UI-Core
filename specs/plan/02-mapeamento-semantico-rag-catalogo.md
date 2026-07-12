---
tipo: "spec"
titulo: "Gabarito Semântico e Preenchimento Fatiado do Catálogo (ex-RAG)"
dominio: "Design Engine (Sarak UI Core)"
status: "🟢 Implementado"
prioridade: "Alta"
tags: ["spec", "ai-agent", "semantic", "sliced-generation", "data-driven"]
relacionados: ["16-agente-llm-mapeamento-semantico", "07-agente-llm-design-e-expansao-estrutural", "01-auditoria-cobertura-componentes", "03-separacao-estrutural-chat-acao", "04-multi-preset-diversificado", "05-ingestao-multimodal-html", "06-pipeline-visao-dois-estagios"]
---

> Esta spec substitui e absorve `specs/plan/16-agente-llm-mapeamento-semantico.md` (rascunho anterior, nunca implementado — o arquivo 16 agora só redireciona pra cá).

# 0. Histórico — por que esta spec foi reescrita (revisão de 2026-07-12)

A primeira implementação desta spec (RAG: `similaritySearch` sobre o catálogo, injetando só os N tokens "mais relevantes" no prompt da Chamada B) **quebrou o Design Agent em produção**. Diagnóstico:

- A causa raiz original do truncamento (Spec 03, Seção 1) era a **resposta** do LLM sendo cortada por `max_tokens` ao gerar um payload grande de uma vez só — o estouro sempre foi na **saída**.
- A implementação de RAG atacou a **entrada** (injetar menos tokens no prompt). Era o cano errado, e o preço foi cegar o agente: com a config default do repo (`defaults.json`: `embeddings_provider: "local"` — hash de bag-of-words, sem semântica real — e `similarity_threshold: 0.7`), o retrieval devolvia **zero** resultados pra pedidos em linguagem natural realistas. `routes.ts` não tinha fallback pra isso, então a Chamada B recebia literalmente `[DICIONÁRIO DE TOKENS DISPONÍVEIS — 0 chaves]` — o agente parava de aplicar qualquer coisa, pra qualquer pedido.
- As contas mostram que a entrada nunca foi o gargalo: o gabarito completo com `description` dá ~29k tokens (medido: `JSON.stringify(getDesignScaffold())` serializado ≈ isso), contra 200k de contexto disponível na maioria dos modelos modernos — e é **estático** (só muda quando a lib expande), então entra em prompt cache. Injetar o catálogo inteiro nunca foi caro. O caro era pedir pro modelo devolver ~400 chaves numa única resposta.

A correção (Seções 6-9 abaixo) ataca o lado certo do cano: **fatia a SAÍDA por família de tokens** (6 fatias, cada uma devolvendo uma fração do catálogo), não a entrada. O mecanismo de indexação/similaridade não foi deletado — foi **engavetado** (`agent-design-operator/src/toolbox/_shelved/catalog_indexer.ts`, ver Seção 10), porque pode servir depois pra um problema genuinamente de busca-em-corpus-grande (ex.: localizar um trecho relevante dentro de um brandbook de 200 páginas ingerido pelas Specs 05/06 — aí sim o "catálogo" a buscar não cabe inteiro no prompt).

# 1. Visão Geral
O Design Agent precisa gerar/ajustar um tema completo (~409 chaves reais, ver Seção 5.1) a partir de um pedido em linguagem natural, sem truncar a resposta e sem vazar detalhe técnico pro chat (Spec 03). A arquitetura tem duas etapas: (1) traduzir o pedido num **Design Brief** em prosa — o "entendimento", desacoplado do catálogo; (2) preencher o gabarito completo **fatiado por família** — 6 chamadas de LLM em paralelo, cada uma responsável só por uma fração das chaves, pequena o bastante pra nunca truncar por construção.

# 2. Regras de Negócio
- **Regra 1 (Onde a semântica mora):** o campo `description` (`DesignToken`, `src/core/Design/types.ts`) é preenchido diretamente nos arquivos de schema (`src/core/Design/schema/*.ts`), lado a lado com `id`/`label`/`type`. Não vira um dicionário separado — mantém a mesma fonte única da verdade (Schema → MasterMap → Catálogo). **Inalterada desde a primeira implementação.**
- **Regra 2 (`axis` — muda de função nesta revisão):** cada token ganha uma classificação de eixo visual — `color` | `geometry` | `elevation` | `texture` | `density` | `motion`. Na implementação original, `axis` seria usado como critério de busca do retrieval. Como o retrieval foi engavetado, `axis` agora serve só à Spec 04 (diversificação) e, secundariamente, como um checklist de completude qualitativo ("o tema tocou mais de um eixo, não só cor?" — é o que o teste E2E desta spec verifica). Continua opcional (tokens estruturais/não-visuais podem não ter eixo).
- **Regra 3 (Gabarito completo, não recorte — substitui a antiga "Regra 3 RAG"):** a Etapa 2 (preenchimento) recebe o **gabarito inteiro** (`getDesignScaffold()`, todas as chaves reais com `label`/`description`/`axis`/tipo/faixa) em CADA uma das 6 chamadas — é contexto de coerência entre fatias, não um recorte por relevância. O que limita o tamanho da resposta é a fatia de chaves que cada chamada está autorizada a PREENCHER, não o tamanho do contexto de entrada.
- **Regra 4 (Fatiamento por família, 6 chamadas em paralelo):** as ~409 chaves reais são divididas em 6 fatias por afinidade de `ComponentSchema.id` (ver Seção 6). Cada fatia dispara sua própria chamada de LLM, todas em `Promise.allSettled` — uma fatia falhando (JSON inválido, ou reprovada na validação de catálogo) nunca derruba as demais (Regra 4 da Spec 03, reafirmada aqui: falha parcial nunca vaza JSON cru nem produz 500).
- **Regra 5 (Dois modos, seleção explícita):** modo `create` (default) preenche o gabarito completo do zero; modo `patch` (quando o pedido é alteração de um tema específico já existente) recebe o tema base e cada fatia emite só os overrides daquela família. O modo é um parâmetro explícito da requisição (`mode`/`base_theme` no corpo) — nunca inferido por heurística de texto.
- **Regra 6 (Design Brief como contexto compartilhado):** antes das 6 fatias, uma chamada isolada (`generateDesignBrief`) traduz o pedido do usuário — e, no futuro, conteúdo extraído de site/PDF/imagem pelas Specs 05/06 (ponto de extensão já existe, não implementado aqui) — numa descrição em PROSA sem token técnico nenhum. Esse Brief é o contexto compartilhado que mantém as 6 fatias (e a Chamada A/chat da Spec 03) coerentes entre si.

# 3. Critérios de Aceite
- [x] Gabarito completo (`getDesignScaffold()` — `backend/node/catalog.ts`, com `label`/`description`/`axis`/`schemaId`/`defaultValue`) chega ao `agent-design-operator` via `@sarak/lib-ui-core/backend/node`, com `dist/` reconstruído (`tsup`) — o consumidor usa symlink `file:..`, sem rebuild os campos novos não aparecem do lado dele.
- [x] Etapa 1 (Design Brief) implementada (`agent-design-operator/src/toolbox/design_brief.ts`) e testada — traduz o pedido em prosa, proíbe JSON/token técnico explicitamente no prompt.
- [x] Etapa 2 (6 fatias em paralelo) implementada (`theme_slice_filler.ts` + `theme_orchestrator.ts`); as 28 famílias reais de `MASTER_DESIGN_MAP` cobertas pelas 6 fatias, sem sobra nem duplicata — garantido por `assertSliceCoverage()`, testado contra o gabarito real.
- [x] Merge + `ThemeValidator` (validação por fatia, isolada) + política de falha parcial documentada (Seção 8) e testada.
- [x] Modos `create` e `patch` funcionando, com seleção explícita (`mode`/`base_theme` no corpo da requisição — `patch` sem `base_theme` retorna 400, nunca adivinha).
- [x] Retrieval fora do caminho crítico (engavetado em `_shelved/`); nenhum código do caminho principal depende de `embeddings_provider`/`similarity_threshold` — a dependência problemática do provider `local` foi eliminada do fluxo principal.
- [x] Testes unitários + E2E cobrindo: brief, cada fatia, merge, falha de uma fatia isolada, e o caso "tema completo não trunca" — ver Seção 9.
- [x] `run_audit.mjs` → 0 falhas.
- [x] Specs 02/03, índice e progresso atualizados com a verdade (esta revisão).

# 4. Taxonomia de Eixos (`axis`) — definição e critério de classificação (inalterada)

Use esta tabela para decidir o `axis` de cada token. Se um token realmente não se encaixa em nenhum (ex.: `mode`, `navigationStyle`, campos estruturais/feature-toggle), **deixe `axis` indefinido** — não force. 12 dos 416 registros do gabarito bruto ficam assim (ver Seção 5.1 pra por que 416 ≠ 409).

| `axis` | O que cobre | Pistas no `id`/`type` |
|---|---|---|
| `color` | Qualquer token `type: 'color'`, ou `select` cujas opções são só nomes de cor/paleta | `id` contém `Bg`, `Color`, `Text`, `Border` (quando `type: 'color'`) |
| `geometry` | Raio de borda, espessura, proporção, posição/alinhamento estrutural | `id` contém `Radius`, `Width`, `Height`, `Padding`, `Gap`, `Position`, `Align` |
| `elevation` | Sombra, blur de fundo (backdrop), z-index visual, profundidade | `id` contém `Shadow`, `Blur`, `Glow`, `Elevation` |
| `texture` | Padrões visuais de superfície: ruído, grid, textura de fundo | `id` contém `Texture`, `Pattern`, `Grain`, `Noise` |
| `density` | Espaçamento entre elementos, tamanho de fonte em escala, compactação | `id` contém `Gap`, `Spacing`, `Density`, `Scale` (critério de desempate com `geometry`: espaço **dentro** de um componente = `geometry`; espaço **entre** vários elementos/densidade da tela = `density`) |
| `motion` | Duração/velocidade de transição, animação, hover scale | `id` contém `Speed`, `Duration`, `Scale` (hover/active), `Transition`, `Pulse` |

# 5. `description`/`axis` nos schemas — status (inalterado desde a implementação original)

100% dos tokens têm `description`; 404/416 registros têm `axis` (os sem eixo estão listados na Seção 4). Ver `git log`/diff dos 28 arquivos de `src/core/Design/schema/*.ts` pro conteúdo — não repetido aqui pra não desatualizar (a Seção 6 da versão anterior desta spec, com os 6 exemplos de `buttons.ts`, continua válida como referência de tom/tamanho de `description` pra quem for escrever tokens novos).

## 5.1. Por que "~409" e não "416" — achado durante esta revisão

`getDesignScaffold()` retorna 416 registros (um por par schema×token), mas **7 `id`s existem em duas famílias/schemas ao mesmo tempo** — pendência de higiene de schema pré-existente, já documentada em `backlog_cobertura.md` (Spec 01) como fora do escopo de correção imediata:

| `id` duplicado | Schemas | Dono efetivo escolhido |
|---|---|---|
| `bgBaseColor` | `system`, `atmosphere` | `system` (primeiro em `MASTER_DESIGN_MAP.components`) |
| `cardBackgroundColor` | `cards`, `colors` | `cards` |
| `cardBorderColor` | `cards`, `colors` | `cards` |
| `colorBgBody` | `colors`, `atmosphere` | `colors` |
| `colorBgLayer1` | `colors`, `atmosphere` | `colors` |
| `colorBgLayer2` | `colors`, `atmosphere` | `colors` |
| `zIndexModal` | `engineering`, `layers` | `engineering` |

Sem tratar isso, um `id` duplicado cairia em DUAS fatias ao mesmo tempo — duas chamadas de LLM recebendo instrução de preencher a mesma chave, resultado imprevisível (a fatia processada por último no merge vence, silenciosamente). `agent-design-operator/src/config/shared/theme_slices.ts` exporta `deduplicateScaffoldById()`, que colapsa pra 409 chaves únicas mantendo a primeira ocorrência (mesma ordem que `ThemeValidator.loadDynamicCatalog()` já usa pro Map interno — então o "dono" escolhido já é consistente com o que o validador aplica hoje). `routes.ts` deduplica uma vez, antes de passar o gabarito pra qualquer etapa. **Este documento não resolve a duplicação na origem** (isso é uma tarefa de `ui-refatorar-componente` nos 4 schemas envolvidos, fora do escopo desta correção arquitetural) — só neutraliza o efeito colateral dela nesta arquitetura.

Também descobertos e corrigidos nesta revisão (bugs pré-existentes, não introduzidos por esta spec, mas que bloqueavam um teste honesto de "tema completo não trunca"): `easeOut` (`animations.ts`) tinha `defaultValue` fora do seu próprio conjunto de opções válidas (copiado por engano de outro token); `badgeRadius` (`status.ts`) tinha `defaultValue: 99` fora do seu próprio `max: 20`. Ambos corrigidos — ver `00-progresso.md`.

# 6. As 6 Fatias (`agent-design-operator/src/config/shared/theme_slices.ts`)

Fatiamento por família (não por eixo — decisão tomada na revisão, não reaberta). Tamanho real de cada fatia (após deduplicar, 409 chaves totais) — **não são do mesmo tamanho**: a família `cards` sozinha tem 79 tokens, então "Superfícies" é bem maior que a média.

| Fatia | `schemaId`s | Chaves reais (pós-dedup) |
|---|---|---|
| Fundações | `colors`, `typography`, `global`, `system` | 73 |
| Superfícies | `cards`, `cardAction`, `cardSearch`, `cardTitle`, `layers`, `overlays` | 112 |
| Controles | `buttons`, `inputs`, `switches` | 48 |
| Dados e Navegação | `tables`, `data`, `navigation`, `scrollbars` | 51 |
| Atmosfera e Movimento | `atmosphere`, `media`, `motion`, `animations` | 52 |
| Especializados | `chat`, `status`, `specialized`, `advanced`, `branding`, `engineering`, `structural` | 73 |

`assertSliceCoverage(scaffold)` confere, em teste, que as 28 famílias reais de `MASTER_DESIGN_MAP` batem exatamente com a união dos `schemaIds` das 6 fatias — nem faltando (tema nasceria incompleto) nem duplicada (dois LLMs disputando a mesma chave). Falha com erro descritivo se uma família nova aparecer no schema sem entrar em nenhuma fatia.

# 7. Prompts das duas etapas

## 7.1. Etapa 1 — Design Brief (`design_brief.ts`)
Uma chamada, prosa pura, proibição explícita de JSON/colchetes/nome de token técnico. Recebe o pedido do usuário (e, no futuro, `referenceContent` — ponto de extensão pras Specs 05/06, não implementado aqui). Lança erro se o provider devolver string vazia.

## 7.2. Etapa 2 — uma fatia (`theme_slice_filler.ts`, uma das 6 chamadas em paralelo)
Recebe: o gabarito completo formatado (`formatCatalogPromptBlock`, reaproveitado de `catalog_prompt.ts`), o Design Brief, a lista de chaves que ESTA fatia está autorizada a preencher (`[CHAVES DESTA FATIA]`), e — no modo `patch` — o subconjunto do tema base que pertence só a esta fatia. Mesma regra de "NENHUMA_ALTERACAO" da Spec 03 quando não há nada a mudar nesta fatia. `maxTokens` da chamada é calculado por `computeSliceMaxTokens(sliceKeyCount, configuredMaxTokens)` — nunca menor que o configurado, cresce quando a fatia (ex. "Superfícies", 112 chaves) exigir mais espaço de saída do que o padrão comporta com folga. Isto é o que torna a garantia "nunca trunca" uma propriedade de ENGENHARIA (orçamento de saída dimensionado pelo tamanho real da fatia), não uma esperança de que o `max_tokens` configurado por acaso seja suficiente.

# 8. Merge, validação e política de falha parcial (`theme_orchestrator.ts`)

`generateThemeSlices()` dispara as 6 fatias em `Promise.allSettled`. Pra cada resultado:
- **Rejeitada** (provider falhou, ou resposta não é JSON parseável): a fatia inteira entra em `failedSliceLabels`, as demais seguem normalmente.
- **Resolvida com `{}`** (a fatia respondeu `NENHUMA_ALTERACAO`): não é falha, só não contribui pro payload final.
- **Resolvida com um objeto**: validada isoladamente contra o catálogo real via `themeValidator.validatePayload(sliceValues)` (a MESMA engine que `processThemeUpdate` usa no fim da cadeia — reuso, não uma segunda implementação de validação). Se passar, é mesclada no payload final (`Object.assign`); se reprovar (chave alucinada ou valor fora do domínio), a fatia inteira entra em `failedSliceLabels` — não tenta salvar as chaves individualmente válidas dentro de uma fatia reprovada, o "grão" da falha parcial é a fatia, não a chave.

**Política de falha parcial escolhida (documentada, não é a única possível):** aplica as fatias que passaram, avisa em `message` — só o **nome humano** da fatia (`ThemeSlice.label`, ex. "Atmosfera e Movimento"), nunca chave técnica nem erro cru — quais áreas não puderam ser ajustadas desta vez. **Não tenta retry automático da fatia** — dobraria latência/custo pra um caso já raro por construção (cada fatia é pequena o bastante pra não truncar; se ainda assim falhar, é mais provável ser um problema pontual do provider do que algo que um retry sozinho resolveria de forma confiável).

`response_assembler.ts` (`assembleAgentResponse`) faz a validação FINAL do merge via `processThemeUpdate` (defesa em profundidade — teoricamente redundante já que cada fatia foi validada isoladamente, mas barato e sanciona o mesmo caminho que já existia) e monta a mensagem final, nunca vazando JSON/erro cru (Regra 4 da Spec 03, preservada).

# 9. Plano de Testes (Quality Gate)

## Testes Unitários
- [x] `theme_slices.test.ts` — cobertura das 28 famílias reais (`assertSliceCoverage`), `getSliceTokens` retorna só a família certa, `deduplicateScaffoldById` colapsa os 7 ids duplicados mantendo a primeira ocorrência.
- [x] `design_brief.test.ts` — retorna prosa trimada; prompt proíbe JSON/tokens técnicos explicitamente; inclui `referenceContent` quando fornecido; lança erro se o provider devolver vazio.
- [x] `theme_slice_filler.test.ts` — parse de JSON válido/`NENHUMA_ALTERACAO`/inválido; modo `patch` sem `baseTheme` lança ANTES de chamar o provider; `[CHAVES DESTA FATIA]` restrito à família certa; `computeSliceMaxTokens` cresce pra fatias grandes e nunca fica abaixo do configurado.
- [x] `theme_orchestrator.test.ts` — merge de 6 fatias válidas; isolamento de falha por rejeição do provider; isolamento de falha por reprovação na validação de catálogo; caso todas `NENHUMA_ALTERACAO`; **caso "tema completo não trunca"** (todas as 409 chaves reais preenchidas numa só rodada, sem nenhuma fatia falhar); modo `patch` propaga o tema base corretamente.

## Testes de Contrato (API)
- *N/A* — `POST /prompt` mantém o mesmo contrato de resposta (`AgentResponse{success, message, payload?}`) da Spec 03; nenhum campo novo.

## Testes E2E (Integração) — `tests/e2e/prompt_route.test.ts`
- [x] Caminho feliz (modo `create`): Brief + Chat + 6 fatias combinam num tema aplicado; mensagem nunca contém `{` nem `[THEME_UPDATE`; exatamente 8 chamadas de LLM por requisição (1 Brief + 1 Chat + 6 fatias).
- [x] Modo `patch` sem `base_theme` → 400, nenhum LLM chamado.
- [x] Modo `patch` com `base_theme` → prompt de cada fatia recebe `MODO PATCH` + o subconjunto do tema base daquela família.
- [x] Falha parcial: uma fatia com JSON malformado não derruba as demais; mensagem final cita o nome humano da fatia falhada, nunca a chave técnica nem o JSON cortado.
- [x] **Caso "tema completo não trunca"**: modo `create` com todas as 6 fatias devolvendo TODAS as suas chaves reais (409 no total) aplica o tema inteiro numa única rodada.

# 10. Retrieval semântico — engavetado, não deletado

`agent-design-operator/src/toolbox/_shelved/catalog_indexer.ts` (e seu teste, `tests/unit/toolbox/_shelved/catalog_indexer.test.ts`) mantêm o mecanismo original (`ensureCatalogIndexed`/`retrieveRelevantTokens`, usando `VectorStoreInterface`/`EmbeddingsInterface` — nenhuma interface nova, mesma infraestrutura da Regra 4 original) funcionando e testado, mas **fora do caminho crítico** — nenhum arquivo de `src/api/` o importa mais. Ver o docblock do arquivo pro diagnóstico completo. Não é reaproveitado nesta correção; fica disponível como ponto de partida caso surja um problema real de busca-em-corpus-grande (ex.: dentro da ingestão de brandbook das Specs 05/06).
