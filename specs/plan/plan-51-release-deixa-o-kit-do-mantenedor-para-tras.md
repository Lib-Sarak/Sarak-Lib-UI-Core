---
tipo: "plan"
titulo: "Toda release publica o kit do mantenedor um release atrás"
dominio: "Sarak-Lib-UI-Core / Distribuição / Release"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "release", "npm-version", "dev-kit", "gate", "gates-full"]
relacionados: ["[[03-versionamento-e-release]]", "[[14-artefatos-do-mantenedor]]", "[[02-enforcement-por-commit]]", "[[008-releases-com-tag-e-semver-em-git]]"]
depende_de: ""
destino_sintese: "specs/specs/03-versionamento-e-release.md · specs/specs/14-artefatos-do-mantenedor.md"
objetivo: "O ritual de release passa a regenerar o kit do mantenedor junto com o resto, e deixa de emitir toda tag com o sarak-dev defasado"
---

# 1. Objetivo

`npm version` passa a deixar `sarak-dev/` **em dia no mesmo commit da tag** — como já faz com `dist/` e
`sarak-ui/`. Com isso o `gates:full` deixa de nascer vermelho depois de cada release.

# 2. Contexto

## 2.1 O defeito, medido em três tags

O gancho `version` do `package.json` é:

```
npm run guide && npm run build && git add package.json package-lock.json dist sarak-ui
```

Ele regenera o kit do **consumidor** (`guide`) e o `dist/`, e adiciona os dois ao commit da tag. **Não roda
`npm run dev-kit` e não adiciona `sarak-dev/`.** Como `sarak-dev/state.json` carimba a `version` do
`package.json`, o artefato que entra na tag fica sempre um release atrás:

| Tag | `package.json` | `sarak-dev/state.json` |
|---|---|---|
| `v4.0.1` | 4.0.1 | **4.0.0** |
| `v5.0.0` | 5.0.0 | **4.0.1** |
| `v6.0.0` | 6.0.0 | **5.0.0** |

Três tags, três defasagens. **É determinístico, não intermitente** — não depende de a leva mudar contagem
nenhuma, porque o carimbo de versão muda sozinho a cada bump.

## 2.2 Por que dói mais do que parece — o efeito é circular

`preversion` roda `gates:full`, e o **primeiro** gate do `gates:full` é o `dev-kit:check`. Logo:

```
npm version  →  tag sai com sarak-dev defasado  →  dev-kit:check vermelho
             →  a PRÓXIMA release é bloqueada pela anterior
```

Quem tenta a release seguinte é barrado por um defeito que **a release anterior criou**, roda
`npm run dev-kit` à mão, commita, e o ciclo recomeça. Foi exatamente o que aconteceu no HEAD `33fdef0`:
o revisor achou o `dev-kit:check` vermelho numa árvore **limpa**, sem ninguém ter mexido em nada.

## 2.3 O que a documentação dizia, e por que não bastava

O [[00-contexto]] §3.1 já avisava que *"o `dev-kit:check` costuma ser o primeiro a barrar"*, atribuindo a
causa a *"qualquer leva que mude contagem"*. Isso é verdade e **é a causa secundária**. A causa
determinística — o próprio ritual — não estava escrita, e por isso o bloqueio era tratado como fatalidade
periódica em vez de defeito com conserto de uma linha.

*(As três specs já foram reconciliadas pelo revisor em 2026-08-18: [[03-versionamento-e-release]] §6,
[[14-artefatos-do-mantenedor]] §5 e [[00-contexto]] §3.1 registram o defeito e apontam para esta plan. O que
falta é o conserto.)*

# 3. Escopo

## 3.1 Dentro

1. **`package.json`, gancho `version`** — passar a regenerar o kit do mantenedor e a incluí-lo no commit da
   tag, junto de `dist/` e `sarak-ui/`.
2. **Provar** que a defasagem não se reproduz — ver §5 passo 2. É o critério que vale; o resto é meio.
3. **`sarak-dev/`**, se a regeneração o mover. É artefato **gerado**: entra no diff pelo gerador, nunca à mão.

## 3.2 Fora

- ⛔ **Mudar a ORDEM dos gates do `gates:full`.** Pôr o `dev-kit:check` por último "para não barrar" é
  esconder o defeito, não consertá-lo — e é a regra anti-afrouxamento de [[01-gates-e-baseline]] §6.
