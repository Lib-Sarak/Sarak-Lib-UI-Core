---
tipo: "plan"
titulo: "Construir o gate de R10 — composição atômica, com a fronteira já fixada"
dominio: "Sarak-Lib-UI-Core / Qualidade / Gates"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "gates", "r10", "composicao-atomica", "ast"]
relacionados: ["[[00-regras-e-invariantes]]", "[[01-gates-e-baseline]]", "[[plan-12-construcao-dos-gates]]", "[[plan-15-adequacao-total]]"]
depende_de: "plan-12"
destino_sintese: "specs/00-regras-e-invariantes.md · specs/01-gates-e-baseline.md · specs/02-enforcement-por-commit.md"
---

> 🔒 **Esta plan constrói UM gate. Ela não conserta nada do que ele acusar** — isso é a `plan-15`.
>
> ⛔ **Sem exceção**, herdado da `plan-12` §2.1: allowlist, carve-out ou condição para acomodar violação
> existente **reprova a execução inteira**. O vermelho vai para o baseline, não para o silêncio.

# 1. Objetivo

**R10 sai de ⏳ e passa a ser cobrada por script determinístico**, na fronteira que o dono fixou em 2026-08-05 —
e as **47 violações** que ela acusa ficam registradas no baseline, com dono e destino.

# 2. Contexto

R10 era a única regra ⏳ da `plan-12` que **não podia ser construída**, e o motivo não era técnico: o enunciado
dizia *"dentro de template ou componente pré-montado"*, que não é verificável, e citava o painel do Design
Engine como exemplo de quem já obedece por *dogfooding*.

**A medição da `plan-12` (Lote C) derrubou o exemplo:** são **111 ocorrências** de HTML nativo cru fora dos
átomos, e **64 delas dentro do próprio painel** — o exemplo que a regra dava como conforme era o maior infrator
da base.

O dono decidiu a fronteira em **2026-08-05**, e ela já está escrita em [[00-regras-e-invariantes]] R10, em
tabela: `components/**` e `core/**` valem; `atomic/Buttons|Inputs` (implementação do átomo), `features/**`
(ferramenta de autoria da própria lib) e testes/mocks não valem.

**Com a fronteira aplicada, a exposição real é 47** — `components/atomic` (fora Buttons/Inputs) 23 ·
`core/Shell` 15 · `components/Layout` 6 · `components/engines` 2 · `core/Discovery` 1.

**Esta plan não redecide nada disso.** A régua está pronta; falta o instrumento.

## 2.1 A armadilha medida, e ela custou uma reprovação errada

Uma regex do tipo `<(button|input|select)[ >/]` **perde 55 das 111 ocorrências**: o JSX mais comum escreve o
nome da tag no fim da linha —

```jsx
<button
  className="..."
>
```

— e `grep` é por linha, então não há caractere depois de `<button` para casar. Foi o erro que o revisor cometeu
no veredito da `plan-12` e que a medição do executor derrubou.

> **Consequência para esta plan: o detector é por AST, não por regex.** Um detector de linha aqui não é
> "aproximação aceitável" — ele erra por um fator de 2 e erra **para menos**, que é o pior lado.

# 3. Escopo

## 3.1 Dentro

| # | Item | Onde |
|---|---|---|
| 1 | **O detector** — nó JSX de elemento nativo `button`/`input`/`select`, por AST | `gates/scripts/audit/auditor_composicaoatomica.mjs` (novo) |
| 2 | **Entrada no `run_audit`** + parser de métrica no Anel 2 | `gates/scripts/audit/run_audit.mjs` · `gates/scripts/release/check-audit-baseline.mjs` |
| 3 | **Script `npm run`** e ligação ao `pre-commit` (Anel 1 ou 2, ver §5.4) | `package.json` · `.githooks/pre-commit` |
| 4 | **Self-test** — um caso que ele PEGA e um que ele LIBERA | `gates/scripts/audit/__tests__/` |
| 5 | **Bloco `LIMITES DECLARADOS` (R18)** no cabeçalho | o próprio detector |
| 6 | **Linha no índice de gates**, com a coluna *o que ele NÃO vê* | `gates/README.md` |
| 7 | **Baseline regravado** com a métrica nova, no MESMO commit | `gates/baselines/audit-baseline.json` |

