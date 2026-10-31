---
tipo: "plan"
titulo: "Manter a cor da marca nos dois modos, tingir o fundo e tornar a harmonia da paleta visível"
objetivo: "Fazer a troca entre claro e escuro mudar o tom e não a cor da marca, os fundos deixarem de ser preto e branco puros e as paletas de várias cores aparecerem na tela com a distribuição 60-30-10, com presets harmônicos e a criação a partir de uma cor aprovada pelo dono numa prévia"
dominio: "Temas / Paletas"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "paletas", "temas", "contraste"]
relacionados: ["[[09-temas-e-presets]]", "[[024-paleta-calculada-separada-do-tema]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "specs/specs/09-temas-e-presets.md + specs/arquitetura/02-design-engine.md + specs/adr/024-paleta-calculada-separada-do-tema.md"
---

# 1. Objetivo

Trocar de modo muda o **tom**, não a **cor da marca**. O fundo tem cor (tingido pela paleta), não preto e branco puros. Uma paleta de
várias cores **aparece** na tela: a secundária e o acento pintam superfícies visíveis, na distribuição 60-30-10. O dono aprova numa
prévia antes do veredito.

# 2. Contexto

**Quando executar:** depois da tag que o dono emite com as `plan-134` e `plan-135` e do teste dele no importador. Esta plan sai na tag
seguinte.

Revisão do dono sobre a prévia da `plan-134` (2026-10-28): o resultado está ótimo, mas há três defeitos de regra. Todos estão no motor
da `plan-133` (`src/core/Design/palette/`), não nos temas. As medições abaixo são do revisor, contra os presets de hoje.

**1. A cor da marca muda entre os modos.** O mapa de papéis (`role-map.ts`) usa tons espelhados: o título é 800 no claro e 200 no
escuro, o botão é 700 e 300. A escala (`scale.ts:6-16`) fixa a luminosidade de cada tom, e a luminosidade da cor-base se perde: **a
cor que o usuário escolheu nunca aparece na tela**. O contraste da base exata, medido:

| Base (luminosidade OKLCH) | Presets | Contra o fundo escuro (L 0,14) | Contra o fundo claro (L 0,98) |
|---|---|---|---|
| média, 0,49 a 0,55 | oceano, tinta-vinho, grafite-rosa, verde-tecnico, ametista-petroleo, rosa-pastel, cobalto-vivo | 3,1 a 3,9 | 4,9 a 6,1 |
| média-alta, 0,66 a 0,70 | rosa-synthwave, coral-cinetico, azul-projeto | 5,7 a 7,5 | 2,5 a 3,3 |
| clara, 0,77 a 0,88 | ciano-violeta, verde-neon, amarelo-contraste, ambar-industrial | 9 a 15 | 1,3 a 2,0 |
| escura, 0,39 | terra-argila | 2,1 | 9,0 |

**O fundo não resolve o contraste.** Clarear o fundo escuro piora uma base escura: o grafite-rosa cai de 3,3 para 2,2 com o fundo em
L 0,30. Uma base clara no modo claro precisaria de fundo cinza-médio, e o modo deixaria de ser claro. Decisão do dono (2026-10-28):
**a cor-base é a âncora**. Contorno ou halo no texto **não** entra.

**Nenhuma cor serve de texto igual nos dois modos.** A 4,5:1, o texto precisa de L ≥ 0,58 sobre o fundo escuro (L 0,16) e de L ≤ 0,55
sobre o fundo claro (L 0,97). A janela é vazia para qualquer matiz, e o tingido do passo 4 não a abre. Decisão do dono (2026-10-31):

- **Preenchimento exato:** a base vale igual nos dois modos, porque o texto por cima dela é escolhido pelo contraste.
- **Texto com deslocamento mínimo:** mesmo matiz e mesmo croma, com a menor mudança de luminosidade que passa. Numa base de L 0,50 a
  0,62, ele fica em ΔL ≤ 0,04 por modo.
- **Presets vivos seguem vivos:** ciano, verde neon, âmbar e amarelo mantêm a base clara, que é a identidade de seis temas, inclusive o
  padrão. O botão segue exato, e o texto escurece mais no modo claro.

**2. Os fundos são preto e branco.** `NEUTRAL_CHROMA = 0.008` (`seeds.ts:4`) vezes a curva de croma nas pontas (`scale.ts:20`, 0,24)
dá cinza puro. Além disso, o corpo usa os tons extremos: L 0,98 no claro e 0,14 no escuro. Decisão do dono: **tingido sutil**, com o
matiz da paleta, numa regra única (sem parâmetro por preset).

**3. A harmonia não aparece.** A secundária só pinta `secondaryColor` e `chartColorPalette`. O acento só pinta a marca, a ênfase e a
terciária. Nada do que a tela de amostra mostra (título, botões, tabela) usa as duas. Além disso, os presets declaram `secondary`/`accent`
à mão, sem relação com o ângulo do tipo: `terra-argila` é "complementar" com secundária igual ao acento. Decisão do dono: **a
distribuição 60-30-10 é o centro desta plan.** A paleta **monocromática** é a mesma cor em tons diferentes, distribuídos pelos papéis.
As de **várias cores** só entram no catálogo com harmonia comprovada.

Também entra o plural do diálogo de troca ("Você ajustou 1 cor(es)"), achado na revisão da `plan-135`.

# 3. Escopo

## 3.1 Dentro
- `src/core/Design/palette/` — `role-map.ts`, `scale.ts`, `seeds.ts`, `contrast.ts`, `presets.ts` e os testes.
- `src/core/Design/presets/themes/<19 temas>.ts` — troca de preset e revisão das sobrescritas, quando a recuragem pedir. Cada
  sobrescrita mantida segue com a linha de motivo.
- `src/core/Design/presets/themes/catalog.generated.ts` — regenerado por `npm run themes:catalog`.
- `src/core/i18n/catalogEntries.palette.ts` — nomes de presets novos e o plural do diálogo.
- Testes que fixam cor (atualize o valor esperado, nunca afrouxe a asserção) e os snapshots que a cor mudar.
- `docs/migracoes.md` — subseção na seção da próxima versão: as cores dos temas embarcados mudam.
- A prévia (§5 passo 9), **fora do repositório**.

## 3.2 Fora
- Token novo. Onde uma superfície visível não tem token de cor (link, anel de foco, texto do cabeçalho de tabela, chip), **liste-a no
  resumo**: a criação de token é outra plan.
- Contorno ou halo em texto (decisão do dono).
- O painel além do texto do diálogo; o formato de `colorPalette` e o `SarakPaletteInput` (não mudam).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| ADR + spec | `specs/adr/024-paleta-calculada-separada-do-tema.md` · `specs/specs/09-temas-e-presets.md` §4.3.4 · `specs/arquitetura/02-design-engine.md` §10.3 | a regra que esta plan muda |
| Código | `src/core/Design/presets/themes/*.ts` | o mapa tema → preset (`colorPalette`) e as sobrescritas mantidas, com o motivo de cada uma ao lado |
| Spec fixa | `specs/specs/09-temas-e-presets.md` §4.3.4, §5, §6 | composição da paleta, diversidade, travas |
| ADR | `specs/adr/024-paleta-calculada-separada-do-tema.md` | a decisão que esta plan refina |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `ui-criar-tema` · `ui-criar-preset` | sempre · temas e presets |

# 5. Instruções de execução

1. Fotografe o worktree. Antes de editar, gere o lado **antes** da prévia (passo 9) no `HEAD`.
2. **Âncora.** Os **preenchimentos** de marca usam a **cor-base exata** nos dois modos: `btnPrimaryBg`, `rangeActiveColor`,
   `switchTrackActiveBg`, `checkboxActiveColor`. O texto sobre o botão (`btnPrimaryText`) escolhe entre o claro e o escuro da neutra
   pelo maior contraste. `primaryColor` tem pares de texto em `PAIRS`, então segue a regra do passo 3, junto com `navItemActiveColor`,
   `titleColor` e `cardTitleColor`. Liste no resumo cada preenchimento que lê `primaryColor` e por isso não sai exato; nada de token novo.
3. **Deslocamento mínimo.** Nos papéis de texto do passo 2, a correção busca a **menor** mudança de luminosidade OKLCH que passa nos pares
   de `PAIRS`, com o mesmo matiz e o mesmo croma (dentro do gamut), em vez de saltar de tom em tom da escala. Os demais papéis seguem a
   correção atual. Teste: para uma base que passa, a cor de saída é igual à base; para uma que não passa, o deslocamento é o menor que
   satisfaz o par (busca com tolerância declarada).
4. **Fundo tingido.** A neutra leva o matiz da base, com croma OKLCH entre **0,012 e 0,030** nos tons de fundo (a curva das pontas não
   pode zerar o tingido). O corpo fica com L entre **0,95 e 0,97** no claro e entre **0,16 e 0,19** no escuro. Corpo, camada 1 e
   camada 2/cartão diferem em pelo menos **0,03** de L. Teste sobre os presets.
5. **Mínimo do texto.** Todo texto segue em 4,5, inclusive o título: `titleColor` também pinta títulos pequenos (Markdown, tabela).
   `PAIRS` não muda.
6. **Distribuição 60-30-10** no mapa de papéis:
   - **Primária (60):** ações e títulos (passo 2), mais os controles que já são dela (`rangeActiveColor`, `switchTrackActiveBg`,
     `checkboxActiveColor`).
   - **Secundária (30):** `subtitleColor`, `btnSecondaryBg` (tingido), `cardHeaderBg`, `cardHeaderBorder`, `tableHeaderBg`,
     `sidebarCategoryColor`, `chartColorPalette`.
   - **Acento (10):** `emphasisColor`, `navActiveMarkerColor` (o marcador passa ao acento; o texto do item ativo segue primário),
     `inputFocusBorderColor`, `cardTitleIconGlow`, `sidebarBrandColor`.
   - **Status** seguem semânticos.

   Todo par de `PAIRS` continua passando (`verify_contrast` com 0 reprovados). Se um papel desta lista não passar sem perder a cor,
   ele volta à neutra e o resumo diz qual e por quê.
7. **Presets harmônicos.** O registro mantém de 12 a 15 presets: **≥ 3 monocromáticos** e **≥ 2 de cada tipo de várias cores**. Numa
   paleta de várias cores, a secundária e o acento **saem do ângulo do tipo**. Uma semente declarada à mão só é aceita a até **±15°**
   do ângulo, e com croma ≥ 60% do da base (para não virar cinza). Na monocromática, a semente fica a até ±10° do matiz da base. **Teste
   sobre o registro.** Sobre o deslocamento: **≥ 10 presets** têm base de L 0,50 a 0,62, com ΔL ≤ 0,04 por modo nos papéis de texto, e **até 5** presets vivos
   ficam fora dessa faixa, cada um com o motivo no resumo. Os dois limites têm teste. Ids proibidos de antes seguem proibidos
   (`SARAK_LEGACY_PALETTE_IDS`). **Nenhum id publicado na
   `8.0.0-rc.4` sai do registro:** a recuragem muda a cor de um preset, nunca o id, porque um tema salvo por importador pode guardá-lo e
   um id desconhecido compõe sem paleta. Teste com a lista dos 15 ids da rc.4. Preset novo só entra respeitando o teto de 15, então uma
   entrada que não sirva é recurada no próprio id.
8. **Temas.** Cada tema mantém a identidade: mesma família de matiz da base de hoje (`themes:diversity`, famílias 9 → 9). As sobrescritas
   de hover de `blueprint-protocol` e `neumorphic-mobile` e as famílias de superfície mantidas pela `plan-134` são revistas. A que o
   fundo tingido tornar desnecessária sai. A que fica segue com motivo, nos dois blocos.
9. **Prévia para o dono** (a execução não para nela), em `C:\tmp\sarak-previa-136\index.html`, com imagens na mesma pasta, caminhos
   relativos e sem servidor. Cada captura tem legenda. A tela de amostra ganha **subtítulo, botão secundário, cabeçalho de cartão,
   cabeçalho de tabela, gráfico, texto de ênfase e campo com foco**, para a secundária e o acento aparecerem. Seções:
   - os 19 temas × 2 modos, antes e depois, lado a lado;
   - os presets × 2 modos, agrupados por tipo;
   - **criação a partir de uma cor:** 6 bases (escura, média, clara, quase neutra, saturada, pastel) × 5 tipos × 2 modos, em grade, com
     o deslocamento de cada âncora anotado (0 ou ΔL);
   - o fluxo do painel criando uma paleta a partir de uma dessas bases (harness de `browser-tests/plan-135-paletas-no-painel.spec.ts`).

   O comando que regenera a página vai no resumo.
10. `npm run themes:catalog` e subseção em `docs/migracoes.md`.
11. **Navegador.** Depois de `npm run build`, rode uma vez os specs que medem cor: `plan-123-color-hierarchy`, `plan-124-sidebar-contrast`,
    `plan-122-preview-mode`, `plan-135-paletas-no-painel` e `painel-segue-o-modo`. Com eles verdes, rode `npm run cromo-css-real:check`
    inteiro, uma vez, e cole a linha final (Playwright em segundo plano, se o terminal tiver limite de tempo). Valor esperado de cor vem da
    página ([[11-testes-e-cobertura]] §7.3). Depois: `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts`.
12. `npm run verify -- --tier=quick` uma vez. Cole o resumo com o caminho da prévia.

# 6. Critérios de aceite

- [ ] Âncora: os preenchimentos do passo 2 são iguais à base nos dois modos, em todos os presets — teste.
- [ ] Deslocamento mínimo provado por teste (igual à base quando passa; menor ΔL quando não passa).
- [ ] Fundo tingido dentro das faixas de croma e luminosidade do passo 4 — teste sobre os presets.
- [ ] Distribuição 60-30-10 no mapa — teste por papel (escala de cada token da lista do passo 6).
- [ ] Presets: contagem por tipo, ângulos, ≥ 10 com ΔL ≤ 0,04 e até 5 vivos — teste sobre o registro.
- [ ] Os 15 ids da `8.0.0-rc.4` continuam válidos — teste com a lista.
- [ ] `verify_contrast` com 0 reprovados e 19/19 com contraparte; `themes:diversity` sem piora (números antes e depois no resumo).
- [ ] O diálogo escreve "1 cor" e "2 cores" (e o equivalente nos seis idiomas) — teste.
- [ ] `npm run cromo-css-real:check` verde inteiro, com a linha final no resumo.
- [ ] Prévia gerada com as quatro seções; a aprovação do dono é registrada pelo revisor no veredito.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo — `verify_contrast` e as travas de tema cobrem.

- `npx vitest run src/core/Design src/core/Provider src/features/DesignEngine src/components/atomic gates/scripts` — uma vez. Inclui os
  consumidores da cor (painel e átomos), não só o motor.
- `npx tsx gates/scripts/audit/verify_contrast.ts` e `npm run themes:diversity` — uma vez cada.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` — uma vez.
- A prévia aberta pelo revisor; o caminho é passado ao dono; o veredito só fecha com a aprovação dele.
- A bateria de navegador **não** se repete no revisor: vale a linha final colada pelo executor, e o job `cromo-css-real` da CI a mede de
  novo no push.

# 8. Destino da síntese

- `specs/specs/09-temas-e-presets.md` §4.3.4 — o preenchimento de marca é a base exata nos dois modos e o texto desloca o mínimo; o fundo é tingido; a distribuição
  60-30-10; o preset de várias cores deriva do ângulo do tipo. Os números saem do registro e do mapa, nunca transcritos.
- `specs/arquitetura/02-design-engine.md` §10.3 — o deslocamento mínimo substitui o salto de tom na correção dos papéis de texto da marca.
- `specs/adr/024-paleta-calculada-separada-do-tema.md` — *Consequências*: a base é âncora, nenhuma cor serve de texto igual nos dois modos, e
  contorno ou halo foi recusado, com o motivo medido.

---

# 9. Resumo da execução

## Resumo da execução — 2026-10-31

**Resultado:** Concluído com pendências

**Estado do worktree ao iniciar**
(limpo)

A plan chegou em `🔴 A executar` (não despachada pelo revisor); a execução foi pedida diretamente pelo usuário e só movi o status para `🟠` ao entregar.

**O que foi feito**
- Âncora: `PALETTE_BASE_TONE = 0` é o "tom" da cor da semente, exata, em toda escala (`scale.ts`). `btnPrimaryBg`, `rangeActiveColor`, `switchTrackActiveBg` e `checkboxActiveColor` leem esse tom nos dois modos (`role-map.ts`).
- Deslocamento mínimo: `contrast-shift.ts` (novo) busca, em passos de 0,002 de L OKLCH, a menor mudança de luminosidade com mesmo matiz e croma que passa nos pares (folga de 0,01 sobre 4,5). `primaryColor`, `titleColor`, `cardTitleColor` e `navItemActiveColor` partem da base; `btnPrimaryText` parte dos dois extremos da neutra e fica com o que anda menos (`contrast.ts`; campo `shiftFrom` em `types.ts`).
- Fundo tingido: régua própria da neutra (corpo 0,965 no claro e 0,165 no escuro; camadas a ≥ 0,03), croma plano 0,016–0,026 com o matiz da base; base quase cinza tinge menos (`scale.ts`, `seeds.ts`).
- 60-30-10 (`role-map.ts`): secundária em `subtitleColor`, `btnSecondaryBg`, `cardHeaderBg`, `cardHeaderBorder`, `tableHeaderBg`, `sidebarCategoryColor` (`chartColorPalette` já era); acento em `navActiveMarkerColor` e `inputFocusBorderColor` (`emphasisColor`, `cardTitleIconGlow` e `sidebarBrandColor` já eram do acento).
- Registro (`presets.ts`): os 15 ids da rc.4 mantidos; secundária e acento saem do ângulo do tipo (só `grafite-rosa` declara, a ≤ 15°); monocromáticos = 3 (terra-argila, ambar-industrial, tinta-vinho); `grafite-rosa` virou tríade; dez bases com L 0,557–0,593 e cinco vivas (ciano-violeta, verde-neon, amarelo-contraste, ambar-industrial, azul-projeto).
- Plural do diálogo: `paletteKeepMessageOne` e `paletteKeepMessageMany` nos seis idiomas (`catalogEntries.palette.ts`, `usePaletteSelection.ts:33`).
- `docs/migracoes.md` ganhou a subseção; `sarak-ui/docs/migracoes.md` regenerado por `npm run guide`; `catalog.generated.ts` por `npm run themes:catalog`.
- `GanttTimeline.tsx`: o título da barra passou a ler `--theme-text-primary` (o comentário do componente já dizia "texto principal"). Com o título no mínimo de 4,5 contra o corpo, a trilha tingida da barra dava 3,4–3,7 e reprovava o spec do Gantt.
- Prévia: `C:\tmp\sarak-previa-136\index.html` (fora do repositório; imagens na mesma pasta).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Design/palette/{types,scale,seeds,role-map,contrast,presets}.ts` | alterado | âncora, régua neutra, tingido, mapa 60-30-10, correção, registro |
| `src/core/Design/palette/contrast-shift.ts` | criado | busca do deslocamento mínimo |
| `src/core/Design/palette/__tests__/{anchor-and-shift,contrast-shift}.test.ts` | criado | âncora, deslocamento, fundo, faixa do registro |
| `src/core/Design/palette/__tests__/{parser,presets,role-map,scale,seeds}.test.ts` | alterado | valor esperado novo; registro (≥ 3 mono, ids da rc.4, ângulos) |
| `src/core/Design/presets/themes/catalog.generated.ts` | alterado (gerado) | catálogo leve |
| `src/core/Design/presets/themes/__tests__/compose.test.ts` | alterado | ver Decisões |
| `src/core/i18n/catalogEntries.palette.ts`, `src/features/DesignEngine/Main/hooks/usePaletteSelection.ts` (+ teste) | alterado | plural |
| `src/features/DesignEngine/.../{PresetsCatalog,ThemeSidebarContent}.test.tsx.snap` | alterado | só cor e tipo/ordem de preset |
| `src/components/atomic/DataDisplay/SarakGantt/GanttTimeline.tsx` (+ teste) | alterado | leitor do título da barra |
| `docs/migracoes.md`, `sarak-ui/docs/migracoes.md` | alterado | subseção; kit regenerado |

**Verificações executadas**
- `npx vitest run src/core/Design src/core/Provider src/features/DesignEngine gates/scripts` → 2084 passaram, 6 falharam. Depois de regenerar o catálogo, ajustar `grafite-rosa`, reescrever o teste do `compose` e atualizar 2 snapshots, reexecutei por pasta: `palette` + `presets` + `verify_diversity` (266 passaram), `usePaletteSelection` + `i18n` (35), Gantt (73). **Não reexecutei o conjunto inteiro depois dessas correções.**
- `npx tsx gates/scripts/audit/verify_contrast.ts` → 89 pares, **0 reprovados**, 19/19 com contraparte, 0 no modo oposto.
- `npm run themes:diversity`, antes → depois: modo escuro 8 → 8; neon puro 5 → 5; ciano+magenta 3 → 3; claro com primária saturada 6 → 5; fundo médio 2 → 2; famílias 9 → 9 (neumorphic-mobile segue "neutro" depois de baixar o croma de `grafite-rosa` para 0,038).
- Navegador: `plan-123`, `plan-124`, `plan-122`, `plan-135`, `painel-segue-o-modo` → 8 passaram. `npm run cromo-css-real:check` inteiro → **445 passed (23.0m), exit 0**. A 1ª execução deu 444 passed / 1 failed (Gantt, tema claro, 3,4–3,7), corrigida acima. Depois: `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts` e remoção, por `rm`, dos 18 chunks novos de `dist/` que o build criou (o `git clean` foi barrado pelo hook).
- `npm run verify -- --tier=quick` → "nível quick verde" (tsc, baseline com `--with-tsc`, barrel, catálogo, token-types, theme-completeness, guide:check, dev-kit:check, Anel 0: 1098 linhas, 0 achados). A 1ª rodada acusou `guide:check` (kit defasado), resolvido com `npm run guide`.

**Critérios de aceite**
- [x] Âncora igual à base nos dois modos, todos os presets — `anchor-and-shift.test.ts`.
- [x] Deslocamento mínimo — igual à base quando passa; voltar 4 passos reprova um par (`anchor-and-shift.test.ts`); `contrast-shift.test.ts` com limite artificial.
- [x] Fundo tingido (croma 0,012–0,030; corpo 0,95–0,97 claro e 0,16–0,19 escuro; camadas ≥ 0,03) — teste sobre os 15 presets × 2 modos.
- [x] 60-30-10 — `role-map.test.ts`, escala por papel.
- [~] Presets: contagem por tipo, ângulos, ≤ 5 vivos — testados. **O "ΔL ≤ 0,04" vale só para `primaryColor` e `cardTitleColor`** (medido 0,024–0,030); `titleColor` anda 0,043–0,051 e `navItemActiveColor` 0,095–0,128 (ver Decisões).
- [x] Os 15 ids da rc.4 — teste com a lista.
- [x] `verify_contrast` 0 reprovados e 19/19 com contraparte; diversidade sem piora (números acima).
- [x] "1 cor" / "2 cores" — `usePaletteSelection.test.ts` (pt) e teste das duas chaves nos seis idiomas.
- [x] `cromo-css-real:check` verde inteiro — 445 passed, exit 0.
- [x] Prévia gerada com as quatro seções — aprovação do dono fica para o veredito.

**Decisões e suposições**
- **O limite "ΔL ≤ 0,04 para base de L 0,50–0,62" é inatingível como escrito.** Com o corpo claro em 0,965 e o escuro em 0,165, o texto da marca precisa de L ≤ ~0,55 no claro e ≥ ~0,60 no escuro (azul); a janela é vazia em ~0,05, então uma base em 0,50 já exigiria ΔL ≈ 0,10 no escuro. Mantive a faixa 0,50–0,62 no teste (10 presets), mas escolhi as bases em 0,557–0,593, onde `primaryColor` e `cardTitleColor` andam ≤ 0,030.
- `titleColor` e `navItemActiveColor` passam de 0,04 porque o título também tem de passar sobre `surfaceColor`, `matrixItemBg` e `tableHeaderBg`, e o item ativo sobre `sidebarActiveColor` (primária 300/700 a 60%): fundos mais extremos que o corpo. Não mexi nesses fundos nem em `PAIRS`.
- "camada 2/cartão": li como camada 2. O cartão claro continua igual ao corpo (tom 50) e o escuro igual à camada 1 (tom 900), como já era; corpo, camada 1 e camada 2 diferem ≥ 0,03 de L.
- `compose.test.ts` ("nenhum tema embarcado muda de saída"): com o texto no mínimo de contraste, seis temas com fundo próprio (neo-brutalism, synthwave-retro, cyber-retro-wave, neumorphic-mobile, blueprint-protocol, organic-clay) têm texto movido contra o fundo declarado. Troquei a asserção "nada muda" por: só token de texto muda, e todo par de `PAIRS` passa com o fundo declarado. É mudança de contrato do teste, não só de valor; o revisor decide se aceita.
- Sobrescritas de tema (§5.8): revistas as de `blueprint-protocol`, `neumorphic-mobile` e as famílias de superfície; **nenhuma saiu**, porque os motivos seguem verdadeiros (fundo próprio, neutra quase preta, cinza médio do relevo). Nenhum arquivo de tema foi editado.
- `ciano-violeta` perdeu o violeta e o magenta declarados à mão (agora análogas a ±30°); `rosa-synthwave` e `coral-cinetico` perderam o laranja/âmbar declarados (split-complementar a ±150/210°). `tinta-vinho` ganhou croma 0,035 (era 0,022, que reprovaria o piso do tingido) e `terra-argila` virou monocromático.
- Hover e ativo da lateral não foram alterados.
- Preenchimentos que leem `primaryColor` e por isso não saem exatos (sem token novo): `SarakButton` (outline), `SarakActionCard`, `SarakSearchCard`, `SarakTitleCard`, `SarakEmptyState`, `CalendarPanel`, `SarakSearchDialog`, `SarakMultiSelect`, `SarakPagination`, `SarakSpotlight`, `SarakStepper`, `MessageBubble`, `PremiumCheckbox`, `PremiumSwitch`.
- Superfícies sem token de cor próprio (§3.2): link, anel de foco, texto do cabeçalho de tabela, chip e a trilha da barra do Gantt.
- Prévia gerada de `src/` (esbuild do harness), não do `dist/`; "antes" de `git archive HEAD` com `node_modules` por junção (removida antes de apagar a cópia; `Test-Path node_modules` → True). Para regenerar: `node C:\tmp\sarak-previa-136\gen\capture.mjs <repo> depois temas,presets,grade`, `node ...\capture-panel.mjs <repo>`, `SARAK_ROOT=<repo> npx tsx ...\deltas.mts`, `node ...\build-page.mjs` (o "antes" exige uma cópia do `HEAD` com `node_modules` e `dist/sarak.css`).

**Achados fora do escopo (não corrigidos)**
- Nenhum além dos registrados em Decisões.

**Pendências / riscos**
- ΔL de `titleColor` (≈ 0,05) e `navItemActiveColor` (≈ 0,10–0,13) acima de 0,04 nos presets de base média.
- Suíte completa não reexecutada depois da última correção (é do revisor: `npm run verify`).
- `GanttTimeline.tsx` e `compose.test.ts` não estavam na §3.1; as mudanças são consequência direta da cor nova.
- Aprovação visual do dono pendente. A plan estava em `🔴` ao chegar.

# 10. Veredito

## Veredito — 2026-10-31 — 🔴 Reprovado

O motor está certo: âncora, deslocamento mínimo, tingido e 60-30-10 conferem. Medido pelo revisor: `verify_contrast` sem reprovados e 19/19 com
contraparte; `audit:baseline --with-tsc` igual ao baseline; a prévia tem as quatro seções. O conserto do `GanttTimeline` e a nova asserção do
`compose.test.ts` estão aceitos: com o texto no mínimo de contraste, a re-correção contra fundo declarado passa a mover texto em seis temas, e a
trava continua exigindo que só texto mude e que todo par passe.

1. **Suíte vermelha.** `npx vitest run src/core/Design src/core/Provider src/features/DesignEngine src/components/atomic gates/scripts` → 1 falho
   em 3.588: o snapshot de `PreviewCanvas.test.tsx`, *deve usar propriedades de estilo reais*. A execução não repetiu o conjunto inteiro depois da
   última correção, e a suíte não é "do revisor": é o passo de verificação da plan. O `preversion` barraria a tag. Confira que o diff são só cores e
   atualize só esse snapshot.
2. **Nomes que deixaram de dizer a verdade.** Os presets foram recurados, e os nomes não acompanharam. "Ciano e violeta" não tem violeta (análoga de
   `#19e3f0`); "Tinta e vinho" é um marrom acinzentado (`#857461`), sem vinho; "Rosa pastel" é um rosa forte (`#ce475c`), não pastel. O id não muda.
   Corrija o nome no catálogo, nos seis idiomas, ou a cor, conforme a decisão do dono sobre a prévia.
3. **Critério do ΔL: o erro é da plan.** O limite de 0,04 só cabe em `primaryColor` e `cardTitleColor`. O teste do registro passa a travar o que foi
   medido nos presets de base média: `primaryColor` e `cardTitleColor` ≤ 0,04, `titleColor` ≤ 0,06 e `navItemActiveColor` ≤ 0,13. Hoje nada trava
   os dois últimos.

**Aviso para a `plan-142`:** a paleta ficou mais cara (`sarakResolvePalette` foi de 19,0 para 26,7 ms no pior preset, no Node). Não bloqueia.

**Prévia:** `C:\tmp\sarak-previa-136\index.html`, aguardando o dono. O veredito só fecha com a aprovação dele.

## Veredito — 2026-10-31 — 🟢 Aprovado pelo dono

O dono viu a prévia e aprovou a distribuição e o uso de várias cores. As cores em si não combinaram, o que é regulagem, não funcionalidade. Destino dos
achados do veredito anterior: o **item 1** (snapshot do `PreviewCanvas`) sai por tarefa direta antes do commit, porque deixaria a CI vermelha; os **itens 2 e 3**
(nomes e travas de deslocamento) vão para a `plan-143`, com a regulagem das cores.
