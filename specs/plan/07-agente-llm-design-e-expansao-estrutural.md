---
tipo: "spec"
titulo: "Agente LLM: Operador de Design e Expansão Estrutural"
dominio: "Design Engine (Sarak UI Core)"
status: "🟡 Em Progresso"
prioridade: "Alta"
tags: ["spec", "ai-agent", "design-system", "data-driven", "architecture", "layout-engine"]
relacionados: ["03-padrao-e-taxonomia-biblioteca-atomica", "08-consumo-externo-e-integracao", "01-auditoria-cobertura-componentes", "02-mapeamento-semantico-rag-catalogo", "03-separacao-estrutural-chat-acao"]
---

> **Nota (revisão pós-implementação):** a Seção 7 original desta spec descrevia um serviço **Python/FastAPI** scaffolded via template-hub, nunca construído. O que foi de fato implementado e validado ponta-a-ponta é **Node/Express** (`agent-design-operator/`, pasta irmã dentro do próprio `Sarak-Lib-UI-Core`). A Seção 7 abaixo foi reescrita para refletir a arquitetura real. A Seção 3 (Expansão Estrutural/Camada 6) permanece como estava — é trabalho da própria lib, independente de qual stack roda o serviço do agente, e já está ✅ concluída.

# 1. Visão Geral
Esta spec define a arquitetura e limites de atuação do Agente LLM focado em Design. O agente atua puramente como "Operador de Dados de Banco", traduzindo requisições de linguagem natural do usuário em **Registros (Payloads JSON) na Tabela de Temas do Banco de Dados**. Este payload controla tokens visuais (Alavanca 1 - Cores, Geometria) e **Tokens Estruturais** (Alavanca 2 - Arranjos de Layout do DOM). O Agente **NUNCA** interage com o código-fonte.

# 2. Regras de Negócio e Limites de Atuação
- **Regra 1 (No Code / Filesystem Touch):** O agente não altera, lê ou cria arquivos `.ts`, `.tsx`, `.css` ou `.json` do repositório.
- **Regra 2 (Sem Persistência Automática):** O agente **nunca** salva um tema/preset direto num banco. Ele devolve um payload validado (`DesignAgentPromptResult.themePatch`/`componentPresets`); a aplicação injeta isso como rascunho ao vivo (Preset 1) e como sugestão de sessão (Preset 2). Persistência real continua sendo decisão do usuário, pelo fluxo humano já existente (`SaveThemeModal`).
- **Regra 3 (Catálogo como Dicionário Estrito):** O agente consulta o catálogo real via `getDesignCatalog()` (`backend/node/catalog.ts`, canal Node sancionado — Spec 08 §4), fonte que reflete `MASTER_DESIGN_MAP`/`getAllDesignTokens()` (`src/core/Design/master-map.ts`) em tempo real. **Só pode gerar payloads preenchendo chaves existentes**. É proibido inventar novas variáveis (ex: `--sx-nova-variavel`) — o namespace `--sx-*` é proibido em toda a base.
- **Regra 4 (Validador de Integridade):** Qualquer tentativa do agente de usar chaves não cadastradas, ou valores fora do domínio do token (`select` fora das `options`, `slider`/`number` fora de `min`/`max`), é rejeitada pelo validador (`ThemeValidator.validatePayload`) antes de qualquer resposta ser aplicada.

# 3. Expansão Estrutural: Data-Driven Layout (Tokens Estruturais)
Para permitir que o agente desenhe recriações de sites estruturalmente diferentes, a **Expansão via Tokens Estruturais (Structural Props)** foi a rota arquitetural aprovada, rejeitando o uso de Composição Headless complexa.

## Dinâmica de Layout Orientado a Dados:
O Agente envia em seu JSON tokens que ditam opções predefinidas:
- `cardLayoutDirection: "row" | "column"`
- `imagePosition: "top" | "left" | "right" | "background"`
- `actionsAlignment: "flex-start" | "space-between"`