## 3.2 Fora

- ⛔ **Corrigir qualquer uma das 47 ocorrências.** É a `plan-15`. Trocar um `<button>` por `SarakButton` aqui é
  scope creep, mesmo que seja "só um".
- ⛔ **Exceção, allowlist ou carve-out** — herdado da `plan-12` §2.1.
- ⛔ **Redecidir a fronteira.** Ela é decisão do dono, de 2026-08-05, e está em R10. Se a implementação revelar
  um caso que a tabela não resolve, **pare e pergunte** — não escolha.
- ⛔ **A metade `switch`/`case` de design no JSX.** R10 tem duas metades; esta plan constrói só a do HTML
  nativo. A outra continua ⏳ e **o limite vai declarado** (§5.5).
- ⛔ `specs/00-regras-e-invariantes.md`, `01-gates-e-baseline.md`, `15-divida-conhecida.md` — specs do revisor
  ([[00-prompt-executor]] §7.3). Escreva no resumo o que iria para lá.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/00-regras-e-invariantes.md` **R10** | **a régua** — enunciado, tabela de fronteira e o aviso da regex |
| Spec fixa | `specs/01-gates-e-baseline.md` §9 | a matriz de vãos e o vocabulário `declarado × silencioso` |
| Plan | `plan-12-construcao-dos-gates` §2.1 e §2.2 | a regra "sem exceção" e por que o baseline é a ponte |
| Código | `gates/scripts/audit/auditor_authcoupling.mjs` | **o modelo a copiar**: auditor por AST, criado na `plan-12`, com self-test e bloco de limites |
| Código | `gates/scripts/audit/auditor_arquitetura.mjs` | o precedente de varredura por `ts.createSourceFile` + `ts.forEachChild` |
| Skill | `padrao-escrita` · `padrao-typescript` · `test-unitario` | sempre |

# 5. Instruções de execução

1. **Copie a forma do `auditor_authcoupling.mjs`** — ele é o auditor por AST mais novo da base, já nasceu com
   self-test e bloco de limites. Não invente estrutura nova.
2. **Detecte por AST**: nó `JsxOpeningElement`/`JsxSelfClosingElement` cujo `tagName` seja o identificador
   **minúsculo** `button`, `input` ou `select`. Nome minúsculo é o que distingue elemento nativo de componente
   React (`<Button>` é componente). **Não use regex de linha** — §2.1.
3. **Aplique a fronteira da tabela de R10**, e só ela: varre `src/components/**` e `src/core/**`; pula
   `src/components/atomic/Buttons/`, `src/components/atomic/Inputs/`, `src/features/**`, `__tests__/`,
   `__e2e__/` e `Mocks/`.
4. **Decida onde ele se pendura, e justifique no resumo.** O Anel 1 é para gate que **deve estar sempre verde**;
   este **nasce vermelho com 47**, então o lugar natural é o **Anel 2** (baseline, via `run_audit`), como o
   `auditor_hardcoded`. Se você concluir o contrário, escreva o porquê — mas não ponha um gate vermelho no anel
   que bloqueia tudo.
5. **Declare os limites (R18)** no cabeçalho, com número medido. No mínimo: (a) que a metade `switch` de design
   **não** é coberta; (b) que `features/**` está fora **por decisão**, com a data e as 64 ocorrências que vivem
   lá; (c) o que a fronteira não resolve, se algo aparecer.
6. **Meça e registre.** Rode, confirme que acusa **47** — e se der outro número, **o número manda**: publique o
   comando, não force convergência com esta plan. *(Foi exatamente assim que o erro do revisor foi pego na
   `plan-12`.)*
7. **Regrave o baseline no mesmo commit** que o gate. Baseline sozinho no diff é o que a
   [[01-gates-e-baseline]] §6.1 proíbe.
8. **Self-test**: um `.tsx` de fixture com `<button>` num caminho coberto (tem de PEGAR) e um com `<button>` em
   `features/` ou dentro de `atomic/Buttons/` (tem de LIBERAR).

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute specs/plan/plan-16-gate-composicao-atomica.md.

Contexto obrigatório antes de começar: specs/00-contexto.md, specs/00-knowledge.md,
specs/specs/00-regras-e-invariantes.md (a R10, com a tabela de fronteira — é a régua),
specs/specs/01-gates-e-baseline.md, e a §2.1 da plan-12 (a regra "sem exceção").
Skills a aplicar: padrao-escrita, padrao-typescript, test-unitario.

O detector é por AST, NUNCA por regex de linha: uma regex com delimitador perde 55 das 111
ocorrências, porque o JSX mais comum põe o nome da tag no fim da linha. Está medido na §2.1.

Este gate NASCE VERMELHO com 47 ocorrências. Isso é o esperado: registre no baseline e siga.
NÃO conserte nenhuma delas — é a plan-15. NÃO crie allowlist, carve-out nem exceção.

A fronteira já foi decidida pelo dono (2026-08-05) e está em R10. Não a redecida. Se aparecer
um caso que a tabela não resolve, PARE e pergunte.

Não commite. Ao terminar, escreva o resumo na própria plan.
```

# 7. Critérios de aceite

- [ ] `auditor_composicaoatomica.mjs` existe, detecta **por AST** e entra em `run_audit.mjs`.
- [ ] Acusa **47** ocorrências — ou outro número, **com o comando publicado** e a divergência explicada.
- [ ] **Zero** ocorrência acusada em `features/**`, `atomic/Buttons/`, `atomic/Inputs/`, `__tests__/`,
      `__e2e__/` e `Mocks/` — a fronteira está implementada, não só escrita.
- [ ] ⛔ **Zero exceção criada**: `git diff` de `gates/allowlists/` vazio; nenhum carve-out no detector.
- [ ] ⛔ **Nenhuma das 47 corrigida** — `git diff` sem `src/**/*.tsx` de produção.
- [ ] Bloco `LIMITES DECLARADOS` presente, com a metade `switch` e o recorte de `features/**` declarados.
      `npm run gate-limits:check` continua verde, agora com 26 scripts.
- [ ] Self-test com **um caso pego e um liberado**, verde.
- [ ] Baseline regravado **no mesmo commit**; `check-audit-baseline.mjs` volta a dizer *"igual ao baseline"*.
- [ ] Linha em `gates/README.md` com comando · regra · **o que ele não vê**.
- [ ] `npx vitest run` verde; `npm run gates:full` conforme o baseline novo.

# 8. Como verificar

- `node gates/scripts/audit/auditor_composicaoatomica.mjs` → 47, e a lista com `arquivo:linha`
- Contraprova da fronteira: `grep -c` do detector em `src/features/DesignEngine` → **0 acusações**, com as 64
  ocorrências ainda lá
- `node gates/scripts/release/check-audit-baseline.mjs` → *"igual ao baseline"*
- `npm run gate-limits:check` → 26/26
- `git diff --stat` → `gates/`, `package.json`, `.githooks/`, `specs/plan/plan-16-*` — **nenhum `.tsx` de
  produção**
- `npx vitest run` → verde, com o self-test novo

# 9. Destino da síntese

**Destino:** `specs/00-regras-e-invariantes.md` (R10 de ⏳ para ✅ ou ⚠️, conforme o limite declarado) ·
`specs/01-gates-e-baseline.md` (o gate novo no catálogo e no baseline; a matriz da §9 encolhe) ·
`specs/02-enforcement-por-commit.md` (o anel em que ele se pendura)

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

## Resumo da execução — 2026-08-05

**Resultado:** Concluído.

### O que foi feito

- `gates/scripts/audit/auditor_composicaoatomica.mjs` (novo) — detector **por AST** (`ts.createSourceFile` +
  `ts.forEachChild`, modelo copiado de `auditor_authcoupling.mjs`, como a plan mandou). Acusa
  `JsxOpeningElement`/`JsxSelfClosingElement` cujo `tagName` é `Identifier` simples e igual a `button`, `input`
  ou `select` (nome minúsculo — é o que já distingue elemento nativo de componente React).
- **Fronteira aplicada, não redecidida**: varre `src/components/**` e `src/core/**`; exclui por substring de
  caminho `components/atomic/Buttons`, `components/atomic/Inputs`, `__tests__`, `__e2e__`, `Mocks`.
  `src/features/**` fica fora **por não estar no escopo varrido** (a regra não passa por lá).
- **Entra em `run_audit.mjs`** (11º auditor) e ganhou parser dedicado em `check-audit-baseline.mjs`
  (`violacoes: N` — extraído da mensagem `[ERROR] N ocorrência(s)...`).
- **Anel 2, não Anel 1** — como a instrução #4 mandava: ele nasce vermelho (47), então não pode estar no bloco
  que bloqueia qualquer vermelho. Participa do baseline via `run_audit.mjs`, igual ao `auditor_hardcoded`.
- **Self-test**: `gates/scripts/audit/__tests__/auditor_composicaoatomica.test.mjs`, 7 casos — 2 PEGOS
  (`<button>` em `core/Shell`, `<input>` em `components/Layout`) e 5 LIBERADOS (`atomic/Buttons`,
  `atomic/Inputs`, `features/`, `__tests__/`, componente `<SarakButton>` de nome maiúsculo).
- **Bloco `LIMITES DECLARADOS`** no cabeçalho: item 1 declara que só a metade "HTML nativo cru" de R10 está
  coberta (o `switch`/`case` de design continua sem detector); item 2 declara `features/**` fora por decisão do
  dono, com as 64 ocorrências nomeadas; item 3 declara a exclusão de `atomic/Buttons`/`Inputs`; item 4 declara
  o que a detecção por AST não resolve (alias, `React.createElement` fora de JSX).
- `npm run composicao-atomica:check` registrado. Linha em `gates/README.md` (tabela de gates + tabela de
  auditores), com comando · regra · o que ele não vê.
- `sarak-dev/` regenerado (17 gates agora, era 16) — `scripts/dev-kit/__tests__/devKit.test.mjs` tinha uma
  contagem de auditores hardcoded (`toHaveLength(10)`) que precisou virar `11`, mesma classe de ajuste que já
  tinha acontecido duas vezes na `plan-12` ao acrescentar auditor novo.

### O número medido, e a contraprova da fronteira

```
node gates/scripts/audit/auditor_composicaoatomica.mjs
  → 47 ocorrências — BATE com a plan, primeira tentativa, sem ajuste

grep -rnoE "<button\b|<input\b|<select\b" src/features/DesignEngine --include="*.tsx" | grep -v "__tests__|__e2e__|Mocks" | wc -l
  → 64  (confirma que as ocorrências de features/ CONTINUAM lá, não sumiram — só não são varridas)

node gates/scripts/audit/auditor_composicaoatomica.mjs | grep -c "atomic\\Buttons\|atomic\\Inputs"
  → 0  (confirma a exclusão dos diretórios de implementação do átomo)
```

**Distribuição das 47, contada por `awk` sobre a saída real do gate (não de cabeça — é o erro que a `plan-12`
já pegou uma vez):**

```
awk '/^\[FAIL\]/{f=$2;next} /^  - Line/{c[f]++} END{for (x in c) print c[x], x}' <saída do gate> | sort -rn
```

| Área | Ocorrências |
|---|---|
| `components/atomic/` (fora de Buttons/Inputs — 12 arquivos) | 23 |
| `core/Shell/Components/` (6 arquivos) + `SarakShell.tsx` | 14 + 1 = 15 |
| `components/Layout/` (2 arquivos) | 6 |
| `components/engines/chat/` (1 arquivo) | 2 |
| `core/Discovery/` (1 arquivo) | 1 |
| **Total** | **23+15+6+2+1 = 47** |

Bate exatamente com a quebra que a própria `plan-16` §2/§3.1 já citava (`atomic` 23 · `core/Shell` 15 ·
`Layout` 6 · `engines` 2 · `Discovery` 1).

### Arquivos alterados

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `gates/scripts/audit/auditor_composicaoatomica.mjs` | criado | o gate (R10) |
| `gates/scripts/audit/__tests__/auditor_composicaoatomica.test.mjs` | criado | self-test, 7 casos |
| `gates/scripts/audit/run_audit.mjs` | alterado | +1 auditor na lista |
| `gates/scripts/release/check-audit-baseline.mjs` | alterado | +1 parser dedicado |
| `gates/baselines/audit-baseline.json` | regravado | +`auditor_composicaoatomica.mjs: {violacoes: 47}` |
| `gates/README.md` | alterado | +2 linhas (tabela de gates + tabela de auditores) |
| `package.json` | alterado | +1 script (`composicao-atomica:check`) |
| `sarak-dev/GUIA-MANUTENCAO.md` `sarak-dev/START-HERE.md` `sarak-dev/state.json` | regenerados | refletem 17 gates (era 16) |
| `scripts/dev-kit/__tests__/devKit.test.mjs` | alterado | contagem de auditores 10→11 (efeito direto de registrar o 11º auditor) |
| `specs/plan/plan-16-gate-composicao-atomica.md` | alterado | este resumo + status |

**Fora desta lista, e não meus:** `specs/specs/00-regras-e-invariantes.md`, `specs/plan/plan-12-construcao-dos-gates.md`,
`specs/plan/plan-15-adequacao-total.md` e `specs/00-indice.md` aparecem no `git status` com alterações — são
edições do **revisor**, feitas ANTES desta execução começar (a reescrita de R10, o anexo de R31, a reconciliação
da `plan-15`). Não toquei nenhum deles nesta rodada; listo aqui só para o `git diff --stat` não parecer
divergente do resumo.

### Verificações executadas

- `node gates/scripts/audit/auditor_composicaoatomica.mjs` → **47**, lista com `arquivo:linha`.
- Contraprova da fronteira → **0** em `atomic/Buttons`/`atomic/Inputs`; **64** ocorrências confirmadas ainda
  vivas em `features/DesignEngine` (não removidas, só fora do escopo varrido).
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → **"igual ao baseline de 2026-08-05 —
  nenhuma regressão."**
- `npm run gate-limits:check` → **26/26** OK (era 25; +1 pelo novo script).
- `npx vitest run` completo → **289 arquivos / 1004 testes, 100% verde** (era 288/997; +1 arquivo/+7 testes,
  o self-test novo).
- `git status --short` conferido item a item contra a tabela acima; `git diff -- 'src/**/*.tsx'` → **vazio**
  (nenhuma das 47 corrigida); `git diff -- gates/allowlists/` → vazio (zero exceção criada).

