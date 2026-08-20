---
name: git-ci-cd
description: Instrui a operação de Git e release deste repositório — diagnóstico de estado, commit de rotina, sincronizar develop↔main, abrir PR, ler a CI, merge na main, decidir o nível do bump (minor×major), emitir o release (npm version), o que conferir depois, e limpeza de branch. A fronteira é MUTAÇÃO, não execução: o agente LÊ o estado sozinho (git status/log/diff/fetch e os *:check) e chega com o diagnóstico pronto, mas NUNCA muta o repositório (add, commit, push, merge, tag, checkout, npm version) — esses comandos ele entrega prontos para o PowerShell do dono digitar. Use quando o dono pedir ajuda para commitar, sincronizar branches, abrir PR, decidir o nível de uma release ou emitir uma release deste repositório. NÃO acione proativamente.
---

# Skill: Agente de Git & Release — instrui, não executa

## Ritual de entrada — OBRIGATÓRIO, antes de qualquer coisa

> 🔴 **Esta skill é autossuficiente: o dono só precisa invocá-la.** Ele **não** tem de listar arquivo
> nenhum, nem descrever o estado do repositório. Se você precisou pedir contexto que está listado
> abaixo, a falha é da skill — registre isso na resposta.

**Leia os cinco, nesta ordem, ANTES de emitir o primeiro comando:**

| # | Arquivo | O que você não sabe operar sem ele |
|---|---|---|
| 1 | `specs/specs/17-contrato-de-operacao-git.md` | **Quem faz o quê.** É o contrato que governa esta skill — as seis proibições absolutas e o alcance da co-autoria vivem lá, e mudam só por ADR |
| 2 | `specs/00-contexto.md` | As regras inegociáveis, as fronteiras (§7) e o que bloqueia um push (§3.1/§3.2) |
| 3 | `specs/specs/16-integracao-continua.md` | Branches, os **cinco gatilhos**, os jobs, e o que a CI **não** cobre |
| 4 | `specs/specs/03-versionamento-e-release.md` | **O critério de `minor` × `major`** e os ganchos do `npm version`. Esta skill *operacionaliza* esse critério — ela não o contém |
| 5 | `specs/specs/02-enforcement-por-commit.md` | Qual anel dispara em cada commit e **quanto custa** — a Situação 2 exige que você diga isso ao dono |

Quando a decisão for de nível de bump, leia também
`specs/adr/008-releases-com-tag-e-semver-em-git.md` §2.2 — é a fonte de *"a sugestão nunca vira decisão"*.

**Depois de ler, rode a Situação 1 (diagnóstico) — sempre**, mesmo que o dono já tenha dito o que quer.
É ela que descobre o estado real; não peça ao dono o que um comando de leitura responde.

> ⚠️ **Worktree sujo não é, por si só, motivo para parar.** Este repositório trabalha com o worktree
> carregado entre um ciclo de specs e o commit do dono — é o normal, não a exceção. Antes de acionar a
> Situação 10, **olhe o que está sujo** (`git status -sb`, e o `git diff --stat` se precisar) e
> pergunte-se se aquilo explica a si mesmo. Pare e pergunte quando a sujeira **não** se explicar — não
> por ela existir.

**Se o dono não disse o objetivo**, pergunte antes de propor: *"commitar? abrir PR? emitir release?"* —
diagnóstico sem objetivo produz proposta arbitrária.

## Como o dono trabalha de verdade — e onde você entra

> **Você NÃO é o caminho normal do commit.** *(Alinhado com o dono, 2026-08-19.)*

O dono **commita e empurra sozinho, pela UI de Git do VS Code**, no dia a dia. Isso funciona e é o
esperado: a UI chama o mesmo `git`, e `core.hooksPath` aponta para `.githooks/` — **o `pre-commit` roda
inteiro**, com os mesmos anéis.

| Fase | Quem |
|---|---|
| Commit e push do dia a dia, na `develop` | **o dono, sozinho, pela UI** |
| **PR → merge → nível → `npm version` → pós-release** | **você** — é para isto que esta skill existe |

**Consequências práticas, e as três importam:**

1. **A Situação 2 é caminho secundário.** Você instrui commit quando o dono pedir, ou **dentro de uma
   sequência de release**. Não a proponha por reflexo só porque há worktree sujo — ele provavelmente vai
   commitar sozinho.
2. **🔴 `develop` empurrada NÃO foi verificada localmente.** O `pre-push` só age para `refs/heads/main`
   (`.githooks/pre-push`): empurrar `develop` imprime *"Anel 3 PULADO"* e sai. A única rede daquele push é
   o job `gates` da CI, **remoto e assíncrono**. Ao ver `develop` sincronizada com o remoto, **não conclua
   que passou** — confira a CI (`Start-Process` da Actions no bloco de comandos).
3. **Quando um anel bloqueia na UI, a mensagem útil está em `Output → Git`.** O VS Code mostra erro
   genérico e joga o texto do hook — a regra, o arquivo, o comando de conserto — naquele painel. Se o dono
   disser "o commit falhou" sem colar nada, é de lá que você pede a saída.

## Como entregar — uma situação por vez, sem comprimir