Os componentes base atômicos tornam-se receptores flexíveis dessas propriedades para redesenhar a tela.
**Regra Estrita de Paridade:** A lógica condicional de transformação dessas props estruturais em classes utilitárias (Tailwind) ocorre na **Camada 6 (Hook Controlador)**, mantendo o JSX atômico sem poluição visual.

## Fases de Expansão Geométrica:
1. **Adição de Containers:** ✅ **Feito** — `SarakGrid` e `SarakFormGroup` existem.
2. **Camada 6 (Hook Controlador):** ✅ **Feito** — `useStructuralStyles` + hooks de domínio (Card/Button/Modal/Table) traduzem tokens estruturais em classes; tokens (`cardLayoutDirection`, etc.) tipados no schema.
3. **Auditoria de Hardcode:** ✅ **Feito** — `auditor_hardcoded.mjs` detecta 100% (valor px/rem/em + estrutural Tailwind), com baldes de dedução (ícones, `w-full/h-full`, alinhamento).
4. **Desengessamento (Refatoração):** ✅ **Feito** (specs 21-29) — hardcode duro migrado para hooks/tokens; ver Estado Final.

### Estado Final da Metade B (fechamento — spec 29)
- **Violações duras: 0** (era ~519 no início da campanha). As últimas 16 (grids responsivas de `Templates/`/`CalendarPanel` + spacing responsivo do `ExpandableCard`) foram resolvidas estendendo `useStructuralStyles.ts` com presets nomeados (`RESPONSIVE_GRID_PRESETS`/`RESPONSIVE_SPACING_PRESETS`, extraídos para `useStructuralStyles.presets.ts`) — as classes Tailwind responsivas vivem na camada `.ts` do hook (fora da varredura do auditor, que só coleta `.tsx`), o mesmo mecanismo já usado por `SarakActionCard`/`SarakCoreCard` para grids de N fixo.
- **Valor: 42 restantes, todos classificados** (era ~273 no início da campanha, 48 no início da spec 29) — nenhum é hardcode "esquecido":
  - **Hairlines tolerados** (bordas/divisores/indicadores ≤2px, ~37 ocorrências): `SarakIconButton`, `SarakDataTableImpl`, `SarakKanbanImpl`, `SarakRichText`, `SarakPDFViewerImpl`, `SarakContextMenu`, `Layouts/SarakTabs`, `UX/SarakTabs`, `SarakSplitPane`, `SarakFlowEngine`, `SarakVisualEngine`, `ButtonPresetPreview`, `InputPresetPreview`, `PresetCard` (spinner), `HelpTooltip`, `ThemeList`.
  - **Exceção de política — cores de marca de terceiro:** `SocialButton.tsx` (4 hex do logo oficial do Google) — fora do sistema de tokens do Design Engine por definição.
  - **Falso-positivo documentado (spec 27):** `SarakDrawer.tsx:77` (já usa `design.sidebarShadow`; o auditor só vê o fallback JS).
  - **Fora de escopo:** fixtures de teste E2E (`__e2e__/Boot.spec.tsx`, `__e2e__/RealtimeInjection.spec.tsx`).
- **Deduzido (não reprova):** ícones `w-N/h-N`, `w-full/h-full`, alinhamento `items/justify` — estável/menor que o baseline inicial da campanha.
- **Decisão de política (Templates/):** resolvida via código — não houve carve-out. As grids de `src/components/atomic/Templates/` (e o grid-cols-7 do `CalendarPanel`) foram migradas para o hook estrutural em vez de ganhar uma exceção permanente.

# 4. Critérios de Aceite
- [x] Propriedades estruturais reagem reconstruindo o arranjo via Hooks Controladores (Camada 6 implementada).
- [x] Auditoria detecta 100% do hardcode (valor + estrutural, com dedução auditável).
- [x] Desengessamento concluído: 0 violações duras no `auditor_hardcoded.mjs` (Valor restante = só hairlines/exceções documentadas na spec 29).
- [x] Agente retorna JSON apenas com chaves válidas do catálogo real (`getDesignCatalog()`), validadas por `ThemeValidator` (chave + domínio do valor).
- [x] Agente não realiza commits ou alterações em arquivos locais/código para temas — só devolve payload via HTTP.
- [ ] Chat nunca expõe o payload/JSON bruto ao usuário — ver `03-separacao-estrutural-chat-acao.md` (ainda não implementada; é o próximo passo desta spec).
- [ ] Agente entende semanticamente os tokens (não só a lista de chaves) — ver `02-mapeamento-semantico-rag-catalogo.md`.

