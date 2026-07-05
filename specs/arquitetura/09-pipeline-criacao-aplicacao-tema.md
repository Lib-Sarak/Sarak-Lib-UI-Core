---
tipo: "arquitetura"
titulo: "Pipeline de Criação e Aplicação de Tema (Payload → Persistência → DOM)"
dominio: "Design Engine (Sarak UI Core)"
status: "🟢 Vigente"
tags: ["arquitetura", "design-system", "tema", "api", "persistencia", "agente-llm", "pipeline"]
relacionados: ["01-arquitetura-motor-tema-design-engine", "04-paridade-cinco-camadas", "08-gate-auditoria-hardcode-e-variaveis", "09-expansao-vs-configuracao"]
---

# 1. Propósito e Princípio Fundamental
Explicar o **mecanismo data-driven** da Sarak UI Core na prática, respondendo 3 perguntas objetivas:
1. **O que compõe o layout** (tokens, componentes, chaves estruturais) — Seção 2.
2. **Onde cada configuração está e o que significa** (o mapa: schema TS → catálogo → coluna do banco) — Seção 2.3.
3. **Como aplicar, criar ou alterar** (o pipeline payload → validação → persistência → DOM) — Seções 3-8.

**Nota de escopo:** esta spec **não é o contrato comportamental do Agente LLM**. Ela é o explicador do sistema e o mapa de onde cada coisa vive — qualquer agente (ou humano) que precise mudar algo consulta esta spec para saber *onde* e *como*. Decisões específicas de comportamento do agente (tratamento de erro, formato do endpoint de geração) pertencem a `specs/plan/07-agente-llm-design-e-expansao-estrutural.md` e são apenas referenciadas aqui, nunca resolvidas aqui.

**Princípio fundamental:** "criar um tema", "editar um tema" e "gerar um layout via IA" são **a mesma operação primitiva** — gravar um objeto plano `{ chave: valor }`. Não existe verbo especial para layout vs cor. A única coisa que muda entre uma chave de cor e uma chave estrutural (ex: `cardLayoutDirection`) é **em qual coluna do banco ela cai** e **como o frontend a consome depois** — nunca o formato do payload, nunca o endpoint, nunca a validação. Toda a "inteligência" está no dicionário (Seção 2), não na operação.

# 2. O Dicionário (fonte única de chaves válidas)
Uma chave só é real se existir simultaneamente em 3 fontes (Paridade 1:1:1:1:1, [[04-paridade-cinco-camadas]]):
1. **Schema TS** (`src/core/Design/schema/*.ts`) — contrato de tipo, `defaultValue`, `constraints.options`.
2. **Partição do Catálogo** (`src/core/Design/catalog/partitions/*.json`) — metadados semânticos (`description`, `allowedValues`, `digitalTwins`) consumidos pelo painel humano e pelo RAG do Agente LLM.
3. **`theme_table_mapping.json`** — roteador **chave → coluna do banco**. Se a chave não está aqui, o backend a descarta (Seção 4), mesmo que exista no Schema TS.

Se falta em qualquer uma das 3, a chave é tratada como **inexistente** pelo backend.

## 2.1 Chaves de Valor (Alavanca 1) — catálogo aberto, nunca copiado para a spec
São centenas de tokens (28 schemas) que viram `var(--sarak-*, fallback)` no DOM (mecanismo completo em [[01-arquitetura-motor-tema-design-engine]]). **A lista exaustiva É o conteúdo de `catalog/partitions/*.json` em tempo de execução** — esta spec nunca transcreve esse conteúdo, para não criar uma segunda fonte que desatualiza a cada token novo. O Agente LLM lê essa lista diretamente das partições (RAG, spec `07-agente-llm-design-e-expansao-estrutural` §7.2), nunca de um markdown.

