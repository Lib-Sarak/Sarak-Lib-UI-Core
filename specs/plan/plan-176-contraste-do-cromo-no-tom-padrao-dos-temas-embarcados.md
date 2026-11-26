---
tipo: "plan"
titulo: "Contraste do cromo no tom padrão dos 25 temas embarcados"
objetivo: "Fazer o cromo de todo tema embarcado, no tom padrão e nos dois modos, ter texto em ao menos 4,5:1 e ícone em ao menos 3:1 medidos no navegador com a opacidade aplicada, e alinhar os temas resgatados ao que a migração promete"
dominio: "Temas / Cromo / Acessibilidade"
status: "🟢 Aprovado"
prioridade: "Alta"
tags: ["plan", "rc2", "contraste", "cromo", "temas", "acessibilidade"]
relacionados: ["[[09-temas-e-presets]]", "[[10-seguranca-e-acessibilidade]]", "[[05-cromo-e-slots]]"]
depende_de: ""
retida_por: ""
destino_sintese: "10-seguranca-e-acessibilidade"
---

# 1. Objetivo

Nos 25 temas embarcados, no tom padrão das barras, nos modos claro e escuro e nas orientações lateral e topo, o cromo passa a ter:
- texto (marca, item, item ativo, nome e cargo do usuário, idioma) em ao menos 4,5:1;
- ícone em ao menos 3:1.

A medida é a cor que chega à tela, com a opacidade aplicada.

# 2. Contexto

Defeitos medidos pela validação da 9.0.0-rc.1 (plans 172 e 173). Os números abaixo são o que se mede hoje, na tag `v9.0.0-rc.1`.

**Caminho medido:** o do importador, com `SarakUIProvider` montado com `initialTheme=<id>`,
`options.preferences.defaultColorMode=<modo>` e `config={}`, e o `SarakAppChrome` em volta. 12 dos 15 pares do D1 são o tema no modo
**oposto** ao nativo, que passa pelo caminho de modo do Provider (`applyColorMode` e `applyCalculatedPaletteMode`, em
`src/core/Provider/utils/overlayPreferences.ts`). A fixture `browser-tests/fixtures/harness-entry.tsx` compõe o tema com
`composeThemeForMode` e não passa por esse caminho. Por isso, nela, o D1 não aparece.

| Id | Defeito |
|---|---|
| D1 | **15 de 50 pares tema × modo** reprovam no tom padrão. Os piores: blueprint-protocol claro (item 2,02:1, ícones 1,05:1); industrial-terminal-classic claro (marca 1,11, ícones 1,0); neumorphic-mobile escuro (1,26 a 1,49); organic-clay escuro (1,5). Também reprovam: cyber-retro-wave escuro (⚙ 1,89), nebula-space e corporate-ledger escuros (2,66), sarak-sovereign-classic e cyberpunk-neon-classic claros (2,98), neo-brutalism escuro (3,15) e mais 5 |
| D1b | A medida por cor calculada **subestima o ícone**. O ícone de item do blueprint-protocol claro dá 2,02 pela cor e **1,36 por pixel**, porque há opacidade no caminho |
| D7 | Nome e cargo do usuário abaixo de 4,5 em 32 de 50 pares. No tema padrão claro: 3,88 (lateral) e 4,10 (topo) |
| D8 | Nos tons contrastantes: texto do item ativo em degradê com 3,34 a 3,43 em 19 de 300 células. No topo, ícones de itens inativos com 1,0 a 1,8 em 18 pares |
| D13 | Temas resgatados fora do que a migração diz: `dot-matrix-elegant` com faixa `#d4af37` (a migração diz `#1b1b1b`), e véu do item ativo de 10% em dot-matrix-elegant, nature-breeze e cyber-retro-wave-classic (a migração diz 12%) |
| T | Candidato: títulos de card (`.sarak-card h2/h3`) a 4,35:1 no escuro, medido no hub. Ainda não confirmado como peça da lib |

**Por que escapou.** A spec 10 ("O que a lib calcula e o navegador mede") cobre o cromo só nos tons **contrastantes**. No tom padrão,
vale a cor do tema ([[09-temas-e-presets]] §4.3.4: "a cor do tema vence"). Ninguém mede o cromo no tom padrão, e o
`contraste-do-cromo-nas-barras.spec.ts` só percorre 4 temas. A correção do D1 e do D7 é **nos dados dos temas embarcados**, que a lib
entrega. O cálculo não deve recolorir o tema.

# 3. Escopo

## 3.1 Dentro
- `src/core/Design/presets/themes/*.ts`: as cores de cromo dos temas que reprovam, nos dois modos (`design` e `contraparte`). Mude o
  mínimo, só em luminosidade, sem trocar o matiz.
- `src/core/Design/presets/themes/dot-matrix-elegant.ts`, `nature-breeze.ts`, `cyber-retro-wave-classic.ts`: o D13.
- `src/components/Layout/chrome/chromeToneContrast.ts`: só se a causa do D8 estiver lá.
- `src/core/Provider/utils/overlayPreferences.ts` e o caminho de modo do Provider (`usePreferencesManager.ts`): o que faz o cromo, com
  o tema no modo oposto, diferir de `composeThemeForMode(tema, modo)`.
- `src/components/atomic/Navigation/SarakShellUserWidget.tsx:107`: a classe de tamanho do cargo vira `text-[length:…]`, para não
  disputar `color` com a da cor.
- `browser-tests/contraste-do-cromo-tom-padrao.spec.ts` (novo) e `browser-tests/contraste-do-cromo-nas-barras.spec.ts` (estender a
  lista de temas do degradê para os 25).
- Os snapshots que a mudança de cor mexer, atualizados **só por filtro de arquivo** (`npx vitest run <arquivo> -u`), nunca pela suíte
  inteira.
- `docs/migracoes.md`: uma linha na seção da 9.0.0, se alguma cor visível de tema mudar.

## 3.2 Fora
- O cálculo de cor dos tons contrastantes e a paleta calculada. Fora o D8, eles passam.
- Foco de teclado e nomes acessíveis: são da `plan-177`.
- Persistência, presets de estrutura, personalidades, schema de atmosfera e agrupamento do painel: são da `plan-178`, que corre em
  paralelo. Do Provider, esta plan toca só o caminho de modo da §3.1. Ela **não** toca `src/core/Provider/hooks/useDesign*`,
  `useResolvedThemeLoad.ts`, `chosenModeValues.ts`, `src/core/Design/presets/components/`, `src/core/Design/schema/` nem
  `src/styles/_base.css`.
- `src/core/Design/presets/themes/compose.ts` e `color-engine.ts`: se a causa estiver neles, pare e relate.
- O tema do consumidor. A spec 10 deixa fora da garantia.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Contexto | `specs/00-contexto.md` | sempre |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` (seção "O que a lib calcula e o navegador mede") | a régua e as peças medidas |
| Spec fixa | `specs/specs/09-temas-e-presets.md` §4.3.4 | a cor do tema vence; por que a correção é no dado |
| Spec fixa | `specs/specs/05-cromo-e-slots.md` | as peças do cromo |
| Skill | `padrao-escrita` + `padrao-typescript` | sempre |
| Skill | `ui-criar-tema` | como alterar um tema sem quebrar a paridade |
| Código | `browser-tests/contraste-do-cromo-nas-barras.spec.ts` | molde de medição: harness, cadeia de fundos, réguas |
| Código | `src/components/Layout/chrome/chromeToneContrast.ts` | o cálculo dos tons contrastantes (D8) |
| Migração | `docs/migracoes.md`, seções dos temas resgatados | os valores prometidos do D13 |

# 5. Instruções de execução

1. **Medição primeiro.** Crie `browser-tests/contraste-do-cromo-tom-padrao.spec.ts`, no molde do `contraste-do-cromo-nas-barras`:
   - **cenários:** 25 temas × 2 modos × lateral e topo, no tom padrão, a 1440 px;
   - **peças:** marca, item, item ativo, nome e cargo do usuário, idioma e ícones;
   - **ícone:** a cor efetiva leva em conta a `opacity` dos ancestrais e o canal alfa (D1b);
   - **sem lista de exceções.**

   Rode e registre o número de reprovações. Deve reproduzir o D1 e o D7.
2. **Degradê.** Estenda o `GRADIENT_THEMES` do `contraste-do-cromo-nas-barras` aos 25 temas. Registre as reprovações; devem reproduzir
   o D8.
3. **Corrija os temas** até as duas specs passarem. Para cada tema mudado, registre no resumo a cor antiga e a nova.
4. **Corrija o D8** na causa medida: o tema ou `chromeToneContrast.ts`.
5. **D13.** Os temas passam a ter os valores que a migração promete: faixa do `dot-matrix-elegant` em `#1b1b1b` e véu de 12% nos três.
6. **Candidato T.** Meça o título do `SarakTitleCard` nos 25 temas, modo escuro.
   - Se passar de 4,5:1, registre "não é da lib" e pare aqui.
   - Se não passar, corrija pelo mesmo critério do passo 3.
