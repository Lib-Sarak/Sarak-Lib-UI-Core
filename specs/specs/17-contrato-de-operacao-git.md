---
tipo: "spec"
titulo: "Contrato de operação Git — quem decide, quem executa, o que nunca se faz"
dominio: "Sarak-Lib-UI-Core / Governança / Operação"
status: "🟢 Vigente"
prioridade: "Máxima"
tags: ["spec", "git", "operacao", "governanca", "release", "co-autoria"]
relacionados: ["[[16-integracao-continua]]", "[[03-versionamento-e-release]]", "[[02-enforcement-por-commit]]", "[[00-contexto]]", "[[008-releases-com-tag-e-semver-em-git]]"]
---

# 1. Propósito

Este documento é **contrato**, não fluxo. Ele responde a uma pergunta só — **quem tem autoridade para fazer o
quê** — e a três consequências dela: o que nenhum agente faz, até onde vai a regra de co-autoria, e quem
detalha o resto.

⚠️ **Ele não descreve branches, nem o ritual de release, nem os anéis locais.** Cada um desses já tem dono
(§5). Uma quarta descrição dos mesmos fatos diverge das três primeiras — é o defeito mais reincidente desta
base ([[15-divida-conhecida]] §3.3).

# 2. O modelo de autoridade

> **A execução é a autorização. Não existe "aprovar e o agente faz".**

Decisão do dono, 2026-08-19:

> *"O agente não executa absolutamente nada. Ele apenas instrui o usuário e envia os comandos na resposta, e o
> usuário executa. O agente é responsável pela **instrução**; o usuário, pela **execução** — porém o agente
> determina o que o usuário executa."*

| Papel | Responsabilidade | Não pode |
|---|---|---|
| **Agente** | Diagnosticar, decidir **o que** fazer, emitir o comando exato no shell certo, e o motivo | **Executar qualquer operação de Git** |
| **Dono** | Ler, digitar, e ver o efeito | — |

## 2.1 Por que isto é mais seguro que "agente executa após aprovação"

O modelo alternativo — o dono aprova, o agente roda — cria **autorização de fachada**: aprovar um comando sem
poder inspecioná-lo de fato rodando é carimbo, não controle.

Aqui esse vão não existe. **O dono só vê o efeito de um comando depois de o ter digitado ele mesmo**, o que
elimina a possibilidade de aprovação automática ou distraída.

**E resolve o acesso por construção:** nenhum agente **pode** tocar a credencial que fura a proteção da `main`
— a exceção de administrador ([[16-integracao-continua]] §2.1) — porque nenhum agente executa o `git push` que
a usaria.

## 2.2 O custo, sem eufemismo

A qualidade da operação passa a ser inteiramente **a qualidade da instrução**. Um comando errado entregue é,
na prática, o dono rodando o comando errado.

**Isso já aconteceu, com o revisor presente:** um comando `sed` foi entregue para rodar num **PowerShell**,
onde `sed` não existe. A branch foi criada e empurrada **sem a mudança pretendida**, e o `nothing to commit`
só apareceu no fim.

Isto não é argumento contra o modelo — **é o motivo de a skill `.agents/skills/git-ci-cd/` existir.** Um
agente que confirma o shell **antes** de emitir o comando é o que torna esse custo pagável.

## 2.3 Commits continuam do dono, por regra e por conveniência

> *"Os commits, via de regra, serão executados pelo usuário — para não precisar invocar o agente toda hora.
> Porém não há problema se o agente **instruir** o commit dentro de um versionamento."*

Não há contradição com a §2: instruir um commit como parte de uma sequência de release **é ainda o dono
digitando**.

# 3. Proibições absolutas de operação

Nenhum agente deste repositório, em nenhuma circunstância, **instrui** — e muito menos executa — qualquer um
destes:

| # | Proibição | Por quê |
|---|---|---|
| 1 | **Apagar tag publicada** | O consumidor resolve `#semver:^X.Y.Z` contra a tag (ADR-008). Apagá-la depois de resolvida é **pior** do que ter emitido o nível errado |
| 2 | **`--force` em `main` ou em branch compartilhada** (`develop` incluída) | Reescreve o que outros já leram |
| 3 | **`--no-verify` sem pedido explícito do dono** | E, mesmo com pedido, **sem registrar que foi usado** — o escape existe para ser visível |
| 4 | **`squash`/`rebase` no merge para a `main`** | O histórico é arquivo: uma plan removida se recupera por `git log --diff-filter=D`, e isso depende de o commit sobreviver íntegro |
| 5 | **Emitir `major` sem a nota de migração ancorada** | É gate desde a `plan-53` (`check-migration-anchor.mjs`). Nenhum agente instrui caminho para contorná-lo |
| 6 | **Instruir qualquer release com o worktree sujo** | Uma tag deve apontar para um estado que alguém pode reproduzir |

