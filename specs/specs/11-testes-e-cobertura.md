---
tipo: "spec"
titulo: "Testes e cobertura — a regra 1:1, os gates-teste e as lacunas honestas"
dominio: "Sarak-Lib-UI-Core / Qualidade / Testes"
status: "🟢 Vigente"
prioridade: "Alta"
tags: ["spec", "testes", "cobertura", "vitest", "playwright", "gates", "divida-tecnica"]
relacionados: ["[[00-regras-e-invariantes]]", "[[01-gates-e-baseline]]", "[[02-enforcement-por-commit]]", "[[04-shell-e-discovery]]", "[[10-seguranca-e-acessibilidade]]"]
---

# 1. Propósito e os números MEDIDOS

Esta spec descreve **como se testa** nesta biblioteca, **o que é cobrado por gate** e **onde a cobertura
não existe**. A última parte é a mais importante: um documento de testes que só lista o que funciona
produz confiança injustificada.

**A propriedade que vale, independente de quando se lê esta spec:** `npx vitest run` fecha 100% verde, e a
diferença entre os arquivos de teste que existem no disco e os que o Vitest **coleta** é escopo excluído +
escopo invisível — explicada, item por item, na §6. A contagem corrente de arquivos e testes, e a duração
medida, vivem em [[01-gates-e-baseline]] §3 — não são repetidas aqui para não envelhecer a cada suíte nova.

**Não existe script `test` no `package.json`** — o comando é `npx vitest run`. Detalhe de execução de cada
gate está em [[01-gates-e-baseline]]; **quando** cada um roda está em [[02-enforcement-por-commit]].

# 2. A regra de cobertura 1:1 e sua forma EXATA

Cobrada por `auditor_coverage.mjs` (`gates/scripts/audit/`), dentro de `run_audit`.

## 2.1 O que ela exige

| Arquivo de produção | Teste exigido |
| --- | --- |
| `Componente.tsx` | `__tests__/Componente.test.tsx` **ao lado** |
| `useAlgo.ts` (hook — nome começa com `use`) | `__tests__/useAlgo.test.ts` **ou** `.test.tsx` |
| `outraCoisa.ts` (não começa com `use`) | **nada** — fora do escopo |

O caminho esperado é **irmão**: `<pasta>/__tests__/<nome>.test.tsx` (`:35-43`). Para hook, aceita as duas
extensões (`:44`, com o comentário: *"as vezes hooks sao testados com tsx"*).

**Ignorados:** arquivos que começam com `index` (`:26` — são barris), pastas `Mocks/` (`:11`), `__tests__/`,
`__e2e__/`, `.spec.*` e `.test.*` (`:19-21`).

**Estado atual:** ✅ `[OK] Todos os componentes possuem testes!` — **0 órfãos** no escopo varrido.

## 2.2 A consequência prática, que é a parte que muda comportamento

> **Arquivo novo nasce com teste, ou o gate reprova.**

E há um efeito de segunda ordem que vale nomear: **a regra 1:1 força extração**. Quando um arquivo cresce e
estoura o limite de 250 linhas do `auditor_cleancode`, a saída é dividi-lo — e **cada pedaço extraído
precisa do próprio teste**. As duas regras trabalham juntas: uma empurra para arquivos pequenos, a outra
garante que cada arquivo pequeno seja exercitado. É por isso que o repositório tem 282 arquivos de teste em
`src/` para uma biblioteca de 78 componentes públicos.

# 3. Estratégia

## 3.1 Teste na BORDA PÚBLICA

Comportamento — entradas versus saída/efeito — via `@testing-library/react`. **É proibido testar método
privado.** Setup global: `vitest.setup.ts`, que é uma linha só (`@testing-library/jest-dom/vitest`) — os
matchers de DOM, nada mais.

Um teste que conhece o estado interno do componente reprova quando alguém refatora sem mudar
comportamento. É o oposto de rede de proteção: é âncora.

## 3.2 MOCK RESTRITO

Mockar só:

1. **I/O de rede** (`fetch`/axios);
2. **dependência pesada de terceiro irrelevante ao render** (ex.: `framer-motion`);
3. **o contexto global** (`SarakUIProvider`) em teste de átomo isolado.

Fora disso, monte o componente de verdade. Mock de peça própria testa o mock.

## 3.3 Prioridade ao motor stateful

Provider, Design Engine, painel de customização e hooks de rascunho vêm **antes** de componente estático e
mock de demonstração. É onde o bug de estado mora.

