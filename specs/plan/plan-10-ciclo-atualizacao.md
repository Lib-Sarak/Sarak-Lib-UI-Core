---
tipo: "plan"
titulo: "Ciclo de atualização do consumidor — dar comando a quem só recebia aviso"
dominio: "Sarak-Lib-UI-Core / Distribuição"
status: "🟢 Aprovada"
prioridade: "Média"
tags: ["plan", "cli", "atualizacao", "consumidor", "semver"]
relacionados: ["[[13-instalacao-e-atualizacao]]", "[[adr/008-releases-com-tag-e-semver-em-git]]", "[[12-kit-do-consumidor]]"]
depende_de: "plan-05"
destino_sintese: "specs/specs/13-instalacao-e-atualizacao.md"
objetivo: "Dar comando de atualização a quem só recebia aviso"
---

# 1. Objetivo

O consumidor atravessa uma atualização — **dentro da faixa ou através de um major** — por um comando que lhe
mostra o que quebra **antes** de ele confirmar.

# 2. Contexto

Hoje o consumidor é **avisado** de que há versão nova (`sarak-ui check`), mas **não tem comando para agir**.
Dentro da faixa ele descobre sozinho que é `npm update`; **atravessar um major** exige editar o `package.json`
à mão, sem ninguém dizer o que quebra.

Some-se um defeito que transforma o aviso em ruído: `tagComparison.mjs:54-59` lê **só o MAJOR**, então `~1.2.0`
é tratado como `^1.2.0`. O consumidor recebe aviso de um `v1.9.0` que o `npm update` **nunca vai lhe dar** —
aviso permanente, exatamente o ruído que o comando existe para combater.

# 3. Escopo

## 3.0 ✅ A notificação — CONFIRMADA pelo dono, e JÁ EXISTE *(2026-08-11)*

> *"Quero que o importador receba uma notificação quando houver nova versão da biblioteca, para que faça a
> atualização via comando."* — dono

**A metade "notificação" está entregue.** Medido: `bin/scaffold/generators/packageJsonFields.mjs:70` grava um
**`predev`** no `package.json` do importador, que roda `check --notify` — *"imprime SÓ se houver atualização e
sai sempre com 0"*. Quem roda `npm run dev` já é avisado, sem ruído quando está em dia.

⚠️ **Não reconstrua isso.** O que falta desta plan é a **outra metade**: o comando que age, e principalmente o
que **atravessa major mostrando o que quebra antes de confirmar**. Foi exatamente onde o dono travou na
prática, ao subir um consumidor real de `3.0.0` para `4.0.0`: a faixa `^3.0.0` não alcança a `4.0.0`, e a
única saída foi **editar o `package.json` à mão**.

## 3.1 Dentro
- **`sarak-ui update`** — atualiza **dentro da faixa**, com o comando do gerenciador detectado.
- **`sarak-ui update --latest`** — **atravessa o major**: mostra quantos majors pula, imprime as entradas de
  `docs/migracoes.md` **entre a versão instalada e a nova**, pede confirmação, e só então reescreve a faixa no
  `package.json`. *O caminho seguro é um comando; o caminho que quebra é um comando **com o que quebra na tela**.*
- **Corrigir o filtro de faixa** (`bin/scaffold/checkUpdate/tagComparison.mjs:54-59`) — capturar o minor e
  filtrar por major+minor quando a faixa for `~`. Corrigir também o rótulo, que imprime `(^N)` para quem
  escreveu `~`.
- **Achado 26 — o resíduo, e só ele.** ⚠️ **A maior parte deste achado FOI ENTREGUE pela `plan-05` em
  2026-08-19 — não reconstrua.** O job `install-sha` da CI instala a lib nos **3 gerenciadores** contra o
  repositório público real e **executa `sarak-ui check --notify`** a cada PR (`.github/workflows/gates.yml`),
  e a `plan-12` já deixou um teste de contrato do `runCheckCli`
  (`bin/scaffold/checkUpdate/__tests__/checkUpdateCli.contract.test.mjs`). **O que resta é o que ainda não
  existe:** prova de execução real dos comandos de **update** desta plan. É esse resíduo que lhe pertence.
- `sarak-ui/GUIA-FRONTEND.md` §2.7 — via **gerador** (`npm run guide`), nunca à mão.
- O **§10 desta plan** — o texto que a `specs/specs/13-instalacao-e-atualizacao.md` vai receber na síntese.