> **Estas seis são as mesmas seis da skill `git-ci-cd`, elevadas aqui a contrato.** A duplicação é
> deliberada e é a única desta spec: uma **skill pode ser reescrita por qualquer plan futura**; um contrato de
> operação muda só por ADR ou por revisão explícita deste documento.

# 4. O alcance da regra de co-autoria

**A regra não é nova. O que este documento acrescenta é o alcance.**

O texto da regra já existe em quatro lugares, e **nenhum deles é reescrito aqui**:

| Onde |
|---|
| `specs/00-prompt-executor.md` |
| `specs/00-prompt-revisor.md` (duas ocorrências) |
| `specs/00-contexto.md` |

**O alcance:** a regra vale para **qualquer agente** — inclusive o de Git/release — e para **qualquer commit
que ele instrua**, não só os que ele mesmo digitaria se pudesse.

Um commit instruído por um agente e digitado pelo dono dentro de uma sequência de release — um
`git commit -m "..."`, ou o commit automático que o `npm version` cria — segue **exatamente a mesma regra** que
um commit que o dono faria sozinho, sem instrução nenhuma:

> ⛔ **Nenhuma linha `Co-Authored-By` de agente, em nenhuma hipótese.**

# 5. Roteamento

| Preciso saber sobre… | A dona é |
|---|---|
| Branches, gatilhos de CI, os jobs e o que a CI não cobre | [[16-integracao-continua]] |
| O ritual de release, os ganchos do `npm version`, os níveis semver | [[03-versionamento-e-release]] |
| Os anéis locais (`pre-commit`/`pre-push`) | [[02-enforcement-por-commit]] |
| Os comandos exatos por situação, no shell certo | skill `.agents/skills/git-ci-cd/` |
| **Este contrato** — autoridade, proibições, alcance da co-autoria | **esta spec, e só ela** |

⚠️ Este documento **não** descreve nenhuma das quatro primeiras linhas — nem por resumo, nem por tabela
"rápida". Quem precisa desse conteúdo lê a spec dona.

# 6. A skill que aplica este contrato

`.agents/skills/git-ci-cd/` cobre **10 situações** (diagnóstico, commit de rotina, sincronizar
`develop`↔`main`, abrir PR e ler a CI, merge na `main`, decidir o nível do bump, emitir o release, pós-release,
limpeza, e quando parar e perguntar), com tabela de tradução POSIX → PowerShell.

**Ela é conduta** — vale o que valer a disciplina de quem a lê. Por isso, onde existir gate, **ela aponta para
o gate em vez de repetir a regra**: gate segura, prosa não. É a lição medida da `plan-53`.

> ⚠️ **Declarado, não escondido: a skill nunca foi exercitada num release real.** O primeiro `npm version` sob
> ela **é o teste dela**, e o que falhar volta como correção. Esse mesmo evento fecha o achado **7** de
> [[15-divida-conhecida]] (`install-tag.yml` com 0 runs) — os dois fecham juntos, e não por acaso: ambos são
> capacidade escrita e ainda não exercitada pelo caminho real.

# 7. Critérios de aceite

- [x] O modelo de autoridade está escrito com a decisão do dono, datada e citada.
- [x] O motivo de o agente não executar está registrado como **desenho**, não como cautela.
- [x] O custo do modelo está declarado, com o incidente real que o demonstra.
- [x] As seis proibições estão listadas com o motivo de cada uma.
- [x] O alcance da co-autoria cobre commit **instruído**, e referencia os quatro lugares sem reescrevê-los.
- [x] O roteamento não redescreve nenhuma das specs donas.
- [x] A não-exercitação da skill está declarada.

# 8. Contrato de manutenção

- Este documento muda por **ADR** ou por **revisão explícita**, nunca de passagem numa plan de outro assunto.
- Uma proibição só sai daqui com o motivo do ADR que a retira registrado — a lista da §3 é piso, não sugestão.
- Se a skill `git-ci-cd` for reescrita, **esta spec não muda automaticamente**: a §3 é a fonte, e a skill é
  que deve voltar a bater com ela.
