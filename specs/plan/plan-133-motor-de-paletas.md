---
tipo: "plan"
titulo: "Separar a cor do tema: um motor que calcula a paleta inteira, nos dois modos, a partir de uma cor e de um tipo"
objetivo: "Fazer as cores do tema saírem de uma paleta calculada a partir de uma cor-base e de um tipo de harmonia, com escalas OKLCH, um mapa de papéis comum por modo e correção de contraste que torna legível qualquer cor de entrada, mantendo o ajuste granular de token por cima"
dominio: "Design Engine / Cores"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "rc.4", "paletas", "cores", "design-engine"]
relacionados: ["[[anexos/rc4-contrato]]", "[[09-temas-e-presets]]", "[[02-design-engine]]", "[[04-contrato-de-tokens-e-paridade]]", "[[plan-134-catalogo-de-paletas-e-temas]]", "[[plan-135-paletas-no-painel-e-no-kit]]"]
depende_de: "plan-128-idioma-unico-e-feedback-rico"
retida_por: ""
destino_sintese: "adr/NNN-paleta-calculada-separada-do-tema.md + specs/09-temas-e-presets.md + arquitetura/02-design-engine.md"
---

# 1. Objetivo

Um `design` com `colorPalette` recebe todos os tokens de cor calculados — escalas, papéis por modo e contraste garantido —, e o
token de cor declarado explicitamente (tema, `config` do host ou ajuste do usuário) continua vencendo o calculado.

# 2. Contexto

Decisão do dono (2026-10-27), registrada no contrato da `rc.4` §1.9: **a paleta é só a entrada do cálculo**, `{ cor-base, tipo,
secundária?, acento? }`; não há edição manual de tons. Os presets embarcados (`plan-134`) e a paleta criada pelo usuário no painel
(`plan-135`) usam o **mesmo** cálculo.

**Hoje:** cada tema escreve as cores à mão em `design` e no bloco do modo oposto (`contraparte`, [[09-temas-e-presets]] §2.1); só 55
dos 422 tokens mudam de modo. A composição é `composeThemeDesign` (`src/core/Design/presets/themes/compose.ts`: padrão do schema →
chaves preservadas → `config` do host → tema). O schema de cor é `src/core/Design/schema/colors.ts`. A lição que este desenho não
pode repetir está em [[09-temas-e-presets]] §2.1: inverter cores forçando faixas fixas de luminosidade fez todo tema convergir para a
mesma paleta neutra. Aqui, cada modo lê tons da escala **da própria paleta** — o matiz se conserva.

**O cálculo** (o dono aprova a regra pela prévia da `plan-134`, não por paleta):
1. **Sementes.** Primária = cor-base. Secundária e acento: as informadas, ou giradas pelo tipo — `monochromatic` (mesmo matiz,
   variando luminosidade e croma), `analogous` (±30°), `complementary` (acento a 180°), `split-complementary` (180° ± 30°),
   `triadic` (±120°). Neutro = matiz da base com croma quase zero. Status (sucesso, erro, alerta, informação) com matiz **fixo**,
   só a luminosidade harmonizada.
2. **Escalas.** Cada semente vira 11 tons (50–950) em OKLCH: matiz fixo, régua de luminosidade comum, croma reduzido nas pontas,
   recorte de gama para sRGB reduzindo o croma (nunca o matiz).
3. **Mapa de papéis.** Uma tabela única token → tom, por modo (ex.: `titleColor` = primária 800 no claro, 200 no escuro). A
   hierarquia de título, subtítulo, texto e texto apagado sai daqui.
4. **Correção de contraste.** Depois do mapa, cada par que a tela desenha — a lista `PAIRS` de `gates/scripts/audit/verify_contrast.ts`
   é a fonte, não uma cópia — é conferido pela razão WCAG; abaixo do mínimo, o tom do texto anda na escala (mais escuro no claro, mais
   claro no escuro) até atingir. Determinístico: mesma entrada, mesma saída.

**Formato do token** (contrato §1.9): `colorPalette` é string — `"<id-de-preset>"` ou
`"custom:<tipo>:<#base>[,sec=<#hex>][,acc=<#hex>]"`. Ausente = rc.3 (o tema usa as cores que declara). Por isso nenhum tema salvo de
importador muda: as cores dele são explícitas e vencem.

**Disjunção com a `plan-131`** (paralela): esta plan **não** edita `src/core/Design/hooks/useDesignVariables.ts` nem
`designVariableHelpers.ts`; a cor de título chega como valor do token `titleColor` calculado.

