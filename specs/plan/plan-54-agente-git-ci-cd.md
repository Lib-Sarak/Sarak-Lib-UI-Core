---
tipo: "plan"
titulo: "O agente de Git — a skill que instrui e a spec que define quem faz o quê"
dominio: "Sarak-Lib-UI-Core / Governança / Operação"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "git", "release", "skill", "governanca"]
relacionados: ["[[03-versionamento-e-release]]", "[[02-enforcement-por-commit]]", "[[16-integracao-continua]]", "[[13-instalacao-e-atualizacao]]"]
depende_de: "plan-53"
destino_sintese: "specs/specs/17-contrato-de-operacao-git.md · specs/00-knowledge.md"
objetivo: "Escrever a skill que instrui a operação de Git e release, e a spec que define quem executa o quê"
---

# 1. Objetivo

Quem vai emitir um release **recebe os comandos exatos e o motivo de cada um**, no shell certo — e **executa
ele mesmo**. O agente sabe; o humano digita.

# 2. Contexto

O ciclo de 2026-08-18/19 montou o pipeline inteiro (`plan-52`, `plan-05`, `plan-10`) e produziu um corpo de
conhecimento operacional que **não está escrito em lugar nenhum**: vive nas mensagens de uma conversa que
acaba. Amanhã ele não existe.

E o ritual **erra na mão** — errou duas vezes nesse mesmo ciclo, com o revisor presente:

- um comando `sed` foi entregue para rodar num **PowerShell**, onde `sed` não existe. A branch foi criada e
  empurrada **sem a mudança**, e o `nothing to commit` só apareceu no fim;
- o GitHub oferece **"Delete branch"** depois do merge, e apagar a `develop` ali desmontaria o fluxo recém
  montado. Só não aconteceu porque houve aviso na hora.

## 2.1 A decisão de autoridade *(dono, 2026-08-19)*

> *"O agente não executa absolutamente nada. Ele apenas instrui o usuário e envia os comandos na resposta, e o
> usuário executa. O agente é responsável pela instrução e o usuário pela execução — porém o agente determina
> o que o usuário executa."*

**Isto é mais seguro do que a alternativa**, e por uma razão que precisa ficar registrada: elimina a
**autorização de fachada**. Num modelo em que o agente executa após aprovação, aprovar sem poder inspecionar é
carimbo. Aqui **a execução é a autorização** — não existe vão entre uma e outra.

E resolve o acesso: o agente **nunca** toca a credencial que fura a proteção da `main`. Não pode fazer o que
não pode executar.

⚠️ **O custo, e ele é real:** a qualidade passa a ser **inteiramente da instrução**. Comando errado na tela é o
dono rodando o comando errado — foi exatamente o que aconteceu com o `sed`. Por isso o shell não é detalhe
(§5.2).

## 2.2 Commits continuam do dono, por regra e por conveniência

> *"Os commits, via de regra, serão executados pelo usuário — para não precisar invocar o agente toda hora.
> Porém não há problema se o agente instruir o commit dentro de um versionamento."* — dono

Não há contradição: **quem digita é sempre o dono**. Num ritual de release, o commit faz parte da sequência
que o agente entrega — e continua sendo o dono que o executa.

# 3. Escopo

## 3.1 Dentro
- `.agents/skills/git-ci-cd/` — a skill (**criar**). Primeira skill não-`ui-*` do repositório
- `specs/00-knowledge.md` — o catálogo de skills ganha a linha nova
- O **§10 desta plan** — o texto da `specs/specs/17-contrato-de-operacao-git.md` (nova), que a síntese cria

## 3.2 Fora
- ⛔ **Criar ou editar spec fixa** (`specs/specs/`, `arquitetura/`, `adr/`). Proibição absoluta
  ([[00-prompt-executor]] §7.3) — inclusive a `17`, que **nasce na síntese** a partir do seu §10.
  *(`specs/00-knowledge.md` é catálogo operacional, não spec fixa: está no escopo.)*
