---
tipo: "indice"
titulo: "Índice e Ordem de Build do Plano de Expansão"
dominio: "Sarak-Lib-UI-Core (Plano)"
status: "🟢 Vigente"
prioridade: "Máxima"
tags: ["indice", "plano", "roadmap", "dependencias"]
relacionados: ["01-plano-mestre-expansao-generica", "02-plano-mestre-expansao-logica-e-dados"]
---

# 0. Como Executar (Entrypoint do Agente)
> Este índice é o **único arquivo que precisa ser enviado** para iniciar a execução. Ele aponta para as regras, define o fluxo e os comandos de verificação; o **detalhe de cada spec vive no próprio arquivo `NN-*.md`**, puxado sob demanda.

## 0.1 Onboarding obrigatório (LEIA ANTES DE CODIFICAR)
1. Acione a skill **`ui-contexto-repositorio`** e leia **`.agents/index.md`** + **`CLAUDE.md`** — inclui a **Regra de Ouro**: iniciar o time-tracking via MCP **antes** de qualquer tarefa de spec/código.
2. Leia as specs-fundação em **`specs/specs/`** (as leis do módulo):
   - `00-manifesto-arquitetural` — as **3 camadas** (`core/` · `components/atomic/` · `features/`).
   - `03-padrao-e-taxonomia` — **Zero Hardcode** (só `var(--sx-*)`).
   - `09-expansao-vs-configuracao` — quando é **Configuração** (dado) vs **Expansão** (engenharia).
   - `05-cobertura-de-testes`.
3. **Leis absolutas e inegociáveis:** 3 camadas · **Zero Hardcode** · **Zero Any** · **Paridade 1:1:1:1:1** (tokens) · **contratos TS tipados** (engines).

## 0.2 Workflow — uma spec por vez
1. Pegue o próximo item não marcado na **§3.1 (ordem de ondas)**.
2. Abra `specs/plan/NN-*.md` e siga as **Regras de Negócio** dela (o índice é o mapa; o conteúdo está na spec).
3. Classifique o tipo — **token / funcional / híbrido** — e escolha a skill (§0.4).
4. Implemente.
5. Rode o **Ciclo de Verificação** (§0.3).
6. Só marque `[x]` ao atingir o **Definition of Done** (§0.5). **Não encadeie** specs sem verificar a anterior.

## 0.3 Ciclo de Verificação (comandos)
- **Auditor:** `node .agents/skills/ui-auditoria-modulo/scripts/run_audit.mjs`
- **Tipos:** `npx tsc --noEmit` (alvo: 0 erros)
- **Testes:** `npx vitest run` (alvo: verde; qualquer falha nova é regressão sua)
- **Specs de token** (16 + visuais): após editar as 5 camadas, rode `npx tsx scripts/generate-token-types.ts` e confirme a **Paridade (302 + N)** no auditor.
- **Specs funcionais (20–34):** o sub-auditor da Conferência (Spec 34) **ainda não existe** → verifique manualmente os contratos TS (sem `any`) + os testes da spec até a 34 ser implementada.

## 0.4 Skill por tipo de mudança
- **Token / componente atômico novo** → `ui-novo-componente` (executa a paridade nas 5 camadas).
- **Deletar / alterar assinatura de token** → `ui-refatorar-componente`.
- **Auditar a base** → `ui-auditoria-modulo`.
- **Tema / preset** → `ui-criar-tema` / `ui-criar-preset`.
- **Engines funcionais (20–34)** → sem skill própria; siga a spec + o gate de contratos TS + a Conferência (34).

## 0.5 Definition of Done (por spec)
Marque `[x]` **só quando TODOS**:
- [ ] Todos os Critérios de Aceite da spec atendidos.
- [ ] Auditor sem **regressão nova** (única reprovação tolerada: `any`, ver §0.6).
- [ ] `tsc --noEmit` = 0 erros.
- [ ] `vitest run` sem falha nova.
- [ ] Se token: **Paridade = 302 + N** (Schema ↔ DB ↔ Catálogo).