## 2.2 Chaves Estruturais (Alavanca 2) — catálogo fechado, exaustivo por definição
Ao contrário do valor, o conjunto de chaves estruturais é **pequeno e fechado**: 17 chaves, cada uma marcada no Schema TS com o campo `structuralConsumer: string[]` (o(s) Hook(s) Controlador da Camada 6 que a traduz em `className`/`style`) e espelhada nas partições JSON como `"consumerHook"`. A ausência desse campo em um token = é uma chave de Valor (2.1), não Estrutural.

**Fonte viva:** `getStructuralTokens()` em `src/core/Design/master-map.ts` — filtra `getAllDesignTokens()` por presença de `structuralConsumer`. **Nunca reler esta tabela como fonte de verdade** — ela é um retrato tirado ao escrever esta spec; a fonte de verdade é sempre a chamada da função.

| Chave | Valores aceitos | Hook Consumidor | Schema / Partição |
|---|---|---|---|
| `cardLayoutDirection` | `column`\|`row` | `useCardLayoutStyles` | `cards.ts` / `cards_engine.json` |
| `cardImagePosition` | `none`\|`top`\|`left`\|`right` | `useCardLayoutStyles`, `useStructuralStyles.getCardStyles` | `cards.ts` / `cards_engine.json` |
| `cardTextAlign` | `left`\|`center`\|`right` | `useCardLayoutStyles` | `cards.ts` / `cards_engine.json` |
| `cardContentAlignment` | `start`\|`center`\|`space-between` | `useStructuralStyles.getCardStyles` | `cards.ts` / `cards_engine.json` |
| `layoutGridTemplate` | `col-12`\|`auto-fit`\|`masonry` | `useStructuralStyles.getGridStyles` | `structural.ts` |
| `globalFlowDirection` | `column`\|`row` | `useStructuralStyles.getContainerStyles` | `structural.ts` |
| `globalFlowAlign` | `stretch`\|`start`\|`center`\|`end` | `useStructuralStyles.getContainerStyles` | `structural.ts` |
| `headerAlignment` | `space-between`\|`center`\|`start` | `useStructuralStyles.getHeaderStyles` | `structural.ts` |
| `formLabelPosition` | `top`\|`left` | `useStructuralStyles.getFormGroupStyles` | `structural.ts` |
| `formFieldDensity` | `tight`\|`comfortable`\|`relaxed` | `useStructuralStyles.getFormGroupStyles` | `structural.ts` |
| `switchLabelPosition` | `right`\|`left`\|`space-between` | `useStructuralStyles.getSwitchLayoutStyles` | `structural.ts` |
| `inputIconPosition` | `left`\|`right` | `useStructuralStyles.getInputIconStyles` | `inputs.ts` / `components_base.json` |
| `buttonIconPosition` | `left`\|`right` | `useButtonLayoutStyles` | `buttons.ts` / `components_base.json` |
| `tableDensity` | `compact`\|`comfortable`\|`spacious` | `useTableLayoutStyles` | `tables.ts` / `components_base.json` |
| `tableActionPosition` | `left`\|`right` | `useTableLayoutStyles` | `tables.ts` / `components_base.json` |
| `modalActionAlignment` | `left`\|`center`\|`right`\|`stretch` | `useModalLayoutStyles` | `overlays.ts` / `components_base.json` |
| `modalHeaderStyle` | `inline`\|`stacked`\|`floating` | `useModalLayoutStyles` | `overlays.ts` / `components_base.json` |

**Nota de comportamento (não é bug a corrigir aqui):** todo token `type: 'select'` — estrutural ou não — recebe automaticamente um `var(--sarak-<kebab-id>)` e um atributo `data-sx-<kebab-id>` via `useDesignVariables` (Seção 7), mesmo quando ninguém consome essa CSS var (o Hook Controlador lê o valor bruto do `design`, não a variável CSS). É uma emissão redundante e inofensiva, não uma segunda via de verdade.

## 2.3 Mapa de Domínios (onde cada configuração vive)
Os 28 Schemas TS (`src/core/Design/schema/*.ts`) se agrupam em 13 colunas do banco (Seção 5), via `theme_table_mapping.json`. Esta tabela é o índice: para saber onde mexer para mudar algo, ache o domínio.

