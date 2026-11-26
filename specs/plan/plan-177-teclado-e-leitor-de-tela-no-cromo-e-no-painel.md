---
tipo: "plan"
titulo: "Teclado e leitor de tela no cromo e no painel"
objetivo: "Fazer todo controle do cromo e do painel ter foco visível em ao menos 3:1 e nome acessível, tirar do Tab o que não age, dar à gaveta móvel semântica e foco de diálogo, fazer o idioma fechar com Esc e a barra do topo mostrar os itens que cabem sem transbordar"
dominio: "Cromo / Painel de customização / Acessibilidade"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "rc2", "acessibilidade", "teclado", "foco", "cromo", "painel"]
relacionados: ["[[10-seguranca-e-acessibilidade]]", "[[05-cromo-e-slots]]", "[[06-painel-de-customizacao-e-preview]]", "[[07-responsividade-e-multidispositivo]]"]
depende_de: ""
retida_por: ""
destino_sintese: "10-seguranca-e-acessibilidade"
---

# 1. Objetivo

Um usuário que só usa o teclado consegue:
- ver onde está o foco, em todo controle do cromo e do painel;
- ouvir o nome de cada controle no leitor de tela;
- escolher um tema sem passar por controles das miniaturas;
- usar a gaveta móvel como um diálogo.

Além disso, a barra do topo mostra os itens que cabem, sem transbordar.

# 2. Contexto

Defeitos medidos pela validação da 9.0.0-rc.1 (plan-173, lote 4, e plan-172), em navegador real.

**Foco e nomes**

| Id | Defeito |
|---|---|
| D17 | **Foco sem indicador ou abaixo de 3:1.** Medido por pixel, foco ligado × desligado. No painel, de 1.928 paradas de `Tab`, 400 não mudam nada na tela e 951 mudam abaixo de 3:1: cartões de opção de tema, forma, componentes e barras ficam em 1,26 a 1,34:1. No cromo: "Recolher navegação" não muda; Pedidos, Idioma, Preferências, Sair e "Ordenar por…" só trocam o fundo (1,7 a 1,8:1); os `switch` não mostram nada. Links do menu (16,5:1) e campos (6,1:1) passam. **Causa parcial já lida:** o anel global de `src/styles/_elements.css` vale só para `button:focus-visible`, a cor dele não tem contraste garantido, e utilitários `focus:outline-none` o removem sem trocar por outro (por exemplo, `src/features/DesignEngine/components/controls/HelpTooltip.tsx:14`) |
| D18 | **Miniaturas do painel focáveis.** Na decisão Tema, 109 das 221 primeiras paradas caem em links, campos e botões de dentro das miniaturas dos cartões (cerca de 9 por cartão). O ciclo não fecha em 221 paradas e o 1º cartão só aparece na parada 38. Em Barras, 80 de 245 |
| D19 | **114 de 1.407 controles do painel sem nome:** 70 botões "?" (`HelpTooltip`, sem `aria-label`), cerca de 16 deslizantes com rótulo visual não associado (Intensidade da Sombra, Tamanho do H1, Arredondamento do Botão, Raio da Borda do Card, Largura da Sidebar, Altura do Logo, Opacidade da atmosfera e da textura…), o campo do nome da paleta e controles das miniaturas. Cromo: 0 sem nome |

**Camadas e menus**

| Id | Defeito |
|---|---|
| D20 | O seletor de idioma não fecha com Esc, nem na lateral nem no topo. No topo, o botão não expõe `aria-expanded` nem `aria-haspopup` |
| D21 | **A gaveta móvel** (`SarakAppChromeMobile`, `#sarak-chrome-drawer`): o `Tab` fica preso no último item ("Idioma"), sem circular. Não há `role="dialog"`, `aria-modal` nem `aria-label`, o foco não entra ao abrir e o fundo não fica inerte. O Esc já fecha e devolve o foco |
| D12 | Na barra do topo, o grupo e o "Mais" não levam `aria-current` quando a rota ativa é de um filho |

