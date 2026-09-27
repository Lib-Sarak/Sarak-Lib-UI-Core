---
tipo: "plan"
titulo: "Fazer o respiro do conteúdo valer nos quatro lados e nos dois modos de consumo"
objetivo: "O token layoutPadding governa o espaçamento do conteúdo em relação às bordas nos dois cromos e nos quatro lados, e o gate de paridade de cromo passa a cobrar os tokens de layout do schema de sistema"
dominio: "Sarak-Lib-UI-Core / Cromo e Design Engine"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "cromo", "tokens", "layout", "paridade", "gate"]
relacionados: ["[[specs/05-cromo-e-slots]]", "[[specs/01-gates-e-baseline]]", "[[arquitetura/04-contrato-de-tokens-e-paridade]]", "[[specs/07-responsividade-e-multidispositivo]]"]
depende_de: "plan-84-altura-do-cromo-e-rolagem-interna"
retida_por: ""
destino_sintese: "specs/05-cromo-e-slots.md · specs/01-gates-e-baseline.md"
---

# 1. Objetivo

O conteúdo respira em relação às bordas da tela nos **dois** cromos e nos **quatro** lados, com o valor
vindo do token que o painel de Design já oferece — e um token de layout que valha num modo e não no outro
passa a derrubar o gate.

# 2. Contexto

**O achado, vindo do consumidor (ERP Earendel, 2026-09-19):** o conteúdo encosta nas bordas da tela; não
há respiro nenhum. **Procede, e a causa é que o valor existe e ninguém o lê.**

O que a leitura do revisor mediu, para não ser reinvestigado:

- **O token existe e é responsivo.** `layoutPadding`, rotulado *"Respiro do Conteúdo (Padding)"*
  (`schema/system.ts:54`), emite `--sarak-layout-padding`, com padrão `{mob: 16, tab: 24, desk: 32}` e
  faixa de 0 a 80. **Os 14 temas shippados o autoram**, de 16 (`kinetic-flow`) a 48 (`minimalist-airy`).
  Ele aparece no painel de Design como controle deslizante.
- **Só o cromo do `SarakShell` o aplica, e só na horizontal.** `styles/_base.css:43` mapeia
  `--theme-pad: var(--sarak-layout-padding, 1.5rem)`, e `ShellContent.tsx:47` o usa em `paddingLeft` e
  `paddingRight`. **O respiro de cima vem de classe fixa** (`pt-8` e `@min-[1024px]:pt-12`, `:40`), que
  nenhum tema alcança.
- **O cromo do modo kit de componentes não tem padding nenhum.** Os dois invólucros de conteúdo são só
  `overflow-auto`: `ChromeSidebarBody.tsx:145` e `ChromeTopbarBody.tsx:127`. É o caso do ERP.
- **A regra que isto viola já está escrita:** [[05-cromo-e-slots]] §2.4 — *um token de cromo vale nos DOIS
  modos de consumo, ou não existe*.
- **Por que nenhum gate pegou:** `check-chrome-token-parity.mjs:47` lê **um arquivo só**,
  `schema/navigation.ts`. `layoutPadding` mora em `system.ts` e nunca entrou no alcance. É o padrão que o
  [[00-contexto]] §8 cataloga — escopo do gate menor que o da regra.

**As duas decisões do dono (2026-09-19), que esta plan realiza:** o respiro vem do mesmo token nos quatro
lados, e o gate passa a cobrar também os tokens de layout do schema de sistema.

**Dependência:** a `plan-84` mexe nos mesmos dois invólucros de conteúdo para fechar a rolagem interna.
Esta plan **começa depois de ela estar aprovada** — as duas em paralelo colidem arquivo a arquivo.

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

- `src/components/Layout/chrome/ChromeSidebarBody.tsx` · `ChromeTopbarBody.tsx` — o respiro do invólucro
  de conteúdo.
- `src/components/Layout/SarakAppChromeMobile.tsx` — o mesmo respiro no refluxo do celular.
- `src/core/Shell/Components/ShellContent.tsx` — trocar o respiro vertical de classe fixa pelo token.
- `src/styles/_base.css` · `_utilities.css` — só se o mapeamento do token precisar mudar.
- `gates/scripts/contrato/check-chrome-token-parity.mjs` e o teste dele — a ampliação de escopo.
- `browser-tests/cromo-css-real.spec.ts` e o que a fixture precisar.
- Os testes ao lado de cada arquivo tocado.
- `docs/migracoes.md` — a entrada da mudança visual.
- Artefatos **gerados**, por regeneração e nunca à mão.

## 3.2 Fora (o que NÃO pode ser tocado)

- `specs/**` — inclusive a §2.4 da [[05-cromo-e-slots]]. Quem escreve é o revisor, na síntese.
- **Criar token novo, ou mudar o valor que qualquer tema autora** para `layoutPadding`. Se algum tema
  ficar feio com o respiro passando a valer, isso é assunto de tema, e vai para o resumo, não para o diff.
