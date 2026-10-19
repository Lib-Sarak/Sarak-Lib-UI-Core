# Anexo — editorial-ink (lote 20, lote D)

## 1. Nota de conceito

Arquétipo editorial de papel e tinta: serifa de leitura, coluna espaçosa, acabamento de impressão e oxblood como acento. Demonstra que tipografia, largura, ritmo vertical, cantos e contraste podem comunicar uma publicação sem trocar o contrato funcional da biblioteca.

**Tokens que carregam a identidade:** `headingFont: Fraunces`, `bodyFont: Source Serif 4`, `primaryColor: #1c1b1a`, `chartColorPalette: #9b1c2c`, paleta de papel quente, cantos nítidos, corpo 18px e layout espaçoso.

## 2. Medições

Medição R31 feita pelo próprio <code>PAIRS</code>/motor de contraste usado no gate. Cada linha abaixo é um dos 76 pares reais; as colunas cobrem o modo nativo e a contraparte autorada. O limiar do gate é 4,5:1.

| Medição | light nativo | dark (contraparte autorada) |
|---|---:|---:|
| Pares R31 calculados | 76/76 | 76/76 |
| Falhas em 4,5:1 | 0 | 0 |
| Menor razão | 5,28:1 | 7,58:1 |

| Par de texto (fg / cadeia de fundo) | light | dark |
| --- | --- | --- |
| `textColorMaster` / `colorBgBody` | 15,94:1 | 14,67:1 |
| `textColorMaster` / `colorBgLayer1` | 16,65:1 | 13,70:1 |
| `textColorMaster` / `colorBgLayer2` | 14,75:1 | 12,66:1 |
| `textColorMaster` / `cardBackgroundColor` → `colorBgBody` | 17,37:1 | 13,70:1 |
| `textColorMaster` / `colorBgModal` → `colorBgBody` | 17,37:1 | 13,70:1 |
| `textColorMaster` / `sidebarColor` → `colorBgBody` | 16,65:1 | 13,70:1 |
| `textColorMaster` / `topbarColor` → `colorBgBody` | 16,65:1 | 13,70:1 |
| `textColorSecondary` / `colorBgBody` | 9,63:1 | 11,55:1 |
| `textColorSecondary` / `cardBackgroundColor` → `colorBgBody` | 10,49:1 | 10,79:1 |
| `textColorSecondary` / `colorBgModal` → `colorBgBody` | 10,49:1 | 10,79:1 |
| `textColorSecondary` / `colorBgLayer1` → `colorBgBody` | 10,06:1 | 10,79:1 |
| `textColorSecondary` / `colorBgLayer2` → `colorBgBody` | 8,91:1 | 9,97:1 |
| `textColorSecondary` / `sidebarColor` → `colorBgBody` | 10,06:1 | 10,79:1 |
| `textColorSecondary` / `topbarColor` → `colorBgBody` | 10,06:1 | 10,79:1 |
| `textColorMuted` / `colorBgBody` | 6,81:1 | 9,35:1 |
| `textColorMuted` / `cardBackgroundColor` → `colorBgBody` | 7,42:1 | 8,74:1 |
| `textColorMuted` / `colorBgModal` → `colorBgBody` | 7,42:1 | 8,74:1 |
| `textColorMuted` / `colorBgLayer1` → `colorBgBody` | 7,11:1 | 8,74:1 |
| `textColorMuted` / `colorBgLayer2` → `colorBgBody` | 6,30:1 | 8,07:1 |
| `textColorMuted` / `sidebarColor` → `colorBgBody` | 7,11:1 | 8,74:1 |
| `textColorMuted` / `topbarColor` → `colorBgBody` | 7,11:1 | 8,74:1 |
| `titleColor` / `colorBgBody` | 15,94:1 | 14,67:1 |
| `titleColor` / `surfaceColor` → `colorBgBody` | 17,37:1 | 13,70:1 |
| `titleColor` / `tableHeaderBg` → `cardBackgroundColor` → `colorBgBody` | 15,88:1 | 12,35:1 |
| `titleColor` / `cardBackgroundColor` → `colorBgBody` | 17,37:1 | 13,70:1 |
| `titleColor` / `colorBgModal` → `colorBgBody` | 17,37:1 | 13,70:1 |
| `cardTitleColor` / `cardBackgroundColor` → `colorBgBody` | 17,37:1 | 13,70:1 |
| `cardActionBtnText` / `cardActionBtnPrimaryBg` → `cardBackgroundColor` → `colorBgBody` | 16,84:1 | 14,71:1 |
| `cardActionBtnText` / `cardActionBtnHoverBg` → `cardBackgroundColor` → `colorBgBody` | 16,92:1 | 14,71:1 |
| `cardSearchTextFocusColor` / `cardSearchBgFocus` → `cardBackgroundColor` → `colorBgBody` | 13,62:1 | 10,03:1 |
| `btnPrimaryText` / `btnPrimaryBg` → `colorBgBody` | 16,84:1 | 14,71:1 |
| `inputTextColor` / `inputBg` → `colorBgBody` | 17,37:1 | 13,70:1 |
| `inputIconColor` / `inputBg` → `colorBgBody` | 7,42:1 | 8,74:1 |
| `topbarTitleColor` / `topbarColor` → `colorBgBody` | 16,65:1 | 13,70:1 |
| `tooltipTextColor` / `tooltipBg` → `colorBgBody` | 15,94:1 | 14,67:1 |
| `navItemActiveColor` / `sidebarActiveColor` → `sidebarColor` → `colorBgBody` | 12,21:1 | 9,47:1 |
| `navItemActiveColor` / `topbarActiveColor` → `topbarColor` → `colorBgBody` | 12,21:1 | 9,47:1 |
| `on:primaryColor` / `primaryColor` → `colorBgBody` | 17,20:1 | 16,03:1 |
| `on:secondaryColor` / `secondaryColor` → `colorBgBody` | 5,99:1 | 9,92:1 |
| `on:statusSuccessColor` / `statusSuccessColor` → `colorBgBody` | 5,85:1 | 11,38:1 |
| `on:statusErrorColor` / `statusErrorColor` → `colorBgBody` | 6,57:1 | 8,84:1 |
| `on:statusWarningColor` / `statusWarningColor` → `colorBgBody` | 6,79:1 | 13,99:1 |
| `on:statusInfoColor` / `statusInfoColor` → `colorBgBody` | 6,70:1 | 10,25:1 |
| `on:chatUserBg` / `chatUserBg` → `colorBgBody` | 14,33:1 | 13,86:1 |
| `mix:primaryColor` / `primaryColor@0.1` → `cardBackgroundColor` → `colorBgBody` | 15,44:1 | 12,27:1 |
| `mix:primaryColor` / `primaryColor@0.1` → `colorBgBody` | 14,21:1 | 13,41:1 |
| `mix:secondaryColor` / `secondaryColor@0.1` → `cardBackgroundColor` → `colorBgBody` | 12,09:1 | 11,02:1 |
| `mix:secondaryColor` / `secondaryColor@0.1` → `colorBgBody` | 11,15:1 | 11,99:1 |
| `mix:statusSuccessColor` / `statusSuccessColor@0.1` → `cardBackgroundColor` → `colorBgBody` | 11,98:1 | 11,29:1 |
| `mix:statusSuccessColor` / `statusSuccessColor@0.1` → `colorBgBody` | 11,05:1 | 12,29:1 |
| `mix:statusErrorColor` / `statusErrorColor@0.1` → `cardBackgroundColor` → `colorBgBody` | 12,68:1 | 10,56:1 |
| `mix:statusErrorColor` / `statusErrorColor@0.1` → `colorBgBody` | 11,69:1 | 11,46:1 |
| `mix:statusWarningColor` / `statusWarningColor@0.1` → `cardBackgroundColor` → `colorBgBody` | 12,69:1 | 11,82:1 |
| `mix:statusWarningColor` / `statusWarningColor@0.1` → `colorBgBody` | 11,70:1 | 12,90:1 |
| `mix:statusInfoColor` / `statusInfoColor@0.1` → `cardBackgroundColor` → `colorBgBody` | 12,30:1 | 11,09:1 |
| `mix:statusInfoColor` / `statusInfoColor@0.1` → `colorBgBody` | 11,33:1 | 12,06:1 |
| `statusErrorColor` / `cardBackgroundColor` → `colorBgBody` | 6,47:1 | 7,58:1 |
| `statusSuccessColor` / `cardBackgroundColor` → `colorBgBody` | 5,75:1 | 9,76:1 |
| `inputErrorColor` / `colorBgBody` | 5,94:1 | 8,11:1 |
| `inputErrorColor` / `cardBackgroundColor` → `colorBgBody` | 6,47:1 | 7,58:1 |
| `primaryColor` / `colorBgBody` | 15,53:1 | 14,71:1 |
| `primaryColor` / `cardBackgroundColor` → `colorBgBody` | 16,92:1 | 13,74:1 |
| `textColorMuted` / `btnSecondaryBg` → `colorBgBody` | 6,30:1 | 8,07:1 |
| `on:textColorMuted` / `textColorMuted` → `colorBgBody` | 7,54:1 | 10,19:1 |
| `textColorMaster` / `sidebarHoverColor` → `sidebarColor` → `colorBgBody` | 14,77:1 | 11,88:1 |
| `textColorMaster` / `topbarHoverColor` → `topbarColor` → `colorBgBody` | 14,77:1 | 11,88:1 |
| `textColorMaster` / `tableRowHoverBg` → `cardBackgroundColor` → `colorBgBody` | 14,81:1 | 11,25:1 |
| `titleColor` / `matrixItemBg` → `cardBackgroundColor` → `colorBgBody` | 16,20:1 | 12,66:1 |
| `mix:statusErrorColor` / `statusErrorColor@0.15` → `sidebarColor` → `colorBgBody` | 11,19:1 | 9,57:1 |
| `mix:statusErrorColor` / `statusErrorColor@0.15` → `topbarColor` → `colorBgBody` | 11,19:1 | 9,57:1 |
| `mix:primaryColor` / `btnGhostHoverBg` → `cardBackgroundColor` → `colorBgBody` | 15,44:1 | 12,27:1 |
| `mix:primaryColor` / `btnGhostHoverBg` → `colorBgBody` | 14,21:1 | 13,41:1 |
| `statusErrorColor` / `colorBgBody` | 5,94:1 | 8,11:1 |
| `statusSuccessColor` / `colorBgBody` | 5,28:1 | 10,45:1 |
| `textColorMuted` / `tableHeaderBg` → `cardBackgroundColor` → `colorBgBody` | 6,79:1 | 7,87:1 |
| `textColorSecondary` / `tableHeaderBg` → `cardBackgroundColor` → `colorBgBody` | 9,60:1 | 9,73:1 |

