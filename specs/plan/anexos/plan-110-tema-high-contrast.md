# Anexo — high-contrast (lote 22, lote D)

## 1. Nota de conceito

Arquétipo de alto contraste para acessibilidade, governo e quiosques: preto absoluto, branco, amarelo de marca, tipografia Lexend, contorno explícito e movimento estético removido. A contraparte branca mantém a mesma hierarquia.

**Tokens que carregam a identidade:** `colorBgBody: #000000` no nativo, primária amarela, branco e preto em contraste máximo, `headingFont/bodyFont: Lexend`, bordas de 2px e tokens estéticos de transição/duração sem movimento.

## 2. Medições

Medição R31 feita pelo próprio <code>PAIRS</code>/motor de contraste usado no gate. Cada linha abaixo é um dos 76 pares reais; as colunas cobrem o modo nativo e a contraparte autorada. O limiar do gate é 4,5:1.

| Medição | dark nativo | light (contraparte autorada) |
|---|---:|---:|
| Pares R31 calculados | 76/76 | 76/76 |
| Falhas em 4,5:1 | 0 | 0 |
| Menor razão | 8,84:1 | 7,44:1 |

| Par de texto (fg / cadeia de fundo) | dark | light |
| --- | --- | --- |
| `textColorMaster` / `colorBgBody` | 21,00:1 | 21,00:1 |
| `textColorMaster` / `colorBgLayer1` | 21,00:1 | 21,00:1 |
| `textColorMaster` / `colorBgLayer2` | 21,00:1 | 21,00:1 |
| `textColorMaster` / `cardBackgroundColor` → `colorBgBody` | 21,00:1 | 21,00:1 |
| `textColorMaster` / `colorBgModal` → `colorBgBody` | 21,00:1 | 21,00:1 |
| `textColorMaster` / `sidebarColor` → `colorBgBody` | 21,00:1 | 21,00:1 |
| `textColorMaster` / `topbarColor` → `colorBgBody` | 21,00:1 | 21,00:1 |
| `textColorSecondary` / `colorBgBody` | 18,59:1 | 18,88:1 |
| `textColorSecondary` / `cardBackgroundColor` → `colorBgBody` | 18,59:1 | 18,88:1 |
| `textColorSecondary` / `colorBgModal` → `colorBgBody` | 18,59:1 | 18,88:1 |
| `textColorSecondary` / `colorBgLayer1` → `colorBgBody` | 18,59:1 | 18,88:1 |
| `textColorSecondary` / `colorBgLayer2` → `colorBgBody` | 18,59:1 | 18,88:1 |
| `textColorSecondary` / `sidebarColor` → `colorBgBody` | 18,59:1 | 18,88:1 |
| `textColorSecondary` / `topbarColor` → `colorBgBody` | 18,59:1 | 18,88:1 |
| `textColorMuted` / `colorBgBody` | 16,83:1 | 17,40:1 |
| `textColorMuted` / `cardBackgroundColor` → `colorBgBody` | 16,83:1 | 17,40:1 |
| `textColorMuted` / `colorBgModal` → `colorBgBody` | 16,83:1 | 17,40:1 |
| `textColorMuted` / `colorBgLayer1` → `colorBgBody` | 16,83:1 | 17,40:1 |
| `textColorMuted` / `colorBgLayer2` → `colorBgBody` | 16,83:1 | 17,40:1 |
| `textColorMuted` / `sidebarColor` → `colorBgBody` | 16,83:1 | 17,40:1 |
| `textColorMuted` / `topbarColor` → `colorBgBody` | 16,83:1 | 17,40:1 |
| `titleColor` / `colorBgBody` | 21,00:1 | 21,00:1 |
| `titleColor` / `surfaceColor` → `colorBgBody` | 21,00:1 | 21,00:1 |
| `titleColor` / `tableHeaderBg` → `cardBackgroundColor` → `colorBgBody` | 19,63:1 | 19,01:1 |
| `titleColor` / `cardBackgroundColor` → `colorBgBody` | 21,00:1 | 21,00:1 |
| `titleColor` / `colorBgModal` → `colorBgBody` | 21,00:1 | 21,00:1 |
| `cardTitleColor` / `cardBackgroundColor` → `colorBgBody` | 21,00:1 | 21,00:1 |
| `cardActionBtnText` / `cardActionBtnPrimaryBg` → `cardBackgroundColor` → `colorBgBody` | 14,67:1 | 11,22:1 |
| `cardActionBtnText` / `cardActionBtnHoverBg` → `cardBackgroundColor` → `colorBgBody` | 14,67:1 | 11,22:1 |
| `cardSearchTextFocusColor` / `cardSearchBgFocus` → `cardBackgroundColor` → `colorBgBody` | 17,50:1 | 16,25:1 |
| `btnPrimaryText` / `btnPrimaryBg` → `colorBgBody` | 14,67:1 | 11,22:1 |
| `inputTextColor` / `inputBg` → `colorBgBody` | 21,00:1 | 21,00:1 |
| `inputIconColor` / `inputBg` → `colorBgBody` | 16,83:1 | 17,40:1 |
| `topbarTitleColor` / `topbarColor` → `colorBgBody` | 21,00:1 | 21,00:1 |
| `tooltipTextColor` / `tooltipBg` → `colorBgBody` | 21,00:1 | 21,00:1 |
| `navItemActiveColor` / `sidebarActiveColor` → `sidebarColor` → `colorBgBody` | 11,68:1 | 8,30:1 |
| `navItemActiveColor` / `topbarActiveColor` → `topbarColor` → `colorBgBody` | 11,68:1 | 8,30:1 |
| `on:primaryColor` / `primaryColor` → `colorBgBody` | 14,09:1 | 11,22:1 |
| `on:secondaryColor` / `secondaryColor` → `colorBgBody` | 13,13:1 | 9,75:1 |
| `on:statusSuccessColor` / `statusSuccessColor` → `colorBgBody` | 11,38:1 | 7,44:1 |
| `on:statusErrorColor` / `statusErrorColor` → `colorBgBody` | 8,84:1 | 11,77:1 |
| `on:statusWarningColor` / `statusWarningColor` → `colorBgBody` | 13,99:1 | 8,43:1 |
| `on:statusInfoColor` / `statusInfoColor` → `colorBgBody` | 10,25:1 | 10,19:1 |
| `on:chatUserBg` / `chatUserBg` → `colorBgBody` | 17,50:1 | 15,61:1 |
| `mix:primaryColor` / `primaryColor@0.1` → `cardBackgroundColor` → `colorBgBody` | 15,56:1 | 14,35:1 |
| `mix:primaryColor` / `primaryColor@0.1` → `colorBgBody` | 15,56:1 | 14,35:1 |
| `mix:secondaryColor` / `secondaryColor@0.1` → `cardBackgroundColor` → `colorBgBody` | 15,24:1 | 13,92:1 |
| `mix:secondaryColor` / `secondaryColor@0.1` → `colorBgBody` | 15,24:1 | 13,92:1 |
| `mix:statusSuccessColor` / `statusSuccessColor@0.1` → `cardBackgroundColor` → `colorBgBody` | 14,76:1 | 13,08:1 |
| `mix:statusSuccessColor` / `statusSuccessColor@0.1` → `colorBgBody` | 14,76:1 | 13,08:1 |
| `mix:statusErrorColor` / `statusErrorColor@0.1` → `cardBackgroundColor` → `colorBgBody` | 13,66:1 | 14,86:1 |
| `mix:statusErrorColor` / `statusErrorColor@0.1` → `colorBgBody` | 13,66:1 | 14,86:1 |
| `mix:statusWarningColor` / `statusWarningColor@0.1` → `cardBackgroundColor` → `colorBgBody` | 15,69:1 | 13,63:1 |
| `mix:statusWarningColor` / `statusWarningColor@0.1` → `colorBgBody` | 15,69:1 | 13,63:1 |
| `mix:statusInfoColor` / `statusInfoColor@0.1` → `cardBackgroundColor` → `colorBgBody` | 14,45:1 | 14,02:1 |
| `mix:statusInfoColor` / `statusInfoColor@0.1` → `colorBgBody` | 14,45:1 | 14,02:1 |
| `statusErrorColor` / `cardBackgroundColor` → `colorBgBody` | 9,20:1 | 11,77:1 |
| `statusSuccessColor` / `cardBackgroundColor` → `colorBgBody` | 11,85:1 | 7,44:1 |
| `inputErrorColor` / `colorBgBody` | 9,20:1 | 11,77:1 |
| `inputErrorColor` / `cardBackgroundColor` → `colorBgBody` | 9,20:1 | 11,77:1 |
| `primaryColor` / `colorBgBody` | 14,67:1 | 11,22:1 |
| `primaryColor` / `cardBackgroundColor` → `colorBgBody` | 14,67:1 | 11,22:1 |
| `textColorMuted` / `btnSecondaryBg` → `colorBgBody` | 16,83:1 | 17,40:1 |
| `on:textColorMuted` / `textColorMuted` → `colorBgBody` | 16,16:1 | 17,40:1 |
| `textColorMaster` / `sidebarHoverColor` → `sidebarColor` → `colorBgBody` | 19,13:1 | 18,38:1 |
| `textColorMaster` / `topbarHoverColor` → `topbarColor` → `colorBgBody` | 19,13:1 | 18,38:1 |
| `textColorMaster` / `tableRowHoverBg` → `cardBackgroundColor` → `colorBgBody` | 18,91:1 | 17,75:1 |
| `titleColor` / `matrixItemBg` → `cardBackgroundColor` → `colorBgBody` | 19,92:1 | 19,44:1 |
| `mix:statusErrorColor` / `statusErrorColor@0.15` → `sidebarColor` → `colorBgBody` | 12,66:1 | 13,36:1 |
| `mix:statusErrorColor` / `statusErrorColor@0.15` → `topbarColor` → `colorBgBody` | 12,66:1 | 13,36:1 |
| `mix:primaryColor` / `btnGhostHoverBg` → `cardBackgroundColor` → `colorBgBody` | 15,56:1 | 14,35:1 |
| `mix:primaryColor` / `btnGhostHoverBg` → `colorBgBody` | 15,56:1 | 14,35:1 |
| `statusErrorColor` / `colorBgBody` | 9,20:1 | 11,77:1 |
| `statusSuccessColor` / `colorBgBody` | 11,85:1 | 7,44:1 |
| `textColorMuted` / `tableHeaderBg` → `cardBackgroundColor` → `colorBgBody` | 15,72:1 | 15,76:1 |
| `textColorSecondary` / `tableHeaderBg` → `cardBackgroundColor` → `colorBgBody` | 17,38:1 | 17,10:1 |