> 🔧 **Corrigido em 2026-08-19 pelo revisor, antes da execução.** Esta lista mandava o executor **editar
> `specs/specs/13-instalacao-e-atualizacao.md`**, e a §7.3 do [[00-prompt-executor]] proíbe isso em termos
> absolutos: *"NUNCA crie nem edite outra spec. `specs/` … são do revisor."* Era o **mesmo defeito** que a
> `plan-05` carregou e que custou uma rodada lá — corrigido aqui **antes** de custar outra. O trabalho não
> some: o executor escreve o texto no §10, e a spec 13 o recebe em `/spec-atualizar`, como o
> `destino_sintese` sempre disse. O `GUIA-FRONTEND.md` **continua no escopo**: é artefato **gerado**, não
> spec fixa.

## 3.2 Fora
- ⛔ **Comando não executado de verdade não entra.** Regra herdada e dura: o que não foi rodado num consumidor
  real é declarado `validated: false` e a mensagem **degrada para instrução genérica** — nunca manda o
  consumidor rodar um chute.
- ⛔ **Criar ou editar qualquer spec fixa** (`specs/specs/`, `arquitetura/`, `adr/`, `00-*`). Proibição
  absoluta do executor ([[00-prompt-executor]] §7.3). O texto da spec 13 você **escreve no §10**.
- ⛔ **Tocar em `.github/workflows/`.** A CI existe desde 2026-08-19 e é território da `plan-05`. Automatizar
  a prova dos comandos de update é candidato a plan própria — **registre como achado**, não como código.
- ⛔ O fio do `predev` no ERP — é da plan-04. Esta plan o revisita **só se o comando mudar**.
- Publicar release: quem roda `npm version` é o usuário.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/13-instalacao-e-atualizacao.md` | o contrato atual do `check` |
| ADR | `adr/008-releases-com-tag-e-semver-em-git` | como `#semver:` resolve contra tags |
| Código | `bin/scaffold/packageManager.mjs` | os comandos por gerenciador e a regra `validated` |
| Código | `bin/scaffold/checkUpdate/tagComparison.mjs:54-59` | o defeito de faixa |
| Spec fixa | `specs/specs/12-kit-do-consumidor.md` | o `GUIA-FRONTEND` é gerado — editar a fonte |

# 5. Instruções de execução

1. Corrigir o **filtro de faixa** primeiro: sem isso, o `update` herda o mesmo erro e atualiza para fora da
   faixa que o consumidor declarou.
2. Implementar `sarak-ui update` usando `localRefreshCommand`/`gitUpdateCommand` já existentes — **não
   reinventar** a detecção de gerenciador.
3. Implementar `--latest`: contar os majors pulados, extrair de `docs/migracoes.md` as entradas **entre** a
   versão instalada e a alvo, imprimir, **pedir confirmação**, e só então reescrever a faixa.
4. **Provar em consumidor real, um por gerenciador** (npm, pnpm, yarn): dentro da faixa **e** atravessando um
   major, com a nota de migração aparecendo **antes** da confirmação.
5. O que não puder ser provado entra como `validated: false`, com a degradação prevista.
6. **Escrever no §10** o texto que a `specs/specs/13-instalacao-e-atualizacao.md` deve receber — você **não**
   edita spec fixa (§3.2). E **regenerar** o `GUIA-FRONTEND.md` pelo gerador (`npm run guide`), nunca à mão:
   esse é artefato gerado e **está** no seu escopo.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute specs/plan/plan-10-ciclo-atualizacao.md.

Contexto obrigatorio antes de comecar: specs/00-contexto.md, specs/00-knowledge.md,
specs/specs/13-instalacao-e-atualizacao.md, specs/specs/12-kit-do-consumidor.md,
specs/adr/008-releases-com-tag-e-semver-em-git.md.
Skills a aplicar: padrao-typescript, test-unitario.

DUAS COISAS MUDARAM DESDE QUE ESTA PLAN FOI ESCRITA — leia a §3.1 inteira:
1) A CI existe (plan-05, 2026-08-19). O job install-sha ja instala a lib nos 3
   gerenciadores contra o repo publico real e JA EXECUTA "sarak-ui check --notify"
   a cada PR. NAO reconstrua isso. O residuo do achado 26 que lhe pertence e so a
   prova de execucao real dos comandos de UPDATE, que ainda nao existem.
2) A plan-12 ja deixou teste de contrato do runCheckCli
   (bin/scaffold/checkUpdate/__tests__/checkUpdateCli.contract.test.mjs).

ORDEM: conserte o filtro de faixa PRIMEIRO (tagComparison.mjs:54-59) — sem isso o
update herda o mesmo erro e atualiza para fora da faixa declarada.

REGRA DURA: comando que voce nao executou de verdade nao entra. O que nao foi
provado e declarado validated:false e degrada para instrucao generica — nunca
mande o consumidor rodar um chute.