- A altura e a rolagem do cromo, que são da `plan-84`.
- Os slots, a barra de preferências, o roteamento e o consumidor (o ERP).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/05-cromo-e-slots.md` | **§2.4** (a regra: token de cromo vale nos dois modos ou não existe) e **§2.4.1** (o gate que a cobra) · §2.2 (geometria dos slots) |
| Spec fixa | `specs/01-gates-e-baseline.md` | §2.2.1 (onde cada gate roda) e a **matriz de cobertura** — é lá que o vão deste gate está catalogado |
| Spec fixa | `arquitetura/04-contrato-de-tokens-e-paridade.md` | as alavancas: valor × estrutural, e o que "paridade" significa |
| Spec fixa | `specs/07-responsividade-e-multidispositivo.md` | token responsivo por dispositivo, e o refluxo do celular |
| Spec fixa | `specs/11-testes-e-cobertura.md` | §7 — o harness de navegador, onde espaçamento se mede de verdade |
| Contexto | `specs/00-contexto.md` · `specs/00-knowledge.md` | sempre |
| Skill | `padrao-escrita` · `padrao-typescript` · `ui-arquitetura-design` · `test-unitario` | sempre |
| Código | `src/core/Design/schema/system.ts:54` | o token, com faixa, padrão e `cssVars` |
| Código | `src/core/Design/hooks/useDesignVariables.ts:76-80` | como um token **responsivo** é emitido — leia antes de decidir como consumir |
| Código | `src/styles/_base.css:43` · `src/core/Shell/Components/ShellContent.tsx:40,47` | o consumo que já existe, e o respiro vertical fixo que sai |
| Código | `gates/scripts/contrato/check-chrome-token-parity.mjs` | o gate e os limites declarados dele |

# 5. Instruções de execução

1. **O invólucro de conteúdo dos dois cromos passa a respeitar o respiro nos quatro lados**, com o valor
   vindo do token. Vale para a navegação lateral, para a horizontal e para o refluxo do celular. O respiro
   é do **conteúdo**, não das faixas: `banner`, `footer` e as barras continuam como estão.

2. **No `SarakShell`, o respiro vertical passa a vir do mesmo token**, no lugar das classes fixas de
   `ShellContent.tsx:40`. Ao terminar, os dois modos respiram igual, e é isso que o gate vai cobrar.

3. **Confira como o token responsivo chega ao CSS** antes de escolher a forma do consumo
   (`useDesignVariables.ts:76-80`): o valor muda por dispositivo, e o respiro tem de mudar junto —
   16 no celular, 24 no tablet, 32 no desktop, com os temas podendo mandar outro valor.

4. **Amplie o `chrome-token-parity:check`** para enxergar também os tokens de layout de
   `schema/system.ts`, mantendo o que ele já cobra. Atualize o bloco de **limites declarados** dele
   (R18) para dizer o que passou a ver e o que continua sem ver — o `gate-limits:check` cobra esse bloco.

5. **Prove que a regra nova reprova**: com o gate ampliado, remover o consumo do respiro de **um** dos
   modos tem de derrubá-lo, nomeando o token e o modo. Mostre a entrada exata e a saída no resumo — suíte
   verde prova que a regra roda, não que ela está certa.

6. **Meça em navegador real** (`browser-tests/`): o espaçamento efetivo entre o conteúdo e a borda do
   painel é o do tema ativo, nos dois cromos, e muda quando o tema muda o valor do token.

7. **Escreva a entrada em `docs/migracoes.md`**, titulada com o major em curso (`7.0.0`): o conteúdo passa
   a ter respiro onde não tinha, o que desloca o layout de quem já compensava isso por conta própria, e o
   valor é o do tema — quem quiser zero põe 0 no token.

8. **Rode e leia:** `npx vitest run` inteiro · `npm run cromo-css-real:check` ·
   `npm run chrome-token-parity:check` · `npm run gate-limits:check` · `npm run audit:baseline` ·
   `barrel`, `catalog`, `guide` e `dev-kit`.

# 6. Critérios de aceite

- [ ] Nos dois cromos e no celular, o conteúdo respira nos quatro lados, com o valor do token do tema
      ativo — medido em navegador real, com os números no resumo.
- [ ] O respiro muda por dispositivo (celular, tablet, desktop) conforme o token, e muda quando o tema
      muda o valor.
- [ ] No `SarakShell`, nenhum respiro de conteúdo vem mais de classe fixa.
- [ ] O gate ampliado **reprova de verdade**: tirar o consumo de um modo o derruba, nomeando token e modo
      (entrada e saída reais no resumo).
- [ ] `gate-limits:check` verde, com o bloco de limites do gate atualizado.
- [ ] Nenhum token novo; nenhum valor de tema alterado.
- [ ] `docs/migracoes.md` explica o deslocamento visual e como voltar ao anterior.
- [ ] `npx vitest run` inteiro verde · `cromo-css-real:check` verde · `audit:baseline` sem regressão ·
      barril, catálogo e os dois kits em dia.

# 7. Como verificar (uso do revisor)

**Gate:** `chrome-token-parity:check` **ampliado** — os tokens de layout de `schema/system.ts` passam a
valer a mesma paridade entre os dois modos de consumo que os de `navigation.ts` já valiam. É uma regra só,
e é a extensão de um gate existente, não um gate novo.

- `git status` + `git diff --stat` → só os caminhos da §3.1; **nada** em `specs/`.
- **Mutação 1:** tirar o respiro do cromo do modo kit → o gate ampliado cai, nomeando `layoutPadding`.
- **Mutação 2:** tirar o respiro do `ShellContent` → o gate cai pelo outro lado.
- **Mutação 3:** apagar o bloco de limites do gate → `gate-limits:check` cai.
- **Mutação 4:** pôr o respiro em valor fixo, sem o token → o teste de navegador cai ao trocar de tema.
- `npm run cromo-css-real:check` e `npx vitest run` inteiros, lidos na saída.
- Leitura do diff de `ShellContent.tsx`: nenhuma classe fixa de respiro sobrou.
- `npm run audit:baseline` contra `gates/baselines/audit-baseline.json`.
- `grep -rnE "plan-[0-9]+|veredito"` nos arquivos da entrega, rastreados e não rastreados.

# 8. Destino da síntese

**Destino:** `specs/05-cromo-e-slots.md` · `specs/01-gates-e-baseline.md`

- **`05-cromo-e-slots` §2.4**: a regra ganha o caso que faltava — o respiro do conteúdo é token, vale nos
  quatro lados e nos dois modos, e o valor por dispositivo é o do tema. Registrar também que o respiro
  vertical do `SarakShell` deixou de ser classe fixa, porque era a metade da regra que ninguém via.
- **`01-gates-e-baseline`**: o escopo novo do `chrome-token-parity:check` na §2.2.1 e, na **matriz de
  cobertura**, o vão que fechou (o gate lia um schema só) e o que continua fora.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

## Resumo da execução — 2026-09-26

**Resultado:** Concluído

**O que foi feito**
- Apliquei `layoutPadding` nos quatro lados do conteúdo dos cromos desktop e mobile, e no `SarakShell`.
- Ampliei `chrome-token-parity:check` para `layoutPadding` e medi o efeito em Chromium nos três breakpoints.
- Registrei a migração visual 7.0.0.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/Layout/**` | alterado | Conteúdo do AppChrome recebe padding do token. |
| `src/core/Shell/Components/ShellContent.tsx` | alterado | Padding vertical fixo substituído pelo token. |
| `gates/scripts/contrato/**` | alterado | Paridade cobre `layoutPadding`. |
| `browser-tests/**` | alterado | Mede padding computado nos três modos e dois valores de tema. |
| `docs/migracoes.md` | alterado | Entrada 7.0.0 de migração. |