- ⛔ **Executar qualquer operação de Git** para provar a skill: nada de `commit`, `push`, `tag`, `merge`,
  `npm version`. A skill **instrui**; provar que ela instrui certo é **conferir o texto**, não rodá-lo.
- ⛔ **Duplicar conteúdo** de `03-versionamento-e-release`, `02-enforcement-por-commit` ou da `16`. A skill
  **referencia por nome**; a spec `17` **roteia**. Quarta descrição dos mesmos fatos é a reincidência nº 1
  desta base ([[15-divida-conhecida]] §3.3).
- ⛔ **Reescrever a regra de co-autoria.** Ela já existe em `00-prompt-executor.md:165`,
  `00-prompt-revisor.md:67` e `:246`, e `00-contexto.md:303`. **Referencie** — quatro cópias é como uma regra
  começa a divergir. O que a `17` acrescenta é o **alcance**, não o texto (§5.4).
- ⛔ Criar comando/agent novo, ou mexer em `.github/`, `.githooks/`, `package.json`.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Skill | `.agents/skills/ui-integra-consumidor/` | o **molde** de skill deste repositório — forma, seções, tom |
| Spec fixa | `specs/specs/03-versionamento-e-release.md` | o ritual de release e os níveis — a skill referencia, não copia |
| Spec fixa | `specs/specs/02-enforcement-por-commit.md` | os anéis locais, e quais pulam em qual branch |
| Spec fixa | `specs/specs/16-integracao-continua.md` | branches, gatilhos e a CI *(nasce na síntese — se ainda não existir, use o §10 da `plan-05`)* |
| Plan | `specs/plan/plan-05-integracao-continua.md` §10 e §11 | **a fonte factual mais completa**: os 7 runs, a proteção da `main`, o `release-tag` |
| Código | `gates/scripts/release/check-release-tag.mjs` | o que cobra a tag, e o *fallback* de stdin |

# 5. Instruções de execução

## 5.1 A skill — cobertura obrigatória

Uma seção por **situação real**, cada uma com: quando se aplica · o que verificar **antes** · os comandos ·
o que **não** fazer · como saber que deu certo.

| # | Situação | O que não pode faltar |
|---|---|---|
| 1 | **Diagnóstico** (sempre primeiro) | os comandos **de leitura** que determinam o estado: branch atual, divergência local×remoto, worktree limpo, tag devida (`release:check`), últimos runs da CI |
| 2 | Commit de rotina | qual anel dispara conforme o que foi tocado, e o custo esperado |
| 3 | Sincronizar `develop` ↔ `main` | por que o merge sai **fast-forward** quando a `develop` não divergiu, e o que muda se divergir |
| 4 | Abrir PR e ler a CI | que só o `gates` é *required check*; que `release-tag`/`install-sha` são condicionais **por desenho** |
| 5 | **Merge na `main`** | **`Create a merge commit`**, nunca squash nem rebase — o histórico é arquivo (`git log --diff-filter=D` recupera plan removida). E **NÃO clicar em "Delete branch"**: a `develop` é permanente |
| 6 | **Decidir o nível** (`minor` × `major`) | o procedimento, não o palpite: comparar `src/index.ts`, contar componentes e exports do catálogo, e verificar **o que do removido chega ao consumidor** (`package.json` `files`) |
| 7 | **Emitir o release** | a sequência inteira do `npm version`, o que cada gancho faz, que ele **cria um commit**, e que o push usa a **exceção de administrador** da `main` protegida |
| 8 | Depois do release | conferir que a tag assina a árvore publicada, e que o evento de tag disparou o `install-tag.yml` |
| 9 | Limpeza | quando apagar branch (descartável) e quando **nunca** (`develop`, `main`) |
| 10 | **Quando parar e perguntar** | worktree sujo, divergência inesperada, CI vermelha por motivo desconhecido, nível ambíguo |

## 5.2 O shell não é detalhe

