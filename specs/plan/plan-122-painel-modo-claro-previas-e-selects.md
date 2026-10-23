---
tipo: "plan"
titulo: "Fazer a previa do painel mostrar o modo escolhido, caber lado a lado ou empilhada em tamanho grande, e todo select ser legivel"
objetivo: "Fazer o painel de design mostrar na previa e na galeria o modo claro ou escuro que o usuario escolheu, exibir previa e galeria lado a lado ou empilhadas em tamanho quase de tela cheia com rolagem propria, e toda lista de select da lib legivel em qualquer tema"
dominio: "Painel de customização / Prévia / Campos"
status: "🟡 Em execução"
prioridade: "Alta"
tags: ["plan", "painel", "preview", "modo-claro", "select", "contraste", "rc"]
relacionados: ["[[06-painel-de-customizacao-e-preview]]", "[[09-temas-e-presets]]", "[[016-preferencias-do-usuario-separadas-do-tema]]", "[[10-seguranca-e-acessibilidade]]", "[[07-responsividade-e-multidispositivo]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "specs/06-painel-de-customizacao-e-preview.md + specs/09-temas-e-presets.md + arquitetura/02-design-engine.md"
---

# 1. Objetivo

Com o "Modo Claro" ligado, a prévia (Gêmeo Digital) e os cartões da galeria aparecem no claro; prévia e galeria ficam lado a lado
quando cabem, e com "Empilhar previews" cada uma ocupa quase a altura inteira da área de prévia, uma abaixo da outra, com rolagem da
página e rolagem própria; nenhuma lista de `<select>` da lib mostra texto claro sobre fundo branco.

# 2. Contexto

Validação da `8.0.0-rc.2` no ERP (2026-10-22, dono). Medido no código (`src/features/DesignEngine/` salvo indicação):

- **Modo claro fora da prévia.** O "Modo Claro" é preferência (`SarakShellThemeToggle.tsx:28-30` → `updatePreferences`), aplicada só
  no Provider (`SarakUIProvider.tsx:97-101`, `overlayPreferences.ts:62-79`) e entregue só ao `DesignInjector` (`:root`/`body`). O
  rascunho da prévia nasce do design sem preferência (`hooks/useDesignDraft.ts:30,43`) e chega com `mode: 'dark'` aos dois
  `SarakDesignScope` (`Canvas/PreviewCanvas.tsx:60-73,99`, `Canvas/components/PreviewSystemRenderer.tsx:84-88`). A galeria usa
  `draft.mode` (`Main/ThemeCustomizationTab.tsx:135` → `PresetsCatalog.tsx:64,128` → `PresetCard.tsx:39`) e
  `CardsCatalog.tsx:70` fixa `'dark'` como reserva.
- **Botão de modo da prévia trava.** `Canvas/hooks/useDesignOperations.ts:5-9` monta o contexto da prévia com `design: tokens`: o
  toggle lê o modo do rascunho (sempre escuro) e grava a preferência global; depois do primeiro clique, nunca volta.
- **Caminho do token `mode`.** Trocar o token `mode` (`useDesignDraft.ts:131-152`) recarrega o tema **aplicado**, não o escolhido
  na galeria, e descarta as edições; `overlayPreferences` usa a contraparte do tema aplicado mesmo com outro tema no rascunho.
- **Layout.** Lado a lado só com `@container` ≥ 1280 px (`Canvas/panelResponsive.presets.ts:28`) — numa coluna de prévia comum, nunca
  acontece. A moldura desktop é `width: 50%` com `height: auto` em linha anulando `h-full` (`Canvas/components/LiveDraftPreviewFrame.tsx:26-36`)
  e encolhe a 300 px; a galeria é `w-1/2 h-full` (`PreviewCanvas.tsx:125`) e transborda. Empilhado, cada item é `flex-1 min-h-0`
  num contêiner travado na altura visível: metade da altura cada um, sem rolagem — a [[06-painel-de-customizacao-e-preview]] §6.2 e
  os testes travam isso. Tablet/celular usam `maxHeight: 90vh` (contra a §6.2.1). A prévia viva não rola por si
  (`PreviewSystemRenderer.tsx:87,96` `overflow-hidden`); `resize` na moldura e na galeria briga com o flex.
- **Decisão do dono (2026-10-22):** lado a lado por padrão; empilhado = cada prévia grande, quase tela cheia, uma abaixo da outra,
  rolagem da página e rolagem própria de cada prévia.
- **Select ilegível.** `SarakSelect.tsx:51` pinta o texto com `--sarak-input-text-color`; o fundo `--sarak-input-bg` é quase
  transparente (`schema/inputs.ts:87`); `color-scheme` não é escrito em lugar nenhum de `src`. O navegador desenha a lista nativa
  branca com o texto claro. Mesma lacuna em `SarakTimePicker.tsx:72-98`, `Templates/cardGridParts.tsx:94-98`,
  `Templates/SarakFilterSelect.tsx:27-29`, `Panels/LayoutTab.tsx:126-138`, `controls/BasicControls.tsx:152-174`.
- **Acabamento do painel visto nos prints:** título "Começar de um tema" em fonte de display enorme numa coluna de 320 px; "EXPORTAR
  JSON" cortado; abas da galeria quebrando em três linhas; "APLICAR (163)" com um número que o usuário não entende.

# 3. Escopo

## 3.1 Dentro
- `src/features/DesignEngine/` — `hooks/useDesignDraft.ts`, `Main/ThemeCustomizationTab.tsx`, `Main/hooks/usePreviewUIState.ts`,
  `Main/components/ThemeActionBar.tsx`, `Canvas/` (`PreviewCanvas.tsx`, `panelResponsive.presets.ts`, `components/LiveDraftPreviewFrame.tsx`,
  `components/PreviewSystemRenderer.tsx`, `components/PreviewToolbar.tsx`, `hooks/useDesignOperations.ts`, `hooks/useDeviceStyles.ts`),
  os catálogos da galeria (`PresetsCatalog.tsx`, `PresetCard.tsx`, `CardsCatalog.tsx`), `components/controls/BasicControls.tsx`,
  `Panels/LayoutTab.tsx`.
- `src/core/Provider/utils/overlayPreferences.ts` — só para reutilizá-la sobre o rascunho (exportar/aceitar o tema-base), sem mudar o
  efeito no sistema.
- `src/components/atomic/Inputs/SarakSelect.tsx`, `SarakTimePicker.tsx`, `src/components/atomic/Templates/cardGridParts.tsx`,
  `SarakFilterSelect.tsx`, `src/styles/_elements.css` (regra de `select`/`option`).
- i18n dos rótulos que mudarem; testes; casos em `browser-tests/`; `docs/migracoes.md` (`## 8.0.0`).

## 3.2 Fora
- A largura da região do cromo — `plan-121`. Tokens de cor de texto — `plan-123`. Barra — `plan-124`.
- Persistência de tema e o fluxo de salvar — `plan-119`/`plan-125`.
- Os pilares, a busca de token e os modos Impacto/Essencial/Completo.
- Specs fixas (síntese do revisor); versão e tag.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/06-painel-de-customizacao-e-preview.md` (§2.3, §4, §6, §6.1, §6.2, §6.2.1, §6.4, §10, §11) | rascunho × persistido; Gêmeo Digital; galeria e empilhado; container, não janela; testes que travam o comportamento atual |
| Spec fixa | `specs/09-temas-e-presets.md` (§2.1, §4.7) | contraparte; a troca de modo mexe só nas chaves que carregam modo |
| Spec fixa | `specs/07-responsividade-e-multidispositivo.md` (§6.1) | as quatro regras de container query |
| Spec fixa | `specs/10-seguranca-e-acessibilidade.md` | contraste, foco, `aria-disabled` |
| Spec fixa | `specs/00-regras-e-invariantes.md` (R31, R41-R44) | contraste; cascata; cor do tema, nunca fixa |
| ADR | `adr/016-preferencias-do-usuario-separadas-do-tema.md` | a preferência se sobrepõe e não é gravada no tema |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `test-unitario` · `ui-arquitetura-design` (CSS no motor) | escrita, testes, camada de CSS |
| Código | os arquivos da §3.1 | ler antes de editar |

# 5. Instruções de execução

**Três lotes**, na ordem; cada um fecha com resumo na §9 e status 🟠.

**Lote 1 — modo na prévia.**
1.1. A prévia e a galeria recebem o rascunho com a preferência de modo aplicada por cima, pela mesma regra do sistema
([[09-temas-e-presets]] §4.7), usando a contraparte do tema **do rascunho** (o escolhido na galeria, não o aplicado). O rascunho em
si continua sem preferência — o que se salva não muda.
1.2. O botão de modo dentro da prévia alterna de verdade nos dois sentidos, lendo o modo efetivo.
1.3. Trocar o token `mode` do rascunho parte do tema do rascunho e preserva as edições que não carregam modo (o aviso de descarte só
quando algo for de fato descartado).
1.4. Os cartões da galeria (temas, cards, presets) usam o modo efetivo; nenhuma reserva fixa em `'dark'`.
1.5. Testes por item; caso de navegador: com a preferência clara, o `background-color` computado da superfície da prévia e de um
cartão da galeria é o da contraparte clara do tema.

**Lote 2 — layout das prévias.**
2.1. **Lado a lado** é o padrão sempre que as duas cabem com uma largura mínima legível cada (limiar por container query, derivado
dessa largura mínima, não 1280 fixo); abaixo dele, empilham sozinhas.
2.2. **Empilhado**: cada quadro tem a altura da área de prévia visível (menos o espaçamento), um abaixo do outro; a área rola; cada
quadro rola o próprio conteúdo. Sem `vh`. Tablet/celular mantêm a proporção do aparelho dentro do quadro.
2.3. A prévia viva rola o próprio conteúdo; sem `resize` brigando com o layout (ou o `resize` passa a ser o único dono do tamanho).
2.4. Atualizar os testes que travam "metade da altura" e o critério correspondente; caso de navegador do empilhado: duas
alturas ≈ a da área, `scrollHeight` da área > `clientHeight`, e cada quadro com rolagem própria.

**Lote 3 — select legível e acabamento.**
3.1. Todo `<select>` da lib escreve `color-scheme` pelo modo efetivo do escopo, e `option` tem fundo opaco e texto dos tokens do tema
(superfície + texto), por uma regra única no motor — sem cor fixa. Cobre os arquivos listados na §2.
3.2. Teste do estilo; caso de navegador: em dois temas escuros e dois claros, o contraste de `option` (cor × fundo computados) ≥ 4,5:1.
3.3. Acabamento: o título do bloco "Começar de um tema" na escala de título de seção do painel; nenhum botão da barra de ações cortado
na largura mínima da coluna (quebra ou encurta o rótulo); as abas da galeria numa linha com rolagem horizontal ou controle segmentado;
o contador do "Aplicar" vira texto auxiliar legível ("N alterações"). Testes e i18n.
3.4. **Medido no navegador em 2026-10-23:** (a) a galeria de temas mostra um cartão por linha numa coluna de ~290 px — ela passa a
ser uma grade que usa a largura do quadro (vários cartões por linha), com o nome do tema legível (≥ 12 px); (b) no modo claro, os
títulos das seções do acordeão ("Configurações globais", "Marca e cores"…) têm contraste 3,26:1 — passar para ≥ 4,5:1; (c) "Aplicar" e
"Descartar" inativos ficam quase invisíveis — o estado inativo continua legível (o rótulo lido, só a ação esmaecida).
3.5. Nota em `docs/migracoes.md` para o que o importador vê mudar.

# 6. Critérios de aceite

- [ ] Prévia e galeria no modo da preferência, com a contraparte do tema do rascunho; o rascunho salvo sem preferência.
- [ ] Botão de modo da prévia alterna nos dois sentidos.
- [ ] Trocar `mode` no rascunho não descarta edições sem modo e parte do tema do rascunho.
- [ ] Lado a lado quando cabe; empilhado com cada quadro na altura da área, rolagem da área e de cada quadro; sem `vh`.
- [ ] Todo `option` da lib com contraste ≥ 4,5:1 em claro e escuro; `color-scheme` escrito.
- [ ] Acabamento do painel (título, ações não cortadas, abas, contador) feito.
- [ ] Galeria em grade com vários cartões por linha; acordeão ≥ 4,5:1 no claro; botões inativos legíveis.
- [ ] Testes que travavam "metade da altura" atualizados; suíte completa verde.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum — comportamento do painel e de componente, coberto por teste e caso de navegador.

- Por lote: `npm run verify -- --tier=quick`; vitest de `src/features/DesignEngine` e `src/components/atomic/Inputs`;
  `npm run build` + os casos novos de `browser-tests/`.
- Fechamento: `npm run verify -- --tier=full` e a bateria inteira do navegador.
- `git diff --stat` → só a §3.1.
- Conferência no ERP (dono): `/design` com "Modo Claro", galeria aberta, empilhado ligado e desligado; o seletor de fonte aberto.

# 8. Destino da síntese

**Destino:** `specs/06-painel-de-customizacao-e-preview.md + specs/09-temas-e-presets.md + arquitetura/02-design-engine.md`

- **`06` §6/§6.2:** a prévia mostra o rascunho com a preferência por cima (o que se salva não a leva); lado a lado por limiar de
  largura mínima; empilhado = cada quadro na altura da área, rolagem da área e de cada quadro (substitui "metade da altura").
- **`09` §4.7:** a preferência de modo também se aplica à prévia e à galeria, com a contraparte do tema do rascunho.
- **`02` §10:** a regra única de `select`/`option` (`color-scheme` + superfície e texto do tema).

---

# 9. Resumo da execução

## Resumo da execução — 2026-10-23

**Resultado:** Concluído com pendências

**Estado do worktree ao iniciar**
`git status --short` falhou com `fatal: this operation must be run in a work tree`. A fotografia alternativa por `git ls-files -m -o --exclude-standard` já mostrava alterações dos executores das plans 121 e 125, além de arquivos compartilhados; os arquivos dessas plans foram preservados.

**O que foi feito**
- A prévia e a galeria agora recebem um design efetivo com a preferência de modo aplicada sobre o rascunho e o tema atualmente escolhido; o rascunho bruto continua separado para salvar (`useDesignDraft.ts`, `ThemeCustomizationTab.tsx`, `PreviewCanvas.tsx`).
- O alternador da prévia lê o modo efetivo e troca nos dois sentidos. Alterar `mode` no rascunho parte do tema escolhido e preserva edições sem modo; o aviso de descarte depende de uma contraparte realmente personalizada que será substituída (`useDesignDraft.ts`, `overlayPreferences.ts`).
- Cartões de temas, cards e presets usam o modo efetivo; a escolha de tema continua partindo do modo bruto do rascunho (`CardsCatalog.tsx`, `PresetsCatalog.tsx`).
- Foram adicionados testes unitários e um caso de navegador para modo claro/escuro e as cores computadas da prévia e da galeria.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Provider/utils/overlayPreferences.ts` | alterado | Exporta a regra de aplicação do modo à contraparte do tema. |
| `src/features/DesignEngine/hooks/useDesignDraft.ts` | alterado | Separa rascunho bruto e prévia efetiva; preserva edições ao alternar o modo. |
| `src/features/DesignEngine/Main/ThemeCustomizationTab.tsx` | alterado | Encaminha o design efetivo à prévia e galeria. |
| `src/features/DesignEngine/Canvas/PreviewCanvas.tsx` | alterado | Recebe o modo bruto separado para escolhas da galeria. |
| `src/features/DesignEngine/Canvas/components/PresetsCatalog.tsx` | alterado | Usa modo efetivo para cartões e modo bruto para resolver tema escolhido. |
| `src/features/DesignEngine/Canvas/components/CardsCatalog.tsx` | alterado | Remove a reserva fixa em modo escuro. |
| `src/features/DesignEngine/hooks/__tests__/useDesignDraft.test.tsx` | alterado | Cobre overlay, alternância e preservação do rascunho. |
| `src/features/DesignEngine/Main/__tests__/ThemeCustomizationTab.test.tsx` | alterado | Cobre o design efetivo passado ao painel. |
| `src/features/DesignEngine/Canvas/__tests__/PreviewCanvas.test.tsx` | alterado | Atualiza cobertura da prévia. |
| `src/features/DesignEngine/Canvas/__tests__/PreviewCanvas.designScopeStability.test.tsx` | alterado | Mantém cobertura da estabilidade do escopo. |
| `src/features/DesignEngine/Canvas/components/__tests__/CardsCatalog.test.tsx` | alterado | Cobre o modo efetivo dos cartões de cards. |
| `src/features/DesignEngine/Canvas/components/__tests__/PresetsCatalog.test.tsx` | alterado | Cobre o modo efetivo e o modo bruto na escolha de tema. |
| `src/features/DesignEngine/Canvas/components/__tests__/PresetCard.test.tsx` | alterado | Cobre a cor clara computada da miniatura. |
| `browser-tests/fixtures/plan-122-preview-mode-entry.tsx` | criado | Fixture do caso de navegador do lote 1. |
| `browser-tests/plan-122-preview-mode.spec.ts` | criado | Verifica cores computadas e alternância da preferência. |
| `specs/plan/plan-122-painel-modo-claro-previas-e-selects.md` | alterado | Registra este relato e o status 🟠. |

**Verificações executadas**
- `npx vitest run --configLoader runner --maxWorkers=1 --no-file-parallelism` nos oito arquivos de teste tocados → 73 passaram; três falharam por snapshots divergentes em `PreviewCanvas.test.tsx` e `PresetCard.test.tsx`, associados às alterações concorrentes de temas/largura da plan-121. Após ajustar a expectativa de cor normalizada do navegador, o teste focado da miniatura passou (1/1).
- `npx playwright test --config=browser-tests/playwright.config.ts --output <diretório temporário> browser-tests/plan-122-preview-mode.spec.ts` → 1 passou.
- `npx tsc --noEmit` → passou.
- `npm run verify -- --tier=quick` → TypeScript e baseline passaram; quatro checks falharam por catálogo/guia gerados desatualizados, divergência de índice da plan-121 e erro do Git ao calcular citações. Detalhes em “Achados fora do escopo”.
- `node gates/scripts/audit/auditor_cleancode.mjs` → passou. A auditoria estrutural completa apontou somente dois inputs nativos em arquivos fora do escopo, listados abaixo.
- `npm run build` não foi executado conforme instrução. Nenhum commit foi criado.

**Critérios de aceite**
- [x] Lote 1.1 — preferência aplicada à prévia e galeria pela contraparte do tema do rascunho, sem gravá-la no rascunho; evidência: `useDesignDraft.ts` e testes do hook.
- [x] Lote 1.2 — alternância da prévia nos dois sentidos; evidência: caso de navegador passou.
- [x] Lote 1.3 — troca de `mode` preserva edições sem modo e só avisa sobre descarte real; evidência: testes do hook.
- [x] Lote 1.4 — cartões de temas, cards e presets usam modo efetivo; evidência: testes de catálogos e miniatura.
- [x] Lote 1.5 — caso de navegador confirmou `background-color` claro computado na superfície da prévia e no cartão da galeria.
- [ ] Lotes 2 e 3 e suíte completa verde — não executados; a instrução desta rodada limita o trabalho ao lote 1.

**Decisões e suposições**
- Quando existe tema pendente escolhido na galeria, ele é a base da contraparte; sem tema pendente, usa-se o tema resolvido do rascunho. A preferência altera apenas a projeção da prévia.
- Os testes foram serializados e os diretórios temporários ficaram fora do repositório para evitar colisões com os outros executores.

**Achados fora do escopo (não corrigidos)**
- `src/features/DesignEngine/Canvas/__tests__/PreviewCanvas.test.tsx` e `src/features/DesignEngine/Canvas/components/__tests__/PresetCard.test.tsx` — snapshots ainda esperam valores anteriores de largura/tema, enquanto a plan-121 altera `maxContentWidth` e dados dos temas.
- `docs/component-catalog.json`, `docs/component-catalog.md`, `sarak-ui/catalog.json`, `sarak-ui/VERSION`, `sarak-ui/docs/migracoes.md`, `sarak-ui/GUIA-FRONTEND.md` e `sarak-ui/START-HERE.md` — checks de catálogo e guia do verify rápido indicam artefatos desatualizados; não regenerados por serem compartilhados com as outras plans.
- `specs/plan/plan-121-largura-fluida-e-busca-do-cromo.md` — `plan-index:check` acusa estado divergente entre índice e frontmatter.
- `check-trail-citation` — Git retorna `fatal: this operation must be run in a work tree` neste ambiente.
- `src/components/atomic/Inputs/SarakMultiSelect.tsx:118` e `src/components/atomic/Inputs/SarakUploader.tsx` — auditoria completa aponta inputs nativos, fora do escopo deste lote.

**Pendências / riscos**
- Lotes 2 e 3 seguem pendentes.
- Dois snapshots dos testes tocados continuam falhando por mudanças concorrentes da plan-121; os demais testes tocados passaram ou foram cobertos pelo caso de navegador.
- O verify rápido não ficou verde pelos quatro checks externos/ambientais acima.

---

# 10. Veredito

## Veredito — 2026-10-23 — lote 1 — 🟢 Aprovado; lote 1 fechado

Verificado no worktree (compartilhado com as execuções das `plan-121` e `plan-125`; só os arquivos do lote 1 desta plan foram
julgados aqui):

- **Diff do lote** — `useDesignDraft.ts` separa `draft` (o que se salva) de `previewDraft` (o rascunho com a preferência de modo
  aplicada por `overlayPreferences`, usando o tema pendente da galeria e, sem ele, o resolvido); `ThemeCustomizationTab.tsx` passa
  `previewDraft` à prévia e o modo bruto à galeria; `PresetsCatalog.tsx` resolve o tema escolhido no modo do rascunho e desenha no
  modo efetivo; `CardsCatalog.tsx` sem a reserva fixa em `'dark'`. `overlayPreferences.ts` só exporta `applyColorMode` (efeito no
  sistema inalterado), dentro do que a §3.1 permite. A troca do token `mode` parte do tema do rascunho e só avisa quando uma
  customização da contraparte é de fato descartada (1.3).
- **Fora do lote, mas não desta plan:** `src/core/i18n/catalogEntries.part4.ts` e `Main/__tests__/LoginThemeApplication.test.tsx`
  são da `plan-125` (aviso de falha ao salvar e id ativo no cache) — não contam contra este lote.
- **Testes** — `npx vitest run src/features/DesignEngine src/core/Provider/utils` → 712/715 (rodada anterior) e, por JSON, 2
  falhas: os snapshots de `PreviewCanvas.test.tsx` ("custom properties fantasma") e `PresetCard.test.tsx`. O diff dos dois é só
  `--sarak-max-content-width: 1440px` → `calc(100% - clamp(...))`, a largura fluida da `plan-121`; nada deste lote. O snapshot é
  regravado quando a `plan-121` fechar.
- **Navegador** — `npx playwright test … browser-tests/plan-122-preview-mode.spec.ts` → 1 passou: superfície da prévia
  `rgb(243, 246, 250)` com a preferência clara, cartão da galeria `rgb(255, 255, 255)`, o toggle da prévia vai a `rgb(6, 8, 13)` e
  volta, sem erro de página (1.2, 1.5).
- **Tipos** — `npx tsc --noEmit` → saída 0.

Critérios do lote 1 atendidos (prévia e galeria no modo da preferência sem gravá-la; toggle nos dois sentidos; `mode` preserva
edições sem modo; galeria no modo efetivo). Os critérios de layout, select e acabamento seguem para os lotes 2 e 3.
