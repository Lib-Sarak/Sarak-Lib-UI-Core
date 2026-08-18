---
tipo: "plan"
titulo: "Montar o pipeline — a CI remota, e o gate que ainda não tem hook"
dominio: "Sarak-Lib-UI-Core / Qualidade / Automação"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "ci", "gates", "automacao"]
relacionados: ["[[01-gates-e-baseline]]", "[[02-enforcement-por-commit]]", "[[11-testes-e-cobertura]]"]
depende_de: ""
destino_sintese: "specs/specs/16-integracao-continua.md · specs/specs/02-enforcement-por-commit.md · specs/specs/01-gates-e-baseline.md · specs/specs/14-artefatos-do-mantenedor.md"
objetivo: "Montar o pipeline: rodar os gates num ambiente que não é a máquina de ninguém, e fechar o único gate gerado que nenhum hook cobra"
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
- `.githooks/pre-commit` — **acrescentar o `dev-kit:check`** (§5 passo 0). ⚠️ Entrou nesta plan por
  **decisão do dono em 2026-08-18**, e é o motivo de a linha vermelha de `.githooks/` ter caído (§3.2)
- `specs/specs/16-integracao-continua.md` — **criar** (o `15` é a dívida conhecida)
- `specs/specs/02-enforcement-por-commit.md` — a §9 "opção em aberto" morre
- `specs/specs/01-gates-e-baseline.md` — a coluna "onde cada gate roda"

## 3.2 Fora
- ⛔ Alterar o **comportamento** de qualquer gate existente. Acrescentar **onde** um gate roda (§5 passo 0)
  **não é** alterar o que ele cobra — ele continua com as mesmas duas causas de reprovação. Mudar o que
  qualquer gate verifica continua proibido; ampliar escopo de gate é da plan-07.
- ⛔ **Tirar o `dev-kit:check` do `gates:full`.** Ele passa a rodar em dois lugares porque cobrem momentos
  diferentes; o `gates:full` continua sendo o portão de release.
- ⛔ Qualquer outra mudança em `.githooks/` além do passo 0. Os demais anéis permanecem como estão.
- E2E: é a `plan-11`, e ela **NÃO depende desta**.

> 🔧 **Corrigido em 2026-08-18 pelo revisor.** Esta linha dizia *"a plan-11 depende desta"*, e isso
> **envelheceu**: a `plan-11` foi escrita quando o plano era **habilitar** E2E — aí sim precisaria da CI
> para ter quem o executasse. O dono decidiu o oposto em 2026-08-11 (*"remover os testes e2e"*), e uma plan
> que **remove** aparato não depende de infraestrutura para rodá-lo. O `depende_de` da `plan-11` é `—`, e a
> fila a põe **antes** desta — as três coisas concordam agora; antes, esta linha era a única discordante.