### Critérios de aceite

- [x] `auditor_composicaoatomica.mjs` existe, detecta por AST, entra em `run_audit.mjs`.
- [x] Acusa 47 — bateu na primeira medição, comando publicado acima.
- [x] Zero em `features/**`, `atomic/Buttons/`, `atomic/Inputs/`, `__tests__/`, `__e2e__/`, `Mocks/` —
      contraprova rodada e colada acima.
- [x] Zero exceção criada.
- [x] Nenhuma das 47 corrigida.
- [x] Bloco `LIMITES DECLARADOS` presente (switch de design + recorte de `features/**` declarados);
      `gate-limits:check` → 26/26.
- [x] Self-test com casos pegos e liberados, verde.
- [x] Baseline regravado no mesmo lote; `check-audit-baseline.mjs` diz "igual ao baseline".
- [x] Linha em `gates/README.md` com comando · regra · o que ele não vê.
- [x] `npx vitest run` verde. `gates:full` **não rodei de ponta a ponta nesta execução** — o gate novo não faz
      parte do encadeamento de `gates:full` (`dev-kit:check && build && build-info:check && package:check &&
      coverage:check`; `npm run audit` não é chamado por ele, é invocado à parte, pelo Anel 2 do `pre-commit`).
      Verifiquei o que É relevante para este gate isoladamente (`run_audit`, `check-audit-baseline`,
      `gate-limits:check`, a suíte completa) — listado acima. Declarado como pendência abaixo, mesma decisão 4
      da `plan-12`.