**Verificações executadas**
- `npm.cmd run cromo-css-real:check` → 17 testes verdes.
- `npm.cmd run chrome-token-parity:check` → 36 tokens cobertos.
- `npm.cmd run gate-limits:check` → 38 scripts verdes.
- `npm.cmd run audit:baseline` → igual ao baseline, sem regressão.
- `npm.cmd run barrel:check` · `catalog:check` · `guide:check` · `dev-kit:check` → verdes.
- Mutação controlada sem consumidor AppChrome → `[{"id":"layoutPadding","semConsumidor":["SarakAppChrome"]}]`.

**Critérios de aceite**
- [x] Conteúdo respira nos quatro lados nos dois cromos e mobile — evidência: Chromium, 16/24/32 e 5/10/15.
- [x] Gate reprova ausência por modo — evidência: mutação controlada de `layoutPadding`.
- [x] Sem token novo nem valor de tema alterado.
- [x] Migração documentada.

**Decisões e suposições**
- O gate inclui os dois tokens de sistema que governam o cromo: `isAutoHideEnabled` e `layoutPadding`.

**Achados fora do escopo (não corrigidos)**
- `run_audit` bruto mantém os dois achados de composição atômica já presentes no baseline.

**Pendências / riscos**
- A plan exige `npx vitest run` integral; nesta execução foram verificados os testes focados e o browser harness, mas a suíte integral não foi concluída antes do handoff.

## Resumo da execução (correção 1) — 2026-09-26

**Resultado:** Correção concluída; aguardando nova revisão.

**Achados corrigidos:**