### Contraste não textual de apoio (1.4.11, limiar de referência 3:1)

As bordas em repouso e a borda do cartão abaixo de 3:1 ficam registradas para o revisor; R31 mede texto e não reprova essas medidas. Foco, trilho do switch e marcador ativo são comparados à superfície adjacente visível.

| Par medido | Razão | Leitura |
| --- | --- | --- |
| light · borda do campo / preenchimento | 1,34:1 | abaixo de 3:1 |
| light · borda de foco / preenchimento | 16,92:1 | ≥3:1 |
| light · trilho ativo do switch / polegar | 17,20:1 | ≥3:1 |
| light · marcador ativo / superfície da navegação | 16,21:1 | ≥3:1 |
| light · borda do cartão / corpo | 1,23:1 | abaixo de 3:1 |
| dark · borda do campo / preenchimento | 1,88:1 | abaixo de 3:1 |
| dark · borda de foco / preenchimento | 13,74:1 | ≥3:1 |
| dark · trilho ativo do switch / polegar | 14,71:1 | ≥3:1 |
| dark · marcador ativo / superfície da navegação | 13,74:1 | ≥3:1 |
| dark · borda do cartão / corpo | 2,01:1 | abaixo de 3:1 |

### Paleta categórica realmente desenhada pelo motor