### Decisões e suposições

1. **Anel 2, confirmando a sugestão da instrução #4** — não haveria como pôr um gate que nasce com 47 no bloco
   que bloqueia qualquer vermelho sem violar "sem exceção" de outra forma (silenciar o bloqueio seria a mesma
   fraude por outro caminho).
2. **Não redecidi a fronteira.** Nenhum caso apareceu que a tabela de R10 não resolvesse — todas as 47
   ocorrências caem claramente dentro de `components/**`/`core/**` fora de Buttons/Inputs; não precisei parar
   e perguntar.
3. **`specs/00-regras-e-invariantes.md`, `01-gates-e-baseline.md`, `02-enforcement-por-commit.md` não foram
   tocadas** — são do revisor (`00-prompt-executor` §7.3), mesma decisão já registrada na `plan-12`. O destino
   da síntese (R10 de ⏳ para ⚠️ — plena na metade que existe, ausente na metade `switch`) fica para a síntese.

### Achados fora do escopo (não corrigidos)

- Nenhum novo. As 47 ocorrências e as 64 de `features/` já estavam catalogadas pela `plan-12`.

### Pendências / riscos

- `gates:full` não rodado de ponta a ponta nesta execução (decisão 1 acima) — risco baixo: o gate novo só
  participa do `audit`/Anel 2, que foi verificado isolado.
