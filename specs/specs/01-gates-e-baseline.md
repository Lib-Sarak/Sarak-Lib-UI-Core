---
tipo: "spec"
titulo: "Gates e baseline — o que cada verificação garante e onde ela está hoje"
dominio: "Sarak-Lib-UI-Core / Qualidade / Automação"
status: "🟢 Vigente"
prioridade: "Máxima"
tags: ["spec", "gates", "baseline", "auditoria", "divida-tecnica", "qualidade"]
relacionados: ["[[00-regras-e-invariantes]]", "[[02-enforcement-por-commit]]", "[[03-superficie-publica]]", "[[04-contrato-de-tokens-e-paridade]]", "[[05-build-e-distribuicao]]"]
---

# 1. Propósito

Este documento existe para impedir uma coisa específica: **alguém acusar regressão onde há dívida conhecida.**

`run_audit.mjs` **não está em zero** e não vai estar tão cedo. Quem roda a auditoria pela primeira vez vê "AUDITORIA FALHOU: 2 regras estruturais" e conclui que quebrou alguma coisa. Não quebrou. O baseline da §3 é a régua; **compare com ele, nunca com zero**.

Aqui está **como rodar** cada verificação e **onde ela está**. O que cada uma cobra está em [[00-regras-e-invariantes]]; **quando** ela roda está em [[02-enforcement-por-commit]].

> **Todo gate deste documento cita o número da regra que cobra** *(fechado em 2026-08-02, `plan-13`)*. É o caminho de volta que faltava: quem é bloqueado por um gate chega ao contrato sem adivinhar. Antes disso o `check-release-tag` bloqueava um push imprimindo *"Regra violada"* citando uma regra que não existia em spec nenhuma.

> Todos os números deste documento foram **medidos em 2026-07-27** nesta máquina, na execução que produziu esta spec. Nenhum foi copiado de documento anterior.

# 2. Catálogo de gates

## 2.1 `run_audit.mjs` — o agregador dos 8 auditores

```
node .agents/skills/ui-auditoria-modulo/scripts/run_audit.mjs
```

**Custo:** ~7 s. **Saída:** exit 1 se **qualquer** auditor sair diferente de 0. Ele não soma violações — soma **auditores reprovados** (`run_audit.mjs:36-43`). "Quebrou 2 regras estruturais" significa *dois auditores vermelhos*, não duas violações.

Ele roda os 8 na ordem abaixo, cada um em processo próprio:

| # | Auditor | Cobra | Como ler a saída |
| --- | --- | --- | --- |
| 1 | `auditor_hardcoded.mjs` | R2 | Duas seções (VALOR e ESTRUTURAL) + a **reconciliação** dos baldes. FAIL = `Valor + Estrutural líquido > 0` |
| 2 | `auditor_ghostvars.mjs` | R7 | Tamanho do registro + lista de fantasmas por frequência + agrupamento por família |
| 3 | `auditor_typescript.mjs` | R3 | Um `[FAIL]` por arquivo com `any`, com a linha |
| 4 | `auditor_coverage.mjs` | R8 | Um `[FAIL]` por componente/hook sem teste, com o caminho **esperado** do teste |
| 5 | `auditor_arquitetura.mjs` | R1 | Arquivo + linha do import que cruza a fronteira |
| 6 | `auditor_cleancode.mjs` | R9 | Arquivo + linha + qual limiar estourou |
| 7 | `auditor_paridade.mjs` | R4 | Delega para `verify_parity.ts`: imprime a contagem das 3 fontes |
| 8 | `auditor_presets.mjs` | R5 | Delega para `verify_presets.ts`: gabarito vivo + itens auditados |

> ⚠️ **Relatório × FAIL.** O balde **deduzido** do `auditor_hardcoded` (ícones, `w-full`/`h-full`, alinhamento) é **relatório**: aparece na reconciliação, é contado, e **não reprova**. Só o líquido reprova. Já a linha final de `verify_parity` ("416 tokens validados") é relatório de contagem bruta; o número que importa para paridade é o das três fontes (409). Ver [[04-contrato-de-tokens-e-paridade]] §2.

## 2.2 Os gates de contrato