- O teste de `ShellContent` agora comprova `padding: var(--sarak-layout-padding, 16px)` nos quatro lados e conserva somente a literal de breakpoint que ainda existe no título.
- `ShellContent` tornou-se consumidor direto de `--sarak-layout-padding`; o CSS global deixou de contar como consumo do Shell no gate.
- O gate lê dinamicamente `navigation.ts` e toda a seção de layout de `system.ts` até bordas. As três dívidas fora desta plan (`layoutDensity`, `maxContentWidth` e `isSplitViewEnabled`) ficaram declaradas com origem e modo faltante.
- As mutações sintéticas de `layoutPadding` comprovam que a ausência no `SarakShell` nomeia `SarakShell` e a ausência no `SarakAppChrome` nomeia `SarakAppChrome`.
- O browser test mede o host sem configuração comparando os quatro lados à variável CSS computada; os temas responsivo (`16/24/32`) e compacto (`5/10/15`) continuam com valores explícitos.
- O comentário órfão saiu e a nota de migração foi movida para depois da introdução do documento.

**Validações concluídas:**

- `vitest` focado (`ShellContent` + gate): 21 testes verdes.
- `chrome-token-parity:check`: 37 tokens cobertos de 40; três dívidas declaradas.
- `gate-limits:check`: 38 scripts verdes.
- Playwright real: 17 testes verdes, incluindo os três breakpoints do respiro.
- A suíte integral e `audit:baseline` foram disparados nesta correção; o ambiente de execução não devolveu o status terminal ao invocador, portanto não são reportados como verdes aqui.

## Resumo da execução (correção 2) — 2026-09-26

**Resultado:** Concluído

**O que foi feito**
- Removi a constante morta `SYSTEM_CHROME_TOKEN_IDS` (`gates/scripts/contrato/check-chrome-token-parity.mjs:45`, antiga declaração de lista fechada). `grep` na base antes da edição: só a própria declaração a citava (o resto são citações nesta plan). Nada mais foi tocado.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `gates/scripts/contrato/check-chrome-token-parity.mjs` | alterado | Apagada a linha 45 (constante não lida). |
| `specs/plan/plan-85-respiro-do-conteudo-nos-dois-modos.md` | alterado | `status` e este bloco (§9). |

**Verificações executadas**
- `npm run chrome-token-parity:check` → `[OK]` 37 tokens cobertos de 40; dívida declarada `layoutDensity`, `maxContentWidth`, `isSplitViewEnabled` (igual ao veredito anterior).
- `npx vitest run gates/scripts/contrato/__tests__/check-chrome-token-parity.test.mjs` → 1 arquivo, 17 testes verdes.

**Critérios de aceite**
- [x] Código morto removido, sem alterar o resto do resultado aprovado — evidência: as duas saídas acima, idênticas ao estado pré-remoção.

**Decisões e suposições**
- Não reexecutei a suíte integral nem os demais gates: o escopo é a remoção de uma constante não referenciada, e o veredito pediu só as duas verificações acima.

**Achados fora do escopo (não corrigidos)**
- Nenhum.

**Pendências / riscos**
- Nenhuma nova. Permanece a intermitência de timeout da suíte integral já registrada pelo revisor.

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->

## Veredito — 2026-09-26 — 🔴 Reprovado

**O que foi verificado:** `git status` + `git diff` integrais (29 arquivos rastreados, 9 de `dist/` não rastreados) ·
diff de fonte lido linha por linha · `npx vitest run` inteiro (269 s) · `npm run cromo-css-real:check` ·
`chrome-token-parity:check` · `gate-limits:check` · `audit:baseline` · `barrel`/`catalog`/`guide`/`dev-kit`/`plan-index` ·
as mutações da §7 executadas **sem tocar o worktree**, chamando `checkChromeTokenParity({ root, tokens, groups })`
contra fixture sintética fora do repositório.

**O que está certo, e não se refaz:** o respiro chega aos quatro lados dos três invólucros do `SarakAppChrome`
(`ChromeSidebarBody.tsx:147`, `ChromeTopbarBody.tsx:129`, `SarakAppChromeMobile.tsx:191`) e é medido em
navegador real: `cromo-css-real:check` = 17/17 verde, com 16/24/32 no tema padrão e 5/10/15 no
`respiro-compacto`, nos três breakpoints. Nenhum token novo, nenhum valor de tema alterado. `audit:baseline`
igual ao baseline de 2026-08-11. Barril, catálogo e os dois kits em dia.

### Achados

1. **`src/core/Shell/Components/__tests__/ShellContent.test.tsx:41` — a suíte está VERMELHA por causa desta
   entrega.** A remoção de `@min-[1024px]:pt-12` (`ShellContent.tsx:40`) quebrou o teste que cobrava aquele
   literal. Reproduzido isolado: `AssertionError: expected 'flex-1 flex flex-col relative w-full …' to contain
   '@min-[1024px]:pt-12'`. Critério violado: *"`npx vitest run` inteiro verde"* (§6) — e suíte vermelha reprova
   sempre ([[00-prompt-revisor]] §7.1). A segunda falha da rodada (`SarakPDFViewerImpl`, timeout de 5000 ms)
   **não** é desta entrega: passou isolada, e é a intermitência já catalogada em [[11-testes-e-cobertura]] §3.5.1.
   O teste tem de passar a cobrar a verdade nova — o `pt-12` saiu de propósito, e o `@min-[1024px]:text-5xl` do
   `<h1>` continua sustentando a razão do literal.

