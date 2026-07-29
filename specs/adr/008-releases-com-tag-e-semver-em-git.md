---
tipo: "adr"
titulo: "Releases com tag e faixa semver em Git — sem registry"
status: "🟢 Aceito"
tags: ["adr", "distribuicao", "versionamento", "semver", "release", "tag", "enforcement"]
relacionados: ["[[007-distribuicao-por-git]]", "[[03-versionamento-e-release]]", "[[02-enforcement-por-commit]]", "[[05-build-e-distribuicao]]"]
substitui: "[[007-distribuicao-por-git]]"
substituido_por: ""
---

# 1. Contexto e Problema

**Data da decisão: 2026-07-28.**

O [[007-distribuicao-por-git]] registrou, em 26/07, a decisão de distribuir por Git e **compensar** o que
essa escolha não entrega. Ele fechou com uma frase que parecia um fato técnico:

> *"Atualização automática de verdade exigiria **registry + faixa semver**, e não existe configuração que faça um `install` puxar sozinho o HEAD novo de uma dependência git."*

**A segunda metade continua verdadeira; a primeira não.** O npm resolve faixa semver contra as **tags** de
um repositório git, sem registry nenhum:

```
"@sarak/lib-ui-core": "github:Lib-Sarak/Sarak-Lib-UI-Core#semver:^1.0.0"
```

Com tags publicadas, `npm update` passa a escolher a **maior tag compatível com a faixa** — o mesmo
comportamento que se atribuía exclusivamente a um registry. O que faltava nunca foi infraestrutura: era
**tag**.

O estado medido hoje explica por que ninguém percebeu:

| Fato | Medição (2026-07-28) |
| --- | --- |
| Tags no repositório | **0** |
| Commits | **331** |
| Consumidor preso commits atrás sem sinal | 2 incidentes reais, documentados no [[007-distribuicao-por-git]] |

Com zero tags, `#semver:` não teria a que se agarrar — a faixa não resolveria nada. A funcionalidade
existia o tempo todo e estava **inutilizável por falta do insumo**.

## O problema real: não é "não sei taggear", é "esqueci"

Zero tags em 331 commits não é falta de conhecimento — é falta de **gatilho**. E qualquer solução tinha
de sobreviver a duas realidades medidas deste repositório:

**(a) Todo trabalho acontece direto na `main`.** "Uma tag por commit na `main`" produziria centenas de
tags, o número viraria contador de build e a faixa `^1.0.0` do consumidor resolveria para algo novo quase
todo dia — "minor" deixaria de significar coisa alguma.

**(b) A mensagem de commit não carrega intenção de release.** Os **oito** commits mais recentes são
**todos `feat:`** — inclusive os que REMOVERAM capacidade e os que corrigiram bug:

```
7c35c88 feat: add enforcement pipeline for commits with validation rings and versioned hooks
97baeb0 feat: add architectural decision records (ADRs) for recent changes
6541b21 feat: implement local dependency inspection and update notification CLI
b50c255 feat(consumer-kit): implement consumer kit generation and validation
ff17f21 feat: Update branding and messaging across components
692c6a9 feat: implement host identity sovereignty in SarakUIProvider
352b6c2 feat: Refactor SarakCardGrid ... remove LLM domain fields ...
b28f976 feat: implement lazy loading for SarakChartEngine ...
```

São mensagens geradas por agentes. Uma heurística sobre elas diria `minor` **sempre** — e um dia diria
`minor` numa mudança breaking. **Tag errada é pior que tag ausente**, porque o consumidor confia na faixa.

# 2. Decisão

**Adotar releases com tag `vX.Y.Z` em Git, mantendo a distribuição por Git e sem registry.** Três partes:

## 2.1 `#semver:` é o caminho RECOMENDADO; `github:` puro segue SUPORTADO

O consumidor novo escreve a faixa; o consumidor existente não precisa mexer em nada no dia em que a
primeira tag nasce, e quem pina por commit (reprodutibilidade) continua podendo.

A razão é **assimetria de risco**: deprecar `github:` puro depois é fácil; desforçar uma migração que
quebrou o `package.json` de todo mundo, não. A decisão é reversível de um lado só, e é por esse lado que
ela vai.

## 2.2 A emissão da tag é SEMI-AUTOMÁTICA, com bloqueio no push

O gatilho é **"o artefato publicado mudou"**, não **"houve commit"** — é o que impede a chuva de tags de
um repositório que trabalha direto na `main`. Commit que só mexe em `specs/` não muda artefato, não pede
tag e não incomoda ninguém.

O **nível do bump é decidido por humano**. O ritual pode *sugerir* lendo os commits desde a última tag,
mas sugestão nunca vira decisão — pelo motivo (b) acima.

O ritual em si é automatizado pelos ganchos nativos do `npm version` (`preversion`/`version`/`postversion`),
sem dependência nova. Isso corrige, de quebra, um defeito estrutural do fluxo antigo: hoje o `dist/` é
commitado **separado** do bump da versão, e é dessa janela que nasce a defasagem entre "a versão que o
`package.json` diz" e "o artefato que está ali". Com o gancho `version`, o artefato regenerado entra no
**mesmo commit** que a tag aponta.

## 2.3 A identidade do build passa a ser a TAG

O `baseCommit` do `BUILD_INFO` continua sendo sempre um passo atrás — auto-referência é impossível, e o
[[007-distribuicao-por-git]] explicou por quê. **Isso deixou de importar**: a pergunta "que build é este?"
passa a ser respondida por `git describe`/pela tag, que aponta para o commit exato, artefato incluído.

# 3. Consequências

- **Positivas:**
  - **A causa-raiz do "consumidor preso" cai.** Com faixa + tag, `npm update` deixa de ser no-op: ele
    resolve para a maior tag compatível. Os dois incidentes do [[007-distribuicao-por-git]] tinham essa
    origem única.
  - **A `version` passa a significar algo verificável.** `v1.0.0` aponta para um commit exato, com o
    `dist/` daquele commit dentro dele.
  - **O esquecimento deixa de ser possível em silêncio.** O bloqueio no push cobra a tag exatamente
    quando ela é devida — e só quando é devida.
  - **Zero dependência nova, zero infraestrutura.** Ganchos do npm + um hook de git versionado. Sem
    credencial, sem registry, sem CI.
  - **Nenhum consumidor é forçado a migrar.** As duas formas convivem.

- **Negativas (Trade-offs):**
  - **Mais uma decisão humana por release.** O nível do bump não é derivado; alguém escolhe. É o preço
    consciente de não emitir tag errada.
  - **Duas formas suportadas é dobro de superfície.** O `sarak-ui check` precisa saber comparar por tag
    **e** continuar funcionando por commit e por `file:`/`link:` (onde tag não existe).
  - **Tag movida ou apagada é pior que tag ausente.** Passa a existir uma disciplina que antes não
    existia: tag é imutável na prática, mesmo que o git permita mexer.
  - **O bloqueio no push é um gate a mais no caminho crítico.** Tem escape (`--no-verify`), e escape
    usado em silêncio continua invisível — a mesma dívida registrada em [[02-enforcement-por-commit]].
  - **`dist/` continua commitado.** Esta decisão não muda isso; só faz o artefato e a versão andarem
    juntos.

> **O que este ADR NÃO decide:** publicar em registry continua fora. O [[007-distribuicao-por-git]]
> permanece correto sobre tudo o mais que registrou — identidade de build, comando de atualização por
> gerenciador, aviso ativo no `predev` e a armadilha do `baseCommit`. Ele é substituído **apenas** na
> conclusão de que automação exigiria registry.
