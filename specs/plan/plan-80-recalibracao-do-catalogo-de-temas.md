---
tipo: "plan"
titulo: "Recalibrar o catálogo de temas shippados para representar a capacidade da biblioteca"
objetivo: "Entregar um catálogo de temas elegantes e funcionais que, juntos, exercitem a capacidade da biblioteca, todos completos, com contraparte, hover e idiomas, e aprovados visualmente pelo dono"
dominio: "Sarak-Lib-UI-Core / Design Engine / Temas"
status: "🟡 Em execução"
prioridade: "Alta"
tags: ["plan", "temas", "catalogo", "contraparte", "contraste", "diversidade", "hitl"]
relacionados: ["[[specs/09-temas-e-presets]]", "[[specs/05-cromo-e-slots]]", "[[specs/11-testes-e-cobertura]]", "[[016-preferencias-do-usuario-separadas-do-tema]]"]
depende_de: "plan-78-o-que-o-painel-oferece-a-tela-faz"
retida_por: ""
destino_sintese: "specs/09-temas-e-presets.md · specs/05-cromo-e-slots.md"
---

# 1. Objetivo

O catálogo shippado deixa de ser um acúmulo de temas legados e passa a ser a **vitrine da biblioteca**:
cada tema é elegante e funcional sozinho, e o conjunto exercita o que a lib oferece — os dois modos, as
duas navegações, atmosferas, texturas, superfícies, estilos de card e de botão, tipografia, raio e
densidade. Todo tema passa em todas as travas **sem isenção**, e o dono aprovou cada um vendo-o renderizado.

# 2. Contexto

**Decisão do dono (2026-09-13):** os temas atuais não importam; o que importa é o catálogo representar a
capacidade da biblioteca. Remover todos e recriar é aceitável. O dono vai escolher alguns para manter como
base e melhorar, e temas novos podem ser criados. **Uma plan só**, com o veredito visual dele.

**O estado medido (2026-09-13):**
- São 23 temas.
- **16 não têm contraparte** e estão na `CONTRAPARTE_EXEMPTION_LIST` (`gates/scripts/audit/verify_contrast.ts:288-305`).
  A lista só pode encolher ([[09-temas-e-presets]] §2.1).
- Os 7 com contraparte são os 5 da leva `terracota-solar`/`musgo-do-vale`/`ardosia-ao-entardecer`/`forja-ultravioleta`/`grafite-puro`,
  mais o par de referência `minimalist-airy`/`sarak-sovereign`.
- O catálogo concentrado em *escuro + neon + ciano/magenta* está medido em [[09-temas-e-presets]] §5.2.
- Nenhum tema declara `enabledLanguages`.
- Parte dos temas não tem fundo de hover no item de navegação. Com a plan de camada de CSS aplicada, o hover
  passa a ser o do token, e isso fica visível.

**O que as plans anteriores entregaram, e é pré-requisito daqui:**
- a classe utilitária vence o padrão de elemento;
- todo token de navegação age nos dois cromos.

Um tema autorado antes disso seria julgado contra uma tela que ainda mentia. A tradução dos textos da lib
**não** é pré-requisito: os ids de idioma que `enabledLanguages` recebe já existem, e o idioma do texto não
muda o julgamento visual de um tema.

**Duas restrições que não são gosto:**

- **O par de referência mantém os ids.** `SARAK_REFERENCE_THEMES` (`src/core/Design/presets/themes/reference.ts`)
  segue sendo **um tema claro e um escuro**, com os ids `minimalist-airy` e `sarak-sovereign`. O conteúdo pode
  ser inteiramente reescrito. O motivo são dois contratos públicos:
  - `deriveThemeFromReference(refId)` recebe esses ids;
  - o ERP escolhe a referência **por modo** (`packages/ui-kit/src/themes.ts:28-31`).

  O que muda na referência, o consumidor herda. O dono aceitou.
- **Remover tema é quebra de contrato.** `ThemePresetId` é união pública. Um consumidor pode ter o id de um
  tema removido persistido ou em `activeThemeId`/`initialTheme`. **Meça** o que acontece hoje nesse caso. O
  comportamento exigido é: cair num tema de referência do modo pedido, com **um** aviso de console, nunca
  tela sem tema nem erro.

**A régua de medição precisa ser honesta antes do primeiro tema novo.** A varredura de realce do item de
navegação (`src/components/atomic/Navigation/__tests__/SarakMenuItem.test.tsx`) converte cor por
`parseToRgba`. Para o que não reconhece (`hsl()`, `var()`, gradiente), `parseToRgba` devolve **preto opaco**.
Hoje todo tema entrega hex ou `rgb()`, e a medição acerta. Um tema novo com `hsl()` seria medido contra
preto, em silêncio. O `auditor_contraste` já pula o par nesse caso e diz que pulou; a varredura passa a
fazer o mesmo.

