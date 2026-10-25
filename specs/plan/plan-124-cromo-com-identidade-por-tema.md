---
tipo: "plan"
titulo: "Dar a barra lateral e a barra de topo identidade propria em cada tema"
objetivo: "Fazer a barra lateral e a barra de topo de cada um dos 19 temas terem identidade propria, com texto, borda, profundidade, fundo, item ativo, densidade e icones vindos de tokens declarados pelo tema, e os controles de preferencia sem poluir o rodape da barra"
dominio: "Cromo / Design Engine / Temas"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "cromo", "sidebar", "topbar", "tokens", "temas", "rc"]
relacionados: ["[[05-cromo-e-slots]]", "[[02-design-engine]]", "[[04-contrato-de-tokens-e-paridade]]", "[[09-temas-e-presets]]", "[[013-item-de-navegacao-como-atomo-proprio]]", "[[015-metrica-do-item-de-navegacao-horizontal]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "specs/05-cromo-e-slots.md + arquitetura/02-design-engine.md + specs/09-temas-e-presets.md"
---

# 1. Objetivo

Trocar de tema muda a barra de forma reconhecível — não só a cor de fundo: cor e peso do texto, borda, sombra/vidro, fundo
(sólido, gradiente ou textura), forma do item ativo, densidade e ícones; cada um dos 19 temas tem uma barra própria, legível nos dois
modos; e o rodapé da barra mostra só o que o usuário usa sempre.

# 2. Contexto

Pedido do dono (2026-10-22): a barra ficou pouco personalizável; melhorar a barra individualmente em cada tema, todos numa plan só
(decisão do dono, 2026-10-23). Medido no código (`src/` salvo indicação):

- **Tokens de hoje:** `schema/navigation.ts` (38) + `schema/branding.ts` (6) + `navigationStyle`. Os 19 temas declaram exatamente os
  mesmos 23 estéticos, quase sem variação: `sidebarColor` = `topbarColor` em todos os blocos; ruído 0 em 35 de 38; `navItemRadius` 12
  em 11 temas; `identityAlignment` `left` em 18.
- **Fixo no código (sem token):**
  - borda da barra: `border-b`/`border-r`/`border-l` com a cor de borda do cartão (`components/Layout/chrome/ChromeTopbarBody.tsx:104,109`,
    `chromeStructuralStyles.ts:22-24`, `ChromeSidebarBody.tsx:117`);
  - sombra e blur só na lateral (`ChromeSidebarBody.tsx:119-120`), nenhum na barra de topo;
  - fundo só cor sólida; sem fundo próprio na área da marca nem no rodapé;
  - espaçamento e densidade (`ChromeTopbarBody.tsx:104`, `SarakShellNav.tsx:142-143`, `SarakMenuItem.tsx:72-73`);
  - texto do item: inativo usa o muted global, hover o corpo (`SarakMenuItem.tsx:96-97`) — lateral escura em tema claro fica ilegível;
  - marcador do ativo com forma e tamanho fixos (`SarakShellNav.tsx:96-98`), só cor e brilho são token;
  - rótulo de categoria (`SarakShellNav.tsx:203`), separador (`:184`), ícones (tamanho, traço, cor);
  - nome da marca no `SarakShellNav` ignora `identityFontFamily` (`SarakShellNav.tsx:165-169`).
- **Rodapé da barra (prints):** "P M G" (tamanho da fonte) e "Lateral/Topo" ficam fixos para todo usuário porque o padrão de fábrica da
  composição é "fixa na barra" para os oito widgets ([[05-cromo-e-slots]] §2.2.2). Parecem ferramenta de desenvolvedor.
- **Ruído visual (prints, tema Blueprint):** borda tracejada em quase tudo (barra, busca, cartões, campos).
- O texto da barra usa os papéis de cor de texto que a `plan-123` criou (aprovada e sintetizada em 2026-10-24): hoje em
  [[02-design-engine]] §10.3 e [[09-temas-e-presets]] §5.3.

# 3. Escopo

## 3.1 Dentro
- `src/core/Design/schema/navigation.ts` e `branding.ts` (tokens novos), partições, mapeamento, tipos gerados, `removedTokenKeys.ts`
  se algum sair.
- `src/components/Layout/chrome/` (corpo lateral, corpo de topo, estilos estruturais, `useChromeDesignTokens.ts`, `ChromeSlots.tsx`),
  `src/components/Layout/SarakAppChromeMobile.tsx`, `src/components/atomic/Navigation/` (`SarakShellNav.tsx`, `SarakMenuItem.tsx`, os
  widgets do cromo).
- `src/core/Design/schema/preferences.ts` e a composição da barra — só o padrão de fábrica das posições (passo 1.4).
- `src/core/Design/presets/themes/*.ts` (os 19, com contraparte).
- Testes; casos em `browser-tests/`; `docs/migracoes.md` (`## 8.0.0`); o guia do consumidor só onde citar a composição de fábrica.

## 3.2 Fora
- A largura do conteúdo (`plan-121`), o painel (`plan-122`), os papéis de cor de texto em si (`plan-123`).
- Novos widgets, slots ou mudança de estrutura do cromo (ordem dos slots, regra de degradação).
- A composição continua sendo decisão do sistema, nunca do tema ([[05-cromo-e-slots]] §2.2.2): nenhum tema declara posição de widget.
- Specs fixas (síntese do revisor); versão e tag.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/05-cromo-e-slots.md` (§2.1.1, §2.2.2, §2.3, §2.4, §2.4.1, §6) | métrica do item; composição; degradação; todo token de cromo tem leitor; zero hardcode |
| Spec fixa | `arquitetura/02-design-engine.md` (§10, §10.6, §10.10, §10.14, §10.15) | o que cada token desenha; `--sarak-on-nav-active`; camadas; estético × funcional |
| Spec fixa | `arquitetura/04-contrato-de-tokens-e-paridade.md` (§2, §2.3) | paridade e metadados |
| Spec fixa | `specs/09-temas-e-presets.md` (§2.1, §5.1, §5.2, §5.3, §6.5) | contraparte; fundo offline; diversidade; o que o tema declara e o teto de peso; contraste |
| Spec fixa | `specs/07-responsividade-e-multidispositivo.md` | o celular e a barra na base |
| Spec fixa | `specs/00-regras-e-invariantes.md` (R31, R40-R44) | contraste; leitor; cascata; cor do tema |
| ADR | `adr/013-item-de-navegacao-como-atomo-proprio.md` · `adr/015-metrica-do-item-de-navegacao-horizontal.md` · `adr/021-navegacao-na-base-do-celular.md` | o item e a métrica que não podem quebrar |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `test-unitario` · `ui-novo-componente` (tokens novos) · `ui-criar-preset` (se o estilo do item ativo virar preset) · `ui-criar-tema` (os 19 temas) · `ui-arquitetura-design` | escrita, testes, token, preset, tema, CSS |
| Código | os arquivos da §3.1 | ler antes de editar |

# 5. Instruções de execução

**Dois lotes**, na ordem; cada um fecha com resumo na §9 e status 🟠.

**Lote 1 — tokens e leitores da barra.** Cada token novo nasce com leitor, teste, metadados e padrão = o comportamento de hoje (até o
lote 2 redefinir o `sarak-sovereign`), separado para lateral e topo onde a §2 mostra que divergem:
1.1. **Texto:** cor do item, do item em hover, do rótulo de categoria e do nome da marca, por barra; a marca respeita `identityFontFamily`
nas duas orientações.
1.2. **Moldura e profundidade:** cor, largura e estilo da borda da barra (incluindo nenhuma) e os lados; sombra e blur também na barra de
topo; cor do separador de grupos; fundo da área da marca e do rodapé.
1.3. **Fundo e item:** fundo da barra como sólido, gradiente ou textura (só o que já funciona offline, [[09-temas-e-presets]] §5.1); estilo
do item ativo como enumeração (barra lateral, pílula, sublinhado, preenchido, contorno) com o marcador acompanhando; densidade do item
(compacto, confortável, espaçoso) respeitando o alvo de toque; tamanho e cor dos ícones da navegação.
1.4. **Rodapé:** o padrão de fábrica das posições muda para "no menu" (dentro do ⚙ *Preferências*) em tamanho da fonte, navegação
topo/lateral e navegação recolhida; modo claro/escuro, busca, usuário, notificações e idioma ficam "fixa na barra". Valor que o sistema
salvou continua valendo. Nota em `docs/migracoes.md`.
1.5. Testes por token; `token-reader:check`, `token-docs:check`, paridade e o gate de cromo da [[05-cromo-e-slots]] §2.4.1 verdes;
caso de navegador: lateral escura em tema claro com item inativo de contraste ≥ 4,5:1.

**Lote 2 — os 19 temas.**
2.1. Cada tema declara os tokens novos (e a contraparte os que carregam modo) com uma barra que expressa a identidade dele — e, onde
fizer sentido, lateral diferente do topo. Um tema por vez, cada um com a decisão de direção em uma linha no resumo.
2.2. Tracejado só onde é a assinatura do tema, num papel só; no Blueprint, barra e campos com borda sólida sutil.
2.2.1. **A contraparte clara leva a assinatura do tema** (medido em 2026-10-23: o Blueprint no claro vira branco e cinza chapados,
sem a grade nem a cor de planta que fazem o tema). A barra e o fundo da contraparte conservam o traço de identidade (textura, matiz,
forma do item ativo), adaptado ao claro.
2.3. Contraste de item inativo, ativo, hover e categoria ≥ 4,5:1 (rótulo de categoria ≥ 3:1 se for grande) nos dois modos.
2.4. Teto de peso por tema respeitado; estourou, relatar — não subir o teto.
2.5. A diversidade do catálogo cobre os eixos novos da barra (pelo menos três estilos de item ativo e três tratamentos de fundo entre os
19); caso de navegador com quatro temas: o estilo computado da barra (fundo, borda, item ativo) difere entre eles.

# 6. Critérios de aceite

- [ ] Tokens de texto, borda, profundidade, fundo, item ativo, densidade, ícone e separador da barra, cada um com leitor e teste.
- [ ] Nenhuma classe fixa de borda, espaçamento ou cor de texto na barra que o token cubra.
- [ ] Rodapé de fábrica sem "P M G" nem "Lateral/Topo" fixos; valor salvo pelo sistema preservado.
- [ ] Os 19 temas com barra própria, contraste passando nos dois modos, teto de peso respeitado.
- [ ] Item de navegação, métrica horizontal, barra na base do celular e regra de degradação intactos (testes existentes verdes).
- [ ] `theme-completeness:check`, `token-reader:check`, `token-docs:check`, paridade, contraste e diversidade verdes.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo — os tokens novos entram nos gates de leitor, paridade, completude e contraste que já existem.

- Lote 1: `npm run verify -- --tier=schema-meta`; vitest de `src/components/Layout` e `src/components/atomic/Navigation`;
  `npm run build` + os casos de cromo de `browser-tests/` (incluindo `cromo-css-real` e `barra-de-topo-estreita`).
- Lote 2: `npm run verify -- --tier=themes`; o caso de navegador dos quatro temas.
- Fechamento: `npm run verify -- --tier=full` e a bateria inteira do navegador.
- Conferência no ERP (dono): trocar entre cinco temas no `/design` e ver a barra mudar além da cor.

# 8. Destino da síntese

**Destino:** `specs/05-cromo-e-slots.md + arquitetura/02-design-engine.md + specs/09-temas-e-presets.md`

- **`05` §2.4:** as linhas dos tokens novos da barra; §2.2.2: o padrão de fábrica novo das posições.
- **`02` §10.6:** o que cada token da barra desenha e o estilo do item ativo.
- **`09` §5.2/§5.3:** a barra entre os eixos de diversidade e o que o tema declara dela.

---

# 9. Resumo da execução

### Lote 1 — tokens e leitores da barra (2026-10-24)

- Declarados tokens de identidade e composição para sidebar/topbar, com leitores para cores derivadas de contraste, bordas, fundos, item ativo, densidade, ícones e separadores. Os leitores do cromo e do item de navegação passaram a aplicar esses valores; fundos com textura usam o recurso local já existente.
- `fontSize`, `navigationStyle` e `navCollapsed` passam a ter posição padrão no menu Preferências; valores válidos já salvos continuam prevalecendo. A mudança foi registrada na subseção Plan 124 de `docs/migracoes.md` em `## 8.0.0`.
- Verificações: `ChromeSidebarBody`, `ChromeTopbarBody`, `SarakAppChromeMobile` e `useNavigationAppearance` (65 testes); `navigation`, `preferences`, `useDesignVariablesDonoUnico` e `chromeStructuralStyles` (83); `ChromeSlots`, `ChromeTopbarBody` e `SarakShellNav` (54). Todas as suítes passaram; `npx tsc --noEmit --pretty false --incremental false` também passou.
- Pendente para a revisão/fechamento: regenerar artefatos compartilhados e executar os gates de schema-meta/paridade/completude/contraste e a bateria de navegador. `npm run build` não foi executado, conforme instrução. Nenhum arquivo do barril público ou componente de composição do plan-126 foi alterado por esta execução.
- Lote 2 não iniciado. Encerrar aqui para revisão antes de prosseguir.

### Correção dos quatro achados — veredito de 2026-10-24

- **Tipos gerados:** executado `npx tsx scripts/generate-token-types.ts`; `npm run token-types:check` confirmou os dois arquivos em dia, com 434 tokens.
- **Reservas CSS:** os fallbacks de marca da sidebar em `ChromeSlots` e `SarakShellNav`, e o fallback do rótulo de categoria, agora seguem o padrão `--sarak-on-sidebar`. `npm run variable-contract:check` passou: 4.277 leituras com dono e 3.162 reservas conferidas.
- **Contraste no navegador:** adicionado caso isolado com Provider e cromo do código-fonte, tema claro e sidebar escura; o item inativo atingiu contraste ≥ 4,5:1. Resultado: 1 teste aprovado. O CSS e os resultados do harness foram temporários e removidos.
- **Kits gerados:** `npm run guide` gerou 111 componentes, 434 tokens e 117 ícones; `npm run guide:check` passou (7 arquivos). `npm run dev-kit` gerou 108 componentes públicos, 403 tokens e 42 gates; `npm run dev-kit:check` passou (3 arquivos, 0 ponteiros mortos).
- `npm run token-docs:check` passou (434/434) e `npx tsc --noEmit --pretty false --incremental false` terminou com código 0. `npm run build` não foi executado.
- `theme-completeness:check` permanece para o lote 2, como esperado; lote 2 não iniciado.

### Lote 2 — identidade por tema (2026-10-24)

- Os 19 temas agora declaram os 31 tokens estéticos das barras; as contrapartes autoradas conservam a assinatura visual adaptada ao modo claro.
- **Direção por tema:**
  - `sarak-sovereign` — barras sólidas com item ativo `bar/bar`, acento ciano e marca magenta.
  - `cyberpunk-neon` — lateral texturizada e topo em gradiente, `filled/underline`, verde neon.
  - `industrial-terminal` — lateral em gradiente e topo sólido, `underline/filled`, laranja de sinalização industrial.
  - `neo-brutalism` — barras sólidas, `filled/pill`, azul e amarelo com borda expressiva.
  - `synthwave-retro` — lateral em gradiente e topo texturizado, `pill/filled`, ameixa com acento aqua.
  - `nebula-space` — lateral texturizada e topo em gradiente, `underline/pill`, roxo cósmico e rosa.
  - `kinetic-flow` — lateral em gradiente e topo sólido, `outline/underline`, grafite com acento menta.
  - `cyber-retro-wave` — lateral texturizada e topo em gradiente, `pill/outline`, verde ácido retro.
  - `minimalist-airy` — barras sólidas, `underline/bar`, branco arejado com azul cobalto.
  - `data-terminal` — lateral texturizada e topo sólido, `filled/underline`, verde terminal com ouro discreto.
  - `neumorphic-mobile` — lateral sólida e topo em gradiente, `pill/outline`, pedra suave com acento bordô.
  - `golden-hour` — lateral em gradiente e topo sólido, `bar/pill`, creme e âmbar.
  - `aurora-veil` — lateral em gradiente e topo texturizado, `outline/pill`, violeta translúcido com rosa.
  - `blueprint-protocol` — lateral texturizada e topo em gradiente, `bar/underline`, azul técnico; barras e campos têm borda sólida sutil e a contraparte clara conserva a grade.
  - `editorial-ink` — lateral sólida e topo em gradiente, `underline/bar`, papel e tinta com bordô.
  - `organic-clay` — lateral texturizada e topo sólido, `pill/filled`, argila e madeira.
  - `high-contrast` — barras sólidas, `filled/underline`, preto e amarelo no nativo, branco e azul-marinho na contraparte.
  - `corporate-ledger` — lateral sólida e topo em gradiente, `outline/bar`, marinho corporativo com marca bronze.
  - `playful-pastel` — lateral em gradiente e topo texturizado, `pill/filled`, paleta pastel quente.
- `theme-completeness:check`: 19/19 completos, 0 lacunas. `token-reader:check`, `token-docs:check` (434/434), `chrome-token-parity:check` (44/44), diversidade e contraste passaram. Contraste: 89 pares; 0 reprovações nos modos nativo e oposto, com contraparte autorada nos 19 temas. Diversidade: 5 estilos ativos por barra e 3 tratamentos de fundo por barra.
- `npm run boot:measure`: boot 357,1 KB gzip; referência 354,0 KB; catálogo 2,2 KB; teto calculado 359,3 KB. Maior tema `synthwave-retro`: 7,1 KB gzip, abaixo do teto de 15 KB. Nenhum tema fora do padrão entrou no fecho estático.
- Saídas dos geradores regenerados:
  - `npm run token-types` — `✅ design-token-ids.ts: 434 tokens tipados (interface SarakDesignTokens + DesignTokenId).`
  - `npm run themes:catalog` — `✅ catalog.generated.ts: 19 temas no catálogo leve.`
  - `npm run catalog` — `[catalog] 108 componentes → docs/component-catalog.{json,md}`
  - `npm run guide` — `[guide] sarak-ui/ gerado — 111 componentes, 434 tokens de tema, 117 ícones (kitHash 676209e78aac).`
  - `npm run dev-kit` — `[dev-kit] sarak-dev/ gerado — 108 componentes públicos, 403 tokens, 42 gates (devKitHash 6c39187556f9).`
  - Checks dos tipos, catálogos e kits passaram; o kit do consumidor ficou em dia com 9 arquivos e o dev-kit com 3 arquivos e 0 ponteiros mortos.
- Vitest direcionado: 82/82 testes passaram; `tsc --noEmit` terminou com código 0. O caso isolado de navegador dos quatro temas passou (1/1); `npm run build` não foi executado.
- O validador AST TypeScript terminou com código 0; fixture e caso novo de navegador sem achados. Ele ainda relata limites de aridade na fábrica de tokens do lote 1, anotações ausentes e funções/callbacks longos nos utilitários e testes existentes de cromo/diversidade; não foram refatorados neste lote.
- `npm run verify -- --tier=themes` foi executado e classificou 10 arquivos. Não ficou verde: o Vitest interno falhou ao escrever o arquivo temporário de configuração em `node_modules/.vite-temp` (`EPERM`), e `audit:baseline` apontou regressões em hardcodes (0→6), variáveis-fantasma (0→15), Clean Code (0→1) e paridade (0→1), em áreas do lote 1 aprovado. Os testes direcionados passaram com o loader isolado. Esses arquivos do lote 1 não foram alterados neste lote.
- `git status --short`: **não executável aqui** (`fatal: this operation must be run in a work tree`); o revisor confere o diff/estado do worktree. O `verify` acima conseguiu sua própria classificação via diff, mas os dois gates que falharam ficam registrados separadamente.
- `npm run plan-index` regenerou o índice compartilhado para os quatro frontmatters ativos; `npm run plan-index:check` passou. A sincronização refletiu o status atual da plan-126 sem alterar seus arquivos-fonte.

### Correção dos quatro achados do veredito de 2026-10-24 — executor

- **Paridade das três fontes:** os 31 tokens de barra foram acrescentados ao `theme_table_mapping.json` e à partição `layout_and_navigation`, com metadados e `consumerHook` para os tokens estruturais. A auditoria registra 434 tokens no schema, no mapping e no catálogo.
- **Valores efetivamente declarados pelo tema:** `auditor_ghostvars` agora reconhece as emissões feitas por `createChromeColorToken` e `createChromeSliderToken` somente quando a implementação contém `cssVars: [cssVariable]`, sem tratar o manifesto como emissor. O fixture positivo e o negativo passaram (7/7 testes do gate). O auditor encontrou zero variáveis-fantasma. O caso isolado de navegador compara, em quatro temas, as cores computadas do item inativo, da marca e da borda com as cores declaradas pelo tema: 1/1 passou.
- **Hardcodes:** o tamanho dos ícones, a largura da borda e o brilho do marcador em `SarakMenuItem` usam os tokens correspondentes. A sombra do drawer móvel usa a variável de tema. `auditor_hardcoded.mjs`: 0 valores e 0 violações estruturais.
- **Limite do componente móvel:** o drawer foi extraído para `ChromeMobileDrawer`; `SarakAppChromeMobile.tsx` ficou com 238 linhas (limite 250).
- Vitest direcionado às quatro suítes afetadas: 4 arquivos e 109/109 testes passaram. `npx tsc --noEmit --pretty false --incremental false` também passou, incluído na auditoria baseline abaixo. O teste de navegador usou o harness isolado.

Saídas pontuais das correções:

```text
auditor_hardcoded.mjs: Valor (hex / px / rem / em) = 0; Estrutural (líquido) = 0.
auditor_ghostvars.mjs: [OK] Nenhuma variável-fantasma consumida.
auditor_ghostvars.scope.test.mjs: Test Files 1 passed (1); Tests 7 passed (7).
browser-tests/chrome-theme-identity.spec.ts: 1 passed — quatro temas produzem estilos computados diferentes na barra.
Vitest direcionado: Test Files 4 passed (4); Tests 109 passed (109).
```

#### Saídas dos gates finais

```text
--- theme-completeness:check (completude dos temas embarcados) ---
✅ 19 de 19 temas completos; 0 em exceção (esvazia a cada lote de tema).

--- check-token-reader (todo valor emitido pelo motor tem leitor) ---
[OK] Todo valor emitido tem leitor.

--- token-docs:check (documentação de token) ---
✅ 434 de 434 tokens documentados; 0 em exceção (esvazia a cada lote).

--- check-chrome-token-parity (schema `navigation` + sistema de cromo) ---
[OK] Os 44 tokens cobertos (de 44 nos schemas) têm consumidor no SarakAppChrome.

--- check-variable-contract ---
[OK] um dono por variável; 4260 leituras com dono; 3154 reservas conferidas contra o padrão.
```

Saída integral do verificador de contraste:

```text
--- Verificador de Contraste WCAG AA nos temas de referência (R31) ---
89 pares reais cobertos, limiar 4,5:1 em todos.
--- MODO NATIVO ---
[OK] sarak-sovereign
[OK] cyberpunk-neon
[OK] industrial-terminal
[OK] neo-brutalism
[OK] synthwave-retro
[OK] nebula-space
[OK] kinetic-flow
[OK] cyber-retro-wave
[OK] minimalist-airy
[OK] data-terminal
[OK] neumorphic-mobile
[OK] golden-hour
[OK] aurora-veil
[OK] blueprint-protocol
[OK] editorial-ink
[OK] organic-clay
[OK] high-contrast
[OK] corporate-ledger
[OK] playful-pastel
0 de 19 temas com pelo menos 1 par abaixo de AA.
0 par(es)-tema reprovado(s) no total; 0 par(es)-tema pulado(s) (fundo não determinístico).
--- MODO OPOSTO (segunda passada — contraparte autorada quando existe) ---
[OK] sarak-sovereign
[OK] cyberpunk-neon
[OK] industrial-terminal
[OK] neo-brutalism
[OK] synthwave-retro
[OK] nebula-space
[OK] kinetic-flow
[OK] cyber-retro-wave
[OK] minimalist-airy
[OK] data-terminal
[OK] neumorphic-mobile
[OK] golden-hour
[OK] aurora-veil
[OK] blueprint-protocol
[OK] editorial-ink
[OK] organic-clay
[OK] high-contrast
[OK] corporate-ledger
[OK] playful-pastel
0 de 19 temas com pelo menos 1 par abaixo de AA.
0 par(es)-tema reprovado(s) no total; 0 par(es)-tema pulado(s) (fundo não determinístico).
0 par(es)-tema reprovado(s) no MODO OPOSTO.
--- Exigência de CONTRAPARTE ---
0 tema(s) isento(s) (legados).
19 tema(s) com contraparte autorada.
0 tema(s) SEM contraparte e fora da isenção.
✅ Nenhum tema fora da isenção está sem contraparte.
✅ Todos os temas de referência passam AA nos pares cobertos, nos dois modos, e todo tema não isento tem contraparte.
```

Saída integral do medidor de diversidade:

```text
--- Medidor de Diversidade de Temas ---
| tema | modo | família | H | S | fundo L | raio | borda | blur | densidade |
|---|---|---|---|---|---|---|---|---|---|
| sarak-sovereign | dark | ciano | 184 | 88 | 4 | 14 | 1 | 12 | comfortable |
| cyberpunk-neon | dark | verde | 145 | 100 | 2 | 0 | 1 | 0 | comfortable |
| industrial-terminal | dark | laranja | 33 | 100 | 3 | 0 | 2 | 0 | compact |
| neo-brutalism | light | azul | 227 | 100 | 93 | 4 | 3 | 0 | comfortable |
| synthwave-retro | dark | magenta | 330 | 100 | 11 | 18 | 1 | 10 | comfortable |
| nebula-space | dark | roxo | 260 | 100 | 6 | 24 | 1 | 20 | spacious |
| kinetic-flow | dark | vermelho | 4 | 100 | 7 | 12 | 0 | 12 | compact |
| cyber-retro-wave | light | ciano | 197 | 100 | 82 | 20 | 1 | 14 | comfortable |
| minimalist-airy | light | azul | 221 | 39 | 98 | 32 | 0 | 12 | spacious |
| data-terminal | light | verde | 156 | 100 | 97 | 6 | 1 | 0 | compact |
| neumorphic-mobile | light | neutro | 207 | 17 | 91 | 24 | 0 | 0 | comfortable |
| golden-hour | light | laranja | 40 | 100 | 96 | 20 | 1 | 0 | spacious |
| aurora-veil | light | roxo | 260 | 36 | 97 | 28 | 1 | 16 | comfortable |
| blueprint-protocol | dark | azul | 211 | 66 | 25 | 2 | 1 | 12 | compact |
| editorial-ink | light | neutro | 30 | 4 | 94 | 2 | 1 | 0 | spacious |
| organic-clay | light | verde | 81 | 35 | 68 | 16 | 0 | 0 | comfortable |
| high-contrast | dark | amarelo | 50 | 100 | 0 | 4 | 2 | 0 | comfortable |
| corporate-ledger | light | azul | 253 | 42 | 97 | 6 | 1 | 0 | compact |
| playful-pastel | light | vermelho | 348 | 61 | 98 | 28 | 2 | 12 | spacious |
--- TODOS OS TEMAS (19 temas) ---
mode: dark ............................ 8 de 19
primária S=100 (neon puro) ............. 10 de 19
família ciano + magenta ................ 3 de 19
claro com primária saturada (S≥60) ..... 5 de 19
fundo de luminosidade média (25..75) ... 2 de 19
--- Diversidade do cromo ---
[OK] itens ativos na lateral (5): bar, filled, outline, pill, underline
[OK] itens ativos no topo (5): bar, filled, outline, pill, underline
[OK] fundos da lateral (3): gradient, solid, texture
[OK] fundos do topo (3): gradient, solid, texture
```

```text
--- measure-consumer-boot ---
boot (src, só o tema padrão + catálogo): 357.2 KB gzip / 1301.1 KB raw (13 pedaço(s))
referência (só o padrão, sem catálogo):  354.1 KB gzip
catálogo leve:                           2.2 KB gzip
teto relativo (ref + catálogo + 3 KB):   359.4 KB gzip
maior tema: synthwave-retro — 7.1 KB gzip (teto 15.0 KB)
[OK] boot do consumidor dentro do teto; nenhum tema fora do padrão no fecho estático.
```

#### Artefatos regenerados no fim

```text
npm run token-types: ✅ design-token-ids.ts: 434 tokens tipados (interface SarakDesignTokens + DesignTokenId).
npm run themes:catalog: ✅ catalog.generated.ts: 19 temas no catálogo leve.
npm run catalog: [catalog] 108 componentes → docs/component-catalog.{json,md}
npm run guide: [guide] sarak-ui/ gerado — 111 componentes, 434 tokens de tema, 117 ícones (kitHash 676209e78aac).
npm run dev-kit: [dev-kit] sarak-dev/ gerado — 108 componentes públicos, 434 tokens, 42 gates (devKitHash aef993b3fbab).
token-types:check: em dia (434 tokens); themes:catalog:check e catalog:check: em dia.
guide:check: em dia (9 arquivos); dev-kit:check: em dia (3 arquivos, 0 ponteiros mortos).
```

#### Auditoria final e limites do ambiente

```text
[audit:baseline] igual ao baseline de 2026-10-12 — nenhuma regressão.
```

`git status --short` e demais conferências dependentes de `git diff`: **não executável aqui** (`fatal: this operation must be run in a work tree`); o revisor confere o estado do worktree. Nenhuma referência à plan foi introduzida em código ou teste. `npm run build` não foi executado. O status desta plan continua `🔵 Em correção`, aguardando nova revisão.

### Correção dos achados da correção 1 do lote 2 — 2026-10-24

**Resultado:** Concluído com pendências

**Estado do worktree ao iniciar**

```text
fatal: this operation must be run in a work tree
```

**O que foi feito**

- O item horizontal passou a usar peso `font-light` (300) também no estado ativo; a orientação vertical conserva o realce forte. As medições de tablet e desktop passaram no navegador.
- `navActiveMarkerGlow` voltou a emitir número sem unidade. A classe `.sarak-nav-marker-glow` converte o número para comprimento no CSS; a prova existente de ausência de unidade em `residuo-da-reauditoria.spec.ts` foi mantida.
- A prova de contraste abre Preferências e mede os dois grupos dentro do menu. A referência de `SarakButton` usa correspondência exata nos testes de raio.
- Os testes unitários dos dois corpos do cromo agora verificam a classe de brilho, que passou a ser responsável pela sombra depois da extração do valor do `style` inline.
- O snapshot de `PreviewCanvas` foi regravado após os testes e a auditoria; o Vitest informou 1 snapshot atualizado.

**Arquivos alterados**

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/atomic/Navigation/SarakMenuItem.tsx` | alterado | Peso horizontal abaixo de 400; classe de brilho e estilo inline separados. |
| `src/core/Design/schema/navigation.ts` | alterado | `navActiveMarkerGlow` deixa de declarar unidade `px`. |
| `src/styles/_utilities.css` | alterado | A classe do marcador aplica o brilho usando o token numérico. |
| `browser-tests/cromo-css-real.spec.ts` | alterado | Seletores da referência exatos; caminho opcional do Chromium para o harness. |
| `browser-tests/residuo-da-reauditoria.spec.ts` | alterado | Caminho opcional do Chromium; asserção de unidade mantida sem alteração. |
| `browser-tests/seletor-da-barra-legivel.spec.ts` | alterado | Abre Preferências e limita a medição de contraste ao menu. |
| `src/components/Layout/chrome/__tests__/ChromeTopbarBody.test.tsx` | alterado | Verifica a classe do marcador e a cor inline. |
| `src/components/Layout/chrome/__tests__/ChromeSidebarBody.test.tsx` | alterado | Verifica a classe do marcador e a cor inline. |
| `src/features/DesignEngine/Canvas/__tests__/__snapshots__/PreviewCanvas.test.tsx.snap` | alterado | Snapshot regravado pelo Vitest após as demais verificações. |
| `specs/plan/plan-124-cromo-com-identidade-por-tema.md` | alterado | Resumo desta correção; status movido para revisão. |

**Verificações executadas**

- Harness isolado, biblioteca do `src` e CSS compilado em diretório temporário, nos três arquivos pedidos → `53 passed (3.8m)`: cromo 32/32, resíduo 15/15, seletores de contraste 6/6.
- `residuo-da-reauditoria.spec.ts` repetido com a implementação final → `15 passed (1.7m)`; o token de brilho saiu sem unidade.
- Vitest focado em `SarakMenuItem`, `ChromeTopbarBody` e `ChromeSidebarBody` → 3 arquivos e 122 testes aprovados.
- Snapshot: `PreviewCanvas.test.tsx` → 1 arquivo e 4 testes aprovados; `Snapshots 1 updated`.
- `npm run -s audit:baseline -- --with-tsc` → `[audit:baseline] igual ao baseline de 2026-10-12 — nenhuma regressão.`
- `git status --short` e `git diff --check` → **não executável aqui** (`fatal: this operation must be run in a work tree`).
- `npm run build` não foi executado. Nenhum arquivo da fronteira da plan-126 foi alterado.

**Critérios de aceite**

- [x] Métrica horizontal e brilho do marcador corrigidos no código — evidência: 32/32 casos de cromo e 15/15 casos de resíduo.
- [x] Prova de contraste preservada no menu de Preferências e seletores da referência inequívocos — evidência: 6/6 casos.
- [x] Snapshot regravado após os achados 1–3 — evidência: `Snapshots 1 updated`.
- [x] Baseline sem regressão — evidência: saída de `audit:baseline` acima.
- [ ] Conferência baseada em `git diff` — motivo: este ambiente não reconhece a pasta como worktree.

**Decisões e suposições**

- O harness apontou `SARAK_PLAN124_CHROMIUM_PATH` para o Chrome instalado, pois o Chromium gerenciado pelo Playwright não está presente. A biblioteca e o CSS medidos foram compilados em pasta temporária; `dist/` não foi modificado.

**Achados fora do escopo (não corrigidos)**

- Nenhum achado adicional foi corrigido. A conferência final do diff fica para o revisor, pois Git não opera neste ambiente.

---

# 10. Veredito

## Veredito — 2026-10-24 — lote 1 — 🔴 Reprovado (4 achados)

Conferência objetiva (gates rápidos e `tsc`, rodados pelo revisor; a bateria completa fica para o fim da onda): `tsc` 0;
`token-docs:check` (434/434), `token-reader:check`, `chrome-token-parity:check` (44/44), `catalog:check`, `panel-contract:check` e
`css-important:check` verdes. `theme-completeness:check` acusa 893 lacunas e 0/19 temas completos — **esperado** entre o lote 1 (tokens
novos com padrão) e o lote 2 (os 19 temas os declaram); não conta contra este lote. "Gates no fechamento conjunto" não vale para o resto:
cada lote entrega os próprios gates verdes (passo 1.5). Falta:

1. `token-types:check` → "design-token-ids.ts e design-token-docs.json DEFASADO": regenerar (`npx tsx scripts/generate-token-types.ts`).
2. `variable-contract:check` → 3 reservas diferentes do padrão do token: `components/Layout/chrome/ChromeSlots.tsx:62` e
   `components/atomic/Navigation/SarakShellNav.tsx:160` (`--sarak-sidebar-brand-color, #f2f6fb`; padrão `var(--sarak-on-sidebar, …)`),
   `SarakShellNav.tsx:199` (`--sarak-sidebar-category-color`). Reserva = padrão (R42).
3. O caso de navegador do passo 1.5 não existe (nada novo em `browser-tests/`): lateral escura num tema claro, item inativo com
   contraste ≥ 4,5:1. Escrever e rodar com o harness isolado, sem `npm run build`.
4. Gerados do lote: `npm run guide` e `npm run dev-kit` (o `guide:check` e o `dev-kit:check` acusam defasagem) — no fim, colando os
   checks.

## Veredito — 2026-10-24 — correção 1 (lote 1) — 🟢 Aprovado; lote 1 fechado

Conferência objetiva, rodada pelo revisor: `token-types:check` em dia (434 tokens); `variable-contract:check` verde (4.277 leituras com
dono, 3.162 reservas conferidas — as três reservas do cromo agora iguais ao padrão); `guide:check` (7 arquivos) e `dev-kit:check` (3
arquivos, 0 ponteiros mortos) em dia. O caso `browser-tests/plan-124-sidebar-contrast.spec.ts` mede o item inativo da lateral escura num
tema claro contra o piso de 4,5:1 (o executor o rodou com o harness isolado; entra na bateria do fim da onda). `theme-completeness:check`
segue vermelho por desenho até o lote 2. O lote 2 (os 19 temas) segue.

## Veredito — 2026-10-24 — lote 2 (e reabertura do lote 1) — 🔴 Reprovado (4 achados)

O lote 2 cumpre o que é dele: `theme-completeness:check` → 19/19, 0 lacunas; contraste em 89 pares nos dois modos; diversidade com 5
estilos de item ativo e 3 tratamentos de fundo; `boot:measure` verde (maior tema 7,1 KB); `trail-citation:check` verde (rodado pelo
revisor). **Mas o revisor aprovou o lote 1 sem rodar a auditoria**, e ela pega defeitos do lote 1 que anulam parte do lote 2:
`npm run -s audit:baseline -- --with-tsc` → REGRESSÃO `auditor_hardcoded.valor 0 -> 6`, `auditor_ghostvars.consumos 0 -> 15`,
`auditor_cleancode.violacoes 0 -> 1`, `auditor_paridade.falhou 0 -> 1` (detalhe em `node gates/scripts/audit/run_audit.mjs`).

1. **Paridade 1:1:1 quebrada** (regra inegociável, [[04-contrato-de-tokens-e-paridade]]): os tokens novos de barra
   (`sidebarItemTextColor`, `sidebarItemHoverTextColor`, `sidebarCategoryColor`, `sidebarBrandColor`, `sidebarBorderColor`,
   `sidebarBorderWidth`, `sidebarBorderStyle`, `sidebarBorderSide`, `sidebarBrandBackground`, `sidebarFooterBackground`,
   `sidebarBackgroundStyle` e os demais — 62 falhas) não estão em `theme_table_mapping.json` nem em nenhuma partição do catálogo.
   Seguir a skill `ui-novo-componente` para cada token.
2. **Variáveis-fantasma — o efeito do achado 1:** 11 variáveis lidas e nunca escritas (15 consumos): `--sarak-{sidebar,topbar}-brand-bg`,
   `--sarak-{sidebar,topbar}-brand-color`, `--sarak-{sidebar,topbar}-item-text-color`, `--sarak-{sidebar,topbar}-item-hover-text-color`,
   `--sarak-topbar-group-separator-color`, `--sarak-sidebar-category-color`, `--sarak-sidebar-footer-bg`. O cromo lê esses nomes, o motor
   não os emite: **o que os 19 temas declararam para a barra não chega à tela** — o que aparece é a reserva. Depois do achado 1,
   `auditor_ghostvars` em 0 e um caso de navegador que prove o efeito: em dois temas com valores de barra diferentes, a cor do item
   inativo, a da marca e a borda computadas são **as declaradas pelo tema**, não a reserva.
3. **Hardcode (6):** `src/components/atomic/Navigation/SarakMenuItem.tsx:127,144,155 (2×),192` e
   `src/components/Layout/SarakAppChromeMobile.tsx:216` — px fixo fora de reserva de token (zero hardcoded).
4. **Clean code:** `src/components/Layout/SarakAppChromeMobile.tsx` com 270 linhas (teto 250) — extrair, sem mudar comportamento.

Feche com `audit:baseline -- --with-tsc` sem regressão (colado), além dos checks já pedidos.

## Veredito — 2026-10-24 — correção 1 (lote 2) — 🔴 Reprovado (4 achados)

Os quatro achados anteriores estão resolvidos (rodado pelo revisor: `audit:baseline -- --with-tsc` sem regressão, nenhuma
variável-fantasma, `trail-citation:check` verde; a mudança em `auditor_ghostvars.mjs` ensina o auditor a ler a variável declarada pelas
fábricas `createChromeColorToken`/`createChromeSliderToken`, com fixture positiva e negativa — leitura, não afrouxamento; o caso que
compara cor computada e declarada em quatro temas prova o efeito). **Bateria do worktree inteiro:** `verify --tier=full` → `tsc` 0 e 29
gates verdes (o `kit-names:check` do `verify` mediu o `dist/` antigo; dentro do `build`, que veio depois, passou); vitest com 1 falha;
`npm run cromo-css-real:check` → `build` completo e **431/442**, as 11 falhas deste lote (as cenas da `plan-126` passaram):

1. **Métrica do item de navegação quebrada** — critério da §6 "item de navegação, métrica horizontal … intactos (testes existentes
   verdes)" e [[015-metrica-do-item-de-navegacao-horizontal]]: `browser-tests/cromo-css-real.spec.ts` › "tablet (768-1023): item de
   navegação usa métrica de PÍLULA…" (o item sai `font-bold` 700, o caso exige < 400) e › "desktop (>=1024): item de navegação usa
   métrica de LISTA…". A densidade e o estilo de item novos não podem mudar a métrica que o ADR fixa; o padrão de cada tema tem de
   respeitá-la.
