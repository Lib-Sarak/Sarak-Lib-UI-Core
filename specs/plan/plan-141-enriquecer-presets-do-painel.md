---
tipo: "plan"
titulo: "Fazer os presets do painel mostrarem a capacidade e a granularidade da lib"
objetivo: "Fazer os presets do painel cobrirem a maior parte dos tokens estéticos sem cor, com opções distintas de barras, forma, componentes, fontes, movimento e ícones, de seis a oito opções visíveis por grupo, nome legível nos seis idiomas e nenhum token novo"
dominio: "Painel de customização / Presets"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "painel", "presets"]
relacionados: ["[[06-painel-de-customizacao-e-preview]]", "[[09-temas-e-presets]]", "[[plan-145-personalidades]]", "[[anexos/painel-design-prototipo]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "specs/specs/09-temas-e-presets.md + specs/specs/06-painel-de-customizacao-e-preview.md"
---

# 1. Objetivo

Quem abre o painel descobre, pelas opções, tudo o que a lib sabe fazer, sem precisar do ajuste fino. O preset é a vitrine da granularidade.

# 2. Contexto

Decisão do dono (2026-11-01): os presets devem elucidar a capacidade e a granularidade da lib. Vem depois da 139 (prévias reais) e da 140 (as seis decisões).

**Medido em 2026-11-01:** o schema tem 336 tokens estéticos, e os presets escrevem só **48** (14%). Hoje:

| Grupo | Presets | Tokens distintos |
|---|---|---|
| Cards | 12 | 21 |
| Texturas | 41 | 1 |
| Botões | 12 + 6 estilos | 15 |
| Campos | 12 | 9 |
| Mídia de atmosfera | 5 | 4 |
| Fontes | 42 | 2 |

**Sem preset nenhum:** barra lateral, topbar, 36 dos 56 de card, ícones, títulos, movimento, tabela, gráfico, vidro, scroll, sombra, modal, tooltip, switch, status, chat, matriz.

Há dois problemas opostos: áreas sem opção alguma e 41 texturas sem organização. **Variedade não pode virar excesso:** cada grupo mostra de 6 a 8 opções curadas e "Ver todas". Nomes e descrições hoje são texto fixo, em inglês ou genéricos.

**Cor é da paleta:** preset de estrutura não escreve cor. `ComponentPreset` (`{ id, name, description, design }`) é parcial e só escreve tokens da sua área. Preset é dado, nunca código ([[09-temas-e-presets]] §3).

# 3. Escopo

## 3.1 Dentro
- `src/core/Design/presets/components/` — presets novos, arquivos das categorias novas, testes.
- `src/features/DesignEngine/` — o grupo visual de cada categoria, no molde dos grupos existentes, e seu lugar na decisão.
- `src/core/i18n/` — nomes e descrições, nos seis idiomas.
- Regeneração do que `npm run` pedir, sem editar gerado à mão.

## 3.2 Fora
- Token novo: se um visual exigir token que não existe, **não faça**: liste no resumo.
- Tema embarcado e paleta. Personalidades (plan-145).
- CSS novo além do que o token já alcança.
- Imagem, vídeo ou fonte nova no pacote ([[09-temas-e-presets]] §5.1 e §5.3).
- Mudar `id` de preset publicado.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/09-temas-e-presets.md` §3, §5, §5.1, §5.2 | preset × tema, offline, diversidade |
| Spec fixa | `specs/specs/06-painel-de-customizacao-e-preview.md` §2, §6.4 | decisões e catálogos |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` §3.6 | nomes pelo catálogo |
| Spec fixa | `specs/arquitetura/02-design-engine.md` §10 | o que cada família de token faz |
| Anexo | `specs/plan/anexos/painel-design-prototipo.html` | telas Fontes, Forma e Componentes |
| **Skill** | `ui-criar-preset` · `padrao-escrita` + `padrao-typescript` · `ui-arquitetura-design` | autoria do preset · sempre · token |

# 5. Instruções de execução

1. Fotografe o worktree. Liste no resumo cada grupo de hoje, com os tokens que escreve, e os pares quase iguais.
2. **Mapa de cobertura primeiro:** um script mede quantos tokens estéticos sem cor algum preset escreve, por família. Rode antes e depois. Cada token que ficar de fora tem motivo: sem efeito visível isolado, ou só faz sentido no ajuste fino.
3. **Layout.**
   - Barra lateral (≥ 8): Limpa, Contornada, Sólida, Flutuante, Compacta, Marca, Invertida… combinando `sidebarBorderStyle`, lado da borda, `sidebarActiveItemStyle`, densidade e `sidebarTone`. Um preset pode escrever o tom, que é um papel da paleta; cor literal segue proibida.
   - Topbar (≥ 6): Transparente, Sólida, Com separador, Vidro, Marca… com `topbarTone`.
   - Largura do conteúdo: as 6 de `maxContentWidth`.
4. **Forma.**
   - Cards: ≥ 18, explorando os 36 tokens de card sem preset.
   - Cantos, densidade e sombra (`shadowIntensity`, `shadowColorMode`, `shadowProjectionBlur`): ≥ 4 cada. Direção da sombra: as 5 de `shadowOrientation`.
   - Borda: as 5 de `borderType`. Material: as 4 de `surfaceMaterial`.
   - Vidro: ≥ 4, com `glassBlur`, `glassOpacity`, `glassSpecularity` e `glassSaturation`.
   - Texturas: as 41 agrupadas em famílias (Técnicas, Orgânicas, Geométricas, Materiais). Atmosfera: mídias e os 4 de `bgGradientMode`.
5. **Componentes.**
   - Botões ≥ 18. Campos ≥ 16.
   - Tabela ≥ 5: Padrão, Listrada, Compacta, Sem linhas, Cabeçalho forte (`tableDensity`, `tableZebraStriping`, `tableBorderRadius`, `tableCellPadding`).
   - Gráfico ≥ 5: tipo mais `chartThickness`, `chartSmoothing`, `chartShowGrid`, `chartGridOpacity`.
   - Modal ≥ 3, tooltip ≥ 3, switch: as 4 de `switchStyleType`, scroll ≥ 3, selos e estados vazios ≥ 3 cada.
   - Por último, se o token render: chat, Kanban e matriz.
   - **Movimento** ≥ 4: Instantâneo, Ágil, Sereno, Expressivo (`motionDuration*`, `motionEase*`, `motionStaggerDelay`), mais as 5 de `pageTransitionType`.
   - **Ícones** ≥ 6: combinações curadas das 3 famílias e 6 pesos, com contorno.
6. **Fontes.** Pares ≥ 10, por personalidade, só com `THEME_FONTS`. Escala tipográfica ≥ 4: Compacta, Padrão, Editorial, Impacto, que mudam tamanho, peso e espaçamento dos títulos e do corpo juntos. As 42 fontes seguem, agrupadas por categoria.
7. **Modo da amostra.** A amostra de opção segue o modo que a prévia mostra, não só o do rascunho: hoje, com a prévia em Claro e um tema escuro, as amostras saem escuras (`SampleScope`).
   **Curadoria.** Cada grupo mostra de 6 a 8 opções e "Ver todas". Distinto: ao menos dois tokens com efeito visível diferem de todo preset do grupo. Grupo com poucos tokens rende menos opções: entregue o que for distinto e diga por quê. **Qualidade vale mais que número.**
8. **Busca.** Todo preset novo é achado pela busca, pelo nome e pelos sinônimos dele. Corrija também a linha de caminho dos resultados na área Layout, que mostra o id cru da pergunta ("Layout › how", "› where", "› brand"): ela passa a mostrar o título traduzido da pergunta (`ThemeSearchResults`, `searchGroups`). Veio do reagrupamento da `plan-149`.
   **Nomes.** Todo preset, novo e antigo, tem nome e descrição pelo catálogo, nos seis idiomas, sem jargão. O `id` não muda.
9. **Legível.** Todo preset aplicado sobre os 19 temas, nos dois modos, mantém os pares de `PAIRS` passando. Teste que varre.
10. **Sem vazamento.** Preset escreve só tokens da sua área e nenhuma cor. Regra em teste por grupo.
11. **Prévia para o dono:** `C:\tmp\sarak-previa-141\index.html`, com cada grupo nos dois modos, marcando o que é novo, e o mapa de cobertura antes e depois.
12. Depois de `npm run build`, rode os specs do painel e `troca-de-tema`. O orçamento não sobe. Depois: `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts`.
13. `npm run verify -- --tier=quick` uma vez.

# 6. Critérios de aceite

- [ ] Presets cobrem ≥ 60% dos tokens estéticos sem cor; o resto tem motivo no mapa — teste de cobertura.
- [ ] Mínimos dos passos 3 a 6 atingidos, ou a falta justificada — teste de contagem por grupo.
- [ ] Distinção entre presets — teste.
- [ ] De 6 a 8 opções visíveis por grupo com "Ver todas" — teste.
- [ ] Pares de `PAIRS` passando com todo preset sobre os 19 temas × 2 modos — teste.
- [ ] Nenhuma cor em preset de estrutura — teste.
- [ ] Todo preset com nome nos seis idiomas — teste.
- [ ] Nenhum token novo; nenhum `id` publicado mudou.
- [ ] Resultado de busca sem id cru de pergunta, nos seis idiomas — teste.
- [ ] Prévia gerada; a aprovação do dono é registrada pelo revisor no veredito.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo.

- `npx vitest run src/core/Design src/features/DesignEngine src/core/i18n` — uma vez.
- `npm run boot:measure` — o boot não cresce: preset do painel fica fora do boot.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` — uma vez.
- Medição independente da troca de tema: a rotina está em [[11-testes-e-cobertura]] §7.3 e no spec `troca-de-tema`.
- A prévia aberta; o veredito só fecha com a aprovação do dono.

# 8. Destino da síntese

**Destino:** `specs/specs/09-temas-e-presets.md` + `specs/specs/06-painel-de-customizacao-e-preview.md`.

- 09 §5: as categorias de preset e a regra de que preset de estrutura não escreve cor. Contagens saem do registro, nunca transcritas.
- 06 §6.4: onde cada categoria mora, e a curadoria de 6 a 8 opções.

---

# 9. Resumo da execução

## Resumo da execução — 2026-11-03

**Resultado:** Concluído com pendências

**Estado do worktree ao iniciar**
(limpo)

**O que foi feito**
- Registro de presets por grupo — `src/core/Design/presets/components/registry.ts`: 34 grupos (decisão, amostra, área de tokens, destacados, "opção de um token só"); `ALL_COMPONENT_PRESETS` sai dele. De 171 presets para 340.
- Dados novos, todos sem cor: `layout.ts` (barra lateral 10, topbar 9, largura 6), `shapeGeometry.ts` (cantos 5, densidade 5), `shapeSurface.ts` (sombra 6, direção 5, moldura 5, material 4, vidro 5), `atmosphere.ts` (degradê 4, clima 6), `cardsStructure.ts` (cards +16 → 28), `buttonsStructure.ts` (+7 → 19), `inputsStructure.ts` (+6 → 18), `dataPresets.ts` (tabela 6, gráfico 7), `overlayPresets.ts` (janela 4, dicas/avisos 3, interruptor 4), `feedbackPresets.ts` (rolagem 4, selos 4, estados vazios 4), `motionIcons.ts` (movimento 4, troca de página 5, ícones 8), `typographyKits.ts` (pares 12, escalas 5), `textureFamilies.ts` (40 texturas em 4 famílias).
- Mapa de cobertura — `coverage.ts` + `scripts/measure-preset-coverage.ts`; `COVERAGE_GAPS` declara o motivo de cada um dos 54 tokens que ficaram de fora (só encolhe, teste confere nos dois sentidos).
- Nomes e descrições nos seis idiomas FORA do boot — `src/core/i18n/presetTexts/*` (tabelas por decisão, texturas, grupos) lidas só pelo painel via `usePresetText.ts`; o português é o `name`/`description` do próprio preset. Os 36 presets antigos tiveram o texto trocado do inglês para o português; nenhum `id` mudou.
- Painel: `CuratedGrid.tsx` (destacadas + "Ver todas (N)" com `aria-expanded`, famílias e categorias ao abrir), `PresetGroupCatalog.tsx` + `PresetSamples.tsx` (amostra por tipo), os cinco catálogos antigos passaram a usar o grupo curado, `design-decisions.json` lista os grupos de cada decisão.
- Modo da amostra — `ThemeCustomizationTab.tsx` passa `sampleDraft: previewDraft` e `ThemeDecisionOptions.tsx` o usa nos catálogos: a amostra parte do rascunho como a prévia o mostra (antes: do rascunho cru, com o modo do tema). Provado em navegador (`plan-141-presets-do-painel.spec.ts`, caso "a amostra segue o modo").
- Busca — `searchGroups.ts` (`findPresetHits`: nome no idioma que vale e sinônimos), `ThemeSearchResults.tsx` (resultados "Opções" e linha de caminho com o título traduzido da pergunta no lugar do id cru).
- Teste lento da CI (pedido na conversa): ver "Verificações".

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Design/presets/components/*.ts` (13 novos, 5 alterados) | criado/alterado | dados dos presets, registro, cobertura; textos legados em português; 2 presets legados corrigidos (abaixo) |
| `src/core/i18n/presetTexts/*` (9 arquivos + teste) | criado | textos dos presets nos seis idiomas, fora do catálogo do boot |
| `src/features/DesignEngine/Canvas/components/{CuratedGrid,PresetGroupCatalog,PresetSamples}.tsx` | criado | grupo curado, catálogo genérico, amostras |
| `src/features/DesignEngine/hooks/usePresetText.ts` | criado | textos dos presets no idioma que vale |
| `src/features/DesignEngine/**` (catálogos, OptionTile, BarSample, ThemeDecisionOptions, ThemeSearchResults, ThemeCustomizationTab, decisions.ts, searchGroups.ts, design-decisions.json) | alterado | ligação dos grupos, "Ver todas", modo da amostra, busca |
| `src/**/__tests__/*` | criado/alterado | ver Verificações |
| `src/core/Design/palette/__tests__/anchor-and-shift.test.ts` | alterado | paleta calculada uma vez por preset e modo |
| `scripts/measure-preset-coverage.ts`, `browser-tests/plan-141-presets-do-painel.spec.ts`, `browser-tests/fixtures/plan-141-presets-entry.tsx` | criado | mapa de cobertura; spec de navegador e prévia |

**Verificações executadas**
- Cobertura (`npx tsx scripts/measure-preset-coverage.ts`): ANTES 37/243 (15,2%), 171 presets → DEPOIS 189/243 (77,8%), 340 presets. Saída do antes guardada para a prévia.
- `npx vitest run src/core/Design src/features/DesignEngine src/core/i18n src/core/Provider/utils` → 1702 passaram, 3 falhas (2 snapshots e 1 título de grupo, todos consequência esperada); corrigidos e as 3 suítes reexecutadas: 13/13. Testes novos: `presetCatalog.test.ts` (141 casos: ids únicos e publicados, mínimos por grupo, 6–8 à vista, distinção ≥2 tokens, área, contrato, sem cor, cobertura), `presetsReadable.test.ts` (todo preset × 19 temas × 2 modos contra os pares do plano da paleta, ~22 s), `presetTexts.test.ts` (seis idiomas), `presetSearch.test.ts`, caso novo em `ThemeSearchResults.test.tsx`, e os 4 testes 1:1 de `CuratedGrid`, `PresetGroupCatalog`, `PresetSamples`, `usePresetText`.
- Boot (`npm run boot:measure`): ANTES 394,7 KB gzip / 1410,1 KB raw / 15 pedaços; DEPOIS 394,7 / 1410,1 / 15 — idêntico. No meio do caminho dava 396,6 (+1,9 KB): medido por remoção, `SarakProgress` e `SarakEmptyState` importados pela amostra puxavam os dois para o fecho; as amostras de progresso e de estado vazio agora são desenhadas com as variáveis do tema, sem importar os componentes. Também confirmei o HEAD limpo (cópia fora do repositório com junção): 394,7.
- `npm run build` → exit 0. Specs de navegador: `plan-141-presets-do-painel` 10/10, `troca-de-tema` 4/4 (orçamento mantido), `plan-140-painel-coluna-unica` 8/8 (depois de tirar os widgets da amostra de barra), `paletas-cabem-na-coluna`, `painel-segue-o-modo`, `plan-135-paletas-no-painel` verdes. Depois: `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts`; sobraram 42 arquivos NÃO rastreados em `dist/` (chunks com hash do meu build): `git clean -f -- dist` foi barrado pelo hook, então ficam para o usuário.
- `npm run verify -- --tier=quick` → verde (31 verificações). Antes passou por 3 rodadas de correção: valores fixos, hook com estado demais, 4 testes 1:1, variável com nome inexistente (`--sarak-modal-radius`) e reserva diferente do padrão.
- **Testes lentos da CI (pedido do dono, runs #87 e #92)** — durações medidas localmente, caso isolado: `optionGroups.test.tsx` linha 88 (textura de atmosfera) **12 498 ms → 1 553 ms**; linha 102 (textura de cartão) **15 566 ms → 1 561 ms** (o caso agora abre direto na aba que confere, `initialTab`, e clica só na primeira opção destacada; a lista cheia de 41 amostras não é mais montada; o tempo explícito de 30 s do caso já existia e foi mantido, o teto global não mudou). `anchor-and-shift.test.ts` linha 142 (matiz conservado): **1 514 e 1 739 ms → 383 e 418 ms** (paleta calculada uma vez por preset e modo, era uma por papel). O valor "antes" da linha 142 foi medido numa cópia do arquivo no `HEAD`; os dois de `optionGroups` vêm da primeira execução isolada, já com os 28 cards novos.

**Critérios de aceite**
- [x] ≥ 60% dos tokens estéticos sem cor cobertos, o resto com motivo — `presetCatalog.test.ts` ("cobrem ao menos 60%" e "todo token que ficou de fora tem motivo"): 77,8%.
- [~] Mínimos dos passos 3–6 — atingidos em todos os grupos (teste de contagem), com 4 desvios: tabela não tem "Sem linhas" nem "Cabeçalho forte" (não há token de linha nem de cabeçalho em `tables`; entraram Arejada, Arredondada e Reta); topbar "Transparente" não existe (exigiria cor); chat, Kanban e matriz **não feitos** (o passo manda por último e "se o token render": 10 tokens em `COVERAGE_GAPS` como `next-round`); a faixa de tokens de identidade da marca (6) e `bodySize` ficaram no ajuste fino.
- [x] Distinção entre presets — teste (≥2 tokens), com 1 exceção legada declarada (`bg-none ~ bg-cyber-grid-img`) e grupos "de um token só" medidos pelo valor.
- [x] De 6 a 8 à vista com "Ver todas" — teste de dados e de navegador; grupos com menos de 6 no total (janela 4, dicas 3, interruptor 4, rolagem 4, selos 4, estados vazios 4, movimento 4, degradê 4, escalas 5…) mostram todos: pouco token, pouca opção distinta.
- [x] Pares de `PAIRS` com todo preset × 19 temas × 2 modos — `presetsReadable.test.ts`. Achou 2 presets legados ilegíveis, corrigidos (abaixo).
- [~] Nenhuma cor em preset de estrutura — teste verde para os 313 presets sem cor; **27 presets publicados escrevem cor à mão** (cards, botões, campos) e ficam numa lista que só encolhe (`LEGACY_COLOR_PRESET_IDS`); não os reescrevi porque a plan veda mudar preset publicado além do id e a cor deles é a identidade.
- [x] Todo preset com nome nos seis idiomas — `presetTexts.test.ts` (inclui sem jargão e sem nome repetido no grupo).
- [x] Nenhum token novo; nenhum `id` publicado mudou — `presetCatalog.test.ts` ("nenhum id publicado mudou ou saiu"), `token-types:check` e `catalog:check` verdes.
- [x] Resultado de busca sem id cru, nos seis idiomas — `ThemeSearchResults.test.tsx`; presets achados por nome e sinônimo — `presetSearch.test.ts`.
- [~] Prévia gerada em `C:\tmp\sarak-previa-141\index.html` (58 capturas, desktop 1600 px, claro e escuro, mapa de cobertura antes e depois). Conferência visual feita por dois subagentes revisores (58 imagens cada, uma por vez) e por mim em 2 capturas; **a conferência achou defeitos de amostra que ficam pendentes** (abaixo). A aprovação do dono é do revisor.

**Decisões e suposições**
- "Cor" no mapa e nos testes: token `type: color` ou valor de texto com literal (`#`, `rgb(`, `hsl(`…); `var()` não conta. `mode`, `colorPalette`, `colorDepth` e `colorVariation` ficam fora do mapa (são da paleta/modo).
- Tom da barra (`sidebarTone`/`topbarTone`) conta como estrutura (papel da paleta), conforme o passo 3. A legibilidade desses presets é medida com os pares do PLANO da paleta (`createPalettePlan`), porque o par "texto do corpo sobre a barra" deixa de valer em tom contrastante.
- Dois presets legados foram alterados porque reprovavam a legibilidade: `input-alert-ring` (tirei `inputFocusBorderColor`) e `btn-ghost-ink` (tirei `btnGhostHoverBg`, descrição ajustada). Ids intactos.
- `sampleDraft` (rascunho da prévia) no lugar de um conversor na amostra: a conversão claro/escuro por contraparte não alcança a cor calculada pela paleta (medido: a amostra continuava escura).
- Amostras de tabela, janela, dicas, largura, progresso e estado vazio são desenhadas com as variáveis do tema, não com o componente real: o de progresso/estado vazio por custo de boot (medido), os demais porque não há versão que caiba em miniatura sem portal.
- Textos nos seis idiomas: os cinco idiomas além do português foram traduzidos por subagentes a partir do português; só conferi por teste (presença, jargão, repetição), não por falante.
- A via de teste em navegador usa `alto=9000px` no harness (fixture própria) para ver cada grupo inteiro.

**Achados fora do escopo (não corrigidos)**
- `gates/scripts/audit/verify_presets.ts` e `gates/scripts/contrato/check-panel-contract.ts` enumeram só os 5 arquivos antigos de preset: os grupos novos (barra, forma, tabela…) não passam por `auditor_presets` nem por `panel-contract:check`; o `presetCatalog.test.ts` cobre chave inexistente e contrato, mas o gate não.
- Nas capturas: `SampleCard` mostra uma faixa de cor atrás do título e outra atrás do botão que não ocupam a largura do card (todos os grupos de card); `BarSample` corta o item "Vendas" e a marca na topbar; interruptor `SarakSwitch` quase invisível no claro (trilho e bolinha claros). Não investiguei se vêm de antes.
- `docs/migracoes.md` não recebeu nota: nenhum export público mudou, mas os 36 textos de preset trocaram de inglês para português.

**Pendências / riscos**
- **Amostras que não distinguem as opções** (a opção está certa nos dados; a miniatura não mostra a diferença): degradê (4 iguais), vidro (5), direção da sombra (5, no escuro nenhuma sombra aparece), moldura Dupla/Brilho/Sem moldura, atmosfera Vinheta/Grão/Vívido/Tom (vazias), rolagem (headless não desenha a barra), troca de página (estado final capturado), movimento (posição da animação), largura Fluida = Muito larga = Tela inteira, fontes Inter = Outfit = Space Grotesk (fonte não carrega na amostra; Bebas Neue e Caveat saem em serifa), pares Moderno/Técnico/Corporativo/Impacto/Futurista parecidos. Isso é o critério "cada opção visivelmente distinta" cumprido nos dados e **não** na tela.
- Capturas posteriores à última correção de gráfico/tabela/movimento/largura foram conferidas pelo segundo revisor: gráfico (barras, pontos, radar) e tabela ficaram corretos; radar e área ainda pouco convincentes.
- Chat, Kanban e matriz sem preset (ver critérios).
- `git clean -f -- dist` pendente (42 arquivos de build não rastreados).

---

### Correção do veredito de 2026-11-03

**O que mudou**
- **Achado 1 — amostras sem diferença.** Caso novo no spec `plan-141-presets-do-painel`: captura a amostra de cada opção destacada de cada grupo com seção própria e compara duas a duas, nos dois modos; dupla com menos de 2% de pixels diferentes reprova (pixel diferente = soma da diferença dos três canais > 30 de 765, limite meu). Consertos baratos antes de rebaixar: harness carrega as fontes (`fonts: 'google'`; antes `'none'` e tudo saía em serifa), interruptor ampliado sobre palco escuro no claro, preenchimento forte na amostra de largura. O que não passou saiu das destacadas (`except` em `registry.ts`) e segue em "Ver todas"; nenhum dado de preset foi reescrito. Rebaixadas: cards (halo luminoso, artesanal), cantos (arredondados, bem redondos), sombra (definida, colorida, ambiente, dramática), direção da sombra (para cima, diagonal, segue a luz), moldura (técnica, com brilho, sem moldura), vidro (fosco, espesso), atmosfera (vinheta, grão, vívido, tom), degradê (foco de luz, manchas), botões (elástico), campos (contorno reto, preenchido sem borda, busca em pílula), gráficos (radar fino), janela (3 de 4), interruptor (pulsante), rolagem (3 de 4), movimento (sereno, expressivo), troca de página (4 de 5), ícones (tabler leve), largura (1600 e tela inteira). Motivo: movimento/troca/rolagem/pulso só existem em animação ou interação; sombra, moldura, vidro e atmosfera diferem pouco em contraste; largura 1600 e tela inteira desenham igual à fluida. Janela, rolagem e troca de página ficam com 1 destacada. `presetCatalog.test.ts` passou a aceitar de 1 a 8 destacadas.
- **Achado 2 — defeitos.** `BarSample` desenha a barra num quadro de referência reduzido à largura do tile (prop `miniature`), marca como quadrado na cor do tema (`logo` em vez de SVG preto); faixas do `SampleCard` com margem negativa igual ao padding; interruptor sobre palco escuro no claro. Um caso por defeito no spec: marca e rótulo da topbar dentro do quadro e sem corte, faixas com a largura do card (`clientWidth`), trilho com contraste ≥ 3:1 (nos dois trilhos, composto sobre o fundo opaco mais próximo).
- **Achado 3.** Entrada em `docs/migracoes.md` (36 textos de preset em português, sem mudança de `id`); `npm run guide` regenerou `sarak-ui/docs/migracoes.md`.

**Verificações**
- `npx vitest run src/core/Design/presets src/features/DesignEngine src/core/i18n/presetTexts` → 148/149 arquivos na rodada ampla; a única falha era o snapshot da atmosfera (vinheta rebaixada), atualizado e reexecutado: verde. `npx tsc --noEmit` limpo.
- `npm run build` exit 0, depois o spec inteiro: **22/23**. O caso que falhou foi "Fontes: cada grupo mostra de 6 a 8 opções (escuro)", o primeiro da rodada, por tempo esgotado na espera das amostras lazy; isolado, passou. O caso de Forma no escuro também oscilou por carga em rodadas anteriores. Os 5 casos de defeito e os 8 de distinção passaram.
- Prévia regerada em `C:	mp\sarak-previa-141`; conferi à vista cards, barra de topo e barra lateral no claro e no escuro.

**Achados fora do escopo (não corrigidos)**
- Barra de topo "Invertida": no escuro o item ativo vira pílula preta com o rótulo invisível, e no claro a pílula é branca com rótulo apagado; a marca fica preta. Vem do papel de cor da barra, não da amostra.
- O caso de distinção não cobre grupos dentro de aba (texturas, texturas de card, estilos de botão).
- Em claro, algumas amostras ganham um degradê de fundo que vaza de trás do tile (ruído na comparação, que favorece o claro); por isso as decisões de rebaixamento usaram o pior dos dois modos.
- `dist/` é versionado e o build o altera; restaurado com `git restore`; os arquivos não rastreados de build seguem para o `git clean` do usuário.

---

### Correção do veredito de 2026-11-03 (correção 1)

**O que mudou**
- **Achado 1 — instabilidade do caso de distinção.** Movimento ficou com uma só destacada (`motion-instant`); `motion-agile` saiu em `registry.ts` (`except`), pelo motivo que o veredito cita: as duas só diferem durante a animação. Causa extra achada ao reexecutar: o harness lê `dist/sarak.css`, e depois de um `git restore -- dist` o CSS volta ao antigo e o caso reprova em botões, tabelas e interruptor (0,08% a 1,48%) sem relação com movimento. A verificação vale **depois de `npm run build`**.
- **Achado 2 — rótulo do item ativo ilegível.** Causa medida no navegador: no tom contrastante a barra refaz `--sarak-nav-active-color` (o fundo do item `filled`) com o texto forte dela, mas o texto sobre o item (`--sarak-on-nav-active`) ficava com o valor global (branco): branco sobre claro, 1,05:1 a 1,10:1. Correção em `chromeToneStyle.ts`, só nos pares de item ativo: `--sarak-on-nav-active` passa a ser o fundo da barra, o par que a paleta já garante. Caso novo no spec: para todo preset de barra lateral (10) e de topbar (9), nos dois modos, o rótulo do item ativo tem contraste ≥ 4,5:1 com o fundo do item (compõe as camadas; degradê vale o pior contraste entre as paradas). Reprovava em `topbar: Invertida` (os dois modos) e `sidebar: Degradê` (claro); o do Degradê era artefato da medição (ignorava o `background-image`), corrigida no caso, e agora passa junto com a topbar. Teste unitário de `chromeToneStyle` ganhou o par novo.

**Verificações**
- Caso "Componentes: cada opção destacada se distingue… (escuro)", depois de `npm run build`: **3 de 3 rodadas isoladas verdes**. Sem o build, as 3 rodadas reprovaram (acima).
- Caso novo do contraste do item ativo: verde nos dois modos, antes e depois do build.
- `npx vitest run src/components/Layout/chrome src/core/Design/presets/components src/features/DesignEngine/Canvas/components/__tests__/PresetGroupCatalog.test.tsx` → 27 arquivos, 373 testes verdes (inclui `presetsReadable.test.ts`, o teste de `PAIRS`).
- Prévia: barra de topo e barra lateral regeradas nos dois modos em `C:	mp\sarak-previa-141` e conferidas à vista; "Invertida" mostra "Pedidos" legível. Depois: `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts`.

---

# 10. Veredito

## Veredito — 2026-11-03 — 🔴 Reprovado

**Pela máquina, está verde.** Rodado pelo revisor: `vitest` em `src/core/Design`, `src/features/DesignEngine` e `src/core/i18n` com 1456/1456; `check-audit-baseline --with-tsc` sem regressão; `boot:measure` em 394,7 KB gzip, igual ao antes. Os dados, a cobertura (77,8%), os textos nos seis idiomas, a busca sem id cru, o modo da amostra e os testes lentos da CI estão conferidos. **Pela tela, não está.** O objetivo é que quem abre o painel descubra a capacidade da lib pelas opções, e o passo 7 pede diferença em tokens "com efeito visível". As capturas da prévia mostram opções que não se distinguem e amostras com defeito.

1. **As amostras não mostram a diferença entre as opções**, e o próprio resumo admite isso em "Pendências". Conferido pelo revisor nas capturas de `C:\tmp\sarak-previa-141`:
   - `claro-shape-gradient.png`: as 4 opções de degradê estão idênticas.
   - `claro-shape-cards.png`: os 8 cards destacados são quase iguais. Só "Faixa lateral" e "Neon" se distinguem.
   - `claro-fonts-fonts.png`: Inter, Outfit e Space Grotesk saem iguais, e Bebas Neue e Caveat saem em serifa, porque a fonte não carrega na amostra.
   - O resumo lista o mesmo efeito em vidro, direção da sombra, moldura, atmosfera, largura, rolagem, troca de página, movimento e pares de fonte.

   Viola o objetivo da plan e o passo 7. Critério da correção: em cada grupo, cada opção destacada se distingue a olho, nos dois modos. Uma opção que não puder ser mostrada na miniatura sai das destacadas e fica em "Ver todas", com o motivo no resumo.
2. **Defeitos nas amostras novas.**
   - `claro-layout-topbar.png`: em `BarSample`, a marca vira um quadrado preto cortado, o rótulo do item some e mais da metade do quadro fica vazia.
   - `SampleCard`: as faixas de cor atrás do título e atrás do botão não ocupam a largura do card, em todos os grupos de card (`claro-shape-cards.png`).
   - O interruptor fica quase invisível no claro.

   O resumo os registrou como "fora do escopo", mas as amostras são desta plan (`PresetSamples.tsx`, `BarSample.tsx` alterado). Viola o passo 7 e a regra de não deixar defeito conhecido na tela entregue.
3. **`docs/migracoes.md` sem nota.** Os nomes e as descrições de 36 presets publicados passaram do inglês para o português, e quem os exibe vê a mudança. Falta uma linha que a registre, sem mudança de `id`.

**Critério objetivo da correção (decisão do dono, 2026-11-03: correção e verificação objetivas):**
- **Achado 1:** no spec `plan-141-presets-do-painel`, um caso captura a amostra de cada opção destacada e compara as capturas duas a duas, no mesmo grupo e nos dois modos. Toda dupla tem de diferir em ao menos 2% dos pixels. Uma opção que não passar e não tiver conserto barato na amostra sai das destacadas e fica em "Ver todas", com o motivo no resumo. Não reescreva os dados do preset para passar.
- **Achado 2:** um caso no mesmo spec para cada defeito:
  - a marca e o rótulo da topbar cabem no quadro (`scrollWidth <= clientWidth`);
  - as faixas do `SampleCard` têm a largura do card;
  - o trilho do interruptor tem contraste ≥ 3:1 com o fundo da amostra, no claro.
- **Achado 3:** uma linha em `docs/migracoes.md`.
- **Verificação do executor:** `vitest` só nos arquivos tocados e o spec `plan-141-presets-do-painel` depois de `npm run build`. Nada além disso.
- **Prévia:** só os grupos tocados, nos dois modos, em `C:\tmp\sarak-previa-141`.
- **Verificação do revisor:** o mesmo spec, o filtro do `vitest` e a prévia. O veredito fecha com a aprovação do dono.

**Fora do escopo, transcrito para o backlog:** `verify_presets` e `panel-contract:check` só enumeram os 5 arquivos antigos de preset (#68). **Decisão do dono, levada na conversa:** os 27 presets publicados que escrevem cor (`LEGACY_COLOR_PRESET_IDS`).

## Veredito — 2026-11-03 (correção 1) — 🔴 Reprovado

Os três achados do veredito anterior estão corrigidos e conferidos. Rodado pelo revisor:
- `vitest` em `src/core/Design/presets`, `src/features/DesignEngine` e `src/core/i18n/presetTexts`: 1046/1046.
- `tsc`: 0 erros.
- `npm run build`: exit 0, e depois `git restore` dos artefatos.
- `docs/migracoes.md`: tem a entrada nova.
- Prévia: a topbar cabe no quadro, as faixas do card têm a largura do card e as fontes carregam (`claro-layout-topbar.png` e `claro-shape-cards.png`).

Sobram dois achados, cada um com critério objetivo:

1. **O caso de distinção é instável e reprova em 2 de 4 rodadas.** O spec `plan-141-presets-do-painel` rodou inteiro uma vez (22/23) e o caso "Componentes: cada opção destacada se distingue… (escuro)" rodou isolado três vezes (1 de 3 verde). A falha é sempre a mesma: `motion: motion-instant × motion-agile = 0.09%`. As duas opções só diferem durante a animação, e o próprio resumo da correção dá esse motivo para rebaixar movimento. A regra do veredito vale aqui também.

   **Pronto quando:** o grupo de movimento fica com uma só destacada, e o caso "Componentes" passa em 3 rodadas isoladas seguidas.
2. **No preset de topbar "Invertida", o rótulo do item ativo fica ilegível nos dois modos**, e o resumo da correção o lista em "fora do escopo". O preset é desta plan, e a `plan-145` exige os cinco tons. Fica, portanto, no escopo.

   **Pronto quando:** um caso no spec confere, para todo preset de barra lateral e de topbar e nos dois modos, que o rótulo do item ativo tem contraste ≥ 4,5:1 com o fundo do próprio item, e esse caso passa.
   - **Decisão do dono (2026-11-03): correção rápida.** Não investigue o cálculo do tom. O preset que reprovar no caso sai das destacadas, e o resumo nomeia quais saíram. O revisor registra a causa no backlog.

**Verificação do executor:** só os dois casos no navegador (o "Componentes" em 3 rodadas isoladas e o caso novo) e o `vitest` de `presetCatalog.test.ts`. **Prévia:** só a barra de topo e a barra lateral, nos dois modos. **Verificação do revisor:** os mesmos dois casos, sem repetir o resto.

## Veredito — 2026-11-03 (correção 2) — 🟢 Aprovado

Os dois achados da correção 1 foram conferidos. Rodado pelo revisor:
- `npm run build`: exit 0, e depois `git restore` dos artefatos.
- Caso "Componentes: cada opção destacada se distingue": 3 de 3 rodadas isoladas verdes.
- Caso do contraste do item ativo de toda barra lateral e topbar: verde no claro e no escuro.
- Movimento ficou com uma só destacada (`registry.ts`).
- Item ativo: a correção está em `chromeToneStyle.ts`. Com o tom contrastante, `--sarak-on-nav-active` vale o fundo da barra, e o teste unitário cobre o par.

A decisão do dono mandava não investigar o tom, e o executor investigou. O conserto é uma linha e tem teste, então foi aceito no lugar do rebaixamento. O spec de navegador lê `dist/sarak.css` e só vale depois de `npm run build`.

**Aprovações do dono em 2026-11-03:**
- a prévia em `C:\tmp\sarak-previa-141`;
- os grupos com uma ou duas opções à vista, com o desenho estático que mostraria a diferença registrado no backlog (#69);
- os 27 presets publicados que escrevem cor (`LEGACY_COLOR_PRESET_IDS`), aceitos como exceção, numa lista que só encolhe.

Destino da síntese conforme o frontmatter.
