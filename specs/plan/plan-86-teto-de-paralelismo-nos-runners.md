---
tipo: "plan"
titulo: "Dar teto de paralelismo aos dois runners de teste"
objetivo: "Fazer a suíte Vitest e a medição de navegador fecharem verdes em execuções consecutivas nesta máquina, sem flag de linha de comando"
dominio: "Sarak-Lib-UI-Core / Testes / Configuração dos runners"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "testes", "vitest", "playwright", "intermitencia"]
relacionados: ["[[11-testes-e-cobertura]]", "[[16-integracao-continua]]", "[[15-divida-conhecida]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/11-testes-e-cobertura.md + specs/15-divida-conhecida.md + specs/16-integracao-continua.md"
---

# 1. Objetivo

`npx vitest run`, `npm run coverage:check` e `npm run cromo-css-real:check` fecham **verdes em execuções
consecutivas** nesta máquina, **sem nenhuma flag de linha de comando** — o teto de paralelismo passa a morar
na configuração, e todo script, hook e job o herda.

# 2. Contexto

Os dois runners abrem tantos workers quantos a máquina oferece, e é a contenção entre eles que derruba as
execuções — não os testes. Tudo abaixo foi medido; nada precisa ser reinvestigado.

**A máquina:** 16 threads lógicas (Ryzen 7 5700G), 48 GB.

**Vitest** — `vitest.config.ts` fixa `pool: 'forks'` e o teto de heap, e **não fixa o número de workers**:

| Data | O que foi medido |
|---|---|
| 2026-09-08 | 4 execuções vermelhas em 5, sempre por timeout, sempre verdes isoladas (`SarakPDFViewerImpl`, `generate-token-types.check`) |
| 2026-09-10 | `npm run gates:full` caiu na etapa `coverage:check` em 4 de 5 execuções, nos mesmos dois arquivos — e como a etapa aborta, **o piso de cobertura não chega a ser medido** |
| 2026-09-30 | pior amostra: **13 falhas em 10 arquivos** numa rodada (snapshot, render, i18n, `--check` de gerador). Os seis conferidos passaram isolados (22/22). **Não é timeout puro** — há falha de asserção sob carga |
| 2026-09-30 | **na mesma árvore**, `npx vitest run --maxWorkers=4` fechou 386/386 arquivos e 2051/2051 testes. Repetiu verde em todas as rodadas de 2026-10-01 e 2026-10-02 |

**Playwright** — `browser-tests/playwright.config.ts:13` usa `fullyParallel: true` e não fixa `workers`. O
`beforeAll` de `browser-tests/cromo-css-real.spec.ts:197` chama `buildHarness()`, e **cada worker roda o
próprio `beforeAll`**: são vários bundles esbuild concorrentes, com o timeout padrão de 30 s. O bundle leva
16,6 s a frio (2,5 s a quente). Logo depois do `npm run build` — que é como o script o encadeia — a passada a
frio estourou os 30 s em 1 de 2 rodadas do revisor e em 1 de 2 do executor (2026-09-13), **derrubando todos
os casos sem nenhuma asserção de CSS ter rodado**. Com `--workers=1 --timeout=240000`, os casos rodam em
44,7 s.

**Um terceiro excesso do mesmo runner, já catalogado** ([[15-divida-conhecida]] achado 47): `.claude/skills`
é symlink de `.agents/skills`, mas o git rastreia os arquivos sob os dois prefixos — dois deles são arquivos
de teste, que o Vitest coleta e roda duas vezes.

⚠️ **Duas armadilhas que já custaram caro aqui:**

- **O Vitest 4 ignora em silêncio opção que não reconhece** ([[11-testes-e-cobertura]] §5, lição 2). Uma
  configuração aceita sem erro não é uma configuração aplicada: o teto precisa ser **provado em vigor**.
- **`tail` e `grep` durante uma execução destroem a evidência.** Toda rodada desta plan grava a saída
  **inteira** em arquivo antes de qualquer leitura ([[11-testes-e-cobertura]] §3.5, procedimento de captura).

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

- `vitest.config.ts` — o teto de workers e a exclusão de `.claude/**` da coleta.
- `browser-tests/playwright.config.ts` — o teto de workers e os timeouts.
- `browser-tests/cromo-css-real.spec.ts` — **só** o ciclo de vida do harness (`beforeAll`/`afterAll`) e o
  item 3 dos limites declarados no cabeçalho, que fala em dois recortes de `?tema=` quando a fixture tem
  quatro.
- `browser-tests/` — arquivo novo de preparação global, se for o desenho escolhido para buildar o harness
  uma vez.
- `.github/workflows/gates.yml` — **só** o comentário do passo do job `cromo-css-real` que fala em
  "os 3 testes Playwright".
- `sarak-dev/` — regenerado por `npm run dev-kit` (a contagem da suíte muda). Nunca à mão.

## 3.2 Fora (o que NÃO pode ser tocado)

- **Qualquer arquivo de teste em `src/`, `gates/`, `scripts/` ou `bin/`.** Se um teste falhar com o teto em
  vigor, isso é achado: pare e relate, com a saída gravada.
- **`testTimeout` do Vitest.** Aumentar o tempo de espera mascara contenção; não é o conserto.
- **`package.json`.** O teto mora na configuração, não em flag de script — é o que faz hook, `gates:full` e
  CI herdarem sem serem tocados.
- `.githooks/`, e o resto de `.github/workflows/gates.yml`.
- `gates/baselines/coverage-floor.json` — o piso não é regravado aqui.
- `browser-tests/fixtures/` e as asserções de `cromo-css-real.spec.ts` — a `plan-89` é que mexe nelas.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/11-testes-e-cobertura.md` | §3.5 (o que "suíte verde" significa e o procedimento de captura), §5 (a configuração e as duas lições do OOM), §7.3 (a medição de navegador) |
| Spec fixa | `specs/specs/16-integracao-continua.md` | §4.2.1 e §4.3 — o job `cromo-css-real` e o custo medido |
| Spec fixa | `specs/specs/15-divida-conhecida.md` | achados 43, 44 e 47 |
| Spec fixa | `specs/specs/01-gates-e-baseline.md` | como ler a saída de cada gate antes de rodar |
| Contexto | `specs/00-contexto.md` · `specs/00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` | sempre |
| Código | `vitest.config.ts` | ler antes de editar |
| Código | `browser-tests/playwright.config.ts` | ler antes de editar |
| Código | `browser-tests/cromo-css-real.spec.ts` | o cabeçalho de limites e o `beforeAll` |
| Código | `browser-tests/build-harness.mjs` | o que é buildado, e para onde |

# 5. Instruções de execução

1. **Fotografe o "antes".** Rode `npx vitest run` três vezes, gravando a saída inteira de cada uma num
   diretório temporário **fora do repositório**. Registre no resumo, por rodada: arquivos e testes que
   falharam. Três verdes também é resultado — registre e siga.
2. **Dê teto ao Vitest** em `vitest.config.ts`. O valor é escolhido por medição: parta de 4 (o único já
   medido) e fique com o **maior** que feche cinco rodadas seguidas verdes. Registre no resumo os valores
   tentados e o resultado de cada um.
3. **Prove que o teto está em vigor.** Mostre no resumo uma evidência de que o número de processos worker
   simultâneos não passa do teto durante uma rodada, e descreva o método. Diferença de duração entre rodadas
   não é prova.
4. **Tire `.claude/**` da coleta.** Pronto quando: a contagem de arquivos da suíte cai exatamente o número
   de arquivos de teste rastreados sob `.claude/skills`, e os mesmos testes continuam rodando a partir de
   `.agents/skills`.
5. **Faça o harness de navegador ser buildado uma vez por execução**, e dê teto de workers ao Playwright. O
   tempo do build do harness não pode consumir o timeout de um caso.
6. **Alinhe os dois textos desatualizados:** o item 3 do cabeçalho de `cromo-css-real.spec.ts` passa a listar
   os recortes de `?tema=` que a fixture tem de fato, e o comentário do job em `gates.yml` deixa de afirmar
   uma contagem de testes.
7. **Meça o "depois"**, tudo com a saída inteira gravada em arquivo:
   - `npx vitest run`, **10 vezes seguidas**;
   - `npm run coverage:check`, **3 vezes seguidas**;
   - `npm run cromo-css-real:check`, **5 vezes seguidas** (cada uma builda antes — é a passada a frio).
8. `npm run dev-kit`, depois `npm run dev-kit:check` → verde.
9. `npx tsc --noEmit` → zero erros. `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → sem
   regressão.

# 6. Critérios de aceite

- [ ] `npx vitest run`, sem flag, fecha verde **10 de 10** vezes seguidas; as dez saídas estão gravadas e o
      resumo traz a tabela (arquivos, testes, duração de cada rodada).
- [ ] `npm run coverage:check` chega à comparação com o piso **3 de 3** vezes — nenhuma aborta na suíte.
- [ ] `npm run cromo-css-real:check` fecha verde **5 de 5** vezes seguidas.
- [ ] O teto de workers do Vitest está **provado em vigor**, com o método descrito.
- [ ] A suíte não coleta nenhum arquivo sob `.claude/`, e a queda na contagem é igual ao número de arquivos
      de teste rastreados ali.
- [ ] O harness de navegador é buildado **uma vez** por execução do Playwright.
- [ ] Nenhum teste foi alterado, pulado ou removido; `testTimeout` do Vitest não foi tocado.
- [ ] `npx tsc --noEmit` com zero erros; `dev-kit:check` verde; nenhuma métrica do baseline regrediu.

# 7. Como verificar (uso do revisor)

**Gate:** `nenhum` — é configuração de runner; a prova é a repetição medida, não uma regra nova.

- `git status` + `git diff --stat` → só os arquivos de §3.1.
- Leitura do diff de `vitest.config.ts` e `browser-tests/playwright.config.ts` → o teto está na
  configuração, não em script.
- `git diff -- package.json` → vazio.
- `npx vitest run`, 5 vezes, saída gravada em arquivo → 5 verdes.
- `npm run cromo-css-real:check`, 3 vezes → 3 verdes.
- `npx vitest run 2>&1 | grep -c "\.claude"` sobre a saída gravada → 0.
- `npx tsc --noEmit` → 0 erros.
- `npm run dev-kit:check` → verde.

# 8. Destino da síntese

**Destino:** `specs/11-testes-e-cobertura.md + specs/15-divida-conhecida.md + specs/16-integracao-continua.md`

- **`11-testes-e-cobertura` §5** — a tabela de opções ganha a linha do teto de workers (o valor e por que
  esse) e a exclusão de `.claude/**`. **§3.5** passa a dizer o que a medição mostrou: a suíte fecha verde sem
  flag, e a causa das falhas era contenção entre workers. **§7.3** registra que o harness é buildado uma vez
  por execução.
- **`15-divida-conhecida`** — o achado **47** fecha (vai para a §6). O achado **44** ganha a causa medida: se
  as rodadas do aceite fecharem, sai para a §6 como corrigido; se alguma falhar, fica aberto com o nome do
  que falhou. O achado **43** continua como está — esta plan não regrava o piso.
- **`16-integracao-continua` §4.3** — o custo local do `cromo-css-real` é remedido com o conjunto atual de
  casos.

> A síntese é ato do **revisor** ([[00-prompt-revisor]]), e o gatilho é do **usuário**: o revisor propõe ao
> aprovar e espera autorização. Esta seção apenas a prepara.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese (00-prompt-revisor.md §7.4), imediatamente antes da remoção da plan.
     Append-only. O que foi transportado, e o que ficou de fora. -->