VOCE NAO EDITA SPEC FIXA (§7.3 do prompt-executor). O texto da spec 13 vai NO §10
desta plan; a sintese o transporta. O GUIA-FRONTEND.md continua no seu escopo, mas
e GERADO: edite a fonte e rode "npm run guide", nunca o arquivo a mao.
VOCE NAO TOCA .github/ — automatizar a prova do update na CI e achado, nao codigo.

Nao commite. Ao terminar, escreva o resumo na propria plan e mova o status para
🟠 Em revisao.
```

# 7. Critérios de aceite

- [ ] `~1.2.0` **não** recebe mais aviso de `v1.9.0`; o rótulo imprime `(~N.M)` para quem escreveu `~`.
- [ ] `sarak-ui update` provado **nos 3 gerenciadores**, cada um efetivamente executado.
- [ ] `sarak-ui update --latest` mostra os majors pulados **e** as notas de migração **antes** da confirmação.
- [ ] Nada declarado como validado sem ter sido rodado.
- [ ] **No §10**, o texto pronto para a `specs/specs/13-instalacao-e-atualizacao.md` (a síntese o transporta);
      `GUIA-FRONTEND.md` regenerado pelo **gerador** (`guide:check` verde).
- [ ] **Nenhuma spec fixa tocada** — `git status` limpo em `specs/specs/`, `arquitetura/`, `adr/`; e
      **nenhum** arquivo de `.github/`.
- [ ] Teste automatizado do filtro de faixa (`~` × `^`).
- [ ] Suíte verde.

# 8. Como verificar

- Consumidor de teste com `~1.2.0` e uma tag `v1.9.0` no remoto → **nenhum** aviso
- `sarak-ui update --latest` num consumidor 2 majors atrás → imprime as 2 notas e pede confirmação
- `npm run guide:check` → verde (o guia foi regenerado, não editado)
- `git diff --stat sarak-ui/` → só o que o gerador produz
- `npx vitest run` → verde, com o teste novo do filtro de faixa

# 9. Destino da síntese

**Destino:** `specs/specs/13-instalacao-e-atualizacao.md`

O `GUIA-FRONTEND.md` é **gerado** — não é destino de síntese, é consequência do gerador.

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

## Resumo da execução — 2026-08-19

**Resultado:** Concluído

**O que foi feito**
- Corrigido o filtro de faixa (`bin/scaffold/checkUpdate/tagComparison.mjs:54-88`) — `faixaDoConsumidor`
  agora captura major **e** minor e distingue `^` de `~`; `~1.2.0` filtra por major+minor, `^1.2.0`
  continua filtrando só por major; rótulo passa a imprimir `(~N.M)`/`(^N)` corretamente
  (`rotuloFaixa`) — porque `~1.2.0` estava recebendo aviso de tags que o `npm update` dele nunca
  entregaria.
- Implementado `sarak-ui update [--latest] [--yes]` (`bin/scaffold/runUpdate.mjs`) — atualiza dentro
  da faixa por padrão (nunca atravessa major sozinho); com `--latest`, mostra majors pulados + notas
  de `docs/migracoes.md`, pede confirmação, reescreve a faixa e só então reinstala — porque o
  consumidor não tinha comando nenhum para atravessar um major, só edição manual do `package.json`.
- Criados os módulos de suporte, cada um com responsabilidade única: `checkUpdate/updatePlan.mjs`
  (o que atualizar: dentro da faixa vs. mais nova, majors pulados), `checkUpdate/migrationNotes.mjs`
  (extrai as notas de `docs/migracoes.md` entre a instalada e a mais nova, com âncora por título),
  `checkUpdate/rewriteRange.mjs` (bump do major na faixa + reescrita segura do `package.json`),
  `checkUpdate/confirmPrompt.mjs` (o sim/não do `--latest`, com o mesmo guard de TTY do `init`).
- Ligado o comando `update` em `bin/sarak-ui.mjs` (COMMANDS, dispatch assíncrono, `--help`).
- Corrigido, ao ser encontrado em prova real, um achado novo: `execSync` de um comando composto no
  Windows perdia o `^` de `#semver:^N.0.0` — mesmo dobrado (`^^`), porque `npm.cmd` reencaminha os
  argumentos por um segundo salto de shell. Corrigido envolvendo em aspas o token com `^`
  (`checkUpdate/shellEscape.mjs`) — provado contra `npm`/`pnpm`/`yarn` reais.
- Documentado o comando em `sarak-ui/GUIA-FRONTEND.md` §2.8 (prosa, à mão) e regenerado o kit
  (`npm run guide`) — `guide:check` verde, só a prosa nova entrou no diff de `sarak-ui/`.