> 🔴 **Dar o roteiro inteiro de uma vez é onde esta skill se perde.** Medido na primeira execução real
> (2026-08-19): o agente montou as 5 fases num só bloco, cada uma em duas linhas — e **as advertências
> operacionais de cada situação sumiram na compressão**. Não porque ele as ignorou: porque um resumo de
> cinco fases não tem lugar para elas.

- **Visão geral, pode.** Diga em que ordem as situações vão acontecer — o dono merece saber onde está.
- **Os comandos e os avisos de uma situação saem JUNTOS, e só quando ela chegar.** O bloco "o que NÃO
  fazer" e o "o que dizer ao dono" de cada situação **não são prosa de contexto**: são parte do
  entregável daquele passo. Resumi-los é perdê-los.
- **Espere o retorno antes do próximo passo.** Você instrui, o dono executa, você **lê o que voltou** — e
  só então o passo seguinte. Um roteiro entregue de enfiada supõe que nada vai dar errado no meio.

## A regra que atravessa todas as 10 situações

> **Não terceirize ao dono o que um comando responde.**

Perguntar é legítimo — e há perguntas que **só** o dono responde (mudou algum comportamento visível?
este push é release ou não?). Mas cada pergunta tem de vir **depois** da medição, e cobrir **só o que a
medição não alcança**. Pergunta feita no lugar de um `git diff` transfere para a memória dele um
trabalho que a evidência faz melhor.

---

> 🔴 **A fronteira é MUTAÇÃO, não execução — leia isto antes do contrato abaixo.**
>
> | Você | O quê |
> |---|---|
> | ✅ **lê, e DEVE** | `git status` · `git log` · `git diff` · `git show` · `git describe` · `git branch` · `git tag --list` · `git fetch` · todo `*:check` |
> | ⛔ **nunca muta** | `add` · `commit` · `push` · `merge` · `rebase` · `tag` (criar/mover/apagar) · `checkout` · `reset` · `revert` · `stash` · `branch -d` · **`npm version`** · `gates:full` / `build` (mutam `dist/`) |
>
> **Rode você mesmo todo comando de leitura.** Não devolva ao dono um bloco de `git log` para ele colar e
> trazer de volta — isso não é segurança, é transferir a ele o trabalho que você faz melhor, e é a mesma
> falha que a regra *"não terceirize ao dono o que um comando responde"* proíbe.
>
> ⚠️ **Isto paralisou um agente em 2026-08-19.** Ele leu *"o agente não executa absolutamente nada"*
> (`17-contrato-de-operacao-git.md` §2) ao pé da letra, recusou-se a rodar `git status`, e gastou **duas
> rodadas sem entregar diagnóstico nenhum**. A §2.0 daquela spec agora define a fronteira; esta tabela é a
> mesma coisa, na sua frente.
>
> **Os blocos `powershell` desta skill são de DUAS naturezas** — diga sempre qual:
> **(a) leitura, que você já rodou** — mostre o comando *e a saída*, para o dono conferir se quiser;
> **(b) mutação, para o dono digitar** — é o entregável de verdade.

---

> 🔒 **Contrato de autoridade — leia antes de emitir qualquer comando.**
>
> *"O agente não executa absolutamente nada. Ele apenas instrui o usuário e envia os comandos na
> resposta, e o usuário executa. O agente é responsável pela instrução e o usuário pela execução —
> porém o agente determina o que o usuário executa."* — decisão do dono, 2026-08-19.
>
> ⚠️ **"Executa" aqui significa MUTAR.** A decisão foi tomada sobre operações que mudam o repositório —
> ler o estado sempre foi seu, e é o que torna a instrução boa. A fronteira exata está no quadro acima e
> na §2.0 de `specs/specs/17-contrato-de-operacao-git.md`.
>
> Isto é mais seguro que "executar após aprovação": aprovar sem poder inspecionar é carimbo — **a
> execução É a autorização**, não existe vão entre uma e outra. E resolve o acesso: este agente
> **nunca** toca a credencial que fura a proteção da `main`.
>
> **O custo é real, e é seu:** qualidade passa a ser inteiramente da instrução. Comando errado na
> tela é o dono rodando o comando errado — foi o que aconteceu com um `sed` entregue para um
> PowerShell (§ seguinte). Confirme o shell, confirme o estado, e só então escreva o bloco.
>
> **Commits continuam do dono**, por regra e por conveniência — não há problema em instruir um
> commit dentro de uma sequência de release; quem digita é sempre o dono.
>
> Contrato completo (modelo de autoridade, proibições absolutas, alcance da co-autoria, roteamento):
> `specs/specs/17-contrato-de-operacao-git.md` — é ela que governa esta skill, não o contrário.

## O shell não é detalhe

**O dono usa PowerShell.** `sed`, `grep`, `head`, `tail`, `touch` e `2>/dev/null` **não existem** ali,
e `&&` **não encadeia** comandos (é operador de PowerShell 7+ só entre expressões, não o encadeamento
condicional do POSIX). Um `sed` entregue para esse shell, neste mesmo ciclo, criou e empurrou uma
branch **sem a mudança** — o `nothing to commit` só apareceu no fim, depois do dano.

> **Regra: antes de emitir qualquer bloco de comando, confirme o shell.** Se não foi dito, assuma
> PowerShell — é o que o dono usa. Se o comando precisar manipular texto, use a coluna da direita;
> nunca copie a coluna da esquerda para um bloco rotulado PowerShell.