O gráfico recebe quatro âncoras e <code>deriveCategoricalPalette</code> ajusta a paleta antes do desenho. A tabela usa as quatro primeiras cores resultantes; <code>ΔE</code> está como normal / protanopia / deuteranopia entre vizinhas.

| Modo · série | Cor emitida | Contra corpo | Contra cartão | ΔE vizinha N / P / D |
| --- | --- | --- | --- | --- |
| light · 1 | `#9b1c2c` | 7,30:1 | 7,96:1 | — |
| light · 2 | `#9b6a13` | 4,25:1 | 4,63:1 | 17.3 / 18.3 / 11.5 |
| light · 3 | `#941d59` | 7,35:1 | 8,01:1 | 21.1 / 21.8 / 15.7 |
| light · 4 | `#c15001` | 4,29:1 | 4,68:1 | 18.2 / 19.0 / 17.5 |
| dark · 1 | `#d27079` | 5,58:1 | 5,22:1 | — |
| dark · 2 | `#2fa0c6` | 6,14:1 | 5,74:1 | 22.7 / 12.3 / 13.1 |
| dark · 3 | `#b2545d` | 3,81:1 | 3,56:1 | 24.6 / 20.5 / 15.2 |
| dark · 4 | `#a99126` | 5,96:1 | 5,57:1 | 18.4 / 17.9 / 12.3 |