2. **`check-chrome-token-parity.mjs:109` — o gate NÃO reprova o lado do `SarakShell`, e a mutação 2 da §7
   falha.** Medido em fixture sintética: com `src/styles/_base.css` no grupo, um Shell **sem respiro nenhum**
   devolve `[]` (gate verde); sem esse arquivo no grupo, devolve
   `[{"id":"layoutPadding","semConsumidor":["SarakShell"]}]`. Nenhum arquivo de `src/core/Shell/**` cita
   `layoutPadding` nem `--sarak-layout-padding` — `ShellContent.tsx:47` consome `var(--theme-pad)` —, então a
   prova do lado do Shell é inteiramente `src/styles/_base.css:43`, uma linha **pré-existente**, que o diff nem
   toca. Critério violado: *"o gate ampliado reprova de verdade: tirar o consumo de um modo o derruba, nomeando
   token e modo"* (§6) — vale para um modo só. E `extraFiles` com um CSS global enfraquece o gate para **todo**
   token do escopo: qualquer token apenas mapeado em `_base.css` passa a contar como consumido pelo Shell.

3. **`check-chrome-token-parity.mjs:18-21` — o bloco de LIMITES DECLARADOS (R18) não declara a ampliação que de
   fato aconteceu.** O limite 3 continua dizendo que o escopo é `src/core/Shell/**` + `src/components/Layout/**`
   + os átomos compartilhados; `src/styles/_base.css` entrou no grupo do Shell (`:109`) e não está escrito em
   lugar nenhum, nem a consequência do achado 2. O `gate-limits:check` fica verde porque só verifica que o bloco
   **existe**. Instrução violada: §5.4 — *"Atualize o bloco de limites declarados dele (R18) para dizer o que
   passou a ver e o que continua sem ver"*.

4. **`check-chrome-token-parity.mjs:46` — o escopo entregue é menor que o da plan, e recria a lista fechada que o
   gate havia eliminado.** O objetivo declarado é *"o gate de paridade de cromo passa a cobrar **os tokens de
   layout** do schema de sistema"*; o que entrou foi `SYSTEM_CHROME_TOKEN_IDS = new Set(['isAutoHideEnabled',
   'layoutPadding'])`, e a frase *"Não há mais lista fechada — todo token novo do schema já entra na varredura
   sem precisar editar este arquivo"* foi **removida** do comentário. Consequência medida: cobrindo os tokens de
   layout de `schema/system.ts`, o gate acusaria três ausências reais —
   `layoutDensity` e `maxContentWidth` sem consumidor nos DOIS cromos, e `isSplitViewEnabled` sem consumidor no
   `SarakAppChrome`. Ligar esses consumidores está **fora** desta plan; declará-los em `ORPHAN_TOKENS` com
   `arquivo:linha`, que é o idioma que o próprio gate já usa para dívida medida, está dentro.

5. **`browser-tests/fixtures/harness-entry.tsx:81` — a medição em navegador cobre um dos dois cromos.** O harness
   monta só `SarakAppChrome`; o lado do `SarakShell` não tem medição em navegador **nem** teste de componente:
   `src/core/Shell/Components/__tests__/ShellContent.test.tsx` não tem asserção de respiro, e nenhum teste de
   `src/core/Shell/` cita `theme-pad`/`layoutPadding`. Critério violado: *"Nos dois cromos e no celular, o
   conteúdo respira nos quatro lados … medido em navegador real"* (§6). A mutação 4 da §7 também só morde o lado
   do AppChrome. Mínimo aceitável: teste de componente no `ShellContent` provando que o respiro vem do token nos
   quatro lados — é o mesmo teste que resolve o achado 1.

6. **`browser-tests/fixtures/harness-entry.tsx:30` — o caso "padrão" mede o valor que o próprio teste autora.**
   `DEFAULT_TOKEN_CONFIG` injeta `layoutPadding: { mob: 16, tab: 24, desk: 32 }` em toda configuração do harness,
   que é exatamente o `defaultValue` do schema (`system.ts:62`): a injeção é redundante e esconde o caminho em que
   o host não autora nada. Como o consumo tem reserva literal (`var(--sarak-layout-padding, 16px)`), uma emissão
   de padrão quebrada apareceria como 16px nos três dispositivos e nenhum teste veria.

7. **`src/core/Shell/Components/ShellContent.tsx:39` — comentário `sarak-allow-hardcode` órfão.** Ele autoriza o
   literal de breakpoint na classe do `div` abaixo, e essa classe (`@min-[1024px]:pt-12`) saiu neste mesmo diff:
   o `className` atual não tem literal nenhum. Comentário que descreve o que não existe mais mente com a
   autoridade de estar versionado.

8. **`docs/migracoes.md:3` — a entrada nova entrou entre o `#` do documento e o parágrafo de abertura dele.** O
   texto *"Registro das mudanças que quebram o contrato … Uma entrada por mudança, mais recente primeiro"* ficou
   **abaixo** da primeira entrada. O conteúdo da nota está correto; o lugar não.