- ⛔ **Tirar o `dev-kit:check` do `gates:full`.** Mesma coisa, mais explícita.
- ⛔ **Publicar `sarak-dev/` no tarball.** Ele é interno por decisão dupla ([[14-artefatos-do-mantenedor]] §6:
  fora do `files` **e** na lista de proibidos do `package:check`). Esta plan não toca nisso.
- ⛔ **Rodar `npm version`.** Publicação é do usuário ([[00-contexto]] §7). Prove por simulação, não emitindo
  release.
- ⛔ Qualquer outro gancho (`preversion`, `postversion`) — não é o defeito.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/03-versionamento-e-release.md` §6 | o ritual e a tabela das três tags |
| Spec fixa | `specs/specs/14-artefatos-do-mantenedor.md` §5 · §6 | onde o gate roda, e por que `sarak-dev/` é interno |
| Spec fixa | `specs/specs/02-enforcement-por-commit.md` §4.1 | por que `build` não vai para hook — o gancho `version` **é** o lugar onde mutar a árvore é o objetivo |
| ADR | `specs/adr/008-releases-com-tag-e-semver-em-git.md` | o gancho `version` existe para artefato e tag andarem juntos; esta plan estende isso ao kit do mantenedor |
| Código | `package.json` (`version`, `gates:full`, `dev-kit`) · `scripts/generate-dev-kit.mjs` | ler antes de editar |
| **Skill** | `padrao-escrita` | sempre |

# 5. Instruções de execução

## Passo 1 — corrigir o gancho

O gancho `version` passa a regenerar `sarak-dev/` **e** a incluí-lo no `git add`. Mantenha a ordem atual do
que já existe — `guide` e `build` continuam onde estão; o kit do mantenedor é acréscimo, não troca.

⚠️ **`npm run dev-kit` sai com 1 se houver ponteiro morto** ([[14-artefatos-do-mantenedor]] §4.3). Isso é
desejado: uma release não deve sair com o guia citando o que não existe. Não silencie esse código de saída.

## Passo 2 — provar, sem publicar

**Não rode `npm version`.** Simule o gancho e mostre que a defasagem não volta:

1. Anote a `version` corrente e a de `sarak-dev/state.json` — hoje batem.
2. Simule um bump (edite a `version` numa cópia, ou rode o gancho com a versão alterada e **reverta**),
   execute o gancho `version` como o npm o executaria, e confirme que `npm run dev-kit:check` fica **verde**
   com a versão nova.
3. **Reverta o bump simulado.** O diff final não pode conter mudança de `version` — quem versiona é o usuário.
4. Cole as duas saídas: a de antes (vermelha, se você reproduzir o estado antigo) e a de depois (verde).

> Se você concluir que não dá para simular sem sujar a árvore, **diga isso e proponha como provar** — não
> declare "corrigido" sem evidência. Alegação sem saída real é o que a [[00-prompt-executor]] §5 proíbe.

## Passo 3 — fechar

`npm run dev-kit:check` · `npm run gates:full` (ou, se o build inteiro for caro demais na sua máquina, ao
menos `dev-kit:check` + `build-info:check`, **declarando** o que não rodou) · `git diff --stat`.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute
specs/plan/plan-51-release-deixa-o-kit-do-mantenedor-para-tras.md.

Contexto obrigatório: specs/00-contexto.md, specs/00-knowledge.md,
specs/specs/03-versionamento-e-release.md §6,
specs/specs/14-artefatos-do-mantenedor.md §5 e §6,
specs/specs/02-enforcement-por-commit.md §4.1.
Skills: padrao-escrita.

O PROBLEMA, em uma frase: o gancho `version` do package.json regenera o kit do
CONSUMIDOR (`npm run guide`) e o dist/, mas NÃO o kit do MANTENEDOR (`sarak-dev/`)
— que carimba a `version` — então TODA tag publicada leva o sarak-dev um release
atrás. Medido: v4.0.1 levou 4.0.0, v5.0.0 levou 4.0.1, v6.0.0 levou 5.0.0.

POR QUE DÓI: `preversion` roda `gates:full`, cujo PRIMEIRO gate é o
`dev-kit:check`. Cada release é bloqueada pela anterior.

PASSO 1 — o gancho `version` passa a regenerar `sarak-dev/` e a incluí-lo no
`git add`, junto de dist/ e sarak-ui/. Acréscimo, não troca: `guide` e `build`
ficam onde estão.

PASSO 2 — PROVE SEM PUBLICAR. Você NÃO roda `npm version`. Simule o bump,
execute o gancho, mostre `dev-kit:check` verde com a versão nova, e REVERTA o
bump simulado — o diff final não pode mudar a `version`. Cole as saídas.
Se não der para simular sem sujar a árvore, DIGA e proponha como provar.

LINHAS VERMELHAS:
  · Você NÃO reordena nem remove o dev-kit:check do gates:full. Isso é esconder.
  · Você NÃO publica sarak-dev/ no tarball — é interno, por decisão dupla.
  · Você NÃO roda `npm version`. Publicação é do usuário.
  · Você NÃO silencia o exit 1 do `npm run dev-kit` (ponteiro morto deve barrar).
  · Você NÃO mexe em preversion nem postversion.

Não commite. Ao terminar, escreva o resumo na própria plan e mova o status para
🟠 Em revisão.
```