**Barra do topo e painel**

| Id | Defeito |
|---|---|
| D14 | A 820 px, a barra do topo mostra **zero itens** em 11 temas, tudo no "Mais", com espaço sobrando |
| N11 | `nav.scrollWidth` 977 contra `clientWidth` 920, a 1440 px com os 8 itens visíveis. O invólucro oculto do "Mais" soma 57 px |
| B82 | Na decisão Layout do painel, os rótulos dos cartões de opção ("LIMPA", "CONTORNADA") saem brancos sobre o cartão claro e não se leem. Visto na prévia do lote 2 da `plan-158`, antes e depois daquele lote. Antes estava no backlog |
| D6 | O texto "Passe o mouse numa opção…" (`previewHint`, `PreviewToolbar.tsx`) fica com 4 a 284 px de largura, conforme o tema. Fica abaixo de 60 px em 12 dos 25 temas e também no padrão (10 px), uma palavra por linha |
| FC | **Foco perdido na troca de modo do cromo.** O conteúdo do `SarakAppChrome` passa a viver num nó estável que muda de lugar quando o cromo troca de modo (`src/components/Layout/chrome/useStableContent.tsx`). Ao sair do lugar antigo, o elemento com foco dentro dele perde o foco para o `body`: escolher pelo teclado uma personalidade de topo no painel joga o foco para o início da página. Teste: com o foco num controle do conteúdo, a troca de `navigationStyle` mantém `document.activeElement` nele. O conserto é no `ContentAnchor` do mesmo arquivo |

# 3. Escopo

## 3.1 Dentro
- `src/styles/_elements.css`: anel de foco para todo elemento focável (não só `button`), com contraste de 3:1 contra o fundo onde
  pousa.
- Os componentes do cromo e do painel que removem o contorno sem trocar por outro (`focus:outline-none` e similares), começando pelo
  `HelpTooltip`.
- `src/features/DesignEngine/Canvas/`: as miniaturas de prévia dentro dos cartões de opção ficam fora do `Tab` e da árvore de
  acessibilidade, com `inert` no contêiner da miniatura. A prévia grande do painel não muda.
- `HelpTooltip` (nome traduzido, por exemplo "Ajuda: <rótulo>", nos seis idiomas), os deslizantes do painel (rótulo associado) e o
  campo do nome da paleta.
- `src/components/atomic/Navigation/SarakShellLanguageSelector.tsx` e os usos em `ChromeSidebarFooter.tsx` e `ChromeTopbarBody.tsx`.
- `src/components/Layout/SarakAppChromeMobile.tsx` e `src/components/Layout/chrome/ChromeMobileDrawer.tsx`: semântica de diálogo e
  foco preso com o `useFocusTrap` que já existe (`src/components/atomic/Modals/hooks/useFocusTrap.ts`).
- `src/components/atomic/Navigation/SarakShellNav.tsx`, `internal/ShellNavGroup.tsx`, `internal/ShellNavMore.tsx` e
  `internal/useHorizontalOverflow.ts`: D12, D14 e N11.
- `src/features/DesignEngine/Canvas/components/PreviewToolbar.tsx`: D6.
- `src/components/Layout/chrome/useStableContent.tsx`: FC (o foco volta ao elemento depois de o nó mudar de lugar).
- Os cartões de opção do painel (`src/features/DesignEngine/Canvas/components/`): a cor do rótulo (B82).
- `src/core/i18n/`: os textos novos, nos seis idiomas.
- Testes de unidade dos componentes tocados e uma spec de navegador nova, `browser-tests/teclado-no-cromo-e-no-painel.spec.ts`.
- `browser-tests/barra-de-topo-estreita.spec.ts`: estender para D14 e N11.