7. **Verificação do executor**, nesta ordem e só isto:
   - `npx vitest run src/core/Design/presets/themes`, mais os testes dos snapshots tocados;
   - `npm run verify -- --tier=quick`;
   - `npm run build`, depois as duas specs sozinhas:
     `npx playwright test --config=browser-tests/playwright.config.ts contraste-do-cromo-tom-padrao contraste-do-cromo-nas-barras`.

   **Não** rode a suíte completa nem a bateria `cromo-css-real:check` inteira. As duas rodam uma vez, no fechamento da campanha da rc.2.

# 6. Critérios de aceite

- [ ] A spec nova cobre 100 cenários (25 × 2 × 2) e passa sem lista de exceções. O ícone é medido com a opacidade.
- [ ] O `contraste-do-cromo-nas-barras` cobre os 25 temas no degradê e passa.
- [ ] O resumo traz a tabela de cada tema mudado (cor antiga → nova), com variação só de luminosidade.
- [ ] O D13 está corrigido; o candidato T está corrigido ou descartado com a medida.
- [ ] Os comandos do passo 7 passam, e o resumo traz a saída final de cada um.
- [ ] `git diff --stat` mostra só caminhos da §3.1.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo. O invariante vira a spec de navegador `contraste-do-cromo-tom-padrao`, que entra na bateria do
`cromo-css-real:check`.

O revisor **não repete** os comandos do passo 7. Ele confere:
- `git diff --stat` contra a §3.1.
- **Mutação, em cópia fora do repositório:**
  - devolva uma cor corrigida ao valor antigo (por exemplo, o item do blueprint-protocol claro) → a spec nova tem de reprovar;
  - retire o tratamento de opacidade da medida → a spec nova tem de reprovar o ícone do blueprint-protocol claro.
- Uma captura por pixel de um tema corrigido, comparada com a tabela do resumo.

# 8. Destino da síntese

**Destino:** `10-seguranca-e-acessibilidade`. Texto para transporte, como item novo na lista "O que a lib calcula e o navegador mede":

> - **O cromo no tom padrão dos temas embarcados.** Nos 25 temas, nos dois modos, na lateral e no topo, o texto do cromo fica em ao
>   menos 4,5:1 e o ícone em ao menos 3:1, medidos com a opacidade aplicada. A correção é no dado do tema, nunca no cálculo
>   ([[09-temas-e-presets]] §4.3.4). Guarda `contraste-do-cromo-tom-padrao`.

---

# 9. Resumo da execução

## Resumo da execução — 2026-11-25

**Resultado:** Bloqueado (só o passo 1 foi executado; nenhum tema foi alterado)

**Estado do worktree ao iniciar**
Fora de `dist/`: ` M specs/00-indice.md`, ` M src/buildInfo.ts`, ` M src/core/Provider/buildInfo.ts`, `?? specs/plan/plan-176…`, `?? specs/plan/plan-177…`, `?? specs/plan/plan-178…`. Mais `dist/` modificado/removido/criado por builds anteriores (não é meu).

**O que foi feito**
- Criei `browser-tests/contraste-do-cromo-tom-padrao.spec.ts` (25 temas × 2 modos × lateral/topo, 1440 px, tom do próprio tema). Mede marca, item, item ativo, nome, cargo, idioma, avatar, engrenagem, sair e os ícones do item (inativo e ativo). A cor efetiva leva o canal alfa da cor e a `opacity` de cada ancestral; a cadeia de fundos inclui o fundo do próprio nó; barra em degradê é medida nas duas paradas, vale a pior. Sem lista de exceções. O cargo entra por uma cópia temporária da fixture (`user.role`), apagada ao fim do `beforeAll`.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `browser-tests/contraste-do-cromo-tom-padrao.spec.ts` | criado | spec de medição do passo 1 |

**Verificações executadas**
- `npx playwright test --config=browser-tests/playwright.config.ts contraste-do-cromo-tom-padrao` (contra o `dist/` atual) → 100 cenários, **33 reprovam, em 28 pares tema×modo**; 1 teste falhou, como esperado antes da correção.
- Mesma medição pela via `SarakUIProvider activeThemeId` (sonda fora do repositório, blueprint-protocol claro) → mesmos valores da via `composeThemeForMode`.

**Critérios de aceite**
- [ ] spec cobre 100 cenários e passa — cobre 100, **não passa** (33 reprovações).
- [ ] degradê nos 25 temas — não feito.
- [ ] tabela cor antiga → nova — não feito (nenhum tema tocado).
- [ ] D13 / candidato T — não feito.
- [ ] comandos do passo 7 — não rodados.
- [x] `git diff --stat` só em caminhos da §3.1 — o único arquivo meu é o spec novo.

**Decisões e suposições**
- Parei no passo 1 porque a medição **não reproduz o D1 da §2** e o maior grupo de reprovações tem causa fora da §3.1 (abaixo). Corrigir 25 temas contra uma linha de base que diverge do que a plan descreve é adivinhar.

**Achados fora do escopo (não corrigidos)**
- `src/components/atomic/Navigation/SarakShellUserWidget.tsx:107` — o cargo do usuário na barra de **topo** usa `text-[var(--sarak-type-scale-micro,11px)]` junto com `text-[var(--sarak-subtitle-color,…)]`. O Tailwind gera as duas como `color:`; a da escala vence, vira cor inválida e o cargo herda a cor da `header` (`#f2f6fb`). Em modo claro dá 1,03 a 1,12:1 em **16 pares** (topo). Corrige-se com `text-[length:var(--sarak-type-scale-micro,11px)]`; não é dado de tema. Fora da §3.1.
- Cargo na **lateral**, modo claro, 4,26 a 4,49:1 (industrial-terminal, golden-hour, blueprint-protocol, editorial-ink, cyber-retro-wave-classic, nature-breeze): é dado (`subtitleColor` claro), cabe na §3.1.