| Gate | Comando | Garante | Cobra | Custo |
| --- | --- | --- | --- | --- |
| Barril | `npm run barrel:check` | Todo componente derivado por AST está no barril, com o `<Nome>Props` | R14 | ~1,3 s |
| Catálogo | `npm run catalog:check` | `docs/component-catalog.{json,md}` commitado == gerado agora | R17 | ~1,5 s |
| Zero-marca | `npm run zero-brand:check` | Nenhuma marca da lib como texto em componente consumidor-facing | R12 | ~1,3 s |
| Kit | `npm run guide:check` | `sarak-ui/` commitado == gerado agora (6 arquivos) | R17 | ~1,8 s |
| Kit do mantenedor | `npm run dev-kit:check` | `sarak-dev/` commitado == gerado agora (3 arquivos) **e zero ponteiro morto** na prosa | R17 · R23 · R29 | ~2,0 s |
| Pacote | `npm run package:check` | O tarball não leva proibido nem esquece obrigatório | **R19** | precisa de `dist/` |

**Os três gates que não estão nesta tabela porque não são de contrato**, e as regras que cobram:

| Gate | Comando | Garante | Cobra |
| --- | --- | --- | --- |
| Baseline de auditoria | `npm run audit:baseline` (Anel 2 do `pre-commit`) | A auditoria não piora — métrica a métrica contra `.githooks/audit-baseline.json` | **R20**, e a **contagem** de `tsc` (**R30**) quando o staged tem `.ts`/`.tsx` |
| Release | `npm run release:check` (anel de push) | Artefato publicado alterado sem tag nova não sobe para a `main` | **R21** |
| Segredos | `python .githooks/verificar_commit.py --raiz .` (Anel 0) | Nenhum segredo nem arquivo sensível no staged | **R22** |

> **Por que isto está escrito agora:** em 2026-08-02 o `check-release-tag` barrou um push imprimindo *"Regra violada"* — e a regra **não existia** em spec nenhuma. Um gate que reprova citando regra inexistente deixa o leitor sem caminho do bloqueio até o contrato. As três regras acima foram escritas em [[00-regras-e-invariantes]] (`plan-13`) a partir da leitura de cada script.

Os quatro primeiros são **rápidos e verdes**, e são os que rodam encadeados antes de compilar no `npm run build`. `package:check` é diferente: roda `npm pack --dry-run --json`, então **exige `dist/` buildado** — é por isso que ele mora no `prepublishOnly`, não no `build`.

Todos têm a mesma mecânica de leitura: **saída de uma linha quando passa**. Se a linha não apareceu, leia o erro acima dela.

⚠️ **`dev-kit:check` é o único gate com DUAS causas de reprovação** (Spec 14, criado em 2026-07-31): defasagem *e* **ponteiro morto** — caminho, `npm run <script>` ou comando `node` citado em crase na prosa do kit e que não existe. É o único gate que audita **documentação** por conteúdo, e não por hash. Ele **não** roda no `build` (o `build` produz o artefato publicado, e `sarak-dev/` não é publicado); roda no `gates:full` e, por ele, no `preversion`. Contrato completo em [[14-artefatos-do-mantenedor]].

## 2.3 `npm run build` — os quatro gates encadeados + a compilação

```
npm run build
```

Encadeia `catalog:check → barrel:check → zero-brand:check → guide:check → build:js → build:css → build:css:scoped → copy-base-css → inject-css → generate-build-info`.

**Os gates vêm antes de compilar de propósito**: build vermelho por documentação defasada é comportamento desejado, não incômodo. Detalhe de cada etapa em [[05-build-e-distribuicao]].

## 2.4 `npx vitest run` — a suíte completa

```
npx vitest run
```

**Custo:** ~155 s. Não existe script `test` no `package.json` — o comando é este.

**Cobra R6 · R13 · R24 · R25 · R26.** A suíte **é** gate: ela roda no Anel 3 do `pre-push` e bloqueia ([[02-enforcement-por-commit]] §4). Cinco regras dependem exclusivamente dela, e cada uma nomeia o arquivo do seu teste em [[00-regras-e-invariantes]] — `tokenContractParity`, `HostIdentity`/`EmbeddedMode`, `scopeCss`, `shippedThemesConsoleClean`, `iconCatalogParity`/`iconContract`.

> **Regra dura: "suítes verdes" exige a suíte INTEIRA.** Rodar pasta a dedo esconde snapshot de terceiro que quebrou. Esta regra não é preferência de estilo; ela já custou uma spec aprovada com snapshot vermelho fora da pasta olhada.

Duas coisas do `vitest.config.ts` que importam para quem lê a saída:

- `pool: 'forks'` + `execArgv: ['--max-old-space-size=8192']`. O teto de heap é **explícito e comentado**: workers reutilizados acumulavam heap do jsdom e o run completo caía por OOM. Em Vitest 4 a opção é *top-level* — `poolOptions` foi removido e era **ignorado em silêncio**.
- `**/__e2e__/**` e `*.spec.ts(x)` estão **excluídos**. Os arquivos de `__e2e__` são Playwright, não Vitest.