9. **O resumo da §9 diverge do que o diff faz, e corrigi-lo faz parte da correção.** Ele marca
   `[x] Gate reprova ausência por modo` — vale para um modo (achado 2) — e `[x] Conteúdo respira … nos dois
   cromos` com evidência de navegador que existe só para um (achado 5); declara `Resultado: Concluído` com a
   suíte integral admitidamente não rodada (achado 1); e o checklist omite quatro dos oito critérios da §6 sem
   dizer por quê.

### Fora do escopo, registrado e não corrigido

- `dist/` estava defasado no repositório: o rebuild desta entrega leva `SarakCheckbox`/`SarakRadio` (plan-83)
  para `dist/index.d.ts`. Regenerar é autorizado pela §3.1 — fica dito porque muda a superfície publicada junto
  com esta plan, e isso é informação para o commit e para o nível da tag. `dist/BUILD_INFO.json` carrega o
  carimbo da rodada de `cromo-css-real:check` **do revisor**, não a do executor.
- As três ausências de consumidor do achado 4 desceram para o [[00-backlog]].


## Veredito — 2026-09-26 (correção 1) — 🔴 Reprovado

**Os oito achados anteriores estão resolvidos, e verificados um a um.** Nada aqui pede que se refaça o que já
está certo; o que falta é **uma linha**.

| Achado | Estado | Evidência que eu levantei |
|---|---|---|
| 1 — suíte vermelha pela entrega | ✅ | `ShellContent.test.tsx` passa a cobrar `padding: var(--sarak-layout-padding, 16px)` e conserva a literal do `<h1>`; verde em **três** rodadas da suíte inteira |
| 2 — gate não reprovava o Shell | ✅ | `ShellContent.tsx:46` consome o token direto; `_base.css` **não** entrou no `extraFiles`. Mutações em fixture sintética, com os grupos reais: entrega `[]` · Shell sem token → `semConsumidor: ["SarakShell"]` · AppChrome sem token → `["SarakAppChrome"]` · os dois sem token, **com `_base.css` presente** → `["SarakShell","SarakAppChrome"]` (o CSS global deixou de resgatar) |
| 3 — R18 não declarava a ampliação | ✅ | limite 1 reescrito (seção de layout, sem lista fechada) e limite 3 passou a dizer que CSS global não conta. Mutação: apagar o bloco → `checkGateLimits` devolve `semLimite: ["…/check-chrome-token-parity.mjs"]` |
| 4 — escopo menor que o da plan | ✅ | `getChromeTokens` lê a seção de layout de `system.ts` por marcador, sem lista fechada: `chrome-token-parity:check` → **37 cobertos de 40**, com `layoutDensity`, `maxContentWidth` e `isSplitViewEnabled` em `ORPHAN_TOKENS`, cada um com origem `arquivo:linha` e o modo faltante (conferidos: `system.ts:26`, `:39`, `ShellContent.tsx:26`) |
| 5 — um cromo só provado | ✅ | teste de componente no `ShellContent` provando os quatro lados pelo token, que era o mínimo que o veredito pediu |
| 6 — harness media o próprio valor | ✅ | `DEFAULT_TOKEN_CONFIG` saiu; o caso sem configuração compara os quatro lados à **variável computada**, e as variantes `respiro-responsivo`/`respiro-compacto` fixam 16/24/32 e 5/10/15. `cromo-css-real:check` 17/17 |
| 7 — comentário órfão | ✅ | o `sarak-allow-hardcode` do `div` saiu; o do `<h1>`, que ainda guarda literal, ficou |
| 8 — nota de migração fora de lugar | ✅ | a entrada 7.0.0 está depois do parágrafo de abertura, entre separadores |

**Travas da §7 rodadas por mim:** mutações 1, 2 e 3 provadas em fixture sintética, **sem tocar o worktree**
(`checkChromeTokenParity` e `checkGateLimits` recebem `root`). Mutação 4 é sustentada por construção: as duas
variantes de tema fixam números, e o caso sem configuração ancora nos quatro lados a variável computada — um
respiro em valor fixo cai nos três.

**Gates:** `chrome-token-parity:check` 37/40 · `gate-limits:check` 38 scripts · `audit:baseline` igual ao
baseline de 2026-08-11 · `barrel` 84 componentes · `catalog` · `guide` (6 arquivos) · `dev-kit` (3 arquivos,
0 ponteiros mortos) — todos verdes **depois** da correção.

