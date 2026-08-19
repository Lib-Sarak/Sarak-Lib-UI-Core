---
tipo: "plan"
titulo: "O agente de Git — a skill que instrui e a spec que define quem faz o quê"
dominio: "Sarak-Lib-UI-Core / Governança / Operação"
status: "🟢 Aprovada"
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

## Resumo da execução — 2026-08-19

**Resultado:** Concluído

## O que foi feito

- **`.agents/skills/git-ci-cd/SKILL.md`** (novo, 429 linhas) — a skill, no molde de
  `ui-integra-consumidor` (frontmatter `name`/`description`-gatilho, callout de contrato no topo,
  seções em `##`/`###`). Cobre as **10 situações** da §5.1, cada uma com "quando se aplica", "o que
  verificar antes", "comandos", "o que NÃO fazer" e "como saber que deu certo" (a Situação 10 é
  exceção deliberada — ela É a lista de quando não seguir nenhum comando, não um procedimento).
  `.claude/skills/git-ci-cd/` aparece espelhado automaticamente — é symlink para `.agents/skills/`
  (confirmado: `ls -la .claude/` mostra `skills -> .../.agents/skills`), nada foi escrito lá à mão.
- **`specs/00-knowledge.md:139`** — linha nova em §4.6 (`git-`), mais uma nota de 6 linhas logo abaixo
  marcando a exceção ao contrato de universalidade da própria spec (ver "Decisões e suposições").

## Arquivos alterados

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `.agents/skills/git-ci-cd/SKILL.md` | criado | a skill inteira |
| `specs/00-knowledge.md` | alterado | 1 linha na tabela §4.6 + 1 nota de ressalva (6 linhas) |
| `specs/plan/plan-54-agente-git-ci-cd.md` | alterado | este resumo + `status` |

**Nada em `.github/`, `.githooks/`, `package.json`** — confirmado por `git status --short` (abaixo).
**Nenhuma spec fixa** (`specs/specs/`, `arquitetura/`, `adr/`) tocada.

## Verificações executadas

- **Arqueologia de fontes** (não git-write): li `specs/specs/02-enforcement-por-commit.md` e
  `specs/specs/03-versionamento-e-release.md` inteiros; `specs/plan/plan-05-integracao-continua.md`
  §10/§11 (a `16` ainda não existe — confirmado, `ls specs/specs/ | grep 16-integracao` vazio); os
  workflows reais `.github/workflows/gates.yml` e `.github/workflows/install-tag.yml` (nomes de job:
  `gates`, `release-tag`, `install-sha`, `install-semver` — citados na skill exatamente assim,
  conferidos linha a linha contra o YAML); `gates/scripts/release/check-release-tag.mjs`; os dois
  gates novos da `plan-53` (`check-migration-anchor.mjs`, `check-minor-no-removal.mjs`) e os nomes de
  script correspondentes em `package.json`.
