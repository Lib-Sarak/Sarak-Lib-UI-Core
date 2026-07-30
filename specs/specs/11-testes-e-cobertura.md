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

**Medido nesta entrega, em 2026-07-29, na máquina que produziu esta spec:**

| Métrica | Valor |
| --- | --- |
| `npx vitest run` | ✅ **275 arquivos / 879 testes, 100% verde** |
| Duração | **~167 s** |
| Arquivos `*.test.*` no repositório | **295** (282 em `src/`, 12 em `bin/`, 1 em `scripts/`) |
| Arquivos `*.spec.ts(x)` (Playwright) | **4** |

> A diferença entre **295 arquivos de teste** e **275 arquivos rodados** é explicada, item por item, na §6.
> Ela não é arredondamento: é escopo excluído + escopo invisível.

**Não existe script `test` no `package.json`** — o comando é `npx vitest run`. Detalhe de execução de cada
gate está em [[01-gates-e-baseline]]; **quando** cada um roda está em [[02-enforcement-por-commit]].

# 2. A regra de cobertura 1:1 e sua forma EXATA

Cobrada por `auditor_coverage.mjs` (`.agents/skills/ui-auditoria-modulo/scripts/`), dentro de `run_audit`.

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
| `BarrelParity.test.ts` | todo componente derivado por AST está no barril, com `<Nome>Props` — **reusa `scripts/check-barrel-parity.mjs`** | `src/__tests__/` |
| `ZeroBrand.test.ts` | nenhuma marca da lib como texto renderizado — **reusa `scripts/check-zero-brand.mjs`** | `src/__tests__/` |
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
| `globals: true` | `describe`/`it`/`expect` sem import em 295 arquivos |
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

# 6. Escopo — os 295 arquivos de teste × os 275 rodados

Onde a diferença mora:

| Grupo | Arquivos | Roda em `vitest run`? |
| --- | --- | --- |
| Testes de `src/`, `bin/`, `scripts/` (`*.test.*`) | 295 | ✅ sim — e são a maior parte dos 275 arquivos coletados |
| `*.spec.ts(x)` (4 arquivos) | 4 | ❌ **excluídos** — são Playwright |
| `**/__e2e__/**` | 2 dos 4 acima | ❌ excluídos |

> A contagem de "arquivos" do Vitest (275) não é comparável um-a-um com `find … -name "*.test.*"` (295):
> o Vitest conta **arquivos coletados** dentro das raízes que ele varre, com o `exclude` aplicado. O ponto
> que importa é o **sinal**: nenhum teste do repositório está silenciosamente fora, exceto os 4 `.spec` —
> que são de outra ferramenta, de propósito.

## 6.1 ⚠️ A LACUNA REAL DE ESCOPO: `src/shared/` é invisível para o gate de cobertura

`auditor_coverage.mjs:52-60` varre **exatamente três raízes**:

```js
const srcDir      = path.resolve('src/components');
const featuresDir = path.resolve('src/features');
const coreDir     = path.resolve('src/core');
```

**`src/shared/` não está na lista.** E ele contém três arquivos **sem nenhum teste**
(`find src/shared -type d -name __tests__` → **vazio**):

| Arquivo | O que é | Por que dói |
| --- | --- | --- |
| `src/shared/hooks/useSarakRouter.ts` | rota nativa por History API — `pushState`/`replaceState` + dispatch de `popstate` | **o coração do roteamento do modo Shell-host**, o código mais acoplado a browser da lib |
| `src/shared/hooks/useModuleDiscovery.ts` | formata/ordena os módulos registrados, aplica blacklist | decide **o que aparece no menu** |
| `src/shared/services/api.ts` | cliente axios dos templates pesados, e a fronteira "a lib não injeta `Authorization`" | é uma **fronteira de segurança** ([[10-seguranca-e-acessibilidade]] §3.1) |

**Isto é a mesma classe de defeito da lacuna do `auditor_ghostvars`** ([[01-gates-e-baseline]] §4.3):
**escopo do auditor menor que o alcance da regra** → o gate fica verde e a regra fica violada. A regra 1:1
diz "todo componente/hook tem teste"; o auditor diz "todo componente/hook **de três pastas**".

**Consequência medida:** `auditor_coverage` reporta **0 órfãos** enquanto **3 arquivos** — dois deles
críticos — não têm um único teste. Ver também [[04-shell-e-discovery]] §9.

**O conserto tem duas metades, e as duas importam:** (1) acrescentar `src/shared` às raízes varridas;
(2) **escrever os testes que a ampliação vai passar a exigir**. Fazer só (1) transforma o baseline em
vermelho sem consertar nada. **Não é feito aqui** — mexer em gate durante esta campanha moveria o baseline
que ela está fixando ([[01-gates-e-baseline]] §6). Vira spec própria.

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
2. ❌ **`playwright.config.ts` aponta para um diretório que NÃO EXISTE.** `testDir: './e2e'`, e
   `ls -d e2e` → *No such file or directory*. Não há script no `package.json` que o use. **É configuração
   morta:** `npx playwright test` com o config default não coletaria nada. Todo o Playwright usável passa
   pelo `-ct`.
