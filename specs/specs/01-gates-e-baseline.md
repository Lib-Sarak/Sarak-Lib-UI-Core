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
| Pacote | `npm run package:check` | O tarball não leva proibido nem esquece obrigatório | — | precisa de `dist/` |

Os quatro primeiros são **rápidos e verdes**, e são os que rodam encadeados antes de compilar no `npm run build`. `package:check` é diferente: roda `npm pack --dry-run --json`, então **exige `dist/` buildado** — é por isso que ele mora no `prepublishOnly`, não no `build`.

Todos os quatro têm a mesma mecânica de leitura: **saída de uma linha quando passa**. Se a linha não apareceu, leia o erro acima dela.

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

> **Regra dura: "suítes verdes" exige a suíte INTEIRA.** Rodar pasta a dedo esconde snapshot de terceiro que quebrou. Esta regra não é preferência de estilo; ela já custou uma spec aprovada com snapshot vermelho fora da pasta olhada.

Duas coisas do `vitest.config.ts` que importam para quem lê a saída:

- `pool: 'forks'` + `execArgv: ['--max-old-space-size=8192']`. O teto de heap é **explícito e comentado**: workers reutilizados acumulavam heap do jsdom e o run completo caía por OOM. Em Vitest 4 a opção é *top-level* — `poolOptions` foi removido e era **ignorado em silêncio**.
- `**/__e2e__/**` e `*.spec.ts(x)` estão **excluídos**. Os arquivos de `__e2e__` são Playwright, não Vitest.

**Ruído esperado na saída, que NÃO é falha:** `Could not parse CSS stylesheet` (jsdom não entende o CSS moderno da lib), `HTMLCanvasElement's getContext()` (a luminância híbrida usa canvas) e `Not implemented: navigation`. Todos vêm do jsdom.

## 2.5 `npx tsc --noEmit` — a verdade incômoda

```
npx tsc --noEmit
```

**Não está em nenhum pipeline e não está verde: 14 erros.** Não é gate hoje. Rodar `tsc` e ver vermelho é o estado esperado; a lista item a item está na §4.4.

Isso não contradiz o `auditor_typescript` estar verde: um procura o **token** `any` na AST, o outro **compila**. São checagens diferentes.

## 2.6 Playwright — existe, e está fora de tudo

```
npm run test-ct            # component testing  (playwright-ct.config.ts)
```

Mais os `__e2e__` de `src/core/Provider/` e `src/features/DesignEngine/` (`playwright.config.ts`). **Nenhum dos dois roda em automação nenhuma** — nem no build, nem no hook, nem em CI (que não existe). São executados à mão, quando alguém lembra.

Registrado como o que é: **cobertura que existe e não é cobrada**.

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
| `barrel:check` | `npm run barrel:check` | ✅ **78 componentes, 0 faltas** |
| `catalog:check` | `npm run catalog:check` | ✅ catálogo em dia |
| `zero-brand:check` | `npm run zero-brand:check` | ✅ **363 arquivos, 0 violações** |
| `guide:check` | `npm run guide:check` | ✅ **kit em dia (6 arquivos)** |
| suíte | `npx vitest run` | ⚠️ **280 arquivos / 890 testes — 1 FALHA** (§3.1). ~155 s |
| `tsc` | `npx tsc --noEmit` | ❌ **14 erros** — 10 em teste, **4 em produção**. Não é gate |
| `build` | `npm run build` | 4 gates + 6 etapas de compilação |
| `package:check` | `npm run package:check` | exige `dist/` buildado |

## 3.1 ⚠️ Divergência de primeira ordem: a suíte NÃO está 100% verde

O plano da campanha registrava `280 arquivos / 890 testes, 100% verde`. **Medido hoje: 1 teste falha.**

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

**Correção conhecida, NÃO aplicada aqui:** dar ao teste uma fronteira explícita — parar a subida num diretório-raiz informado — ou plantar um `package.json` sem `packageManager` e sem lockfile no topo do `tmpDir` e apontar `startDir` para um filho. As duas mexem em código de teste, o que está **fora do escopo desta campanha** (§6). Decisão do dono.

**Consequência para [[02-enforcement-por-commit]]:** um anel que rode a suíte completa e bloqueie vai bloquear **por causa do estado do `$HOME` da máquina**. Isso é levado em conta lá.

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
| 4 | **3 das 4 categorias de `engines/` fora do barril** (`flows`, `chat`, `visuals`) | `src/components/engines/` | ❌ **Não** — `engines/` está fora do escopo de varredura do `barrel:check` |
| 6 | **`upgradeThemePayload` declara `partialMode` e nunca usa** — parâmetro morto na assinatura pública | `src/core/Design/master-map.ts:148` | ❌ **Não.** Parâmetro não usado não é `any` nem estoura limiar de Clean Code |

**O que fecharia cada um:** (1) decisão de taxonomia — mover o componente para `Tables/`, mover o hook para `Templates/`, ou aceitar e documentar; (3) `React.lazy`, que muda o tipo público para `LazyExoticComponent` e portanto é **breaking change**; (4) decisão do dono entre "interno de propósito" e "lacuna de exposição"; (6) remover o parâmetro (mudança de assinatura, ainda que ninguém o passe).

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

- [x] Rodar os comandos deste documento reproduz exatamente a tabela da §3 — **com a exceção documentada da §3.1**, cuja causa foi reproduzida em isolamento.
- [x] Todo item de dívida tem `arquivo:linha` e a coluna "visível em gate".
- [x] Os 8 auditores e os 5 scripts de check foram lidos um por um antes de descritos.
- [x] Nenhum item do baseline foi corrigido nesta entrega.

# 8. Plano de testes (Quality Gate)

Esta spec é verificada **executando-a**:

- `node .agents/skills/ui-auditoria-modulo/scripts/run_audit.mjs` → tem que bater com a §3, incluindo os vermelhos.
- `npm run barrel:check && npm run catalog:check && npm run zero-brand:check && npm run guide:check` → quatro verdes.
- `npx vitest run` → 280/890 com a falha da §3.1, enquanto o ambiente for este.
- `npx tsc --noEmit` → 14 erros, na composição da §4.4.
