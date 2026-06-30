---
tipo: "spec"
titulo: "Agente LLM: Operador de Design e Expansão Estrutural"
dominio: "Design Engine (Sarak UI Core)"
status: "🟢 Vigente"
prioridade: "Alta"
tags: ["spec", "ai-agent", "design-system", "data-driven", "database-only", "architecture", "layout-engine"]
relacionados: ["03-padrao-e-taxonomia-biblioteca-atomica"]
---

# 1. Visão Geral
Esta spec define a arquitetura e limites de atuação do Agente LLM focado em Design. O agente atua puramente como "Operador de Dados de Banco", traduzindo requisições de linguagem natural do usuário em **Registros (Payloads JSON) na Tabela de Temas do Banco de Dados**. Este payload controla tokens visuais (Alavanca 1 - Cores, Geometria) e **Tokens Estruturais** (Alavanca 2 - Arranjos de Layout do DOM). O Agente **NUNCA** interage com o código-fonte.

# 2. Regras de Negócio e Limites de Atuação
- **Regra 1 (No Code / Filesystem Touch):** O agente não altera, lê ou cria arquivos `.ts`, `.tsx`, `.css` ou `.json` do repositório.
- **Regra 2 (Atuação 100% via Banco):** Toda criação de tema ou preset é salva exclusivamente no banco. A aplicação puxa os registros via API.
- **Regra 3 (Catálogo como Dicionário Estrito):** O agente consulta as partições do Catálogo (`src/core/Design/catalog/partitions/*.json`) e **só pode gerar payloads preenchendo chaves existentes**. É proibido inventar novas variáveis (ex: `--sx-nova-variavel`).
- **Regra 4 (Validador de Integridade):** Qualquer tentativa do agente de usar chaves não cadastradas é descartada pelo validador antes do `INSERT`.

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
4. **Desengessamento (Refatoração):** 🟡 **Pendente** — migrar o hardcode duro restante para os hooks/tokens (ver Estado Atual).

### Estado Atual da Metade B (laudo do auditor)
- **Violações duras a corrigir (519):** espaçamento `p/m/gap` (~416) + direção `flex-col/row` (~80) + grid (~23) → migrar para `var(--sx-spacing-*)` e tokens de direção.
- **Valor a corrigir (273):** `px/rem/em` (ex.: `text-[9px]`, `tracking-[0.3em]`) → tokenizar; exceção tolerada = hairlines `1px/2px`.
- **Deduzido (não reprova, 549):** ícones `w-N/h-N` (190), `w-full/h-full` (88, o hook também usa), alinhamento `items/justify` (271, micro-layout intrínseco).
- **Decisão pendente:** escopo dos componentes `src/components/atomic/Templates/` (moldes de composição) — sujeitos à régua dura ou sub-camada com licença de layout.

# 4. Critérios de Aceite
- [x] Propriedades estruturais reagem reconstruindo o arranjo via Hooks Controladores (Camada 6 implementada).
- [x] Auditoria detecta 100% do hardcode (valor + estrutural, com dedução auditável).
- [ ] Desengessamento concluído: 0 violações duras no `auditor_hardcoded.mjs`.
- [ ] Agente (Metade A) retorna JSON apenas com chaves válidas e persiste no DB via API.
- [ ] Agente não realiza commits ou alterações em arquivos locais para temas.

# 5. Plano de Testes (Quality Gate)
- **Testes Unitários:** [ ] Validação estrita das chaves do JSON contra o mapeamento no Backend antes de salvar.
- **Testes de Contrato (API):** [ ] Endpoint de gravação valida e persiste relacionalmente o `ThemeCreateUpdate` / `DesignUpdate`.
- **Testes E2E:** [ ] Fluxo LLM -> Backend -> Frontend: Alteração gerada pela IA propaga para a interface redesenhando a UI em tempo real.

# 6. Pendências de Definição (A Definir)
- **Contrato de API do Agente LLM:** A arquitetura do endpoint que receberá o prompt do usuário e invocará o LLM (ex: `POST /api/themes/generate`). A definir: Qual será o payload de entrada exato (contexto, prompt) e onde o motor será hospedado?
- **Mecanismo de Tratamento de Alucinação:** Como o sistema se comportará caso o LLM gere um payload completamente inválido ou fora do dicionário? A definir se haverá *Auto-Healing* iterativo (o backend pede para o LLM corrigir automaticamente) ou se o erro será repassado ao usuário via `422 Unprocessable Entity`.

