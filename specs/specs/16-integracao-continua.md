---
tipo: "spec"
titulo: "Integração contínua — o modelo de branches, os cinco gatilhos e o que a CI não cobre"
dominio: "Sarak-Lib-UI-Core / Automação / CI"
status: "🟢 Implementado"
prioridade: "Máxima"
tags: ["spec", "ci", "github-actions", "branches", "gatilhos", "gates"]
relacionados: ["[[02-enforcement-por-commit]]", "[[03-versionamento-e-release]]", "[[01-gates-e-baseline]]", "[[17-contrato-de-operacao-git]]", "[[11-testes-e-cobertura]]", "[[15-divida-conhecida]]"]
---

# 1. Visão geral

Esta spec é a **leitura única do fluxo**: do commit até a tag, que evento dispara o quê, em que branch, e
quanto custa. Ela existe porque essa informação não tinha dono — os anéis locais moram na
[[02-enforcement-por-commit]], o ritual de release na [[03-versionamento-e-release]], o catálogo de gates na
[[01-gates-e-baseline]], e **nenhuma das três sabia dizer o que acontece quando você abre um PR**.

O que a motivou foi um problema medido, não teórico: **duas vezes um "verde" foi falso por causa da máquina**,
e nenhum gate local pegou — por definição, o ambiente local era o problema (um `package-lock.json` solto no
`$HOME`; um `node_modules/` não versionado). Some-se o escape invisível: quem usa `--no-verify` não é cobrado
por ninguém.

⚠️ **Esta spec não redescreve as outras.** Uma quarta descrição dos mesmos fatos diverge das três primeiras —
a §7 é ponteiro, nunca cópia.

# 2. O modelo de branches

```
feature/xyz  ──PR──►  develop  ──PR──►  main  ──npm version──►  tag vX.Y.Z
```

| Branch | Papel | Quem escreve |
|---|---|---|
| `main` | **produção / código final.** O dono não desenvolve nela | só merge de PR — e o push do release, pelo dono |
| `develop` | **desenvolvimento** — onde o trabalho do dia acontece | commit direto e push |
| `feature/*` | trabalho em curso | livre; nenhuma automação remota a cobra |

## 2.1 A proteção da `main`, e a exceção que ela precisa ter

Lida na API em 2026-08-19:

| Campo | Valor | Consequência |
|---|---|---|
| `required_status_checks.contexts` | `["gates"]` | **só o job `gates` bloqueia merge.** `release-tag` e `install-sha` não bloqueiam, por desenho: são condicionais e nem sempre rodam |
| `enforcement_level` | `"non_admins"` | **exceção de administrador, deliberada** |

⚠️ **A exceção não é relaxamento — é o que faz o release funcionar.** Sem ela, o `postversion`
(`git push --follow-tags`) é **recusado pela própria regra que a CI acabou de ganhar poder para impor**, e o
`npm version` para no fim de um ritual de 5 minutos. Ver [[03-versionamento-e-release]] §6.

## 2.2 O consumidor nunca lê branch nenhuma

Ele instala por `#semver:`, que o `npm` resolve contra **tags** (ADR-008). O modelo de branches é **disciplina
de trabalho** — para quem instala, **produção é a tag**.

> **Dar merge na `main` não publica nada.** Só `npm version` publica. Esta é a frase que impede a confusão de
> achar que o botão verde do GitHub entrega alguma coisa a alguém.

# 3. Os cinco gatilhos

| Evento | O que roda | Onde | Pergunta que responde |
|---|---|---|---|
| push `feature/*` | **nada** | — | você ainda está trabalhando; o `pre-commit` já cobriu |
| push **`develop`** | gates completo | `gates.yml` → job `gates` | *"o que acabei de empurrar está bom?"* |
| PR **`develop`→`main`** | gates + install pelo **SHA do PR**, 3 gerenciadores | `gates.yml` → `gates` + `install-sha` | *"isto pode ir para produção?"* |
| push **`main`** (merge aceito) | gates + `check-release-tag` sobre o HEAD | `gates.yml` → `gates` + `release-tag` | *"o resultado de **juntar** está bom?"* |
| **tag `v*`** empurrada | install por **`#semver:`** contra a tag, 3 gerenciadores | `install-tag.yml` → `install-semver` | *"o que acabei de publicar realmente instala?"* |