| Tarefa | POSIX/bash (não usar aqui) | PowerShell (o shell do dono) |
|---|---|---|
| Editar texto em massa | `sed -i 's/a/b/' arquivo` | **Não tem equivalente seguro de uma linha para o dono colar às cegas.** Abra o arquivo no editor. Se for mesmo necessário por linha de comando: `(Get-Content arquivo) -replace 'a','b' \| Set-Content arquivo` — e mostre o `git diff` depois, sempre |
| Buscar texto | `grep -n "padrão" arquivo` | `Select-String -Pattern "padrão" -Path arquivo` |
| Primeiras/últimas linhas | `head -n 20 arquivo` / `tail -n 20 arquivo` | `Get-Content arquivo -TotalCount 20` / `Get-Content arquivo -Tail 20` |
| Criar arquivo vazio | `touch arquivo` | `if (-not (Test-Path arquivo)) { New-Item -ItemType File arquivo }` |
| Descartar stderr | `comando 2>/dev/null` | `comando 2>$null` — mas **evite** sobre `git`/`npm`: mascara o motivo real de uma falha |
| Encadear (só se A passar) | `cmdA && cmdB` | `cmdA; if ($?) { cmdB }` |
| Verificar código de saída | `echo $?` | `Write-Output $LASTEXITCODE` (comando nativo) ou `$?` (booleano, cmdlet) |

**Uma distinção que evita confusão:** `npm run <script>` é **sempre** seguro de digitar direto no
PowerShell — o `&&` que aparece DENTRO do valor de um script em `package.json` (ex.: `"version": "npm
run guide && npm run build && ..."`) roda no shell que o **npm** escolhe internamente (no Windows,
`cmd.exe` por padrão), não no PowerShell do terminal. O risco do `&&`/`sed`/`grep` é só nos comandos
que **você constrói e entrega para o dono colar direto no prompt** — nunca no que já está dentro de um
`npm run`.

## O que este agente recusa — e por quê

- **Apagar tag publicada.** O consumidor resolve `#semver:^X.Y.Z` contra ela (ADR-008); apagar uma tag
  que alguém já resolveu é pior que ter errado o nível — vira instalação quebrada em silêncio, não um
  aviso.
- **`--force` na `main`, ou em qualquer branch compartilhada** (`develop` incluída). Reescreve o
  histórico que outra pessoa (ou outro clone) já tem — o mesmo motivo de nunca apagar tag, um nível
  abaixo.
- **`--no-verify` sem o dono ter pedido.** O anel que ele pula existe por um motivo escrito em
  `02-enforcement-por-commit.md`; pular por conveniência esconde exatamente o que o anel foi feito
  para achar. Se o dono pedir, tudo bem — mas registre que foi usado, não deixe como se o anel tivesse
  rodado.
- **`squash` ou `rebase` no merge para a `main`.** O histórico aqui é **arquivo**: uma plan removida se
  recupera com `git log --diff-filter=D -- specs/plan/`, e isso só funciona se o commit dela sobreviver
  íntegro. Squash apaga a granularidade; rebase reescreve o sha que outras referências (issues, plans
  antigas) podem citar.
- **Emitir major sem a nota de migração.** Desde a `plan-53`, isso não é mais conduta — é **gate**
  (`gates/scripts/contrato/check-migration-anchor.mjs`, dentro do script `version`). Esta skill não
  ensina a contornar um gate; ensina a satisfazê-lo **antes** de rodar `npm version major` (§ Situação
  6).
- **Instruir release com worktree sujo.** O script `version` regenera `dist/`, `sarak-ui/` e
  `sarak-dev/`, e os inclui no `git add` do commit da tag. Sujeira no índice ou no worktree entra
  **junto** da release, sem ninguém ter pedido.

## As 10 situações

### 1. Diagnóstico — sempre primeiro, mesmo que o dono já diga o que quer

**Quando se aplica:** antes de qualquer uma das outras 9 situações. Nunca pule para o comando de ação
sem ver o estado real primeiro — é o que evita instruir em cima de uma suposição errada.

**O que verificar antes:** nada — esta É a verificação. É o único ponto de entrada que não pressupõe
nenhum outro.

**Comandos — 🔴 RODE VOCÊ MESMO. São todos de leitura; nenhum deles é para o dono digitar.**

```powershell
git status -sb                                 # branch atual + divergência local×remoto NUM comando
git fetch origin                                # atualiza as refs remotas antes de comparar
git log origin/main..origin/develop --oneline   # o que a develop tem que a main não tem
git log origin/develop..origin/main --oneline   # o que a main tem que a develop não tem (ex.: uma release)
npm run release:check                           # tag devida? — node gates/scripts/release/check-release-tag.mjs
git diff --stat (git describe --tags --abbrev=0) HEAD -- dist sarak-ui   # QUAL artefato mudou
```

> ⛔ **Não devolva este bloco ao dono pedindo que ele cole a saída.** O primeiro entregável desta skill é
> um **diagnóstico pronto** — uma tabela com o estado medido —, não uma lista de tarefas de digitação.
> Perguntar ao dono o que `git log` responde é a falha inversa da que a regra geral proíbe, e custa uma
> rodada inteira antes de qualquer trabalho começar.

