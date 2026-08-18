---
tipo: "plan"
titulo: "Toda release publica o kit do mantenedor um release atrás"
dominio: "Sarak-Lib-UI-Core / Distribuição / Release"
status: "🔴 A executar"
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

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->