Mínimo das séries contra corpo/cartão: **3,56:1**. Menor ΔE entre séries vizinhas (normal/protanopia/deuteranopia): **11.5**.
Peso do módulo de tema isolado, TypeScript transformado para ESM minificado e gzip nível 9: **3333 bytes gzip** (teto: 4,5 KB). O módulo só tem import de tipo, removido pela transformação; não há dependência runtime no peso isolado.

## 3. Capturas da vitrine

As dez capturas foram geradas de <code>src/</code>, usando fontes reais de <code>dist/fonts</code>, e salvas em <code>node_modules/.cache/capturas-dos-temas/editorial-ink/</code>. Cada arquivo foi aberto e conferido:

- **`editorial-ink__light__sidebar__desktop__telas.png`:** Papel quente, títulos Fraunces e coluna espaçosa; o oxblood marca a série do gráfico enquanto tabela, formulário e conversa preservam a leitura.
- **`editorial-ink__light__sidebar__desktop__modal.png`:** O modal de papel claro destaca serifa, contorno e sombra sobre a vitrine clara desfocada.
- **`editorial-ink__light__topbar__desktop__telas.png`:** A navegação superior mantém o ritmo editorial em uma página contínua; tabela e calendário ficam alinhados à coluna principal.
- **`editorial-ink__light__sidebar__mobile__telas.png`:** A coluna estreita empilha controles e cartões, converte a tabela para linhas compactas e mantém a navegação inferior.
- **`editorial-ink__light__sidebar__mobile__modal.png`:** O modal central ocupa a largura móvel sem perder a hierarquia de título, corpo e ação.
- **`editorial-ink__dark__sidebar__desktop__telas.png`:** A contraparte de tinta escura preserva a serifa e a escala; o oxblood e os dados continuam distinguíveis nas superfícies escuras.
- **`editorial-ink__dark__sidebar__desktop__modal.png`:** O modal escuro mantém cabeçalho, texto e ação em camadas contrastantes sobre a vitrine desfocada.
- **`editorial-ink__dark__topbar__desktop__telas.png`:** A topbar e o conteúdo longo mantêm a hierarquia editorial no modo escuro, incluindo tabela, calendário e conversa.
- **`editorial-ink__dark__sidebar__mobile__telas.png`:** A versão móvel escura conserva os cartões empilhados, a tabela compacta e a navegação inferior.
- **`editorial-ink__dark__sidebar__mobile__modal.png`:** A superfície clara do diálogo contrasta com a página escura e mantém o texto serifado legível.