| Coluna do Banco | Schemas TS de origem | Domínio (o que governa) |
|---|---|---|
| `mode`, `navigation_style`, `body_size` | `global.ts` | Globais de topo: modo claro/escuro, estilo de navegação, tamanho base de fonte |
| `branding_config` | `branding.ts`, `system.ts` | Identidade visual, layout global, densidade, bordas, ícones, scrollbar |
| `colors_and_atmosphere` | `colors.ts`, `atmosphere.ts`, `status.ts`, `media.ts` (+ parte de `system.ts`) | Paleta de cores, atmosfera visual, cores de status, mídia de fundo |
| `typography` | `typography.ts` | Fontes, escala tipográfica, tracking |
| `layout_and_navigation` | `navigation.ts`, `scrollbars.ts`, `layers.ts` | Navegação, scrollbars, z-index/camadas |
| `components_base` | `inputs.ts`, `overlays.ts`, `buttons.ts`, `tables.ts`, `switches.ts` | Átomos base: inputs, modais, botões, tabelas, switches |
| `cards_engine` | `cards.ts`, `card-title.ts`, `card-action.ts`, `card-search.ts` (+ parte de `colors.ts`) | Toda a família de Cards |
| `data_and_charts` | `data.ts`, `specialized.ts` | DataGrids, gráficos, engines especializados de dados |
| `motion_and_animation` | `animations.ts`, `motion.ts` | Curvas de animação, transições |
| `specialized_engines` | `chat.ts`, `engineering.ts`, `advanced.ts` (+ parte de `layers.ts`) | Chat Engine, Flow Engine, avançado |
| `structural` | `structural.ts` | Grid macro, fluxo global, alinhamento de header/form/switch, breakpoints |
| `legacy_and_runtime` | — (sem schema próprio) | Escape para chaves em transição/depreciadas |

Regra de leitura: um schema pode alimentar mais de uma coluna quando cobre mais de um domínio (ex: `system.ts` contribui para `branding_config` e `colors_and_atmosphere`); nesse caso, o `schemaOrigin` de cada token na partição JSON (Seção 2) desambigua token a token.

# 3. O Payload de Entrada (o "verbo único")
Dois formatos aceitos pela API (Seção 6), ambos **um objeto plano de chaves→valores**, sem qualquer distinção de formato entre chave de Valor e Estrutural:
- `POST/PUT /themes` (`ThemeCreateUpdate`): `{ name: string, design: { <chave>: <valor>, ... }, is_active?: boolean }` — cria ou substitui um tema completo.
- `POST /design` (`DesignUpdate`): `{ design: { <chave>: <valor>, ... } }` — PATCH parcial do tema ativo do usuário.

Exemplo real de payload que mistura as duas alavancas sem nenhuma marcação especial:
```json
{ "design": { "cardLayoutDirection": "row", "primaryColor": "#f97316" } }
```

# 4. Validação e Roteamento (Regra 4 real, como o backend já implementa)
Algoritmo hoje implementado em `backend/sarak_ui_core/api/router.py` (`_apply_design_to_theme` / `update_user_design`), para cada chave recebida em `design`:
1. Se é uma coluna top-level do modelo (`mode`, `navigation_style`, `body_size`) → grava direto no atributo.
2. Senão, varre `THEME_MAPPING` (carregado de `theme_table_mapping.json` no boot do router) procurando em qual partição/coluna JSONB a chave pertence.
3. Se não encontra em nenhuma → **descarta silenciosamente** (log de debug `"Regra 4: Chave '{key}' não encontrada no catálogo. Descartando."`, sem erro retornado ao cliente).