- A metade `switch`/`case` de design de R10 continua sem detector — declarada, não é desta plan.

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->

## Veredito — 2026-08-05 — 🟢 Aprovado

**Aprovado sem achado.** É a primeira entrega desta campanha que passa em rodada única, e não por ser pequena:
os três pontos em que ela podia falhar — o detector, a fronteira e o número — foram os três que vieram provados.

### Reproduzido por mim, item a item

| Critério | Minha medição |
|---|---|
| Detector **por AST**, não regex | `ts.createSourceFile` (`:90`) · `ts.forEachChild` (`:77`) · `ts.isJsxOpeningElement`/`isJsxSelfClosingElement` (`:70`). **Zero** regex caçando tag no arquivo |
| Acusa **47** | `node gates/scripts/audit/auditor_composicaoatomica.mjs` → **47**, com `arquivo:linha` |
| Fronteira implementada | **0** acusações em `features/`, `atomic/Buttons/`, `atomic/Inputs/` |
| As 64 continuam vivas | **39 arquivos** de `src/features/` ainda contêm tag nativa — não foram removidas, só não são varridas |
| Entra no `run_audit` | **11 auditores** executados; `AUDITORIA FALHOU: 4 regras estruturais` — os 3 da `plan-12` + este |
| Baseline | `auditor_composicaoatomica.mjs: { violacoes: 47 }`; `check-audit-baseline --with-tsc` → **"igual ao baseline de 2026-08-05"** |
| R18 | `gate-limits:check` → **26/26** |
| Self-test | **7/7 verde**, isolado |
| Suíte completa | **289 arquivos / 1004 testes**, exit 0 — rodada por mim |
| Zero exceção | `git diff -- gates/allowlists/` **vazio** |
| Zero conserto | **nenhum `.tsx` de produção** no `git status` |