# 3. Escopo

## 3.1 Dentro
- `src/core/Design/palette/` (novo) — conversão OKLCH ↔ sRGB, sementes por tipo, escalas, mapa de papéis, correção de contraste,
  `resolvePalette(entrada, modo) → tokens de cor`, parser e validador do valor de `colorPalette`, tipos públicos. Cada módulo com teste.
- **Ampliação de escopo (revisor, 2026-10-28, a pedido do executor):** `PAIRS` e o que ele precisa (`MIX_SOURCE_SHARE`, o tipo do par) saem de `gates/scripts/audit/verify_contrast.ts` para `src/core/Design/palette/contrast-pairs.ts` — **dado puro**, sem import de Node —, e o gate passa a importá-lo de lá. A correção de contraste roda em tempo de execução (paleta criada pelo usuário), então a lista tem de estar no bundle; o gate segue medindo o mesmo. Prova: `gates/scripts/audit/__tests__/verify_contrast.test.ts` verde e o resultado do `auditor_contraste` igual ao do `HEAD` (números colados no resumo).
- `src/core/Design/schema/colors.ts` — token `colorPalette`, com a paridade das três fontes (`catalog/theme_table_mapping.json` e
  partições do catálogo) e o leitor (R40: o leitor é a expansão da paleta).
- `src/core/Design/presets/themes/compose.ts` e o ponto onde o modo escolhe `design` × `contraparte` — inserir a paleta resolvida para o
  modo **antes** das cores explícitas: `padrão → preservadas → paleta(modo) → config do host → tema`, com as cores explícitas do tema e
  do host vencendo a paleta.
- A validação de `design` (`validateDesign` e o predicado por token) — `colorPalette` inválido é recusado com aviso e cai no rc.3.
- Um registro mínimo de presets (`palette/presets.ts`) com **um** preset de teste; o catálogo real é da `plan-134`.
- `src/index.ts` (acréscimo: tipos e `sarakResolvePalette` para quem quiser prever no próprio sistema) · `docs/migracoes.md` (subseção
  na `## 8.0.0`) · `src/core/i18n/catalogEntries.palette.ts` (nomes dos tipos), ligado em `catalog.ts` por acréscimo.

## 3.2 Fora
- Os 19 temas e o catálogo de presets (`plan-134`); o painel e o kit (`plan-135`).
- `useDesignVariables.ts`, `designVariableHelpers.ts` (`plan-131` em paralelo).
- Dependência nova: a conversão OKLCH é código próprio (≈ 60 linhas).
- Mudar `syncThemeWithMode`/`shiftColorMode`: seguem servindo temas sem paleta.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Contrato | `specs/plan/anexos/rc4-contrato.md` §1.9, §5 Q8, **§9** | o que entregar e como verificar |
| Spec fixa | `specs/09-temas-e-presets.md` §2, §3, §4.3, §6.5 | contraparte, preset × tema, composição, contraste |
| Spec fixa | `arquitetura/02-design-engine.md` §10 · `arquitetura/04-contrato-de-tokens-e-paridade.md` | leitor de token (R40), um dono por variável, paridade 1:1:1 |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `ui-novo-componente` (token novo com paridade) · `ui-arquitetura-design` | sempre |
| Código | `src/core/Design/presets/themes/compose.ts`, `src/core/Design/schema/colors.ts`, `gates/scripts/audit/verify_contrast.ts` (`PAIRS`) | ler antes de editar |

# 5. Instruções de execução

1. Fotografe o worktree.
2. Módulos puros de `palette/` na ordem do §2 (conversão → sementes → escalas → mapa → contraste → `resolvePalette`), cada um com teste.
3. A régua de luminosidade, a curva de croma e o mapa de papéis ficam em **uma** constante cada, documentada; nenhum hex fixo fora do
   matiz fixo dos status.
4. Token `colorPalette` com paridade e validação; composição como em §3.1.
5. Teste de propriedade: os presets e uma **amostra de cores extremas** (amarelo-limão, ciano, magenta, quase preto, quase branco,
   cinza puro) × os cinco tipos × os dois modos passam em **todos** os `PAIRS` com a razão mínima de cada par.
6. Subseção em `docs/migracoes.md` (token novo; nada muda para quem não o declara); `npm run verify -- --tier=quick` uma vez, resumo
   colado (contrato §9).

# 6. Critérios de aceite

