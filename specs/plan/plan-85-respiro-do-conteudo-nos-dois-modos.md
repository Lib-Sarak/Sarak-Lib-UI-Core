---
tipo: "plan"
titulo: "Fazer o respiro do conteúdo valer nos quatro lados e nos dois modos de consumo"
objetivo: "O token layoutPadding governa o espaçamento do conteúdo em relação às bordas nos dois cromos e nos quatro lados, e o gate de paridade de cromo passa a cobrar os tokens de layout do schema de sistema"
dominio: "Sarak-Lib-UI-Core / Cromo e Design Engine"
status: "🔴 A executar"
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

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese, imediatamente antes da remoção da plan. -->