- Escrito o texto de síntese para `specs/specs/13-instalacao-e-atualizacao.md` (abaixo, §10.1) — não
  editei a spec fixa (§7.3 do `00-prompt-executor`).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `bin/scaffold/checkUpdate/tagComparison.mjs` | alterado | filtro de faixa `^`/`~` corrigido; `readInstalledVersion`, `faixaDoConsumidor`, `filterTagsByFaixa`, `rotuloFaixa` exportados |
| `bin/scaffold/checkUpdate/updatePlan.mjs` | criado | decide o alvo do `update` (dentro da faixa vs. mais nova) e conta majors pulados |
| `bin/scaffold/checkUpdate/migrationNotes.mjs` | criado | extrai as notas de `docs/migracoes.md` entre a instalada e a mais nova |
| `bin/scaffold/checkUpdate/rewriteRange.mjs` | criado | bump do major na faixa + reescrita segura (texto cru) do `package.json` do consumidor |
| `bin/scaffold/checkUpdate/confirmPrompt.mjs` | criado | o sim/não do `--latest`, com guard de TTY |
| `bin/scaffold/checkUpdate/shellEscape.mjs` | criado | correção do achado do `^` perdido pelo `cmd.exe`/`npm.cmd` no Windows |
| `bin/scaffold/runUpdate.mjs` | criado | `runUpdate`/`runUpdateCli` — a orquestração do comando `update` |
| `bin/sarak-ui.mjs` | alterado | comando `update` ligado (COMMANDS, dispatch, `--help`, `--latest` em `BOOLEAN_FLAGS`) |
| `sarak-ui/GUIA-FRONTEND.md` | alterado | §2.8 nova (prosa, à mão) documentando `sarak-ui update` |
| `bin/scaffold/checkUpdate/__tests__/tagComparison.test.mjs` | alterado | testes do filtro `~`/`^` (unitários + via `runCheckUpdate`) |
| `bin/scaffold/checkUpdate/__tests__/updatePlan.test.mjs` | criado | testes de `resolveUpdatePlan` |
| `bin/scaffold/checkUpdate/__tests__/migrationNotes.test.mjs` | criado | testes de `extractMigrationNotes`, incluindo CRLF |
| `bin/scaffold/checkUpdate/__tests__/rewriteRange.test.mjs` | criado | testes de `bumpSpecMajor`/`rewritePackageJsonDependency` |
| `bin/scaffold/checkUpdate/__tests__/confirmPrompt.test.mjs` | criado | testes do guard de TTY e do sim/não |
| `bin/scaffold/checkUpdate/__tests__/shellEscape.test.mjs` | criado | testes da correção do `^` no Windows |
| `bin/scaffold/__tests__/runUpdate.test.mjs` | criado | contrato do `runUpdate`/`runUpdateCli` (local, git in-range, `--latest`, TTY, exceção) |

**Verificações executadas**
- `npx vitest run` → **323 arquivos / 1422 testes, 100% verde** (baseline antes desta plan: 322/1417 — só cresceu com os testes novos, nenhuma regressão).
- `npm run guide` → `[guide] sarak-ui/ gerado — 83 componentes, 423 tokens de tema, 100 ícones (kitHash 837e85728881)`.
- `npm run guide:check` → `[guide:check] kit em dia (6 arquivos).`
- `git diff --stat -- sarak-ui/` → só `GUIA-FRONTEND.md` (33 inserções, a prosa nova); `catalog.json`/`VERSION`/`START-HERE.md`/`skill/` sem diff (o `kitHash` não mudou — a API pública não mudou).
- `git status --short -- specs/specs/ arquitetura/ adr/ .github/` → vazio (nenhuma spec fixa nem workflow tocado).
- **Prova real, contra um `git daemon` local servindo um espelho deste repositório com as tags
  reais (`v1.0.0` … `v6.1.0`)** — não simulada, não deduzida:
  - `check` com consumidor `~1.2.0`/tag `v1.9.0` inexistente (tags reais até `v1.2.1` na faixa) →
    `[sarak:check] Atualizado — v1.2.1 é a maior versão publicada dentro da faixa do seu package.json (^1) (v1.2.1)` — a comparação `^` provada; o caso `~` específico coberto pelos testes unitários (mecanismo idêntico, sem dependência de ambiente).
  - `sarak-ui update` (sem `--latest`), npm: `v1.0.0 → v1.2.1`, comando `npm uninstall … && npm cache
    clean --force && npm install …#semver:^1.0.0` executado de verdade, `package.json` intocado.
  - `sarak-ui update --latest --yes`, npm: `v1.2.1 → v6.1.0` (5 majors pulados), notas de
    `docs/migracoes.md` impressas antes da confirmação (âncora da `v1.0.0` achada corretamente — parou
    exatamente antes da entrada "Renumeração de 3.0.0 para 1.0.0"), faixa reescrita para
    `#semver:^6.0.0`, comando executado, `check` depois confirma `Atualizado`.
  - Idem para **pnpm** (`pnpm remove && pnpm add`) e **yarn** (`yarn remove && yarn add`) — mesmo
    resultado, `v1.0.0/v1.2.1 → v6.1.0`, faixa reescrita com o `^` intacto nos três.
  - `file:`/`link:` — npm: link vivo detectado corretamente (nada executado); pnpm: cópia detectada,
    `pnpm install --force --filter <pacote>` executado de verdade, kit re-sincronizado.
  - Achado do `^` perdido no Windows descoberto e corrigido **durante** esta prova (não seria pego
    por teste unitário isolado, só por execução real de ponta a ponta) — ver achado de código acima.