## 0.6 Caveats do ambiente
- **ESLint não instalado** → o hook de padrão-escrita só **avisa** (modo warn), não bloqueia.
- **`any` (~484 ocorrências, baseline)** é dívida pré-existente (baseline travado) — **não** conta como regressão. **Limpeza oportunista (obrigatória):** ao **tocar** um arquivo que contém `any` durante uma spec, **limpe aquele arquivo** como parte do trabalho (baixando o baseline). O resíduo não tocado é quitado pela **campanha 60–64 (Onda 12)**, que zera o baseline e dá por satisfeita a Regra 1 da **Spec 50** (Finalização).
- **Conferência (Spec 34)** é spec, ainda **não** é auditor; automatizá-la é tarefa de código futura.

# 1. Propósito
Mapa de navegação do diretório `specs/plan/`. O plano transforma a Sarak-Lib-UI-Core num **Motor UI agnóstico** (Design as Data) e divide-se em **dois blocos por faixa numérica**, cada um com seu Mestre. Este índice fixa a **ordem de build** e o **grafo de dependências** para evitar construção fora de ordem.

# 2. Estrutura por Faixa Numérica

## Mestres (01–02)
- `01-plano-mestre-expansao-generica.md` — Mestre do **Bloco Visual**.
- `02-plano-mestre-expansao-logica-e-dados.md` — Mestre do **Bloco Funcional** (inclui o Gate de Qualidade Funcional — ver §4).

## Bloco Visual (10–19) — os "blocos de Lego" da UI
| Nº | Spec | Categoria do Mestre 01 |
|---|---|---|
| 10 | micro-layout | 1. Estrutura Base |
| 11 | formulários | 2. Entrada de Dados |
| 12 | data-grids-vis | 3. Densidade/Visualização |
| 13 | feedback-interacoes | 4. Feedback/Status |
| 14 | navegação | 5. Navegação |
| 15 | mídia-renderizadores | 6. Mídia |
| 16 | responsividade-como-dado | Híbrida (breakpoints + diretiva `responsive`) |
| 17–19 | *(reservado para crescimento)* | — |

## Bloco Funcional (20–39) — o "cérebro" (Manifest Renderer)
| Nº | Spec | Papel |
|---|---|---|
| 20 | manifest-schema-e-gramatica-no | **Fundação:** contrato do nó JSON |
| 21 | datastore-estado-reativo | **Fundação:** estado reativo |
| 22 | component-registry-resolver | **Fundação:** type → componente |
| 23 | motor-de-repeticao-renderfor | Engine: listas/loops |
| 24 | motor-de-data-binding-pipes | Engine: interpolação + pipes |
| 25 | dispatcher-central-de-eventos | Engine: ações/eventos |
| 26 | motor-avaliacao-condicional | Engine: renderIf/disabledIf |
| 27 | error-boundaries-e-fallbacks | Engine: isolamento de falhas |
| 28 | persistencia-estado-local | Engine: LocalStorage |
| 29 | validacao-schema-formularios | Engine: validação |
| 30 | contrato-importador-renderer | **Composição final:** `<SarakManifestRenderer />` |
| 31 | fonte-de-dados-declarativa | Engine: carregamento assíncrono + ciclo de vida |
| 32 | binding-bidirecional-de-formulario | Engine: two-way + ciclo de formulário |
| 33 | composicao-pagina-rota-shell | App-shell + roteamento como dado |
| 34 | conferencia-funcional-do-manifesto | **Gate:** Paridade Funcional (7º auditor) |

## Transversais (40–49)
| Nº | Spec | Papel |
|---|---|---|
| 40 | modelo-de-seguranca-e-fronteira-de-confianca | Segurança consolidada / fronteira de confiança |
| 41 | contrato-de-acessibilidade | a11y transversal |
| 42 | ponte-tema-designscope | Tema por região (bridge Visual ↔ Funcional) |

## Finalização (50–59)
| Nº | Spec | Papel |
|---|---|---|
| 50 | finalizacao-adequacao-e-entrega | `any` residual → 0, documentação, guia do importador, entrega |