### Contraste não textual de apoio (1.4.11, limiar de referência 3:1)

As bordas em repouso e a borda do cartão abaixo de 3:1 ficam registradas para o revisor; R31 mede texto e não reprova essas medidas. Foco, trilho do switch e marcador ativo são comparados à superfície adjacente visível.

| Par medido | Razão | Leitura |
| --- | --- | --- |
| dark · borda do campo / preenchimento | 21,00:1 | ≥3:1 |
| dark · borda de foco / preenchimento | 14,67:1 | ≥3:1 |
| dark · trilho ativo do switch / polegar | 14,67:1 | ≥3:1 |
| dark · marcador ativo / superfície da navegação | 14,67:1 | ≥3:1 |
| dark · borda do cartão / corpo | 21,00:1 | abaixo de 3:1 |
| light · borda do campo / preenchimento | 21,00:1 | ≥3:1 |
| light · borda de foco / preenchimento | 11,22:1 | ≥3:1 |
| light · trilho ativo do switch / polegar | 11,22:1 | ≥3:1 |
| light · marcador ativo / superfície da navegação | 11,22:1 | ≥3:1 |
| light · borda do cartão / corpo | 21,00:1 | abaixo de 3:1 |

### Paleta categórica realmente desenhada pelo motor

O gráfico recebe quatro âncoras e <code>deriveCategoricalPalette</code> ajusta a paleta antes do desenho. A tabela usa as quatro primeiras cores resultantes; <code>ΔE</code> está como normal / protanopia / deuteranopia entre vizinhas.