# 5. Plano de Testes (Quality Gate)
- **Testes Unitários:** [x] `agent-design-operator/tests/validator.test.ts` — valida chave inexistente rejeitada, valor fora do domínio de um `select` rejeitado, payload válido aceito.
- **Testes de Contrato (API):** [x] `POST /api/design-agent/prompt` valida e retorna `{success, message, payload?}` — coberto manualmente (ver Seção 7.5); teste automatizado de contrato ainda pendente (candidato à skill `test-api-contrato`).
- **Testes E2E:** [x] Fluxo validado manualmente ponta-a-ponta (chat → `sendPrompt` → backend → LLM real → validação → aplicação em Preset 1/Preset 2). Teste E2E automatizado (Playwright) ainda não escrito — candidato à skill `test-e2e`.

# 6. Pendências de Definição (Resolvidas)
- **Contrato de API do Agente LLM — RESOLVIDO:** o agente roda como serviço Node/Express separado (`agent-design-operator/`), exposto em `POST /prompt` (montado sob `/api/design-agent` pelo consumidor). A lib (`Sarak-Lib-UI-Core`) nunca chama essa rota diretamente — o consumidor implementa `designAgent.sendPrompt` (contrato `DesignAgentPromptInput`/`DesignAgentPromptResult`, exportado por `@sarak/lib-ui-core`) e decide como alcançar o backend do agente (embutido na própria API Node do consumidor, ou como microsserviço à parte). Ver `specs/specs/08-consumo-externo-e-integracao.md` §6.2.
- **Mecanismo de Tratamento de Alucinação — RESOLVIDO:** sem auto-healing iterativo por ora. `ThemeValidator.validatePayload` rejeita synchronously (chave inexistente ou valor fora de domínio); a rota responde `422` com detalhes. Não há retry automático pedindo correção ao LLM — fica registrado como possível evolução futura, não implementada.

# 7. Implementação Real (Node/Express, `agent-design-operator/`)

> Substitui o plano original desta seção (scaffold Python/Template-Py via hub, nunca executado). O que existe hoje é uma pasta irmã dentro do próprio repositório da lib: `Sarak-Lib-UI-Core/agent-design-operator/` — pacote npm próprio, TypeScript, Express.

## 7.1. Por que Node/Express, e não o `Template-Py`
Na prática, a instanciação seguiu o caminho de menor atrito: TypeScript permite compartilhar tipos com a própria `Sarak-Lib-UI-Core` (`DesignAgentPromptInput`/`DesignAgentPromptResult` são os mesmos tipos dos dois lados do contrato `designAgent.sendPrompt`), e o catálogo real é consumido diretamente via import de `@sarak/lib-ui-core/backend/node` (dependência `file:..` local) em vez de replicar/achatar o dicionário num `knowledge.md` estático. Não existe hoje um `backend/sarak_ui_core/` em Python neste ecossistema — essa premissa da spec original não se confirmou.