**A skill entrega comando que roda no shell do dono.** Hoje é **PowerShell** — onde `sed`, `grep`, `head`,
`tail`, `touch` e `2>/dev/null` **não existem**, e onde `&&` não encadeia.

Regra a escrever na skill: **antes de emitir qualquer bloco, confirme o shell**; e quando o comando precisar
de manipulação de texto, prefira a forma que sobrevive nos dois (ou entregue as duas versões, rotuladas).
Foi um `sed` num PowerShell que produziu, neste ciclo, uma branch empurrada **sem a mudança**.

## 5.3 O que a skill deve **recusar**

Escreva explicitamente, com o motivo — não como lista seca:

- **apagar tag publicada** — o consumidor resolve `#semver:` contra ela; apagar é pior que ter errado;
- **`--force` na `main`** ou em qualquer branch compartilhada;
- **`--no-verify`** sem o dono ter pedido, e mesmo aí registrando que foi usado;
- **squash/rebase** no merge para a `main`;
- **emitir major sem a nota de migração** — depois da `plan-53` isso é gate, e a skill não tenta contorná-lo;
- **instruir release com worktree sujo** — o `version` regenera `dist/` e commita; sujeira entra junto.

## 5.4 A spec `17` — o **contrato de operação**, e só ele

⚠️ **O risco desta plan é a spec 17 virar a terceira descrição do mesmo fluxo.** Ela **não** descreve
branches (é a `16`), nem o ritual de release (é a `03`), nem os anéis (é a `02`). O que ela carrega, e que
**não tem dono hoje**:

1. **O modelo de autoridade** — agente instrui, dono executa; e por que (a autorização de fachada, §2.1);
2. **As proibições absolutas de operação** — a lista da §5.3, elevada a contrato;
3. **O alcance da regra de co-autoria** — que ela vale para **qualquer** agente, inclusive o de Git, e para
   qualquer commit que ele **instrua**. ⚠️ **Referencie os quatro lugares onde a regra já está escrita; não
   a reescreva.**
4. **Roteamento** — quem detalha cada peça: `03`, `02`, `16`, e a skill.

## 5.5 O que declarar

- A skill **nunca foi exercitada num release real** no momento em que for escrita. Diga isso nela: o primeiro
  `npm version` sob a skill é o teste dela, e o que falhar volta como correção.
- A skill é **conduta** — vale o que valer a disciplina de quem a lê. Onde existir gate, ela **aponta** para o
  gate em vez de repetir a regra: gate segura, prosa não. *(É a lição medida da `plan-53`: obrigação escrita
  sem gate foi pulada três vezes.)*

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute specs/plan/plan-54-agente-git-ci-cd.md.

PRE-REQUISITO: a plan-53 precisa estar 🟢 Aprovada — a skill APONTA para o gate de
notas de migracao que ela constroi. Escrever a skill antes seria escrever
procedimento para uma trava que nao existe.

Contexto obrigatorio: specs/00-contexto.md, specs/00-knowledge.md,
specs/specs/03-versionamento-e-release.md, specs/specs/02-enforcement-por-commit.md,
specs/specs/16-integracao-continua.md (se ja existir; senao, o §10 da plan-05),
e o molde .agents/skills/ui-integra-consumidor/.

MODELO DE AUTORIDADE (decisao do dono, 2026-08-19): O AGENTE NAO EXECUTA NADA.
Ele verifica (leitura), decide o que deve ser feito, mostra a evidencia e ENTREGA
OS COMANDOS. Quem digita e sempre o dono. A execucao E a autorizacao — nao existe
"aprovar e o agente faz".

A SKILL COBRE 10 SITUACOES (tabela da §5.1), cada uma com: quando se aplica, o que
verificar ANTES, os comandos, o que NAO fazer, e como saber que deu certo.

O SHELL NAO E DETALHE: o dono usa PowerShell. sed/grep/head/tail/touch/2>/dev/null
NAO existem la, e && nao encadeia. Neste mesmo ciclo, um "sed" entregue para um
PowerShell produziu uma branch empurrada SEM a mudanca. Escreva a regra: confirme o
shell antes de emitir bloco de comando.