- [ ] `resolvePalette` é determinístico e devolve todos os tokens de cor que o mapa cobre, nos dois modos — teste.
- [ ] Teste de propriedade do passo 5 verde; a correção de contraste comprovadamente atua (um caso em que, sem ela, o par reprova).
- [ ] Cor explícita vence a paleta (tema, host e ajuste do usuário) — teste de composição.
- [ ] Sem `colorPalette`, o `design` composto é idêntico ao da rc.3 para os 19 temas — teste que compara chave a chave.
- [ ] `colorPalette` inválido: aviso e rc.3 — teste.
- [ ] Paridade do token verde (`audit:baseline` do `quick`).
- [ ] Resumo com a tabela item → teste.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo — o contraste da paleta é provado por teste de propriedade; o `auditor_contraste` existente passa a medir os temas
que declararem paleta (`plan-134`).

- `npx vitest run src/core/Design/palette compose src/core/Design/schema` — uma vez.
- Diff lido contra o contrato §1.9; `git diff --stat` só com a §3.1. O `quick` do executor é aceito pelo resumo colado.

# 8. Destino da síntese

**Destino:** ADR novo + `specs/09-temas-e-presets.md` + `arquitetura/02-design-engine.md`.

- **ADR** — `alternativas_consideradas`: (a) paleta calculada de uma entrada `{base, tipo, sementes?}`, custo: nenhum ajuste manual
  de tom, a regra do cálculo carrega toda a qualidade; (b) paleta como bloco de valores autorados por modo, custo: ~75 cores × 2 modos à
  mão por paleta, hierarquia de título sem regra comum, criação pelo usuário inviável. Escolhida: (a), decisão do dono, 2026-10-27.
  Voltar atrás exige reescrever presets, painel e payload.
- **09** — novo §: "A cor vem da paleta": entrada, tipos, mapa de papéis, ordem de composição, contraste por construção.
- **02** — onde o motor expande `colorPalette` e por que não toca a emissão de variáveis.

---

# 9. Resumo da execução

Implementação pronta para revisão. O token estético `colorPalette` é opcional nos temas (`optionalForTheme`): é uma entrada do
cálculo, sem obrigar os 19 temas legados a declarar uma paleta; a plan-134 poderá declarar paletas nos temas.

| Item | Teste (nome → arquivo) |
|---|---|
| Token estético opcional sem exigir declaração nos temas legados | `deixa tema omitir um token estético opcional e aceita sua declaração quando presente` → `gates/scripts/contrato/__tests__/check-theme-completeness.test.ts` |
| Conversão OKLCH/sRGB e recorte de gama | `round-trips common sRGB colors through OKLCH`, `reduces chroma to fit sRGB while preserving lightness and hue` → `src/core/Design/palette/__tests__/color-space.test.ts` |
| Sementes e escalas | `uses complementary, split-complementary, triadic, and monochromatic harmonies`, `keeps status hues fixed and gives neutrals near-zero chroma`, `builds all eleven shared tones for every palette seed` → `seeds.test.ts`, `scale.test.ts` |
| Papéis e resolução determinística | `covers every color token in the live schema exactly once`, `is deterministic and returns every token covered by the role map` → `role-map.test.ts`, `resolve.test.ts` |
| Contraste, extremos e correção efetiva | `passes every contrast pair for extreme colors, harmonies, and modes`, `corrects a failing mapped pair instead of only passing by its initial tones` → `src/core/Design/palette/__tests__/resolve.test.ts` |
| Parser e registro inicial de preset | `parses custom palettes with optional secondary and accent seeds`, `keeps the initial test registry small and resolvable` → `parser.test.ts`, `presets.test.ts` |
| Precedência e paridade rc.3 sem paleta | `expande a paleta antes do host e do tema, preservando cores explícitas`, `mantém chave por chave a composição rc.3 dos 19 temas sem colorPalette` → `src/core/Design/presets/themes/__tests__/compose.test.ts` |
| Troca de modo e preservação de ajuste manual | `aplica a escala do modo pedido e mantém ajustes manuais`, `mantém sobre a paleta a cor explicitamente declarada pelo tema` → `src/core/Provider/utils/__tests__/overlayPreferences.test.ts` |
| Recusa de entrada inválida | `descarta uma entrada inválida com aviso e deixa o tema sem paleta` → `src/core/Provider/utils/__tests__/validation.test.ts` |
| Fonte única dos pares e contraste dos temas | `mede os 89 pares de texto e fundo cobertos`, `todos os temas de referência passam AA nos dois modos com contraparte autorada` → `gates/scripts/audit/__tests__/verify_contrast.test.ts` |
| Catálogo em seis idiomas | `toda chave tem os seis idiomas oferecidos, cada um não-vazio` → `src/core/i18n/__tests__/catalog.test.ts` |