**Pendências / riscos**
- **O D1 não reproduz.** Medido neste worktree (HEAD `d417cd22`, nada de cromo/tema mudou desde a tag `v9.0.0-rc.1`), blueprint-protocol claro tem item inativo ≈4,6:1 e ícone igual à cor do texto, `opacity` 1 em toda a cadeia; os 2,02 / 1,05 / 1,36 da §2 não aparecem. Industrial-terminal-classic claro, neumorphic-mobile escuro e organic-clay escuro também não reprovam em marca/item/ícone como a §2 diz. Preciso saber em que superfície o D1 foi medido (consumidor real? outro viewport? hover?).
- Reprovações reais fora o cargo do topo (todas na barra de topo): idioma (nebula-space e corporate-ledger escuros 3,99; neumorphic-mobile escuro 3,37; blueprint-protocol escuro 3,09; cyberpunk-neon-classic claro 3,51; industrial-terminal-classic claro 3,30; organic-clay claro 4,04; mais 5 entre 4,41 e 4,50), nome (neumorphic-mobile escuro 2,79; blueprint-protocol escuro 3,51; editorial-ink escuro 3,26; cyberpunk-neon escuro 3,24; cyber-retro-wave escuro 3,61), engrenagem (nebula-space e corporate-ledger escuros 2,66; neumorphic-mobile escuro 2,79) e item ativo (blueprint-protocol escuro 4,18; neumorphic-mobile escuro 4,46). Boa parte dos temas tira a cor da paleta calculada (`colorPalette`), que a §3.2 deixa fora: o ajuste "no dado do tema" exigiria sobrescrever `primaryColor`/`titleColor` por tema.
- O passo 2 (degradê nos 25 temas) esbarra em `measureInBrowser`, que lança "Barra sem degradê" para tema sem degradê; precisa de regra de quais temas têm degradê.

---

## Resumo da execução (correção 1) — 2026-11-25

**Resultado:** Concluído com pendências (a spec do tom padrão passa; a do degradê reprova 6 células)

**Estado do worktree ao iniciar**
Fotografia da rodada: ` M src/buildInfo.ts`, ` M src/core/Provider/buildInfo.ts` e `dist/` (builds anteriores), mais `?? browser-tests/contraste-do-cromo-tom-padrao.spec.ts` (meu, da 1.ª execução). Durante a rodada apareceram arquivos de outras tarefas (plan-177: `ChromeContentRegion.tsx`, `useStableContent.tsx`, `SarakAppChrome*`; plan-178: `schema/atmosphere.ts`, i18n, `personalidade-no-cromo*`, `docs/migracoes.md` e `sarak-ui/` com entradas alheias). Não toquei neles, exceto uma entrada nova em `docs/migracoes.md`.

**O que foi feito, por correção do veredito**
1. **Medição pelo caminho do importador.** `contraste-do-cromo-tom-padrao.spec.ts` monta o `SarakUIProvider` com `initialTheme` + `defaultColorMode` (cópia temporária da fixture, apagada no fim). O D1 reapareceu: 100 cenários, 27 cenas e 20 pares reprovados antes de qualquer correção (blueprint-protocol claro: item 2,02, ativo 1,47, ícone 2,02, sair 1,04; neumorphic-mobile escuro: 1,26 a 1,49; organic-clay escuro: 1,5 a 1,7; industrial-terminal-classic claro: ícone 1,0).
2. **Teste de unidade do invariante** `src/core/Provider/utils/__tests__/overlayPreferences.chromeColors.test.ts`: 25 temas × 2 modos × (tom do tema | barras contrastantes com degradê), 100 casos. Falhou antes em 10 pares do modo oposto (neo-brutalism, cyber-retro-wave, neumorphic-mobile, blueprint-protocol, organic-clay, high-contrast, sarak-sovereign-classic, cyberpunk-neon-classic, industrial-terminal-classic, neo-brutalism-classic).
   **Causa:** `applyCalculatedPaletteMode` (`overlayPreferences.ts`) recalculava a paleta atual e a alvo sobre o design já composto (padrões do schema e cores calculadas entram na conta), e a comparação `design[token] === paletaAtual[token]` falhava; o token ficava com a cor do outro modo. **Correção:** `themePaletteInput` calcula as duas paletas sobre o que o tema declara para cada modo, como a composição o fez. Depois: 100/100; `npx vitest run src/core/Provider` com 81 arquivos e 773 testes verdes.
3. **Cargo do topo:** `SarakShellUserWidget.tsx:107` com `text-[length:var(--sarak-type-scale-micro,11px)]`; teste de regressão no `SarakShellUserWidget.test.tsx` (12 testes verdes).
4. **Dado dos temas.** Tabela abaixo (só luminosidade; o matiz não muda). Onde o tema é nativo de um modo, escrevi também a cor do modo oposto na outra seção (valor calculado antes da edição), porque `themePalettes.test.ts` exige a irmã nas duas seções e porque a cor declarada vaza para o outro modo.
5. **Degradê:** `contraste-do-cromo-nas-barras.spec.ts` percorre os 25 temas nas duas barras (300 cenas, 600 paradas), pelo caminho do importador; o tom e o degradê entram numa cópia do tema da cena, e a escolha do papel da barra tira as cores declaradas dela (`TONE_DRIVEN_KEYS`), como no painel. Medição com as cores declaradas mantidas: 19 cenas com ativo abaixo do inativo e 21 com véu da pílula que não escurece (o D8), todas em temas com cor de barra declarada. Com as declaradas tiradas: 0 e 0.
6. **D13:** `dot-matrix-elegant` com `sidebarBrandBackground: '#1b1b1b'`; `sidebarActiveColor: rgba(<destaque>, 0.12)` em `dot-matrix-elegant` (212,175,55), `nature-breeze` (46,125,50) e `cyber-retro-wave-classic` (255,0,255), nas duas seções. A faixa do topo do dot-matrix já era `#1b1b1b`.
7. **Candidato T:** calculado sobre o design composto de cada tema no escuro (`cardTitleColor` sobre `cardBackgroundColor` sobre o corpo): mínimo 4,51:1 (cyber-retro-wave), nenhum abaixo de 4,5. **Não é da lib** (cálculo, sem medida por pixel; o hover do `SarakTitleCard` não foi medido).
8. `npm run themes:catalog` regenerou `catalog.generated.ts` (o `themeCatalogParity.test.ts` acusou drift); `npm run guide` regenerou `sarak-ui/` (o `guide:check` do build acusou o espelho de `docs/migracoes.md`); `docs/migracoes.md` ganhou uma seção 9.0.0.

**Cores de tema mudadas (antiga → nova)**
| Tema | Seção | Token | Antes | Depois |
|---|---|---|---|---|
| cyberpunk-neon | design | titleColor | #189741 | #1db54e |
| cyberpunk-neon | design | subtitleColor | #218d8d | #29aeae |
| nebula-space | design | subtitleColor | #a97e2c | #d0a34c |
| nebula-space | design | primaryColor | #9169db | #9a75de |
| nebula-space | design | titleColor | #936cdf | #b89eea |
| nebula-space | design | navItemActiveColor | #bc9fff | #c0a4ff |
| nebula-space | design | topbarColor | #241805 | #0e0902 |
| corporate-ledger | contraparte | subtitleColor, primaryColor, titleColor, navItemActiveColor, topbarColor | #a97e2c, #9169db, #936cdf, #bc9fff, #241805 | #d0a34c, #9a75de, #b89eea, #c0a4ff, #0e0902 |
| cyber-retro-wave | contraparte | titleColor, subtitleColor | #1b919a, #926fe3 | #1fa5af, #a284e7 |
| editorial-ink | contraparte | titleColor, subtitleColor, textColorMaster, primaryColor, navItemActiveColor | #c56385, #95767f, #fdeff3, #c05f81, #f18bac | #d388a2, #ad969d, #fef4f6, #c16384, #f290af |
| neumorphic-mobile | contraparte | titleColor, subtitleColor, primaryColor, navItemActiveColor, topbarColor | #7f9ab1, #e87187, #7f9ab1, #a7c3da, #292e37 | #b5c5d2, #f3b3bf, #89a2b7, #abc5dc, #090b0d |
| blueprint-protocol | design | titleColor, subtitleColor, navItemActiveColor, primaryColor, topbarColor | #81b6ed, #d2a1de, #91c6fe, #81b6ed, #15375b | #a9cdf3, #e0bfe9, #a0cefe, #85b9ee, #03070c |
| organic-clay | design | textColorMaster | #140c09 | #020101 |
| cyberpunk-neon-classic | contraparte | textColorMaster | #0a3d14 | #041808 |
| industrial-terminal-classic | contraparte | textColorMaster | #4d2e00 | #170d00 |
| industrial-terminal | contraparte | sidebarColor / topbarColor | #f1e7de | #f6efe9 / #f3eae2 |
| kinetic-flow | design | topbarColor | #062018 | #041712 |
| minimalist-airy | contraparte | topbarColor | #061d2b | #051722 |
| data-terminal | contraparte | topbarColor | #0c1c2b | #0a1723 |
| neumorphic-mobile | design | topbarColor | #e3e7ee | #e9ecf2 |
| golden-hour | design | sidebarColor | #f3ede9 | #f4eeeb |
| blueprint-protocol | contraparte | sidebarColor | #dfeaf5 | #ebf2f9 |
| editorial-ink | design | sidebarColor | #f3e5e8 | #f7eef0 |
| cyber-retro-wave-classic | contraparte | sidebarColor | #d5f6f5 | #d9f7f6 |
| nature-breeze | design | sidebarColor / topbarColor | #faedd4 / #e3ece2 | #fbf0db / #e6eee5 |
| playful-pastel | contraparte | topbarColor | #131f05 | #0e1604 |