| Modo · série | Cor emitida | Contra corpo | Contra cartão | ΔE vizinha N / P / D |
| --- | --- | --- | --- | --- |
| dark · 1 | `#ae9000` | 6,79:1 | 6,79:1 | — |
| dark · 2 | `#00a3bf` | 6,99:1 | 6,99:1 | 22.1 / 19.5 / 21.1 |
| dark · 3 | `#899e00` | 6,95:1 | 6,95:1 | 20.5 / 19.4 / 20.7 |
| dark · 4 | `#dc6681` | 6,26:1 | 6,26:1 | 25.1 / 16.1 / 9.8 |
| light · 1 | `#002ede` | 8,59:1 | 8,59:1 | — |
| light · 2 | `#12699d` | 5,94:1 | 5,94:1 | 17.2 / 13.7 / 13.4 |
| light · 3 | `#0b46f7` | 6,49:1 | 6,49:1 | 16.6 / 15.0 / 14.5 |
| light · 4 | `#8a3a00` | 7,82:1 | 7,82:1 | 37.5 / 35.7 / 34.6 |

Mínimo das séries contra corpo/cartão: **5,94:1**. Menor ΔE entre séries vizinhas (normal/protanopia/deuteranopia): **9.8**.

O arquétipo anuncia 7:1: os 76 pares de cada modo foram conferidos contra esse alvo; menor razão final 8,84:1 (dark) e 7,44:1 (light), nenhum abaixo de 7:1.