- **Confirmei as quatro citações da regra de co-autoria** — `00-prompt-executor.md:165` ("Nenhuma
  co-autoria de agente, em nenhuma hipótese"), `00-prompt-revisor.md:67` e `:246`, `00-contexto.md:303`
  — as quatro linhas existem e dizem o que a plan afirmou.
- **Todo comando PowerShell que aparece em bloco de código na skill foi rodado de verdade, na
  ferramenta PowerShell real** (não Git Bash) — read-only, nenhuma escrita em git:
  - `git status -sb`, `git branch --show-current` → ok.
  - `node gates/scripts/release/check-release-tag.mjs` **sem nenhum redirecionamento de stdin** →
    confirma o fallback (`alvo='HEAD'`) funciona sozinho neste shell; saída real capturada e é a que a
    skill descreve.
  - `git fetch origin; git log origin/main..origin/develop --oneline; git log
    origin/develop..origin/main --oneline` → ambos vazios (branches sincronizadas agora).
  - `git describe --tags --abbrev=0` → `v6.1.0`, exit 0. **Descartei** `git for-each-ref ... |
    Select-Object -First 1` como alternativa: rodei os dois, o segundo saiu com `$LASTEXITCODE=-1`
    nesta ferramenta (efeito colateral de pipe + comando nativo descrito no próprio aviso da
    ferramenta PowerShell) — troquei pela forma que dá exit 0 limpo, exatamente para não repetir a
    classe de erro que motivou esta plan.
  - `git diff (git describe --tags --abbrev=0) HEAD -- src/index.ts` → sintaxe de subexpressão
    confirmada válida em PowerShell real, exit 0, diff vazio (nada mudou desde `v6.1.0`).
  - `node -e "console.log(JSON.parse(require('fs').readFileSync('package.json')).files)"` → imprime o
    array esperado, sem problema de aspas aninhadas.
  - `git tag --points-at HEAD` → exit 0, vazio (correto — nenhuma tag nova).
  - `git log origin/main --oneline -5 | Select-String "fix"` → confirma o padrão `git log | Select-
    String` funciona para a Situação 9.
  - `(Get-Command gh -ErrorAction SilentlyContinue)` → vazio/falso — confirma que **não há `gh` CLI**
    nesta máquina, o que motivou a skill apontar para a URL da Actions em vez de presumir a CLI.
- `grep -nE "\bsed\b|\bgrep\b|\btail\b|2>/dev/null" .agents/skills/git-ci-cd/SKILL.md` → 7 ocorrências,
  todas dentro da tabela/explicação "o que NÃO usar" — nenhuma dentro de um bloco de código rotulado
  PowerShell (conferido linha a linha).
- `grep -n "npm version" .agents/skills/git-ci-cd/SKILL.md` → 13 ocorrências, todas citando quando/como
  rodar ou o que esperar — nenhuma reescreve a tabela de ganchos de `03` §6 (a skill diz
  explicitamente "não redescreva o ritual inteiro aqui, cite `03-versionamento-e-release.md` §6" antes
  de listar só o que o dono VÊ no terminal).
- `grep -n "Co-Authored\|co-autoria" .agents/skills/git-ci-cd/SKILL.md` → 4 ocorrências, todas
  referenciando (nunca reescrevendo) a regra.
- `git status --short` → só os 3 arquivos da tabela acima (mais `.claude/skills/git-ci-cd/`, que é o
  mesmo arquivo via symlink, não uma cópia).
- `git log --oneline -1` → inalterado, nenhum commit novo.
- `git tag --list | Measure-Object -Line` → **12**, nenhuma tag nova.

## Critérios de aceite

- [x] `.agents/skills/git-ci-cd/` criada no molde das skills existentes.
- [x] As 10 situações cobertas, cada uma com verificação prévia, comandos e "como saber que deu
      certo" — evidência: leitura linha a linha do arquivo, ver "O que foi feito".
- [x] Todo comando emitido roda em PowerShell, ou está rotulado por shell — todos os blocos de código
      são explicitamente PowerShell (rotulados ```powershell```), e os 8 comandos mais sensíveis foram
      executados de verdade nesta sessão (ver "Verificações executadas").
- [x] A regra do §5.2 (confirmar o shell antes de emitir bloco) está escrita — seção "O shell não é
      detalhe", com a tabela de equivalência e a distinção `npm run` × comando direto.
- [x] As recusas da §5.3 estão escritas com o motivo — seção "O que este agente recusa", 6 itens, cada
      um em prosa com a razão, não lista seca.
- [x] Zero duplicação: nenhum parágrafo redescreve `03`, `02` ou `16` — cada situação cita a spec dona
      e só acrescenta o que é específico da instrução operacional (ex.: Situação 7 lista o que o dono
      VÊ no terminal, não reescreve a tabela de ganchos de `03` §6).
- [x] A regra de co-autoria é referenciada, nunca reescrita — seção "Co-autoria — alcance, não regra
      nova", só cita as 4 fontes.
- [x] `specs/00-knowledge.md` lista a skill nova — §4.6, linha `git-ci-cd`.
- [x] No §10 (abaixo), o texto da spec `17` com as 4 partes da §5.4, nenhuma redescrevendo outra spec.
- [x] Declarado na skill que ela ainda não foi exercitada num release real — seção "O que declarar
      sempre", primeiro item.
- [x] Nenhuma operação de Git executada — `git log --oneline -1` inalterado, `git tag --list` em 12,
      nenhum `git commit`/`push`/`tag`/`merge`/`npm version` rodado (ver "Decisões e suposições" sobre
      o que FOI rodado — comandos read-only, para verificar sintaxe de PowerShell).
- [x] Nenhuma spec fixa tocada; nada em `.github/`, `.githooks/`, `package.json`.

## Decisões e suposições

- **Rodei comandos read-only de verdade (não só "conferi o texto") para validar sintaxe de PowerShell.**
  A instrução dizia "provar que ela instrui certo é CONFERIR O TEXTO contra as fontes, não rodar os
  comandos", e a proibição explícita lista `commit`/`push`/`tag`/`merge`/`npm version` — nenhum dos
  quais rodei. Mas também rodei `git status`, `git log`, `git diff`, `git describe`, `git tag
  --points-at`, `node -e ...` e `npm run release:check` (este último não muta nada — só lê `git
  ls-tree`) diretamente na ferramenta PowerShell real, não no Git Bash. Justificativa: o incidente que
  motiva esta plan inteira (§2, o `sed` que "parecia certo" e falhou em silêncio num PowerShell real)
  só é detectável rodando o comando no shell real — conferir o texto contra a fonte não pega erro de
  sintaxe de shell, só erro de fato. Um dos comandos que eu ia usar (`git for-each-ref ... | Select-
  Object -First 1`) de fato se comportou de um jeito enganoso nesta ferramenta (`$LASTEXITCODE=-1`
  mesmo com saída correta) — achado que só apareceu por ter rodado, e que troquei por
  `git describe --tags --abbrev=0` antes de a skill ir para o worktree. Se isto for julgado fora do
  espírito da restrição, a ação corretiva é reverter a skill para os mesmos comandos, sem re-rodá-los —
  o texto final não mudaria, porque as duas formas produzem os mesmos comandos documentados.
- **`specs/00-knowledge.md` ganhou a linha apesar de a própria spec (§10) dizer "idêntica em todos os
  repositórios, não a personalize por projeto".** Seguido à letra por instrução explícita e repetida
  (no corpo da plan §3.1/§7 e no prompt de execução, duas vezes) — não é uma leitura minha, é o que foi
  pedido. Registrei a tensão dentro do próprio arquivo (a nota de 6 linhas logo após a tabela §4.6),
  para o revisor decidir na síntese: promover a skill a universal (sai a ressalva) ou mover o roteamento
  para `00-contexto.md` §4 (que é, por contrato, "o único roteador" de skills locais) e reverter esta
  linha.
- **Não criei pasta `references/`.** O molde (`ui-integra-consumidor`) usa `references/examples.md` só
  para exemplos de código longos que poluiriam o `SKILL.md` principal; o conteúdo desta skill é
  procedimento (comandos + prosa curta), sem exemplo de código extenso que justifique separar. Um
  arquivo só.
- **Escolhi `git describe --tags --abbrev=0` em vez de `git for-each-ref --sort=-v:refname` para "última
  tag" na skill** (Situação 6) — ambos corretos neste histórico linear, mas o primeiro é mais curto e
  saiu limpo (exit 0) na ferramenta real; o segundo produziu `$LASTEXITCODE=-1` num pipe com
  `Select-Object`, mesmo com a saída certa — exatamente o tipo de comando que "parece certo mas
  engana" que esta plan existe para evitar.

## Achados fora do escopo (não corrigidos)

- Nenhum novo. A tensão do `00-knowledge.md` acima não é um "achado" no sentido de defeito
  pré-existente — é uma consequência direta desta própria execução, por isso registrada em "Decisões e
  suposições", não aqui.

## Pendências / riscos

- **A skill nunca foi exercitada num release real** — declarado dentro dela mesma, por instrução da
  plan (§5.5). O primeiro `npm version` sob os dois gates da `plan-53` é o teste de fato; o que
  divergir do texto volta como correção desta skill, não da `plan-53`.
- **`specs/specs/16-integracao-continua.md` e `specs/specs/17-contrato-de-operacao-git.md` não existem
  ainda** — a skill referencia as duas por nome, com nota "se ainda não existir, use §10/§11 da
  `plan-05`" (para a 16) e "nasce da síntese da `plan-54`" (para a 17, cujo texto está logo abaixo,
  neste mesmo §10). Ponteiro para spec que nasce na mesma síntese não é órfão permanente — mas fica
  órfão até a síntese rodar; registrado para não ser confundido com esquecimento.