### O que eleva esta entrega acima do "cumpriu a plan"

1. **A contraprova da fronteira foi rodada nos dois sentidos.** Provar que o gate **não** acusa `features/` é
   metade; provar que as **64 continuam lá** é a outra — sem ela, "0 acusações" seria indistinguível de alguém
   ter apagado o problema. Poucas execuções desta base fizeram as duas.
2. **O bloco de limites tem uma linha que ninguém pediu, e é a melhor dele:** *"se `features/` um dia deixar de
   ser só autoria interna, este número precisa ser revisitado"* (`:16-18`). Isso transforma uma decisão do dono
   numa **condição de validade explícita** — o gate passa a dizer não só o que não vê, mas **quando parar de
   confiar** no recorte. É R18 aplicada com mais rigor do que a regra exige.
3. **`isExcluded()` normaliza `path.sep` antes do `includes`** (`:43`). Exclusão por substring com separador
   nativo é o defeito clássico que só aparece na máquina do outro; aqui não aparece porque foi previsto.
4. **O erro de soma foi pego por você, no meio da própria escrita**, e a correção veio com o `awk` sobre a saída
   real do gate em vez de recontagem de cabeça. É exatamente a classe que pegou o revisor na `plan-12`, e ela
   morreu antes de chegar ao meu veredito.