**Fora de escopo desta spec (comportamento do Agente):** descarte silencioso é aceitável para o painel humano (o usuário vê o resultado e corrige visualmente), mas o tratamento adequado para um agente autônomo (422 explícito vs auto-healing) é uma decisão de comportamento, não de mecanismo — rastreada em `specs/plan/07-agente-llm-design-e-expansao-estrutural.md` §6. Esta spec só localiza o ponto de código exato (`router.py`, função `_apply_design_to_theme`) para quem for implementar essa decisão. Ver `08-gate-auditoria-hardcode-e-variaveis` para o paralelo do lado frontend (`auditor_ghostvars.mjs`).

# 5. Persistência (estrutura real da tabela)
Tabela `ui_core.custom_themes` (`backend/sarak_ui_core/core/models.py`, classe `CustomTheme`):
- **Colunas top-level:** `mode`, `navigation_style`, `body_size`, `is_active`, `is_public`, `owner_id`, `system`.
- **Colunas JSONB granulares** (uma por partição do catálogo, ver Mapa de Domínios em 2.3): `branding_config`, `colors_and_atmosphere`, `typography`, `layout_and_navigation`, `components_base`, `cards_engine`, `data_and_charts`, `motion_and_animation`, `specialized_engines`, `structural`, `legacy_and_runtime`.
- **Regra de tema ativo:** `is_active=True` é exclusivo por `(owner_id, system)` — ativar um tema desativa automaticamente o anterior (`update({"is_active": False})` antes de setar o novo).
- `legacy_and_runtime`: coluna de escape para chaves em transição/depreciadas sem partição própria.

# 6. Contrato REST Completo
| Endpoint | Payload de entrada | Comportamento |
|---|---|---|
| `GET /design` | — (auth via `IdentityContext`) | Retorna o tema ativo do usuário; fallback para o tema global ativo do `system` se o usuário não tem um próprio. |
| `POST /design` | `DesignUpdate` | Upsert implícito: se não existe tema ativo do usuário, cria um chamado `"Personalizado"`; senão faz merge granular (Seção 4) no existente. |
| `GET /themes` | — | Lista todos os temas do usuário autenticado no `system` atual. |
| `POST /themes` | `ThemeCreateUpdate` | Cria um tema novo; se `is_active: true`, desativa qualquer outro tema ativo do usuário primeiro. |
| `PUT /themes/{id}` | `ThemeCreateUpdate` | Substitui nome + aplica merge granular de `design`; mesma regra de exclusividade de `is_active`. |
| `PUT /themes/{id}/activate` | — | Só ativa (desativando os demais); não altera `design`. |
| `DELETE /themes/{id}` | — | Remove o registro. |

**Formato de saída (`to_dict()`, `models.py`):** achata todas as colunas JSONB de volta num único objeto `design`, na ordem `branding_config → colors_and_atmosphere → typography → layout_and_navigation → components_base → cards_engine → data_and_charts → motion_and_animation → specialized_engines → structural → legacy_and_runtime` (chaves depois na lista sobrescrevem em caso de colisão — não deveria ocorrer, dado que cada chave pertence a exatamente 1 partição por definição do dicionário).

# 7. Distribuição / Aplicação no Frontend (como o valor vira tela)
O objeto `design` plano de `to_dict()` é exatamente o `rawDesign` consumido por `useDesignVariables` (`src/core/Design/hooks/useDesignVariables.ts`). A partir daí, as duas alavancas divergem:

- **Alavanca 1 (Valor):** `useDesignVariables` gera `variables[--sarak-<kebab-id>]` para todo token, mais aliases de `cssVars`; `DesignInjector.tsx` empurra esse objeto para `root.style.setProperty(...)` — vira CSS de verdade no DOM, sempre consumido com fallback (`var(--sarak-x, <default>)`).
- **Alavanca 2 (Estrutural):** o mesmo `design` (via `useSarakUI().design`) é lido diretamente em JS pelo Hook Controlador correspondente (coluna "Hook Consumidor" da tabela da Seção 2.2), que devolve `{ className, style }` prontos — nunca uma CSS Variable.