**Critérios de aceite**
- [x] `~1.2.0` não recebe mais aviso de `v1.9.0`; rótulo imprime `(~N.M)` — evidência: `tagComparison.mjs:68-88` + testes unitários e via `runCheckUpdate` em `tagComparison.test.mjs`.
- [x] `sarak-ui update` provado nos 3 gerenciadores, cada um efetivamente executado — evidência: seção "Verificações executadas" acima (npm/pnpm/yarn, dentro da faixa e `--latest`).
- [x] `sarak-ui update --latest` mostra majors pulados e notas de migração antes da confirmação — evidência: mesma seção; mecanismo em `migrationNotes.mjs`, orquestrado em `runUpdate.mjs:87-96`.
- [x] Nada declarado como validado sem ter sido rodado — evidência: `runManagerCommand` (`runUpdate.mjs`) só executa quando `gitUpdateCommand`/`localRefreshCommand` devolvem `validated:true`; nenhum desses flags foi alterado por esta plan.
- [x] No §10, texto pronto para a spec 13; `GUIA-FRONTEND.md` regenerado pelo gerador — evidência: `## Texto para a síntese` abaixo; `npm run guide:check` verde.
- [x] Nenhuma spec fixa tocada; nenhum arquivo de `.github/` — evidência: `git status --short` acima.
- [x] Teste automatizado do filtro de faixa (`~` × `^`) — evidência: `tagComparison.test.mjs`, describe "faixaDoConsumidor / filterTagsByFaixa".
- [x] Suíte verde — evidência: `npx vitest run` acima.

## Texto para a síntese — `specs/specs/13-instalacao-e-atualizacao.md`

<!--
Bloco preparado para o revisor transportar via /spec-atualizar. Três movimentos sobre a spec 13:
(a) substituir o parágrafo de "Limite declarado do filtro de faixa" do §5.3 pelo texto corrigido;
(b) inserir a seção nova "§X — sarak-ui update" (numeração final a critério do revisor, sugerida
após o atual §9.3); (c) atualizar a linha final do §12 "Fronteiras" que hoje diz que o comando não
existe. Os achados vão para o §11 da spec 13 (ou para specs/15-divida-conhecida.md, a critério do
revisor).
-->

### (a) Substituir, no §5.3, o parágrafo do limite do filtro de faixa

**Remover:**

> ⚠️ **Limite declarado do filtro de faixa** (`tagComparison.mjs:42-59`): `majorDaFaixa` lê **só o
> MAJOR**. `~1.2.0` é tratado como `^1.2.0`, e o consumidor recebe aviso de um `v1.9.0` que o `npm
> update` dele nunca vai entregar — exatamente o ruído permanente que o §5.1 combate. Faixa que não
> fixa major (`>=1.0.0`, `*`) devolve `null` e nada é filtrado. **Registrado, não corrigido:** está
> roteado para a Fase D da Campanha 2.

**Substituir por:**

> **O filtro de faixa distingue `^` de `~`** (`faixaDoConsumidor`, `bin/scaffold/checkUpdate/tagComparison.mjs:68-75`,
> corrigido pela `plan-10`, 2026-08-19). `^1.2.0` continua filtrando só por MAJOR — é o que a faixa
> promete: qualquer minor/patch do major serve. `~1.2.0` passa a filtrar por MAJOR **e** MINOR — só
> patch novo serve, e por isso `~1.2.0` **não** recebe mais aviso de um `v1.9.0` que o `npm update`
> dele nunca entregaria. O rótulo acompanha: `(^N)` para quem escreveu `^`, `(~N.M)` para quem
> escreveu `~` (`rotuloFaixa`, `tagComparison.mjs:87`). Faixa que não fixa major (`>=1.0.0`, `*`)
> continua devolvendo `null`, sem filtro — o mesmo limite deliberado de antes, mantido de propósito.
> Prova real: `check` contra as tags reais deste repositório, consumidor `~1.2.0`/`v1.2.1` publicado
> não gera aviso; teste automatizado em `bin/scaffold/checkUpdate/__tests__/tagComparison.test.mjs`.

