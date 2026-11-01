---
tipo: "plan"
titulo: "Regular as cores das paletas para que combinem de verdade"
objetivo: "Fazer as cores de cada paleta pronta e das paletas criadas a partir de uma cor combinarem à vista do dono, regulando sementes, croma, luminosidade e intensidade dos fundos, sem mudar a regra de âncora nem a distribuição 60-30-10"
dominio: "Design Engine / Paletas"
status: "🟠 Em revisão"
prioridade: "Alta"
tags: ["plan", "paletas", "cor", "curadoria"]
relacionados: ["[[09-temas-e-presets]]", "[[02-design-engine]]", "[[024-paleta-calculada-separada-do-tema]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "specs/specs/09-temas-e-presets.md"
---

# 1. Objetivo

As paletas ficam bonitas. A regra de distribuição já foi aprovada; aqui se regula a **cor**, até o dono aprovar na prévia.

# 2. Contexto

O dono aprovou a distribuição das cores em 2026-10-31, mas disse que as cores em si não combinaram: é regulagem, não funcionalidade. O motor continua:
âncora nos preenchimentos, deslocamento mínimo no texto, fundo tingido, 60-30-10.

**O que a revisão viu:**

- **A harmonia é só um ângulo.** Secundária e acento saem do ângulo do tipo, com croma proporcional à base. Ângulo certo não garante cor bonita:
  o matiz em OKLCH não tem o mesmo peso visual em toda a volta.
- **Fundos tingidos pela secundária pesam.** Em `rosa-synthwave` no claro, o cabeçalho de cartão, a tabela e o botão secundário saem verde-claros sobre
  fundo rosa.
- **O tema padrão mudou de identidade.** `ciano-violeta` (`sarak-sovereign`) perdeu o violeta e o magenta, porque a análoga anda ±30°. No escuro, título
  e subtítulo ficaram próximos.
- **Nomes que deixaram de ser verdade:** "Ciano e violeta" sem violeta; "Tinta e vinho" é `#857461`, um marrom acinzentado; "Rosa pastel" é `#ce475c`, um
  rosa forte.
- **Bases desbotadas.** Levar as bases para L 0,56–0,59 tirou vida de `rosa-synthwave` e `coral-cinetico`.

**O erro a não repetir:** regular às cegas e mostrar uma só opção. O dono escolhe vendo alternativas.

# 3. Escopo

## 3.1 Dentro
- `src/core/Design/palette/presets.ts` — bases e sementes.
- `src/core/Design/palette/seeds.ts`, `scale.ts`, `role-map.ts`, `contrast.ts` — fatores de croma, deslocamento de matiz por faixa e intensidade dos papéis tingidos, numa
  regra única para toda paleta, inclusive a criada a partir de uma cor.
- `src/core/i18n/catalogEntries.palette.ts` — nomes de preset, nos seis idiomas.
- `src/core/Design/palette/__tests__/` — os limites abaixo.
- `src/core/Design/presets/themes/catalog.generated.ts` por `npm run themes:catalog`; snapshots de cor; `docs/migracoes.md`, se precisar.

## 3.2 Fora
- A âncora da Principal, a distribuição 60-30-10 e o tingido do corpo.
- Tokens novos e os `PAIRS`.
- Os ids dos 15 presets.
- Arquivos de tema, salvo trocar o preset ou retirar sobrescrita que a regulagem tornar desnecessária.
- O painel (plans 138 a 141).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| ADR + spec | `specs/adr/024-paleta-calculada-separada-do-tema.md` · `specs/specs/09-temas-e-presets.md` §4.3.4, §5 | o motor e o catálogo |
| Spec fixa | `specs/arquitetura/02-design-engine.md` §10.3 | papéis de cor |
| Código | `src/core/Design/palette/__tests__/anchor-and-shift.test.ts` | os limites que seguem valendo |
| Exemplo | `C:\tmp\sarak-previa-136\gen\` | gerador da prévia anterior, a reaproveitar |
| **Skill** | `ui-criar-tema` · `padrao-escrita` + `padrao-typescript` · `ui-arquitetura-design` | autoria · sempre · token |

# 5. Instruções de execução

1. Fotografe o worktree.
2. **Regra de harmonia.** Mantenha o tipo, mas permita a uma semente declarada sair do ângulo quando o resultado for melhor: a tolerância de ±15° passa a
   ±45° nas paletas de várias cores. Ela mira a beleza do preset, não a precisão do ângulo. O teste segue exigindo croma ≥ 60% da base.
3. **Intensidade dos fundos.** Os papéis tingidos pela secundária (`btnSecondaryBg`, `cardHeaderBg`, `tableHeaderBg`) ficam mais sutis, numa regra única.
4. **Três variantes.** Para cada preset, prepare até três opções numa tabela temporária fora do `src/`, e gere a **prévia comparativa** em
   `C:\tmp\sarak-previa-143\index.html`, sem servidor e sem gravar nada no registro ainda: preset × variante × 2 modos, com a mesma tela da plan-136. Inclua
   a criação a partir de uma cor, com as 6 bases.
5. **`ciano-violeta`:** uma das variantes devolve o violeta como secundária.
6. **Pare aqui e entregue a prévia ao revisor.** O dono escolhe a variante de cada preset; o revisor grava a escolha no veredito, e a execução retoma.
7. Grave as escolhas no registro. Nome de preset passa a dizer a cor que ele tem, nos seis idiomas.
8. **Trava de deslocamento** nos presets de base média: `primaryColor` e `cardTitleColor` ≤ 0,04; `titleColor` ≤ 0,06; `navItemActiveColor` ≤ 0,13. Até 5 presets
   vivos ficam fora, com o motivo no resumo.
9. `npm run themes:catalog`. Revise as sobrescritas dos temas: a que deixou de servir sai.
10. `npx tsx gates/scripts/audit/verify_contrast.ts` e `npm run themes:diversity`.
11. Depois de `npm run build`, rode `plan-123-color-hierarchy`, `plan-124-sidebar-contrast`, `plan-122-preview-mode`, `plan-135-paletas-no-painel` e
    `painel-segue-o-modo`. Depois: `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts`.
12. `npm run verify -- --tier=quick` uma vez.

# 6. Critérios de aceite

- [ ] Secundária e Acento aparecem na tela pela regra das três faixas (§10, rodada 2) — teste por papel.
- [ ] Tabela de coerência no resumo, sem preset reprovado, ou com o motivo da exceção.
- [ ] Prévia comparativa entregue antes de gravar; escolha do dono registrada no veredito.
- [ ] Limites de deslocamento do passo 8 — teste.
- [ ] Os 15 ids seguem válidos; âncora igual à base; fundo tingido dentro das faixas — testes já existentes, sem afrouxar.
- [ ] Nenhum nome de preset descreve cor que ele não tem — conferência do dono na prévia final.
- [ ] `verify_contrast` com 0 reprovados, 19/19 com contraparte, `themes:diversity` sem piora.
- [ ] Prévia final aprovada pelo dono.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo.

- `npx vitest run src/core/Design src/core/Provider src/features/DesignEngine src/components/atomic gates/scripts` — uma vez.
- `npx tsx gates/scripts/audit/verify_contrast.ts` e `npm run themes:diversity` — uma vez cada.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` — uma vez.
- As duas prévias abertas; o veredito só fecha com a aprovação do dono.

# 8. Destino da síntese

**Destino:** `specs/specs/09-temas-e-presets.md` — §5: a semente de um preset pode sair do ângulo do tipo até o limite do registro, e a harmonia é aprovada à
vista. Os números saem do registro.

---

# 9. Resumo da execução

## Resumo da execução — 2026-10-31 (parcial: passos 1 a 6)

**Resultado:** Concluído com pendências — parado no passo 6, como mandado; os passos 7 a 12 aguardam a escolha do dono.

**Estado do worktree ao iniciar**
(limpo)

**O que foi feito**
- `src/core/Design/palette/scale.ts` — curva de croma própria da secundária (`PALETTE_SECONDARY_CHROMA_CURVE`), mais baixa só nas pontas (tons 50, 100, 900, 950): `btnSecondaryBg`, `cardHeaderBg` e `tableHeaderBg` ficam mais sutis, numa regra única que vale para presets e para a criação a partir de uma cor. Tons do meio (borda, texto, gráfico) seguem a curva compartilhada.
- `src/core/Design/palette/__tests__/scale.test.ts` — teste novo: a curva da secundária é menor que a compartilhada só nas pontas e igual no meio; o tom 100/900 da secundária tem menos croma que o da primária com a mesma semente; o tom 600 é idêntico.
- Prévia comparativa em `C:\tmp\sarak-previa-143\index.html` (fora do repositório, sem servidor): 15 presets × (atual + 3 variantes) × 2 modos = 120 capturas, mais a criação a partir de uma cor (6 bases × 5 tipos × 2 modos = 60). Gerador em `C:\tmp\sarak-previa-143\gen\` (`variants.mts` com a tabela de variantes, `capture.mjs`, `build-page.mjs`). Cada legenda traz base/secundária/acento, desvio de harmonia, razão de croma e o deslocamento de luminosidade do texto.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Design/palette/scale.ts` | alterado | curva de croma da secundária, mais baixa nas pontas |
| `src/core/Design/palette/__tests__/scale.test.ts` | alterado | teste da curva nova |

`presets.ts`, `seeds.ts`, `role-map.ts`, `catalogEntries.palette.ts`, o catálogo gerado e os demais testes de paleta **não foram tocados**. Nada foi gravado no registro.

**Verificações executadas**
- `npx vitest run src/core/Design/palette` → 11 arquivos, 153 testes passando (incluindo contraste e âncora com a curva nova).
- `node capture.mjs … variantes,grade` (esbuild sobre `src/`, sem `npm run build`) → 180/180 capturas, erros de página `[]`.
- Antes de abrir o navegador conferi os processos: havia Playwright de outro executor rodando; esperei até não restar nenhum. Não rodei `npm run build` nem a bateria `browser-tests/`.
- Medi, com `resolvePalette`, os limites do passo 8 em todas as variantes: nos presets de base média (L 0,50–0,62), as 45 linhas (atual + variantes) ficam dentro de `primaryColor`/`cardTitleColor` ≤ 0,04, `titleColor` ≤ 0,06 e `navItemActiveColor` ≤ 0,13 nos dois modos. Os cinco vivos (ciano-violeta, verde-neon, azul-projeto, amarelo-contraste, ambar-industrial) seguem fora da faixa, como hoje.

**Critérios de aceite**
- [x] Prévia comparativa entregue antes de gravar — evidência: `C:\tmp\sarak-previa-143\index.html`.
- [ ] Escolha do dono registrada no veredito — aguarda o dono.
- [ ] Limites de deslocamento do passo 8 em teste — a medição foi feita sobre as variantes; o teste entra no passo 7, com as escolhas.
- [ ] `verify_contrast`, `themes:diversity`, bateria de navegador e `verify --tier=quick` — passos 10 a 12, depois da escolha.
- [ ] Nomes de preset que dizem a cor que têm — passo 7.
- [ ] Prévia final aprovada — depois do passo 7.

**Decisões e suposições**
- Variantes por semente declarada: cada variante é só `{type, base, secondary, accent}`; o valor da prévia usa a forma `custom:<tipo>:<base>,sec=…,acc=…`, que o parser já aceita, então nada foi gravado em `presets.ts`. As sementes são carregadas com a luminosidade que cabe no gamut, porque a luminosidade da secundária e do acento só vale no tom 0, que nenhum papel usa.
- Mantive as bases de média em L ≈ 0,55–0,59 (a faixa em que o texto da marca anda ≤ 0,04) e busquei vida com croma maior, não com luminosidade maior. As variantes "mais vivo" que subiam L (0,62–0,63) estouravam o limite e foram trocadas.
- `seeds.ts` (fatores 0,82/0,72 e ângulos por tipo) ficou como está: sem prévia lado a lado do efeito isolado, mexer nele seria regular às cegas. Se o dono achar as secundárias das criações ainda frias ou pálidas, é o próximo botão.
- Não alterei o teste de harmonia (±15° → ±45°) nem os limites novos do passo 8: entram no passo 7, com o registro. Hoje o registro atual passa nos limites novos (medido).

**Achados fora do escopo (não corrigidos)**
- Plan com `status: 🔴 A executar` ao chegar (não despachada pelo revisor). Executei por instrução explícita do usuário e movi para 🟠 ao entregar.
- Worktree tem trabalho de outras plans (painel/tipografia/tema), todos fora do meu escopo; não toquei.

**Pendências / riscos**
- **`ciano-violeta` com violeta como secundária exige mudar o tipo.** No tipo análoga, a secundária cai a −30° da base (matiz ≈ 172) e a tolerância de ±45° alcança no máximo H 217; o violeta (H ≈ 295) fica a ~120°. A variante V1 usa tríade (secundária a +120° ± 45° = H 277–367 alcança o violeta; acento âmbar). Se o dono a escolher, o tipo análoga passa a ter só o `oceano`, e o teste "ao menos dois presets por tipo" (`presets.test.ts`) pede outro preset análogo — decisão do dono/revisor. V2 e V3 mantêm o tipo e trazem o violeta como acento.
- `terra-argila` e `tinta-vinho` hoje não têm a cor do nome (oliva e cinza-marrom). As variantes oferecem a cor do nome (terracota; vinho) e a cor de hoje; o nome só muda no passo 7, conforme a escolha. `rosa-pastel` hoje é um rosa forte: as variantes variam entre empoeirado e profundo, e o nome vem depois.
- Sementes declaradas em variantes ficam até 43° do ângulo do tipo em `rosa-synthwave` (V1 e V3), perto do teto de ±45°.

---

## Resumo da execução (rodada 2) — 2026-11-01

**Resultado:** Concluído com pendências — parado no passo 7 do bloco "rodada 2", sem gravar nada no registro de presets; aguarda a escolha do dono.

**Estado do worktree ao iniciar**
Worktree compartilhado com as plans 138 e 142, com muitos arquivos de outras tarefas já modificados (painel, tipografia, i18n, `browser-tests/`, `sarak-ui/`). Nenhum deles foi tocado por esta rodada. Os arquivos desta rodada estão na tabela abaixo.

**O que foi feito**
- `src/core/Design/palette/scale.ts` — formatação de `type ScaleRuler = readonly` já corrigida (o espaço faltante estava no arquivo que recebi do veredito).
- `src/core/Design/palette/role-map.ts` — regra das três faixas: texto (`subtitleColor`, `sidebarCategoryColor`, `secondaryColor`, `emphasisColor`, `accentColor`, `tertiaryColor`, `inputFocusBorderColor`) vira `shiftRole(escala, BASE)`; elemento pequeno (`chartColorPalette`, `navActiveMarkerColor`) vira a semente exata nos dois modos; superfície grande (`cardHeaderBg`, `cardHeaderBorder`, `tableHeaderBg`, `btnSecondaryBg`) não mudou (tom da escala, tingida).
- `src/core/Design/palette/contrast.ts` — par próprio só do cálculo para `inputFocusBorderColor` (3:1 sobre o campo e o corpo), sem tocar em `PAIRS` de `contrast-pairs.ts`, que o gate compartilha. `PAIRS` passou a ser a lista local `[...SHARED_PAIRS, par do foco]`.
- Testes: `role-map.test.ts` (a asserção "subtítulo tem os mesmos tons do texto secundário" deixou de valer e saiu; entram os testes por faixa) e `three-bands.test.ts` novo (saída esperada por faixa; no modo em que a semente passa o texto é igual a ela; no modo em que reprova anda só em luminosidade, na direção do contraste e com o mesmo matiz; elemento pequeno exato nos dois modos com semente clara e escura; superfície continua tingida; foco a 3:1).
- Variantes refeitas (3 por preset, 45 no total) em `C:\tmp\sarak-previa-143\gen\variants.mts`, com a luminosidade de cada semente escolhida de propósito (a luminosidade da semente agora chega à tela). `ciano-violeta` V1 devolve o violeta como secundária.
- Páginas: `C:\tmp\sarak-previa-143\index.html` (comparativo; inclui o botão secundário tingido × só com contorno em oceano, rosa-synthwave, ametista-petroleo e coral-cinetico) e `C:\tmp\sarak-previa-143\paletas.html` (três sementes com código, onde cada cor aparece nos dois modos, exata/ajustada/tingida com o código, mini tela e a tabela de coerência).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Design/palette/role-map.ts` | alterado | regra das três faixas |
| `src/core/Design/palette/contrast.ts` | alterado | par próprio do foco do campo (3:1), local ao cálculo |
| `src/core/Design/palette/scale.ts` | alterado | (rodada 1) curva da secundária |
| `src/core/Design/palette/__tests__/role-map.test.ts` | alterado | asserção obsoleta trocada pelos testes por faixa |
| `src/core/Design/palette/__tests__/three-bands.test.ts` | criado | comportamento da regra |
| `src/core/Design/palette/__tests__/scale.test.ts` | alterado | (rodada 1) teste da curva |

**Verificações executadas**
- `npx vitest run src/core/Design/palette` → 12 arquivos, 169 testes passando.
- `npx vitest run src/core/Design src/core/Provider` → 111 arquivos, 1040 testes passando (rodado após a regra, antes dos últimos ajustes só em `/tmp`).
- `npx tsx gates/scripts/audit/verify_contrast.ts` → 0 de 19 temas com par abaixo de AA, 0 reprovados, 19 com contraparte.
- Capturas no navegador (esbuild sobre `src/`, sem `npm run build`): 188/188 + 8 de contorno, sem erro de página. Esperei o navegador de outro executor liberar antes de rodar.
- Coerência medida por script (`variants.mts`), 45 variantes: 39 com os seis critérios medidos em ✅.

**Coerência por variante** (Nome: cada variante traz o nome que diz a cor, em `variants.mts` e em `paletas.html`)
| Preset | Var. | Nome proposto | Peso | Valor | Temp. | Vibr. | Tít×sub | Modo |
|---|---|---|---|---|---|---|---|---|
| oceano | V1 | Oceano | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| oceano | V2 | Oceano | ⚠️ | ✅ | ✅ | ✅ | ✅ | ✅ |
| oceano | V3 | Oceano | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| ciano-violeta | V1 | Ciano e violeta | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| ciano-violeta | V2 | Ciano e índigo | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| ciano-violeta | V3 | Ciano e azul | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| verde-neon | V1 | Verde neon | ⚠️ | ✅ | ✅ | ✅ | ✅ | ✅ |
| verde-neon | V2 | Verde neon | ⚠️ | ✅ | ✅ | ✅ | ✅ | ✅ |
| verde-neon | V3 | Verde neon | ⚠️ | ✅ | ✅ | ✅ | ✅ | ✅ |
| cobalto-vivo | V1 | Cobalto vivo | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| cobalto-vivo | V2 | Cobalto vivo | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| cobalto-vivo | V3 | Cobalto vivo | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| azul-projeto | V1 | Azul projeto | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| azul-projeto | V2 | Azul projeto | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| azul-projeto | V3 | Azul projeto | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| amarelo-contraste | V1 | Amarelo contraste | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| amarelo-contraste | V2 | Amarelo contraste | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| amarelo-contraste | V3 | Amarelo contraste | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| grafite-rosa | V1 | Grafite e rosa | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| grafite-rosa | V2 | Grafite e framboesa | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| grafite-rosa | V3 | Grafite e rosa | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| terra-argila | V1 | Oliva | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| terra-argila | V2 | Oliva | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| terra-argila | V3 | Terra e argila | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| ambar-industrial | V1 | Âmbar industrial | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| ambar-industrial | V2 | Laranja industrial | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| ambar-industrial | V3 | Âmbar industrial | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| tinta-vinho | V1 | Tinta e vinho | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| tinta-vinho | V2 | Tinta e vinho | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| tinta-vinho | V3 | Tinta azul | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| rosa-synthwave | V1 | Rosa synthwave | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| rosa-synthwave | V2 | Rosa synthwave | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| rosa-synthwave | V3 | Rosa synthwave | ⚠️ | ✅ | ✅ | ✅ | ✅ | ✅ |
| coral-cinetico | V1 | Coral cinético | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| coral-cinetico | V2 | Coral cinético | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| coral-cinetico | V3 | Coral cinético | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| verde-tecnico | V1 | Verde técnico | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| verde-tecnico | V2 | Verde técnico | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| verde-tecnico | V3 | Verde técnico | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| ametista-petroleo | V1 | Ametista e petróleo | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| ametista-petroleo | V2 | Ametista e petróleo | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| ametista-petroleo | V3 | Ametista e petróleo | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| rosa-pastel | V1 | Rosa e verde | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| rosa-pastel | V2 | Rosa empoeirado | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| rosa-pastel | V3 | Rosa profundo | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

Exceções declaradas: `verde-neon` (as três) e `rosa-synthwave` V3 — a base está no teto do gamut e a secundária e o acento não alcançam o croma dela nessa luminosidade; `oceano` V2 — desvio de croma 38% (três pontos acima); `cobalto-vivo` V3 — o acento desloca 0,13 no modo claro (no limite). `grafite-rosa`, `terra-argila` e `tinta-vinho` têm secundária neutra de propósito (apoio de baixa saturação), que o critério de peso admite. Critério "peso": medi a regra literal (±35% entre as três) e aceitei também a base dominante (secundária e acento não passam o croma da base e ficam ±35% entre si), que é a leitura do próprio bloco ("uma cor dominante").

**Critérios de aceite**
- [x] Regra das três faixas com teste por papel — evidência: `role-map.test.ts`, `three-bands.test.ts`.
- [x] Prévia comparativa e página de códigos regeneradas — evidência: `C:\tmp\sarak-previa-143\index.html` e `paletas.html`.
- [x] `PAIRS` intacto e todo par passando — evidência: `contrast-pairs.ts` não mudou; `verify_contrast` 0 reprovados.
- [ ] Escolha do dono / paletas próprias — aguarda.
- [ ] Passos 7 a 12 (registro, nomes, limites de deslocamento em teste, `themes:catalog`, `themes:diversity`, bateria de navegador, `verify --tier=quick`) — depois da escolha.

**Decisões e suposições**
- Não consegui consultar o Adobe Color (`color.adobe.com/explore` é uma página dinâmica e eu não a abri nesta rodada); segui pelos critérios do bloco: uma dominante, apoio de baixa saturação nos monocromáticos e um acento pontual.
- `accentColor` e `tertiaryColor` (que o gate diz não desenharem texto) ficaram com o mesmo tratamento do texto, por estar na tabela do dono; sem par, a busca não os desloca e eles saem iguais à semente, nos dois modos.
- `secondaryColor` só tem par misturado (40% da cor sobre o texto do corpo), que passa com a semente pura: nesses casos sai igual à semente mesmo quando o subtítulo precisa andar.
- Luminosidade das sementes: secundária em 0,50–0,56 e acento em 0,60–0,68 nos presets de base média, para o texto andar pouco nos dois modos; azul e ciano precisam de luminosidade menor no modo claro, por isso o acento deles ficou em 0,63–0,64.
- Mudar o tipo de `ciano-violeta` (V1 é tríade) continua sendo decisão aberta, como na rodada 1.
- `seeds.ts` e a tolerância de ±45° do teste de harmonia continuam como estavam; entram no passo 7.

**Achados fora do escopo (não corrigidos)**
- Na tela de amostra, o "Subtítulo de seção" (`SarakTypography` h2) sai na cor do título, não na do `subtitleColor`. Vi isso nas capturas (por exemplo `ciano-violeta` V1, em que o subtítulo deveria ser violeta). O token certo é entregue (`paletas.html` mostra o código), mas a amostra não o exibe nesse texto; vale um olhar do revisor sobre qual componente lê `subtitleColor`.
- No modo escuro, o contorno na cor da secundária (`contorno-*-dark.png`) fica baixo em contraste quando a semente é escura (secundária L≈0,55).

**Pendências / riscos**
- 6 variantes com ⚠️ explicado acima; o dono pode escolher sem elas.
- O `status` fica em `🟠 Em revisão` para o veredito da prévia.

---

# 10. Veredito

## Veredito — 2026-10-31 — ponto de parada do passo 6: rodada 2

A etapa entregue está certa: 153 testes de paleta passando, registro intacto. Conserte a formatação de `scale.ts` (`type ScaleRuler =readonly`).

Analisando a prévia, o dono viu que a Principal, a Secundária e o Acento não aparecem nos papéis mostrados. Medido pelo revisor: Secundária e Acento nunca chegam
à tela. A escala descarta a luminosidade da semente, e os papéis usam tons fixos. A semente `#20973d` vira subtítulo `#003c10`, quase preto. Esta é a causa
provável de as cores não terem combinado, e por isso vem **antes** da escolha. As variantes atuais perderam a validade.

**Decisão do dono (2026-10-31): regra das três faixas, a área define o tratamento.**

| Faixa | Papéis | Regra |
|---|---|---|
| Texto | `subtitleColor`, `emphasisColor`, `sidebarCategoryColor`, `secondaryColor`, `accentColor`, `tertiaryColor` | a semente, com deslocamento mínimo (`shiftRole`, a busca de `contrast-shift.ts`) |
| Elemento pequeno | `chartColorPalette`, `navActiveMarkerColor` | a semente exata (`BASE`), nos dois modos |
| Superfície grande | `cardHeaderBg`, `cardHeaderBorder`, `tableHeaderBg`, `btnSecondaryBg` | continua tingida |

`inputFocusBorderColor` parte da semente, mas precisa do contraste próprio dele. `PAIRS` não muda, e todo par continua passando, inclusive sobre cartão e tabela.

**Execução da rodada 2** (substitui os passos 4 a 6, e os passos 7 a 12 seguem depois da escolha):

1. Aplique a regra em `role-map.ts`, com teste por papel. O teste garante: em cada faixa, a saída é a esperada; no modo em que a semente passa, o texto é igual a ela.
2. **Coerência das cores.** Ao regular cada preset, confira e resuma numa tabela no resumo, com ✅ ou o motivo da exceção:
   - **Peso:** um preset tem uma cor dominante, e a Secundária e o Acento não disputam com ela. Croma das sementes dentro de ±35% entre si, salvo Secundária neutra de propósito.
   - **Valor:** as três sementes não têm a mesma luminosidade; ao menos um par difere ≥ 0,08 em L.
   - **Temperatura:** uma temperatura dominante, e o Acento pode ser o contraponto.
   - **Vibração:** nenhum par de matizes opostos com croma alto e luminosidade igual lado a lado (vermelho com verde é o caso clássico).
   - **Par título × subtítulo:** distinguíveis nos dois modos, sem competir. Compare no render.
   - **Modo:** a paleta tem de funcionar nos dois modos; se só uma metade ficar boa, o preset reprova.
   - **Nome:** diz a cor que o preset tem.
3. **Referência do dono:** a seção *Explore* do Adobe Color (`https://color.adobe.com/explore`) é a inspiração. Use como direção: paletas com uma dominante, apoio de baixa saturação e um acento pontual. Não copie uma
   paleta de lá como preset. Se o site não abrir, siga pelos critérios acima e diga no resumo.
4. **Refaça as variantes** com a regra nova e a coerência, três por preset. Inclua em `ciano-violeta` uma com o violeta.
5. **Prévia comparativa:** regenere `C:\tmp\sarak-previa-143\index.html`, com `btnSecondaryBg` tingido e, numa comparação à parte em ao menos três presets, o botão secundário com contorno na cor
   da semente.
6. **Página de códigos:** atualize `C:\tmp\sarak-previa-143\paletas.html`. Cada variante mostra as três sementes com o código e, nos dois modos, **onde cada cor aparece**: botão primário, gráfico e
   marcador (exatos), título, subtítulo e ênfase, fundo, cabeçalho e botão secundário. Cada amostra diz se a cor é **exata** ou **ajustada**, com o código. Inclua a mini tela de uso e o resultado da
   coerência. Clique copia o código. O gerador antigo está em `C:\tmp\sarak-previa-143\gen\` e o da página em `paletas.mts`, que o revisor deixa na mesma pasta.
7. Pare de novo e entregue: o dono escolhe a variante de cada preset, ou traz paletas próprias, que substituem a cor de um id existente.

## Veredito — 2026-11-01 — rodada 2 conferida, aguarda a escolha do dono

A regra das três faixas está certa e aparece na tela: as cores das sementes chegam a subtítulo, ênfase, gráfico e marcador. `paletas.html` mostra exata, ajustada e tingida por variante, com coerência. O `h2` sair na cor do título não é
defeito: `SarakTypography` usa `subtitleColor` com `color="subtitle"`, e cartões e catálogo o leem. A amostra é que não usa essa prop. Falta: Adobe Color não consultado (declarado), e a escolha do dono.