**Ruído esperado na saída, que NÃO é falha:** `Could not parse CSS stylesheet` (jsdom não entende o CSS moderno da lib), `HTMLCanvasElement's getContext()` (a luminância híbrida usa canvas) e `Not implemented: navigation`. Todos vêm do jsdom.

## 2.5 `npx tsc --noEmit` — a verdade incômoda

```
npx tsc --noEmit
```

**Cobra R30 — e a regra NASCE VIOLADA: 14 erros.** Não é gate próprio e não roda no `build` nem no `gates:full`. A única coisa que o toca é o **Anel 2**, que cobra a **contagem** contra `tsc.erros` do baseline quando o staged tem `.ts`/`.tsx`: isso impede o número de subir de 14, **não exige zero**. Rodar `tsc` e ver vermelho é o estado esperado; a lista item a item está na §4.4.

Isso não contradiz o `auditor_typescript` (R3) estar verde: um procura o **token** `any` na AST, o outro **compila**. São checagens diferentes.

## 2.6 Playwright — existe, e está fora de tudo

```
npm run test-ct            # component testing  (playwright-ct.config.ts)
```

Mais os `__e2e__` de `src/core/Provider/` e `src/features/DesignEngine/` (`playwright.config.ts`). **Nenhum dos dois roda em automação nenhuma** — nem no build, nem no hook, nem em CI (que não existe). São executados à mão, quando alguém lembra.

Registrado como o que é: **cobertura que existe e não é cobrada**. **Não cobra regra nenhuma hoje** — ligá-lo ao pipeline é a `plan-11`, e nenhuma das 32 regras depende dele.

# 3. O BASELINE — medido em 2026-07-27

**Compare com esta tabela. Nunca espere zero.**

| Gate | Comando | Baseline |
| --- | --- | --- |
| `run_audit` | `node .agents/skills/ui-auditoria-modulo/scripts/run_audit.mjs` | ❌ **exit 1 — 2 auditores vermelhos** |
| ↳ `auditor_hardcoded` | | **1 violação de VALOR:** `src/components/atomic/Atoms/SarakTypography.tsx:39`. Estrutural líquido = **0** (bruto 516 − 188 ícone − 87 dimensão − 241 alinhamento) |
| ↳ `auditor_ghostvars` | | **3 consumos** em 3 variáveis distintas; registro de **14.179** emitidas |
| ↳ `auditor_typescript` | | ✅ 0 `any` |
| ↳ `auditor_coverage` | | ✅ 0 órfãos |
| ↳ `auditor_arquitetura` | | ✅ 0 quebras de hierarquia |
| ↳ `auditor_cleancode` | | ✅ 0 violações |
| ↳ `auditor_paridade` | | ✅ **409 / 409 / 409** em 13 arquivos de partição (linha final relata 416 brutos) |
| ↳ `auditor_presets` | | ✅ gabarito de 409 chaves; **120 itens** (18 temas + 102 presets), 0 órfã |
| `barrel:check` **(R14)** | `npm run barrel:check` | ✅ **81 componentes, 0 faltas** — era 78 até P26, que pôs `components/engines/**` no escopo de varredura (§4.5, item 4) |
| `catalog:check` **(R17 · R29)** | `npm run catalog:check` | ✅ catálogo em dia (**81** componentes) |
| `zero-brand:check` **(R12)** | `npm run zero-brand:check` | ✅ **361 arquivos, 0 violações** — era 363 até P26; a contagem é o nº de arquivos varridos, então remover 2 componentes a faz cair. **O número que importa é o de violações (0)** |
| `guide:check` **(R17 · R29)** | `npm run guide:check` | ✅ **kit em dia (6 arquivos)** — o kit reporta **87** componentes (81 + 6 extras; ver [[03-superficie-publica]] §5.1) |
| `dev-kit:check` **(R17 · R23 · R29)** | `npm run dev-kit:check` | ✅ **kit em dia (3 arquivos, 0 ponteiros mortos)** — gate novo, criado em 2026-07-31 (P23) |
| suíte **(R6 · R13 · R24 · R25 · R26)** | `npx vitest run` | ✅ **274 arquivos / 889 testes, 100% verde** (~159 s), desde 2026-07-31 (P23 — +1 arquivo e +12 testes do gerador do `sarak-dev/`). Era 273/877 desde 2026-07-29 (P26); 275/879 antes da remoção do `SarakVisualEngine`/`PaletteSelector`, que levou junto os 2 testes de fumaça deles; 281/901 até a remoção do `Template-Ts/` (§3.2); e 280/890 com 1 falha ambiental até 2026-07-28 (§3.1) |
| `tsc` **(R30)** | `npx tsc --noEmit` | ❌ **14 erros** — 10 em teste, **4 em produção**. Não é gate próprio; o Anel 2 cobra só a **contagem** |
| `build` | `npm run build` | 4 gates + 6 etapas de compilação |
| `package:check` **(R19)** | `npm run package:check` | exige `dist/` buildado |
| `audit:baseline` **(R20 · R30)** | `npm run audit:baseline` | ✅ igual ao baseline de **2026-07-28** — nenhuma regressão |
| `release:check` **(R21)** | `npm run release:check` | depende do estado do git na hora; **não tem baseline** — ou o artefato mudou desde a tag, ou não |
| Anel 0 — segredos **(R22)** | `python .githooks/verificar_commit.py --raiz .` | ✅ verde é a **única** saída aceitável — não há baseline nem escopo: segredo é segredo |