> 🔧 **A linha vermelha `⛔ .githooks/ — os anéis locais permanecem como estão` CAIU em 2026-08-18, por
> decisão do dono**, que pediu o `dev-kit:check` no `pre-commit` *"na etapa de execução da plan-05 — vamos
> montar o pipeline"*. A plan deixa de ser só "CI remota" e passa a ser **a montagem do pipeline**, local e
> remoto; por isso o título e o objetivo mudaram junto. Registrado em vez de silenciosamente ampliado —
> escopo que cresce sem deixar rastro é como uma plan deixa de ser verificável.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/01-gates-e-baseline.md` | o baseline versionado e o que cada gate garante |
| Spec fixa | `specs/specs/02-enforcement-por-commit.md` | os anéis de `pre-commit`/`pre-push` que a CI complementa |
| Spec fixa | `specs/specs/13-instalacao-e-atualizacao.md` | o que o teste de `install` precisa provar |
| Código | `.githooks/pre-commit` · `pre-push` · `gates/scripts/release/check-audit-baseline.mjs` | o que já roda, para não duplicar |

# 5. Instruções de execução

## Passo 0 — `dev-kit:check` passa a bloquear o commit *(decisão do dono, 2026-08-18)*

**O requisito, e só ele:** um commit que possa defasar `sarak-dev/` é **bloqueado** até o kit ser regenerado.
O *como* é seu — mas leia a armadilha antes, porque a solução óbvia está errada.

### A armadilha, medida pelo revisor

`sarak-dev/state.json` é o **único** artefato gerado que **nenhum hook cobra** hoje
(`grep -c "dev-kit" .githooks/pre-commit` → **0**). Ele só vive no `gates:full`, e por ele no `preversion` —
por isso a defasagem dele só aparece **na hora de emitir release**, bloqueando por trabalho de plans
anteriores. É a mesma forma de falha que a `plan-51` consertou no gancho `version`, por outro caminho.

⚠️ **Pôr no Anel 1 NÃO resolve — e falharia justo onde mais dói.** O `pre-commit` separa dois gatilhos:

| Gatilho | Casa com | Dispara |
|---|---|---|
| `TOCA_CODIGO` | `src/` `scripts/` `gates/` `docs/` `sarak-ui/` `bin/` `package.json` `.githooks/` | Anéis 1 **e** 2 |
| `TOCA_DOC_COM_SECAO` | `specs/specs/` `specs/adr/` `specs/arquitetura/` `specs/00-` `.agents/skills/` `sarak-dev/` | **só o Anel 2** — o hook imprime *"Anel 1 PULADO"* |

E `state.json` carrega `base` = a **lista de arquivos** de `specs/adr/`, `specs/arquitetura/` e
`specs/specs/`. Logo **criar ou remover uma spec defasa o kit** — e cai no gatilho que **pula o Anel 1**.
**Esta própria plan cria `specs/specs/16-integracao-continua.md`**, então você vai atravessar o caso dentro
dela: se puser o gate no Anel 1, ele não roda no commit que mais precisava dele.

### O que o gate precisa cobrir

Tudo que move o `state.json` ([[14-artefatos-do-mantenedor]] §3): schema e catálogo de tokens, componentes,
`scripts` do `package.json`, auditores, `gates/baselines/`, `docs/` **e** as três pastas de spec fixa. Na
prática, a **união** dos dois gatilhos acima.

### O precedente para a forma

O `check-plan-index-sync` já é um gate com **gatilho próprio, fora da estrutura de anéis**, bloqueando
binariamente (`.githooks/pre-commit:37-52`). É o molde mais próximo — não copie por copiar, mas saiba que
existe e por que existe.

### O que declarar, não descobrir

1. **O custo.** Medido pelo revisor: `dev-kit:check` leva **~1,1 s** (3 rodadas: 1107/1084/1109 ms). A
   [[02-enforcement-por-commit]] §3 mede e publica o custo de cada classe de commit (**609 ms** só-markdown,
   **~10 s** com código). **Meça de novo, depois da sua mudança, as três classes** — só-doc, só-spec, com
   código — e escreva os números. Se a propriedade *"commit de documentação é barato"* mudar de patamar,
   diga com todas as letras em vez de deixar o dono descobrir no uso.
2. **A segunda causa de reprovação.** O `dev-kit:check` reprova por **defasagem** *e* por **ponteiro morto**
   na prosa do kit ([[14-artefatos-do-mantenedor]] §4.2). Levá-lo ao `pre-commit` significa que **um ponteiro
   morto no guia passa a barrar commit**, o que hoje não acontece. É consequência desejada (é o único gate
   que audita documentação por conteúdo), mas é **mudança de comportamento** — declare-a. Se ela se mostrar
   custosa na prática, **relate; não afrouxe o gate por conta própria**.

## Passos 1–6 — a CI

1. Criar o workflow: **suíte completa**, `npm run build`, `package:check`, e `run_audit` comparado ao
   **baseline versionado** (`gates/baselines/audit-baseline.json`), nunca a zero.

   > 🔧 **Os dois caminhos acima foram corrigidos em 2026-08-11 pelo revisor.** A plan citava
   > **.githooks/audit-baseline.json** e **scripts/check-audit-baseline.mjs**, que a `plan-14` moveu para
   > `gates/`. Ponteiro morto dentro de uma plan a executar manda o executor atrás de arquivo inexistente —
   > o objetivo e o escopo da plan **não mudaram**. *(Os dois nomes velhos vão em **negrito**, nunca em
   > crase: é a convenção de [[14-artefatos-do-mantenedor]] §4.2 — caminho removido citado em crase é
   > ponteiro morto para o verificador, mesmo quando o texto só o menciona como história.)*
2. **Cobrar o `--no-verify`**: a CI roda o que o hook rodaria, então um push que burlou o anel local é
   reprovado no remoto. É o único lugar onde esse escape deixa de ser invisível.
3. **Teste de `install` real** (achado 26) — matriz npm/pnpm/yarn, provando que a lib instala a partir de uma
   dependência git com tag e que o `sarak-ui check --notify` dispara. ⚠️ **Regra herdada: comando não executado
   de verdade não entra.** O que não rodar na CI não é declarado como coberto.
4. Garantir isolamento: a CI **não** pode depender de nada do `$HOME` do desenvolvedor. Se um teste hoje passa
   por causa do ambiente local, ele vai falhar aqui — isso é a feature, não um problema a contornar.
5. Escrever `specs/specs/16-integracao-continua.md`: o que roda, onde, com que gatilho, e **o que a CI NÃO
   cobre**.
6. Atualizar `specs/specs/02-enforcement-por-commit.md` (a §9 deixa de ser "opção em aberto") e
   `specs/specs/01-gates-e-baseline.md`.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute specs/plan/plan-05-integracao-continua.md.

Contexto obrigatório antes de começar: specs/00-contexto.md, specs/00-knowledge.md,
specs/specs/01-gates-e-baseline.md, specs/specs/02-enforcement-por-commit.md,
specs/specs/13-instalacao-e-atualizacao.md.

PASSO 0 (decisão do dono, 2026-08-18) — o `dev-kit:check` passa a BLOQUEAR o commit.
  É o ÚNICO artefato gerado sem hook: `grep -c "dev-kit" .githooks/pre-commit` -> 0.
  ⚠️ Pôr no Anel 1 NÃO resolve. O pre-commit tem DOIS gatilhos, e o de spec
  (`TOCA_DOC_COM_SECAO`) dispara SÓ o Anel 2 — imprime "Anel 1 PULADO". E o
  state.json carrega a LISTA DE ARQUIVOS de specs/specs|adr|arquitetura, então
  criar uma spec defasa o kit. Esta plan CRIA a spec 16: você vai atravessar o
  caso dentro dela. Leia a §5 passo 0 inteira antes de escrever uma linha.
  Precedente de forma: check-plan-index-sync tem gatilho próprio, fora dos anéis.
  DECLARE: (a) o custo remedido das três classes de commit (só-doc, só-spec, com
  código) contra os 609 ms / ~10 s da 02-enforcement §3; (b) que ponteiro morto
  no guia passa a barrar commit — é desejado, mas é mudança de comportamento.

Você NÃO altera o COMPORTAMENTO de nenhum gate — acrescentar ONDE ele roda não é
alterar o que ele cobra. Você NÃO tira o dev-kit:check do gates:full. Você NÃO
mexe em mais nada de .githooks/. Comando que você não executou de verdade não
entra no workflow nem é declarado como coberto.
Não saia do escopo. Não commite. Ao terminar, escreva o resumo na própria plan e
mova o status para 🟠 Em revisão.
```

