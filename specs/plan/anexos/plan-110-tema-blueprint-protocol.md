# Lote 14 — Blueprint Protocol

## 1. Nota de conceito

Prancheta de engenharia: cianótipo escuro, traço fino, grade azul e tipografia monoespaçada. A contraparte usa papel claro com o mesmo desenho técnico. A identidade aparece nas linhas tracejadas dos cartões, nos controles de contorno e no gráfico de linha sem suavização.

## 2. Medições

| Medida | Resultado |
|---|---:|
| Tokens estéticos no modo principal | 301, incluindo `mode` |
| Tokens estéticos `modeDependent` na contraparte | 104, mais `mode` |
| Tokens funcionais declarados | 0; 20 valores funcionais legados removidos |
| R31 — menor contraste textual, escuro | `statusErrorColor` / cartão: **4,699:1** |
| R31 — menor contraste textual, claro | `navItemActiveColor` / corpo: **4,671:1** |
| Contraste não textual mínimo da paleta categórica no fundo da página | escuro **3,042:1** · claro **3,059:1** |
| Peso isolado, minificado | 11.598 B |
| Peso isolado, gzip -9 | **3.561 B**, abaixo do teto de 4,5 KB |

A paleta categórica do gráfico usa cores de marca, não estados. Os mínimos estimados no fundo da página ficam acima de 3:1; a suíte `categoricalPalette.test.ts` passou na execução de tema (93 testes aprovados; uma falha de paridade estática do catálogo).

## 3. Capturas abertas e conferidas

Geradas a partir de `src/`, com Chromium de `node_modules/.cache/ms-playwright` via `PLAYWRIGHT_BROWSERS_PATH` absoluto e fontes reais lidas de `dist/fonts` em modo somente leitura. Cada imagem foi aberta e comparada à nota de conceito.

| Captura | Conferência contra o conceito |
|---|---|
| `node_modules/.cache/capturas-dos-temas/blueprint-protocol/blueprint-protocol__dark__sidebar__desktop__telas.png` | O cianótipo, a grade branca, a tipografia monoespaçada e as bordas tracejadas comunicam uma prancheta técnica; gráfico e tabela mantêm a composição compacta. |
| `node_modules/.cache/capturas-dos-temas/blueprint-protocol/blueprint-protocol__dark__sidebar__desktop__modal.png` | O modal escuro repete a linha tracejada no contorno e nas divisões internas, preservando a assinatura do tema. |
| `node_modules/.cache/capturas-dos-temas/blueprint-protocol/blueprint-protocol__dark__topbar__desktop__telas.png` | A grade se estende pelo fundo sem encobrir os controles; a topbar deixa a área de desenho ampla. |
| `node_modules/.cache/capturas-dos-temas/blueprint-protocol/blueprint-protocol__dark__sidebar__mobile__telas.png` | A coluna móvel preserva títulos monoespaçados, campos de contorno e cartões de canto curto; a tabela se reorganiza em blocos. |
| `node_modules/.cache/capturas-dos-temas/blueprint-protocol/blueprint-protocol__dark__sidebar__mobile__modal.png` | O modal cabe na largura móvel e mantém o contorno tracejado sobre o fundo cianótipo. |
| `node_modules/.cache/capturas-dos-temas/blueprint-protocol/blueprint-protocol__light__sidebar__desktop__telas.png` | A contraparte clara parece papel de desenho; as linhas tracejadas dos cartões e os controles azuis continuam visíveis, mas a textura branca do fundo se mistura ao papel. |
| `node_modules/.cache/capturas-dos-temas/blueprint-protocol/blueprint-protocol__light__sidebar__desktop__modal.png` | O modal branco se separa do fundo claro com borda tracejada azul e sombra discreta. |
| `node_modules/.cache/capturas-dos-temas/blueprint-protocol/blueprint-protocol__light__topbar__desktop__telas.png` | A topbar mantém o espaço horizontal enquanto linhas finas, formulário e gráfico compõem a folha de engenharia. |
| `node_modules/.cache/capturas-dos-temas/blueprint-protocol/blueprint-protocol__light__sidebar__mobile__telas.png` | Em celular, campos e cartões ficam em coluna; títulos e marcadores retêm o azul de projeto sem ornamento excessivo. |
| `node_modules/.cache/capturas-dos-temas/blueprint-protocol/blueprint-protocol__light__sidebar__mobile__modal.png` | O diálogo cabe no celular e conserva o cabeçalho técnico e a divisória tracejada. |