**Execução:** a suíte focada inicial passou com 167 testes; após os ajustes de integração, passaram 88 testes; a regra de token opcional passou em 80 testes focados; e, após a refatoração final dos gates, passaram 130 testes focados. `theme-completeness:check` passou para 19/19 temas. `npx tsc --noEmit` passou na checagem final. A paridade do schema/catálogo validou 435 tokens nas três fontes. O `auditor_contraste` de `HEAD` e o atual produziram saída igual após normalização de quebras de linha: 89 pares; 0 falhas e 0 pares pulados no modo nativo e no oposto; 19/19 temas com contraparte autorada.

`npm run verify -- --tier=quick` foi executado uma vez, conforme §9. Terminou com 8 verificações falhas: o typecheck apontou erros deste plano que foram corrigidos e um erro em `CalendarPanel.tsx`, fora do escopo, mas `npx tsc --noEmit` passou na checagem final; o baseline estrutural acusa alterações paralelas; a completude dos temas falhou antes da regra `optionalForTheme` e passou nas verificações focadas posteriores; `class-merge:check` e `plan-index:check` apontam arquivos de outras plans; `catalog:check`, `guide:check` e `dev-kit:check` falham por desenho nesta etapa, conforme o contrato. Não foi executada a suíte completa, build ou navegador.

Limitação de integração a acompanhar na `plan-131`: uma entrada customizada válida contém `;`, caractere que o emissor genérico de CSS ainda reporta como valor inseguro; este plano não altera `useDesignVariables.ts` nem `designVariableHelpers.ts` (§3.2).

---

# 10. Veredito

## Veredito — 2026-10-28 — 🔴 Reprovado (1 achado)

**Medido por mim**, pelo protocolo do contrato §9: `src/core/Design/palette`, `compose`, `src/core/Design/schema`,
`overlayPreferences`, `validation`, `verify_contrast` e `check-theme-completeness`, uma vez — **254/254 verdes**. O `audit:baseline` da
rodada não aponta nenhum arquivo desta plan. A extração de `PAIRS` cumpriu as duas condições da ampliação de escopo: dado puro em
`palette/contrast-pairs.ts`, e o `auditor_contraste` idêntico ao do `HEAD` (89 pares, 0 falhas, 0 pulados nos dois modos, 19/19 com
contraparte). O diff confere com o §2: sementes por tipo, escalas, um mapa de papéis que cobre cada token de cor do schema uma vez,
correção de contraste provada por um caso que reprovaria sem ela, cor explícita vencendo a paleta, e os 19 temas sem `colorPalette`
compondo chave a chave como na rc.3.

**Aceito como temporário:** `optionalForTheme` em `colorPalette` (`schema/colors.ts:66`) e no gate de completude. Sem ele, o gate
barraria o commit até a `plan-134` declarar a paleta nos temas. A `plan-134` remove a marca e o mecanismo, se ficar sem uso; o tema
embarcado volta a declarar todo token estético ([[09-temas-e-presets]] §5.3).

**Achado 1 — o formato `custom:` usa `;`, que a barreira de CSS recusa (o formato veio do contrato, escrito pelo revisor).** Medido no
código: `useDesignVariables.ts:23` e `DesignInjector.tsx:22` descartam todo valor com `[<>{};]` antes de emitir CSS. A expansão
funciona, porque acontece na composição, mas toda paleta com `sec=`/`acc=` passa pela barreira de segurança como valor suspeito, e
qualquer leitor futuro do valor emitido o perderia. A exceção que a barreira já tem (mídia `;base64,`) não deve ganhar irmã por causa
de um formato que pode simplesmente não usar `;`. **Correção (contrato §1.9 e §2 desta plan já corrigidos):** o separador passa a `,`
— `custom:<tipo>:<#base>[,sec=<#hex>][,acc=<#hex>]`. Testes: o parser aceita o formato novo e recusa o antigo com `;`; um valor com
`sec` e `acc` passa por `isCssSafeValue`.

**Status: 🔵 Em correção.**

## Resumo da execução (correção 1) — 2026-10-28

**Resultado:** Concluído com pendências

**Estado do worktree ao iniciar**
`git status --short` retornou `fatal: this operation must be run in a work tree`. `git rev-parse --is-inside-work-tree` retornou `true`, mas não foi possível obter a fotografia nem conferir o diff com Git.