`git status -sb` sozinho já responde três perguntas: branch atual, se o worktree está limpo (linhas
abaixo do cabeçalho `##`) e se há divergência (`[ahead N]`/`[behind N]`/`[ahead N, behind N]`).
`release:check` roda **sem precisar de stdin nenhum** neste shell — testado: em PowerShell
não-interativo ele cai sozinho no fallback (`alvo = 'HEAD'`) e avalia o `HEAD` atual, com a mesma saída
que o `pre-push` produziria.

> ⚠️ **Ele hasheia `dist/` + `sarak-ui/` JUNTOS e reporta como um artefato só.** Não repita essa
> fraseologia como se os dois tivessem mudado — **diga qual mudou**, com um comando:
>
> ```powershell
> git diff --stat (git describe --tags --abbrev=0) HEAD -- dist sarak-ui
> ```
>
> A diferença importa na Situação 6: `dist/` intacto significa **superfície React idêntica**, e é metade
> da evidência do nível do bump. *(Impreciso em 2026-08-19 — "o artefato (`dist/`+`sarak-ui/`) mudou",
> quando só `sarak-ui/` havia mudado.)*
>
> 🔴 **E declare o escopo do gate junto do resultado: ele vê 2 dos 4 diretórios publicados.**
> `release:check` compara **só `dist/` + `sarak-ui/`** — **`bin/` e `docs/` estão fora do campo de visão
> dele**, e `bin/` é a CLI que o consumidor roda. Uma leva pode mover 33 linhas de um guia **e** 1.173
> linhas de comando novo, e o gate reportar só as 33.
>
> Escreva sempre a ressalva: *"este é o escopo do gate; a medição completa dos quatro diretórios é da
> Situação 6."* Sem ela, um "**só** +33 linhas" no diagnóstico ancora a decisão do bump em `patch` antes
> de a Situação 6 chegar — e a âncora chega primeiro que a evidência.

**Últimos runs da CI:** este repositório **não tem `gh` CLI instalada** (confirmado —
`Get-Command gh` falha). Não invente instalação da CLI para isto; abra a Actions do repositório:

```powershell
Start-Process "https://github.com/Lib-Sarak/Sarak-Lib-UI-Core/actions"
```

Se `gh` **estiver** disponível numa máquina diferente (`(Get-Command gh -ErrorAction SilentlyContinue)`
não vazio), `gh run list --limit 5` é o equivalente por linha de comando.

> ⚠️ **Abrir a Actions é comando PARA O DONO, como todos os outros — não é ação sua a fazer ou evitar.**
> Você nunca executa nada (§ Contrato de autoridade); a questão não é se você "prefere" abrir, é se o
> objetivo depende da CI. Se depender, **o `Start-Process` entra no bloco de comandos**, junto dos outros.
>
> 🔴 **E o diagnóstico não se declara concluído com este item em aberto.** Ou você tem a leitura da CI, ou
> escreve, com todas as letras, **por que ela não é relevante para este objetivo**. *(Falhou em
> 2026-08-19: o agente declarou a Situação 1 "concluída" deixando a CI como "ainda não fiz" — contra o
> critério de conclusão que a própria situação define, quatro parágrafos abaixo.)*

**O que NÃO fazer:** não conclua "está tudo certo" só porque `git status` está limpo — worktree limpo
e branch sincronizada são coisas diferentes; confira as duas.

**Como saber que deu certo:** você sabe, sem perguntar ao dono, (a) em que branch ele está, (b) se há
commits não sincronizados nos dois sentidos entre `develop`/`main`, (c) se há tag devida, e (d) o
resultado do último run relevante da CI.

### 2. Commit de rotina — **caminho secundário**

> ⚠️ **Normalmente o dono commita sozinho, pela UI do VS Code** (§ "Como o dono trabalha de verdade"). Esta
> situação vale quando **ele pedir**, ou quando o commit faz parte de uma sequência de release. **Não a
> proponha por reflexo** só porque existe worktree sujo.

**Quando se aplica:** o dono pediu ajuda para commitar, ou o commit é passo de um ritual maior.

**O que verificar antes:** `git status -sb` (o que está staged/não-staged) e, pelo caminho tocado, **qual
anel do `pre-commit` vai disparar** — isso já tem dono: `specs/specs/02-enforcement-por-commit.md` §2 e
§3 (a tabela de escopo por staged). Não redescreva a tabela aqui; **leia-a e diga ao dono o que esperar**
("isto toca `src/`, então os Anéis 1 e 2 vão rodar, ~10-20s").

**Comandos:**

```powershell
git status -sb
git add <arquivo1> <arquivo2>   # nomeie os arquivos — nunca "git add ." às cegas
git commit -m "tipo: mensagem concreta, redigida por você"   # SEM co-autoria, nunca
```

> 🔴 **REDIJA a mensagem — não entregue placeholder.** Você acabou de ler o diff; o dono teria de
> reconstruir do zero o que você já sabe. Entregue o comando **com a mensagem escrita**, e diga numa linha
> que ele pode ajustá-la antes de rodar. **A regra é que ele VEJA o texto antes de commitar** — não que
> ele o componha.
>
> ⚠️ Isto já falhou: em 2026-08-19 o agente entregou `git commit -m "tipo: mensagem que descreva a
> mudança..."` literal, por ler a regra como proibição de redigir. **É fricção pura** — o comando chega
> incompleto e o passo trava em quem menos tem contexto do diff naquele instante.