NAO DUPLIQUE: 03 (release), 02 (aneis), 16 (fluxo) ja tem dono. A skill REFERENCIA
por nome. A spec 17 (que vai NO §10, voce nao a cria) carrega so o que nao tem
dono: modelo de autoridade, proibicoes absolutas de operacao, ALCANCE da regra de
co-autoria, e roteamento.

CO-AUTORIA: a regra ja existe em 00-prompt-executor.md:165, 00-prompt-revisor.md:67
e :246, e 00-contexto.md:303. REFERENCIE, nao reescreva — quatro copias e como uma
regra comeca a divergir. NENHUM agente adiciona co-autoria a nenhum commit, nunca.

VOCE NAO EXECUTA NENHUMA OPERACAO DE GIT para provar a skill — nem commit, nem
push, nem tag, nem merge, nem npm version. Provar que ela instrui certo e CONFERIR
O TEXTO contra as fontes, nao rodar os comandos.
Voce NAO cria nem edita spec fixa (§7.3). Voce NAO toca .github/, .githooks/ nem
package.json.

Nao commite. Ao terminar, escreva o resumo na propria plan e mova o status para
🟠 Em revisao.
```

# 7. Critérios de aceite

- [ ] `.agents/skills/git-ci-cd/` criada no molde das skills existentes.
- [ ] As **10 situações** da §5.1 cobertas, cada uma com verificação prévia, comandos e o "como saber que deu
      certo".
- [ ] Todo comando emitido pela skill **roda em PowerShell**, ou está rotulado por shell.
- [ ] A regra do §5.2 (confirmar o shell antes de emitir bloco) está escrita.
- [ ] As recusas da §5.3 estão escritas **com o motivo**, não como lista seca.
- [ ] **Zero duplicação**: nenhum parágrafo que redescreva `03`, `02` ou `16` — só referência por nome.
- [ ] A regra de co-autoria é **referenciada**, nunca reescrita.
- [ ] `specs/00-knowledge.md` lista a skill nova.
- [ ] **No §10**, o texto da spec `17` com as quatro partes da §5.4 — e **nenhuma** delas redescrevendo outra
      spec.
- [ ] Declarado na skill que ela **ainda não foi exercitada num release real**.
- [ ] **Nenhuma operação de Git executada** — `git log` do worktree sem commit novo, sem tag, sem push.
- [ ] Nenhuma spec fixa tocada; nada em `.github/`, `.githooks/`, `package.json`.

# 8. Como verificar

```bash
git status --short          # so .agents/skills/git-ci-cd/, 00-knowledge.md, esta plan
git log --oneline -1        # inalterado — nenhum commit
git tag --list | wc -l      # 12 — nenhuma tag nova

# duplicacao: a skill nao pode redescrever o que ja tem dono
grep -c "npm version" .agents/skills/git-ci-cd/SKILL.md    # cita, nao reescreve o ritual
grep -n "Co-Authored\|co-autoria" .agents/skills/git-ci-cd/SKILL.md   # referencia, nao copia

# shell: nenhum comando POSIX-only num bloco marcado como PowerShell
grep -nE "\bsed\b|\bgrep\b|\btail\b|2>/dev/null" .agents/skills/git-ci-cd/SKILL.md
```

- Ler a skill inteira e conferir **cada comando** contra a fonte que o justifica
- Ler o §10 e confirmar que a spec `17` não repete `03`, `02` nem `16`

# 9. Destino da síntese

**Destino:** `specs/specs/17-contrato-de-operacao-git.md` (nova) · `specs/00-knowledge.md`

- **`17`** — nasce na síntese, com as quatro partes da §5.4. É **contrato**, não fluxo.
- **`00-knowledge.md`** — a skill entra no catálogo *(o executor já o atualiza; a síntese só confere)*.

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->
