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

---

# 10. Veredito