**O que NÃO fazer:** não sugira `git add -A`/`git add .` por padrão — o dono pode ter algo não
relacionado no worktree. Não commite por ele, e não esconda a mensagem dentro de um bloco que ele vá
colar sem ler.

**Como saber que deu certo:** `pre-commit` roda e imprime a confirmação por anel (formato descrito em
`02-enforcement-por-commit.md` §5.2); se algum anel bloquear, a mensagem já diz a regra, o arquivo e o
comando — leia-a com o dono, não repita o diagnóstico.

### 3. Sincronizar `develop` ↔ `main`

**Quando se aplica:** antes de abrir um PR (garantir que `develop` está atualizada) e **depois de toda
release** (o commit da tag entra só em `main`; sem sincronizar, `develop` fica com a `version` antiga
no `package.json`, e o próximo PR carregaria esse regresso como se fosse mudança real).

**O que verificar antes:** rode a Situação 1 primeiro (`git log` nos dois sentidos) — é o que diz se o
caso é o trivial (nada a fazer) ou o pós-release (abaixo).

**Por que o merge normalmente sai fast-forward:** neste modelo, `main` só recebe dois tipos de commit —
merge de PR vindo de `develop`, e o commit de release (`npm version`, direto na `main`). Se nada foi
commitado direto na `main` desde o último merge, `develop` e `main` estão no mesmo ponto, e trazer
`main` para `develop` é um fast-forward trivial (`git merge` sem conflito, sem commit de merge).

**O que muda se divergir:** depois de uma release, `main` está **à frente** — o commit da tag existe só
lá. Sincronizar `develop` deixa de ser fast-forward-de-`develop`-para-`main`; agora é o inverso, trazer
`main` **para dentro de** `develop`:

```powershell
git fetch origin
git log origin/develop..origin/main --oneline   # confirme o que vem (deve ser só o commit de release)
git checkout develop
git pull origin develop
git merge origin/main                            # traz o bump de versão + dist/ + sarak-ui/ para develop
git push origin develop
```

**O que NÃO fazer:** não instrua `git rebase` de `develop` sobre `main` neste fluxo — reescreveria
commits que já foram empurrados e que outras pessoas (ou outra sessão sua) podem ter buscado.

**Como saber que deu certo:** `git log origin/main..origin/develop --oneline` e o inverso os dois vazios
(ou só com o que é esperado) — nenhuma das duas branches "sabe" de algo que a outra não tem.

### 4. Abrir PR e ler a CI

**Quando se aplica:** `develop` tem trabalho pronto para virar candidato a produção.

**O que verificar antes:** `develop` sincronizada com o remoto (Situação 1); worktree limpo. Não abra PR
com commit local não empurrado.

**Comandos:**

```powershell
git push origin develop
Start-Process "https://github.com/Lib-Sarak/Sarak-Lib-UI-Core/compare/main...develop"
```

A URL de comparação já abre o formulário de PR `develop → main` pronto para descrever e criar.

**Ler a CI:** só o job **`gates`** é *required status check* (`gates.yml`) — é o que bloqueia o botão de
merge. `install-sha` (mesmo workflow) e `release-tag`/`install-semver` (`install-tag.yml`) são
**condicionais por desenho**: `install-sha` só roda em PR; `release-tag` só em push:`main`;
`install-semver` só em push de tag. Ver `install-tag`/`gates` job a job em
`specs/specs/16-integracao-continua.md` §3 (os cinco gatilhos) e §4 (os jobs, com o custo real medido).

**O que NÃO fazer:** não trate `install-sha`/`release-tag` vermelhos como bloqueio de merge — eles não
são *required*. Não ignore `gates` vermelho achando que "vai passar na próxima" sem investigar o log
(sobe como artifact, sempre — inclusive no verde).

**Como saber que deu certo:** o PR mostra `gates` verde antes de o botão de merge liberar. Se algum job
condicional falhar, isso é informação, não bloqueio — leia o log antes de decidir se importa.

### 5. Merge na `main`

**Quando se aplica:** `gates` verde no PR, e o dono decidiu integrar.

**O botão certo:** **`Create a merge commit`** — nunca `Squash and merge`, nunca `Rebase and merge`. O
histórico desta base é arquivo (§ "O que este agente recusa"); squash/rebase destrói a granularidade
que uma investigação futura (`git log --diff-filter=D`, `git blame`) precisa.

**⚠️ Depois do merge, o GitHub oferece "Delete branch". NÃO CLIQUE.** `develop` é **permanente** — não
é uma branch de feature descartável. Isto já quase aconteceu neste ciclo; só não aconteceu porque
alguém percebeu na hora.

**O que verificar antes:** que o merge de fato é `develop → main` (não uma branch de feature apontando
para o alvo errado) e que `gates` está verde no PR, não só "em andamento".

**Comandos:** nenhum — o merge em si é ação na UI do GitHub (o botão `Create a merge commit` no PR),
não linha de comando. Depois de clicar, confirme localmente:

```powershell
git fetch origin
git log origin/main -1
```

**Como saber que deu certo:** o comando acima mostra o novo merge commit em `origin/main`; o job
`release-tag` disparou automaticamente (push em `main` — ver
Situação 1 para conferir o run).

### 6. Decidir o nível (`minor` × `major`) — o procedimento, não o palpite

**Quando se aplica:** depois do merge na `main`, antes de rodar `npm version`.