**O que foi feito**
- `parser.ts` e testes de parser/validação — o formato customizado passou de `;` para `,`; a sintaxe antiga é recusada.
- `validation-css-safety.test.tsx` — cobre a emissão sem descarte de uma paleta com `sec` e `acc` pela barreira CSS.
- `schema/colors.ts` e `docs/migracoes.md` — descrições atualizadas para o formato de vírgulas.
- Esta plan — status encaminhado para revisão e este resumo acrescentado, preservando o veredito e o resumo anteriores.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Design/palette/parser.ts` | alterado | Parser aceita vírgulas entre as sementes opcionais. |
| `src/core/Design/palette/__tests__/parser.test.ts` | alterado | Aceita vírgulas e cobre a recusa do separador legado. |
| `src/core/Design/palette/__tests__/validation-css-safety.test.tsx` | criado | Prova a emissão CSS da paleta completa sem aviso de descarte. |
| `src/core/Provider/utils/__tests__/validation.test.ts` | alterado | Validação aceita a forma nova e recusa a forma antiga com hex válidos. |
| `src/core/Design/schema/colors.ts` | alterado | Descrição do token anuncia o formato novo. |
| `docs/migracoes.md` | alterado | Exemplo de migração anuncia o formato novo. |
| `specs/plan/plan-133-motor-de-paletas.md` | alterado | Status e resumo desta correção. |

**Verificações executadas**
- `npx vitest run src/core/Design/palette validation` → 11 arquivos e 103 testes passaram. A primeira tentativa foi bloqueada por `EPERM` ao criar o arquivo temporário do Vite; a repetição autorizada concluiu com sucesso.
- `node gates/scripts/release/check-audit-baseline.mjs` → igual ao baseline de 2026-10-12; nenhuma regressão e nenhum arquivo desta plan reportado.
- `git status --short` e `git diff --stat` → não disponíveis: Git retornou `fatal: this operation must be run in a work tree`.

**Critérios de aceite**
- [x] Parser aceita a forma com vírgulas e recusa a forma com ponto e vírgula — `parser.test.ts`.
- [x] Valor com `sec` e `acc` passa pela barreira CSS — `validation-css-safety.test.tsx` preserva a variável emitida sem `warn`.
- [x] Validação e documentação usam a forma nova — `validation.test.ts`, `schema/colors.ts` e `docs/migracoes.md`.
- [x] Vitest direcionado e baseline passam — saídas acima.
- [ ] Fotografia e diff do worktree — Git recusou as operações de status/diff; devem ser conferidos pelo revisor.

**Decisões e suposições**
- Mantive inalteradas as barreiras CSS genéricas; a vírgula no formato permite que a forma customizada seja emitida sem exceção de segurança.
- Mantive referências históricas ao formato anterior no veredito e no resumo original, conforme a regra append-only.

**Achados fora do escopo (não corrigidos)**
- Nenhum identificado nesta correção.

**Pendências / riscos**
- A limitação de Git impediu obter a fotografia inicial e confirmar o escopo do diff no worktree compartilhado.

## Complemento da execução (correção 1) — 2026-10-28

O validador AST TypeScript da skill `padrao-typescript` retornou zero findings em `parser.ts`, `parser.test.ts` e `validation-css-safety.test.tsx`. Em `validation.test.ts` e `schema/colors.ts`, retornou exit 0 e apontamentos em linhas não alteradas por esta correção (blocos de teste extensos e dados numéricos/URLs de teste); nenhuma infração foi apontada nas linhas modificadas. Esses achados ficaram fora do escopo do veredito.

## Veredito — 2026-10-28 — correção 1 — 🟢 Aprovada

**Achado 1 fechado.** `palette/parser.ts:8` aceita `custom:<tipo>:<#base>[,sec=…][,acc=…]` e recusa o `;`;
`validation-css-safety.test.tsx` prova que uma paleta com `sec` e `acc` atravessa a barreira de CSS sem descarte nem aviso; descrição
do token e nota de migração no formato novo. **Medido por mim:** `src/core/Design/palette` + `validation`, uma vez — **103/103
verdes**; `check-audit-baseline.mjs` no worktree inteiro — **igual ao baseline**. A marca temporária `optionalForTheme` sai na
`plan-134` (passo 3 dela).

**Status: 🟢 Aprovada.** Síntese (ADR + [[09-temas-e-presets]] + [[02-design-engine]]) depois da `plan-134`, que fecha o desenho.