Peso do módulo de tema isolado, TypeScript transformado para ESM minificado e gzip nível 9: **3162 bytes gzip** (teto: 4,5 KB). O módulo só tem import de tipo, removido pela transformação; não há dependência runtime no peso isolado.

## 3. Capturas da vitrine

As dez capturas foram geradas de <code>src/</code>, usando fontes reais de <code>dist/fonts</code>, e salvas em <code>node_modules/.cache/capturas-dos-temas/high-contrast/</code>. Cada arquivo foi aberto e conferido:

- **`high-contrast__light__sidebar__desktop__telas.png`:** Superfícies brancas, bordas pretas nítidas, azul nos links e amarelo nos controles; os estados semânticos ficam diferenciados.
- **`high-contrast__light__sidebar__desktop__modal.png`:** O modal branco com bordas pretas e foco azul permanece legível sobre a vitrine clara desfocada.
- **`high-contrast__light__topbar__desktop__telas.png`:** A topbar preserva a combinação de branco, traços escuros e acentos azuis/amarelos nas telas longas.
- **`high-contrast__light__sidebar__mobile__telas.png`:** A coluna móvel mantém contornos definidos em campos, cartões e tabela compacta, com navegação inferior.
- **`high-contrast__light__sidebar__mobile__modal.png`:** O diálogo móvel usa divisórias pretas e ação azul para separar claramente título, mensagem e confirmação.
- **`high-contrast__dark__sidebar__desktop__telas.png`:** O fundo preto, os contornos claros e a marca amarela sustentam a hierarquia de alto contraste; estados de aviso permanecem visíveis.
- **`high-contrast__dark__sidebar__desktop__modal.png`:** O modal escuro delimita as três áreas com linhas claras e mantém o foco amarelo aparente.
- **`high-contrast__dark__topbar__desktop__telas.png`:** Topbar, tabela e calendário mantêm contraste claro sobre preto, com amarelo nos controles ativos.
- **`high-contrast__dark__sidebar__mobile__telas.png`:** A adaptação móvel mantém bordas claras na tabela em cartões, campos e navegação inferior.
- **`high-contrast__dark__sidebar__mobile__modal.png`:** O modal móvel claro contrasta com o fundo escuro desfocado e conserva texto e botão bem definidos.

## 4. O que o tema ensinou