## Adequação (60–69) — campanha dedicada de erradicação de `any`
| Nº | Spec | Papel |
|---|---|---|
| [x] 60 | erradicacao-any-plano-mestre | **Mestre da campanha:** baseline quitado pela campanha 60–64 |
| [x] 61 | erradicacao-any-nucleo | `src/core/**` (Provider · Shell · Design · Discovery) — ~134 |
| [x] 62 | erradicacao-any-componentes | `src/components/**` (atomic · engines) — ~179 |
| [x] 63 | erradicacao-any-design-engine | `src/features/DesignEngine/**` — ~165 |
| [x] 64 | erradicacao-any-constantes-e-fechamento | `src/constants/**` + varredura final → baseline **0** |
| [x] 65 | foundation-design-state | **Fundação transversal:** tipo `SarakDesignState`; destrava todos os sites `design:any` (61↔62↔63) |

> A **Regra 1 da Spec 50** (`any` → 0) está plenamente atendida e concluída com sucesso. Baseline em 0 absoluto.

# 3. Ordem de Build e Grafo de Dependências
A construção segue dependências reais (não a ordem numérica cega):

1. **Visual primeiro (10–15):** os átomos precisam existir para serem resolvidos/renderizados.
2. **Fundação funcional (20 → 21 → 22):** gramática do nó, depois o estado reativo, depois o resolver. Nada do bloco funcional compila sem estas três.
3. **Engines (23–29):** dependem da fundação. Atenção às dependências cruzadas:
   - `23 renderFor` → consome **21** (escopo) e delega virtualização à **12** (DataGrid).
   - `24 pipes` → consome **21** (leitura de estado) e **15** (sanitização de HTML).
   - `25 dispatcher` → consome **24** (interpolação de URL/body) e abre **13** (Drawer/Modal).
   - `26 condicional` → consome **21** e **24**.
   - `29 validação` → consome **11** (inputs) e bloqueia ações da **25**.
4. **Composição (30):** o `SarakManifestRenderer` orquestra tudo e fecha o contrato com o importador (atualiza a Spec 08 em `specs/specs/`).
5. **Fluxo de dados completo (31, 32, 33):** a **31** (fonte-de-dados) popula o estado que a **23** (renderFor) itera — fecha o "tabelas não buscam dados"; a **32** (binding) fecha a malha Inputs↔Validação↔Submit; a **33** (shell/rotas) eleva o manifesto de tela única para app multi-página.
6. **Gate e Transversais:** a **34** (Conferência Funcional) é o verificador determinístico do contrato → **7º sub-auditor da `ui-auditoria-modulo`**. Segurança (**40**), a11y (**41**) e ponte de tema (**42**) atravessam todas as engines.

> **Inversão de prioridade a vigiar:** a `23` (Crítica) depende da `12` (Média). Antecipar ao menos a virtualização base da `12` antes de fechar a `23`.

## 3.1 Ordem de Execução (Ondas — Checklist)
> **Princípio:** o **número da spec é um ID estável** (identidade + categoria por dezena), **não** a ordem de execução. A sequência de build vive **aqui** — reordenável sem renomear arquivos nem quebrar referências (assim como a ordem dos tokens no `theme_table_mapping` não dita ordem de uso). Marque `[x]` ao concluir cada item.

Cada **onda** é um conjunto construível em conjunto; a ordem **entre** ondas é a dependência real. Specs visuais (10–16) são **puxadas sob demanda** pela engine que as consome.

- **Onda 0 — Fundação do contrato** *(nada funcional compila sem ela; a Conferência guarda o crescimento desde já)*
  - [x] 20 manifest-schema  · [x] 21 datastore  · [x] 22 registry  · [x] 34 conferência-funcional
  - [x] 10 micro-layout *(visual base — verificado/conformado e registrado no Component Registry)*
- **Onda 1 — Motor de dados vivo**
  - [x] 23 renderFor  · [x] 24 data-binding-pipes  · [x] 31 fonte-de-dados
  - [x] 12 data-grids *(BASE: virtualização que a 23 delega — `SarakDataGrid` headless via `@tanstack/react-virtual`; Kanban/Charts/TreeView ficam para a Spec 12 completa)*
- **Onda 2 — Interação e regras**
  - [x] 25 dispatcher  · [x] 26 avaliação-condicional
  - [x] 13 feedback *(Toast/Overlay providers + ContextMenu novos; Modal/Drawer/Tooltip/Skeleton conformados e registrados)*