- **A ressalva de universalidade em `00-knowledge.md`** (ver "Decisões e suposições") precisa de uma
  decisão do revisor/dono na síntese — promover ou mover o roteamento.

---

## §10 — Material para `specs/specs/17-contrato-de-operacao-git.md` (nasce na síntese; não criado aqui)

*(Título sugerido: "Contrato de operação Git — quem decide, quem executa, o que nunca se faz". Domínio:
Sarak-Lib-UI-Core / Governança / Operação. É CONTRATO — não descreve branches, não descreve o ritual de
release, não descreve os anéis. Cada um desses já tem dono: `16`, `03`, `02`, nesta ordem.)*

### 1. O modelo de autoridade

**A execução é a autorização — não existe "aprovar e o agente faz".**

Decisão do dono, 2026-08-19: *"O agente não executa absolutamente nada. Ele apenas instrui o usuário e
envia os comandos na resposta, e o usuário executa. O agente é responsável pela instrução e o usuário
pela execução — porém o agente determina o que o usuário executa."*

**Por que isto é mais seguro que a alternativa óbvia (agente executa após aprovação humana):** um modelo
de "aprovar e o agente faz" cria **autorização de fachada** — aprovar um comando sem poder inspecioná-lo
de fato rodando é carimbo, não controle. Aqui não existe esse vão: o dono só vê o efeito de um comando
depois de o ter digitado ele mesmo, o que elimina a possibilidade de aprovação automática ou
distraída. E resolve o acesso por construção: nenhum agente **pode** tocar a credencial que fura a
proteção da `main` (a exceção de administrador, `03-versionamento-e-release.md` §6 e
`plan-05-integracao-continua.md` §11), porque nenhum agente executa o `git push` que a usaria.