## 3.2 Fora
- Cores de tema e contraste de texto: a régua está na [[10-seguranca-e-acessibilidade]] §2.4 d e é guardada por
  `contraste-do-cromo-tom-padrao` e `contraste-do-cromo-nas-barras`. Esta plan não toca `src/core/Design/presets/themes/`. No botão de
  idioma, mantenha o fundo sem tinta e o contorno, e rode as duas specs se mexer nele.
- Provider, persistência e presets.
- **A `plan-180` corre em paralelo.** Em `src/core/i18n/`, as chaves novas entram só por acréscimo, e o arquivo é relido antes de cada
  edição. Nos componentes do painel em que a 180 troca literais por chaves (`ThemeAdvancedMenu.tsx`, `LiveDraftPreviewFrame.tsx`,
  `CustomizationPanelImpl.tsx`, `TokenControl.tsx`), mexa só no que a sua tabela pede.
- O "Mais" sobreposto que só acontece no hub: a causa não foi isolada na lib e o caso fica com o hub.
- Leitor de tela real: a medida é a árvore de acessibilidade.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Contexto | `specs/00-contexto.md` | sempre |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` §a (foco e overlay) e §c (anel de foco) | a regra de overlay e o anel atual |
| Spec fixa | `specs/specs/05-cromo-e-slots.md` | gaveta, "Mais" e widgets do cromo |
| Spec fixa | `specs/specs/06-painel-de-customizacao-e-preview.md` | decisões, cartões e prévia |
| Spec fixa | `specs/specs/07-responsividade-e-multidispositivo.md` | barra do topo em larguras médias |
| Skill | `padrao-escrita` + `padrao-typescript` | sempre |
| Skill | `test-unitario` · `test-e2e` | testes de componente e spec de navegador |
| Código | `src/components/atomic/Modals/hooks/useFocusTrap.ts` | o foco preso que a gaveta deve reusar |
| Código | `browser-tests/barra-de-topo-estreita.spec.ts` | molde da medição do topo |

# 5. Instruções de execução

## Lote 1 — foco, nomes e miniaturas (D17, D18, D19)

1. **Medição primeiro.** Crie `browser-tests/teclado-no-cromo-e-no-painel.spec.ts`:
   - **percurso:** cromo a 1440 px e a 390 px, e as 8 decisões do painel a 1440 px, só com `Tab`;
   - **anel:** para cada parada, compare a captura da caixa do elemento (com folga de 4 px) com foco e sem foco. Reprove se nada mudar
     ou se a mudança ficar abaixo de 3:1 contra o pixel sem foco;
   - **nome:** reprove controle sem nome na árvore de acessibilidade;
   - **ciclo:** na decisão Tema, o ciclo de `Tab` fecha e o 1º cartão de tema chega em no máximo 5 paradas depois do título da
     decisão.

   Rode e registre as reprovações; devem reproduzir D17, D18 e D19.
2. **Corrija:**
   - anel global para todo focável;
   - fim dos `outline-none` sem substituto;
   - `inert` nas miniaturas;
   - nomes do `HelpTooltip`, dos deslizantes e do campo de paleta.
3. A spec do passo 1 passa **sem lista de exceções**.

## Lote 2 — camadas e menus (D20, D21, D12)

1. **Seletor de idioma:** o Esc fecha e devolve o foco ao botão. O botão do topo expõe `aria-haspopup` e `aria-expanded`.
2. **Gaveta móvel:**
   - `role="dialog"`, `aria-modal="true"` e nome;
   - ao abrir, o foco entra no 1º item;
   - o `Tab` circula dentro da gaveta, pelo `useFocusTrap`;
   - o fundo fica `inert`;
   - o Esc continua fechando e devolvendo o foco.
3. **Barra do topo:** o grupo e o "Mais" levam `aria-current` quando a rota ativa é de um filho deles.
4. Testes de unidade para os três, com o caso que falha antes da correção.

## Lote 3 — topo e texto de ajuda (D14, N11, D6)

1. **D14:** a 820 px, a barra do topo mostra os itens que cabem antes de mandar o resto ao "Mais". Estenda
   `barra-de-topo-estreita.spec.ts` para os 25 temas a 820 px: reprove quando o "Mais" estiver visível com espaço para o item seguinte.
2. **N11:** o invólucro oculto do "Mais" não soma largura. `nav.scrollWidth` fica igual a `clientWidth`, a 1440 e a 820 px.
3. **D6:** o texto de ajuda fica com ao menos 160 px de largura a 1440 px nos 25 temas. Se não couber ao lado, vai para a linha de
   baixo. Meça na spec do lote 1.
4. **B82:** os rótulos dos cartões de opção do painel ficam em ao menos 4,5:1 contra o fundo do próprio cartão, nos 25 temas e nos dois
   modos. Meça na spec do lote 1, em todas as decisões, não só em Layout.

## Verificação do executor (uma vez, no fim)

- `npx vitest run` com filtro nos testes dos arquivos tocados e nos dos componentes que os usam (procure por import);
- `npm run verify -- --tier=quick`;
- `npm run build`, depois as specs da plan sozinhas:
  `npx playwright test --config=browser-tests/playwright.config.ts teclado-no-cromo-e-no-painel barra-de-topo-estreita`.

**Não** rode a suíte completa nem a bateria `cromo-css-real:check` inteira. As duas rodam uma vez, no fechamento da campanha da rc.2.

# 6. Critérios de aceite

- [ ] A spec `teclado-no-cromo-e-no-painel` passa sem exceções: anel de ao menos 3:1 em toda parada, 0 controles sem nome, e o
      ciclo de Tema fecha com o 1º cartão em no máximo 5 paradas.
- [ ] Idioma, gaveta e `aria-current` têm teste de unidade que falhava antes, e passam.
- [ ] `barra-de-topo-estreita` cobre os 25 temas a 820 px e o `nav.scrollWidth`, e passa.
- [ ] Os rótulos dos cartões de opção do painel ficam em ao menos 4,5:1 nos 25 temas e nos dois modos (B82).
- [ ] Os textos novos existem nos seis idiomas.
- [ ] Os comandos da verificação do executor passam, e o resumo traz a saída final de cada um.
- [ ] `git diff --stat` mostra só caminhos da §3.1.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo. O invariante vira a spec de navegador `teclado-no-cromo-e-no-painel`, que entra na bateria do
`cromo-css-real:check`.

O revisor **não repete** os comandos do executor. Ele confere:
- `git diff --stat` contra a §3.1.
- **Mutação, em cópia fora do repositório:**
  - volte um `focus:outline-none` sem substituto → a spec de teclado reprova;
  - retire o `inert` das miniaturas → o critério do ciclo de Tema reprova;
  - retire o `useFocusTrap` da gaveta → o teste de unidade da gaveta reprova.
- Leitura dos textos novos nos seis idiomas, por amostra.

# 8. Destino da síntese

**Destino:** `10-seguranca-e-acessibilidade`. Texto para transporte:

- **Em §c (anel de foco), substituindo o escopo "botão e link":**

  > O anel vale para todo elemento focável do cromo e do painel e fica em ao menos 3:1 contra o fundo onde pousa. Nenhum componente
  > remove o contorno sem pôr outro. Miniaturas de prévia dentro de cartões são `inert`. Guarda `teclado-no-cromo-e-no-painel`.

- **Em §a (overlay), acrescentar a gaveta móvel do cromo à lista de camadas que prendem o foco:**

  > A gaveta tem `role="dialog"` e `aria-modal`, prende o `Tab`, torna o fundo inerte, fecha no Esc e devolve o foco.

---

# 9. Resumo da execução

## Resumo da execução — 2026-11-26

**Resultado:** Concluído com pendências

**Estado do worktree ao iniciar**
Só `dist/` (rebuild anterior) e, fora dele: `M specs/00-indice.md`, `D plan-176`, `M plan-177`, `D plan-178`, `M plan-180`, `M plan-183`, `M specs/specs/09-temas-e-presets.md`, `M specs/specs/10-seguranca-e-acessibilidade.md`, `M src/buildInfo.ts`, `M src/core/Provider/buildInfo.ts`. A plan-180 corre em paralelo e mexeu em `src/core/i18n/`, `docs/`, `sarak-ui/`, `TemplatesTab`, `TokenControl`, `ThemeAdvancedMenu`, `previewScreens` etc. durante a execução; esses arquivos não são meus.

**Medição antes da correção (reprovações reproduzidas)**
- Painel, decisão Tema: dezenas de paradas em links/campos/botões das miniaturas (D18) e anel de 1,9–2,9:1 em cartões e itens (D17).
- Gaveta móvel: o foco não entrava ao abrir (o 1º focável do DOM era a busca, oculta por breakpoint) (D21).

**O que foi feito**
- `src/styles/_elements.css`: anel de foco para todo focável (a, button, input, select, textarea, summary, tabindex, roles), dois tons (contorno na cor do texto do tema + halo na cor do fundo), largura pelo token `focusRingWidth`.
- Removidos `outline-none` sem substituto: `SarakButton`, `SarakIconButton`, `SarakInput/Select/Textarea`, `HelpTooltip`, `LayoutControls`, `ColorControl`, `ThemeSidebarHeader`, `TextMock`, e `focus-visible:outline-none/ring-2` nos itens do painel (CollapsibleSection, ThemeAdvancedMenu, ThemeDecisionHeader/List, ThemeFineTuning, ThemeMoreActionsMenu, ThemeSearchResults, CuratedGrid).
- Controles com `<input sr-only>`: `peerFocusRing.ts` novo; `SarakSwitch/Checkbox/Radio` desenham o anel na peça visual. Botão do seletor de cor ganha anel no contêiner (`has-[:focus-visible]`).
- `OptionTile`: `inert` na amostra, anel do botão por dentro (o cartão corta); B82: fundo/rótulo passam a `--theme-surface`/`--theme-title` (também em `TypographyCatalog`).
- Nomes: `HelpTooltip` ("Ajuda: {label}", abre também no foco, Esc fecha), `SliderControl`, opacidade do `AtmosphereCatalog`, `MasterControlPanel`, 3 switches do `SarakSearchCard`, botão expansor do `SarakActionCard`, select/input do `TextMock`. Textos novos em `src/core/i18n/catalogEntries.keyboard.ts` (seis idiomas, acréscimo isolado + 2 linhas em `catalog.ts`).
- `SarakShellLanguageSelector`: Esc fecha e devolve o foco; botão do topo com `aria-haspopup`/`aria-expanded` (D20) e anel próprio.
- Gaveta (D21): `role="dialog"`, `aria-modal`, `aria-label`; `useFocusTrap` agora ignora focáveis ocultos (causa do foco que não entrava e do ciclo quebrado); `useInertBackground.ts` novo (inert no fundo, desfeito antes de devolver o foco).
- D12: `aria-current="true"` no grupo/"Mais" com filho ativo (`ShellNavGroup`, `SarakMenuItem` respeita `aria-current` passado).
- N11/D14: botão "Mais" invisível fica no começo da barra; linha dos itens com `overflow-x-clip` (`data-sarak-nav-row`) para o `scrollWidth` não somar itens escondidos.
- D6: `PREVIEW_TOOLBAR_HINT` com `min-w/basis 10rem` (quebra para a linha de baixo).
- FC: `useStableContent` guarda o elemento focado e o refoca depois de encaixar o nó.
- `LiveDraftPreviewFrame`: botão "Inspecionar" visível ao focar (`focus-visible:opacity-100`; 1 classe).
- Testes: spec nova `browser-tests/teclado-no-cromo-e-no-painel.spec.ts` + `fixtures/teclado-entry.tsx`; `barra-de-topo-estreita.spec.ts` estendido (25 temas × 1440/820, `scrollWidth`); unidade: drawer, useFocusTrap, useInertBackground, OptionTile, idioma, aria-current, HelpTooltip; snapshots atualizados.

**Arquivos alterados** — ver `git diff`; os da §3.1 mais os extras listados em "Decisões".

**Verificações executadas**
- `npx playwright test … teclado-no-cromo-e-no-painel barra-de-topo-estreita` → 80 passed (16,3 min), sem lista de exceções; B82 e D6 nos 25 temas.
- vitest por pasta (Layout, Inputs, Cards, Modals, Navigation, i18n, styles, DesignEngine/Canvas/Panels/controls) → verde após atualizar snapshots; exceto `designGravadoEscolhas.persistenceIntegration` 1.3 e 1.5, que **falham também numa cópia do `HEAD`** (controle feito; `git status` idêntico antes/depois).
- `npm run verify -- --tier=quick`: tsc OK, barrel, guide, variable-contract OK. Falham: `catalog:check`, `plan-index:check` e `audit:baseline` (hardcoded 0→25), todos da plan-180 (JSDoc do catálogo, status 🟠 da 180, cores hex em `themeDescriptions.ts`).
- `npm run build` completo **não rodou** (para em `catalog:check` por causa da 180); rodei `build:js` e `build:css` e rodei as specs sobre eles. `dist/` está regenerado parcialmente (sem `fonts:embed`/inject).

**Critérios de aceite**
- [x] spec de teclado sem exceções; [x] testes de unidade; [x] barra-de-topo 25 temas; [x] B82; [x] seis idiomas
- [ ] "comandos da verificação passam": `build` e `quick` bloqueados por itens da plan-180 (acima)
- [ ] `git diff --stat` só §3.1: ver extras.

**Decisões e suposições**
- Arquivos fora da §3.1 que a regra "sem exceções" forçou: `SarakSwitch/Checkbox/Radio/Input/Select/Textarea`, `SarakButton/IconButton`, `SarakSearchCard`, `SarakActionCard`, `SarakMenuItem`, `TextMock`, `MasterControlPanel`, `TypographyCatalog`, `LiveDraftPreviewFrame`, `AtmosphereCatalog`, `ColorControl`, `BasicControls`, `LayoutControls`, `ThemeSidebarHeader` e demais itens do painel, `useFocusTrap`, `focusRing.test.ts` (regex generalizada). Revisor decide.
- Anel de dois tons via `box-shadow`; componentes com `boxShadow` inline (SarakInput) mantêm só o contorno.
- `-u` em snapshots de PresetsCatalog/PreviewCanvas pode ter absorvido mudanças da plan-180 no mesmo arquivo.

**Achados fora do escopo (não corrigidos)**
- `dot-matrix-elegant` a 820 px ainda mostra zero itens: o slot de busca encolhido a 0 px ainda soma 2 vãos de 24 px; pela régua da plan (nada cabe ao lado) passa, mas é a causa do "espaço sobrando".
- `designGravadoEscolhas.persistenceIntegration` 1.3/1.5 falham no `HEAD`.
- `SarakSearchCard` tem rótulos em português fixos (i18n).

**Pendências / riscos**
- Rodar `npm run build` completo depois que a 180 regenerar catálogo/guia.
- Mutações do §7 não feitas por mim (revisor).

---

# 10. Veredito

## Veredito — 2026-11-26 — 🔴 Devolvida para completar

**O que foi verificado:**
- `tsc --noEmit`: 0 erros.
- **Mutação, em cópia fora do repositório:**
  - sem o `inert` nas miniaturas do `OptionTile`, a decisão Tema reprova. A falha é no anel, com 222 paradas sem foco visível
    dentro das miniaturas, antes de o teste chegar ao critério do ciclo;
  - com `focus:outline-none` de volta no botão do `HelpTooltip`, só a decisão Componentes reprova (1,20:1 e 1,02:1). É a única
    em que o percurso alcança um botão de ajuda;
  - sem o `handleTrap` na gaveta, a spec de navegador reprova ("o Tab fica dentro da gaveta"), mas os 24 testes de unidade da
    gaveta (`SarakAppChromeMobile.test.tsx`, `ChromeMobileDrawer.test.tsx`) passam.
- **Escopo:** os arquivos fora da §3.1 listados em "Decisões" são consequência da regra "sem exceções" e ficam aceitos.
- **Textos novos:** os três de `catalogEntries.keyboard.ts` estão nos seis idiomas.
- **Consumidores:** `npx vitest run src/components src/features/DesignEngine src/core/i18n src/styles` deu 3952 passando e 7
  falhando:
  - 2 de `designGravadoEscolhas.persistenceIntegration.test.tsx`, que são da `plan-184`;
  - 1 estouro de prazo no teste de idioma, que é da `plan-180`;
  - 4 desta plan, nos achados 1 e 2.

**Achados:**

1. **O foco inicial do `SarakPopover` regrediu.** `src/components/atomic/UX/__tests__/SarakPopover.test.tsx` ("foca o primeiro
   controle do painel ao abrir…") reprova: o foco cai no próprio diálogo.
   - O popover abre com `visibility: hidden` até ter posição (`SarakPopover.tsx:100`). O `isRendered` novo do `useFocusTrap` pula
     focáveis invisíveis e não acha o primeiro controle.
   - O `useFocusTrap` também serve a `SarakDrawer`, `SarakSpotlight`, `ShellPreferencesMenu`, `SarakTour`, `SarakLightbox`, o
     visualizador de PDF e o seletor de data.
   - **Correção:** o foco inicial chega ao primeiro controle também quando a camada nasce invisível e aparece depois de posicionada.
     A gaveta continua pulando o que o breakpoint esconde.
2. **Snapshots de consumidores fora do filtro:**
   - `SarakDataTable.semPropsNovas.test.tsx` (2) e `SarakCoreCard.test.tsx` (1) reprovam;
   - a diferença é só o `focus:outline-none` que saiu do botão e o `peer` com o anel do checkbox;
   - **Correção:** `-u` só nesses dois arquivos, depois de conferir que a diferença é só essa.
3. **A spec de teclado não percorre o "Ajuste fino".**
   - Em Cores, Forma e Componentes, o percurso para em "Ajuste fino · N ajustes" sem abri-lo. Por isso, a maior parte dos 70
     botões "?" e dos deslizantes sem nome da D19 fica fora da medida.
   - **Correção:** em cada decisão que tem "Ajuste fino", a spec abre a seção e percorre também o que ela mostra. Corrija o que
     reprovar, sem lista de exceções.
4. **A gaveta não tem o teste de unidade que o §6 pede.**
   - **Correção:** um caso em `SarakAppChromeMobile.test.tsx`: com a gaveta aberta, o `Tab` no último item leva ao primeiro e o
     `Shift+Tab` no primeiro leva ao último. O caso tem de falhar sem o `handleTrap`.
5. **Falta a nota de migração.** O importador vê o foco diferente:
   - o anel vale para todo focável e não só para `button`;
   - a cor muda da primária ou da textura para a cor do texto do tema, com um halo na cor do fundo;
   - `SarakButton`, `SarakIconButton`, `SarakInput`, `SarakSelect` e `SarakTextarea` perdem o `outline-none`;
   - `SarakSwitch`, `SarakCheckbox` e `SarakRadio` desenham o anel na peça visual;
   - o `nav` horizontal do `SarakShellNav` ganha a linha `data-sarak-nav-row` entre ele e os itens.
   - **Correção:** uma entrada em `docs/migracoes.md` e `npm run guide`.

**Fica no backlog:** os rótulos fixos em português do `SarakSearchCard` e o `dot-matrix-elegant` a 820 px, que o próprio resumo
aponta.

**Verificação desta rodada:**
- `npx vitest run src/components/atomic src/components/Layout` (o `useFocusTrap` e quem o usa);
- `npx playwright test --config=browser-tests/playwright.config.ts teclado-no-cromo-e-no-painel -g "painel, decisão"`, sobre o
  `build:js` e o `build:css`;
- `npm run guide:check`.

**Commit:** junto com a `plan-180`, depois das duas aprovadas.

---

## Resumo da execução — correções do Veredito (2026-11-26)

**Resultado:** Concluído

- **Achado 1:** `useFocusTrap` — o foco inicial escolhe o primeiro focável fora de `display: none` (mesmo com `visibility: hidden`, como o popover nasce) e, se o navegador recusar, tenta de novo no próximo quadro (cancelado ao fechar). O ciclo do `Tab` continua pulando o oculto (gaveta/breakpoint). `SarakPopover.test.tsx` e `Modals` verdes.
- **Achado 2:** `-u` só em `SarakDataTable.semPropsNovas` e `SarakCoreCard`; diferença conferida: sai `focus:outline-none`, entram `peer sr-only` e o anel do checkbox.
- **Achado 3:** `openFineTuning` na spec abre "Ajuste fino" e "mostrar todos" antes do percurso (`MAX_STOPS` 700→1500). As 8 decisões passam, sem lista de exceções (nada precisou ser corrigido além do já feito).
- **Achado 4:** caso em `SarakAppChromeMobile.test.tsx` (Tab no último → primeiro; Shift+Tab no primeiro → último). Mutação sem o `handleTrap` (`onKeyDown={undefined}`): o caso reprova; arquivo restaurado.
- **Achado 5:** entrada em `docs/migracoes.md`; `npm run guide` regerado, `guide:check` em dia.

**Verificações:** `vitest run src/components/atomic src/components/Layout` → 367 arquivos / 2437 testes passando; `playwright … -g "painel, decisão"` sobre `build:js`+`build:css` → 8 passed (5,6 min); `guide:check` OK.
**Pendência:** `npm run build` completo segue dependendo da plan-180 (`catalog:check`).

## Veredito (correção 1) — 2026-11-26 — 🟢 Aprovada

**O que foi verificado:**
- **Os cinco achados foram fechados:**
  - o foco inicial do `useFocusTrap` considera também a camada que nasce invisível, e o ciclo continua pulando o oculto;
  - o `-u` saiu só nos dois arquivos pedidos;
  - a spec abre o "Ajuste fino";
  - a gaveta ganhou o caso de `Tab`/`Shift+Tab`;
  - a nota de migração está em `docs/migracoes.md`.
- **Mutação, em cópia fora do repositório:** com `focus:outline-none` de volta no botão do `HelpTooltip` e o CSS refeito, as decisões
  Cores e Forma reprovam. O percurso agora passa por 36 botões de ajuda e 33 deslizantes em Cores, e por 29 e 24 em Forma. Antes da
  correção, o percurso não alcançava nenhum dos dois.
- **Consumidores:** `npx vitest run src/components src/features/DesignEngine src/core/i18n src/styles` deu 3964 passando e 2
  falhando. As 2 falhas são de `designGravadoEscolhas.persistenceIntegration.test.tsx` 1.3 e 1.5, que são da `plan-184`.
- **Tipos e auditoria:** `tsc --noEmit` com 0 erros e `check-audit-baseline.mjs` sem regressão.
- **Checks do Anel 1:** `catalog:check`, `guide:check`, `dev-kit:check`, `variable-contract:check` e `barrel:check` passam no worktree.

**Commit:** junto com a `plan-180`, num só.