**Por que uma vitrine renderizada.** O veredito visual é do dono, e ele precisa ver cada tema de verdade:
cromo, conteúdo, os dois modos e as duas orientações. Olhar pelo ERP exige, a cada lote, o ciclo de
reinstalação e de cache da [[13-instalacao-e-atualizacao]] §9.1, a armadilha que já custou dois ciclos
inteiros. O harness de navegador (`browser-tests/`) já renderiza o cromo público contra o `dist/`, e é o
caminho sem essa armadilha.

# 3. Escopo

## 3.1 Dentro
- `src/core/Design/presets/themes/**` — os temas, `index.ts` (`THEME_PRESET_IDS`, `GLOBAL_THEMES`) e `reference.ts`.
- `gates/scripts/audit/verify_contrast.ts` — a `CONTRAPARTE_EXEMPTION_LIST` encolhe até ficar vazia.
- `src/components/atomic/Navigation/__tests__/SarakMenuItem.test.tsx` — a medição honesta, mais o hover (§5 passos 1 e 6).
- `src/core/Provider/**` — **só se** a medição do id removido (§2) mostrar comportamento diferente do exigido.
- `browser-tests/**` e `package.json` — a vitrine (§5 passo 2). A saída **não** é versionada (entrada no
  `.gitignore`).
- Os testes que citam ids de tema removidos.
- `.agents/skills/ui-criar-tema/SKILL.md` (e a `references/` dela, se preciso) — a vitrine e as travas novas no procedimento.
- `docs/migracoes.md` — ids removidos, e para onde cai quem os usava, sob a **7.0.0**.
- `dist/` · `sarak-ui/` · `docs/component-catalog.*` · `src/core/Provider/generated/` · `sarak-dev/` — **só pelos geradores**.

## 3.2 Fora
- **Criar token.** Tema é configuração: consome o que o dicionário tem ([[00-regras-e-invariantes]] R11). Se
  faltar um eixo para expressar uma ideia, é achado.
- Presets parciais de componente (`src/core/Design/presets/components/`).
- Default de qualquer token.
- Posições das preferências do usuário: ficam no **padrão de fábrica** em todo tema (skill `ui-criar-tema` §5.6).
- Mídia de terceiro em qualquer tema ([[09-temas-e-presets]] §5.1).
- O consumidor (ERP), código e dado — inclusive os temas dele em `themes.ts`.

## 3.3 Emenda — 2026-09-17 (execução em paralelo com a `plan-79`)

A fase que vai **até a Parada 1** (§5 passos 1 a 4) roda em paralelo com a `plan-79`, no mesmo worktree.
Disjunção declarada pelo revisor, medida sobre o worktree da `plan-79` em andamento:
- **Código:** a única interseção é `src/core/Provider/constants.ts`, que é da `plan-79` e que esta plan
  não toca.
- **Gerados** (`dist/`, `sarak-ui/`, `docs/component-catalog.*`, `sarak-dev/`): as duas os regeneram.
  Nesta fase, **nenhum gerador roda**. O build que a vitrine exige pode rodar: ele reescreve o `dist/`, mas
  nada desta fase entra no `dist/` (teste, harness e `.gitignore` não são publicados), então o `dist/` que a
  `plan-79` commitar continua sendo só dela.
- **`package.json` não muda nesta fase.** O `sarak-dev/` acompanha os scripts do `package.json`, e um script
  novo daqui derrubaria o `dev-kit:check` do commit da `plan-79`. A vitrine roda pelo comando direto; o
  script `themes:showcase` (§5 passo 2) entra junto com a autoria.
- **Temas:** nenhum arquivo de tema é tocado antes de a `plan-79` estar commitada. A autoria (§5 passo 5 em
  diante) começa só depois disso.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