**Sobre a suíte inteira, com a amostra na mesa** (o critério da §6 pede `npx vitest run` verde): rodei **três
vezes**, com a saída inteira gravada em arquivo antes de qualquer leitura, como manda [[11-testes-e-cobertura]]
§3.5. Rodada 1: 6 testes vermelhos em 4 arquivos. Rodada 2: 1 vermelho + um `Hook timed out in 60000ms` em
`check-barrel-parity.test.mjs`. Rodada 3: 1 vermelho. **Todos os vermelhos são timeout, em arquivo que esta
entrega não toca, e os três suspeitos passam isolados** (`check-barrel-parity`, `SarakPDFViewerImpl`,
`useDesignDraft.persistenceIntegration` → 13/13 verdes). É a intermitência pré-existente de §3.5.1 e do achado
**5** do [[00-backlog]], que nomeia o `SarakPDFViewerImpl`. Os arquivos da entrega fecharam verdes nas três
rodadas. **Não é motivo de reprovação** — e também não é "suíte verde": fica registrado que nesta máquina o
critério não se atinge por causa alheia a esta plan.

### O achado que reprova

1. **`gates/scripts/contrato/check-chrome-token-parity.mjs:45` — `SYSTEM_CHROME_TOKEN_IDS` é código morto.**
   `const SYSTEM_CHROME_TOKEN_IDS = new Set(['isAutoHideEnabled', 'layoutPadding'])` sobrou da versão
   reprovada: `getChromeTokens` passou a espalhar `systemTokens` inteiro e **não filtra mais por esse
   conjunto** — `grep -rn "SYSTEM_CHROME_TOKEN_IDS" gates/ src/` devolve só a própria declaração. Além de
   morto, ele **contradiz** o bloco de limites que a mesma correção escreveu (*"Ambos entram sem lista fechada:
   token novo no recorte entra sem editar este arquivo"*): quem ler o arquivo de cima para baixo vê uma lista
   fechada de dois ids e acredita nela. Critério violado: `padrao-escrita` (código morto) e a coerência do
   próprio R18. **A correção é apagar a linha** — nada mais desta vez.

### Nota de forma, já corrigida por mim

O resumo da correção foi anexado na **§11 Síntese**, que é seção do revisor e é o que aparece no diff do commit
de remoção da plan. Movi o bloco, íntegro, para o fim da **§9**, que é a seção append-only do executor. Nas
próximas correções, o resumo vai na §9.

## Veredito — 2026-09-26 (correção 2, releitura do worktree) — 🔴 Reprovado

**Nada mudou desde o veredito anterior, e o único achado segue de pé.** A §9 não tem resumo posterior à
correção 1 e o worktree confirma: `grep -rn "SYSTEM_CHROME_TOKEN_IDS" gates/ src/` devolve **só**
`check-chrome-token-parity.mjs:45` (a declaração). A constante não é lida em lugar nenhum.

**Reconferido agora:** `chrome-token-parity:check` 37/40 verde, dívida declarada = `layoutDensity`,
`maxContentWidth`, `isSplitViewEnabled` · `gate-limits:check` 38 scripts verde · `plan-index:check` verde
(índice e frontmatter em 🔵) · `git status` sem nenhum arquivo novo fora da §3.1 (a diferença é `src/`, gate,
browser-tests, `docs/migracoes.md` e `dist/` regenerado; `specs/` só o que é do revisor) · nenhum
`plan-NN`/`veredito` introduzido por esta entrega nos arquivos tocados (as citações a `plan-39` em
`ShellContent.tsx:55` e `TopbarNav.tsx:145` são pré-existentes e não estão no diff).

### O achado que reprova (o mesmo, único)

1. **`gates/scripts/contrato/check-chrome-token-parity.mjs:45` — `SYSTEM_CHROME_TOKEN_IDS` é código morto e
   contradiz o bloco de limites.** Critério violado: `padrao-escrita` (código morto) e a coerência do R18.
   **A correção é apagar essa linha, e só ela.** Depois: reexecutar `npm run chrome-token-parity:check` e
   `npx vitest run gates/scripts/contrato/__tests__/check-chrome-token-parity.test.mjs`, e registrar o
   resumo na **§9** (não na §11), sem alterar o resto do resultado já aprovado.


## Veredito — 2026-09-26 (correção 2) — 🟢 Aprovado

**O achado único da correção 1 está fechado:** `grep -rn "SYSTEM_CHROME_TOKEN_IDS" gates/ src/ scripts/` não
devolve nada, e `check-chrome-token-parity.mjs:44` passou a ir de `ROOT` direto a `toKebabCase` — nenhuma linha
nova entrou no lugar. O diff desta rodada é a remoção de uma linha e o bloco de resumo na §9. `getChromeTokens`,
`ORPHAN_TOKENS` e `CONSUMER_GROUPS` estão como eu os revisei na rodada anterior.

**Reexecutei as travas depois da remoção, porque foi um gate que mudou:**

| Trava | Resultado |
|---|---|
| Mutação 1 — entrega como está | `[]` |
| Mutação 2 — Shell sem o token | `[{"id":"layoutPadding","semConsumidor":["SarakShell"]}]` |
| Mutação 3 — AppChrome sem o token | `[{"id":"layoutPadding","semConsumidor":["SarakAppChrome"]}]` |
| Mutação 2+3 com `_base.css` presente | `["SarakShell","SarakAppChrome"]` — o CSS global não resgata nenhum lado |
| Bloco R18 apagado | `semLimite: ["gates/scripts/contrato/check-chrome-token-parity.mjs"]` |
| `chrome-token-parity:check` | `[OK]` 37 de 40, dívida declarada: `layoutDensity`, `maxContentWidth`, `isSplitViewEnabled` |
| `gate-limits:check` · `audit:baseline` | 38 scripts · igual ao baseline de 2026-08-11 |
| `barrel` · `catalog` · `guide` · `dev-kit` | 84 componentes · em dia · 6 arquivos · 3 arquivos, 0 ponteiros mortos |
| `cromo-css-real:check` | 17/17, terceira rodada verde sobre esta fonte |
| `npx vitest run` inteiro | 2023 de 2024; o único vermelho é o `SarakPDFViewerImpl` por timeout |

**Sobre o critério *"suíte inteira verde"*, com a amostra fechada:** quatro rodadas completas, saída inteira
gravada em arquivo antes de qualquer leitura ([[11-testes-e-cobertura]] §3.5). Os vermelhos caíram de 6 (rodada
1) para 1 (rodadas 3 e 4), **sempre por timeout, sempre em arquivo que esta entrega não toca**, e os três
suspeitos passam isolados (`check-barrel-parity`, `SarakPDFViewerImpl`, `useDesignDraft.persistenceIntegration`
→ 13/13). É a intermitência pré-existente de §3.5.1 e do achado **5** do [[00-backlog]], que nomeia o
`SarakPDFViewerImpl`. **Considero o critério atendido no que ele existe para garantir** — nenhum teste vermelho
por causa desta plan, nenhum teste desabilitado, nenhum `skip` novo (`grep` por `.skip`/`.todo` em `src/` e
`gates/`: nada). O que **não** afirmo é que a suíte fecha verde nesta máquina; não fecha, por causa alheia.

**Critérios de aceite, um a um:** respiro nos quatro lados nos dois cromos e no celular, com valor do tema
(navegador real: 16/24/32 e 5/10/15 nos três breakpoints, mais o caso sem configuração ancorado na variável
computada) · muda por dispositivo e por tema (idem) · nenhum respiro de conteúdo por classe fixa no
`SarakShell` (`ShellContent.tsx:39-46`, lido) · gate reprova de verdade, nomeando token e modo, dos dois lados
(mutações acima) · `gate-limits` verde com o bloco atualizado · nenhum token novo, nenhum valor de tema alterado
· `docs/migracoes.md` com a entrada 7.0.0 no lugar certo, dizendo como voltar ao anterior · gates e kits em dia.

**Fora do escopo, que segue registrado:** `dist/` estava defasado e o rebuild leva `SarakCheckbox`/`SarakRadio`
(plan-83) para `dist/index.d.ts` — informação para o commit e para o nível da tag, não defeito. As edições em
`specs/` do worktree são do revisor (vereditos, espelho de status, [[00-backlog]] item 30 e a reescrita do item
13). O `dist/BUILD_INFO.json` carrega o carimbo das rodadas de verificação do revisor.

**Liberado para commit.**


### Nota de reconciliação — os dois blocos acima não se contradizem

O `🔴` imediatamente anterior a este veredito é de **outra sessão de revisor**, e descreve o worktree **de
antes** da correção 2. Três fatos do próprio texto dele provam isso: ele afirma que a §9 não tem resumo
posterior à correção 1 (tem, desde a correção 2), que o `grep` devolve a declaração em `:45` (não devolve mais
nada) e que o `status` estava em `🔵` (o executor o moveu para `🟠` ao entregar a correção 2). O achado dele é
**o mesmo** achado único da correção 1, e é exatamente o que a correção 2 fechou. Nada ficou pendente entre os
dois blocos.

**Duas sessões de revisor atuaram nesta plan em paralelo, e isso não é inócuo:** o veredito é append-only, então
um bloco vencido fica no arquivo para sempre e o leitor seguinte vê `🔴` seguido de `🟢` sem explicação — é o que
esta nota resolve. O risco de processo foi para o [[00-backlog]].

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese, imediatamente antes da remoção da plan. -->