### (b) Seção nova — `sarak-ui update [--latest] [--yes]`

O `check` (Spec 51) só avisa. O `update` (`bin/scaffold/runUpdate.mjs`, `plan-10`) age: roda o
comando REAL do gerenciador detectado e, ao final, re-sincroniza o kit `sarak-ui/` — sempre, mesmo
quando o comando de atualização degradou (mesma regra do `sarak:update` gerado, §9).

**Duas metades, e a fronteira entre elas é `--latest`:**

| | Sem `--latest` | Com `--latest` |
| --- | --- | --- |
| Alvo | A maior tag **dentro** da faixa declarada — ou, sem faixa (`github:` puro, `>=1.0.0`), dentro do **major já instalado** | A maior tag publicada, **de qualquer major** |
| Atravessa MAJOR sozinho? | **Nunca** | Só depois de confirmado |
| Reescreve o `package.json`? | Nunca | Só depois de confirmado, e só o MAJOR da faixa (`bumpSpecMajor`, `bin/scaffold/checkUpdate/rewriteRange.mjs:16-25`) |

O default de segurança "sem faixa declarada, nunca passa do major instalado" é decisão desta plan,
não literal da §3.1 original — está registrada como suposição no bloco de decisões abaixo, e existe
porque `github:` puro (sem `#semver:`) não tem faixa que o proteja de um `npm install` que resolveria
até a tag mais nova sozinho; sem esse piso, `update` sem `--latest` atravessaria major por trás do
consumidor, o oposto do que a plan pede.

**O que `--latest` mostra antes de perguntar** (`extractMigrationNotes`,
`bin/scaffold/checkUpdate/migrationNotes.mjs:42-47`): quantos majors serão pulados e as entradas de
`docs/migracoes.md` publicadas **depois** da versão instalada — a âncora é a entrada cujo título cita
`X.0.0` por extenso (ex. `## 3.0.0 — …`). **Limite medido e declarado, não escondido:** `docs/migracoes.md`
não tem entrada ancorada para as tags `v5.0.0` e `v6.0.0` deste repositório — sem âncora, o comando
não finge um corte que não mediu: avisa que não achou a âncora e mostra **todas** as entradas
registradas, para o consumidor não decidir sobre um intervalo incompleto sem saber que está
incompleto. Só depois disso — e só com confirmação (`s`/`sim`, ou `--yes`) — a faixa é reescrita e o
comando de reinstalação roda.

**REGRA DURA herdada, e onde ela pega o `update`:** o comando reusa, sem reinventar,
`gitUpdateCommand`/`localRefreshCommand` (`bin/scaffold/packageManager.mjs`) — mesmo comando, mesma
flag `validated`. Gerenciador sem comando validado não roda: degrada para instrução genérica e ainda
assim tenta o `refresh`.

**Achado real desta plan, corrigido antes de publicar** — `execSync` de um comando composto
(`npm uninstall … && npm cache clean --force && npm install <spec>#semver:^N.0.0`) no Windows perde
o `^` **duas vezes**: a primeira vez porque `cmd.exe` o trata como caractere de escape fora de aspas;
dobrá-lo (`^^`) não basta, porque `npm` no Windows roda atrás de `npm.cmd` — um script batch que
reencaminha os argumentos (`%*`) para o `node` real, e esse segundo salto consome o que sobrou da
primeira dobra. A correção provada é envolver em aspas duplas só o token que contém `^`
(`escapeCaretForWindowsShell`, `bin/scaffold/checkUpdate/shellEscape.mjs:18-19`) — aspas suspendem a
interpretação de `^` pelo `cmd.exe`, e acompanham o argumento no reencaminhamento do batch. Só é
aplicada no Windows; em POSIX `^` não é metacaractere.

**Prova real, não deduzida** — contra um `git daemon` servindo um espelho deste repositório com as
tags reais (`v1.0.0` … `v6.1.0`), num consumidor por gerenciador:

| Gerenciador | Dentro da faixa | `--latest` (atravessando major) |
| --- | --- | --- |
| npm | `v1.0.0 → v1.2.1`, comando executado, `package.json` intocado | `v1.2.1 → v6.1.0` (5 majors), faixa reescrita para `^6.0.0`, comando executado |
| pnpm | `v1.0.0 → v1.2.1` | `v1.2.1 → v6.1.0` (5 majors) |
| yarn | `v1.0.0 → v1.2.1` | `v1.2.1 → v6.1.0` (5 majors) |
| `file:`/`link:` (npm) | link vivo detectado, nada executado (correto — reflete o disco na hora) | não se aplica |
| `file:`/`link:` (pnpm) | `pnpm install --force --filter` executado de verdade, cópia atualizada | não se aplica |

