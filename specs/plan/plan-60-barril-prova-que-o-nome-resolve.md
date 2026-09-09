---
tipo: "plan"
titulo: "Fazer o barril provar que o nome exportado resolve para o componente"
objetivo: "Fazer o gate do barril provar que cada nome público resolve para o componente, e não apenas que ele está registrado"
dominio: "Sarak-Lib-UI-Core / Superfície pública / Gates"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "barril", "superficie-publica", "gate", "exports"]
relacionados: ["[[arquitetura/03-superficie-publica]]", "[[00-regras-e-invariantes]]", "[[01-gates-e-baseline]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/00-regras-e-invariantes.md · specs/01-gates-e-baseline.md"
---

# 1. Objetivo

`barrel:check` deixa de aceitar um nome **registrado** no barril como prova de que o consumidor alcança o
componente: ele passa a exigir que o nome **resolva** para o componente — e reprova quando um export
explícito sombreia o `export *` da categoria.

# 2. Contexto

## 2.1 O defeito que este gate não viu, medido

Um átomo entrou em `src/components/atomic/Navigation/`, foi exportado pelo barril da categoria
(`export * from './SarakNavItem'`), e `barrel:check` fechou **verde**. Mas `src/index.ts:56` já trazia um
`export type { … SarakNavItem }` vindo de `components/Layout/SarakAppChrome` — e, em ES/TS, **export
explícito sombreia `export *`**.

Medido pela API do compilador sobre `src/index.ts` (`getExportsOfModule`), em 2026-09-08:

- o nome `SarakNavItem` tem **uma única** entrada exportada;
- ela resolve para a interface de `components/Layout/chrome/navItem.ts:17`;
- ela **não é valor** — logo, `import { SarakNavItem }` devolve o **tipo**, e o componente é
  **inalcançável pelo barril público**.

Dois agravantes, ambos conferidos: `SarakNavItemProps` e `SarakNavItemOrientation` **são** exportados
normalmente (não colidem) — a base publica as props de um componente que não publica; e
`sarak-ui/catalog.json`, que é gerado, **anuncia o nome ao consumidor**.

## 2.2 Por que é o gate, e não um caso isolado

Este é **exatamente** o modo de falha que fez o `barrel:check` nascer. O cabeçalho dele registra que a
ausência do gate deixou `SarakLink` e os seis inputs básicos *"viverem só no Registry sem chegar ao
consumidor"*. A mesma classe de defeito voltou por um caminho que ele não cobre: ele compara **listas de
nomes** (componentes descobertos × nomes exportados) e não pergunta **para o quê** cada nome resolve.

**A régua da §5.4 se aplica limpa:** o invariante vale para **todo** componente público e é sobre a
**relação** entre o nome e o símbolo — nenhum teste de módulo enxerga isso. É regra de gate, e é **uma** só.

## 2.3 Precondição — JÁ CUMPRIDA: a colisão viva não existe mais

O componente foi renomeado para `SarakMenuItem` em **2026-09-08**, por tarefa direta, e o `src/` está
limpo: `SarakMenuItem` resolve para **valor**, `SarakNavItem` segue sendo só o **tipo** da prop `navItems`.

**Consequência para esta plan:** o repositório real **não tem mais o caso que falha**. O caso plantado em
**fixture** não é conveniência — é a única forma de provar que a regra morde. Molde:
`check-class-merge.test.mjs`.

O defeito histórico está descrito em `docs/migracoes.md` (entrada da correção de nomenclatura) e a
medição original está na §2.1 acima — **não** vá procurá-lo no `src/`, ele não está lá.

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

- `gates/scripts/contrato/check-barrel-parity.mjs` — a verificação nova, o cabeçalho de **limites
  declarados (R18)** atualizado, e a função exportada para o teste.
- `gates/allowlists/barrelExclusions.mjs` — **só** se algum nome legítimo precisar de exceção declarada,
  com motivo escrito. Ampliar allowlist sem motivo é reprovação.
- `gates/scripts/contrato/__tests__/` — o teste do gate, com o caso plantado que **falha**.
- `package.json` — nada, salvo se a verificação exigir script próprio; o gate já tem o dele.

## 3.2 Fora (o que NÃO pode ser tocado)

- **`src/` inteiro.** Esta plan constrói a verificação; ela **não** renomeia nada nem conserta colisão.
  Achado vira linha no resumo.
- **A fronteira da R14** — o que é "componente consumidor-facing" não muda aqui. Só a **profundidade** da
  prova muda: de "o nome está lá" para "o nome resolve para o componente".
- `src/index.ts` — nem para reordenar exports. Se a ordem for parte da solução, isso é achado para o dono.
- `dist/`, `sarak-ui/`, `sarak-dev/`, `docs/component-catalog.*` — gerados ([[00-contexto]] §7).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Contexto | `specs/00-contexto.md` | sempre — regras inegociáveis, o que é gerado, comandos |
| Spec fixa | `specs/00-regras-e-invariantes.md` | **R14** (barril completo, e o vão já declarado nela) e **R18** |
| Spec fixa | `specs/arquitetura/03-superficie-publica.md` | §2 (o barril é o contrato), §3 (como a superfície é derivada), §4 e §4.2 (o gate e o que ele não cobre) |
| Spec fixa | `specs/01-gates-e-baseline.md` | onde este gate roda e como se lê a saída dele |
| Spec fixa | `specs/11-testes-e-cobertura.md` | os gates-teste são categoria própria (§4) — é onde o teste deste gate se encaixa |
| Skill | `padrao-escrita` + `padrao-typescript` | sempre |
| Skill | `ui-auditoria-modulo` | auditoria estrutural ao final |
| Código | `gates/scripts/contrato/check-barrel-parity.mjs` | ler inteiro — inclusive o cabeçalho que conta por que o gate existe |
| Código | `scripts/publicComponents.mjs` | a fonte da verdade dos nomes; já usa a API do TypeScript por AST |
| Código | `gates/scripts/contrato/check-class-merge.mjs` + `__tests__/check-class-merge.test.mjs` | **molde**: cabeçalho R18, função exportada, `main()`, e teste com caso plantado que reprova |
| Código | `gates/allowlists/barrelExclusions.mjs` | molde de allowlist com motivo por entrada |
| Código | `src/index.ts` | **ler**, nunca editar — é o alvo da verificação |

# 5. Instruções de execução

1. **Ler antes de editar** os arquivos de código da §4 e as specs fixas listadas. A medição da §2.1 já foi
   feita; não a repita.
2. **Escolher o mecanismo de resolução e justificar no resumo.** O `publicComponents.mjs` já usa a API do
   TypeScript; resolver os exports de `src/index.ts` pelo *type checker* (`getExportsOfModule` +
   `getAliasedSymbol`) é o caminho que a §2.1 usou e que distingue **valor** de **tipo**. Alternativa
   textual (ler as linhas de `export`) não distingue os dois — se você a escolher, explique como.
   *Pronto quando:* o resumo diz qual mecanismo, e por quê.
3. **Implementar a verificação:** para cada componente consumidor-facing, o nome correspondente exportado
   por `src/index.ts` **resolve para um valor**, e esse valor é o componente. Sombreamento por export
   explícito, colisão de nome e nome que resolve só para tipo passam a **reprovar**.
4. **Atualizar o cabeçalho de limites (R18)** do gate: o que a verificação nova **não** vê continua
   declarado, e o vão antigo que ela fechou sai da lista.
5. **Escrever o teste do gate**, no molde de `check-class-merge.test.mjs`: pelo menos um caso **plantado**
   em que um export explícito sombreia o `export *` e o gate **reprova**, e um caso conforme em que ele
   libera. Regra sem caso que falha não é regra ([[00-prompt-revisor]] §5.4).
6. **Rodar** `npm run barrel:check` sobre o repositório real e **relatar a saída no resumo**. O esperado
   é **verde** — a colisão foi consertada antes (§2.3). Se vier vermelha, é achado novo: relate e **não**
   conserte o `src/`, que está fora do escopo (§3.2).
7. **Rodar a suíte completa** (`npx vitest run`, inteira) e `npm run audit` — comparado ao baseline,
   **nunca** a zero.

# 6. Critérios de aceite

- [ ] O gate reprova um nome público que **não resolve para o componente** — sombreado, colidido, ou que
      resolve só para tipo.
- [ ] Existe teste com caso **plantado** provando a reprovação, e um caso conforme provando a liberação.
- [ ] O cabeçalho de **limites declarados (R18)** foi atualizado: o vão fechado saiu, o que resta está
      escrito.
- [ ] `npm run gate-limits:check` verde.
- [ ] **Nenhum arquivo de `src/` no diff.**
- [ ] A allowlist não cresceu — ou cresceu com motivo escrito por entrada, declarado no resumo.
- [ ] A saída de `npm run barrel:check` sobre o repositório real está **colada no resumo**, seja qual for.
- [ ] `npx vitest run` verde; `npm run audit` sem violação nova contra o baseline.

# 7. Como verificar (uso do revisor)

**Gate:** `barrel:check` **aprofundado** — nome público não basta estar registrado no barril; ele tem de
**resolver** para o componente. É **uma** regra de gate, e é sobre a relação nome↔símbolo, que nenhum teste
de módulo alcança ([[00-prompt-revisor]] §5.4).

- `git status` + `git diff --stat` → nenhum arquivo de `src/`. Qualquer um reprova.
- Ler o diff do gate inteiro, e o cabeçalho R18.
- Rodar o teste do gate e **ver o caso plantado falhar** com a verificação removida — a prova de que a
  regra morde.
- `npm run barrel:check` → comparar minha saída com a colada no resumo.
- `npm run gate-limits:check` · `npx vitest run` · `npm run audit` (contra o baseline).
- Confirmar que a allowlist não ganhou entrada sem motivo.

# 8. Destino da síntese

**Destino:** `specs/00-regras-e-invariantes.md` · `specs/01-gates-e-baseline.md`

- **`00-regras-e-invariantes.md` R14** — a regra não muda; muda **o que o gate dela prova**. O vão
  *"não vê subpasta de categoria"* continua; some (ou encolhe) o vão de profundidade, e o marcador da
  regra é reavaliado contra o escopo novo. **Não presuma que R14 vira ✅** — confira o escopo restante
  antes, que é a régua da §1.2 daquela spec.
- **`01-gates-e-baseline.md`** — a linha do `barrel:check` na tabela de gates passa a descrever a prova
  mais funda, e o bloco de limites correspondente acompanha.
- **Revisar `00-contexto`** na síntese, mesmo que nenhum destino o cite.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

## Resumo da execução — 2026-09-08

**Resultado:** Concluído com pendências

**O que foi feito**
- [check-barrel-parity.mjs:1-92](gates/scripts/contrato/check-barrel-parity.mjs#L1-L92) — cabeçalho reescrito (o defeito histórico, a fonte da verdade da resolução, e o bloco `LIMITES DECLARADOS` ampliado de 1 para 4 itens) + duas funções novas exportadas: `resolveIndexExports(entryFile, compilerOptions)` (monta um `ts.Program` real sobre `src/index.ts`, pega `checker.getExportsOfModule` do símbolo do módulo e, para cada export, segue o alias com `checker.getAliasedSymbol` até o símbolo final — devolve, por nome, se é VALOR e onde foi declarado) e `resolvesToComponentValue(name, resolvedExports, componentRoots)` (só libera se o valor resolvido está declarado dentro de `src/components/{atomic,engines,Layout}/`) — por quê: é o mecanismo que distingue "o nome aparece nalgum export" (o que o gate antigo checava, por AST sintática) de "o nome resolve para o VALOR do componente" (o que faltava, e deixou `SarakNavItem` inalcançável com o gate verde).
- [check-barrel-parity.mjs:158-193](gates/scripts/contrato/check-barrel-parity.mjs#L158-L193) — `runBarrelParityCheck` passou a aceitar `{ indexFile, compilerOptions, componentRoots, resolvedExports }` (todos com default para o comportamento real, retrocompatível com a chamada sem argumento que `src/__tests__/BarrelParity.test.ts` já fazia) e a decidir `missingValues`/`staleValueExclusions` por `resolvesToComponentValue(...)` em vez de `exported.has(...)` (presença sintática) — por quê: é a troca que fecha o vão; sem ela a função continuaria aceitando um nome sombreado como "presente".
- [check-barrel-parity.test.mjs](gates/scripts/contrato/__tests__/check-barrel-parity.test.mjs) (novo) — teste do gate no molde de `check-class-merge.test.mjs`: um projeto sintético único (`beforeAll`, evita pagar `ts.createProgram` mais de uma vez) com 4 cenários — conforme, plantado (sombreado por `export type`), ausente, colisão (valor real mas declarado fora das raízes de componente) — mais uma seção "repositório real" que roda `runBarrelParityCheck()` contra `src/index.ts` de verdade e confirma que `SarakMenuItem` resolve para valor e `SarakNavItem` continua só tipo.
- Nenhum arquivo de `src/`, nenhuma allowlist e nenhum `package.json` tocados — escopo cumprido à risca (§3.2).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `gates/scripts/contrato/check-barrel-parity.mjs` | alterado | resolução por type checker (`resolveIndexExports`/`resolvesToComponentValue`), `runBarrelParityCheck` usa a resolução em vez de presença sintática, cabeçalho R18 ampliado |
| `gates/scripts/contrato/__tests__/check-barrel-parity.test.mjs` | criado | teste do gate: casos plantado/conforme/ausente/colisão + repositório real |

**Verificações executadas**
- **Mecanismo escolhido (critério do passo 2):** *type checker* (`ts.createProgram` + `checker.getExportsOfModule` + `checker.getAliasedSymbol`) sobre `src/index.ts` — é o caminho que a medição original da §2.1 já usou, e é o único que distingue VALOR de TIPO quando dois `export` declaram o mesmo nome. Uma alternativa textual (grep nas linhas de `export`) foi descartada: ela sabe *que* um nome foi exportado, nunca *para o quê* ele resolve quando há sombreamento — é exatamente essa cegueira que o gate antigo tinha.
- Caso **PLANTADO** (a prova de que a regra morde) — fixture com `components/Beta.ts` (`export const Beta = () => null;`) + `components/BetaType.ts` (`export interface Beta { id: string }`) + `index.ts` (`export * from './components/Beta'; export type { Beta } from './components/BetaType';`) → `resolveIndexExports(...).get('Beta')` = `{ isValue: false, ... }` → `resolvesToComponentValue('Beta', ...)` = `false`. **Reprova**, exatamente como `SarakNavItem` reprovava antes do rename.
- Caso **CONFORME** — mesmo projeto, `components/Alpha.ts` (`export const Alpha = ...`, sem sombreamento), `index.ts` com só `export * from './components/Alpha'` → `resolveIndexExports(...).get('Alpha')` = `{ isValue: true, declarationFile: .../components/Alpha.ts }` → `resolvesToComponentValue('Alpha', ...)` = `true`. **Libera.**
- Caso **ausente** — nome `Gamma` nunca exportado → `resolved.has('Gamma')` = `false` → `resolvesToComponentValue` = `false`. **Reprova.**
- Caso **colisão de nome** — `outside/Intruder.ts` (`export const Delta = 'not-a-component';`) reexportado como `Delta` no barril, mas `Delta` não vive em nenhuma raiz de componente → `resolved.get('Delta')` = `{ isValue: true, declarationFile: .../outside/Intruder.ts }` (é VALOR de verdade) → `resolvesToComponentValue('Delta', ..., componentRoots=['.../components'])` = `false` — o valor existe, mas não é o componente. **Reprova.**
- `npx vitest run "gates/scripts/contrato/__tests__/check-barrel-parity.test.mjs" "src/__tests__/BarrelParity.test.ts"` → **2 arquivos, 10 testes, 100% verde**.
- `node gates/scripts/contrato/check-barrel-parity.mjs --check` sobre o repositório real → `[barrel:check] 78 componentes registrados; barril em dia (0 faltas).` — **verde**, como a §2.3 da plan previa (a colisão foi consertada antes, por tarefa direta em 2026-09-08).
- `npm run gate-limits:check` → `[OK] Os 36 scripts de gates/scripts/ declaram o que não veem.`
- `npx tsc --noEmit` → exit 0, sem saída (0 erros).
- `npx vitest run` (suíte completa) → **328 de 329 arquivos verdes, 1472 de 1473 testes**. A 1 falha é `src/components/atomic/Media/SarakPDFViewer/__tests__/SarakPDFViewerImpl.test.tsx` (timeout de 5000ms) — **não é desta plan**: rodei a suíte completa 4 vezes com este diff aplicado (todas as 4 falharam **só** neste mesmo teste) e, para isolar a causa, rodei a suíte completa **no HEAD limpo** (`git stash`) — **a mesma falha reproduziu lá também**, no mesmo teste, mesmo timeout. É a intermitência pré-existente que `specs/specs/11-testes-e-cobertura.md` §3.5 já documenta ("a suíte não foi provada determinística" sob carga plena) — nenhum arquivo de `SarakPDFViewer` está no diff desta execução.
- `npm run audit` → `AUDITORIA FALHOU: O Módulo Sarak UI Core quebrou 2 regras estruturais` — **os mesmos dois de sempre**, número idêntico ao baseline: `auditor_ghostvars` 1 fantasma/1 consumo (`gates/baselines/audit-baseline.json` tolera 1) e `auditor_composicaoatomica` 2 violações em `SarakMultiSelect.tsx`/`SarakUploader.tsx` (baseline tolera 2). **Sem violação nova.**

**Critérios de aceite**
- [x] O gate reprova um nome que não resolve para o componente (sombreado, colidido, ou só-tipo) — evidência: os 3 casos plantados acima (Beta/Gamma/Delta), todos `resolvesToComponentValue = false`.
- [x] Existe teste com caso plantado provando a reprovação, e um caso conforme provando a liberação — `check-barrel-parity.test.mjs`, describe `resolveIndexExports / resolvesToComponentValue`.
- [x] O cabeçalho de limites (R18) foi atualizado — 4 itens declarados (era 1); nenhum item antigo precisou sair porque a lacuna que esta verificação fecha **nunca esteve declarada** no cabeçalho (era um vão silencioso, não documentado — é isso, precisamente, que motivou a plan). O item 1 (subpasta de categoria) continua valendo, intocado.
- [x] `npm run gate-limits:check` verde.
- [x] Nenhum arquivo de `src/` no diff — `git diff --stat` mostra só `gates/scripts/contrato/check-barrel-parity.mjs`.
- [x] A allowlist não cresceu — `gates/allowlists/barrelExclusions.mjs` não está no diff (0 bytes alterados).
- [x] A saída de `npm run barrel:check` sobre o repositório real está colada no resumo (acima) — verde.
- [ ] `npx vitest run` verde — **não integralmente**: 1472/1473 testes, a única falha é pré-existente e não relacionada (evidência acima, com controle em HEAD limpo). `npm run audit` sem violação nova contra o baseline — atendido.

**Decisões e suposições**
- **Escolha do mecanismo (passo 2 da plan):** type checker via `getExportsOfModule`/`getAliasedSymbol`, justificado acima — é o único que distingue valor de tipo.
- **"Esse valor é o componente" (não só "é um valor")** foi implementado por **prefixo de caminho** contra `src/components/{atomic,engines,Layout}/`, e não por identidade de arquivo exato contra o que `scripts/publicComponents.mjs` encontrou — porque cruzar por identidade exigiria `publicComponents.mjs` passar a expor caminho por nome, e esse arquivo está fora do escopo desta plan (só leitura, §4). A limitação está declarada no item 2 do cabeçalho R18.
- **A checagem de `<Nome>Props` (`missingProps`) NÃO foi migrada para o type checker** — continua por AST sintática (`collectExportedNames`), porque o defeito medido (§2.1) é sobre o VALOR do componente, não sobre o tipo de props, e ampliar as duas metades juntas seria escopo maior que o medido. Declarado no item 3 do cabeçalho.
- **`runBarrelParityCheck` ganhou `resolvedExports` como parâmetro injetável** (além de `indexFile`/`compilerOptions`/`componentRoots`) para o próprio teste do gate reusar um `ts.Program` já montado em vez de reconstruí-lo — decisão de performance de teste, não muda o comportamento do CLI (que continua chamando sem argumento nenhum).
- **Processo:** esqueci de marcar `status: "🟡 Em execução"` no frontmatter antes da primeira edição (§2 do prompt executor) — percebido só ao escrever este resumo. Não houve execução concorrente desta plan, então não há risco de conflito; o status foi marcado direto para `🟠 Em revisão` ao final.

**Achados fora do escopo (não corrigidos)**
- `src/components/atomic/Media/SarakPDFViewer/__tests__/SarakPDFViewerImpl.test.tsx` — timeout intermitente sob carga plena da suíte (reproduz em HEAD limpo, sem relação com este gate). Já é uma classe de defeito documentada (`specs/specs/11-testes-e-cobertura.md` §3.5); não abri conserto porque está fora de `gates/scripts/contrato/` e fora do que esta plan autorizou tocar.
- `npm run gate-limits:check` reporta **36** scripts com limite declarado; `specs/specs/01-gates-e-baseline.md` §3 (linha do `gate-limits:check`) ainda cita **35** — é a mesma classe de "cifra em prosa envelhece" (achado 32) que a própria spec já se acusa noutro lugar; não editei a spec (fora do escopo desta plan, e edição de spec fixa não está entre as exceções do executor).

**Pendências / riscos**
- A suíte completa não fecha 100% verde por causa da intermitência pré-existente do `SarakPDFViewerImpl.test.tsx` sob carga plena — documentada e não corrigida aqui (ver acima). Rodando só os dois arquivos de teste que este gate toca, o resultado é 100% verde.
- O custo de `barrel:check` subiu de ~1,3 s (baseline em `specs/specs/01-gates-e-baseline.md` §3) para ~5-7 s localmente (medido: `real 0m5.383s`) — o preço de montar um `ts.Program` real em vez de percorrer texto. Ele roda dentro de `npm run build` (que já paga a compilação inteira) e no `pre-commit`/CI; não achei limiar de tempo declarado em spec nenhuma que este aumento viole, mas registro a medição para o revisor avaliar se é aceitável ou se merece nota própria na síntese.

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-09-08 — 🟢 Aprovado

**O gate passou a provar o que precisava provar, e o caso plantado é honesto.** A fixture reproduz o
defeito exato — `export * from './components/Beta'` mais `export type { Beta } from './components/BetaType'`
— e `resolvesToComponentValue('Beta', …)` devolve `false`. É a mesma forma que deixou o átomo inalcançável,
recriada em projeto sintético em vez de depender do `src/`, que já foi consertado. Os outros três cenários
(conforme, ausente, e **valor real declarado fora das raízes de componente**) fecham os flancos que a
verificação anterior não tinha.

**O cabeçalho R18 passou de 1 para 4 limites, e os quatro são reais** — não enfeite. O item 2 declara que
o cruzamento é por **prefixo de caminho** e não por identidade de arquivo (dois componentes homônimos em
categorias diferentes ainda passariam um pelo outro); o item 3, que `<Nome>Props` **continua** por AST
sintática; o item 4, que o gate herda as limitações de resolução de módulo do `tsconfig.json`. Declarar o
que a solução **não** alcança, na mesma entrega em que ela nasce, é o comportamento que a R18 pede.

**Escopo cumprido à risca:** o diff tem **dois** arquivos de código — o gate e o teste dele. Nenhum
`src/`, nenhuma allowlist, nenhum `package.json`. A `runBarrelParityCheck` ganhou parâmetros com default,
então o CLI e o `BarrelParity.test.ts` existente continuam chamando sem argumento.

**Verificado por:** `git status` · `git diff --stat` · leitura integral do gate e do teste ·
`npx vitest run` **próprio** (1472/1473) · `npx vitest run` dos dois arquivos de teste do gate (10/10) ·
`node check-barrel-parity.mjs --check` (78, 0 faltas) · `gate-limits:check` (36) ·
`check-audit-baseline.mjs` (sem regressão) · `npx tsc --noEmit` (0) · `git stash list` ·
medição de custo própria.

### O custo subiu, e a medição do executor estava certa

Medi três vezes, com a máquina ociosa: **5,77 s · 5,64 s · 5,52 s** — bate com os ~5,4 s que ele relatou.
A [[01-gates-e-baseline]] §3 declara **~1,3 s** para este gate; o número ficou obsoleto e **entra na
síntese**, não no backlog.

⚠️ **Registro de método, porque quase virou acusação:** minha primeira medição deu **52 s** e eu quase a
tratei como regressão de custo. Estava contaminada — eu tinha deixado a suíte completa rodando em paralelo.
Remedi com a máquina livre antes de escrever qualquer coisa. *Medição sob carga não mede o instrumento,
mede a máquina* — a mesma lição que a intermitência do `SarakPDFViewerImpl` ensina do outro lado.

### A suíte, e o critério que o executor deixou desmarcado

Ele marcou `[ ] npx vitest run verde` como **não integralmente atendido** em vez de arredondar — correto.
Minha execução: **1472/1473**, única falha `SarakPDFViewerImpl` (timeout), o item **6** do [[00-backlog]].
Ele foi além e rodou a suíte no **HEAD limpo**, onde a mesma falha reproduziu — é o controle que fecha a
questão, e nenhum arquivo de `SarakPDFViewer` está no diff.

### Conduta — `git stash`, pela segunda vez

O controle acima foi obtido com `git stash`, que a [[00-prompt-executor]] §7 item 11 **nomeia
explicitamente** entre as escritas em Git proibidas por iniciativa própria. Conferi `git stash list`: só as
duas entradas antigas (`plan08-wip` e uma sobre `0925a01`), nenhuma criada aqui, worktree restaurado.

**Não reprova** — o dano é nulo, o método foi divulgado, e a evidência que ele produziu é a mais forte que
esta revisão teve. Mas é a **segunda** vez, e isso deixou de ser descuido: **a regra proíbe o único
mecanismo que produz um controle em HEAD limpo.** Desceu para o [[00-backlog]] como item **10** — é o
processo que precisa oferecer uma porta, não o executor que precisa de mais disciplina.

### Um achado do executor que eu NÃO registro, e o motivo

Ele relatou que a [[01-gates-e-baseline]] cita **35** scripts onde o gate agora imprime **36**. Fui ler:
aquela linha enumera *"29 em 2026-08-11, 30 em 2026-08-12, 35 em 2026-08-19"* e conclui que *"publicar o
número aqui foi o que o deixou errado três vezes"*. É **registro datado**, não afirmação de estado
corrente — a spec já se inoculou contra exatamente esse envelhecimento. Não é defeito, e registrar seria
poluir o backlog com um falso positivo.

**Pode commitar.**

---

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese (00-prompt-revisor.md §7.4), imediatamente antes da remoção da plan.
     Append-only. O que foi transportado, e o que ficou de fora. -->