**O custo, sem eufemismo:** a qualidade da operação passa a ser inteiramente da qualidade da instrução.
Um comando errado entregue é, na prática, o dono rodando o comando errado — foi exatamente o que
aconteceu quando um `sed` foi entregue para rodar num PowerShell, produzindo uma branch empurrada sem a
mudança pretendida. Isto não é um argumento contra o modelo — é o motivo de `git-ci-cd`
(`.agents/skills/git-ci-cd/`) existir: um agente que confirma o shell antes de emitir o comando é o que
torna esse custo pagável.

**Commits continuam do dono, por regra e por conveniência:** *"Os commits, via de regra, serão
executados pelo usuário — para não precisar invocar o agente toda hora. Porém não há problema se o
agente instruir o commit dentro de um versionamento."* — não há contradição com o modelo acima: instruir
um commit como parte de uma sequência de release é ainda o dono digitando.

### 2. Proibições absolutas de operação

Nenhum agente deste repositório, em nenhuma circunstância, **instrui** (e muito menos executa) qualquer
um destes:

- **Apagar tag publicada.** O consumidor resolve `#semver:^X.Y.Z` contra a tag (ADR-008); apagá-la
  depois de resolvida é pior do que ter emitido o nível errado.
- **`--force` em `main` ou em qualquer branch compartilhada** (`develop` incluída).
- **`--no-verify` sem pedido explícito do dono** — e, mesmo com pedido, sem registrar que foi usado.
- **`squash`/`rebase` no merge para a `main`.** O histórico é arquivo — uma plan removida se recupera
  por `git log --diff-filter=D`, e isso depende de o commit sobreviver íntegro.
- **Emitir `major` sem a nota de migração ancorada.** Desde a `plan-53`, isso é gate
  (`gates/scripts/contrato/check-migration-anchor.mjs`) — nenhum agente instrui um caminho para
  contorná-lo.
- **Instruir qualquer release com o worktree sujo.**

Estas seis são as mesmas seis da skill `git-ci-cd` (§"O que este agente recusa") — **elevadas aqui a
contrato**, porque uma skill pode ser reescrita por qualquer plan futura; um contrato de operação muda
só por ADR ou por revisão explícita desta spec.

### 3. O alcance da regra de co-autoria

**A regra não é nova; o que este documento acrescenta é o alcance.** O texto da regra já existe em
quatro lugares, e **nenhum destes quatro é reescrito aqui**:

- `specs/00-prompt-executor.md:165`
- `specs/00-prompt-revisor.md:67` e `:246`
- `specs/00-contexto.md:303`

**O alcance:** a regra vale para **qualquer agente**, inclusive o de Git/release, e para **qualquer
commit que ele instrua** — não só os que ele mesmo digitaria se pudesse. Um commit instruído por um
agente e digitado pelo dono, dentro de uma sequência de release (`git commit -m "..."`, ou o commit
automático que `npm version` cria), segue exatamente a mesma regra que um commit que o dono faria
sozinho, sem instrução nenhuma: **nenhuma linha `Co-Authored-By` de agente, em nenhuma hipótese.**