**`feature/*` não aparece no `on:` de nenhum workflow, de propósito** — a ausência de gatilho torna a ausência
de cobrança automática, sem precisar de um `if` negativo a manter.

## 3.1 Por que push `main` e PR `develop→main` são gatilhos diferentes

São perguntas diferentes, e a segunda já quebrou projeto de gente boa: um PR verde não garante que o
**resultado do merge** seja verde. O `push:main` mede o que o PR não mediu.

## 3.2 As duas provas de `install`, e por que ambas

| Prova | Instala de | Roda em | O que ela pega |
|---|---|---|---|
| `install-sha` | o **SHA** do próprio commit | PR → `main` | regressão introduzida pela mudança **em revisão** |
| `install-semver` | **`#semver:`** contra a tag | evento de **tag** | o caminho que o **importador de verdade** percorre |

Só a segunda seria testar o passado — instalar da última tag **nunca reprova um PR**. Só a primeira deixaria o
caminho real do consumidor sem cobertura.

# 4. A CI

## 4.1 O desenho, e o motivo de cada escolha

| Item | Valor | Por quê |
|---|---|---|
| `runs-on` | `ubuntu-latest` | Windows custa **×2** e macOS **×10** em minuto de runner. Medido: **zero** ocorrências de `process.platform`/`win32`/caminho de unidade fora de teste em `src/`, `scripts/`, `gates/`, `bin/` |
| Node | **24**, versão única, sem matriz | é o do dono. Matriz multiplica minuto **e** exposição à intermitência do achado **44** |
| Cache | `cache: npm` no `setup-node` | `npm ci` sem cache é o passo mais caro e mais bobo |
| Instalação | **`npm ci`**, nunca `npm install` | respeita o lockfile e falha se ele divergir — é metade do "ambiente determinístico" |
| `fetch-depth` | `0` no job `gates` | o anel de release precisa da última tag e do log até `HEAD`; checkout raso não alcança |
| `concurrency` | por workflow + ref, `cancel-in-progress` | push em sequência não deve empilhar run que já nasceu obsoleto |
| Retry da suíte | **não existe** | mascarar a intermitência destrói a única evidência que o achado **44** ainda pode colher |
| Artifact da suíte | `if: always()` | a saída completa sobe **inclusive quando o job passa** — cada run vira amostra grátis na caça ao defeito sem nome |

⚠️ **Na CI não existe "escopo por staged".** Toda a lógica de *"o commit não tocou `src/`, então pula o Anel
1"* existe porque o desenvolvedor paga o tempo ([[02-enforcement-por-commit]] §3). No runner **tudo roda
sempre**: o job é a **união** dos anéis, sem condição nenhuma.

## 4.2 O que o job `gates` executa

`npm ci`, depois `npm run gates:full` — **não uma reenumeração de comandos em YAML**, que é a próxima prosa a
envelhecer ([[15-divida-conhecida]] §3.3).

Somam-se explicitamente os `*:check` que o `gates:full` **não** alcança, provados um a um:
`plan-index:check`, `gate-limits:check`, `container-query:check`, `container-query-boundary:check`,
`persistence-doc:check`. O `plan-index:check` é o caso que mais importa: o `pre-commit` roda só **metade**
dele, e a CI é quem cobre a outra.

## 4.3 O custo REAL — medido, não estimado

7 runs, lidos na API pública do GitHub em 2026-08-19.

| Job | Quando | Duração medida |
|---|---|---|
| `gates` | push:develop · push:main · PR→main | **~5 min** — 289 s a 312 s em 5 runs. A variação é ruído de runner: os verdes e o vermelho custam o mesmo |
| `install-sha` (matriz, só em PR) | PR→main | **npm ~82-87 s · pnpm ~12-13 s · yarn ~22-27 s** — em paralelo entre si e com `gates`; quem governa o acréscimo é o mais lento (npm) |
| `release-tag` (`needs: gates`) | push:main | **32 s** — soma ao `gates` porque depende dele |
| `install-semver` | push de tag `v*` | ⚠️ **zero execuções** — ver §5.1 |