# 7. Critérios de aceite

- [ ] O gancho `version` regenera `sarak-dev/` **e** o inclui no commit da tag.
- [ ] A prova do passo 2 está colada: `dev-kit:check` **verde** com a versão simulada nova.
- [ ] O diff final **não** altera a `version` do `package.json` — o bump simulado foi revertido.
- [ ] `dev-kit:check` verde na árvore final.
- [ ] O `dev-kit:check` continua sendo o **primeiro** gate do `gates:full`, e continua no `gates:full`.
- [ ] `sarak-dev/` continua **fora** do `files` e na lista de proibidos do `package:check`.
- [ ] `git diff --stat` — só `package.json` e, se movido pelo gerador, `sarak-dev/`.

# 8. Como verificar (uso do revisor)

```bash
git diff --stat
git diff package.json

# o gancho passou a citar o kit do mantenedor?
node -e "console.log(require('./package.json').scripts.version)"

# a version NÃO pode ter mudado
git diff package.json | grep -E '^[-+]\s*\"version\"' && echo "REPROVA: bump nao revertido"

npm run dev-kit:check
npm run package:check          # sarak-dev/ continua proibido no tarball?
node -e "const s=require('./package.json').scripts; console.log(s['gates:full'])"
```

**O que reprova:**

- `dev-kit:check` movido, removido ou reordenado no `gates:full` — é esconder o defeito;
- `version` do `package.json` alterada no diff — o executor versionou, e versionar é do usuário;
- `sarak-dev/` aparecendo no `files` ou saindo da lista de proibidos do `package:check`;
- "corrigido" sem a prova do passo 2 — o defeito só se demonstra num bump, e alegação não é evidência;
- exit 1 do `npm run dev-kit` silenciado para o gancho "não falhar".

# 9. Destino da síntese

**Destino:** `specs/specs/03-versionamento-e-release.md` · `specs/specs/14-artefatos-do-mantenedor.md`

- **`03-versionamento-e-release.md` §6** — a tabela dos três ganchos ganha o kit do mantenedor na linha do
  `version`, e o bloco 🔴 que hoje descreve o defeito passa a descrever o **fecho**, preservando a tabela das
  três tags como registro do que aconteceu (é ela que impede alguém de "simplificar" o gancho de volta).
- **`14-artefatos-do-mantenedor.md` §5** — a linha `npm version` sai de 🔴 **NÃO — e é um defeito** para
  **Sim**, com o motivo: publicar uma tag com o kit do mantenedor defasado é o mesmo defeito que a §4.1
  daquela spec já cobra por defasagem, só que cometido pelo próprio ritual.

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

## Resumo da execução — 2026-08-18

**Resultado:** Concluído

**O que foi feito**
- `package.json:55` — o gancho `version` passou a rodar `npm run dev-kit` e a incluir `sarak-dev` no `git add`, mantendo `guide` e `build` onde já estavam — por quê: é o conserto de uma linha que a plan pede, e o kit do mantenedor passa a entrar no mesmo commit da tag, como `dist/` e `sarak-ui/` já fazem.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `package.json` | alterado | linha 55 (`scripts.version`): `... && npm run build && git add ... dist sarak-ui` → `... && npm run build && npm run dev-kit && git add ... dist sarak-ui sarak-dev` |