5. **A tabela de arquivos declara o que NÃO é seu** (`:258-262`) — as 4 specs que eu havia editado antes desta
   execução. É a correção de método que a `plan-02` aprendeu do jeito difícil (*"a tabela tem de ser o espelho
   do `--stat`, com a classificação como coluna, não como filtro de entrada"*), aplicada sem que ninguém
   precisasse pedir.

### Sobre o `gates:full` não rodado — não é pendência aqui

Você declarou como pendência, mas **conferi e o raciocínio está certo**:
`gates:full` = `dev-kit:check && build && build-info:check && package:check && coverage:check` — **`npm run audit`
não está nele**. O gate novo não participa daquele encadeamento; ele vive no Anel 2, via `run_audit`, e foi ali
que eu o verifiquei. **Nada a corrigir** — e vale registrar que declarar a lacuna mesmo quando ela não existe é
melhor que o inverso.

### Anel 2 — a escolha está certa, e o motivo merece ficar escrito

Você registrou que pôr um gate que nasce com 47 no Anel 1 exigiria "silenciar o bloqueio, que seria a mesma
fraude por outro caminho". É a formulação mais precisa que esta base tem do princípio: **o anel certo para um
gate é função do que ele mede hoje, não da importância da regra.** Anel 1 é para invariante que já é verdade;
Anel 2 é para dívida que não pode crescer. Trocar isso é como se fabrica um `--no-verify` habitual.

### Destino da síntese — e uma divergência que nasce agora

**Destino:** `specs/00-regras-e-invariantes.md` (**R10: ⏳ → ⚠️** — plena na metade "HTML nativo cru", ausente
na metade `switch`/`case` de design) · `specs/01-gates-e-baseline.md` (o 11º auditor no catálogo; baseline com
`composicaoatomica: 47`; a matriz da §9 encolhe) · `specs/02-enforcement-por-commit.md` (Anel 2, 11 auditores).

> ⚠️ **A partir deste commit, R10 diz "⏳ nenhum gate ainda" sobre um gate que existe.** Não é defeito desta
> execução — você não podia editar aquela spec ([[00-prompt-executor]] §7.3) — mas é uma divergência
> spec × código **viva**, e some só com a síntese. Ela entra na fila que já tem 11 plans aprovadas e nenhuma
> sintetizada.

**Liberado: pode commitar** — `auditor_composicaoatomica.mjs`, o self-test, `run_audit.mjs`,
`check-audit-baseline.mjs` e `audit-baseline.json` **no mesmo commit**, que é a exigência da
[[01-gates-e-baseline]] §6.1.