**O que verificar antes:** que você está de fato olhando a `main` pós-merge (`git branch --show-current`),
não `develop` nem uma branch de trabalho — comparar o barril contra a branch errada inverte a conclusão.

> 🔴 **REGRA DURA desta situação: meça PRIMEIRO, pergunte DEPOIS — e pergunte só o resíduo.**
>
> **Nunca** entregue ao dono a pergunta *"mudou só documentação ou mudou comportamento?"* como se fosse
> a pergunta inteira. Três quartos dela são **mecânicos**, e você tem os comandos. Terceirizar o que um
> comando responde transfere para a memória do dono um trabalho que a evidência faz melhor — e a memória
> erra.
>
> ⚠️ **Isto já falhou uma vez, em 2026-08-19, na primeira execução real desta skill.** O agente
> caracterizou a leva como *"gates novos e documentação"* e perguntou ao dono se era só isso. **Não
> era:** `bin/` havia ganhado o subcomando `sarak-ui update` inteiro — 1.173 linhas que o consumidor
> instala e roda. Respondida como perguntada, a leva teria virado `patch`.

**O critério vem de `03-versionamento-e-release.md` §3** — não repetido aqui, só operacionalizado. Rode
os quatro, **nesta ordem**, antes de dizer qualquer nível:

```powershell
git describe --tags --abbrev=0
git diff --stat (git describe --tags --abbrev=0) HEAD -- dist bin docs sarak-ui
git diff (git describe --tags --abbrev=0) HEAD -- src/index.ts
npm run minor-no-removal:check
```

| # | O que ele responde |
|---|---|
| 1 | Qual é a última tag — o ponto de comparação de todos os outros |
| 2 | 🔴 **O QUE DE FATO CHEGA AO CONSUMIDOR.** É o comando que o agente pulou em 2026-08-19 |
| 3 | O barril mudou de forma? O quê? |
| 4 | Algum nome **saiu** do barril? Resposta sem ambiguidade, do gate |

> 🔴 **`--stat` prova ESCOPO, não CONTEÚDO — e a diferença já produziu um erro.**
>
> O comando 2 devolve **nomes de arquivo e contagem de linhas**. Ele não diz *o que* mudou dentro de
> nenhum deles. **Se você vai caracterizar o conteúdo de um arquivo na sua tabela de diagnóstico, leia o
> diff dele** — nunca deduza do nome:
>
> ```powershell
> git diff (git describe --tags --abbrev=0) HEAD -- <o arquivo>
> ```
>
> ⚠️ **Falhou em 2026-08-19:** o agente viu `docs/migracoes.md` na lista de arquivos alterados e escreveu
> *"entrada nova (a nota de migração do `update`)"*. **Não era.** Eram as três âncoras de versão
> (`## 4.0.0 —`, `## 5.0.0 —`, `## 6.0.0 —`) que uma plan anterior acrescentara aos títulos — e **nenhuma
> nota do `update` existe**, nem deveria: nota de migração é para quebra, e o `update` é aditivo.
>
> O nível continuou correto por sorte — aquele arquivo não o decidia. **Numa tabela de fatos medidos, a
> linha que você não mediu não se distingue das outras**, e é essa a razão da regra: quem lê não tem como
> saber qual delas foi deduzida.

### ⚠️ `dist` não é a única coisa publicada — `bin` também

```powershell
node -e "console.log(JSON.parse(require('fs').readFileSync('package.json')).files)"
```

Hoje: **`dist`, `bin`, `docs`, `sarak-ui`**. É por isso que o comando 2 varre os quatro, e não só `dist`.

**`bin/` é a CLI do consumidor** (`sarak-ui init|check|refresh|update`). Uma leva pode não tocar uma
linha de `dist/` — superfície React **idêntica** — e ainda assim entregar **um subcomando novo**. Isso é
`minor`, não `patch`, e o diff de `src/index.ts` (comando 3) **não** o enxerga: ele olha o barril React,
não a CLI.

Mudança **fora** dos quatro diretórios (`specs/`, `.agents/`, `gates/scripts/`, `sarak-dev/`) é invisível
ao consumidor: não é `patch` nem `minor` — é **release nenhuma**, sozinha.

`minor-no-removal:check` é **read-only até você de fato publicar** — usá-lo como diagnóstico não emite
nada.

**O que a evidência mecânica NÃO fecha, e aí sim é do dono:** superfície intacta **não** prova que nada
quebrou. A `4.0.0` é a contraprova viva (`03-versionamento-e-release.md` §3.1) — zero export mudou, e
ainda assim foi `major`, porque um **comportamento default** mudou.

**O formato da pergunta, depois de medir:**

> *"Medido: [o que os 4 comandos mostraram, em uma linha cada]. Nada saiu do barril e a superfície React
> está intacta — isso aponta para `minor`. **O que só você sabe:** algum comportamento visível ao
> consumidor mudou, mesmo sem export novo ou removido? Se sim, é `major`."*

Note a diferença: você **entrega uma conclusão com a evidência** e pede confirmação de **um** ponto —
não devolve a decisão inteira embrulhada numa pergunta.

**Se a decisão for `major`:** confirme, ANTES de rodar `npm version major`, que
`docs/migracoes.md` já tem uma entrada cujo título cite a versão que **vai nascer** (ex.: se a última
tag é `v6.1.0`, a próxima major é `7.0.0` — o título precisa citar `"7.0.0"`). É o gate (a) da
`plan-53`; sem a entrada, `npm version major` **é barrado** — e é para ser.

