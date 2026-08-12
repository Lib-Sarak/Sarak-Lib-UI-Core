---
tipo: "plan"
titulo: "Integração contínua — rodar os gates num ambiente que não é a máquina de ninguém"
dominio: "Sarak-Lib-UI-Core / Qualidade / Automação"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "ci", "gates", "automacao"]
relacionados: ["[[01-gates-e-baseline]]", "[[02-enforcement-por-commit]]", "[[11-testes-e-cobertura]]"]
depende_de: ""
destino_sintese: "specs/16-integracao-continua.md · specs/02-enforcement-por-commit.md · specs/01-gates-e-baseline.md"
objetivo: "Rodar os gates num ambiente que não é a máquina de ninguém"
---

# 1. Objetivo

Um PR com teste quebrado é reprovado **pela automação**, não pela memória de alguém — e a suíte roda num
`$HOME` que não é o do dono.

# 2. Contexto

**Duas vezes** um "verde" foi falso por causa da máquina, e nenhum gate local pegou — por definição, o ambiente
local é o problema:

- um `package-lock.json` solto no `$HOME` derrubava um teste de detecção de gerenciador;
- um `node_modules/` não versionado fazia 6 arquivos de um projeto alheio passarem por um gate de conteúdo.

Some-se o escape invisível: **quem usa `--no-verify` não é cobrado por ninguém**. E `.github/` **não existe**
neste repositório.

Achado **26** entra aqui porque a CI é o único lugar onde cabe: **nenhum teste automatizado exercita um
`install` de verdade.** As provas de npm/pnpm/yarn foram feitas à mão, uma vez. O `check --notify` no `predev`
é o comando que mais executa na vida do importador e o menos coberto.

# 3. Escopo

## 3.1 Dentro
- `.github/workflows/` — **criar**
- `specs/specs/16-integracao-continua.md` — **criar** (o `15` é a dívida conhecida)
- `specs/specs/02-enforcement-por-commit.md` — a §9 "opção em aberto" morre
- `specs/specs/01-gates-e-baseline.md` — a coluna "onde cada gate roda"

## 3.2 Fora
- ⛔ Alterar o comportamento de **qualquer gate existente**. A CI **roda** o que já existe; ampliar escopo de
  gate é da plan-07.
- ⛔ `.githooks/` — os anéis locais permanecem como estão.
- E2E: é a plan-11, que **depende desta**.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/01-gates-e-baseline.md` | o baseline versionado e o que cada gate garante |
| Spec fixa | `specs/02-enforcement-por-commit.md` | os anéis de `pre-commit`/`pre-push` que a CI complementa |
| Spec fixa | `specs/13-instalacao-e-atualizacao.md` | o que o teste de `install` precisa provar |
| Código | `.githooks/pre-commit` · `pre-push` · `gates/scripts/release/check-audit-baseline.mjs` | o que já roda, para não duplicar |

# 5. Instruções de execução

1. Criar o workflow: **suíte completa**, `npm run build`, `package:check`, e `run_audit` comparado ao
   **baseline versionado** (`gates/baselines/audit-baseline.json`), nunca a zero.

   > 🔧 **Os dois caminhos acima foram corrigidos em 2026-08-11 pelo revisor.** A plan citava
   > `.githooks/audit-baseline.json` e `scripts/check-audit-baseline.mjs`, que a `plan-14` moveu para
   > `gates/`. Ponteiro morto dentro de uma plan a executar manda o executor atrás de arquivo inexistente —
   > o objetivo e o escopo da plan **não mudaram**.
2. **Cobrar o `--no-verify`**: a CI roda o que o hook rodaria, então um push que burlou o anel local é
   reprovado no remoto. É o único lugar onde esse escape deixa de ser invisível.
3. **Teste de `install` real** (achado 26) — matriz npm/pnpm/yarn, provando que a lib instala a partir de uma
   dependência git com tag e que o `sarak-ui check --notify` dispara. ⚠️ **Regra herdada: comando não executado
   de verdade não entra.** O que não rodar na CI não é declarado como coberto.
4. Garantir isolamento: a CI **não** pode depender de nada do `$HOME` do desenvolvedor. Se um teste hoje passa
   por causa do ambiente local, ele vai falhar aqui — isso é a feature, não um problema a contornar.
5. Escrever `specs/16-integracao-continua.md`: o que roda, onde, com que gatilho, e **o que a CI NÃO cobre**.
6. Atualizar `02-enforcement-por-commit.md` (a §9 deixa de ser "opção em aberto") e `01-gates-e-baseline.md`.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute specs/plan/plan-05-integracao-continua.md.

Contexto obrigatório antes de começar: specs/00-contexto.md, specs/00-knowledge.md,
specs/specs/01-gates-e-baseline.md, specs/specs/02-enforcement-por-commit.md,
specs/specs/13-instalacao-e-atualizacao.md.

Você NÃO altera nenhum gate existente — a CI roda o que já existe. Comando que você não
executou de verdade não entra no workflow nem é declarado como coberto.
Não saia do escopo. Não commite. Ao terminar, escreva o resumo na própria plan.
```

# 7. Critérios de aceite

- [ ] Workflow criado e **executado com sucesso ao menos uma vez** no remoto (não basta escrever o YAML).
- [ ] Um PR com teste quebrado é **reprovado pela automação** — provado com um teste quebrado de propósito.
- [ ] `run_audit` na CI comparado ao baseline versionado; **não** a zero.
- [ ] `install` real coberto para os 3 gerenciadores, cada um efetivamente executado.
- [ ] `specs/16-integracao-continua.md` criado, declarando **o que a CI não cobre**.
- [ ] `02-enforcement-por-commit.md` §9 atualizada; `01-gates-e-baseline.md` diz onde cada gate roda.
- [ ] Nenhum gate existente teve comportamento alterado.

# 8. Como verificar

- `gh run list` → execução verde; e a execução com o teste quebrado, vermelha
- `git diff --stat` → `.github/`, `specs/` — **nenhum** `src/`, `scripts/`, `.githooks/`
- Ler o workflow: cada comando declarado existe em `package.json`
- `npm run audit` local → baseline **inalterado**

# 9. Destino da síntese

**Destino:** `specs/16-integracao-continua.md` (novo) · `specs/02-enforcement-por-commit.md` ·
`specs/01-gates-e-baseline.md`

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->