| --- | --- | --- |
| Spec fixa | `specs/specs/09-temas-e-presets.md` | o contrato inteiro: §2.1 contraparte, §4.1–4.1.1 referência e derivação, §4.7 preferências, §5.1 atmosferas, §5.2 diversidade medida, §6 travas, §7 o procedimento |
| Spec fixa | `specs/specs/05-cromo-e-slots.md` | §2.4 — papéis de cor do item de navegação e a varredura de realce |
| Spec fixa | `specs/specs/11-testes-e-cobertura.md` | §7 — o harness de navegador |
| Spec fixa | `specs/specs/13-instalacao-e-atualizacao.md` | §9.1 — por que a vitrine não passa pelo ERP |
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` | R5, R25, R31, R33 — as travas que todo tema cruza |
| ADR | `specs/adr/016-preferencias-do-usuario-separadas-do-tema.md` | posição de preferência é do administrador, não do tema shippado |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| Skill | `ui-criar-tema` (inteira, com `references/liberdade-e-restricao.md` e `examples.md`) | o procedimento, o gerador de gabarito e o solucionador de contraste |
| Skill | `ui-arquitetura-design` | julgar elegância e função com critério, não com gosto |
| Skill | `padrao-escrita` · `padrao-typescript` · `test-unitario` · `test-e2e` | sempre; a varredura; a vitrine |
| Código | `gates/scripts/audit/verify_contrast.ts` · `verify_diversity.ts` · `src/core/Design/utils/themeAxes.ts` | as três réguas |
| Código | `src/core/Design/presets/themes/color-engine.ts` (`resolveThemeForMode`) | o que cada tema vira no modo oposto |
| Código | `browser-tests/fixtures/harness-entry.tsx` · `build-harness.mjs` | a base da vitrine |

# 5. Instruções de execução

1. **Régua honesta.** A varredura de `SarakMenuItem.test.tsx` passa a **pular e declarar** a cor que não
   consegue converter, em vez de medi-la contra preto. Teste que prova isso com um valor `hsl()`.

2. **A vitrine.** Um comando (`themes:showcase`) que gera, a partir do `dist/`, uma captura por **tema ×
   modo × orientação**, fora do versionamento. Cada captura mostra o cromo com item ativo e item em hover,
   mais uma amostra do conteúdo: card, tabela, botões, campos e tipografia. O comando também gera **um
   arquivo único** que reúne as capturas lado a lado, para o dono abrir e comparar.

3. **Inventário da capacidade.** Por script, sem transcrever lista de token (R17), produza no resumo uma
   matriz com duas coisas:
   - **as famílias de escolha visual que o dicionário oferece**, derivadas do `axis` e das `constraints.options`
     dos schemas: navegação, posição da sidebar, textura/atmosfera, textura de card, superfície, estilo de
     botão, famílias tipográficas, raio, densidade, modo;
   - **quais valores o catálogo atual usa.**

   É o mapa do que a vitrine precisa mostrar.

4. **⛔ Parada 1 — o catálogo.** Rode a vitrine sobre os 23 temas atuais. Entregue ao dono, **em texto**:
   - as capturas;
   - a matriz do passo 3;
   - uma proposta de catálogo final: quais temas ficam como base (com o que melhorar em cada um), quais
     saem, e quais temas novos entram. Para cada tema, uma linha de identidade: modo, navegação, família de
     matiz, atmosfera, tipografia e densidade;
   - a cobertura que o catálogo proposto dá à matriz.

   **Pare.** Siga só com o catálogo aprovado pelo dono, e registre a aprovação no resumo. O dono pode
   trocar, tirar e acrescentar temas.

5. **O id removido.** Meça e, se preciso, faça valer o comportamento da §2: um id removido cai na referência
   do modo pedido, com um aviso. Teste pelas três portas: `activeThemeId`, `initialTheme` e o id persistido
   que volta pelo `onLoad`.

6. **Autorar, em lotes.** Um lote por vez, de até seis temas, na ordem que o dono aprovar. Comece pelo par de
   referência. Cada tema do lote cumpre [[09-temas-e-presets]] §7 inteiro e a skill `ui-criar-tema` §5–5.6:
   - parte do gabarito vivo (o gerador da skill) ou de `deriveThemeFromReference`, **nunca de `{}`**;
   - `findMissingThemeAxes` devolve `[]`;
   - `contraparte` autorada, e o tema sai da lista de isenção (o solucionador de contraste roda, e o
     relatório entra no resumo);
   - **fundo de hover** do item de navegação, nas duas orientações, **perceptível** contra o fundo da barra.
     A varredura de realce passa a medir o hover como já mede o ativo: distância perceptual acima do
     limiar, nos dois modos;
   - `enabledLanguages` com os seis idiomas oferecidos pela lib;
   - posições de preferência no padrão de fábrica; nenhuma mídia de terceiro;
   - `description` com a identidade do tema em uma frase.

   Tema que sai: `THEME_PRESET_IDS`, `GLOBAL_THEMES`, o arquivo, os testes que o citam, e a linha em
   `docs/migracoes.md`.

7. **⛔ Parada por lote — o veredito visual.** Ao fechar cada lote:
   - rode `npm run audit` (contraste com 0 reprovados nas duas passadas), `npm run themes:diversity` e a
     vitrine;
   - entregue ao dono as capturas do lote e os números;
   - **pare.**

   O dono aprova ou devolve com o que mudar. O próximo lote só começa com a aprovação registrada no resumo.
   O revisor pode liberar commit parcial por lote.

8. **Fechamento.**
   - A `CONTRAPARTE_EXEMPTION_LIST` está **vazia**, e o `auditor_contraste` exige contraparte de todo tema
     shippado.
   - `themes:diversity` passa nos nove critérios.
   - Atualize a skill `ui-criar-tema` com a vitrine e com a varredura de hover.
   - Rode os geradores, `npm run build`, `npm run cromo-css-real:check`, `npm run audit` e a suíte inteira
     (`npx vitest run --maxWorkers=3`).

# 6. Critérios de aceite

- [ ] A varredura de realce pula e declara cor que não converte, e tem teste com `hsl()`.
- [ ] `themes:showcase` gera a vitrine a partir do `dist/`, e a saída não é versionada.
- [ ] A matriz de capacidade e a aprovação do catálogo pelo dono estão no resumo (parada 1).
- [ ] Todo lote tem a aprovação visual do dono registrada no resumo (paradas por lote).
- [ ] `SARAK_REFERENCE_THEMES` segue um claro e um escuro, com os ids `minimalist-airy` e `sarak-sovereign`.
- [ ] Id de tema removido cai na referência do modo pedido, com um aviso, pelas três portas (teste).
- [ ] Todo tema shippado: `findMissingThemeAxes` = `[]`; contraparte; hover perceptível nas duas orientações
      e nos dois modos (varredura); seis idiomas em `enabledLanguages`; preferências no padrão de fábrica.
- [ ] `CONTRAPARTE_EXEMPTION_LIST` vazia; `auditor_contraste` 0 e 0; `themes:diversity` passa nos nove.
- [ ] `docs/migracoes.md` lista cada id removido e para onde cai quem o usava.
- [ ] A skill `ui-criar-tema` descreve a vitrine e a varredura de hover.
- [ ] `audit` sem regressão; suíte inteira verde. Falha em arquivo não tocado foi rodada isolada antes de
      ser atribuída ([[00-backlog]] #5).

# 7. Como verificar (uso do revisor)

**Gate:** `nenhum novo` — `auditor_contraste` (existente) passa a exigir contraparte de **todo** tema
shippado, porque a lista de isenção termina vazia; a varredura de realce (suíte) passa a medir o hover.

- `git status` + `git diff --stat` → só a §3.1, mais os gerados.
- `npm run audit` → contraste 0 e 0, nenhuma isenção; `npm run themes:diversity` → nove critérios.
- **Mutação:** tornar `transparent` o hover de um tema → a varredura cai nomeando o tema e a orientação.
  Restaurar byte a byte.
- **Mutação:** tirar a `contraparte` de um tema → o `auditor_contraste` acusa. Restaurar.
- **Efeito:** para três temas ao acaso, rodar `useDesignVariables` em `react-dom/server` num script `tsx`,
  no modo nativo e no oposto, e conferir que as variáveis emitidas são as escritas e as da contraparte.
- Abrir a vitrine final e conferir que ela corresponde ao catálogo aprovado.
- `grep -rnE "plan-[0-9]+|achado [0-9]+|veredito"` nos arquivos da entrega, rastreados e não rastreados.
- `npx vitest run --maxWorkers=3 > arquivo 2>&1` e ler a saída.

# 8. Destino da síntese

**Destino:** `specs/09-temas-e-presets.md` · `specs/05-cromo-e-slots.md`

- **`09-temas-e-presets`**:
  - §2.1: a lista de isenção acabou; contraparte é obrigatória para todo tema shippado.
  - §5.2: a tabela de concentração de 18 → 23 é substituída pelo que o catálogo novo mede, sem transcrever
    lista de temas (R17).
  - §7: a vitrine entra no procedimento; o hover perceptível e os idiomas passam a ser exigência medida.
  - §4.3: o que acontece com um id de tema que deixou de existir.
- **`05-cromo-e-slots`** §2.4 — a varredura de realce mede ativo **e** hover, em todo tema shippado.

---

# 9. Resumo da execução

## Resumo da execução — 2026-09-17

**Resultado:** Concluído com pendências (Parada 1 — aguardando aprovação do dono, conforme §5 passo 4 e a
emenda §3.3: esta execução corre em paralelo com a `plan-79` e vai só até aqui).

**O que foi feito**
- `src/components/atomic/Navigation/__tests__/SarakMenuItem.test.tsx` — a varredura de realce do item ativo
  (`describe('SarakMenuItem — realce do item ativo...')`) passou a declarar, via `console.warn`, o par
  tema/orientação cuja cor de fundo não é conversível (`hsl()`, `var()` não resolvido, gradiente), em vez de
  medi-la contra o preto que `parseToRgba` devolveria em silêncio. Extraído `isParseableColor` (mesmo critério
  de `gates/scripts/audit/verify_contrast.ts::parseColor`) e `evaluateActiveDistinction` (núcleo testável da
  varredura). Novo teste (`'hsl() no fundo ativo é PULADO e DECLARADO...'`) prova o caso com um valor `hsl()`
  sintético — §5 passo 1.
- `browser-tests/build-harness.mjs` — `buildHarness()` passou a aceitar `entryPath` (default preserva o
  comportamento de `cromo-css-real.spec.ts`), para reusar o mesmo empacotador esbuild na vitrine, sem duplicar
  a lógica de build.
- `browser-tests/fixtures/showcase-entry.tsx` (novo) — entry point da vitrine: `SarakUIProvider` +
  `SarakAppChrome` com amostra de conteúdo (tipografia, botões, campos, `SarakCardGrid`, `SarakTable`), tema
  escolhido por `?tema=`, modo aplicado pela porta pública `useSarakPreferences().updatePreferences({colorMode})`
  (o mesmo caminho do `ShellThemeToggle` real) e orientação forçada via `config.navigationStyle` (a preferência
  de navegação não é oferecida por padrão de fábrica em nenhum tema hoje, então não teria efeito se pedida como
  preferência).
- `browser-tests/generate-showcase.mts` (novo) — o gerador da vitrine: builda o harness contra o `dist/`,
  itera `GLOBAL_THEMES` (fonte viva, nunca transcrita — R17) × 2 modos × 2 orientações, mocka os dois
  `endpoint` da fixture via `page.route`, marca "Início" ativo e "Relatórios" em hover (mouse real) na mesma
  captura, salva um PNG por combinação em `browser-tests/showcase-output/screens/` e monta um `index.html`
  agregador com todas lado a lado. Roda por comando direto (`npx tsx browser-tests/generate-showcase.mts`) —
  nenhum script novo em `package.json` nesta fase (emenda §3.3).
- `.gitignore` — entrada para `browser-tests/showcase-output/` (a vitrine não é versionada — §5 passo 2).
- Inventário da capacidade (§5 passo 3) — por script ad hoc (não commitado, rodado e descartado), lendo
  `getAllDesignTokens()` e `GLOBAL_THEMES`; matriz abaixo.
- Rodei `npm run build` (necessário para a vitrine ler `dist/`) e a suíte de `src/components/atomic/Navigation`
  — os `dist/*` que mudaram no worktree são gerado, e a emenda §3.3 autoriza o build nesta fase.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/atomic/Navigation/__tests__/SarakMenuItem.test.tsx` | alterado | régua honesta (pula e declara cor não conversível) + teste com `hsl()` |
| `browser-tests/build-harness.mjs` | alterado | `buildHarness(entryPath)` — entry configurável |
| `browser-tests/fixtures/showcase-entry.tsx` | criado | entry point da vitrine |
| `browser-tests/generate-showcase.mts` | criado | gerador da vitrine (captura + agregador HTML) |
| `.gitignore` | alterado | ignora `browser-tests/showcase-output/` |
| `specs/plan/plan-80-recalibracao-do-catalogo-de-temas.md` | alterado | `status` → `🟡 Em execução`, este resumo |

**Verificações executadas**
- `npx vitest run src/components/atomic/Navigation/__tests__/SarakMenuItem.test.tsx` → 42 testes, 0 falhas.
- `npx vitest run src/components/atomic/Navigation` → 17 arquivos / 139 testes, 0 falhas.
- `npm run build` → build completo, 0 erros (gates de build incluídos: `token-types:check`, `catalog:check`,
  `barrel:check`, `zero-brand:check`, `guide:check`, `deep-import:check`, `public-types:check`).
- `npx tsx browser-tests/generate-showcase.mts` → 92 capturas geradas (23 temas × 2 modos × 2 orientações),
  0 falhas. Primeira rodada teve 8 falhas (`holographic-glass`, `kinetic-flow`, os dois com
  `isAutoHideEnabled: true`) — a nav começa OCULTA por design (`useChromeAutoHide`,
  specs/specs/05-cromo-e-slots.md §2.4) e só revela sob o sensor fixo no canto (0,0); corrigido movendo o
  mouse para lá antes de aguardar "Início" — não é bug do cromo, é o comportamento documentado do token.

**Critérios de aceite (desta parada)**
- [x] A varredura de realce pula e declara cor que não converte, e tem teste com `hsl()` — evidência:
  `SarakMenuItem.test.tsx`, `describe('SarakMenuItem — a régua não mede cor não-conversível contra preto')`.
- [x] `themes:showcase` (o mecanismo; o script do `package.json` é da autoria, §3.3) gera a vitrine a partir do
  `dist/`, e a saída não é versionada — evidência: `browser-tests/showcase-output/` gerado e ignorado pelo git.
- [x] A matriz de capacidade está neste resumo (abaixo) — Parada 1.
- [ ] Aprovação do catálogo pelo dono — **pendente**: é exatamente a Parada 1, registrada na mensagem de
  entrega desta conversa, não neste resumo (o dono decide fora do papel do executor).

**Decisões e suposições**
- `resolveThemeForMode` (o merge exato de contraparte) não é exportado no barril público; a vitrine troca de
  modo pela porta pública documentada (`useSarakPreferences`/`ShellThemeToggle`), não por essa função interna
  — é o caminho que a própria spec recomenda ao importador (specs/specs/09-temas-e-presets.md §4.3).
- `SarakCardGrid`/`SarakTable` só sabem buscar dado por `endpoint` (sem prop de dado direto hoje — achado
  registrado abaixo); a vitrine usa uma origem fixa (`https://showcase.sarak.local`) mockada por `page.route`
  para renderizar conteúdo determinístico offline, sem alterar os componentes.
- Orientação (`?nav=`) é forçada por `config.navigationStyle` (sobrepõe o token direto), não pela preferência
  `navigationStyle` — nenhum tema shippado hoje a oferece por padrão de fábrica (specs/specs/09 §4.7), então a
  preferência não teria efeito.
- O inventário de capacidade (§5 passo 3) rodou por script descartável, não commitado — a R17 pede não
  transcrever fonte viva em documento permanente; este resumo é registro de execução, mas ainda assim os
  dados abaixo são a SAÍDA do script sobre o código de 2026-09-17, não uma lista mantida à mão.

**Matriz de capacidade — famílias que o dicionário oferece × o que o catálogo atual (23 temas) usa**
(fonte: `getAllDesignTokens()` + `GLOBAL_THEMES`, script ad hoc descartado após a leitura)

| Família (token) | Opções no schema | Valores distintos usados nos 23 | Quais |
|---|---|---|---|
| Modo (`mode`) | 2 | 2 | dark, light |
| Navegação (`navigationStyle`) | 3 (sidebar/topbar/dock) | 2 | sidebar, topbar — **`dock` nunca usado, e acheado abaixo: não tem efeito visual hoje** |
| Posição da sidebar (`sidebarPosition`) | 3 (left/right/floating) | 1 | **left — right e floating nunca exercitados** |
| Textura/atmosfera (`texture`) | 41 | 6 | none, noise, grid, dots, waves, scanlines |
| Textura de card (`cardTextureType`) | 41 (mesmo catálogo) | 5 | none, grid, noise, dots, scanlines |
| Superfície (`surfaceMaterial`) | 4 (frosted/sleek/industrial/organic) | 4 | as 4 — **cobertura plena** |
| Estilo de botão (`btnStyleType`) | 6 | 5 | matte, borderline, frosted, neon, neumorphism — falta `cyberpunk` |
| Família tipográfica de título (`headingFont`) | 20 | 13 | mistura sans/serif/mono |
| Família tipográfica de corpo (`bodyFont`) | 20 | 8 | — |
| Família tipográfica mono (`monoFont`) | 20 | 4 | — |
| Raio (`borderRadius`, 0–40) | numérico | 7 valores | 0, 2, 4, 12, 14, 24, 9999 (pílula) |
| Densidade (`layoutDensity`) | 3 (compact/comfortable/spacious) | 3 | as 3 — **cobertura plena** |

**Identidade dos 23 temas atuais** (mode · navegação nativa · família de matiz · atmosfera · fonte de título ·
densidade · contraparte) — fonte: `measureTheme()` de `gates/scripts/audit/verify_diversity.ts` + leitura
direta do `design`, script ad hoc:

| Tema | Modo | Nav | Matiz | Atmosfera | Título | Densidade | Contraparte |
|---|---|---|---|---|---|---|---|
| sarak-sovereign *(referência)* | dark | sidebar | ciano | none | Outfit | comfortable | autorada |
| minimalist-airy *(referência)* | light | topbar | azul | grid | Inter | spacious | autorada |
| terracota-solar | light | sidebar | laranja | none | Fraunces | spacious | autorada |
| musgo-do-vale | light | topbar | verde | none | Fraunces | comfortable | autorada |
| ardosia-ao-entardecer | dark | sidebar | azul | none | Outfit | comfortable | autorada |
| forja-ultravioleta | dark | topbar | roxo | grid | Space Grotesk | compact | autorada |
| grafite-puro | dark | sidebar | neutro | grid | JetBrains Mono | compact | autorada |
| crystal-glass | dark | topbar | ciano | noise | Outfit | spacious | isento |
| cyberpunk-neon | dark | sidebar | verde | grid | JetBrains Mono | comfortable | isento |
| holographic-glass | dark | topbar | ciano | noise | Inter | comfortable | isento |
| industrial-terminal | dark | sidebar | laranja | grid | JetBrains Mono | compact | isento |
| nature-breeze | dark | sidebar | verde | grid | Lora | comfortable | isento |
| neo-brutalism | dark | topbar | vermelho | grid | Space Grotesk | comfortable | isento |
| synthwave-retro | dark | topbar | magenta | grid | JetBrains Mono | comfortable | isento |
| nebula-space | dark | topbar | magenta | grid | Outfit | compact | isento |
| dot-matrix-elegant | dark | sidebar | amarelo | dots | Outfit | comfortable | isento |
| stellar-nebula | dark | sidebar | azul | none | Outfit | spacious | isento |
| kinetic-flow | dark | sidebar | magenta | waves | JetBrains Mono | compact | isento |
| cyber-retro-wave | dark | sidebar | magenta | scanlines | Orbitron | comfortable | isento |
| data-terminal | dark | topbar | ciano | grid | Fira Code | compact | isento |
| neumorphic-mobile | light | topbar | neutro | grid | Outfit | comfortable | isento |
| industrial-dashboard | dark | topbar | amarelo | grid | Inter | comfortable | isento |
| asymmetric-editorial | light | topbar | neutro | grid | Playfair Display | comfortable | isento |

Cruzamento: 18 dark / 5 light; ciano+magenta = 8 dos 23 — os dois números batem exatamente com
specs/specs/09-temas-e-presets.md §5.2, confirmando o script.

**Achados fora do escopo (não corrigidos)**
- `src/core/Design/presets/themes/kinetic-flow.ts:176` — `globalBackgroundImageUrl` aponta para
  `https://test-videos.co.uk/...` (vídeo de terceiro). Viola specs/specs/09-temas-e-presets.md §5.1 ("um valor
  de `globalBackgroundImageUrl` apontando para fora da origem do consumidor não entra no catálogo shippado").
  Não há gate hoje que pegue isto — achado a levar ao backlog ou à decisão de remover o tema no passo 4/6.
  Nenhum gate reprovou porque `verify_diversity`/`verify_contrast`/`auditor_presets` não auditam mídia.
- `navigationStyle: 'dock'` existe como opção no schema (`src/core/Design/schema/global.ts:21-29`), mas
  `SarakAppChrome` só resolve `'topbar'` → topbar e qualquer outro valor → sidebar
  (specs/specs/05-cromo-e-slots.md §2.1) — a opção não tem efeito visual distinto hoje. Não é desta plan (§3.2
  proíbe criar token; consertar o cromo para dar efeito a `dock` seria além do escopo declarado).
- `sidebarPosition` (`right`, `floating`) nunca é exercitado por nenhum dos 23 temas atuais — nenhum bug,
  apenas lacuna de amostra que a proposta de catálogo (mensagem de entrega) endereça.
- `SarakTable`/`SarakCardGrid` destroem/ignoram a prop `data`/não aceitam dado direto — só `endpoint` (fetch).
  `src/components/atomic/Templates/SarakTable.tsx:46` desestrutura `data: initialData` e nunca a usa;
  `useSarakTableData` sempre busca por `endpoint`. Não é desta plan; contornado na vitrine com
  `page.route` mockando a origem.
- `SarakSwitch` (`browser-tests/fixtures/showcase-entry.tsx`) — usar `defaultChecked` sozinho ainda produz o
  aviso do React "input com checked e defaultChecked" (console, visto ao depurar `holographic-glass`); parece
  o componente aplicar `checked` internamente independente da prop recebida — não investigado a fundo
  (fora do escopo desta parada; não afeta a vitrine, é só ruído de console).

**Pendências / riscos**
- Passos 5 em diante (autoria dos temas, `themes:showcase` em `package.json`, remoção de ids, `docs/migracoes.md`,
  atualização da skill `ui-criar-tema`) **não começaram** — dependem da aprovação do catálogo pelo dono
  (Parada 1), entregue nesta conversa em texto, fora deste resumo.
- Não rodei `npx vitest run` (suíte inteira) nesta parada — só o escopo tocado
  (`SarakMenuItem.test.tsx` + a pasta `Navigation`). A suíte inteira é exigida no Fechamento (§5 passo 8), não
  aqui; rodá-la agora mediria também o worktree em andamento da `plan-79` (fora do meu escopo de correção).
- `browser-tests/showcase-output/` fica no worktree (gerado, ignorado) para o dono abrir
  `browser-tests/showcase-output/index.html` — não commitado, regenerável a qualquer momento por
  `npx tsx browser-tests/generate-showcase.mts` (exige `npm run build` primeiro).

## Resumo da execução (continuação) — 2026-09-17

**Resultado:** Concluído com pendências (catálogo aprovado pelo dono na conversa; autoria **ainda bloqueada**
pela emenda §3.3 — `plan-79` segue não commitada, ver abaixo).

**Aprovação do dono (Parada 1, §5 passo 4) — registrada nesta conversa:**

| Destino | Temas |
|---|---|
| **Melhorar** (ficam, com ajuste) | `sarak-sovereign`, `industrial-terminal`, `neo-brutalism`, `nebula-space`, `kinetic-flow`, `cyber-retro-wave`, `minimalist-airy`, `neumorphic-mobile` |
| **Recriar** (ficam, reescritos do zero) | `cyberpunk-neon`, `synthwave-retro`, `data-terminal` |
| **Remover** (explícito) | `crystal-glass`, `holographic-glass`, `nature-breeze`, `dot-matrix-elegant`, `asymmetric-editorial` |
| **Remover** (por "todos os outros que não estão listados") | `stellar-nebula`, `industrial-dashboard`, e os 5 da leva com contraparte já autorada: `terracota-solar`, `musgo-do-vale`, `ardosia-ao-entardecer`, `forja-ultravioleta`, `grafite-puro` |

Catálogo final aprovado: **11 temas** (os 8 "melhorar" + os 3 "recriar"). Nenhum dos 16 legados isentos de
contraparte sobrevive sem reescrita (nem os 8 "melhorar" têm contraparte hoje — "melhorar" inclui autorá-la,
igual "recriar"). Interpretação de "todos os outros" confirmada por contagem: os 16 legados mais os 2 de
referência somam 18 nomes possíveis; só 16 foram citados (8+3+5); os 2 que sobraram sem menção
(`stellar-nebula`, `industrial-dashboard`) e os 5 da leva (não fazem parte dos "legados", mas também não foram
citados) caem no "todos os outros" — declarada aqui para o dono corrigir se a leitura for diferente da
intenção.

**Observação registrada, não bloqueante:** o catálogo aprovado tem 9 dos 11 temas nativamente escuros
(só `minimalist-airy` e `neumorphic-mobile` são claros) — mais concentrado em `dark` que o catálogo de 23
(18/23 = 78%) que motivou esta plan. `themes:diversity` (9 critérios) só roda contra o que existir na hora do
lote (§5 passo 7); se o dono quiser reequilibrar modo/matiz, o espaço para isso é nos 3 "recriar" (liberdade
total) e nos ajustes de "melhorar".

**Sugestão do dono — visualizar pelo ERP (porta 3000) com Playwright antes de recriar:** registrada, com uma
ressalva que já é conhecida desta base: medir pelo ERP atravessa as duas camadas de cache descritas em
specs/specs/13-instalacao-e-atualizacao.md §9.1 (`pnpm file:` copia em vez de linkar; o pré-bundle do Vite não
invalida por conteúdo) — é a armadilha que já custou dois ciclos inteiros e a razão de esta plan ter
priorizado `browser-tests/` (mede o `dist/` direto, sem essa camada). Nenhuma ação tomada ainda: apontar
Playwright para `localhost:3000` é decisão de ferramenta para quando a autoria (§5 passo 5+) começar, e cabe
ao dono escolher — a vitrine já entregue serve o mesmo papel sem o ciclo de reinstalação.

**Por que a autoria não começou nesta conversa:** a emenda §3.3 desta plan (execução em paralelo com a
`plan-79`) só libera "autorar" (§5 passo 5 em diante) depois de a `plan-79` estar **commitada**. Conferido
agora: `specs/plan/plan-79-idioma-de-ponta-a-ponta.md` segue com `status: "🟠 Em revisão"` e o worktree segue
com as mudanças dela não commitadas (`git log` sem commit novo desde `279d33f`). Autoria de tema, mudança em
`package.json` (o script `themes:showcase`) e qualquer edição em `src/core/Design/presets/themes/**`
continuam fora desta conversa até essa condição mudar.

**Pendências / riscos (adicionadas)**
- Catálogo aprovado, mas **autoria bloqueada** por `plan-79` não commitada — nenhuma ação de tema tomada.
- Confirmar com o dono a leitura de "todos os outros" (acima) antes de a autoria começar, para não descartar
  os 5 temas com contraparte já pronta por engano.

## Resumo da execução (continuação 2) — 2026-09-17

**Resultado:** Concluído com pendências (nova sequência combinada com o dono; nenhuma ação de tema ainda —
segue bloqueado pelo commit da `plan-79`, que não aconteceu).

**Sequência combinada com o dono, substituindo a ordem original do §5 passos 5+:**

1. Dono commita (`plan-79`, e o que estiver pronto desta `plan-80`).
2. Executor remove os temas indicados (§ acima) — só remoção; nenhuma recriação/melhoria ainda.
3. Executor guia o dono, passo a passo, na atualização da lib no ERP (`specs/13-instalacao-e-atualizacao.md`
   §9 — as duas camadas de cache, na ordem certa).
4. Executor executa a `plan-72-pente-fino-de-usabilidade-no-consumidor-real` — que **já depende desta plan**
   no seu próprio frontmatter (`depende_de: "plan-80-recalibracao-do-catalogo-de-temas"`), então a sequência
   pedida é a ordem que a `plan-72` já esperava, não uma inversão.
5. Dono e executor discutem os achados da `plan-72` **antes** de aplicar qualquer melhoria/recriação de tema
   — os achados do consumidor real informam a autoria, em vez de a autoria acontecer às cegas do que a tela
   real mostra.
6. Só então o §5 passos 5+ desta plan (autoria em lotes) retoma, com a lista de "melhorar"/"recriar" tratada
   como **referência, não obrigação** — o dono liberou criar temas novos; o critério final é "temas bonitos,
   diferentes entre si, que mostrem a capacidade da biblioteca", não a categorização literal de cada nome.

**Decisões e suposições**
- "Remover" continua lido como a lista completa de 12 ids (§ bloco anterior) — o dono chamou de "referência"
  só a parte de melhorar/recriar, não a de remover. Se a intenção for diferente, corrige antes do passo 2
  acima rodar.
- A `plan-72` é **read-only por definição própria** (§3.2 dela: "esta plan não conserta nada; ela nomeia",
  "zero arquivo de produção alterado") — executá-la não conflita com nada em andamento na `plan-79` nem seria
  bloqueado por ela: não escreve código.

**Pendências / riscos**
- Aguardando o commit do dono para: (a) remover os 12 temas, (b) guiar a atualização no ERP, (c) executar a
  `plan-72`. Nenhum dos três começou.

---

# 11. Síntese