A tabela propõe os destinos da consolidação; skill, GUIA, mapa e usos do schema não foram alterados neste lote D.

| Tipo | Decisão, armadilha ou medida | Destino proposto para a consolidação do lote 25 |
| --- | --- | --- |
| Decisão | A promessa “7:1” foi medida em todos os 76 pares dos dois modos. O claro inicialmente tinha mínimos entre 5,85:1 e 6,79:1 nos estados semânticos; escureci quatro cores de status e a cor de erro do campo. O mínimo final é 8,84:1 no escuro e 7,44:1 no claro. | Nota de conceito; skill `ui-criar-tema`; `usage` de `status*Color` e `inputErrorColor`. |
| Decisão | “Sem movimento” é expresso pelos tokens estéticos de duração e transição `none`. `reducedMotion`, `focusRingWidth`, navegação e alvo de toque são funcionais e não foram gravados no tema. | Nota de conceito; GUIA do importador. |
| Armadilha | Não inferir AAA a partir da primária amarela e do texto principal: estados, erros de campo e texto escolhido sobre cor sólida também entram nos 76 pares. O primeiro relatório revelou isso antes da captura final. | Skill `ui-criar-tema`; mapa “o que a lib já faz”. |
| Armadilha | `surfaceMaterial: solid` não está entre as opções do schema; `tokenContractParity` encontrou o valor e foi trocado por `organic`, que com intensidade zero não adiciona brilho nem desfoque. | Skill `ui-criar-tema`; `usage` de `surfaceMaterial`. |
| Medida | R31: 76/76 pares por modo sem pulos e todos ≥7:1; o alvo 7:1 é adicional ao gate R31 de 4,5:1. Séries de gráfico derivadas também ficam acima de 6,26:1 contra o fundo; gzip isolado: 3.162 bytes. | Skill `ui-criar-tema`; GUIA do importador. |

## 5. Achados do arsenal/fluxo e pendência para o revisor

- **Contrato de tokens:** `surfaceMaterial: solid` foi um dos quatro desvios da primeira `tokenContractParity`; o schema só oferece `frosted`, `sleek`, `industrial` e `organic` (`src/core/Design/schema/atmosphere.ts:145,158`). Corrigido para `organic`; a reexecução passou 3/3.
- **Critério #8 da diversidade (navegação): pendente por decisão do executor, conforme orientação do usuário.** A plan exige topbar e sidebar entre os cinco; <code>navigationStyle</code> é funcional em <code>src/core/Design/schema/global.ts:25</code> e <code>mobileNavigationStyle</code> em <code>src/core/Design/schema/global.ts:43</code>. O gate proíbe declarar funcionais no tema e na contraparte (<code>gates/scripts/contrato/helpers/theme-completeness-core.ts:65,76</code>). Nenhuma orientação de navegação foi gravada e o gate foi mantido. Solicito ao revisor ajustar o critério #8 para não exigir variação por tema sob o contrato atual.
- **Outros valores funcionais da ficha não foram copiados:** <code>focusRingWidth</code>, <code>reducedMotion</code> e <code>touchTargetMin</code> são funcionais em <code>src/core/Design/schema/engineering.ts:12,26,39</code>; orientação mobile também é funcional. Seus padrões de fábrica prevalecem. Em <code>high-contrast</code>, os tokens estéticos de duração e <code>pageTransitionType: none</code> mostram movimento ausente sem declarar <code>reducedMotion</code>.
- Os critérios de diversidade **1–7 e 9 passaram**; só o #8 fica por resolver com o revisor. Os temas nascem completos e não entram em <code>themeCompletenessPending.json</code>.
- O medidor global <code>node scripts/measure-consumer-boot.mjs</code> não concluiu no sandbox: esbuild não conseguiu resolver <code>src/index.ts</code> e recebeu acesso negado ao diretório acima do workspace. Para o peso por tema, foi usada a transformação isolada descrita acima. Nenhum build nem <code>dist/</code> foi alterado.
- Consolidação de decisões, armadilhas e destinos deste anexo fica para o lote 25, conforme o modelo da §5.