**Ponta a ponta, por tipo de evento:** push:develop **5 min 05 s** · PR→main **5 min 15 s** (`gates` e
`install-sha` em paralelo) · push:main **5 min 47 s** (`gates` **+** `release-tag`, sequenciais).

> **~5 min, contra os ~15 min estimados antes da adequação.** A `plan-52` — que arrumou a suíte **antes** de a
> CI existir — previa isso por escrito. Se a CI tivesse vindo primeiro, o repositório pagaria o triplo em todo
> PR, para sempre.

## 4.4 O anel de release mudou de lugar, e isso não é detalhe

O `pre-push` local só age quando o destino é `refs/heads/main`. **Quando o merge acontece pelo botão do
GitHub, nenhum hook local roda** — e `dist/`/`sarak-ui/` mudam em commit normal, não só no release. Sem
cobertura, um PR que altere o artefato publicado entra na `main` **sem tag, e ninguém reclama**: o incidente
do ADR-007 de novo.

Por isso o job `release-tag` roda `check-release-tag.mjs` no evento `push` da `main`. **Não é gate novo — é o
mesmo gate num lugar novo.**

⚠️ O script lê stdin no formato de hook do git (`<ref local> <sha local> <ref remota> <sha remoto>`), que não
existe dentro de um job. A alimentação usada é o **fallback nativo do próprio script**: sem stdin, ele assume
`HEAD` — comportamento que já estava na fonte, não um protocolo de hook fabricado.

### 4.4.1 ⚠️ O vermelho ESPERADO — `release-tag` acende em todo merge que muda o artefato

**Consequência estrutural do fluxo, não defeito.** A tag é emitida **da `main`, depois do merge**, pelo
`npm version` ([[03-versionamento-e-release]] §6). Entre o merge e a emissão, a `main` está necessariamente
em *"artefato mudou, não há tag"* — **e é exatamente essa a janela em que o job roda**.

Portanto: **todo merge que toque `dist/` ou `sarak-ui/` produz um run de `push:main` vermelho**, com o texto
`⛔ PUSH BLOQUEADO — o artefato publicado mudou desde a última tag`.

| O vermelho significa | O vermelho NÃO significa |
|---|---|
| **"há release devida — emita a tag"** | que o merge falhou |
| que o `npm version` é o próximo passo obrigatório | que algo precisa ser consertado |

**Ele não bloqueia nada** — só `gates` é *required status check* (§2.1), e este run é **pós-merge**: não há
botão a travar. **E apaga sozinho** quando a tag nasce: o `release:check` seguinte passa a dizer *"o artefato
publicado é idêntico"*.

> 🔴 **Escrito em 2026-08-20 porque a ausência disto custou uma leitura errada.** O dono viu o vermelho e
> entendeu que o processo havia furado. Não havia furo no gate — havia furo **aqui**: esta spec descrevia o
> `release-tag` como a trava que pega o incidente do ADR-007, sem dizer que **no caminho feliz ele é vermelho
> por construção** até a tag sair.
>
> **A leitura correta é temporal:** `release-tag` vermelho num `push:main` é um **indicador de release
> pendente**. Vermelho que persiste depois do `npm version`, aí sim, é defeito.

# 5. O que a CI **não** cobre

Declarado, não omitido. Passo verde que não olha nada é pior que passo ausente: ninguém desconfia dele.

| Vão | Motivo medido |
|---|---|
| **Anel 0 — segredos** | `verificar_commit.py` lê **só `git diff --cached`**, sem modo de faixa. No runner não há staging: ele reportaria "nenhum segredo" **sempre**, em silêncio. O Anel 0 **continua só local** ([[15-divida-conhecida]] §4.1) |
| **CSS renderizado em browser real** | a suíte roda em `jsdom`; a CI não muda isso ([[11-testes-e-cobertura]] §7.2) |
| **`dist/` commitado × build limpo** | não é conferido — seria gate novo |
| **O `pre-push` local no dia a dia** | ele só age para `refs/heads/main`, e o trabalho diário passou para `develop`. **Não é perda** — a rede mudou de lugar, para o job `gates`. Mas é mudança de comportamento, e sumiria sem aviso se ninguém a escrevesse |