# 7. Critérios de aceite

- [ ] **`dev-kit:check` bloqueia o commit** quando o kit está defasado — provado com uma defasagem
      deliberada, **revertida** depois.
- [ ] **Provado no caso que a §5 passo 0 nomeia:** um commit que só cria/remove arquivo em `specs/specs/`
      (ou `adr/`, `arquitetura/`) é barrado. É o caso que o Anel 1 sozinho pularia.
- [ ] O custo das **três** classes de commit remedido e escrito (só-doc · só-spec · com código), contra os
      609 ms / ~10 s da [[02-enforcement-por-commit]] §3.
- [ ] Declarado que **ponteiro morto no guia passa a barrar commit** — mudança de comportamento, não
      efeito colateral silencioso.
- [ ] `dev-kit:check` **continua** no `gates:full`, e o `gates:full` continua com a mesma ordem.
- [ ] Workflow criado e **executado com sucesso ao menos uma vez** no remoto (não basta escrever o YAML).
- [ ] Um PR com teste quebrado é **reprovado pela automação** — provado com um teste quebrado de propósito.
- [ ] `run_audit` na CI comparado ao baseline versionado; **não** a zero.
- [ ] `install` real coberto para os 3 gerenciadores, cada um efetivamente executado.
- [ ] `specs/specs/16-integracao-continua.md` criado, declarando **o que a CI não cobre**.
- [ ] `specs/specs/02-enforcement-por-commit.md` §9 atualizada; `specs/specs/01-gates-e-baseline.md` diz
      onde cada gate roda.
- [ ] Nenhum gate existente teve comportamento alterado.

# 8. Como verificar

```bash
# passo 0 — o gate entrou, e no gatilho certo?
grep -c "dev-kit" .githooks/pre-commit          # era 0; tem de ser > 0
node -e "console.log(require('./package.json').scripts['gates:full'])"   # inalterado

# o caso que o Anel 1 sozinho pularia: staged SÓ com spec nova
#   -> plantar um arquivo em specs/specs/, `git add`, rodar `sh .githooks/pre-commit`
#   -> tem de BLOQUEAR; depois desfazer
```

- `gh run list` → execução verde; e a execução com o teste quebrado, vermelha
- `git diff --stat` → `.github/`, `specs/` — **nenhum** `src/`, `scripts/`, `.githooks/`
- Ler o workflow: cada comando declarado existe em `package.json`
- `npm run audit` local → baseline **inalterado**

# 9. Destino da síntese

**Destino:** `specs/specs/16-integracao-continua.md` (novo) · `specs/specs/02-enforcement-por-commit.md` ·
`specs/specs/01-gates-e-baseline.md` · `specs/specs/14-artefatos-do-mantenedor.md`

- **`02-enforcement-por-commit.md`** — a §9 (*"opção em aberto"*) morre com a CI; e a §2.2/§3 ganham o
  `dev-kit:check` com o **gatilho** dele e o custo remedido das três classes de commit.
- **`14-artefatos-do-mantenedor.md` §5** — a linha `.githooks/pre-commit` sai de **"Não *(decisão em
  aberto)*"** para **Sim**, com a decisão datada e o motivo: era o único artefato gerado sem hook, e a
  ausência só se manifestava no `preversion`, bloqueando release por trabalho de plans anteriores.

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->