**Verificações executadas**
- Simulação do defeito (bump 6.0.0 → 6.0.1 em `package.json`, sem tocar em `version`; revertido ao final):
  - `npm run guide` → `sarak-ui/ gerado — 83 componentes, 422 tokens de tema, 100 ícones`.
  - `npm run build` → build completo verde (`tsup`, `tailwindcss`, `build:css:scoped`, `generate-build-info`), sem erro.
  - `npm run dev-kit:check` (**ANTES**, só com `guide`+`build`, sem `dev-kit` — reproduz o gancho ANTIGO) → **exit 1**: `[dev-kit:check] kit do mantenedor DEFASADO em 3 arquivo(s): sarak-dev/state.json, sarak-dev/GUIA-MANUTENCAO.md, sarak-dev/START-HERE.md` — reproduz exatamente o defeito da spec.
  - `npm run dev-kit` (a peça nova do gancho corrigido) → `sarak-dev/ gerado — 77 componentes públicos, 422 tokens, 21 gates`.
  - `npm run dev-kit:check` (**DEPOIS**, com a versão 6.0.1 simulada) → **exit 0**: `[dev-kit:check] kit em dia (3 arquivos, 0 ponteiros mortos).`
- Reversão: `package.json` voltou a `"version": "6.0.0"`; `npm run guide && npm run build && npm run dev-kit` regeneraram `sarak-ui/`, `dist/` e `sarak-dev/` de volta ao estado de `6.0.0` — `git status` confirmou que `sarak-ui/` e `sarak-dev/` voltaram bit-a-bit ao committado (nenhuma das duas pastas aparece no `git status` final).
- `git diff package.json` → confere que só a linha 55 (`scripts.version`) mudou; o campo `"version": "6.0.0"` no topo do arquivo **não** aparece no diff.
- `npm run dev-kit:check` (estado final, `6.0.0`) → `kit em dia (3 arquivos, 0 ponteiros mortos)`.
- `npm run gates:full` (rodada completa) → **exit 0**. `dev-kit:check` continua sendo o **primeiro** gate (confirmado lendo `package.json.scripts['gates:full']`, inalterado: `npm run dev-kit:check && npm run build && npm run build-info:check && npm run package:check && npm run coverage:check`). Suíte: `317 arquivos / 1371 testes, 100% verde`. Cobertura: `74,25%`/`76,02%` — **MELHOROU** (71,47% → 76,02%), nada bloqueado; piso **não** foi regravado (fora do escopo desta plan).
- `npm run package:check` → `OK — 86 arquivos no tarball, allowlist respeitada` (confirma que `sarak-dev/` continua fora do tarball).
- `git status` final → só `package.json` e esta própria plan modificados.

**Critérios de aceite**
- [x] O gancho `version` regenera `sarak-dev/` **e** o inclui no commit da tag — evidência: `package.json:55`.
- [x] A prova do passo 2 está colada: `dev-kit:check` **verde** com a versão simulada nova (6.0.1) — evidência acima, bloco "DEPOIS".
- [x] O diff final **não** altera a `version` do `package.json` — evidência: `git diff package.json` só mostra a linha 55.
- [x] `dev-kit:check` verde na árvore final — evidência acima.
- [x] `dev-kit:check` continua sendo o **primeiro** gate do `gates:full`, e continua no `gates:full` — evidência: leitura direta do script.
- [x] `sarak-dev/` continua **fora** do `files` e na lista de proibidos do `package:check` — evidência: `package:check` OK, e `package.json.files` não foi tocado (segue `["dist","bin","!bin/**/__tests__/**","docs","sarak-ui"]`).
- [x] `git diff --stat` — só `package.json` (e a própria plan, pelo resumo). `sarak-dev/` não apareceu porque a regeneração produziu conteúdo **idêntico** ao já commitado para `6.0.0` — não houve o que mover.

**Decisões e suposições**
- **Rodei as peças do gancho (`guide`, `build`, `dev-kit`) individualmente, em vez do literal `npm run version`.** Motivo: o script `version` termina em `git add`, e rodá-lo durante a simulação do bump teria deixado arquivos da versão 6.0.1 (errada) no índice do git — risco desnecessário. Rodar as mesmas três chamadas na mesma ordem, sem o `git add`, exercita exatamente a mesma lógica de regeneração que a plan pede provar, sem o efeito colateral de staging. Nenhum `git add`/`commit` foi executado em nenhum momento desta execução.
- **`dist/BUILD_INFO.json` foi revertido duas vezes** (`git checkout -- dist/BUILD_INFO.json`), depois da simulação e depois do `gates:full`. Rodar `npm run build` sempre atualiza `builtAt`/`baseCommit` nesse arquivo — é efeito colateral inevitável de build, não do conserto do gancho, e a §3.1/§8 da plan definem o escopo do diff como `package.json` (+ `sarak-dev/`, se movido). Revertido para manter o `git diff --stat` fiel ao critério de aceite.
- **Não rodei `npm run coverage:check -- --write`.** O `gates:full` reportou que a cobertura **melhorou** (71,47% → 76,02%), o que é aprovação, não bloqueio; regravar o piso é uma decisão de manutenção de baseline fora do escopo desta plan (que é sobre o gancho `version`, não sobre `R8.1`).