## 4. O que o tema ensinou

| Item | Tipo | Conclusão | Destino proposto |
|---|---|---|---|
| Primária azul usada como texto | Armadilha | A primária da ficha `#5b8fc4` mede 2,83:1 no cartão e 3,37:1 no corpo escuro. `#8eb9e8` eleva o menor par final do tema a **4,699:1** sem sair da família azul. | `ui-criar-tema` §5.7 e uso de `primaryColor`, consolidação do lote 25 |
| Cores de estado no cianótipo | Decisão | `statusErrorColor`/`inputErrorColor` `#ff9a8b` e `statusSuccessColor` `#34d399` passam 4,5:1 sobre as superfícies escuras. | `ui-criar-tema` §5.7, consolidação do lote 25 |
| Textura entre modos | Armadilha | `texture` não carrega modo; `blueprint-pro` fica nos dois modos. A contraparte usa `textureColor: #ffffff`, então o padrão de fundo se mistura ao papel claro; a ficha esperava `blueprint` azul. | `ui-criar-tema` §5.7, consolidação do lote 25 |
| Reservas repetidas `var(--x, F)` | Receita | Os dois fallbacks repetidos foram alinhados ao `defaultValue` dos tokens correspondentes; o contrato conferiu 2.998 reservas no conjunto. | `ui-criar-tema` §5.7, consolidação do lote 25 |
| Paleta de gráfico | Medida | Contraste mínimo no fundo: 3,042:1 escuro e 3,059:1 claro, acima do limite não textual de 3:1. | A8 no anexo de direção de arte |

## 5. Achados do arsenal ou do fluxo

1. A primária `#5b8fc4` da ficha (§7.9) não serve como texto nas superfícies do modo escuro: 3,37:1 no corpo e 2,83:1 no cartão. A primária textual foi ajustada para `#8eb9e8` em `src/core/Design/presets/themes/blueprint-protocol.ts:314`; `btnPrimaryBg` permanece independente em `:276`. O menor par R31 final no escuro mede 4,699:1.
2. A ficha pede `sidebarPosition: right`, `mobileNavigationStyle: drawer` e uma textura diferente na contraparte (§7.9, `specs/plan/anexos/plan-110-direcao-de-arte.md:422`). Os dois primeiros são funcionais e não foram declarados; `texture` é estático e, portanto, `blueprint-pro` permanece nos dois modos. A textura desenha no escuro, mas fica sem contraste no papel branco. É divergência visual não essencial, evidenciada nas duas capturas claras.
3. A ficha escolhe `cardHoverStyle: glow-only`, opção existente e válida; não foi necessário substituir uma variante por ausência de suporte.
4. A paridade do catálogo gerado fica para a atualização única do revisor: `themeCatalogParity.test.ts:44` acusa metadados antigos em `src/core/Design/presets/themes/catalog.generated.ts:23`. Não rodei `themes:catalog`, conforme o modelo dos lotes 8–24.

### Resumo do executor

Tema completo nos dois modos, fora da exceção, sem tokens funcionais e com 3.561 B gzip. R31 passou nos dois modos, e a paleta categórica supera 3:1. As dez capturas foram abertas e conferidas; cianótipo, papel técnico, contornos tracejados e tipografia mono aparecem nas duas superfícies. A textura de fundo branca quase desaparece sobre papel branco por ser estática; a divergência ficou registrada. A cor de primária textual foi clareada para atender AA.

### Correção do veredito de 2026-10-18

O veredito reprovou `motionDurationSlow` 0,32 fora da grade. Ajustei para 0,30 s, preservando a duração pretendida e alinhando ao passo do token. A rechecagem R31 após os ajustes dos temas cobriu 76 pares; este tema passa nos dois modos, sem reprovação nem par pulado.