## 3.4 A regra dura

> **"Suítes verdes" exige `npx vitest run` INTEIRO.**

Rodar pasta a dedo esconde snapshot de terceiro que quebrou. Isto não é preferência de estilo — **já custou
uma spec aprovada com snapshot vermelho fora da pasta olhada** ([[01-gates-e-baseline]] §2.4).

# 4. Os gates-teste — teste que é gate de ARQUITETURA

Categoria própria: não verificam comportamento de componente, verificam **invariante estrutural**. Todos
**confirmados existentes** nesta entrega:

| Gate-teste | O que cobra | Onde |
| --- | --- | --- |
| `BarrelParity.test.ts` | todo componente derivado por AST está no barril, com `<Nome>Props` — **reusa `gates/scripts/contrato/check-barrel-parity.mjs`** | `src/__tests__/` |
| `ZeroBrand.test.ts` | nenhuma marca da lib como texto renderizado — **reusa `gates/scripts/contrato/check-zero-brand.mjs`** | `src/__tests__/` |
| `tokenContractParity.test.ts` | nenhum valor shippado (defaults + 18 temas + 102 presets) fora do contrato do próprio token | `src/core/Provider/utils/__tests__/` |
| `shippedThemesConsoleClean.test.ts` | boot dos 18 temas sem aviso "fora do contrato" | idem |
| `EmbeddedMode.test.tsx` | modo embarcado não escreve fora do container | `src/core/Provider/__tests__/` |
| `scopeCss.test.ts` | o CSS escopado gera o seletor certo | idem |
| `ProviderZeroConfig.test.tsx` | Provider sem config não altera o documento do host | idem |
| `HostIdentity.test.tsx` | identidade da página é opt-in, com a precedência correta | idem |
| `iconCatalogParity.test.ts` | paridade do catálogo de ícones | `src/components/atomic/Icon/__tests__/` |

**`AuthCouplingGate.test.ts` NÃO existe** — o gate anti-acoplamento de autenticação foi **previsto** em
`plan/20` §2.3 e nunca implementado, embora o critério de aceite esteja marcado como concluído. Detalhe em
[[10-seguranca-e-acessibilidade]] §3.1/§5.3. **Não liste o que não existe** — foi por isso que esta seção
verificou cada arquivo antes de nomeá-lo.

> **O padrão que estes 9 gates-teste estabelecem, e que vale copiar:** quando existe um script de check,
> o teste **reusa o script** em vez de reimplementar a regra. `BarrelParity` e `ZeroBrand` fazem isso. O
> benefício não é economia de código — é que **script e teste nunca divergem**. Duas implementações da mesma
> regra viram duas regras no dia em que uma é ajustada.
>
> Efeito prático: quem roda só `vitest` (sem lembrar dos scripts) continua barrado pelas mesmas regras.

# 5. A configuração, e a história por trás dela

```ts
{
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    exclude: [… '**/__e2e__/**', '**/*.spec.ts', '**/*.spec.tsx'],
    pool: 'forks',
    execArgv: ['--max-old-space-size=8192'],
}
```

`vitest.config.ts`.

| Opção | Por quê |
| --- | --- |
| `environment: 'jsdom'` | é biblioteca de UI; quase todo teste monta DOM |
| `globals: true` | `describe`/`it`/`expect` sem import em nenhum arquivo de teste |
| `pool: 'forks'` + `execArgv` | ver o quadro abaixo |
| `exclude` de `__e2e__` e `*.spec.*` | **são Playwright, não Vitest** (§7) |

> ## ⚠️ As DUAS lições do OOM — nenhuma é sobre memória
>
> A suíte completa **caía por OOM**. O diagnóstico intuitivo (jsdom é pesado, workers acumulam heap) levou
> ao teto explícito de 8 GB por worker. Mas:
>
> **Lição 1 — a causa-raiz era um LOOP INFINITO DE REFETCH.** Um hook de dados tinha **dependência de
> objeto inline** no array de dependências: identidade nova a cada render → efeito re-executa → estado
> muda → render → efeito. O heap subia porque o teste **nunca parava de trabalhar**. *Estouro de memória é
> sintoma; loop de efeito é a doença.* Antes de aumentar o teto, procure o que não para.
>
> **Lição 2 — o Vitest 4 removeu `poolOptions` e o IGNORAVA EM SILÊNCIO.** A configuração "correta" estava
> escrita, versionada, revisada — **e não fazia nada**. Em Vitest 4 a opção é *top-level* (é o que o
> comentário do arquivo registra). *Configuração aceita sem erro não é configuração aplicada.* Quando um
> ajuste de config "não teve efeito", a primeira hipótese é que ele não foi lido.
>
> As duas lições sobrevivem ao caso concreto, e é por isso que estão aqui e não só no log.