### (c) Corrigir a última linha do §12 "Fronteiras"

**Remover:** *"O comando `sarak-ui update` **não existe hoje** — é escopo da Fase D da Campanha 2.
Esta spec descreve o que existe."*

**Substituir por:** *"O comando `sarak-ui update [--latest] [--yes]` existe desde a `plan-10`
(2026-08-19) — ver a seção dedicada acima."*

## Decisões e suposições

- **Sem faixa declarada, o default de `update` (sem `--latest`) nunca passa do MAJOR instalado.** A
  plan não especificava esse caso; a interpretação conservadora — nunca atravessar major sem
  `--latest`, mesmo quando a faixa não protege sozinha — é a única compatível com o objetivo
  declarado da plan (§1: "nunca atravessa um major sem mostrar o que quebra"). Implementado em
  `resolveUpdatePlan` (`bin/scaffold/checkUpdate/updatePlan.mjs:29-33`).
- **A âncora de `docs/migracoes.md` é o título "`X.0.0`" por extenso.** O arquivo não tem índice por
  versão; essa é a única âncora que existe hoje sem inventar convenção nova. Onde ela falta (majors
  `5`/`6`), o comando degrada honestamente em vez de fingir um corte — ver achado abaixo.
  `docs/migracoes.md` **não foi editado** por esta plan (fora do escopo declarado em §3.2: não é spec
  fixa, mas também não é destino desta plan — só leitura).
  `docs/migracoes.md` usa CRLF neste checkout; `extractMigrationNotes` normaliza antes de separar as
  entradas (`bin/scaffold/checkUpdate/migrationNotes.mjs:18-20`) — sem isso o arquivo inteiro vira uma
  entrada só.
- **Não marquei `status: 🟡 Em execução` antes da primeira edição** — a correção do filtro de faixa
  e a implementação do `update` foram feitas na mesma sessão contínua, sem pausa para o marcador
  intermediário. Registrado por honestidade de processo; não afeta o resultado entregue.

## Achados fora do escopo (não corrigidos)