- **Onda 3 — Formulários**
  - [x] 29 validação  · [x] 32 binding-bidirecional
  - [x] 11 formulários *(BASE: Input/Select/Textarea/Switch/Slider registrados + fiados com `model`+`validation` via LeafNode/FormScope. DatePicker/MultiSelect/Uploader/RichText/RangeSlider ficam para a Spec 11 completa — sob demanda, pós-Spec 40)*
- **Onda 4 — Resiliência e estado**
  - [x] 27 error-boundaries  · [x] 28 persistência
- **Onda 5 — Aplicação real**
  - [x] 33 shell/rotas  · [x] 16 responsividade  · [x] 30 contrato-renderer *(composição final)*
  - [x] 14 navegação
- **Onda 6 — Transversais** *(mídia re-planejada nas Ondas 7/10)*
  - [x] 40 segurança *(canal `sanitizeHtml`/DOMPurify + limites anti-DoS: `MAX_NESTING_DEPTH`/`MAX_RENDERFOR_ITEMS` + fronteira de confiança documentada na Spec 08)*  · [x] 41 a11y *(BASE — diretiva `aria` no LeafNode + `useFocusTrap` (Modal/Drawer) + ARIA nos átomos + teclado WAI-ARIA nas Tabs; **resto na Onda 7**)*  · [x] 42 ponte-tema *(diretiva `theme` → `DesignScope` via `resolveTheme`; preset nomeado | override parcial; tipagem reaproveita `SarakThemePayload`)*

> **Princípio de agrupamento das Ondas 7–11:** isolar o atrito. As **Ondas 7–9 não adicionam nenhuma dependência nova** (usam peers já declarados ou são feitas in-house) — entregam leves e rápidas. A **Onda 10 concentra os 3 componentes que trazem lib nova** (cada um = decisão HITL de dependência, sempre `peerDependency` + `React.lazy`, para não inchar o bundle de quem não os usa). A **Onda 11 (Finalização)** fecha o módulo. Specs 11/12/15 só viram 🟢 **completas** quando seu item pesado aterrissar na Onda 10.

- **Onda 7 — a11y completa + mídia leve** ✅ *(zero dependência nova — entregue)*
  - [x] 41 a11y (resto) *(teclado nos Breadcrumbs (Enter/Espaço) — Pagination/Stepper já nativos/não-interativos; E2E de jornada só-teclado via `user-event`; fix de raiz no `useFocusTrap` — `onClose` por ref)*
  - [x] 15 mídia (parte 1) *(`SarakMarkdownRenderer` lazy: `react-markdown`+`react-syntax-highlighter` fora do entry, highlight por modo do tema, URLs seguras (Spec 40) · `SarakLightbox` reusando `useFocusTrap`; exportados em `index.ts`. **Registro no manifesto nativo adiado** — exige Suspense no LeafNode + atualizar a Conferência; melhor junto da integração da Spec 15)*
- **Onda 8 — Entrada de dados** ✅ *(Spec 11 — zero dependência nova; `date-fns` e `react-dropzone` já são peers — entregue)*
  - [x] 11 formulários (resto, exceto RichText) *(`SarakRangeSlider` (duplo + tooltips) · `SarakMultiSelect` (autocomplete + chips deletáveis, foco preservado) · `SarakUploader` (drag-and-drop via `react-dropzone`, estados em tokens semânticos) · `SarakDatePicker`/`SarakTimePicker` (calendário popover in-house sobre `date-fns`, single+range, i18n, teclado por setas). Registrados no manifesto nativo (27 tipos) e exportados; tipos das libs declarados estruturalmente por causa do `moduleResolution: node`. **RichText fica para a Onda 10**)*
- **Onda 9 — Densidade de dados** ✅ *(Spec 12 — zero dependência nova; `@tanstack/react-virtual` já é peer — entregue)*
  - [x] 12 data-grids (resto, exceto Kanban) *(`SarakDataTable` colunar avançado: pinned (sticky left/right) + resize (pointer) + reorder (DnD nativo), num único contêiner de scroll sobre a virtualização — a primitiva headless `SarakDataGridImpl` ficou intocada · `SarakSparkline` SVG in-house (line/area/bar, sem eixos, cabe no `SarakCard`, cor herda `--sarak-chart-primary`) · `SarakTreeView` reusando `RecursiveMatrixNode` (N níveis + `lazyLoadingIcon` ativável via JSON + `onExpand`); `RecursiveMatrixNode` tipado (Zero Any — limpeza §0.6) · Charts existentes (`SarakChart`/`SarakChartEngine`) verificados: herdam cor/fonte de marca do `design` (Regra 4 ✓); `SarakChart` conformado a tokens. Registrados no manifesto nativo (27 → 30 tipos, Conferência ✓). **Kanban fica para a Onda 10**)*