**O que NÃO fazer:** não decida `major`/`minor` só pelas mensagens de commit — o `release:check`
já avisa, no próprio texto, que a sugestão dele **não é decisão** (`adr/008-releases-com-tag-e-semver-em-git.md` §2.2 —
os 8 commits mais recentes daquele levantamento eram todos `feat:`, inclusive remoções).

**Como saber que deu certo:** você consegue apontar, com evidência (`diff`, gate, ou os dois), **por
que** o nível escolhido é o certo — não "parece que é minor".

### 7. Emitir o release

**Quando se aplica:** nível decidido (Situação 6), na `main`, sincronizada, worktree limpo.

**O que verificar antes:**

```powershell
git status -sb            # limpo, e em main
git branch --show-current # confirme: "main"
```

**A sequência (o dono digita; você entrega o comando e o que cada gancho faz):**

```powershell
npm version <major|minor|patch>
```

O que acontece, na ordem — **não redescreva o ritual inteiro aqui, cite `03-versionamento-e-release.md`
§6**; o que a skill acrescenta é o que o dono VÊ no terminal, passo a passo:

1. **`preversion`** roda `gates:full` (build completo + suíte + auditoria) — **~5 a 8 minutos de
   terminal parado, na máquina do dono**. Se falhar, **nada é versionado** — o `package.json` não muda.
2. O npm bumpa a `version` em `package.json`.
3. **`version`** roda: os dois gates da `plan-53` (`migration-anchor:check`,
   `minor-no-removal:check` — se algum bloquear, **a versão já foi bumpada mas nenhum commit foi
   criado ainda**; corrija e rode `npm version` de novo, ou reverta o `package.json` à mão), depois
   `guide`, `build`, `dev-kit`, e um `git add` dos artefatos regenerados.
4. O npm **cria um commit** (com a `version` nova e os artefatos) e **cria a tag** `vX.Y.Z`.
5. **`postversion`** roda `git push --follow-tags`.

**O push do passo 5 usa a exceção de administrador.** A `main` exige o status check `gates` para
qualquer push comum (`enforcement_level = "non_admins"` — `specs/specs/16-integracao-continua.md` §2.1);
o release empurra **direto**, sem PR, e só funciona porque a conta do dono está isenta dessa
exigência como administrador do repositório. Se o push for recusado, a causa mais provável é essa
exceção não estar configurada — não um problema do `npm version` em si.

**O que NÃO fazer:** não rode `npm version` com worktree sujo (§ "O que este agente recusa"); não rode
fora da `main`; não pule a leitura da saída do passo 3 achando que "sempre passa" — os dois gates novos
existem exatamente para bloquear aqui.

**⚠️ O que DIZER ao dono junto com o comando — as três, sempre, sem resumir:**

1. **`npm version` vai parecer travado por ~5-8 min** no `preversion`. É a suíte inteira. Não é
   travamento.
2. **Se bloquear no passo 3**, a `version` do `package.json` **já foi bumpada** e **nenhum commit
   existe ainda** — o repositório fica num meio-termo que assusta. Conserte a causa e rode `npm version`
   de novo, ou reverta o `package.json` à mão. Não é dano.
3. **Se o push do passo 5 for recusado**, a causa quase certa é a exceção de administrador não estar
   valendo — **não** um defeito do `npm version`. E ele é recusado no **último** passo, depois de já ter
   buildado, commitado e criado a tag localmente: o pior lugar para descobrir.

**Como saber que deu certo:** `git log -1 --oneline` mostra o commit da versão nova; `git tag --points-at
HEAD` mostra a tag; `npm run release:check` (rodado de novo) diz "o artefato publicado é idêntico" em
vez de "PUSH BLOQUEADO".

### 8. Depois do release

**Quando se aplica:** logo após o passo 5 da Situação 7 terminar.

**O que verificar antes:** nada novo — é a continuação direta da Situação 7; o release já saiu.

**Comandos:**

```powershell
git tag --points-at HEAD        # a tag nova aponta para o commit que acabou de ser empurrado?
npm run release:check           # deve dizer "artefato idêntico" agora, não mais "PUSH BLOQUEADO"
Start-Process "https://github.com/Lib-Sarak/Sarak-Lib-UI-Core/actions"
```

Na Actions, confira que o evento de tag disparou o job **`install-semver`** (`install-tag.yml`, gatilho
`push: tags: ["v*"]`) — é o único jeito de saber se a instalação por `#semver:` contra a tag nova
realmente funciona nos três gerenciadores, não só localmente.

**Não esqueça a Situação 3** — `develop` está agora atrás de `main` pelo commit da release; sincronize.

**O que NÃO fazer:** não declare o release "concluído" só porque o `npm version` terminou sem erro — o
disparo do `install-semver` é a prova de que o consumidor consegue de fato instalar a tag nova.

**Como saber que deu certo:** tag no commit certo, `release:check` verde, `install-semver` rodou e
passou nos três gerenciadores, `develop` sincronizada.

### 9. Limpeza

**Quando se aplica:** depois que uma branch de trabalho foi mergeada (ou abandonada).