**Achados fora do escopo (não corrigidos)**
- `dist/BUILD_INFO.json` no HEAD (`92c1e44`) estava com `baseCommit: 48c090e...` — ou seja, o `dist/` commitado já estava **desatualizado em relação ao HEAD** antes de eu tocar em qualquer coisa (medido ao rodar `npm run build` pela primeira vez nesta execução, antes de qualquer bump simulado). Não é o defeito desta plan (que é sobre `sarak-dev/`, não sobre `dist/`), e não mexi nisso — só revertei os artefatos que minha própria simulação gerou. Fica registrado para o revisor decidir se vale uma plan própria ou se é esperado neste fluxo de trabalho.

**Pendências / riscos**
- Nenhuma pendência conhecida. O conserto é a única linha alterada; a prova ponta-a-ponta (antes vermelho, depois verde, revertido, `gates:full` verde) está colada acima.

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-08-18 — 🟢 Aprovado

**O que verifiquei, e como.** Não aceitei nenhuma linha do resumo por confiança: refiz a prova central com as
minhas próprias mãos, num worktree isolado, para não sujar a árvore em revisão.

### 1. Inventário real da mudança

`git status` e `git diff --stat` → **exatamente dois arquivos**: `package.json` (1 linha) e esta plan
(resumo + `status`). `dist/`, `sarak-ui/`, `sarak-dev/` e `gates/baselines/` **limpos** — o que confirma que
as reversões da simulação foram completas, inclusive a do `dist/BUILD_INFO.json`, que o executor declarou ter
revertido duas vezes.

### 2. O diff, lido linha por linha

```diff
-"version": "npm run guide && npm run build && git add package.json package-lock.json dist sarak-ui",
+"version": "npm run guide && npm run build && npm run dev-kit && git add package.json package-lock.json dist sarak-ui sarak-dev",
```

É acréscimo, não troca: `guide` e `build` ficaram onde estavam, como a §5 passo 1 exigia.

### 3. A prova ponta-a-ponta — REFEITA POR MIM

Worktree isolado em `92c1e44`, `node_modules` por junction. Simulei o bump `6.0.0 → 6.0.1` e medi as duas
metades:

| Passo | Comando | Resultado |
|---|---|---|
| Gancho **ANTIGO** (sem `dev-kit`) | `generate-dev-kit.mjs --check` | ❌ **DEFASADO em 3 arquivos** — `state.json`, `GUIA-MANUTENCAO.md`, `START-HERE.md`; `sarak-dev` em **6.0.0** com `package.json` em **6.0.1** |
| Peça **NOVA** do gancho | `generate-dev-kit.mjs` | `sarak-dev/ gerado — 77 componentes, 422 tokens, 21 gates` |
| Depois | `generate-dev-kit.mjs --check` | ✅ **kit em dia (3 arquivos, 0 ponteiros mortos)** · `sarak-dev` em **6.0.1** |

**O defeito reproduziu com a assinatura exata** que eu havia encontrado no HEAD `33fdef0` e que a §2.1 da plan
documenta — e a peça nova o fecha. A causa está confirmada na fonte: `buildDevState.mjs:95` lê o
`package.json` em runtime e `:104` carimba `lib.version`.

### 4. Critérios de aceite, um a um

| # | Critério | Evidência |
|---|---|---|
| 1 | Gancho regenera `sarak-dev/` e o inclui no `git add` | `package.json:55`, lido |
| 2 | Prova com versão simulada nova | §3 acima — **refeita por mim**, não só conferida |
| 3 | Diff não altera a `version` | `git show HEAD:package.json` → `6.0.0`; worktree → `6.0.0`. Comparação chave a chave: **só `scripts.version` mudou** |
| 4 | `dev-kit:check` verde na árvore final | rodado por mim → `kit em dia (3 arquivos, 0 ponteiros mortos)` |
| 5 | `dev-kit:check` continua o **primeiro** do `gates:full` | `gates:full` não aparece no diff; lido: `dev-kit:check && build && build-info:check && package:check && coverage:check` |
| 6 | `sarak-dev/` fora do `files` **e** proibido no `package:check` | `files` intocado (`["dist","bin","!bin/**/__tests__/**","docs","sarak-ui"]`); `check-package-contents.mjs:32` mantém `'sarak-dev/'`; `package:check` rodado por mim → **86 arquivos, allowlist respeitada** |
| 7 | `git diff --stat` só `package.json` (+ `sarak-dev/` se movido) | confirmado. `sarak-dev/` **não** se moveu, e a razão é correta: `collectGates` filtra por `*:check`/`audit`/`gates:full`, e `version` não casa — então alterar esse script não muda o `state.json` |