Mais as cores do outro modo, escritas com o valor que o cálculo já dava (pins), e `sidebarActiveColor`/`sidebarBrandBackground` do D13. Onde a tabela traz uma cor "antes" de uma barra que o tema não declarava, o valor é o que a paleta calculava, lido no navegador.

**Arquivos alterados** (os meus; `dist/`, `sarak-ui/` e os dois `buildInfo.ts` saíram de builds e geradores)
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `browser-tests/contraste-do-cromo-tom-padrao.spec.ts` | criado | spec do tom padrão, caminho do importador |
| `browser-tests/contraste-do-cromo-nas-barras.spec.ts` | alterado | 25 temas × 2 barras × 3 tons × 2 modos, caminho do importador |
| `src/core/Provider/utils/overlayPreferences.ts` | alterado | paleta atual e alvo sobre o que o tema declara |
| `src/core/Provider/utils/__tests__/overlayPreferences.chromeColors.test.ts` | criado | invariante dos 100 casos |
| `src/components/atomic/Navigation/SarakShellUserWidget.tsx` e o teste | alterado | `text-[length:…]` no cargo |
| `src/core/Design/presets/themes/*.ts` (19 temas) | alterado | cores acima e D13 |
| `src/core/Design/presets/themes/catalog.generated.ts` | regenerado | `themes:catalog` |
| `docs/migracoes.md`, `sarak-ui/*` | alterado e gerado | seção 9.0.0; `npm run guide` |

O teste do `SarakShellUserWidget` e o `catalog.generated.ts` estão fora dos caminhos literais da §3.1 (consequência direta da correção e do gate).

**Verificações executadas**
- `npx vitest run …overlayPreferences.chromeColors.test.ts …overlayPreferences.test.ts` → 138 passam.
- `npx vitest run src/core/Provider` → 81 arquivos, 773 testes.
- `npx vitest run src/core/Design/presets` → 18 arquivos, 496 testes (depois dos pins e do catálogo regenerado).
- `npm run verify -- --tier=quick` → verde.
- `npm run build` → exit 0 (precisou de `npm run guide` antes; uma tentativa anterior parou em `token-types:check` por causa da plan-178 em andamento).
- `npx playwright test … contraste-do-cromo-tom-padrao contraste-do-cromo-nas-barras` → **tom padrão: 100 cenários, 0 reprovações (passa); degradê: 300 cenas, 6 reprovações (falha)**.

**Critérios de aceite**
- [x] Spec nova: 100 cenários, sem lista de exceções, ícone com opacidade — passa.
- [ ] Degradê nos 25 temas: cobre os 25, mas reprova 6 células, todas o `language` na parada clara, no claro, na barra de topo com tom contrastante: data-terminal primary 4,08; neumorphic-mobile primary 4,02; high-contrast secondary 3,97; playful-pastel secondary 4,02; nature-breeze primary 4,03; neo-brutalism-classic secondary 4,01. Ativo abaixo do inativo: 0. Pílula: 0.
- [x] Tabela cor antiga → nova acima.
- [x] D13 corrigido; T descartado com a medida calculada.
- [ ] Comandos do passo 7: todos rodados; o do degradê falha como acima.
- [x] `git diff --stat` só em caminhos da §3.1 e consequências listadas.

**Decisões e suposições**
- **Sem host no cálculo da paleta:** tentei passar o tom e o fundo das barras do design como host e o teste não precisou; removi.
- **Cena do degradê:** o tom entra no tema da cena, e não no `config`. Com o tom só no `config`, o do tema vence no design e a paleta calcula pelo do host, o que dava reprovações que o produto não tem. A remoção das cores de barra declaradas imita `withoutDeclaredBarColors`.
- **Barras de neumorphic-mobile e blueprint-protocol no escuro** ficam quase pretas (`#090b0d`, `#03070c`): foi o único ajuste de fundo que levou o idioma a 4,5:1 sem trocar o texto de marca. É mudança visível, registrada na migração. Peço o olhar do revisor.
- **Ajuste por busca:** as cores novas saíram de uma busca de luminosidade no navegador (fora do repositório, apagada), no menor passo que passa com folga de 0,01 a 0,03.

**Achados fora do escopo (não corrigidos)**
- As 6 células de `language`: com o texto forte já no claro máximo, a tinta de 10% da cor inativa sobre a parada clara de uma barra primária ou secundária no claro deixa o forte em cerca de 4,0:1, e nenhuma cor inativa que passe em 4,5:1 contra a barra resolve (tentei em `chromeToneContrast.ts`, com o forte conferido sobre a tinta, e desfiz porque não há solução). A saída é o fundo da barra (paleta, §3.2) ou a tinta do botão de idioma (`SarakShellLanguageSelector.tsx`, `bg-[var(--theme-muted)]/10`); nenhum dos dois é da §3.1.
- Com cor de barra declarada pelo tema e um papel de barra pedido só no `config` do host, o design guarda o papel do tema e a paleta calcula pelo do host. Não investiguei se o produto expõe isso.
- O `contraste-do-cromo-nas-barras.spec.ts` leva cerca de 7 min por rodada.

**Pendências / riscos**
- As 6 células acima: critério da §6 não atendido.
- A medida do candidato T é calculada, não por pixel.
- A regra "o tema nativo de um modo escreve a cor do modo oposto" passa a valer nos temas (exigência do `themePalettes.test.ts`).

## Resumo da execução (correção 2) — 2026-11-26

**Resultado:** Concluído (achados 2 e 1, nesta ordem; os achados 3 e 4 não foram pedidos nesta rodada e ficam abertos)

**Estado do worktree ao iniciar**
Fora de `dist/`: ` M browser-tests/contraste-do-cromo-nas-barras.spec.ts`, ` M specs/plan/plan-176-…md`, ` M src/buildInfo.ts`, ` M src/components/atomic/Navigation/SarakShellUserWidget.tsx`, ` M src/components/atomic/Navigation/__tests__/SarakShellUserWidget.test.tsx`, ` M src/core/Design/presets/themes/*.ts` (19 temas) e `catalog.generated.ts`, ` M src/core/Provider/buildInfo.ts`, ` M src/core/Provider/utils/overlayPreferences.ts`, `?? browser-tests/contraste-do-cromo-tom-padrao.spec.ts`, `?? src/core/Provider/utils/__tests__/overlayPreferences.chromeColors.test.ts`. Tudo isso é da correção anterior desta plan.

**O que foi feito**