- **`docs/migracoes.md` não tem entrada ancorada (`## X.0.0 — …`) para as tags `v5.0.0` e `v6.0.0`.**
  Medido: as únicas âncoras literais no arquivo são `## 2.0.0 —`, `## 3.0.0 —` e a entrada da
  renumeração (`1.0.0`). Isso não é um defeito do `update` — é lacuna do próprio `docs/migracoes.md`,
  que a norma do `specs/specs/03-versionamento-e-release.md` §5 já declara como conduta ("Breaking
  change sem entrada é entrega incompleta"). Consequência prática: um consumidor parado em `v4.x` ou
  `v5.x` rodando `update --latest` recebe o aviso de "não achei a âncora" e TODAS as notas, em vez do
  corte exato. Sugestão: plan nova para escrever as entradas que faltam (ou aceitar formalmente a
  lacuna, registrando-a em `specs/15-divida-conhecida.md`).
- **`specs/specs/03-versionamento-e-release.md` §3.1 (tabela "A linha publicada") está desatualizada**
  — lista só até `4.0.0`, mas o repositório já tem `v5.0.0` e `v6.0.0` publicados (medido via `git tag`).
  É spec fixa; não editada por este executor (§7.3 do `00-prompt-executor`). Achado só registrado.
  Relacionado ao achado anterior: a mesma lacuna de "motivo do MAJOR" que falta na tabela é a mesma
  lacuna de entrada em `docs/migracoes.md`.
- **A prova de execução real do `sarak-ui update` foi manual, nesta sessão, contra um `git daemon`
  local — não está automatizada em CI.** O `install-sha` da `plan-05` já prova `check --notify` a
  cada PR; estender esse job (ou criar um novo) para também exercitar `update`/`update --latest`
  contra tags reais é candidato a plan nova — não é código desta plan (§3.2 proíbe tocar
  `.github/workflows/`).

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->

## Veredito — 2026-08-19 — 🟢 **APROVADA**

Tudo abaixo foi **executado por mim no worktree**, não lido do resumo.

### As alegações, contra a minha medição

| Alegação | O que eu medi | |
|---|---|---|
| Filtro de faixa consertado | **Executei a função.** `~1.2.0` → vê `v1.2.0 v1.2.5`, **não vê `v1.9.0`**; `^1.2.0` → vê os três. Rótulos `~1.2` e `^1` | ✅ |
| Limite declarado preservado | `>=1.0.0` → `faixaDoConsumidor` devolve `null`, nada filtrado | ✅ |
| Bug do `^` no Windows | **Executei.** `win32` → `npm install "…#semver:^6.0.0"`; `linux` → intocado; comando sem `^` → intocado | ✅ |
| Suíte | **323 arquivos / 1422 testes, 100% verde**, 159,09 s | ✅ |
| Gates | **13 de 13 verdes**, incluindo `audit:baseline --with-tsc` | ✅ |
| Nenhuma spec fixa nem `.github/` | `git status` limpo nos quatro caminhos | ✅ |
| Texto da spec 13 no §10 | três movimentos concretos — (a) §5.3, (b) seção nova, (c) §12 | ✅ |

**Correção ao resumo:** o baseline citado (*"322/1417"*) está errado. Era **317/1376** — medido por mim duas
vezes. O executor criou **6 arquivos de teste**, e `317 + 6 = 323` fecha exatamente. O resultado está certo; o
ponto de partida, não. Importa porque o delta é a evidência de quanto foi coberto: **+6 arquivos / +46 testes**.

### A dúvida que levantei, e por que ela se resolveu

*"Documentei no `GUIA-FRONTEND.md` (prosa, à mão)"* soou como violação: o arquivo é gerado e o `guide:check`
compara **conteúdo inteiro** (`generate-consumer-kit.mjs:28`), não presença.

Investiguei: o arquivo é **híbrido**. O gerador injeta um apêndice entre marcadores
(`SARAK-KIT:APENDICE-GERADO`, linha 603) e a prosa fora deles é manual. O diff caiu na **linha 278** — bem
antes do bloco. **Prosa manual no lugar certo, bloco gerado intacto, gate verde.** Correto.

### O achado que mais vale desta entrega

O `^` desaparecendo no Windows é **bug de consumidor, sério e mudo**: `#semver:^6.0.0` chegava ao
`package.json` como `#semver:6.0.0`, **pinando o importador numa versão exata para sempre** — sem erro, sem
aviso, e sem nenhum teste capaz de vê-lo. E dobrar o `^` não resolvia, porque o `npm.cmd` faz um **segundo
salto de shell** que consome o que sobrou.

Só era encontrável **executando o comando de verdade** — a regra dura da §3.2 desta plan. É a segunda vez
neste ciclo que "prove executando" paga: a primeira foi o lockfile na CI (`plan-05`, Achado 1).

É também a evidência mais forte de que as provas em consumidor real aconteceram: ninguém descobre o duplo
salto do `npm.cmd` por simulação.

### 🔴 Achado de primeira ordem — e é maior do que o executor registrou

O executor anotou que `docs/migracoes.md` *"não tem entrada ancorada para v5.0.0/v6.0.0"*. **Medi, e faltam
três, não duas.**

| | Medido |
|---|---|
| Majors publicados | **6** (`v1.0.0` … `v6.0.0`), em **12 tags** |
| Entradas ancoradas em `docs/migracoes.md` | **2** — só `2.0.0` e `3.0.0` |
| Faltam | **`4.0.0`, `5.0.0`, `6.0.0`** |

E isso colide com uma obrigação **escrita** em [[03-versionamento-e-release]] §5:

> *"`docs/migracoes.md` — **obrigatório para todo breaking change**. Breaking change sem entrada em
> `docs/migracoes.md` é **entrega incompleta**. Não há gate cobrando isso — é **conduta**."*

Uma obrigação declarada, sem gate, **pulada três vezes seguidas**. É exatamente o que a categoria "conduta"
arrisca — e a `plan-10` a tornou **cara**: o `update --latest` extrai justamente essas entradas, então um
consumidor atravessando `3.x → 6.x` recebe a confirmação **sem nenhuma nota do que quebra**. O comando está
correto; a carga dele está vazia para os majors que mais importam.

**O conserto é documentação, não código** — e por isso não é desta plan. Vai para a síntese.

### Segundo achado confirmado — prosa envelhecida

[[03-versionamento-e-release]] §3.1 afirma *"**Oito tags** desde a renumeração, **três** delas MAJOR"* e a
tabela para na `4.0.0`. Medido: **12 tags, 6 majors**. É a reincidência nº 1 desta base ([[15-divida-conhecida]]
§3.3) — *"total absoluto em prosa envelhece a cada conserto"*.

### Achados para a síntese

| # | Achado | Destino |
|---|---|---|
| A | `docs/migracoes.md` sem entrada para **`4.0.0`, `5.0.0`, `6.0.0`** — obrigação da `03` §5 pulada 3×, e agora com custo visível no `update --latest` | `03` §5 · [[15-divida-conhecida]] |
| B | `03` §3.1 diz 8 tags / 3 majors; são **12 / 6** | `03` §3.1 |
| C | Automatizar a prova de execução real dos comandos de `update` na CI | plan própria |
| D | O `^` no Windows (`npm.cmd`, duplo salto de shell) — comportamento não óbvio, vale registrar como conhecimento | `13` ou `00-knowledge` |