3. ❌ **Nenhuma jornada de usuário ponta a ponta em browser real.** Os 4 `.spec` são component testing —
   valiosos, mas não são "login → navega → troca tema → persiste".

> **Registrado como LACUNA, não como plano concluído.** A spec antiga (`05-cobertura-de-testes.md`) listava
> "Integração Playwright/Cypress" e "fluxos de painel em DOM real" como **próximo passo** — e ali estão,
> ainda próximos. A diferença é que agora está escrito **por que** não avançou: sem CI, um E2E manual não
> tem quem o execute.
>
> CI é a **Fase A da Campanha 2** (decisão D9), e é ela que destrava isto.

# 8. Cobertura percentual — a verdade sobre os "80%"

**A meta de ~80% é uma INTENÇÃO, não uma medição.** Verificado nesta entrega:

| Fato | Evidência |
| --- | --- |
| `@vitest/coverage-v8` **está instalado** | `package.json:98` (`^4.1.8`, devDependency) |
| **Não há configuração de `coverage`** no Vitest | `vitest.config.ts` — o bloco `test` não tem a chave |
| **Não há script que rode cobertura** | os 22 scripts do `package.json` — nenhum menciona coverage |
| Portanto: **nenhum número de cobertura % é produzido hoje** | — |

A spec antiga afirmava *"atingindo coberturas sólidas (>80%) globalmente"*. **Essa afirmação não é
verificável com o ferramental como está configurado.** A ferramenta está instalada e ociosa.

**O que a biblioteca realmente tem em lugar de percentual** — e é defensável:

- **cobertura 1:1 estrutural** (§2), que é binária e cobrada por gate: todo componente/hook do escopo
  varrido **tem** arquivo de teste;
- **9 gates-teste de invariante** (§4), que cobrem propriedades que percentual não mede (paridade de
  barril, contrato de token, não-vazamento de escopo).

**A avaliação honesta:** 1:1 garante **existência** de teste, não **qualidade** — um teste que só monta o
componente e afirma `toBeTruthy()` passa no gate. Percentual mediria linhas exercitadas e pegaria isso.
Ligar cobertura é barato (a dependência já está lá); a decisão de **ligar com limiar bloqueante** é que
precisa de dono, porque um limiar mal calibrado reprova PR legítimo.

# 9. Dívidas e lacunas

| # | Item | Situação |
| --- | --- | --- |
| 1 | **`src/shared/` fora do escopo do gate de cobertura** — 3 arquivos sem teste, 2 críticos (§6.1) | a mais grave; conserto em duas metades |
| 2 | **Cobertura % instalada e não medida** (§8) | ferramenta ociosa; falta config + decisão de limiar |
| 3 | **Nada de Playwright em automação**; `playwright.config.ts` aponta para `./e2e` inexistente (§7) | destravado pela CI (Campanha 2, Fase A) |
| 4 | **Nenhum gate de a11y** | [[10-seguranca-e-acessibilidade]] §5.1 |
| 5 | **Nenhum teste de alcançabilidade das abas do `CustomizationPanel`** — a razão pela qual 5 abas ficaram inalcançáveis sem nenhum gate reclamar | [[06-painel-de-customizacao-e-preview]] §9.3 |
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

- [x] O número declarado é o da **execução desta entrega**: 275 arquivos / 879 testes, verde, ~167 s.
- [x] A regra 1:1 está descrita na forma **exata** que o auditor cobra, com as exclusões.
- [x] Os gates-teste foram **verificados um a um** antes de listados — e o que não existe
      (`AuthCouplingGate`) aparece como ausente.
- [x] A lacuna de E2E aparece **como lacuna**, incluindo o config morto apontando para `./e2e`.
- [x] A cobertura percentual está descrita como **não medida**, contra a afirmação da spec antiga.
- [x] A lacuna de escopo de `src/shared/` está registrada com os 3 arquivos e o conserto em duas metades.
- [x] Nenhum teste novo foi escrito e nenhuma configuração de teste foi alterada.

# 11. Plano de testes (Quality Gate)

Esta spec é verificada **executando-a**:

| Comando | Esperado |
| --- | --- |
| `npx vitest run` | 275 arquivos / 879 testes, 100% verde |
| `node .agents/skills/ui-auditoria-modulo/scripts/auditor_coverage.mjs` | `[OK] Todos os componentes possuem testes!` |
| `npm run test-ct` | roda os 4 `.spec.tsx` (manual; `EmbeddedNoLeak` exige `npm run build` antes) |
| `find src/shared -type d -name __tests__` | **vazio** — a prova da lacuna §6.1 |

**A implementar (backlog, em ordem de valor):** (1) testes de `useSarakRouter`/`useModuleDiscovery`/`api.ts`
+ ampliação do escopo do auditor; (2) CI que execute suíte **e** Playwright; (3) cobertura % com limiar
acordado.