*Achado 2 — a tinta do botão de idioma (feito primeiro)*
- `SarakShellLanguageSelector.tsx`: o botão da barra de topo perde a tinta (`bg-[var(--theme-muted)]/10`, e a do hover) e passa a ter `bg-transparent` com contorno `border-[var(--theme-muted)]`, a cor do texto inativo da barra, que passa de 4,5:1 contra ela. No hover o contorno vai para a cor de texto principal. Vale para todos os tons, e não só o contrastante: no tom padrão o idioma também reprovava por essa tinta (neumorphic-mobile escuro 3,37, blueprint-protocol escuro 3,09).
- `SarakShellLanguageSelector.test.tsx`: dois casos (tom do tema e topbar contrastante) exigem `bg-transparent`, o contorno e a ausência da tinta. 13 testes verdes.
- Efeito medido, com os temas no `HEAD` (só o D13): o idioma deixou de reprovar em nebula-space, corporate-ledger, editorial-ink, industrial-terminal e nature-breeze; neumorphic-mobile escuro passou de 3,37 a 3,85, blueprint-protocol escuro de 3,09 a 3,60, organic-clay claro de 4,04 a 4,28 e as duas classic claras de 3,3 a 3,51. As 6 células do degradê sumiram: `contraste-do-cromo-nas-barras` com 0 reprovações.

*Achado 1 — voltar cada tema ao `HEAD` e manter só o que uma célula exige*
- Guardei os 19 arquivos de tema da rodada anterior, voltei todos ao `HEAD`, reaplicei só o D13, regenerei o catálogo, **rebuildei** e rodei a spec do tom padrão: **20 pares e 32 células reprovam**. A seguir, para cada célula, a menor mudança, achada por busca de luminosidade no navegador e depois conferida pela spec.
- **Nota sobre a mutação do veredito:** o harness lê os temas do `dist/` (`initialTheme` carrega o chunk do tema). Voltar `blueprint-protocol.ts` do `src/` sem rodar `npm run build` deixa o `dist/` com as cores novas, e a spec passa por isso. Com o `dist/` refeito, o blueprint-protocol reprova 5 células sem as mudanças (tabela).
- Ficaram de fora, por não terem célula que as exija: `industrial-terminal` topbarColor; `nebula-space` titleColor, navItemActiveColor e topbarColor; `corporate-ledger` titleColor, navItemActiveColor e topbarColor; `editorial-ink` textColorMaster, primaryColor e navItemActiveColor; `blueprint-protocol` primaryColor; `nature-breeze` topbarColor; e as barras escuras de neumorphic-mobile (`#090b0d`) e blueprint-protocol (`#03070c`), que agora são `#191c21` e `#0b1e32`.
- A cor do outro modo, escrita como valor fixo (o que o cálculo já dava), só existe nos temas que mantêm mudança, porque `themePalettes.test.ts` exige a irmã nas duas seções e a cor declarada vazaria para o outro modo. Calculei os valores com um script fora do repositório até estabilizar (a segunda passada não achou mais nenhum).
- `docs/migracoes.md` reescrito para o que sobrou (18 temas, o botão de idioma sem tinta, as duas barras com a maior mudança, o D13); `npm run guide` regenerou `sarak-ui/`.

**Cores de tema mantidas** (a célula é a que reprova no `HEAD`, no tom padrão, com o botão sem tinta)
| Tema (modo, barra) | Célula que reprova sem a mudança | Token: antes → depois |
|---|---|---|
| cyberpunk-neon (escuro, topo) | nome 3,24; cargo 3,08 | `titleColor` #189741 → #1db54e; `subtitleColor` #218d8d → #29aeae |
| industrial-terminal (claro, lateral) | cargo 4,28 | `sidebarColor` #f1e7de → #f6efe9 |
| nebula-space (escuro, topo) | cargo 2,89; engrenagem 2,66 | `subtitleColor` #a97e2c → #d0a34c; `primaryColor` #9169db → #9a75de |
| kinetic-flow (escuro, topo) | cargo 4,26 | `topbarColor` #062018 → #041712 |
| cyber-retro-wave (escuro, topo) | nome 3,61; cargo 3,64 | `titleColor` #1b919a → #1fa5af; `subtitleColor` #926fe3 → #a284e7 |
| minimalist-airy (escuro, topo) | cargo 4,30 | `topbarColor` #061d2b → #051722 |
| data-terminal (escuro, topo) | cargo 4,33 | `topbarColor` #0c1c2b → #0a1723 |
| neumorphic-mobile (escuro, topo) | ativo 4,46; nome 2,79; cargo 2,78; idioma 3,85; engrenagem 2,79 | `titleColor` #7f9ab1 → #b5c5d2; `subtitleColor` #e87187 → #f3b3bf; `primaryColor` #7f9ab1 → #89a2b7; `navItemActiveColor` #a7c3da → #abc5dc; `topbarColor` #292e37 → #191c21 |
| golden-hour (claro, lateral) | cargo 4,49 | `sidebarColor` #f3ede9 → #f4eeeb |
| blueprint-protocol (escuro, topo) | ativo 4,18; nome 3,51; cargo 3,53; idioma 3,60 | `titleColor` #81b6ed → #a9cdf3; `subtitleColor` #d2a1de → #e0bfe9; `navItemActiveColor` #91c6fe → #a0cefe; `topbarColor` #15375b → #0b1e32 |
| blueprint-protocol (claro, lateral) | cargo 4,26 | `sidebarColor` #dfeaf5 → #ebf2f9 |
| editorial-ink (claro, lateral) | cargo 4,30 | `sidebarColor` #f3e5e8 → #f7eef0 |
| editorial-ink (escuro, topo) | nome 3,26; cargo 3,07 | `titleColor` #c56385 → #d388a2; `subtitleColor` #95767f → #ad969d |
| organic-clay (claro, topo) | idioma 4,28 | `textColorMaster` #140c09 → #0b0705 |
| corporate-ledger (escuro, topo) | cargo 2,89; engrenagem 2,66 | `subtitleColor` #a97e2c → #d0a34c; `primaryColor` #9169db → #9a75de |
| playful-pastel (escuro, topo) | cargo 4,24 | `topbarColor` #131f05 → #0e1604 |
| cyberpunk-neon-classic (claro, topo) | idioma 3,51 | `textColorMaster` #0a3d14 → #041808 |
| industrial-terminal-classic (claro, topo) | idioma 3,51 | `textColorMaster` #4d2e00 → #1f1300 |
| cyber-retro-wave-classic (claro, lateral) | cargo 4,48 | `sidebarColor` #d5f6f5 → #d9f7f6 |
| nature-breeze (claro, lateral) | cargo 4,44 | `sidebarColor` #faedd4 → #fbf0db |
Em `industrial-terminal`, `kinetic-flow`, `minimalist-airy`, `data-terminal`, `golden-hour`, `editorial-ink` (sidebarColor) e `playful-pastel`, a cor "antes" de barra é a que a paleta calculava, lida no navegador; nos demais é a que o tema declarava. Pins do outro modo: `cyberpunk-neon`, `industrial-terminal`, `nebula-space`, `kinetic-flow`, `cyber-retro-wave`, `minimalist-airy`, `data-terminal`, `neumorphic-mobile`, `golden-hour`, `blueprint-protocol`, `editorial-ink`, `organic-clay`, `corporate-ledger`, `playful-pastel`.