2. **Brilho do marcador com unidade** — `browser-tests/residuo-da-reauditoria.spec.ts` › "--sarak-nav-marker-glow sai SEM unidade…"
   recebe `"8px"`: a variável voltou a sair com unidade (provável efeito do conserto de hardcode em `SarakMenuItem.tsx:192`), e o leitor
   que multiplica por `1px` passa a calcular errado. Regressão: a variável sai sem unidade, como antes.
3. **Seletores da barra e o ⚙ Preferências** — `browser-tests/seletor-da-barra-legivel.spec.ts` (6 casos: "os dois seletores têm um
   botão selecionado") e `cromo-css-real.spec.ts` › "NÃO MUDA NADA: o SarakButton de referência…" e › "<button> com rounded-full…"
   (o seletor do caso agora casa dois botões: o do ⚙ e o de referência). A mudança de padrão de fábrica do passo 1.4 (tamanho da fonte e
   navegação no ⚙) é intencional; os casos precisam afirmar o comportamento novo **mantendo a prova**: o contraste do botão selecionado
   medido onde os seletores estão agora (dentro do ⚙, ou numa cena com a composição fixa na barra) e o seletor do botão de referência
   inequívoco.
4. Snapshot `src/features/DesignEngine/Canvas/__tests__/PreviewCanvas.test.tsx:67` — diverge pelo cromo novo da prévia. Regravar
   **depois** dos achados 1-3, conferindo que o diff é só o efeito deste lote.

Rodar os três arquivos de navegador com o harness isolado e colar as saídas; `audit:baseline` sem regressão.

## Veredito — 2026-10-24 — correção 2 (lote 2) — 🟢 Aprovado; plan concluída

Rodado pelo revisor: `audit:baseline -- --with-tsc` sem regressão; `trail-citation:check`, `variable-contract:check`,
`token-reader:check`, `theme-completeness:check` (19/19), `catalog:check`, `guide:check` e `dev-kit:check` verdes; `npm run build`
completo; `cromo-css-real.spec.ts` + `residuo-da-reauditoria.spec.ts` + `seletor-da-barra-legivel.spec.ts` → **53/53**; `PreviewCanvas.test.tsx`
→ 4/4.

1. **Métrica do item** — corrigida no código; as asserções do ADR-015 em `cromo-css-real.spec.ts` não mudaram e passam.
2. **Brilho do marcador** — a variável volta a sair sem unidade; a asserção de `residuo-da-reauditoria.spec.ts` não mudou e passa.
3. **Seletores no ⚙** — `seletor-da-barra-legivel.spec.ts` mede o contraste onde os seletores estão agora; o botão de referência é achado
   por nome exato (`exact: true`), sem afrouxar a medida.
4. **Snapshot** regravado e verde.

O resto da onda já tinha passado na bateria completa desta data (`verify --tier=full`, 431/442 com as falhas só deste lote, agora
corrigidas). Os nomes de teste que carregam rastro de plan (`plan-12x-*.spec.ts`, `SARAK_PLAN124_CHROMIUM_PATH`) são convenção do
conjunto, não defeito deste lote: viraram o item 58 do [[00-backlog]].