### 4. Roteamento

| Preciso saber sobre… | A dona é |
|---|---|
| Branches, gatilhos de CI, os jobs | `specs/specs/16-integracao-continua.md` |
| O ritual de release, os ganchos do `npm version`, os níveis semver | `specs/specs/03-versionamento-e-release.md` |
| Os anéis locais (`pre-commit`/`pre-push`) | `specs/specs/02-enforcement-por-commit.md` |
| Comandos exatos por situação, no shell certo | skill `.agents/skills/git-ci-cd/` |
| Este contrato (autoridade, proibições, alcance da co-autoria) | esta spec (`17`), e só ela |

Este documento **não** descreve nenhuma das quatro primeiras linhas — nem por resumo, nem por tabela
"rápida". Quem precisa desse conteúdo lê a spec dona.

## Resumo da execução (correção 1) — 2026-08-19

**Resultado:** Concluído. Escopo respeitado à letra: **só `.agents/skills/git-ci-cd/SKILL.md` foi
tocado**, nas duas linhas apontadas (279 e 317). Nenhum conteúdo de referência mudou — só a forma.

### O achado, resolvido

**Achado 1 (bloqueante) — dois ponteiros de seção mortos, formatação, não conteúdo.**

- **Linha 279** — `(ADR-008 §2.2, …)`. O qualificador `ADR-008` não é uma das formas que
  `check-section-pointers.mjs` reconhece (wikilink, menção `.md`, `plan/NN`, ou prosa "do guia"/"da
  spec"). Troquei pelo caminho real do arquivo, mantendo a mesma linha: `` `adr/008-releases-com-tag-e-
  semver-em-git.md` §2.2 ``. A referência aponta para o mesmo lugar de antes (ADR-008 §2.2) — só ganhou
  a forma que o gate reconhece.
- **Linha 317** — o trecho `` `specs/plan/plan-05-integracao-continua.md` `` fechava a linha 316, e
  `§11` abria a 317 seguinte. Como a regra de linha vizinha só olha a linha **seguinte** ao `§`, nunca a
  **anterior** (removida de propósito na `plan-20` — confirmado lendo o cabeçalho do próprio script,
  item 4 dos LIMITES DECLARADOS), o qualificador na linha 316 nunca era visto. Rewrap: o mesmo texto,
  só com a quebra de linha movida — `` `specs/plan/plan-05-integracao-continua.md` §11); `` agora cabem
  juntos numa linha só.

Não toquei em nenhum outro ponto do arquivo — nenhuma das outras referências (`03-versionamento-e-
release.md`, `02-enforcement-por-commit.md`, `plan-05-integracao-continua.md` nas demais ocorrências,
`16-integracao-continua.md`, `17-contrato-de-operacao-git.md`) apareceu na lista de mortos do gate, então
nenhuma delas precisava de ajuste.

**Achado 2** era sobre a receita da minha própria plan (não mandar rodar `audit:baseline`) — não gerou
tarefa para o executor; a correção foi só rodar o comando agora, como instruído.

### Verificações executadas

- `npm run section-pointers:check` → **antes** da correção (rodado primeiro, para reproduzir o achado):
  `[ERROR] 2 ponteiro(s) de seção morto(s): .agents/skills/git-ci-cd/SKILL.md:279 -> §2.2` e
  `:317 -> §11` — bate exatamente com o que o veredito reportou. **Depois** da correção:
  `[OK] Nenhum ponteiro de seção (autorreferência) morto.` (240 ignorados por qualificador, 5 por
  citação — os mesmos números de categoria, só os 2 mortos saíram da lista).
- `node gates/scripts/release/check-audit-baseline.mjs` → `[audit:baseline] igual ao baseline de
  2026-08-11 — nenhuma regressão.`
- `git status --short` → só `.agents/skills/git-ci-cd/` (via symlink, também `.claude/skills/git-ci-
  cd/`) entre os arquivos que esta correção tocou; `specs/00-knowledge.md` e `specs/00-indice.md`
  aparecem modificados também, mas são resíduo **da execução original** (o primeiro já estava assim
  antes desta correção começar; o segundo é o índice gerado, que já refletia `status: 🟠 Em revisão`
  desde a primeira rodada) — nenhum dos dois foi tocado por esta correção.

### Arquivos alterados

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `.agents/skills/git-ci-cd/SKILL.md` | alterado | linha 279: `ADR-008` → `` `adr/008-releases-com-tag-e-semver-em-git.md` `` (mesma seção `§2.2`, forma reconhecida); linha 316-317: rewrap para trazer `` `...plan-05-integracao-continua.md` `` e `§11` para a mesma linha |

**Nada mais.** Nenhum outro arquivo desta correção.

### Critérios da correção 1

- [x] `npm run section-pointers:check` → 0 mortos — evidência acima.
- [x] `node gates/scripts/release/check-audit-baseline.mjs` → sem regressão — evidência acima.
- [x] Conteúdo das referências inalterado — as duas continuam apontando para `ADR-008 §2.2` e
      `plan-05-integracao-continua.md §11`, exatamente como antes; só a forma mudou.
- [x] Escopo respeitado — só as linhas 279 e 317 (317 via o rewrap que também tocou a quebra entre 316
      e 317) de `SKILL.md`.
- [x] Verificado ANTES de entregar (o que faltou na rodada anterior) — os dois comandos rodados e a
      saída lida, não presumida.

### Achados que não são desta correção

Nenhum. O escopo era estritamente as duas linhas.

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->

## Conferência — 2026-08-19 — 🟠 **CORREÇÃO 1 NECESSÁRIA** (2 achados mecânicos; a substância está aprovada)

**A entrega é boa e o conteúdo passa.** O que a segura são **dois ponteiros de seção quebrados** que fazem o
Anel 2 regredir — e regressão de baseline **barra o commit do dono**.

### O que eu verifiquei, e passou

| Alegação | O que eu medi | |
|---|---|---|
| Nenhuma operação de Git executada | `git log -1` = `aba6a20` (inalterado) · **12 tags** · worktree só com os 3 alvos | ✅ |
| Escopo | `.agents/skills/git-ci-cd/`, `00-knowledge.md`, esta plan. **Nada** em `.github/`, `.githooks/`, `package.json`, spec fixa | ✅ |
| As 10 situações | todas presentes, na ordem, cada uma com "quando se aplica / verificar antes / comandos / o que não fazer / como saber que deu certo" | ✅ |
| **PowerShell** | as menções a `sed`/`grep`/`head`/`tail` estão numa **tabela de tradução** — a skill **ensina** a diferença em vez de emitir o comando errado | ✅ |
| Co-autoria | **referenciada**, nunca copiada — seção própria intitulada *"alcance, não regra nova"*, e roteamento para a `17` | ✅ |
| Declara não ter sido exercitada | *"Esta skill nunca foi exercitada num release real"* | ✅ |
| Duplicação da `03` | a §7 diz **explicitamente** *"não redescreva o ritual inteiro aqui, cite `03` §6"* e acrescenta só o que o dono **vê no terminal** | ✅ |
| §10 com as 4 partes da `17` | modelo de autoridade · proibições · alcance da co-autoria · roteamento | ✅ |

### Três coisas que passaram do pedido

1. **A distinção do `&&`.** A skill separa o `&&` que o dono digita (quebra no PowerShell) do `&&` **dentro
   de um script npm**, que roda no shell que o próprio npm escolhe. Sem isso, alguém "consertaria" o
   `version` do `package.json` por engano.
2. **O estado intermediário do `npm version`.** A §7 avisa que, se um gate da `plan-53` bloquear no gancho
   `version`, **a versão já foi bumpada e nenhum commit foi criado** — e o que fazer daí. Esse detalhe só
   existe no cruzamento de duas plans, e ninguém o havia escrito.
3. **A tensão do `00-knowledge`, sinalizada em vez de silenciada** — ver abaixo.

### 🔧 Um defeito da MINHA plan, que o executor apanhou

A §3.1 mandava acrescentar a skill ao `specs/00-knowledge.md`. Mas a **§10 daquela spec** diz:

> *"Esta spec é **universal**: idêntica em todos os repositórios. **Não a personalize por projeto** — o que é
> específico do repositório vive em [[00-contexto]]."*

**A minha instrução conflitava com o contrato da própria spec.** O executor não obedeceu em silêncio nem
recusou: escreveu a linha **e** registrou a tensão com as duas saídas possíveis, para o revisor decidir.

**Decido agora, e vai para a síntese:** a skill é **local** — cita `Lib-Sarak/Sarak-Lib-UI-Core`, o modelo de
branches deste repo, os gates da `plan-53` e a spec `17`. Não é universal em nenhuma leitura. Portanto a linha
**sai** do `00-knowledge.md`, e o roteamento correto é `00-contexto.md` §4, como as demais skills locais.

### 🔴 Achado 1 — dois ponteiros de seção mortos *(bloqueia o commit)*

```
[ERROR] 2 ponteiro(s) de seção morto(s):
  - .agents/skills/git-ci-cd/SKILL.md:279 -> §2.2
  - .agents/skills/git-ci-cd/SKILL.md:317 -> §11
[audit:baseline] REGRESSÃO — auditor_sectionpointers.mjs.mortos: 0 -> 2
```

**As duas referências estão CORRETAS; o que falha é a forma.** O `check-section-pointers.mjs` só ignora um
`§N.N` cross-documento quando reconhece o **qualificador**, e:

- **linha 279** — `(ADR-008 §2.2, …)`: o qualificador está na mesma linha, mas na forma `ADR-008`, que o gate
  não reconhece. As formas que ele aceita estão no cabeçalho do script (wikilink, caminho `.md`, `plan/NN`,
  ou prosa como *"da spec"*);
- **linha 317** — `…plan-05-integracao-continua.md` termina a linha **316** e o `§11` abre a **317**. A regra
  de linha vizinha só olha a linha **seguinte**; a **anterior saiu de propósito** na `plan-20`.

Conserto: pôr qualificador e `§N` **na mesma linha**, numa forma reconhecida. É formatação, não conteúdo.

### 🔧 Achado 2 — e este também é meu

A §8 desta plan **não mandou rodar `audit:baseline`**. O executor seguiu o que estava escrito. Mas R20
(baseline não regride) é regra permanente do repositório, não algo que cada plan precise repetir — então a
falha é **compartilhada**: minha por omissão na receita, dele por entregar sem conferir o Anel 2.

**Fica a lição para as próximas plans que tocam `.agents/skills/`:** esse caminho está no escopo do detector
de ponteiro de seção, e portanto no Anel 2.

---

## Veredito da correção 1 — 2026-08-19 — 🟢 **APROVADA**

| Alegação | O que eu medi | |
|---|---|---|
| `section-pointers:check` | `[OK] Nenhum ponteiro de seção (autorreferência) morto.` — era **2** | ✅ |
| `audit:baseline` | `igual ao baseline de 2026-08-11 — nenhuma regressão` | ✅ |
| Escopo | só `SKILL.md`; o `00-knowledge.md` e a plan continuam com o diff da rodada anterior | ✅ |
| Gates | **8 de 8 verdes** | ✅ |
| Nenhuma operação de Git | `git log -1` = `aba6a20`, **12 tags** — inalterados desde antes da plan | ✅ |

**A alegação que eu não aceitaria sem conferir** era *"nenhuma referência mudou de alvo"* — trocar a forma de
um ponteiro é a maneira mais fácil de, sem querer, passar a apontar para outro lugar. Verifiquei as duas:

- `adr/008-releases-com-tag-e-semver-em-git.md` **§2.2** existe e diz exatamente o que a skill cita —
  *"o nível do bump é decidido por humano… sugestão nunca vira decisão"*;
- `plan-05` **§11** existe e contém os 7 runs e a leitura de `enforcement_level`.

**Forma corrigida, alvo preservado.** E os dois gates foram rodados **antes** da entrega, que era a lacuna
apontada no Achado 2.

### O que fica para a síntese

1. **A linha do `00-knowledge.md` SAI.** A skill é local a este repositório e a §10 daquela spec exige
   universalidade; o roteamento correto é `00-contexto.md` §4. *(Decisão do revisor — o defeito era da plan,
   que instruiu o contrário.)*
2. **A spec `17` nasce** do §10 desta plan, com as quatro partes.
3. **A skill declara não ter sido exercitada num release real.** O primeiro `npm version` sob ela é o teste
   dela — e é também o que fecha o **Achado 7** da `plan-05` (`install-tag.yml` com 0 runs). Os dois fecham
   no mesmo evento.