## 7.2. Estrutura real do serviço
- **Entrypoint:** `agent-design-operator/src/main.ts` (`initDesignAgent()`, exporta o router Express) + `src/dev.ts` (boot standalone, porta 4000).
- **Rota:** `POST /prompt` ([`src/api/routes.ts`](../../agent-design-operator/src/api/routes.ts)), montada em `/api/design-agent` pelo processo que a acopla.
- **Catálogo real:** [`backend/node/catalog.ts`](../../backend/node/catalog.ts) (`getDesignCatalog()`, exportado por `backend-node.ts`) — lê `getAllDesignTokens()` de `src/core/Design/master-map.ts` diretamente, sem achatamento estático em arquivo.
- **Validação:** [`src/toolbox/validator.ts`](../../agent-design-operator/src/toolbox/validator.ts) (`ThemeValidator`) — carrega o catálogo real no boot, valida chave + domínio do valor (`select`/`slider`/`number`/`boolean`).
- **Persistência (só auditoria, nunca o tema em si):** [`src/database/repository.ts`](../../agent-design-operator/src/database/repository.ts) — histórico de conversa + log do artefato validado, num Postgres fornecido pelo importador (`DATABASE_URL`), schema `ui_core.sarak_ui_design_agent_*`.
- **Provider de LLM:** [`src/core/providers/`](../../agent-design-operator/src/core/providers/) (`GroqProvider`/`OpenRouterProvider`, via `ProviderFactory`) — chave de API sempre no `.env` do importador; **provider e modelo também são escolha do importador**, via env vars `DESIGN_AGENT_LLM_PROVIDER`/`DESIGN_AGENT_LLM_MODEL` (o módulo nunca decide isso sozinho — `agent-design-operator/src/config/agents/design-operator/config.json` não contém mais esses campos).
- **Trigger de extração:** [`src/core/parser/trigger_extractor.ts`](../../agent-design-operator/src/core/parser/trigger_extractor.ts) (`TriggerExtractor`) — hoje extrai `[THEME_UPDATE: {...}]` de um único texto de LLM; será substituído pela separação de duas chamadas descrita em `03-separacao-estrutural-chat-acao.md`.

## 7.3. Como o contrato se conecta com a lib e o consumidor
1. Consumidor (`Sarak-MyService`) injeta `SarakUIProvider options={{ designAgent: { sendPrompt } }}` — `sendPrompt` é implementado no próprio consumidor (`src/sarak/design-agent.ts` no caso do MyService), nunca na lib.
2. `sendPrompt` chama `POST /api/design-agent/prompt` (proxy Vite → porta 4000 no caso do MyService, ou rota interna se o backend do consumidor for Node e usar `initDesignAgent()` diretamente).
3. `agent-design-operator` responde `{success, message, payload?}`; `sendPrompt` mapeia pra `{message, themePatch: payload}` (o formato que `DesignAgentChatCard`/`useDesignAgentChat` esperam).
4. `useDesignAgentChat` aplica `themePatch` no draft (Preset 1) e registra em `useAgentGeneratedPresets` (Preset 2) — nunca persiste sozinho; salvar de verdade é o fluxo humano (`SaveThemeModal`).

## 7.4. Checklist de Configuração — estado real
### A. `agent-design-operator/src/config/agents/design-operator/`
- [x] `config.json` — hoje só `agent_id`, `name`, `description`, `capabilities`, `triggers` (provider/model saíram daqui — ver 7.2).
- [x] `identity.md` — persona "Design Operator", regra dura de nunca tocar código.
- [x] `rules.md` — guardrails anti-alucinação + formato exato do trigger `[THEME_UPDATE: {...}]`.
- [ ] `workflow.md` — ainda não escrito (o agente hoje segue só identity+rules; um laço comportamental explícito fica pendente).
- [ ] `knowledge.md` — não existe estático; o catálogo é injetado dinamicamente a cada chamada via `getDesignCatalog()`. Ver `02-mapeamento-semantico-rag-catalogo.md` para a evolução (RAG semântico via vector store).
- `.env` do próprio `agent-design-operator`: **não existe e não deve existir** — chaves/URL de banco vêm do ambiente do processo, herdadas do `.env` do importador (ver Regra de Ouro do módulo).

### B. Pendências desta spec (viram as specs 01-06)
- [ ] Separar chamada de chat da chamada de ação (`03-separacao-estrutural-chat-acao.md`).
- [ ] Mapeamento semântico dos tokens pro agente raciocinar melhor (`02-mapeamento-semantico-rag-catalogo.md`).
- [ ] Auditoria de cobertura de componentes (`01-auditoria-cobertura-componentes.md`).
- [ ] Multi-preset diversificado (`04-multi-preset-diversificado.md`).
- [ ] Ingestão multimodal — link/imagem/PDF/PPT (`05-ingestao-multimodal-html.md`, `06-pipeline-visao-dois-estagios.md`).
