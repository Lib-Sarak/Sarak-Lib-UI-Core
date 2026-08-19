---
name: git-ci-cd
description: Instrui a operação de Git e release deste repositório — diagnóstico de estado, commit de rotina, sincronizar develop↔main, abrir PR, ler a CI, merge na main, decidir o nível do bump (minor×major), emitir o release (npm version), o que conferir depois, e limpeza de branch. O agente NUNCA executa nenhuma operação de Git: verifica (leitura), decide o que deve ser feito, mostra a evidência e entrega os comandos exatos para o PowerShell do dono rodar — quem digita é sempre o dono. Use quando o dono pedir ajuda para commitar, sincronizar branches, abrir PR, decidir o nível de uma release ou emitir uma release deste repositório. NÃO acione proativamente.
---

# Skill: Agente de Git & Release — instrui, não executa

> 🔒 **Contrato de autoridade — leia antes de emitir qualquer comando.**
>
> *"O agente não executa absolutamente nada. Ele apenas instrui o usuário e envia os comandos na
> resposta, e o usuário executa. O agente é responsável pela instrução e o usuário pela execução —
> porém o agente determina o que o usuário executa."* — decisão do dono, 2026-08-19.
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

**Comandos (PowerShell):**

```powershell
git status -sb                                 # branch atual + divergência local×remoto NUM comando
git fetch origin                                # atualiza as refs remotas antes de comparar
git log origin/main..origin/develop --oneline   # o que a develop tem que a main não tem
git log origin/develop..origin/main --oneline   # o que a main tem que a develop não tem (ex.: uma release)
npm run release:check                           # tag devida? — node gates/scripts/release/check-release-tag.mjs
```

`git status -sb` sozinho já responde três perguntas: branch atual, se o worktree está limpo (linhas
abaixo do cabeçalho `##`) e se há divergência (`[ahead N]`/`[behind N]`/`[ahead N, behind N]`).
`release:check` roda **sem precisar de stdin nenhum** neste shell — testado: em PowerShell
não-interativo ele cai sozinho no fallback (`alvo = 'HEAD'`) e avalia o `HEAD` atual, com a mesma saída
que o `pre-push` produziria.

**Últimos runs da CI:** este repositório **não tem `gh` CLI instalada** (confirmado —
`Get-Command gh` falha). Não invente instalação da CLI para isto; abra a Actions do repositório:

```powershell
Start-Process "https://github.com/Lib-Sarak/Sarak-Lib-UI-Core/actions"
```

Se `gh` **estiver** disponível numa máquina diferente (`(Get-Command gh -ErrorAction SilentlyContinue)`
não vazio), `gh run list --limit 5` é o equivalente por linha de comando.

**O que NÃO fazer:** não conclua "está tudo certo" só porque `git status` está limpo — worktree limpo
e branch sincronizada são coisas diferentes; confira as duas.

**Como saber que deu certo:** você sabe, sem perguntar ao dono, (a) em que branch ele está, (b) se há
commits não sincronizados nos dois sentidos entre `develop`/`main`, (c) se há tag devida, e (d) o
resultado do último run relevante da CI.

### 2. Commit de rotina

**Quando se aplica:** o dono fez uma mudança e quer commitar (ele digita; você instrui a sequência).

**O que verificar antes:** `git status -sb` (o que está staged/não-staged) e, pelo caminho tocado, **qual
anel do `pre-commit` vai disparar** — isso já tem dono: `specs/specs/02-enforcement-por-commit.md` §2 e
§3 (a tabela de escopo por staged). Não redescreva a tabela aqui; **leia-a e diga ao dono o que esperar**
("isto toca `src/`, então os Anéis 1 e 2 vão rodar, ~10-20s").

**Comandos:**

```powershell
git status -sb
git add <arquivo1> <arquivo2>   # nomeie os arquivos — nunca "git add ." às cegas
git commit -m "tipo: mensagem"  # SEM trailer de co-autoria, nunca (ver "Co-autoria" abaixo)
```

**O que NÃO fazer:** não sugira `git add -A`/`git add .` por padrão — o dono pode ter algo não
relacionado no worktree. Não escreva a mensagem de commit *por* ele sem que ele veja o texto antes.

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

**O critério vem de `03-versionamento-e-release.md` §3** — não repetido aqui, só operacionalizado:

```powershell
git describe --tags --abbrev=0                       # a última tag publicada
git diff (git describe --tags --abbrev=0) HEAD -- src/index.ts   # o barril mudou de forma? o quê?
npm run minor-no-removal:check                        # o gate (b) da plan-53: algo saiu do barril?
```

`minor-no-removal:check` compara `dist/index.d.ts` da última tag contra o atual e diz, sem
ambiguidade, se **algum nome saiu**. Rode-o **antes** de decidir — ele é read-only até você de fato
publicar; usá-lo como diagnóstico não emite nada.

**O que o diff de `src/index.ts` NÃO prova sozinho:** superfície intacta **não** prova que nada quebrou.
A `4.0.0` é a contraprova viva (`03-versionamento-e-release.md` §3.1) — zero export mudou, e ainda assim
foi `major` porque um **comportamento default** mudou. Pergunte ao dono: *"algo no comportamento visível
mudou, mesmo sem export novo/removido?"* — se a resposta for sim, é `major`, mesmo com
`minor-no-removal:check` verde.

**O que "chega ao consumidor" — confira `package.json.files`:**

```powershell
node -e "console.log(JSON.parse(require('fs').readFileSync('package.json')).files)"
```

Só o que está nessa lista (`dist`, `bin`, `docs`, `sarak-ui`) viaja no pacote. Uma mudança fora dela
(ex.: em `.agents/`, `specs/`, `gates/scripts/` sem afetar `dist/`) não é visível ao consumidor —
**não é** `patch` nem `minor` do ponto de vista dele; é invisível, e não pede release nenhuma sozinha.

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

1. **`preversion`** roda `gates:full` (build completo + suíte + auditoria). Se falhar, **nada é
   versionado** — o `package.json` não muda.
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

- **Esta skill nunca foi exercitada num release real.** Ela foi escrita conferindo cada comando contra
  o código e o histórico deste repositório (`plan-54`), não observando um `npm version` de verdade
  passar pelos dois gates novos da `plan-53` em produção. **O primeiro release sob esta skill é o teste
  dela** — o que falhar vira correção, não silêncio.
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

| Preciso saber sobre… | Onde |
|---|---|
| O ritual de release, os ganchos do `npm version`, formato da tag | `specs/specs/03-versionamento-e-release.md` |
| Os anéis locais (`pre-commit`/`pre-push`), o que cada um cobra e custa | `specs/specs/02-enforcement-por-commit.md` |
| Branches, gatilhos, os jobs da CI | `specs/specs/16-integracao-continua.md` |
| Modelo de autoridade completo, proibições absolutas, alcance da co-autoria | `specs/specs/17-contrato-de-operacao-git.md` |
| Catálogo de gates, baseline versionado | `specs/specs/01-gates-e-baseline.md` |
| Os dois gates novos (âncora de migração, remoção fora de major) | `gates/scripts/contrato/check-migration-anchor.mjs`, `gates/scripts/contrato/check-minor-no-removal.mjs` — cada um declara, no próprio arquivo, o que não vê (R18) |