# 6. Escopo — arquivos de teste no disco × arquivos rodados

Onde a diferença mora:

| Grupo | Roda em `vitest run`? |
| --- | --- |
| Testes de `src/`, `bin/`, `scripts/` (`*.test.*`) | ✅ sim — são a maior parte dos arquivos coletados |
| `*.spec.ts(x)` (Playwright) | ❌ **excluídos** — são Playwright |
| `**/__e2e__/**` | ❌ excluídos |

> A contagem de "arquivos" do Vitest não é comparável um-a-um com `find … -name "*.test.*"`: o Vitest conta
> **arquivos coletados** dentro das raízes que ele varre, com o `exclude` aplicado. O ponto que importa é o
> **sinal**: nenhum teste do repositório está silenciosamente fora, exceto os `.spec` — que são de outra
> ferramenta, de propósito. A contagem corrente das duas listas vive em [[01-gates-e-baseline]] §3.

## 6.1 ✅ FECHADO em 2026-08-05 — `src/shared/`, `src/effects/` e `src/constants/` entraram no gate de cobertura

**Era:** `auditor_coverage.mjs:52-60` varria só `src/components`, `src/features` e `src/core`. `src/shared/`
ficava invisível, com **três arquivos sem teste** — `useSarakRouter.ts` (rota nativa por History API),
`useModuleDiscovery.ts` (formata/ordena módulos do menu) e `services/api.ts` (cliente axios + a fronteira "a
lib não injeta `Authorization`", [[10-seguranca-e-acessibilidade]] §3.1).

**Conserto, em duas metades, como a spec já previa que precisava ser:**

1. **Metade de código (2026-08-03, `plan-07`):** testes escritos para os dois hooks —
   `useSarakRouter.ts` (9 casos) e `useModuleDiscovery.ts` (11 casos, com as duas fronteiras mockadas).
   `services/api.ts` e `types/index.ts` continuam fora da regra 1:1 **na letra** (um é `.ts` que não começa
   com `use`, o outro é `index*`) — não são violação, são o próprio recorte da regra.
2. **Metade de gate (2026-08-05, `plan-12`, vão nº 6):** `auditor_coverage.mjs` ampliado para
   `src/shared/`, `src/effects/` e `src/constants/`. **Nasceu verde** — os testes já existiam, escritos na
   metade 1, incluindo dois achados novos que a ampliação revelou: `effects/NoiseOverlay.tsx` (6 testes) e
   `constants/icon-packs.tsx` (7 testes, com paridade de chaves entre os 8 packs de ícone).

**Estado hoje:** `auditor_coverage` cobre as seis raízes e reporta **0 órfãos**, de verdade — não mais
"0 órfãos dentro de um recorte que deixava três arquivos de fora".

# 7. E2E — o estado HONESTO

**O que existe:**

| Peça | Estado |
| --- | --- |
| `playwright-ct.config.ts` + `npm run test-ct` | ✅ funciona — `testDir: './src'`, `testMatch: /.*\.spec\.tsx?$/`, snapshots em `./__snapshots__`, harness em `playwright/index.tsx` |
| `src/features/DesignEngine/__e2e__/Boot.spec.tsx` | existe |
| `src/features/DesignEngine/__e2e__/RealtimeInjection.spec.tsx` | existe |
| `src/core/Provider/__e2e__/EmbeddedNoLeak.spec.tsx` | existe — **exige `npm run build` antes** |
| `src/components/atomic/Templates/__tests__/Spec21.spec.tsx` | existe — é `.spec.tsx` **dentro de `__tests__/`**, então o Vitest o exclui e o CT o coleta |

**O que NÃO existe, e é o ponto:**

1. ❌ **Nada disso roda em pipeline automático.** Não no `build`, não em hook, não em CI — que não existe.
   Todos são executados **à mão, quando alguém lembra**. Cobertura que existe e não é cobrada.
2. ❌ **`playwright.config.ts` não existe mais.** Era arquivo órfão — apontava para `./e2e`, que nunca
   existiu, e nenhum script do `package.json` o usava. Foi **deletado** pela `plan-19` (achado 17 em
   [[15-divida-conhecida]] §6): `npx playwright test` com o config default hoje sai com `exit 1` e
   *"No tests found"* — falha alto em vez de passar em silêncio. O que resta, e funciona, é
   `playwright-ct.config.ts` via `npm run test-ct`, fora de automação (item 1 acima).
3. ❌ **Nenhuma jornada de usuário ponta a ponta em browser real.** Os 4 `.spec` são component testing —
   valiosos, mas não são "login → navega → troca tema → persiste".

> **Registrado como LACUNA, não como plano concluído.** A spec antiga de cobertura
> *(`05-cobertura-de-testes.md`, **removida** na reescrita da base — histórico no git)* listava
> "Integração Playwright/Cypress" e "fluxos de painel em DOM real" como **próximo passo** — e ali estão,
> ainda próximos. A diferença é que agora está escrito **por que** não avançou: sem CI, um E2E manual não
> tem quem o execute.
>
> CI é a **Fase A da Campanha 2** (decisão D9), e é ela que destrava isto.

# 8. ✅ Cobertura percentual — ligada em 2026-08-05 (`plan-12`, R8.1), com piso móvel

**Era:** `@vitest/coverage-v8` instalado (`package.json:98`) e **nenhum script o invocava** — a meta de
~80% era intenção, não medição.

**Conserto:** `vitest.config.ts` ganhou o bloco `coverage` (`provider: 'v8'`, reporter `text` + `json-summary`);
`gates/scripts/release/check-coverage-floor.mjs` (novo) aplica a **mesma mecânica do `audit:baseline`** —
mede, grava como piso, e o piso só sobe. Pior bloqueia, igual passa, melhor passa e regrava.
`npm run coverage:check` (`vitest run --coverage && check-coverage-floor.mjs`), dentro do `gates:full`.

**Por que piso móvel e não alvo fixo — a mesma razão que a versão anterior desta seção já argumentava:** um
teto arbitrário (80%) reprova no primeiro dia e ensina a ignorar o vermelho. O 1:1 continua sendo a regra
principal; o percentual é a segunda rede, e mede **outra coisa**: quanto de **dentro** de cada arquivo o
teste alcança.

**O piso corrente vive em `gates/baselines/coverage-floor.json`** — leia-o, não o presuma aqui. O que a
biblioteca tem em lugar de um número solto:

- **cobertura 1:1 estrutural** (§2), binária e cobrada por gate: todo componente/hook do escopo varrido
  **tem** arquivo de teste — inclusive `shared/`, `effects/` e `constants/` agora (§6.1);
- **percentual com piso móvel** (esta seção), que pega o que o 1:1 não vê: um teste que só monta o
  componente e afirma `toBeTruthy()` passa no 1:1, mas pesa pouco no percentual;
- **11 gates-teste de invariante** (§4), que cobrem propriedades que percentual não mede (paridade de
  barril, contrato de token, não-vazamento de escopo, ausência de acoplamento de auth, composição atômica).

# 9. Dívidas e lacunas

| # | Item | Situação |
| --- | --- | --- |
| 1 | ✅ **FECHADO em 2026-08-05** — `src/shared/`, `src/effects/`, `src/constants/` no escopo do gate (§6.1) | — |
| 2 | ✅ **FECHADO em 2026-08-05** — cobertura % ligada, piso móvel (valor corrente em `gates/baselines/coverage-floor.json`, §8) | — |
| 3 | **Nada de Playwright em automação** (§7). O `playwright.config.ts` órfão foi deletado (achado 17, [[15-divida-conhecida]] §6) — o que resta é `playwright-ct.config.ts` via `npm run test-ct`, executado à mão | destravado pela CI (`plan-05`, ainda não executada) |
| 4 | **Nenhum gate de a11y** | [[10-seguranca-e-acessibilidade]] §5.1 |
| 5 | ✅ **NÃO SE APLICA MAIS** — o `CustomizationPanel` deixou de ter abas inalcançáveis: os imports mortos **saíram** (2026-08-04, decisão do dono), não foram tornados alcançáveis. Não há mais aba para testar | [[06-painel-de-customizacao-e-preview]] §9.3 |
| 6 | **Nenhum teste de detecção real por `resize`** com layout montado | [[07-responsividade-e-multidispositivo]] §8 item 5 |

## 9.1 ✅ RESOLVIDO — o teste não-hermético que segurava o Anel 3

`bin/scaffold/__tests__/packageManager.test.mjs > "sem nenhum sinal, o default é npm"` **dependia do
ambiente**: criava um `tmpDir` sob o diretório temporário do SO e afirmava que `detectPackageManager` não
acharia lockfile nenhum subindo a árvore — mas a subida vai **até a raiz do volume** (comportamento correto
e testado de propósito no caso "monorepo herda da raiz"), então um `package-lock.json` solto no `$HOME`
fazia o teste falhar por motivo alheio ao repositório.

**Fechado em 2026-07-28 (P11-D):** `ancestorDirs`/`detectPackageManager` ganharam fronteira de parada
opcional (`stopAt`), o caso declara o recorte em que afirma "não há sinal nenhum", e um caso novo prova as
**duas** direções com um ancestral sintético. **O comportamento de produção não mudou** — nenhum chamador
real passa `stopAt`. A hermeticidade virou **propriedade do contrato da função**, não sorte do sistema de
arquivos. Detalhe em [[01-gates-e-baseline]] §3.1.

**Por que fica registrado:** foi **essa** fragilidade que impediu o Anel 3 de virar `pre-push` bloqueante
no P11 ([[02-enforcement-por-commit]]). Um único teste não-hermético travou uma decisão de enforcement por
duas rodadas — o custo de um teste que depende do ambiente não é o teste, é o que ele impede de automatizar.

## 9.2 ✅ RESOLVIDO — o subprojeto carona

`Template-Ts/` (85 arquivos versionados, 6 de teste) era coletado pela suíte e passava **só nesta máquina**,
por causa de um `node_modules/` local não versionado. **Removido em 2026-07-29 (P20-A, decisão D7).**

**Suíte antes:** 281 arquivos / 901 testes. **Depois:** **275 / 879** — saíram exatamente 6 arquivos e 22
testes. O número caiu e o **sinal** subiu: o verde de hoje não depende de nenhuma pasta ausente do git.

Lição preservada: **a suíte varria um projeto alheio e ninguém via, porque o único gate que o alcançava era
o que ele enganava.** Detalhe em [[01-gates-e-baseline]] §3.2.

## 9.3 Ruído esperado na saída (não é falha)

Todos do jsdom, e nenhum indica problema:

- `Could not parse CSS stylesheet` — o jsdom não entende o CSS moderno da lib;
- `HTMLCanvasElement's getContext()` — a luminância híbrida usa canvas;
- `Not implemented: navigation` — `useSarakRouter` mexe no `history`.

# 10. Critérios de aceite

- [x] A suíte fecha 100% verde na **execução desta entrega** (2026-07-29); a contagem corrente de arquivos, testes e duração vive em [[01-gates-e-baseline]] §3, não aqui.
- [x] A regra 1:1 está descrita na forma **exata** que o auditor cobra, com as exclusões.
- [x] Os gates-teste foram **verificados um a um** antes de listados — e o que não existe
      (`AuthCouplingGate`) aparece como ausente.
- [x] A lacuna de E2E aparece **como lacuna**, incluindo o config morto apontando para `./e2e`.
- [x] A cobertura percentual está descrita — *(atualizado 2026-08-07)* ligada em 2026-08-05, piso móvel
      (valor corrente em `gates/baselines/coverage-floor.json`), contra a afirmação sem medição da spec
      antiga.
- [x] A lacuna de escopo de `src/shared/` está registrada — **fechada em 2026-08-05**, nas duas metades.

# 11. Plano de testes (Quality Gate)

Esta spec é verificada **executando-a**:

| Comando | Esperado |
| --- | --- |
| `npx vitest run` | 100% verde — contagem corrente de arquivos/testes em [[01-gates-e-baseline]] §3 |
| `node gates/scripts/audit/auditor_coverage.mjs` | `[OK] Todos os componentes possuem testes!` |
| `npm run test-ct` | roda os 4 `.spec.tsx` (manual; `EmbeddedNoLeak` exige `npm run build` antes) |
| `npm run coverage:check` | igual ou melhor que o piso corrente — a tabela datada de [[01-gates-e-baseline]] §3 tem o valor; §8 explica a mecânica |

**A implementar (backlog, em ordem de valor):** (1) CI que execute suíte **e** Playwright (`plan-05`,
ainda não executada); (2) teste de detecção real por `resize` com layout montado (§9 item 6).