## 3.1 ✅ RESOLVIDO em 2026-07-28 — o teste não-hermético que segurava a suíte

> **Estado atual: a suíte fecha 100% verde (280 arquivos / 891 testes).** A seção fica registrada porque a
> causa é instrutiva e porque duas decisões de arquitetura foram tomadas enquanto o defeito existia
> (o Anel 3 manual de [[02-enforcement-por-commit]]). O relato abaixo descreve o defeito **como ele era**;
> o fecho está no fim da seção.

### O defeito (medição de 2026-07-27)

Naquela medição, `280 arquivos / 890 testes` com **1 teste falhando**.

```
FAIL  bin/scaffold/__tests__/packageManager.test.mjs
      > detectPackageManager (Spec 51 — L2) > sem nenhum sinal, o default é npm
AssertionError: expected { name: 'npm', … } to match object { name: 'npm', source: 'default' }
-   "source": "default",
+   "source": "lockfile",
```

**Causa, reproduzida em isolamento — o teste é dependente do ambiente, não há regressão de código:**

O teste cria um diretório temporário e afirma que ali não há "sinal nenhum" de gerenciador. Mas `detectPackageManager` **sobe a árvore até a raiz do volume** (`packageManager.mjs:43-52`, `:64`) — comportamento correto e testado de propósito no caso "monorepo herda da raiz". O diretório temporário mora sob `C:\Users\Igor\AppData\Local\Temp\`, e a subida atravessa `C:\Users\Igor\`:

```
tmpDir:  C:\Users\Igor\AppData\Local\Temp\sarak-pm-pcqm72
detect:  { name: 'npm', source: 'lockfile', dir: 'C:\Users\Igor' }
```

Existe um `C:\Users\Igor\package-lock.json` (com `mammoth`, `playwright-core`, `puppeteer-core` — **nada a ver com este repositório**), criado por um `npm install` avulso no diretório do usuário. O teste passa a acusar `source: 'lockfile'` porque **encontrou um lockfile de verdade**, exatamente como deveria.

**O que isto é:** um teste que assume que não há lockfile em nenhum ancestral de `os.tmpdir()` — premissa que não é verdade em qualquer máquina. Ele passa ou falha conforme o estado do `$HOME` de quem roda.

**O que isto NÃO é:** regressão desta campanha (nenhum arquivo de `src/` ou `bin/` foi tocado) nem defeito do `detectPackageManager`.

### O fecho (2026-07-28 — P11-D)

Aplicada a primeira das duas correções previstas: `ancestorDirs` e `detectPackageManager` ganharam uma
**fronteira de parada opcional** (`stopAt`), e o caso passou a declarar o recorte em que afirma "não há
sinal nenhum" (`bin/scaffold/packageManager.mjs:42-66`, `:78`; `bin/scaffold/__tests__/packageManager.test.mjs:66-93`).

**O comportamento de produção não mudou.** Nenhum chamador real passa `stopAt`
(`bin/scaffold/runInit.mjs:40`, `bin/scaffold/checkUpdate/consumerContext.mjs:29,45,55,84`): sem
fronteira, a subida continua indo até a raiz do volume — que é a feature do caso monorepo. A
hermeticidade virou **propriedade do contrato da função**, não sorte do sistema de arquivos.

Um caso novo prova as duas direções sem depender do ambiente: com um lockfile plantado num ancestral
sintético, a detecção o acha **sem** `stopAt` (`source: 'lockfile'`) e não o vê **com** `stopAt`
(`source: 'default'`).

**Consequência para [[02-enforcement-por-commit]]:** cai a ressalva de que um anel rodando a suíte
completa bloquearia por estado do `$HOME`. A suíte é, a partir daqui, sinal confiável para automação —
é o que destrava o `preversion` do ciclo de release.

## 3.2 ✅ RESOLVIDO em 2026-07-29 — o subprojeto carona que fazia a suíte mentir num clone limpo

> **Estado atual: `Template-Ts/` não existe mais no repositório** (removido no P20-A, decisão D7).
> A seção fica registrada porque a lição é a mais transferível de toda a campanha: **o único gate que
> alcançava o problema era justamente o que ele enganava.**

### O defeito (achado do P12-C, 2026-07-28, medido num clone de verdade)

`Template-Ts/` era um projeto TypeScript **não relacionado à biblioteca** (`template-chat-ts`: um
template de backend de chat com express/supabase/pg), com **85 arquivos versionados** aqui — 48 em
`src/`, 27 em `dist/` compilado e commitado, 6 arquivos de teste. Os testes dele eram coletados pela
suíte (o `exclude` do `vitest.config.ts` não os filtrava) e passavam **naquela máquina** porque existia
um `Template-Ts/node_modules/` **local e não versionado** com `@supabase/supabase-js` dentro. Num clone
limpo:

```
FAIL  Template-Ts/tests/unit/toolbox/database/supabase_database.test.ts
Error: Failed to resolve import "@supabase/supabase-js" — Does the file exist?
Test Files  3 failed | 278 passed (281)
```

**Era o mesmo defeito da §3.1, um nível acima:** verde que depende de estado local que não viaja no
repositório. A diferença é que ali não era um teste da lib — era um subprojeto carona.

**A lição, que é o motivo desta seção sobreviver:** os outros gates não o viam por construção — `tsc`
não o compilava (`"include": ["src"]`), o tarball já o proibia
(`scripts/check-package-contents.mjs:14`), e nenhum dos 8 auditores varre fora de `src/`. Só a suíte o
alcançava, e para a suíte ele era verde. **Um diretório inteiro atravessou 330 commits invisível porque
o único instrumento que o media era o que ele enganava.**

### O fecho (2026-07-29 — P20-A)

O diretório foi removido (85 arquivos versionados). Princípio do dono que decidiu: *"esta é uma
biblioteca genérica e não deve depender de nenhum módulo."* O histórico permanece no git — quem
precisar recuperar, o diretório entrou inteiro num commit só: **`c43293e chore: setup Template-Ts and
agents structure`**.

| Suíte | Arquivos | Testes | Veredito |
| --- | --- | --- | --- |
| **ANTES** (2026-07-29, com o diretório) | 281 | 901 | ✅ verde (166,3 s) — mas **só nesta máquina** |
| **DEPOIS** (2026-07-29, sem o diretório) | **275** | **879** | ✅ verde (167,0 s) — **e verde em qualquer clone** |

Saíram exatamente os **6 arquivos / 22 testes** do subprojeto. O número caiu e o **sinal** subiu: o
verde de hoje não depende de nenhuma pasta ausente do git. **Este é o novo baseline da suíte** — a
tabela da §3 acima já o reflete.

Duas coisas deliberadamente **não** feitas:

- **`vitest.config.ts` não ganhou exclusão nenhuma.** Excluir um caminho que não existe mais seria a
  regra 2 da §6 (*nunca excluir pasta do escopo de um auditor*) aplicada ao contrário — sumindo o
  diretório, o `include` default para de achá-lo, sem precisar de ajuda.
- **A entrada `'Template-Ts/'` FICA** na lista de proibidos de `check-package-contents.mjs:14`, agora
  com o motivo escrito ao lado. É a trava mais barata contra um carona reaparecer; uma linha de
  allowlist negativa custa menos que redescobrir o problema.

**Consequência para o enforcement:** cai o último impedimento técnico ao Anel 3 (`pre-push` rodando a
suíte) de [[02-enforcement-por-commit]]. Com a §3.1 e esta §3.2 fechadas, a suíte é sinal confiável
para automação em qualquer máquina — não só nesta.

# 4. Dívida técnica conhecida

Cada item traz `arquivo:linha`, por que ainda existe, o que fecharia — e **se algum gate o vê hoje**. Essa última coluna é a mais importante: é ela que revela o que o conjunto de gates **não** enxerga.

## 4.1 Hardcode — 1 violação

| Item | Onde | Por que existe |
| --- | --- | --- |
| `letterSpacing: 'var(--sarak-h1-ls, -1px)'` | `src/components/atomic/Atoms/SarakTypography.tsx:39` | **Limitação do detector, não hardcode real.** `sanitizeFallbacks()` (`auditor_hardcoded.mjs:122-127`) remove `var(--x, 12px)` mas a regex **não aceita sinal negativo**, então o fallback `-1px` sobrevive à limpeza e é acusado como unidade solta |

**O que fecharia:** trocar por `calc(var(--sarak-h1-ls, 1px) * -1)`, que é a convenção adotada — ou corrigir a regex do auditor para aceitar o sinal. A primeira muda um átomo; a segunda muda um gate. **Visível em gate:** ✅ sim, é metade do baseline vermelho.

## 4.2 Variáveis-fantasma — 3 consumos acusados, 2 reais

**Localizados nesta execução, um a um:**

| Variável | Consumo | Veredito |
| --- | --- | --- |
| `--token` | `src/components/atomic/Atoms/SarakTypography.tsx:32` | ❌ **FALSO POSITIVO.** Está dentro de um comentário JSDoc: `/** Estilo por variante — 100% via var(--token, fallback) … */`. O auditor varre **linha a linha por regex** (`auditor_ghostvars.mjs:66-75`), não por AST — comentário conta como consumo |
| `--sarak-button-radius` | `src/components/atomic/Navigation/SarakShellNav.tsx:70` | ✅ **REAL.** O token emitido é **`--sarak-btn-border-radius`** (de `id: 'btnBorderRadius'`, `src/core/Design/schema/buttons.ts:50`) — o consumo escreveu `button` onde a engine emite `btn`. Tem fallback `8px`, então degrada em vez de colapsar |
| `--sarak-shell-brand-logo-size` | `src/components/atomic/Navigation/SarakShellNav.tsx:134` | ✅ **REAL, e sem contrapartida.** Não existe token de tamanho de logo de marca em schema nenhum. Fechar não é renomear: é **Expansão** (R11) — criar o token nas 3 fontes. Fallback `28px` |

> **A contagem honesta do baseline é 2 fantasmas reais + 1 falso positivo**, não 3. O número **3** continua sendo o baseline do gate — é ele que a automação compara. Mas quem for corrigir precisa saber que um dos três é um comentário.

**Nota sobre a correção do falso positivo:** trocar `var(--token, fallback)` por outra grafia no comentário faria o gate ir a 2 sem consertar nada. Isso é maquiagem, não correção — ver §6.

## 4.3 As duas LACUNAS DE COBERTURA do `auditor_ghostvars` (o achado mais grave)

O auditor varre **apenas `src/components/` e `src/features/`** (`auditor_ghostvars.mjs:14`). Duas consequências, ambas medidas nesta execução com uma sonda read-only que reaplica a lógica do próprio auditor em escopo ampliado:

### a) `src/styles/` é tratado como FONTE, nunca como consumidora

**29 variáveis distintas / 43 consumos** em `src/styles/*.css` não são cruzados contra o registro. Entre eles, **os 2 usos vivos do namespace PROIBIDO `--sx-*`**:

```css
/* src/styles/_utilities.css:80 e :89 */
background: var(--sarak-range-active-bg, var(--sx-color-primary-base));
```

Ninguém emite `--sx-color-primary-base` — o fallback de 2º nível **resolve para vazio**. Ou seja: a regra R7 declara `--sx-*` proibido, o gate está verde, e o namespace está vivo no CSS.

**O conserto tem DUAS metades** e as duas importam: (1) as 2 linhas de CSS; (2) ampliar o escopo do auditor para tratar `src/styles/` também como consumidor. **Não é feito aqui** porque mexer em gate durante esta campanha move o baseline que esta própria spec está fixando. Vira spec própria.

### b) `src/core/` está inteiramente fora do escopo

**7 variáveis distintas / 20 consumos.** Nem todos são fantasmas de verdade — a sonda herda o mesmo registro incompleto do auditor (ver §4.3.c). Os classificados:

| Variável | Consumo | Veredito |
| --- | --- | --- |
| `--sarak-sidebar-active` | `src/core/Shell/Components/SidebarNav.tsx:142` | ✅ **REAL — quebra de nome.** A engine emite `--sarak-sidebar-active-color` (`schema/navigation.ts:97`, `manifest.ts:205`) |
| `--sarak-topbar-active` | `src/core/Shell/Components/TopbarNav.tsx:123` e `:124` | ✅ **REAL — mesma quebra.** Emitido: `--sarak-topbar-active-color` (`schema/navigation.ts:162`, `manifest.ts:207`) |
| `--theme-on-primary` | 9 consumos em `core/Shell/**` e `core/Design/presets/components/buttons.ts:13` | ❌ **FALSO POSITIVO** — ver §4.3.c |
| `--x`, `--sarak-` | `resolveToken.ts:11`/`:102`, `validation.ts:43`, `types.ts:53` | ❌ Falso positivo: texto de comentário/documentação |
| `--glass-blur`, `--theme-background` | `DockNav.tsx:34`, `presets/components/inputs.ts:34`/`:69` | ⚠️ **Não apurado** — registrado para verificação |

Os dois primeiros confirmam um item antigo do `backlog_cobertura.md` que **ainda procede** — e que **nenhum gate vê**, porque mora em `core/`.

### c) O registro do auditor é mais estreito do que o próprio cabeçalho dele afirma

O comentário de `auditor_ghostvars.mjs:5-10` diz que o registro vem de "`useDesignVariables.ts`, schemas via `cssVars`, aliases de `src/styles/*.css`". **O código não lê `useDesignVariables.ts`** — a construção do registro (`:37-61`) abre só `src/core/Design/schema/*.ts` e `src/styles/*.css`.

**Prova:** `--theme-on-primary` é emitida em runtime por `src/core/Design/hooks/useDesignVariables.ts:183` (`variables['--theme-on-primary'] = …`) e **não** está no registro.

**Por que isso importa:** hoje nenhum consumo dentro do escopo varrido depende dessa família, então o gate segue verde. Mas a lacuna é de **falso positivo** — o dia em que um componente consumir uma variável emitida só em runtime, o auditor vai acusar fantasma numa variável que existe. Registrado para quem for ampliar o escopo: **ampliar o escopo sem ampliar o registro produz acusação falsa.**

## 4.4 `tsc --noEmit` — 14 erros

**4 em produção:**

| Onde | Erro |
| --- | --- |
| `src/components/atomic/hooks/useStructuralStyles.ts:30`, `:71`, `:94` | `TS2345` — `ResponsiveValue<number>` não é aceito por um helper cuja assinatura é `string \| number`. Os três são a mesma causa |
| `src/features/DesignEngine/Main/ThemeCustomizationTab.tsx:86` | `TS2322` — união de tipo de toast incompatível: o alvo aceita `'error' \| 'success' \| 'warning'`, a função fornecida só trata `'success' \| 'warning'` |

**10 em teste:** `BarrelParity.test.ts` (4) e `ZeroBrand.test.ts` (2) importam `scripts/*.mjs` sem declaração de tipo (`TS7016`/`TS7006`); `Templates/__tests__/Spec21.spec.tsx` (3) tem props faltando em objetos de fixture; `shippedThemesConsoleClean.test.ts` (1) tem parâmetro implícito.

**Por que ainda existe:** `tsc` nunca foi ligado a nenhum pipeline, então os erros nunca derrubaram nada. **O que fecharia:** os 4 de produção são correções pequenas e locais (alargar a assinatura do helper; alargar a união do toast). Os 10 de teste são ruído de tipagem em fixture. **Visível em gate:** ❌ **não** — nenhum pipeline roda `tsc`.

## 4.5 Dívidas estruturais herdadas da Fase 2

| # | Dívida | Onde | Visível em gate? |
| --- | --- | --- | --- |
| 1 | **`atomic/Tables/` é categoria sem componente** — só `hooks/useTableLayoutStyles.ts`; `SarakTable.tsx`/`SarakTableCards.tsx` moram em `Templates/` e importam o hook cruzando a fronteira de categoria; `grep "atomic/Tables"` = **0** | `src/components/atomic/Tables/` | ❌ **Não.** `auditor_arquitetura` só cobra `components ⊅ features` e `core ⊅ features`; cruzar categoria dentro de `atomic/` não é violação para nenhum gate |
| 3 | **`CustomizationPanel` eager no barril** — o painel inteiro do Design Engine no caminho crítico de todo consumidor | `src/index.ts:50` + efeito colateral `:119-125` | ❌ **Não.** Não existe gate de peso de bundle |
| 4 | ✅ **FECHADA em P26** (2026-07-29) — **3 das 4 categorias de `engines/` estavam fora do barril** (`flows`, `chat`, `visuals`) e o gate não via | `src/components/engines/` | ✅ **Sim, agora.** `engines/` entrou no escopo do `barrel:check` (78 → **81** componentes); Chat e Flow foram expostos atrás de fronteira lazy e o Visual foi removido. Ver [[03-superficie-publica]] §9 |
| 6 | **`upgradeThemePayload` declara `partialMode` e nunca usa** — parâmetro morto na assinatura pública | `src/core/Design/master-map.ts:148` | ❌ **Não.** Parâmetro não usado não é `any` nem estoura limiar de Clean Code |

**O que fecharia cada um:** (1) decisão de taxonomia — mover o componente para `Tables/`, mover o hook para `Templates/`, ou aceitar e documentar; (3) `React.lazy`, que muda o tipo público para `LazyExoticComponent` e portanto é **breaking change**; (4) **já fechada** — a decisão D2 do dono, executada em P26; (6) remover o parâmetro (mudança de assinatura, ainda que ninguém o passe).

> **A lição da nº 4 vale para a nº 2 (o `--sx-*` em `src/styles/`), que continua aberta:** as duas são a mesma classe de defeito — *gate com escopo menor que a regra*. A nº 4 foi fechada **ampliando o escopo do gate junto com o conserto**; a nº 2 espera a mesma dupla (§4.3). Consertar só o código deixaria o vão do gate de pé para a próxima violação.

**Nenhum destes é corrigido por esta spec.** Documentar com precisão é a entrega.

## 4.6 Um item do backlog histórico que NÃO procede mais

`plan/backlog_cobertura.md` registrava `--sarak-shadow-glow` como existindo "só como alias estático, fora do pipeline dinâmico". **Reverificado:** `src/styles/_theme.css:69` define

```css
--sarak-shadow-glow: var(--sarak-card-glow-color, rgba(0, 242, 255, 0.1));
```

e `--sarak-card-glow-color` é token real (`id: 'cardGlowColor'`, `src/core/Design/schema/cards.ts:307`). O alias **encaminha para um token dinâmico** — a troca de tema chega nele. O item está fechado; foi trazido de volta só para não ser "redescoberto" numa próxima auditoria.

# 5. A regra de ordem de correção — raiz primeiro

Ao corrigir um consumo fantasma **compartilhado por vários componentes**, corrija a **fonte comum** (o Hook Controlador, o alias em `src/styles/`, o schema) **antes** dos consumidores individuais.

Na ordem inversa, cada consumidor é migrado duas vezes: uma para o nome errado, outra quando a raiz finalmente muda. É o erro que a campanha de ghost vars cometeu uma vez e não repetiu.

# 6. A regra anti-afrouxamento

Três coisas são **proibidas**, sem exceção:

1. **Nunca relaxar a allowlist de um auditor para mascarar violação real.** Toda entrada de allowlist carrega motivo escrito, e o motivo tem que ser uma razão de negócio que a Configuração não resolve — não "estava vermelho".
2. **Nunca excluir pasta do escopo de um auditor para baixar a contagem.** As lacunas da §4.3 mostram exatamente o que acontece quando o escopo é menor que a regra: o gate fica verde e a regra fica violada. Estreitar de propósito é fabricar isso.
3. **Nunca "corrigir" o sintoma que o detector vê em vez do defeito.** Trocar a grafia do comentário para o `--token` sumir (§4.2), mover hardcode para `.ts` ou para uma `const` interpolada (R2.4), renomear para escapar de uma regex — tudo isso baixa o número sem consertar nada, e ainda destrói a única evidência do problema.

> Um baseline que melhora sem que ninguém tenha consertado nada é sinal de fraude no gate, não de progresso.

# 7. Critérios de aceite

- [x] Rodar os comandos deste documento reproduz exatamente a tabela da §3. As duas exceções que existiam foram fechadas: §3.1 (teste não-hermético, 2026-07-28) e §3.2 (subprojeto carona, 2026-07-29).
- [x] Todo item de dívida tem `arquivo:linha` e a coluna "visível em gate".
- [x] Os 8 auditores e os 5 scripts de check foram lidos um por um antes de descritos.
- [x] Nenhum item do baseline foi corrigido nesta entrega.
- [x] **Todo gate cita o número da regra que cobra** — incluindo os três que não são de contrato (`audit:baseline` → R20/R30, `release:check` → R21, Anel 0 → R22) e o Playwright, que declara **não** cobrar regra nenhuma *(2026-08-02, `plan-13`)*.

# 8. Plano de testes (Quality Gate)

Esta spec é verificada **executando-a**:

- `node .agents/skills/ui-auditoria-modulo/scripts/run_audit.mjs` → tem que bater com a §3, incluindo os vermelhos.
- `npm run barrel:check && npm run catalog:check && npm run zero-brand:check && npm run guide:check` → quatro verdes.
- `npx vitest run` → **275 arquivos / 879 testes, 100% verde**, em qualquer máquina (§3.1 e §3.2 fechadas).
- `npx tsc --noEmit` → 14 erros, na composição da §4.4.