## 4. O que o tema ensinou

A tabela propõe os destinos da consolidação; skill, GUIA, mapa e usos do schema não foram alterados neste lote D.

| Tipo | Decisão, armadilha ou medida | Destino proposto para a consolidação do lote 25 |
| --- | --- | --- |
| Decisão | A primária é quase neutra (#1c1b1a); o oxblood fica na série do gráfico. A separação mantém a identidade impressa sem transformar todo controle em vermelho e evita colisão de família com os temas atuais. | Nota de conceito; mapa “o que a lib já faz”. |
| Decisão | O painel só aceita passos de entrelinha de 0,1: a ficha pedia 1,75 e o valor executável ficou em 1,7, dentro do contrato. | Skill `ui-criar-tema`; GUIA do importador. |
| Armadilha | `surfaceMaterial: paper` não é uma opção do schema. O teste de contrato apontou o valor; usei `organic`, a opção fosca disponível, para manter o material de papel. | Skill `ui-criar-tema`; `usage` de `surfaceMaterial`. |
| Armadilha | A paleta bruta não é a paleta final do gráfico: `deriveCategoricalPalette` ajusta matiz/luminosidade, contraste contra o fundo e distinção entre séries. A conferência correta é sobre as oito cores emitidas, não sobre os quatro tokens de entrada. | Skill `ui-criar-tema`; mapa “o que a lib já faz”. |
| Medida | R31: 76 pares por modo, sem pulos; menores razões e tabela completa abaixo. Gráfico: 4 primeiras séries verificadas contra corpo e cartão; gzip isolado: 3.333 bytes. | Skill `ui-criar-tema`; `usage` de `primaryColor` e `chartColorPalette`. |

## 5. Achados do arsenal/fluxo e pendência para o revisor

- **Contrato de tokens:** `surfaceMaterial: paper` foi um dos quatro desvios da primeira `tokenContractParity`; o schema só oferece `frosted`, `sleek`, `industrial` e `organic` (`src/core/Design/schema/atmosphere.ts:145,158`). Corrigido para `organic`; a reexecução passou 3/3.
- **Critério #8 da diversidade (navegação): pendente por decisão do executor, conforme orientação do usuário.** A plan exige topbar e sidebar entre os cinco; <code>navigationStyle</code> é funcional em <code>src/core/Design/schema/global.ts:25</code> e <code>mobileNavigationStyle</code> em <code>src/core/Design/schema/global.ts:43</code>. O gate proíbe declarar funcionais no tema e na contraparte (<code>gates/scripts/contrato/helpers/theme-completeness-core.ts:65,76</code>). Nenhuma orientação de navegação foi gravada e o gate foi mantido. Solicito ao revisor ajustar o critério #8 para não exigir variação por tema sob o contrato atual.
- **Outros valores funcionais da ficha não foram copiados:** <code>focusRingWidth</code>, <code>reducedMotion</code> e <code>touchTargetMin</code> são funcionais em <code>src/core/Design/schema/engineering.ts:12,26,39</code>; orientação mobile também é funcional. Seus padrões de fábrica prevalecem. Em <code>high-contrast</code>, os tokens estéticos de duração e <code>pageTransitionType: none</code> mostram movimento ausente sem declarar <code>reducedMotion</code>.
- Os critérios de diversidade **1–7 e 9 passaram**; só o #8 fica por resolver com o revisor. Os temas nascem completos e não entram em <code>themeCompletenessPending.json</code>.
- O medidor global <code>node scripts/measure-consumer-boot.mjs</code> não concluiu no sandbox: esbuild não conseguiu resolver <code>src/index.ts</code> e recebeu acesso negado ao diretório acima do workspace. Para o peso por tema, foi usada a transformação isolada descrita acima. Nenhum build nem <code>dist/</code> foi alterado.
- Consolidação de decisões, armadilhas e destinos deste anexo fica para o lote 25, conforme o modelo da §5.