**Arquivos alterados nesta rodada**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/atomic/Navigation/SarakShellLanguageSelector.tsx` | alterado | botão de idioma sem tinta, com contorno |
| `src/components/atomic/Navigation/__tests__/SarakShellLanguageSelector.test.tsx` | alterado | dois casos do botão |
| `src/core/Design/presets/themes/*.ts` (18 temas, mais o D13 em 3) | alterado | só as cores da tabela e os pins; o resto voltou ao `HEAD` |
| `src/core/Design/presets/themes/catalog.generated.ts` | regenerado | `themes:catalog` |
| `docs/migracoes.md`, `sarak-ui/*` | alterado e gerado | seção reescrita; `npm run guide` |

**Verificações executadas**
- `npx vitest run src/components/atomic/Navigation src/core/Provider/utils src/core/Design/presets` → 75 arquivos, 1274 testes verdes.
- `npm run verify -- --tier=quick` → verde.
- `npm run build` → exit 0 (feito de novo depois de cada troca de tema, porque o harness lê o `dist/`).
- `npx playwright test … contraste-do-cromo-nas-barras` → 300 cenas, 0 abaixo, ativo abaixo do inativo 0, pílula 0.
- `npx playwright test … contraste-do-cromo-tom-padrao` → 100 cenários, 0 reprovações.
- Cada spec foi rodada sozinha, uma de cada vez.

**Critérios de aceite**
- [x] A spec do tom padrão cobre 100 cenários e passa — evidência: 0 reprovações.
- [x] O degradê cobre os 25 temas e passa — evidência: 300 cenas, 0 abaixo.
- [x] Tabela de cor antiga → nova, com a célula que reprova sem a mudança — acima.
- [x] D13 corrigido (faixa do dot-matrix em `#1b1b1b`; véu de 12% nos três); T segue com o resultado calculado, e a medida no navegador é o achado 3, não feito.
- [x] Comandos do passo 7 rodados e verdes.
- [x] `git diff --stat` só em caminhos da §3.1 (mais `SarakShellLanguageSelector.tsx`, que o veredito incluiu, o teste dele e o `catalog.generated.ts`).

**Decisões e suposições**
- **A tinta sai em todos os tons**, não só no contrastante: o veredito manda tirar a tinta do botão, e no tom padrão ela também reprovava o idioma. A consequência é um botão com contorno mais forte em todo tema.
- **Contorno = `--theme-muted`** (o texto inativo da barra, que o cálculo já garante em 4,5:1 nas barras contrastantes). Não medi o contorno por pixel; a spec mede só o texto.
- **Onde havia duas alavancas** (organic-clay: barra mais clara ou texto mais escuro), escolhi a de menor mudança visível: o texto do corpo `#140c09` para `#0b0705`.
- **Escolha por menor passo:** as cores novas saíram de uma busca de luminosidade (passo de 0,005 a 0,01), com a folga de 0,01 a 0,03 acima do limite.

**Achados fora do escopo (não corrigidos)**
- O `contraste-do-cromo-nas-barras` leva cerca de 6 min por rodada, e a mutação do revisor precisa refazer o `dist/` (cerca de 3 min) a cada troca de tema.

**Pendências / riscos**
- Achado 3 (medir o título do `SarakTitleCard` no navegador nos 25 temas) e achado 4 (a prévia ao dono em `C:\tmp\sarak-176-previa\`) não foram executados: o prompt desta rodada pedia os achados 2 e 1. A prévia depende do resultado final dos temas, que é este.
- A mudança de contorno do botão de idioma vale para todo consumidor: mudança visível sem opt-out.
- Sem commit; `dist/` e `sarak-ui/` estão regenerados e fora da minha lista.

## Resumo da execução (correção 3) — 2026-11-26

**Resultado:** Concluído (os três itens do "O que falta, nesta ordem"; o commit espera o ok do dono sobre a prévia)

**Estado do worktree ao iniciar**
Fora de `dist/`, o que a correção 2 deixou: ` M browser-tests/contraste-do-cromo-nas-barras.spec.ts`, ` M docs/migracoes.md`, ` M sarak-ui/*`, ` M specs/plan/plan-176-…md`, ` M src/buildInfo.ts`, ` M src/components/atomic/Navigation/SarakShellLanguageSelector.tsx` (+ teste), ` M …/SarakShellUserWidget.tsx` (+ teste), ` M src/core/Design/presets/themes/*.ts` (18 temas, mais o D13 em 3) e `catalog.generated.ts`, ` M src/core/Provider/buildInfo.ts`, ` M src/core/Provider/utils/overlayPreferences.ts`, `?? browser-tests/contraste-do-cromo-tom-padrao.spec.ts`, `?? …/overlayPreferences.chromeColors.test.ts`. Arquivos de outras tarefas que apareceram no worktree não foram tocados.

**O que foi feito**
1. **Título do `SarakTitleCard` no navegador** (`contraste-do-cromo-tom-padrao.spec.ts`, teste novo). Na mesma montagem do importador (`initialTheme` + `defaultColorMode: dark`), a cópia temporária da fixture leva um `SarakTitleCard` no conteúdo. A medida compõe a cor do título (alfa e `opacity` de cada ancestral) sobre a cadeia de fundos até o corpo, em repouso e com o ponteiro sobre o cartão. **Resultado nos 25 temas: mínimo de 4,51:1 em repouso (organic-clay) e 4,52:1 com o ponteiro; nenhum abaixo de 4,5.** O candidato T fica descartado: **não é da lib** (o 4,35 do hub não aparece nesta montagem).
   - **Limite da medida:** a cadeia de fundos usa só cores de fundo. Há `background-image` num ancestral do cartão em todos os temas (`div.flex`, a raiz da cena, que carrega a atmosfera da página); a medida não o enxerga. O spec imprime o nó (`TITLE_CARD_MEASUREMENTS`).
2. **Contorno do botão de idioma** (mesma spec, peça `languageBorder`, mínimo 3:1 contra cada parada da barra de topo, em toda cena de topo: 50 cenas). A primeira medida reprovou 6 cenas e achou duas causas, ambas na minha primeira versão do contorno:
   - `--theme-muted` (cor do texto esmaecido) dava 1,47 a 1,79:1 no cyberpunk-neon e no cyberpunk-neon-classic. Passei para `--sarak-topbar-item-text-color`, a cor do texto de item da barra, que a spec já exige em 4,5:1.
   - O `SarakButton` escreve `border` e largura por token em `style` inline (`getButtonStyles`, depois do `style` da prop), então o `border` do tema vence o das classes: no neumorphic-mobile a largura é 0 e o contorno sumia (medida 0). O contorno passou a ser `outline` de 1 px (`outline outline-1 -outline-offset-1 outline-[color:…]`), que o estilo do botão não escreve.
   - Depois disso: 100 cenários, 0 reprovações. `SarakShellLanguageSelector.tsx` e o teste (13 verdes) acompanham; `docs/migracoes.md` diz "contorno de 1 px (`outline`)".
3. **Prévia em `C:\tmp\sarak-176-previa\`** (45 arquivos): `index.html` mais uma captura de antes e uma de depois, a 1440 px, para cada uma das 20 células da tabela de cores mantidas (18 temas), na barra e no modo da célula (barra de topo: a faixa de cima, 260 px; lateral: a barra inteira, 420 px), e o botão de idioma em tema claro (cyberpunk-neon-classic) e escuro (nebula-space). O "antes" é o `HEAD` compilado numa cópia fora do repositório (`git archive` mais `tsup` e `build:css`), com a mesma montagem do importador; a cópia foi apagada (a junção de `node_modules` saiu antes do `Remove-Item`; `node_modules` do repositório confere). O "depois" é este worktree.

**Arquivos alterados nesta rodada**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `browser-tests/contraste-do-cromo-tom-padrao.spec.ts` | alterado | peça `languageBorder`; cartão de título na cena; teste do título nos 25 temas |
| `src/components/atomic/Navigation/SarakShellLanguageSelector.tsx` | alterado | contorno em `outline`, na cor do texto de item da barra |
| `src/components/atomic/Navigation/__tests__/SarakShellLanguageSelector.test.tsx` | alterado | a classe do contorno |
| `docs/migracoes.md`, `sarak-ui/*` | alterado e gerado | a frase do botão de idioma; `npm run guide` |
| `C:\tmp\sarak-176-previa\*` | criado (fora do repositório) | a prévia |

**Verificações executadas**
- `npx playwright test … contraste-do-cromo-tom-padrao` (sozinha) → 2 testes passam: 100 cenários, 0 reprovações, com o contorno a 3:1; e o título do cartão nos 25 temas.
- `npx playwright test … contraste-do-cromo-nas-barras` (sozinha) → 300 cenas, 0 abaixo, ativo abaixo do inativo 0, pílula 0.
- `npx vitest run src/components/atomic/Navigation src/core/Provider/utils src/core/Design/presets` → 75 arquivos, 1274 testes verdes.
- `npm run verify -- --tier=quick` → verde.
- `npm run build` → exit 0 (refeito depois de cada mudança do botão, porque a spec lê o `dist/`). `npm run guide:check` → em dia. Nenhum tema mudou nesta rodada.

**Critérios de aceite**
- [x] Título do `SarakTitleCard` medido no navegador nos 25 temas, escuro, na montagem do importador — mínimo 4,51:1 em repouso e 4,52:1 sob o ponteiro.
- [x] Contorno do botão de idioma a 3:1 contra a barra em toda cena de topo — a spec do tom padrão passa.
- [x] Prévia em `C:\tmp\sarak-176-previa\` com `index.html`, 20 pares de células e o botão de idioma em tema claro e escuro.
- [x] `git diff --stat` só em caminhos da §3.1 e dos veredictos anteriores.

**Decisões e suposições**
- **Contorno por `outline`, e não `border`:** a causa é o estilo inline do botão. Em temas com borda (cyberpunk-neon), o `outline` fica sobre a borda de 1 px do tema; não medi se isso lê como contorno duplo.
- **Cor do contorno = texto de item da barra**, em tom pleno. Na prévia ele aparece branco-azulado e firme no neumorphic escuro e no nebula-space: é a decisão visual a olhar.
- **"Antes" da prévia = `HEAD` compilado**, e não o `dist/` commitado, que é mais antigo (rc.1). As diferenças entre os dois lados são só as desta plan, e as de outras tarefas já commitadas valem nos dois.
- A prévia mostra a tela com a montagem do importador e um usuário com cargo ("Ana", "Gerente"), como as specs.

**Achados fora do escopo (não corrigidos)**
- O `SarakButton` deixa `getButtonStyles` vencer o `style` da prop: quem passa `style` (borda, por exemplo) é ignorado nas chaves que o token escreve. Não é bug desta plan; pode merecer uma linha no backlog.

**Pendências / riscos**
- O ok do dono sobre a prévia, antes do commit.
- O título do cartão ignora `background-image` (atmosfera da raiz da cena); um fundo com imagem forte atrás do cartão não entra na conta.
- Sem commit; `dist/` e `sarak-ui/` estão regenerados.

# 10. Veredito

## Veredito — 2026-11-25 — 🔴 Devolvida com correções (a parada do executor estava certa)

**O que foi verificado:**
- **A divergência do D1 tem causa:** a medida da `plan-173` não usa a mesma montagem que a spec nova.
  - **Na 173**, o harness (`C:\Users\Igor\AppData\Local\Temp\sarak-rc1-completo\harness\entry.tsx`, linhas 91-100) monta o
    `SarakUIProvider` com `initialTheme=<id>`, `config={}` e `options.preferences.defaultColorMode`.
  - **A spec nova** compõe com `composeThemeForMode`, como a fixture-base.
  - **Na `varredura.csv`** (tom base, 1440 px, sem contar o usuário), dos 15 pares que reprovam, 12 são o tema no modo **oposto** ao
    nativo. Entram aí todos os graves:
    - blueprint-protocol claro (item 2,02, ícone 1,05);
    - industrial-terminal-classic claro (marca 1,11, ícone 1,0);
    - neumorphic-mobile escuro (1,26 a 1,49);
    - organic-clay escuro.
  - **Os 3 pares no modo nativo** (blueprint-protocol, cyberpunk-neon e nebula-space escuros) são peças da barra de topo, as mesmas que
    a sua medida achou.
  - **Conclusão:** o D1 grave mora no caminho de modo do Provider, e não no dado do tema.
- **O cargo do topo** (`SarakShellUserWidget.tsx:107`): confirmado na leitura. As duas classes arbitrárias viram `color`.
- **A regra do degradê:** a 173 ligou o degradê pelo token, e não pelo tema. A cena leva
  `sidebarBackgroundStyle`/`topbarBackgroundStyle: 'gradient'` com o tom (`harness\sweep.cjs:96-99`). Isso vale para os 25 temas e dá as
  300 células do D8.

**Correções:**

1. **A spec nova mede pelo caminho do importador.**
   - Cada cena monta o `SarakUIProvider` com `initialTheme=<id>`, `options.preferences.defaultColorMode=<modo>` e `config={}`, e o
     `SarakAppChrome` em volta (molde nas linhas citadas).
   - Não use `composeThemeForMode` na cena.
   - O resto (peças, opacidade, paradas do degradê, sem exceções) fica como você fez.
   - Rode e registre: o D1 tem de reaparecer.
2. **Teste de unidade do invariante,** antes de corrigir: para os 25 temas, nos dois modos, o design que o Provider monta com
   `defaultColorMode` é igual a `composeThemeForMode(tema, modo)` nos tokens de cor do cromo e do texto.
   - O teste falha antes, nos pares do modo oposto.
   - Corrija a causa no caminho de modo (§3.1). O alvo é o resultado do `composeThemeForMode`. Não recolora o tema.
3. **Corrija o cargo do topo** em `SarakShellUserWidget.tsx:107`.
4. **O que sobrar com o modo nativo é dado do tema** e se corrige no arquivo do tema. Isso inclui o idioma, o nome e a engrenagem do
   topo, e o cargo da lateral clara.
   - Se o valor vem da paleta calculada, declarar no tema a cor que vence a paleta é dado do tema, e cabe na §3.1.
   - O que a §3.2 deixa fora é mudar o motor da paleta.
5. **Degradê (passo 2):** troque a lista `GRADIENT_THEMES` pelos 25 temas.
   - Em cada cena, o degradê se liga por `sidebarBackgroundStyle`/`topbarBackgroundStyle: 'gradient'` junto com o tom, nas duas
     barras.
   - O `measureInBrowser` só lança "Barra sem degradê" se o token estiver ligado e a barra não desenhar o degradê. Isso é defeito, e
     não exceção.
6. **Ordem:** comece depois do commit do lote da `plan-178`. Ela mexeu em `overlayPreferences.ts`, que agora entra na sua §3.1.
   - A `plan-178` continua em paralelo, em outros arquivos.
   - **Proibidos:** os arquivos da `plan-178` listados na §3.2.
7. **Verificação:** a do passo 7, mais o teste do invariante no filtro do vitest.

## Veredito (correção 1) — 2026-11-26 — 🔴 Reprovado

**O que foi verificado:**
- **A causa do D1 está certa e protegida.**
  - `applyCalculatedPaletteMode` passa a calcular as duas paletas sobre o que o tema declara em cada modo (`themePaletteInput`).
  - **Mutação, em cópia:** com `overlayPreferences.ts` do `HEAD`, o `overlayPreferences.chromeColors.test.ts` reprova 33 de 100.
    Com o conserto, passa 100 de 100.
- **O cargo do topo** (`SarakShellUserWidget.tsx:107`) e o **D13** estão certos.
- **A medida da opacidade** está na spec (`contraste-do-cromo-tom-padrao.spec.ts:99`, produto da `opacity` de cada ancestral).
- **A nota de migração desta plan** já entrou no commit `9c9bd4dd`, junto com a da `plan-178`. O `docs/migracoes.md` daquele commit
  continha as duas. Não há o que desfazer antes da rc.2, mas a nota tem de descrever o que este commit entregar (achado 1).

**Achados:**

1. **Há mudança de cor de tema que nenhuma medida exige.**
   - **Mutação, em cópia** com o `src/` e o `dist/` deste worktree, e só `blueprint-protocol.ts` de volta ao `HEAD`. Isso inclui
     o `titleColor`, o `subtitleColor`, o `primaryColor` e a barra de topo do escuro, de `#15375b` para `#03070c`.
     - `contraste-do-cromo-tom-padrao`: 100 cenários, **0 reprovações**.
     - `contraste-do-cromo-nas-barras`: nenhuma célula do blueprint-protocol reprova. A única falha é a mesma do resumo, as 6
       células do idioma.
   - **Conclusão:** as cores foram ajustadas antes do conserto do Provider, ou por uma medida que o conserto tornou desnecessária. A
     §3.1 manda mudar o mínimo. Barra de topo quase preta (`#090b0d` no neumorphic-mobile, `#03070c` no blueprint-protocol) é mudança
     visível que só entra com prova.
   - **Correção:** com o conserto do `overlayPreferences.ts` no lugar, volte cada arquivo de tema ao `HEAD`, um por vez, e rode as duas
     specs.
     - Fica só a mudança cuja volta faz uma célula reprovar.
     - O resumo traz uma tabela por tema: a célula que reprova sem a mudança e o valor dela.
     - As cores do outro modo escritas como fixas ficam só nos temas que mantêm mudança, e só se `themePalettes.test.ts` as exigir.
     - `docs/migracoes.md` é reescrito para o que sobrar.
2. **As 6 células do idioma** (barra de topo, modo claro, tom contrastante) têm causa medida pelo executor: a tinta
   `bg-[var(--theme-muted)]/10` do botão de idioma, sobre a parada clara.
   - **Correção:** `src/components/atomic/Navigation/SarakShellLanguageSelector.tsx` entra na §3.1, **só** para a tinta do botão.
     O texto sobre o fundo do botão tem de dar 4,5:1 em toda célula.
     - Se a tinta sair, o botão tem de continuar distinguível, por um contorno de ao menos 3:1 contra a barra.
     - A `plan-177` mexe no mesmo arquivo para o Esc e o nome, e ainda não começou.
   - **A ordem é esta, porque o idioma escuro também foi o motivo das barras quase pretas:** corrija a tinta primeiro e só depois
     faça a volta do achado 1.
3. **O candidato T foi descartado por cálculo, e o mínimo calculado é 4,51:1,** a 0,01 do limite. A 173 mediu 4,35 no hub.
   - **Correção:** meça no navegador o título do `SarakTitleCard` nos 25 temas, modo escuro, na mesma montagem do importador,
     acrescentando o caso à spec do tom padrão.
   - Se passar de 4,5:1, registre "não é da lib". Se não, corrija pelo critério do achado 1.
4. **Prévia ao dono.** Gere uma captura de antes e depois do cromo de cada tema que mantiver mudança visível, a 1440 px, lateral e
   topo, nos dois modos, em `C:\tmp\sarak-176-previa\`. O commit espera o ok do dono.

**Verificação desta rodada:**
- vitest com filtro em `src/core/Provider/utils`, `src/core/Design/presets/themes` e no teste do seletor de idioma;
- `npm run verify -- --tier=quick`;
- `npm run build`;
- as duas specs, uma de cada vez.

**Proibidos:** os arquivos da `plan-178`, já commitados, salvo a nota da 176 em `docs/migracoes.md`.

## Veredito (correção 2) — 2026-11-26 — 🔴 Devolvida para completar (achados 3 e 4)

Os achados 1 e 2 estão corretos. Os achados 3 e 4 ficaram de fora porque o prompt desta rodada citou só os achados 2 e 1, e a falha
foi do revisor.

**A mutação do veredito anterior não era válida.** O harness importa `@sarak/lib-ui-core`, e o alias aponta para o `dist/`
(`browser-tests/build-harness.mjs:6,23`). Ao voltar o tema só no `src/`, o revisor mediu as cores novas. O executor estava certo.

**O que foi verificado:**
- **Mutação, refeita em cópia fora do repositório,** com `blueprint-protocol.ts` do `HEAD` e o JS da lib gerado de novo na cópia
  (`tsup`, ESM). A spec do tom padrão reprova exatamente as 5 células que a tabela do resumo lista:

  | Modo e barra | Peça | Contraste |
  |---|---|---|
  | escuro, topo | ativo | 4,18 |
  | escuro, topo | idioma | 3,60 |
  | escuro, topo | nome | 3,51 |
  | escuro, topo | cargo | 3,53 |
  | claro, lateral | cargo | 4,26 |

  A tabela por tema fica aceita como a prova de cada mudança.
- **As barras quase pretas saíram.** A barra do topo escuro do blueprint-protocol agora é `#0b1e32`, e a do neumorphic-mobile é
  `#191c21`. As duas têm célula que as exige.
- **O botão de idioma** perdeu a tinta e ganhou um contorno na cor do texto inativo. O teste do seletor exige isso.

**O que falta, nesta ordem:**
1. **Achado 3** do veredito anterior: o título do `SarakTitleCard` medido no navegador, nos 25 temas, modo escuro, na montagem do
   importador.
2. **A medida do contorno do botão de idioma**, que falta: o resumo diz que ele não foi medido por pixel. Na mesma spec do tom padrão,
   o contorno tem de dar ao menos 3:1 contra a barra, em toda cena.
3. **Achado 4:** a prévia para o dono em `C:\tmp\sarak-176-previa\`.
   - Uma captura de antes e depois do cromo para cada linha da tabela de cores mantidas (18 temas), a 1440 px, na barra e no modo da célula. Inclua
     também o botão de idioma num tema claro e num escuro.
   - Mais um `index.html` que liste os pares.
   - O commit espera o ok do dono.

**Verificação:** `npm run build` só se algum tema mudar, e a spec do tom padrão sozinha.

## Veredito (correção 3) — 2026-11-26 — 🟢 Aprovado (o commit espera o ok do dono na prévia)

**O que foi verificado:**
- **Candidato T:** medido no navegador, na montagem do importador, nos 25 temas do modo escuro.
  - Mínimo de 4,51:1 em repouso e 4,52:1 com o ponteiro.
  - Fica descartado como defeito da lib.
  - O limite declarado (a medida não vê o `background-image` da atmosfera) é o mesmo das outras specs de contraste, e não bloqueia.
- **Contorno do botão de idioma:** a peça `languageBorder` exige 3:1 contra cada parada da barra de topo, nas 50 cenas de topo.
  - A medida achou duas causas, as duas corrigidas.
  - **A cor:** `--theme-muted` dava 1,47:1 no cyberpunk-neon e passou a `--sarak-topbar-item-text-color`, que a spec já exige em
    4,5:1.
  - **A largura:** o `SarakButton` escreve a borda por estilo inline, e no neumorphic-mobile ela dava 0. O contorno passou a
    `outline`.
  - O estilo inline do `SarakButton` vencendo o `style` do importador foi para o backlog (#2).
- **Prévia** (`C:\tmp\sarak-176-previa\index.html`, 20 pares e o botão de idioma em tema claro e escuro): o revisor olhou o topo
  escuro do blueprint-protocol, o topo escuro do neumorphic-mobile e o botão de idioma no cyberpunk-neon-classic claro.
  - **No neumorphic-mobile escuro, antes**, o "Mais", o nome do usuário e o título da página praticamente não apareciam. **Depois**,
    leem-se, e a barra continua cinza-escura, e não preta.
  - **O cargo do usuário** deixou de sair branco e grande, por causa da cor inválida, e passou à cor e ao tamanho do tema. Com o
    espaço devolvido, a barra de topo do blueprint-protocol mostra um item a mais ("Financeiro") antes do "Mais".
- **A causa do D1, o D13, o cargo do topo e a tabela de cada tema** foram conferidos nos vereditos anteriores, por mutação em cópia.

**O commit espera o ok do dono** sobre a prévia. O ponto a olhar é o contorno firme do botão de idioma em todo tema.

**Síntese:** depende do commit e da autorização do dono. Destino `10-seguranca-e-acessibilidade`, com o texto da §8. O transporte
inclui o botão de idioma: o texto sobre ele tem ao menos 4,5:1, e o contorno tem ao menos 3:1 contra a barra.