### 5. Linhas vermelhas — nenhuma cruzada

`gates:full` intocado · `preversion`/`postversion` fora do diff · `version` do pacote intocada · `sarak-dev/`
segue interno · o `exit 1` do `npm run dev-kit` **propaga**, porque a cadeia é `&&` — uma release com ponteiro
morto no guia continua abortando, como a §5 passo 1 exigia.

**Sinais de atalho:** varredura por `TODO`/`FIXME`/`console.log`/`.skip(`/`--no-verify`/`|| true`/`2>/dev/null`
no diff → **nenhum**.

**Append-only:** o diff da plan remove **uma** linha — o próprio `status`, que é a única edição permitida ao
executor ([[00-prompt-executor]] §5). Nada do conteúdo foi tocado.

### 6. Gates que rodei

`dev-kit:check` ✅ · `package:check` ✅ (86 arquivos) · `build-info:check` ✅ (`BUILD_INFO.json` íntegro,
`libVersion` em dia). Não repeti `gates:full` nem a suíte: **nada em `src/`, `bin/` ou `scripts/` mudou**, e o
diff é uma linha de script npm — não há superfície de regressão. O executor os rodou e declarou os números.

### 7. O "achado fora do escopo" — triado, e NÃO procede

O executor registrou que `dist/BUILD_INFO.json` traz `baseCommit: 48c090e` enquanto o HEAD é `92c1e44`, e
sugeriu que o `dist/` commitado estaria desatualizado. **Medi, e não está.**

`git diff --stat a78c19e..HEAD -- src/ bin/ scripts/` devolve **vazio**: nenhum arquivo de fonte mudou desde o
build da `v6.0.0`. Os quatro commits desde então tocaram só `specs/` e `sarak-dev/`. O `dist/` está fiel.

E o mais importante: **`baseCommit` nunca respondeu essa pergunta.** O [[007-distribuicao-por-git]] e a
[[13-instalacao-e-atualizacao]] §10 dizem, com todas as letras, que ele é *sempre* um commit atrás por
auto-referência impossível, e que para saber se está atualizado se usa `sarak-ui check` ou a tag — **nunca** o
`BUILD_INFO`. O achado é a armadilha documentada sendo pisada, não um defeito novo. **Não vira plan.**

Registro sem reprovar, porque o comportamento foi o correto: ele **relatou em vez de mexer**, que é
exatamente o que a §3 do [[00-prompt-executor]] manda fazer com achado fora do escopo.

### 8. Uma observação que NÃO é achado desta execução

A cobertura subiu para **76,02%** contra um piso de **71,47%**, e o executor deliberadamente não regravou o
piso, chamando isso de fora de escopo. **A decisão está certa** — o ganho veio de plans anteriores, não desta,
e regravar baseline exige `--write` deliberado commitado junto do conserto que o produziu (R20).

Fica a nota para uma plan futura, não para esta: **4,55 pontos de folga num piso é o mesmo "teto folgado" que
a [[01-gates-e-baseline]] §4.2 chama de *gate desligado pela metade*** — a regressão que couber dentro da
folga não bloqueia nada. Candidato a plan própria, não pendência desta.

---

**Veredito: 🟢 APROVADO.** O conserto é de uma linha, faz exatamente o que a plan pediu, e a propriedade que
importa — *a defasagem não volta no próximo bump* — foi provada por reprodução direta, não por alegação.

**Destino da síntese:** `specs/specs/03-versionamento-e-release.md` · `specs/specs/14-artefatos-do-mantenedor.md`
(§9 desta plan tem o texto pronto para transporte).

**Nenhuma tag é devida:** `dist/` e `sarak-ui/` não mudaram, e `SIGNED_DIRS` do `check-release-tag.mjs` são
exatamente essas duas — o anel de push não vai cobrar nada.