Diagrama do ciclo completo:
```
Prompt (Agente) / UI (Painel) → Payload {chave:valor} (Seção 3)
  → Validação/Roteamento (Seção 4) → Persistência JSONB (Seção 5)
  → GET /design → to_dict() (Seção 6) → rawDesign
  → useDesignVariables (Alavanca 1) ──→ DesignInjector → DOM (CSS Variables)
  → Hook Controlador (Alavanca 2)   ──→ className/style no JSX
```

# 8. Exemplo Ponta-a-Ponta Concreto
Payload: `{ "design": { "cardLayoutDirection": "row", "cardTextAlign": "center" } }` enviado a `POST /design`.

1. `update_user_design` recebe o payload; nenhuma das 2 chaves é coluna top-level.
2. Varre `THEME_MAPPING`: ambas encontradas em `"cards_engine"` (`theme_table_mapping.json:256-258`).
3. Grava `theme.cards_engine = {..., cardLayoutDirection: "row", cardTextAlign: "center"}`, `flag_modified`, `db.commit()`.
4. Próximo `GET /design` (ou o retorno síncrono do próprio POST) devolve `to_dict()` com essas chaves achatadas em `design`.
5. Frontend: `useDesignVariables` gera (inofensivamente) `--sarak-card-layout-direction: row` e `data-sx-card-layout-direction="row"` no DOM — não é isso que move o layout.
6. `useCardLayoutStyles(design)` (`src/components/atomic/Cards/hooks/useCardLayoutStyles.ts:26-27`) lê `design.cardLayoutDirection === 'row'` → `containerClass` vira `flex flex-row ...`; `design.cardTextAlign === 'center'` → `alignmentClass` vira `items-center text-center`.
7. `SarakActionCard`/`SarakCoreCard` (que consomem `layout.containerClass` no JSX) redesenham instantaneamente — sem reload, sem novo deploy, sem tocar `.tsx`.

# 9. Regras de Negócio / Invariantes Permanentes
- **Regra 1 (Dicionário estrito):** nunca inventar chave fora das 3 fontes da Seção 2 — reforça `08-gate-auditoria-hardcode-e-variaveis` e a Regra 3 de `specs/plan/07-agente-llm-design-e-expansao-estrutural.md`.
- **Regra 2 (Fallback sempre):** toda variável CSS emitida ao frontend é consumida com fallback (`var(--sarak-x, <default>)`) — nunca crua.
- **Regra 3 (Um payload, dois destinos):** o formato do payload de entrada nunca distingue Valor de Estrutural; a distinção nasce só no consumo (Seção 7).
- **Regra 4 (Paridade do flag estrutural):** todo token com `structuralConsumer` no Schema TS deve ter o `consumerHook` espelhado na partição JSON correspondente (Seção 2.2) — mesma disciplina de zero-drift das demais camadas.

# 10. Critérios de Aceite
- [x] Toda chave estrutural existente está marcada com `structuralConsumer` no Schema TS e `consumerHook` na partição JSON (Seção 2.2).
- [x] `getStructuralTokens()` retorna exatamente o conjunto fechado da Seção 2.2.
- [x] O Mapa de Domínios (Seção 2.3) cobre as 13 colunas do banco e os 28 schemas de origem.
- [x] O contrato REST (Seção 6) reflete 1:1 os endpoints implementados em `router.py`.
- [x] Bug do bucket `structural` sem coluna no banco corrigido (coluna adicionada em `models.py`, `GRANULAR_COLUMNS` em `router.py`, self-healing em `database.py`/`001_init_ui_schema.sql`) — os 11 tokens do bucket persistem corretamente.

**Fora de escopo (rastreado em `specs/plan/07-agente-llm-design-e-expansao-estrutural.md`, não desta spec):**
- Decisão sobre o comportamento de chave inválida para o Agente LLM (422 explícito vs auto-healing) — Seção 4.
- Endpoint dedicado `POST /api/themes/generate` (ou reuso de `/chat`) para o Agente LLM.