- **Onda 10 — Componentes pesados (gate de dependência)** ✅ *(única dep nova: `pdfjs-dist`; Kanban e RichText zero-dep — entregue)*
  - [x] 15 mídia (parte 2) *(`SarakPDFViewer` — `pdfjs-dist` peer + `--external` + `React.lazy`; canvas + worker fora da main thread (hook `usePdfDocument`); barra de controles zoom/página/download tokenizada)*
  - [x] 12 data-grids *(`SarakKanban` — DnD HTML5 **nativo zero-dep**; `moveCard` puro atualiza o modelo no drop (origem→destino imediato) + emite `onCardMove`)*
  - [x] 11 formulários *(`SarakRichText` — **zero-dep**: `contentEditable` + toolbar; saída E paste blindados pelo canal `sanitizeHtml` (Spec 40) com allowlist restrita (sem `<style>`/`<script>`/`on*`/`javascript:`); fia ao `model` via `onChange`)*
  - **Enabler:** Suspense por folha no `LeafNode` (`HEAVY_LAZY`) → suspensão de pesado-lazy isola-se ao nó (Skeleton local, não branqueia a árvore). Registro nativo finalizado: +5 tipos (PDFViewer/Kanban/RichText + Markdown/Lightbox adiados da Onda 7) → **Conferência 30 → 35**.
- **Onda 11 — Finalização** *(após as anteriores, ou em paralelo em baixa prioridade)*
  - [ ] 50 finalização *(`any` residual → 0, docs/README, guia do importador, build/exports)*
- **Onda 12 — Erradicação de `any`** *(campanha de adequação — núcleo→fora; quita a Regra 1 da Spec 50)*
  - [ ] 60 plano-mestre *(baseline ~484, leis, gate por fatia, roteamento por risco)* — 🟡 em andamento (484→294)
  - [~] 61 núcleo *(`src/core/**` — Discovery/Provider/Shell + Design leftover feitos; resta só o resíduo difícil `manifest.ts`/`color-engine`/`presets` → Spec 64)* · [x] 62 componentes *(`src/components/**` — `engines/` 100% limpo; resta `atomic/Templates` + `atomic` Cards/Inputs/Icon)* · [~] 63 design-engine *(`src/features/DesignEngine/**`)*
  - [x] **65 foundation** *(`SarakDesignState` — gerador tipado + fonte + Shell + DesignInjector ✅; só resíduo difícil → 64)* · [ ] 64 constantes + fechamento *(varredura final → baseline 0)*

  > **Ordem interna da Onda 12:** parte autônoma da 61 ✅ → **65 (Foundation)** ✅ → restante 61/62/63 (desbloqueadas) → 64. **Estado: 484 → 137** (núcleo quase fechado + `components/` limpo).

> O **30 (Renderer)** existe em versão **mínima** já na Onda 0 (harness para testar a fundação) e só é **finalizado** na Onda 5, quando o contrato completo (`payload`, `dataStore`, `routes`, interceptors) está pronto.

# 4. Gate de Qualidade (e Auditoria)
- **Bloco Visual:** gate = **Paridade 1:1:1:1:1** (tokens novos nas 5 camadas) + plano de testes da spec.
- **Bloco Funcional:** a paridade de tokens **não se aplica** (engines não são design tokens). O gate é definido na §5 do Mestre Funcional (`02-...`): **contratos TypeScript tipados (zero `any`) + cobertura de testes por engine**, e operacionalizado pela **Conferência Funcional (Spec 34)** — o verificador determinístico que **deve ser incorporado à `ui-auditoria-modulo`** como 7º sub-auditor (a implementação do auditor é tarefa de código, fora do escopo "apenas specs").
