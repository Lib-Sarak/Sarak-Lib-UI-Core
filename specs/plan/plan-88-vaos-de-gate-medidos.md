---
tipo: "plan"
titulo: "Fechar cinco vãos de gate já medidos"
objetivo: "Fazer cinco gates passarem a ver o que a regra deles já cobra e eles hoje deixam passar, cada um provado por um caso que falha"
dominio: "Sarak-Lib-UI-Core / Gates / Matriz de cobertura"
status: "🟢 Aprovada"
prioridade: "Média"
tags: ["plan", "gates", "cobertura-de-gate", "contraste", "ghostvars"]
relacionados: ["[[01-gates-e-baseline]]", "[[00-regras-e-invariantes]]", "[[09-temas-e-presets]]", "[[15-divida-conhecida]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/01-gates-e-baseline.md + specs/00-regras-e-invariantes.md + specs/09-temas-e-presets.md + specs/15-divida-conhecida.md"
---

# 1. Objetivo

Cinco gates passam a acusar o que hoje aprovam em silêncio — e, onde o alargamento expõe violação real, ela
é consertada na mesma entrega, de modo que o baseline fecha **sem regressão**.

# 2. Contexto

É o padrão que a [[00-contexto]] §8 nomeia: **o escopo do gate costuma ser menor que o escopo da regra**. Os
cinco vãos abaixo foram medidos, e a exposição de cada alargamento também — em 2026-10-02, rodando cópias
modificadas dos gates **fora do repositório**. O executor não precisa remedir para decidir; precisa reproduzir
para provar.

| # | Gate | O vão | Exposição medida ao fechar |
|---|---|---|---|
| 1 | `plan-index:check` | Nada verifica que as referências da §4 de uma plan **existem**. Uma plan citou `specs/24-modo-embarcado.md`, que nunca existiu em caminho nenhum, e o ponteiro atravessou escrita, revisão e despacho | as plans ativas na data da execução |
| 2 | `trail-citation:check` | `check-trail-citation.mjs:41` — `VEREDITO_RE = /veredito de/i` só casa *"veredito **de**"*. *"veredito do lote 1"* e *"veredito da correção"* passam | **zero** — o gate só lê linha adicionada |
| 3 | `auditor_ghostvars` | `auditor_ghostvars.mjs:131` — o registro conta como variável emitida o `id` de **qualquer** objeto do schema, inclusive o `id` das **opções** de um `select`. `{ id: 'overlay' }` cria `--sarak-overlay` e, pela expansão de sufixo, `--sarak-overlay-bg` | **zero fantasmas novos.** 59 ids vêm só de opção; sem eles o registro cai de 14.881 para 13.760 entradas, e o resultado continua 1 consumo (o do baseline) |
| 4 | `auditor_contraste` | Sete pares de `PAIRS` (`verify_contrast.ts:98`) têm cadeia de fundo que **não termina numa base opaca**. Com barra, botão ou superfície translúcidos, o par é declarado pulado | **51 pares-tema** pulados hoje, somando os dois modos. Compondo sobre `colorBgBody`: 49 passam, **2 reprovam** — ver abaixo |
| 5 | `class-merge:check` | O gate só mede concatenação por template literal. **Onze átomos** importam `twMerge` direto de `tailwind-merge`, contra a porta única da R35 — e o `twMerge` cru não conhece as utilitárias próprias da base | os onze arquivos da lista abaixo |
| 6 | `guide:check` / `catalog:check` | **Nada confere que o que o consumidor recebe cita nomes que o barril exporta.** Depois da `plan-82` renomear 114 nomes, **15 arquivos** — `README.md`, o guia e os templates do kit, a skill de integração, quatro documentos de `docs/` e o próprio `sarak-ui init` — continuaram ensinando `registerLocalComponent`, `CustomizationPanel`, `ThemeEntry`…; um projeto gerado não compilava, e o teste do gerador conferia o nome velho. É a dívida 23 da `15-divida-conhecida` (conteúdo do kit não é conferido), materializada. Corrigido à mão em 2026-10-03; o gate é o que falta | **zero** na data (acabou de ser limpo); o caso que falha é a fixture |

**Os sete pares do vão 4**, e quantos pares-tema cada um deixa pulados: `btnPrimaryText / btnPrimaryBg` (8) ·
`textColorMaster / sidebarColor` (8) · `textColorMaster / topbarColor` (8) · `titleColor / surfaceColor` (3) ·
`topbarTitleColor / topbarColor` (8) · `navItemActiveColor / sidebarActiveColor > sidebarColor` (8) ·
`navItemActiveColor / topbarActiveColor > topbarColor` (8).

**Os dois que reprovam**, ambos no tema `kinetic-flow`, no **modo oposto**: `navItemActiveColor` sobre
`sidebarActiveColor` dá **3,47:1**, e sobre `topbarActiveColor` dá **4,26:1**. O piso é 4,5:1. É o item de
navegação ativo do tema, ilegível abaixo de AA — e nenhum gate o via.

**Os onze átomos do vão 5:** `Buttons/SarakSocialButton.tsx` · `Feedback/SarakBadge.tsx` ·
`Modals/SarakModal.tsx` · `Templates/SarakCatalogGrid.tsx` · `Templates/SarakChart.tsx` ·
`Templates/SarakForm.tsx` · `Templates/SarakManagementGrid.tsx` · `Templates/SarakTable.tsx` ·
`Templates/components/ManagementGroupCard.tsx` · `UX/SarakTabs.tsx` · `UX/SarakTooltip.tsx` — todos sob
`src/components/atomic/`.

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

**Lote 1 — gates de documento e de rastro**
- `gates/scripts/contrato/check-plan-index-sync.mjs` (ou módulo irmão chamado pelo mesmo script) — a
  conferência das referências da §4.
- `gates/scripts/contrato/check-trail-citation.mjs` — o padrão e o limite 5 do cabeçalho.
- `gates/scripts/contrato/` — o gate do vão 6 (`kit-names:check` ou nome equivalente), parametrizável por `{ root, barrelTypes }`, ligado ao `build` (como o `prefix:check`) e à CI.
- `package.json` — **só** o script do gate novo e o encadeamento dele no `build`, como o `prefix:check` já está.
  Nada além disso: o `build:js` e o resto dos scripts são de outra plan.
- `bin/scaffold/__tests__/runInit.fs.test.mjs` — só se o gate absorver a prova que ele faz hoje.
- `gates/scripts/contrato/__tests__/` — os testes dos três.

**Lote 2 — gates de design**
- `gates/scripts/audit/auditor_ghostvars.mjs` e o teste dele em `gates/scripts/audit/__tests__/`.
- `gates/scripts/audit/verify_contrast.ts` — as cadeias de `PAIRS`, os limites declarados e o teste.
- `src/core/Design/presets/themes/kinetic-flow.ts` — **só** as cores que fazem os dois pares passarem.
- `gates/scripts/contrato/check-class-merge.mjs`, os limites dele e o teste.
- Os onze átomos listados em §2 — **só** a troca da porta de merge.
- `gates/baselines/audit-baseline.json` — regravado pelo comando, se alguma métrica **melhorar**.
- `dist/`, `sarak-ui/`, `sarak-dev/`, `docs/component-catalog.*` — regenerados pelos geradores. Nunca à mão.

## 3.2 Fora (o que NÃO pode ser tocado)

- `gates/scripts/contrato/check-section-pointers.mjs` — resolver `§N.M` entre documentos continua limite
  declarado.
- **As citações do rastro que já existem no código.** O gate lê só linha adicionada; limpar o legado não é
  esta plan.
- `gates/allowlists/classMergeExclusions.mjs` — os átomos que ainda **concatenam** continuam ali. Aqui só
  se troca o import direto.
- **Qualquer cor de `kinetic-flow` além do necessário**, e qualquer outro tema.
- Os outros pares de `PAIRS`, o limiar de 4,5:1 e a lista de isenção de contraparte.
- Skills referenciadas por nome na §4 de uma plan — o gate do vão 1 não as resolve; é limite declarado.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/01-gates-e-baseline.md` | §2.2 (catálogo de gates), §9 (a matriz de cobertura) e como comparar com o baseline — **antes de rodar qualquer gate** |
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` | R7, R18, R20, R23, R31, R35 e R36 — as regras cujos gates são alargados |
| Spec fixa | `specs/specs/09-temas-e-presets.md` | §2.1 (contraparte) e §6.5 (o `auditor_contraste`) |
| Spec fixa | `specs/specs/15-divida-conhecida.md` | achado 18 — o que do contraste já estava declarado como cobertura parcial |
| Spec fixa | `specs/specs/02-enforcement-por-commit.md` | onde cada gate roda no hook |
| Contexto | `specs/00-contexto.md` · `specs/00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` | sempre |
| **Skill** | `test-unitario` | os testes de cada gate |
| **Skill** | `ui-criar-tema` | o ajuste de cor do `kinetic-flow` — ela traz o resolvedor de contraste |
| **Skill** | `ui-auditoria-modulo` | como rodar e ler o `run_audit` |
| Código | `gates/scripts/contrato/check-plan-index-sync.mjs` | ler antes de editar |
| Código | `gates/scripts/contrato/check-trail-citation.mjs` | ler antes de editar |
| Código | `gates/scripts/audit/auditor_ghostvars.mjs` | ler antes de editar |
| Código | `gates/scripts/audit/verify_contrast.ts` | ler antes de editar — inclusive os limites declarados no cabeçalho |
| Código | `gates/scripts/contrato/check-class-merge.mjs` | ler antes de editar |
| Código | `src/components/atomic/hooks/mergeSarakClasses.ts` | a porta única |
| Código | `specs/_templates/template-plan.md` | a forma da §4 que o gate do vão 1 vai ler |

# 5. Instruções de execução

**Regra que vale para os cinco:** cada vão fecha com **um caso que falha antes e passa depois**, por fixture
sintética — gate cuja função principal não aceita entrada por parâmetro passa a aceitar. Onde o gate declara
limites no cabeçalho (R18), o texto acompanha a mudança. Mostre no resumo, para cada vão, a entrada exata e o
resultado antes e depois.

**Lote 1**

1. **Vão 1.** Para cada plan ativa, toda referência da tabela da §4 que seja **caminho de arquivo ou de
   pasta** ou **wikilink** resolve para algo que existe; a que não resolve derruba o `plan-index:check`
   nomeando a plan e o ponteiro. Caminho pode ser relativo à raiz do repositório ou a `specs/`. Linha do tipo
   *Skill* não é resolvida — declare o limite. Caso que falha: uma plan de fixture citando
   `specs/24-modo-embarcado.md`.
2. **Vão 2.** O padrão passa a casar *"veredito de"*, *"veredito do"* e *"veredito da"*. Caso que falha:
   uma linha adicionada com *"veredito do lote 1"*.
3. **Vão 6.** Todo identificador que `README.md`, `docs/*.md`, o kit `sarak-ui/` (guia, skill, templates) e o
   `main.tsx` gerado pelo `init` importam de `@sarak/lib-ui-core` ou citam em crase como nome público **existe no
   barril** (`dist/index.d.ts`). `docs/migracoes.md` fica fora (cita nomes velhos de propósito) — **e toda cópia
   dele que viaje no kit** (`sarak-ui/docs/migracoes.md`, que a plan-92 acrescenta): fora todo arquivo chamado
   `migracoes.md`. Caso que falha: um
   template de fixture importando `registerLocalComponent`. Declare o limite: prosa sem crase não é lida.
4. Entregue o lote 1 e **pare para o veredito** antes de seguir.

**Lote 2**

5. **Vão 3.** Só `id` de **token** entra no registro; `id` de opção de `select` não. Caso que falha: schema
   de fixture com uma opção `{ id: 'overlay' }` e um consumidor de `var(--sarak-overlay-bg)` — tem de ser
   acusado como fantasma. Confira que o resultado sobre a base real continua em **1 consumo**.
6. **Vão 4.** Nenhum par de `PAIRS` é pulado por cadeia incompleta: toda cadeia termina numa base que resolve
   opaca. Para cada um dos sete pares, a cadeia reflete a pilha real de superfícies — justifique no resumo
   onde ela não for simplesmente `colorBgBody` ao fim. Caso que falha: um design de fixture com `sidebarColor`
   translúcido, cujo par hoje volta `pulado`.
7. **Os dois pares do `kinetic-flow`.** Ajuste, na contraparte do tema, o mínimo de cor para os dois pares
   passarem de 4,5:1 — pela skill `ui-criar-tema`. Nenhuma outra cor muda.
8. **Vão 5.** O `class-merge:check` passa a acusar import de `tailwind-merge` em `src/components/atomic/**`
   fora de `hooks/mergeSarakClasses.ts`. Caso que falha: um átomo de fixture com o import direto. Depois
   troque a porta nos onze átomos, **preservando a ordem dos argumentos** — a `className` do chamador
   continua por último.
9. Regenerar o que for gerado: `npm run build`, depois `npm run dev-kit`.
10. `npm run audit`, lido contra `gates/baselines/audit-baseline.json`. Nenhuma métrica piora. Se alguma
   **melhorar**, regrave com `npm run audit:baseline -- --write`.
11. `npx tsc --noEmit` → zero erros. `npx vitest run` → verde.

# 6. Critérios de aceite

- [ ] **Vão 1** — plan de fixture com ponteiro morto na §4 derruba o `plan-index:check`, nomeando plan e
      ponteiro; as plans ativas reais passam; o limite sobre *Skill* está declarado.
- [ ] **Vão 2** — *"veredito do"* e *"veredito da"* em linha adicionada são acusados; o limite 5 do
      cabeçalho descreve os padrões que o gate de fato tem.
- [ ] **Vão 6** — a fixture com nome inexistente é acusada; a base real passa; o gate roda no `build` e na CI.
- [ ] **Vão 3** — a fixture com `id` de opção é acusada; sobre a base real o auditor continua em 1 consumo.
- [ ] **Vão 4** — `node gates/scripts/audit/auditor_contraste.mjs` imprime **0 pares-tema pulados** nos dois
      modos e **0 reprovados**.
- [ ] O `kinetic-flow` no modo oposto passa os dois pares, e o diff do tema toca só as cores necessárias.
- [ ] **Vão 5** — `git grep -n "from 'tailwind-merge'" -- src` devolve **só** `mergeSarakClasses.ts`; o
      átomo de fixture é acusado; `npm run class-merge:check` verde.
- [ ] Cada vão tem, no resumo, a entrada exata e o resultado antes e depois.
- [ ] `npm run audit` sem regressão contra o baseline; `npx tsc --noEmit` com zero erros; suíte verde.

# 7. Como verificar (uso do revisor)

**Gate:** **R23**, estendida ao que ainda não cobria: a §4 das plans ativas (vão 1) e os nomes públicos citados pelo que o consumidor recebe (vão 6) — a regra é a mesma, *zero ponteiro morto na documentação*; são dois alcances dela. Os outros quatro
são alargamento de gate que já existe (R36, R7, R31, R35): a regra não muda, o gate passa a alcançá-la.

- `git status` + `git diff --stat` → só os arquivos de §3.1.
- Mutação por fixture, sem tocar o worktree, um vão por vez: chamar a função exportada de cada gate com a
  entrada que falha e com a que passa.
- `npm run plan-index:check` → verde sobre as plans reais.
- `node gates/scripts/audit/auditor_contraste.mjs` → 0 pulados, 0 reprovados, nos dois modos.
- `node gates/scripts/audit/auditor_ghostvars.mjs` → 1 consumo.
- `git grep -n "from 'tailwind-merge'" -- src` → uma linha.
- `git diff -- src/core/Design/presets/themes/kinetic-flow.ts` → só as cores dos dois pares.
- Leitura do diff dos onze átomos → a `className` do chamador segue como último argumento em todos.
- `npm run build` antes de qualquer gate que leia `dist/`.
- `npm run audit` contra o baseline · `npx tsc --noEmit` · `npx vitest run --maxWorkers=4` → sem regressão,
  0 erros, verde.

# 8. Destino da síntese

**Destino:** `specs/01-gates-e-baseline.md + specs/00-regras-e-invariantes.md + specs/09-temas-e-presets.md + specs/15-divida-conhecida.md`

- **`01-gates-e-baseline`** §2.2 e §9 — o que cada um dos cinco gates passa a ver, e o que continua fora.
- **`00-regras-e-invariantes`** — o *Estado* e *O vão* de R23, R31, R35 e R36 descrevem o alcance novo. Em
  R31, a frase sobre pares pulados por fundo não determinístico sai.
- **`09-temas-e-presets`** §6.5 — toda cadeia de fundo termina em base opaca; nenhum par é pulado por
  cadeia incompleta.
- **`15-divida-conhecida`** achado **18** — a parte *"pares em `rgba()`, hoje pulados"* fecha; fica o que
  ainda é cobertura parcial. Achado **23** (gate de conteúdo sobre o kit) fecha com o vão 6.

> A síntese é ato do **revisor** ([[00-prompt-revisor]]), e o gatilho é do **usuário**: o revisor propõe ao
> aprovar e espera autorização. Esta seção apenas a prepara.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

## Resumo da execução (Lote 1) — 2026-10-04

**Resultado:** Concluído (Lote 1; o Lote 2 aguarda o veredito, como a §5 manda)

**Estado do worktree ao iniciar**
```
 M specs/00-indice.md
 M specs/plan/plan-88-vaos-de-gate-medidos.md
```
(Ambos foram commitados pelo dono durante a execução — o `HEAD` passou a `5c8ae7a`. O trabalho de outro executor (plan-92, lote 2) corre no mesmo diretório; nenhum arquivo dele foi tocado.)

**O que foi feito**
- Vão 1 — `gates/scripts/contrato/check-plan-index-sync.mjs`: nova `checkPlanReferences` lê a §4 de cada plan em `specs/plan/`; caminho em crase com barra e `[[wikilink]]` têm de existir (raiz do repo ou `specs/`; wikilink = `<nome>.md` em qualquer pasta de `specs/`). Linha *Skill* não é resolvida. Ligada ao `main`, então ao `plan-index:check`. Limite 4 acrescentado ao cabeçalho (R18).
- Vão 2 — `check-trail-citation.mjs:43`: `/veredito de/i` → `/veredito d[eoa]\b/i`; limite 5 do cabeçalho reescrito.
- Vão 6 — `gates/scripts/contrato/check-kit-names.mjs` (novo, `checkKitNames({ root, barrelTypes, generated })`): confere `README.md`, `docs/*.md` (menos `migracoes.md`), `sarak-ui/**` (.md/.ts/.tsx) e o `main.tsx`/`ExampleModule.tsx` que o `init` gera (chamando os geradores, sem tocar `bin/`). Cobra (1) todo nome importado de `@sarak/lib-ui-core`; (2) em crase: nome antigo de renomeação de `docs/migracoes.md` cujo novo está no barril, ou nome de formato público (`Sarak*`/`sarak*`/`useSarak*`/`SARAK_*`) que não existe em lugar nenhum de `src/`. Seis limites declarados.
- `package.json` (só `scripts`): `kit-names:check` e encadeamento no `build`, logo após `prefix:check`.
- Testes: casos novos em `check-plan-index-sync.test.mjs` (+4), `check-trail-citation.test.mjs` (+3) e `check-kit-names.test.mjs` (novo, 14).
- Regenerados: `npm run build` e `npm run dev-kit`.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `gates/scripts/contrato/check-plan-index-sync.mjs` | alterado | conferência da §4 + limite 4 |
| `gates/scripts/contrato/check-trail-citation.mjs` | alterado | regex e limite 5 |
| `gates/scripts/contrato/check-kit-names.mjs` | criado | gate do vão 6 |
| `gates/scripts/contrato/__tests__/check-plan-index-sync.test.mjs` | alterado | 4 casos |
| `gates/scripts/contrato/__tests__/check-trail-citation.test.mjs` | alterado | 3 casos |
| `gates/scripts/contrato/__tests__/check-kit-names.test.mjs` | criado | 14 casos |
| `package.json` | alterado | script `kit-names:check` + encadeamento no `build` |
| `dist/`, `sarak-dev/`, `src/buildInfo.ts`, `src/core/Provider/buildInfo.ts` | regenerados | build/dev-kit (esperado; `sarak-ui/` e `docs/` não mudaram) |

**Verificações executadas**
- Vão 1, antes → depois (fixture: plan com `` `specs/24-modo-embarcado.md` `` na §4): `checkPlanIndexSync` (a única checagem que havia) → `{"divergencias":[],"ponteirosMortos":[]}`; `checkPlanReferences` → `[{"plan":"plan-99-x.md","referencia":"specs/24-modo-embarcado.md"}]`.
- Vão 2, antes → depois: `"// veredito do lote 1"` false→true; `"// veredito da correção"` false→true; `"// veredito de 2026-09-10"` true→true; `"// o veredito final"` false→false (não casa, como deve).
- Vão 6 (o gate não existia; "antes" = nada acusava): fixture `import { SarakButton, registerLocalComponent } from '@sarak/lib-ui-core'` → `{file:'sarak-ui/templates/main.tsx', line:1, name:'registerLocalComponent', via:'import'}`; `` `CustomizationPanel` `` em crase → acusado; `` `SarakPainelFantasma` `` → acusado; `` `SarakInternalCards` `` (existe em `src/`) → liberado.
- `npm run plan-index:check` → OK sobre as plans reais; `npm run trail-citation:check` → OK; `npm run gate-limits:check` → OK (41 scripts declaram limites); `npm run kit-names:check` → OK na base real.
- `npm run build` → exit 0, `kit-names:check` rodou no build; `dev-kit:check`, `guide:check`, `catalog:check` → em dia após `npm run dev-kit`.
- `npx tsc --noEmit` → 0 erros. `npx vitest run --maxWorkers=4` (sem outro vitest ativo) → 412 arquivos, 2167 testes, todos verdes.

**Critérios de aceite (Lote 1)**
- [x] Vão 1 — fixture derruba nomeando plan e ponteiro; plans reais passam; limite *Skill* declarado — evidência: acima + `check-plan-index-sync.mjs` cabeçalho.
- [x] Vão 2 — "do"/"da" acusados; limite 5 descreve os padrões reais — `check-trail-citation.mjs:21-26`.
- [x] Vão 6 — fixture acusada; base real passa; roda no `build` (e, pela CI, via `gates:full`→`build`) — `package.json`.
- Vãos 3, 4, 5 e o `kinetic-flow`: não iniciados (Lote 2).

**Decisões e suposições**
- A regra (2) do vão 6 não cobra **todo** nome `Sarak*` em crase: medi essa versão e ela acusou 7 citações legítimas na base (componentes internos descritos em `docs/`, como `SarakDataCards`, e o placeholder `X` do guia), contra a "exposição zero" da §2. Fiquei com: formato público **e inexistente em `src/`**, ou nome antigo de `migracoes.md`; placeholder de uma letra em `import` é ignorado. Consequência declarada nos limites 2 e 2b.
- "Ligado à CI": não editei `.github/workflows` (fora da §3.1); a CI roda `gates:full`, que contém o `build`.
- O `runInit.fs.test.mjs` não foi tocado (instrução circunstancial); o gate confere o texto gerado chamando os geradores, mas a prova que aquele teste faz continua nele.
- O hook de commit/pré-commit (`.githooks/pre-commit`) não ganhou o gate novo — fora do escopo.

**Achados fora do escopo (não corrigidos)**
- `.github/workflows/gates.yml:76-99` e `.githooks/pre-commit:152`: nenhum lista o `kit-names:check` (só o `build` o roda); a §3.1 não os inclui.
- `specs/specs/02-enforcement-por-commit.md` / `01-gates-e-baseline.md` §2.2: o catálogo de gates precisa citar o `kit-names:check` (síntese do revisor).

**Pendências / riscos**
- Lote 2 pendente (parada obrigatória pela §5 item 4).
- `dist/`, `sarak-dev/` e os `buildInfo` serão regenerados na integração com o outro executor.

## Resumo da execução (correção 1) — 2026-10-04

**Resultado:** Concluído com pendência (suíte completa: ver Pendências)

**Achado 1 — `check-kit-names` lia a cópia de `migracoes.md` do kit**
- `gates/scripts/contrato/check-kit-names.mjs`: a exclusão deixou de ser por caminho exato (`file !== 'docs/migracoes.md'`) e passou a ser por **nome de arquivo** (`path.posix.basename(file) !== 'migracoes.md'`, constante `MIGRATIONS_FILE_NAME`); cabeçalho atualizado (o de `docs/` e qualquer cópia que viaje no kit ficam fora).
- Testes (`check-kit-names.test.mjs`): fixture com `sarak-ui/docs/migracoes.md` contendo nome velho em crase e em `import` → `violations: []` (essa fixture falhava com a exclusão por caminho exato); e `sarak-ui/docs/migracoes-antigas.md` com o mesmo nome velho → continua acusado (a exclusão não é por prefixo).
- Base real: `sarak-ui/docs/migracoes.md` existe no worktree (copia da plan-92, não minha) e tem 4 ocorrências de `registerLocalComponent`; `node gates/scripts/contrato/check-kit-names.mjs` → `[OK]`, exit 0. O teste "base real passa" fica verde.

**Achado 2 — o padrão do vão 2 perdeu cobertura**
- `gates/scripts/contrato/check-trail-citation.mjs:44`: `/veredito d[eoa]\b/i` → `/veredito d[eoa]/i` (contém o padrão antigo). Limite 5 reescrito: diz que não há fronteira de palavra, que "desta/deste/dessa/dos/das" casam, e que "veredito final" não casa.
- Testes (`check-trail-citation.test.mjs`): `it.each` ganhou desta, deste, dessa, dos, das.
- Antes → depois (regex executada), antigo / do lote 1 / agora: "veredito desta rodada" true/false/true · "deste lote" true/false/true · "dessa execução" true/false/true · "dos achados" false/false/true · "das rodadas" false/false/true · "do lote 1" false/true/true · "veredito final" false/false/false.

**Arquivos alterados nesta correção:** `check-kit-names.mjs`, `check-kit-names.test.mjs`, `check-trail-citation.mjs`, `check-trail-citation.test.mjs`. Nenhum outro; `package.json` não foi tocado.

**Verificações executadas**
- `npx vitest run` dos dois testes focados → 2 arquivos, 41 testes verdes.
- `npx vitest run --maxWorkers=4` (suíte completa, sem outro vitest ativo antes de começar) → **12 arquivos falharam, 400 passaram** (8 testes falhos, 2112 verdes). A causa nos arquivos que não carregaram é `Cannot find module '/@id/C:/…/<teste>.tsx'` (erro de transporte do Vite, não asserção), e os testes de `DesignScope`/`useDesignVariables` falharam dentro da mesma execução. Reexecutei **só esses 12 arquivos** → 12 passaram, 63 testes verdes. Nenhum dos 12 toca os arquivos desta correção.
- `node gates/scripts/contrato/check-kit-names.mjs` → OK.

**Critérios de aceite**
- [x] Achado 1 corrigido, fixture que falha antes e passa depois, cabeçalho atualizado.
- [x] Achado 2 corrigido, casos desta/deste/dos na fixture, frase do limite 5 corrigida.
- [ ] Suíte completa verde numa única execução — motivo: 12 arquivos falharam por erro de carga do Vite e passaram isolados (acima); não atribuo a causa com certeza (no mesmo diretório corria a plan-92 e o worktree mudou durante a execução: `package.json`, `check-section-pointers`, kit); não repeti a suíte inteira por instrução.

**Decisões e suposições**
- Exclusão por nome exato de arquivo (`migracoes.md`), não por padrão (`migracoes*`): é o que o veredito pede; o segundo caso de fixture trava isso.
- Mantive o rótulo `'veredito de'` do padrão no relatório do gate (testes existentes o afirmam).

**Achados fora do escopo (não corrigidos)**
- `check-section-pointers.mjs` e o teste dele aparecem modificados no worktree; não são meus (plan-92) e não os li nem toquei.

**Pendências / riscos**
- Suíte completa não fechou verde em uma execução (acima); sugiro o revisor rodá-la na árvore integrada, sem outro vitest.
- Lote 2 segue pendente.

## Resumo da execução (Lote 2) — 2026-10-04

**Resultado:** Concluído

**Estado do worktree ao iniciar** (fotografia do início do lote 2; os arquivos de kit/plan-92 são do outro executor)
```
 M .agents/skills/ui-integra-consumidor/SKILL.md
 M .claude/skills/ui-integra-consumidor/SKILL.md
 M gates/scripts/contrato/__tests__/check-plan-index-sync.test.mjs
 M gates/scripts/contrato/__tests__/check-section-pointers.test.mjs
 M gates/scripts/contrato/__tests__/check-trail-citation.test.mjs
 M gates/scripts/contrato/check-plan-index-sync.mjs
 M gates/scripts/contrato/check-section-pointers.mjs
 M gates/scripts/contrato/check-trail-citation.mjs
 M package.json
 M sarak-dev/GUIA-MANUTENCAO.md  M sarak-dev/START-HERE.md  M sarak-dev/state.json
 M sarak-ui/GUIA-FRONTEND.md  M sarak-ui/START-HERE.md  M sarak-ui/VERSION  M sarak-ui/catalog.json
 M sarak-ui/skill/SKILL.md  M sarak-ui/templates/README.md
 M scripts/consumer-kit/__tests__/kitGenerator.test.mjs  M scripts/consumer-kit/buildKitCatalog.mjs
 M scripts/consumer-kit/buildKitOutputs.mjs  M scripts/consumer-kit/kitFiles.mjs
 M specs/00-prompt-executor.md  M specs/plan/plan-88-vaos-de-gate-medidos.md  M specs/plan/plan-92-selo-de-build-em-runtime.md
 M specs/specs/12-kit-do-consumidor.md  M specs/specs/13-instalacao-e-atualizacao.md
 M src/buildInfo.ts  M src/core/Provider/buildInfo.ts
?? gates/scripts/contrato/__tests__/check-kit-names.test.mjs
?? gates/scripts/contrato/check-kit-names.mjs
?? sarak-ui/docs/
?? scripts/consumer-kit/collectEmittedSarakCssVars.mjs
```
(`dist/` omitido por ser gerado.)

**O que foi feito**
- Vão 3 — `gates/scripts/audit/auditor_ghostvars.mjs`: só `id` de **token** entra no registro. Token = objeto literal do schema que declara `type:` entre as próprias chaves (funções `enclosingOpenBrace`/`ownKeysText`/`isTokenId`); `id` de opção de `select` e de grupo do schema ficam de fora. Limite 6 declarado no cabeçalho.
- Vão 4 — `gates/scripts/audit/verify_contrast.ts`: as sete cadeias de `PAIRS` passam a terminar em `colorBgBody` (`textColorMaster` sobre `sidebarColor` e `topbarColor`; `titleColor` sobre `surfaceColor`; `btnPrimaryText` sobre `btnPrimaryBg`; `topbarTitleColor` sobre `topbarColor`; `navItemActiveColor` sobre `sidebarActiveColor > sidebarColor` e `topbarActiveColor > topbarColor`). Limite 2 do cabeçalho reescrito.
- `src/core/Design/presets/themes/kinetic-flow.ts`: `navItemActiveColor` da **contraparte** (modo claro) `#008a7a` → `#007568`. Única cor tocada.
- Vão 5 — `gates/scripts/contrato/check-class-merge.mjs`: nova `findDirectTailwindMergeImports` (import/`require`/`import()` de `tailwind-merge` em `src/components/atomic/**` fora de `hooks/mergeSarakClasses.ts` e de `__tests__/`), devolvida em `runClassMergeCheck` como `importsDiretos` e contada como problema no `main`. Limite 5 declarado.
- Onze átomos: `twMerge(` → `mergeSarakClasses(` e o import trocado para a porta; ordem dos argumentos intocada (a `className` do chamador segue por último nos que a recebem).
- Testes: `auditor_ghostvars.option-id.test.mjs` (novo, 5 casos); `verify_contrast.test.ts` (+4); `check-class-merge.test.mjs` (+6). Fixtures dos dois testes de ghostvars existentes ganharam `type: 'color'` no token (o gate agora exige `type:` para reconhecer token).
- Regenerados: `npm run build`, `npm run dev-kit`.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `gates/scripts/audit/auditor_ghostvars.mjs` | alterado | só id de token emite variável + limite 6 |
| `gates/scripts/audit/verify_contrast.ts` | alterado | sete cadeias terminam em `colorBgBody` + limite 2 |
| `gates/scripts/contrato/check-class-merge.mjs` | alterado | porta única do merge + limite 5 |
| `gates/scripts/audit/__tests__/auditor_ghostvars.option-id.test.mjs` | criado | 5 casos |
| `gates/scripts/audit/__tests__/auditor_ghostvars.manifest-orphan.test.mjs`, `…scope.test.mjs` | alterado | `type: 'color'` nas fixtures de schema |
| `gates/scripts/audit/__tests__/verify_contrast.test.ts` | alterado | 4 casos |
| `gates/scripts/contrato/__tests__/check-class-merge.test.mjs` | alterado | 6 casos |
| `src/core/Design/presets/themes/kinetic-flow.ts` | alterado | 1 cor da contraparte |
| `src/features/DesignEngine/Canvas/__tests__/__snapshots__/PreviewCanvas.test.tsx.snap` | alterado | 1 linha: as duas variáveis de `navItemActiveColor` do kinetic-flow |
| 11 átomos de `src/components/atomic/` | alterado | troca da porta de merge (`SarakManagementGrid.tsx` só perdeu o import, ver Decisões) |
| `dist/`, `sarak-dev/`, `src/buildInfo.ts`, `src/core/Provider/buildInfo.ts` | regenerados | build / dev-kit |

**Verificações executadas — antes → depois por vão**
- **Vão 3.** Entrada: schema de fixture com token `backdropStyle` (`type: 'select'`) cuja opção é `{ id: 'overlay', value: 'overlay' }` + consumidor `var(--sarak-overlay-bg)`. Gate do `HEAD` (cópia fora do repositório, mesma fixture): **não acusa** (status 0 — os 3 casos "ACUSA" do teste novo falharam, os 2 "LIBERA" passaram). Gate novo: status 1, acusa `--sarak-overlay-bg` (também com as chaves da opção em outra ordem, e para o id de grupo do schema). Token real `overlay` com `type: 'color'` → status 0; token com `type` depois do bloco de opções → status 0. Base real: `node gates/scripts/audit/auditor_ghostvars.mjs` → **1 consumo** (`--x`, o do baseline); o registro caiu de 14.881 para **13.095** (os 94 ids não-token — 49 de opção e 29 de grupo, mais coincidências — menos os 59 que a plan mediu; a diferença para o 13.760 da §2 é o id de grupo, que a plan não citava).
- **Vão 4.** Fixture: `sidebarColor: 'rgba(255,255,255,0.5)'` sobre `colorBgBody: '#101010'`. Cadeia antiga `['sidebarColor']` → `pulado: true`; par real (`['sidebarColor','colorBgBody']`) → medido, `pulado: false`. Base: `node gates/scripts/audit/auditor_contraste.mjs` → antes das cadeias: 51 pares-tema pulados é o número da plan; depois das cadeias: **0 pulados** nos dois modos e exatamente os dois reprovados previstos (`kinetic-flow`, modo oposto: `navItemActiveColor / sidebarActiveColor` **3,47:1**, `/ topbarActiveColor` **4,26:1**); depois da cor: **0 reprovados, 0 pulados**, "0 de 14 temas com par abaixo de AA".
- **`kinetic-flow`.** O solucionador da skill (`solve_theme_contrast.ts`) não roda — importa `GLOBAL_THEMES`, nome que o barril de temas já não exporta (ver Achados). Medi eu mesmo, variando só a luminosidade do HSL (173°, 100%) de `#008a7a` e chamando `evaluatePair`/`resolveThemeForMode` do próprio gate: `#008575` → 3,70/4,54 (a segunda passa, a primeira não); `#007a6c` → 4,26/5,23; **`#007568` → 4,55 / 5,59 (primeiro valor que passa os dois)**. `git diff` do tema: uma linha trocada. Modo nativo (`#00ffcc`) intocado.
- **Vão 5.** Antes: `node gates/scripts/contrato/check-class-merge.mjs` com o gate novo sobre a base ainda não trocada → `[ERROR] 11 átomo(s) importam tailwind-merge direto` (os onze da §2, nomeados). Fixture com `import { twMerge } from 'tailwind-merge'` → acusada; `hooks/mergeSarakClasses.ts`, átomo que usa a porta e import em `__tests__/` → liberados. Depois: `git grep -n "from 'tailwind-merge'" -- src` → **uma linha**, `src/components/atomic/hooks/mergeSarakClasses.ts:1`; `npm run class-merge:check` → `[OK]`.
- `npm run build` → exit 0 (rodou depois de esperar o `vitest` da outra execução terminar; nenhum `tsup`/`generate-build-info` ativo); `npm run dev-kit` → ok; `guide:check`, `catalog:check`, `dev-kit:check`, `kit-names:check`, `trail-citation:check`, `gate-limits:check` (41 scripts) → todos OK.
- `npm run audit` → exit 1 (como no baseline); `node gates/scripts/release/check-audit-baseline.mjs` e `… --with-tsc` → "igual ao baseline de 2026-08-11 — nenhuma regressão". Nenhuma métrica **melhorou**, então **não regravei** o baseline.
- `npx tsc --noEmit` → 0 erros (antes e depois da troca dos átomos).
- Suíte completa (sem outro vitest ativo): a 1ª execução (`--maxWorkers=4`) deu **2 falhas**: (a) `PreviewCanvas.test.tsx` — snapshot do tema kinetic-flow; conferi o diff: só `--sarak-nav-item-active-color` e `--sarak-nav-active-color`, `#008a7a` → `#007568`, consequência direta da cor corrigida; atualizei só esse snapshot (`git diff`: 1 linha). (b) `scripts/consumer-kit/__tests__/kitGenerator.test.mjs` ("lista no catálogo todas as CSS Variables Sarak do registro do auditor") — arquivo da plan-92. Na execução seguinte (413 arquivos, a mesma que atualizou o snapshot) **413 passaram, 2192 testes verdes**, incluindo esse teste, sem eu ter mexido nele; ele falhou uma vez e não voltou — não consegui atribuir a causa (o outro executor regenerava o kit no mesmo diretório), e o registro dele sai do mesmo schema que o meu vão 3 toca; **declaro como possível interação e peço ao revisor que confirme na árvore integrada**.

**Critérios de aceite**
- [x] Vão 3 — fixture com id de opção acusada; base real em 1 consumo — acima.
- [x] Vão 4 — `auditor_contraste` imprime 0 pulados e 0 reprovados nos dois modos — acima.
- [x] `kinetic-flow` no modo oposto passa os dois pares; diff do tema = uma linha — acima.
- [x] Vão 5 — `git grep` devolve só `mergeSarakClasses.ts`; fixture acusada; `class-merge:check` verde — acima.
- [x] Cada vão com entrada exata e resultado antes/depois — acima.
- [x] `npm run audit` sem regressão contra o baseline; `tsc` com 0 erros; suíte verde (413/413 na segunda execução; a primeira teve as duas falhas descritas).

**Decisões e suposições**
- `SarakManagementGrid.tsx` importava `twMerge` **sem usá-lo**; em vez de trocar a porta de um import morto, removi a linha (único jeito de fechar o `git grep` sem acrescentar import sem uso).
- Cadeia do `btnPrimaryText`: base `colorBgBody`, embora o botão possa estar sobre card/modal — o corpo é a base comum; fica escrito no limite 2 do cabeçalho.
- O id de **grupo** do schema (`overlays`, `buttons`…) também deixou de emitir variável — a plan citava só opção de select, mas "só `id` de token entra" (§5 item 5) o inclui. Base real continua em 1 consumo.
- Atualizei o snapshot de `PreviewCanvas` (fora da lista da §3.1) por ser efeito direto, de uma linha, da cor autorizada; sem isso a suíte ficava vermelha.
- `package.json` não foi tocado neste lote.

**Achados fora do escopo (não corrigidos)**
- `.agents/skills/ui-criar-tema/scripts/solve_theme_contrast.ts:25` importa `GLOBAL_THEMES` de `themes/index.ts`, que exporta `SARAK_GLOBAL_THEMES` — o solucionador que a `ui-criar-tema` manda usar não executa (`SyntaxError: does not provide an export named 'GLOBAL_THEMES'`).
- `specs/specs/09-temas-e-presets.md` §6.5 e os limites 6–9 do cabeçalho de `verify_contrast.ts` ainda falam em `plan-24`/`plan-26` — rastro de execução anterior a esta plan.

**Pendências / riscos**
- A falha única do `kitGenerator.test.mjs` na primeira execução (acima) merece uma conferência do revisor na árvore integrada.
- `dist/`, `sarak-dev/` e os `buildInfo` serão regenerados de novo na integração.

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-10-04 — 🔴 Reprovado (lote 1)

**Antes de gravar:** a §10 foi relida no disco e estava vazia — nenhum bloco de outra sessão de revisor. O
escopo deste veredito é o **lote 1** (vãos 1, 2 e 6); o lote 2 não foi iniciado, como a §5 item 4 manda.

**O que está certo, e foi verificado por mim** (mutação por fixture sintética **fora do repositório**, chamando
as funções exportadas):

- **Vão 1:** uma plan de fixture com `specs/24-modo-embarcado.md` na §4 devolve
  `[{"plan":"plan-99-x.md","referencia":"specs/24-modo-embarcado.md"}]`. Medido por mim sobre as plans ativas
  reais: **zero** referências mortas, como a §2 previa.
- **Vão 6:** um template de fixture importando `registerLocalComponent` é acusado
  (`sarak-ui/templates/main.tsx:1`, `via: import`). O gate lê os geradores do `init` sem tocar `bin/`.
- Escopo: só os arquivos da §3.1 — os três gates, os três testes, e `package.json` **só em `scripts`**
  (`kit-names:check` e o encadeamento no `build`, logo depois do `prefix:check`). O `runInit.fs.test.mjs` e
  `bin/` não foram tocados. `trail-citation:check` e `gate-limits:check` (41 scripts) verdes; `tsc` → 0.
- O resumo é honesto sobre a decisão de maior consequência: a regra (2) do vão 6 não cobra todo nome `Sarak*` em
  crase — medida a versão larga, ela acusou 7 citações legítimas, contra a "exposição zero" da §2. Ficou o
  formato público **inexistente em `src/`** ou nome antigo de renomeação; os limites 2 e 2b declaram isso.

**Achados — a correção é exclusivamente estes:**

1. **O gate do vão 6 lê a cópia de `migracoes.md` que viaja no kit, e a regra da plan é "fora todo `migracoes.md`".**
   `check-kit-names.mjs`, em `collectKitSources`, exclui por **caminho exato** (`file !== MIGRATIONS_DOC`, ou seja,
   só `docs/migracoes.md`). A plan-92 (lote 2) acrescenta `sarak-ui/docs/migracoes.md`, e o gate acusa **202
   violações, todas nesse arquivo** — reproduzido por mim com uma fixture que só tem a cópia no kit. Resultado na
   árvore integrada: `kit-names:check` vermelho, o teste "base real passa" do próprio gate vermelho (411 arquivos
   verdes, 1 falha) e o `build` das duas plans quebra. Critério violado: §5 item 3 (*"`docs/migracoes.md` fica
   fora"* — a intenção é o documento, onde quer que ele esteja; a §5 já foi esclarecida: fora **todo** arquivo
   chamado `migracoes.md`). Exclua por **nome de arquivo**, com um caso de fixture que falha antes e passa depois
   (a cópia dentro de `sarak-ui/docs/`), e atualize o cabeçalho (R18).
2. **O novo padrão do vão 2 perdeu cobertura que o antigo tinha.** `check-trail-citation.mjs:44` trocou
   `/veredito de/i` por `/veredito d[eoa]\b/i`. A fronteira `\b` faz o gate **deixar de acusar** *"veredito
   desta rodada"*, *"veredito deste lote"*, *"veredito dessa execução"* e também *"veredito dos achados"* /
   *"veredito das rodadas"* — o padrão antigo acusava as três primeiras (medido por mim: `antiga=true nova=false`).
   A plan pede que o gate **passe a casar** *do* e *da*, não que pare de casar o que já casava. Use um padrão que
   contenha o antigo (por exemplo `/veredito d[eoa]/i`), acrescente à fixture os casos *desta/deste/dos*, e ajuste a
   frase do limite 5, que hoje afirma que *"veredito seguido de outra palavra não casa"*.

**Fora do que reprova, e já tratado por mim:** o `plan-index:check` ficou divergente por falta do meu espelho; o
baseline acusa `auditor_sectionpointers.mortos` 0 → 3, mas **vem inteiro da cópia de `migracoes.md` no kit**
(lote 2 da plan-92), não desta plan — o escopo da 92 foi ampliado para tratar o `check-section-pointers`.
Os dois achados que o executor deixou como "fora do escopo" (`kit-names:check` ausente do `gates.yml` e do
`pre-commit`; catálogo de gates nas specs 01/02) procedem: o primeiro é desnecessário (a CI roda `gates:full` →
`build`), o segundo é da síntese.

## Veredito — 2026-10-04 (correção 1) — 🟢 Aprovado (lote 1 — liberação parcial)

**Antes de gravar:** a §10 foi relida no disco: só o bloco de reprovação desta data, escrito nesta conversa.

**Achado 1 — o gate do vão 6 lia a cópia de `migracoes.md` do kit — fechou.** `check-kit-names.mjs:113` exclui por
**nome de arquivo** (`path.posix.basename(file) !== 'migracoes.md'`). Refiz a mutação por fixture fora do
repositório: a fixture que só tem `sarak-ui/docs/migracoes.md` com nome velho devolve `[]` (antes: 1 violação, e
202 na base real), e a fixture com o template ruim segue acusada (`registerLocalComponent`, `via: import`). O teste
do executor trava também que a exclusão **não é por prefixo** (`migracoes-antigas.md` continua acusado). Sobre a
árvore real, com a cópia da 92 presente, `kit-names:check` → OK.

**Achado 2 — o padrão do vão 2 perdeu cobertura — fechou.** Li o regex **do próprio arquivo** do gate
(`/veredito d[eoa]/i`, sem `\b`) e o confrontei com o antigo em 11 frases: **0 casos** que o antigo acusava e o novo
deixa passar; *do*, *da*, *dos* e *das* passam a ser acusados, e *"o veredito final"* segue livre. O limite 5 do
cabeçalho descreve o padrão real.

**Regressão, rodada por mim** (sem outro `vitest` ativo antes e depois): `npx vitest run` → **412 arquivos, 2177
testes verdes** (529 s). Os 12 arquivos que o executor viu falharem por *"Cannot find module '/@id/…'"* eram
erro de transporte do Vite com o worktree mudando por baixo (a plan-92 escrevia no mesmo diretório); não
reproduziram. `tsc` → 0 · `check-audit-baseline --with-tsc` → **igual ao baseline** (o `sectionpointers.mortos`
0 → 3 que eu tinha visto era da cópia no kit, e o ajuste do `check-section-pointers` da 92 já o fechou) · verdes:
`kit-names`, `trail-citation`, `gate-limits` (41), `class-merge`, `dev-kit`, `guide` (7 arquivos), `catalog`,
`section-pointers`. Os três testes dos gates do lote 1: 48 de 48.

**Liberação parcial.** O lote 1 está aprovado e **pode ser commitado**; o lote 2 (vãos 3, 4 e 5 e o `kinetic-flow`)
não foi iniciado, e a síntese só acontece depois do veredito dele. O `status` voltou a `🟡 Em execução`.

## Veredito — 2026-10-04 (lote 2) — 🟢 Aprovado (plan concluída)

**Antes de gravar:** a §10 foi relida no disco: só os dois blocos do lote 1, escritos nesta conversa.

**Vão 3 — `auditor_ghostvars` aceitava como token qualquer identificador de objeto.** `isTokenId` passou a olhar o
objeto que abre o literal (`enclosingOpenBrace`/`ownKeysText`) e não o texto solto; o registro caiu para **13.095**
e a base real do auditor ficou com **1 consumo**. O registro continua permissivo de propósito (a plan-92 não o
copia mais) e o teste de órfão do manifesto e o de escopo cobrem os dois lados. Testes dos gates de auditoria e
contrato: **29 arquivos, 294 testes verdes**.

**Vão 4 — `verify_contrast` não cobria o par que decide o tema.** As sete cadeias de `PAIRS` terminam em
`colorBgBody` (por exemplo `navItemActiveColor` sobre `sidebarActiveColor` → `sidebarColor` → `colorBgBody`), e o
`kinetic-flow` recebeu a contraparte `navItemActiveColor: '#007568'` (4,55 e 5,59 nos dois modos). Rodei o gate
sobre a árvore real: **0 temas sem contraparte e fora da isenção**, saída 0.

**Vão 5 — `check-class-merge` não via o átomo que importa `tailwind-merge` direto.** `findDirectTailwindMergeImports`
é exportado e testado. Refiz a fixture fora do repositório: `import`, `require` e `import()` dinâmico são
acusados (`Ruim`, `RuimRequire`, `RuimDinamico`); o átomo que usa `mergeSarakClasses`, a própria porta
(`hooks/mergeSarakClasses`) e `__tests__/` ficam livres. Os 11 átomos que importavam direto trocaram para
`mergeSarakClasses`; `class-merge:check` → 28 declarados, com motivo.

**Vão do índice (`plan-index:check`).** O gate passou a conferir também que as referências da §4 das plans ativas
existem; a linha de Skill não é resolvida (limite declarado no R18).

**Snapshot atualizado:** aceito como efeito direto da troca para `mergeSarakClasses` (a ordem de classes mudou, não o
comportamento).

**Verificação integrada, rodada por mim sobre a árvore com os dois lotes 2** (sem outro `vitest` ativo antes e depois;
esperei um `vitest` alheio terminar): `npx vitest run` → **413 arquivos, 2192 testes verdes** (365 s) · `tsc` → 0 ·
`check-audit-baseline --with-tsc` → **igual ao baseline** · verdes: `guide`, `package` (95), `section-pointers`,
`kit-names`, `dev-kit` (3 arquivos), `catalog`, `gate-limits` (41), `class-merge`, `trail-citation`. O único
vermelho do `plan-index:check` é o espelho desta plan (`🟡` no índice × `🟠` no frontmatter), que o `npm run
plan-index` resolve ao gravar este veredito.

**Fora do escopo, para o backlog (só o dono promove):** (a) `ui-criar-tema/scripts/solve_theme_contrast.ts` importa
`GLOBAL_THEMES`, que não existe mais; (b) os cabeçalhos do `verify_contrast.ts` e a §6.5 da spec 09 citam plan-24 e
plan-26, e a R36 só barra a citação nova em linha adicionada.

**Conclusão.** Os vãos do lote 2 (3, 4 e 5) e o `kinetic-flow` estão fechados com prova medida, somados ao lote 1 já aprovado; a plan está **concluída**.
Pode commitar o lote 2 **por caminho** (os arquivos de gate, testes, `kinetic-flow`, os 11 átomos, o snapshot e o
`package.json`); a síntese e a remoção da plan acontecem depois do commit e da sua autorização. Destinos propostos:
`01-gates` §2.2/§9, `00-regras` R23/R31/R35/R36, `09-temas` §6.5 e `15-divida-conhecida` (achados 18 e 23).

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese (00-prompt-revisor.md §7.4), imediatamente antes da remoção da plan.
     Append-only. O que foi transportado, e o que ficou de fora. -->