# 7. Implementação via Template (Scaffolding do Agente)
O serviço do Agente LLM (Metade A desta spec) **não é escrito do zero**. Ele é instanciado a partir do template-hub de agentes Sarak (`Code/Agentes/Chat`), que fornece o chassi agnóstico (motor LLM, RAG, parser de triggers, validação e toolbox Plug & Play) já padronizado.

> **Nota de escopo:** A Expansão Estrutural descrita na Seção 3 (containers de macro-layout, remoção de Tailwind chumbado dos átomos, tradução de props estruturais na Camada 6) é engenharia interna da própria Sarak-Lib-UI-Core (Paridade 1:1:1:1:1) e é **independente** deste template. Esta seção trata exclusivamente do serviço do Agente (Metade A).

## 7.1. Linguagem Determinada: Python (`Template-Py` / FastAPI)
A linguagem escolhida é **Python**, copiando a fundação `Template-Py` do hub. Justificativa:
- **Reuso do validador canônico:** O backend da UI-Core já é FastAPI (`backend/sarak_ui_core/`) e já implementa a Regra 4 (descarte de chaves fora do `theme_table_mapping.json`), os models SQLAlchemy da tabela `ui_core.custom_themes`, os contratos `ThemeCreateUpdate`/`DesignUpdate` e o `IdentityContext` de segurança. Python permite reusar essa lógica sem duplicar validador nem arriscar *drift* de paridade.
- **Serviço puro de dados (sem UI):** A spec exige "No Code / Filesystem Touch" e consumo via API. `Template-Next` agregaria runtime React sem ganho; `Template-Ts` obrigaria a reimplementar em TS um validador que já é canônico em Python.
- **Fit de ecossistema:** Validação estrita de payload (Pydantic) e structured-output de LLM combinam com a fundação `00-base-python`.

## 7.2. Mecanismo de Encaixe no Motor do Template
O agente reaproveita 3 mecanismos nativos do template, sem inventar arquitetura:
1. **RAG (`knowledge.md`):** A base de conhecimento é o dicionário do Catálogo (partições) achatado — é isto que materializa a Regra 3 (dicionário estrito) no nível do prompt: o agente só "conhece" chaves válidas.
2. **Parser de Triggers:** O LLM emite o payload como um trigger `[THEME_UPDATE]{...json...}` capturado pelo `TriggerExtractor`.
3. **Toolbox Action (`theme_writer`):** Recebe o payload extraído, valida contra o catálogo (Regra 4 / auto-healing) e persiste via API no backend da UI-Core.

## 7.3. Procedimento de Cópia
A instanciação deve ser feita **exclusivamente** pela skill de scaffolding do hub (`.agents/skills/implementacao-template`), nunca por cópia manual, garantindo zero desvio de padrão (ADR 004). Copiar a fundação `Template-Py` para o destino do serviço do Agente de Design.

## 7.4. Checklist de Configuração (Pós-Cópia)
### A. Artefatos de Configuração a preencher (`src/config/agents/design-operator/`)
- [ ] `config.json` — provider/model, `temperature ≈ 0` (JSON determinístico), capabilities `text`, RAG `on`, trigger regex `\[THEME_UPDATE\]`, nomes das tabelas e embeddings provider.
- [ ] `identity.md` — persona "Operador de Dados de Banco de Design"; regra dura: nunca tocar código, apenas preencher chaves existentes.
- [ ] `workflow.md` — laço comportamental: interpretar requisição → consultar catálogo → emitir `THEME_UPDATE`.
- [ ] `knowledge.md` — base RAG = as partições do Catálogo achatadas (`tokenId` + descrição + `allowedValues`).
- [ ] `rules.md` — guardrails anti-alucinação (proibido inventar variáveis `--sx-*` ou chaves novas).
- [ ] `manifest.json` — default (serviço headless, sem UI própria).
- [ ] `.env` — chaves de LLM (Groq/OpenRouter) + base URL e token de serviço do backend da UI-Core.

### B. Adaptações de Código no Template
- [ ] **Nova toolbox action `theme_writer`** (implementando a interface de notifier): valida o payload contra `theme_table_mapping.json` e faz `POST` autenticado no backend da UI-Core (`/themes` ou `/design`).
- [ ] **Validação estrita / auto-healing** dentro da action (atende ao teste unitário "validar chaves antes de salvar"): chaves inválidas disparam re-prompt ao LLM ou `422`, conforme decisão da Seção 6.
- [ ] **Endpoint dedicado** `POST /api/themes/generate` em `src/api/routes.py` (ou reuso de `/chat` com `agent_id=design-operator` — conforme decisão de contrato da Seção 6).
- [ ] **Pipeline de ingestão do Catálogo** → gerar/atualizar `knowledge.md` a partir das partições, evitando que o RAG do agente desatualize em relação ao dicionário.