**O que verificar antes:** que o PR correspondente já foi mergeado de verdade (não só aprovado) —
`git log origin/main --oneline | Select-String <nome-da-branch>` ou confira na página do PR fechado.

**Apague:** branch `feature/*` (ou qualquer nome de trabalho) depois do merge do PR correspondente —
descartável por natureza, é para isso que existe.

**NUNCA apague:** `develop` e `main`. São permanentes — `main` é produção, `develop` é onde o trabalho
diário acontece. **O botão "Delete branch" do GitHub aparece depois de QUALQUER merge**, inclusive de
`develop → main` — ele não distingue branch permanente de branch descartável. Ver o alerta da Situação
5.

**Comando (só para branch de trabalho, confirmada como já mergeada):**

```powershell
git branch -d nome-da-branch          # local; falha (de propósito) se não estiver mergeada
git push origin --delete nome-da-branch
```

**O que NÃO fazer:** não use `git branch -D` (maiúsculo, força) para "resolver" o `-d` recusando —
se ele recusou, é porque a branch tem commit não mergeado; investigue antes de forçar.

**Como saber que deu certo:** `git branch -a` não lista mais a branch de trabalho; `develop` e `main`
continuam lá, sempre.

### 10. Quando parar e perguntar

Nenhuma das 9 situações acima é para seguir sozinha até o fim se qualquer um destes aparecer — **pare,
mostre a evidência, e pergunte antes de entregar o próximo comando:**

- **Worktree sujo** onde o esperado era limpo, e a origem da sujeira não é óbvia (não foi o dono quem
  acabou de editar algo).
- **Divergência inesperada** entre `develop`/`main`/remoto que a Situação 1 não explica (ex.: `main`
  tem commits que não são nem merge de PR nem release).
- **CI vermelha por motivo desconhecido** — o log não aponta uma causa clara relacionada à mudança
  recente, ou o job falhou em algo que parece infraestrutura (runner, rede), não código.
- **Nível ambíguo** (Situação 6) — o diff do barril está limpo, o gate está verde, mas você não tem
  como confirmar com o dono se algum comportamento visível mudou.

Nestes casos, a instrução certa é **nenhum comando** — é a pergunta.

## O que declarar sempre

- **Esta skill nunca governou um `npm version` de verdade** — o que já foi exercitado, e o que não foi:
  | Situações | Estado |
  |---|---|
  | **1–6** (diagnóstico → decidir o nível) | ✅ exercitadas em **2026-08-19**, contra o estado real do repositório |
  | **7–9** (emitir o release, pós-release, limpeza) | ❌ **nunca** — nenhum `npm version` rodou sob esta skill |

  A primeira rodada **achou dois defeitos na própria skill**, e os dois viraram as correções que você
  está lendo: a Situação 6 sendo respondida com pergunta em vez de medição, e o roteiro de 5 fases
  comprimindo as advertências até sumirem. **O que falhar vira correção, não silêncio** — e isso já
  aconteceu uma vez, o que é a única evidência de que a regra funciona.
- **É conduta, não gate.** Onde existe gate (os dois da `plan-53`, o `pre-commit`/`pre-push`, o
  `required status check` da CI), ele **segura** — esta skill só aponta para ele. Onde não existe gate
  (por exemplo, "confira o comportamento visível mudou" na Situação 6), a skill é só disciplina de
  quem a lê. É a lição medida da `plan-53`: obrigação escrita sem gate foi pulada três vezes.

## Co-autoria — alcance, não regra nova

**Nenhum agente adiciona co-autoria a nenhum commit, nunca** — inclusive este, inclusive quando ele só
**instrui** a sequência e é o dono quem digita. A regra já está escrita em quatro lugares; esta skill
não a reescreve, só declara que ela **também vale aqui**:

- `specs/00-prompt-executor.md:165`
- `specs/00-prompt-revisor.md:67` e `:246`
- `specs/00-contexto.md:303`

## Referências (roteamento — leia lá, não aqui)

**Os cinco primeiros são os mesmos do ritual de entrada** — você já os leu. Esta tabela os reorganiza
**por pergunta**, para consulta durante a operação, e acrescenta os dois gates.

| Preciso saber sobre… | Onde |
|---|---|
| O ritual de release, os ganchos do `npm version`, formato da tag | `specs/specs/03-versionamento-e-release.md` |
| Os anéis locais (`pre-commit`/`pre-push`), o que cada um cobra e custa | `specs/specs/02-enforcement-por-commit.md` |
| Branches, gatilhos, os jobs da CI | `specs/specs/16-integracao-continua.md` |
| Modelo de autoridade completo, proibições absolutas, alcance da co-autoria | `specs/specs/17-contrato-de-operacao-git.md` |
| Regras inegociáveis, fronteiras, o que bloqueia um push | `specs/00-contexto.md` §3.1, §3.2 e §7 |
| Catálogo de gates, baseline versionado, **onde cada gate roda** | `specs/specs/01-gates-e-baseline.md` §2.2 e §2.2.1 |
| O critério de `minor` × `major` como decisão, não sugestão | `specs/adr/008-releases-com-tag-e-semver-em-git.md` §2.2 |
| Os dois gates novos (âncora de migração, remoção fora de major) | `gates/scripts/contrato/check-migration-anchor.mjs`, `gates/scripts/contrato/check-minor-no-removal.mjs` — cada um declara, no próprio arquivo, o que não vê (R18) |