## 5.1 `install-tag.yml` existe, está ativo, e tem ZERO runs

O workflow foi escrito e revisado; o **mecanismo** (`github:…#semver:^X.Y.Z` contra os 3 gerenciadores) foi
provado **à mão**, contra o repositório público real. Mas o **gatilho** (`push: tags: ["v*"]`) nunca disparou,
porque nenhum `npm version` rodou desde que ele passou a existir.

⚠️ **Isto não é declarado como coberto.** É exatamente a forma do verde falso que motivou remover o aparato
E2E desta base: capacidade que existe e nunca foi exercitada pelo caminho real. Registrado como achado
**7** em [[15-divida-conhecida]]; **fecha sozinho no próximo `npm version`** — não é código a escrever, é o
gatilho disparar.

# 6. O que a CI já provou

Não é promessa: são os 7 primeiros runs.

1. **Achou defeito real no primeiro dia.** Um `package-lock.json` incompleto, invisível para todo hook local,
   que quebrava `npm ci` para qualquer pessoa com Node 24 atual. Corrigido regenerando o lock com o npm do
   runner — **corrigido, não contornado**.
2. **O vermelho foi por encomenda e chegou onde devia.** `1 failed | 1375 passed` — falhando **no teste**, não
   no `npm ci`, com os três `install-sha` verdes ao lado. Um pipeline que só soubesse dizer "vermelho" não
   distinguiria as duas coisas.
3. **O artifact subiu no vermelho** (29,0 KB). O `if: always()` foi escrito para o achado 44, e o caso que
   importa é a falha — é quando há evidência a preservar.
4. **`release-tag` passou em 32 s** pelo fallback nativo de stdin, no remoto.

# 7. Quem detalha cada peça

> ⛔ **Esta seção é ponteiro, nunca redescrição.** Quem precisa do conteúdo lê a spec dona.

| Preciso saber sobre… | A dona é |
|---|---|
| Os anéis locais (`pre-commit`/`pre-push`), o que cada um cobra e custa | [[02-enforcement-por-commit]] |
| O ritual de release, os ganchos do `npm version`, o formato da tag | [[03-versionamento-e-release]] |
| O catálogo de gates, o baseline versionado, a matriz de cobertura | [[01-gates-e-baseline]] |
| Quem decide e quem executa; as proibições de operação | [[17-contrato-de-operacao-git]] |
| Os comandos exatos por situação, no shell certo | skill `.agents/skills/git-ci-cd/` |

# 8. Critérios de aceite

- [x] Os dois workflows existem e cobrem as **cinco** linhas de gatilho, sem nenhuma a mais.
- [x] O job `gates` roda a união dos anéis, sem condição por arquivo.
- [x] O anel de release é cobrado no `push:main`, cobrindo o caminho do botão de merge.
- [x] A saída completa da suíte sobe como artifact **inclusive no verde**.
- [x] A proteção da `main` exige `gates` e mantém a exceção de administrador.
- [x] O custo real está escrito com a medição, não com estimativa.
- [x] Os quatro vãos da §5 estão declarados, incluindo o Anel 0.
- [ ] `install-semver` exercitado pelo gatilho real — **aberto**, achado 7 (§5.1).

# 9. Plano de testes (Quality Gate)

A CI **é** o plano de testes deste repositório em ambiente limpo; o que segue é o que valida a própria CI.

## Verificação de sistema (executada em 2026-08-19)

- [x] Um run verde em cada um dos quatro gatilhos que já dispararam.
- [x] Um PR com teste quebrado de propósito **reprovado pela automação** (`1 failed | 1375 passed`).
- [x] Artifact baixável no run verde **e** no vermelho.
- [x] `install-sha` verde nos 3 gerenciadores, duas vezes.
- [ ] `install-semver` disparado por uma tag real — pendente do próximo `npm version`.

## Lacuna declarada

Nenhum teste automatizado exercita os workflows fora do próprio GitHub. Um erro de sintaxe em
`.github/workflows/*.yml` só aparece no push — mitigado, em parte, por `.github/` estar no gatilho
`TOCA_CODIGO` do `pre-commit`, o que ao menos garante que os anéis 1 e 2 rodem em commits que só mexem no
workflow.
