---
tipo: "spec"
titulo: "Importação e Atualização da Biblioteca (fluxo de desenvolvimento — consumidor sempre no main atual)"
dominio: "Empacotamento / Scaffolder (init) / Skills de Consumo / Fluxo de release"
status: "🟢 Concluída (2026-07-21) — gates verdes, ERP destravado e verificado"
prioridade: "Alta"
tags: ["spec", "instalacao", "atualizacao", "release", "git-dependency", "dx"]
relacionados: ["29-robustez-instalacao-pacote", "21-scaffolder-init", "22-skills-de-consumo-golden-path", "40-teste-real"]
---

> **Numeração:** recebeu o número **39** por ser o desbloqueio imediato que roda **antes** da família 40 (40 Teste Real → 41 Bundle → 42 CardGrid). Assim as três specs recém-criadas não precisam ser renumeradas pela terceira vez.

# 1. Visão Geral e Descrição do Problema

O consumidor de teste `Earendel/ERP` ficou **preso silenciosamente numa build antiga da biblioteca** — e isso só foi descoberto por acaso, ao conferir por que o `src/` continuava no `node_modules` mesmo depois da Spec 30 tê-lo eliminado.

**Diagnóstico verificado (não é bug de empacotamento):**
- O `package-lock.json` do ERP fixa a dependência git no commit **`7fd0bd1`**, **4 commits atrás** do `origin/main` (`599341c`). Faltavam ali as specs 27/28/29/30 — inclusive o `dist/styles/` e o `SarakActionCard` generalizado.
- Como `@sarak/lib-ui-core` é instalada por **URL git** (`github:Lib-Sarak/Sarak-Lib-UI-Core`) e a `version` do `package.json` permaneceu **`3.0.0` em 8+ commits**, o npm resolve pelo commit gravado no lock: `npm install` vira **no-op** e reinstala fielmente o pacote velho.
- O empacotamento da lib está **correto** — `npm pack --dry-run` no HEAD produz zero `src/` e inclui `dist/styles/`. O defeito está no **fluxo de atualização**, não no pacote.
- Estado atual do repo: **0 tags**, nenhum release, sem publicação em registry.

**Por que isto é grave (mesma família dos achados do Selo):** é uma **falha silenciosa**. O consumidor não recebe nenhum sinal de que está desatualizado, e o comando natural (`npm install`) reforça o engano ao terminar com sucesso sem mudar nada. Consequência direta e imediata: se o **Teste Real (Spec 40)** rodasse agora, o agente exercitaria a lib antiga e produziria **achados falsos** — por exemplo, re-reportando o botão "Executar" hardcoded que a Spec 30 já corrigiu.

## 1.1 A restrição técnica que a spec precisa assumir (e registrar por escrito)

> **npm NÃO atualiza dependência git automaticamente.** O `package-lock.json` existe precisamente para congelar o commit resolvido. Não existe configuração em que `npm install` passe a puxar o HEAD novo do `main` sozinho. `npm update` também é pouco confiável para git dep sem faixa semver.

Portanto, **"o ERP sempre na versão mais atual" é alcançável como *atualização sob comando*, não como atualização automática.** Atualização automática de verdade exigiria **registry** (npm privado / GitHub Packages) + faixa semver (`^3.1.0`) — fora do escopo desta spec por decisão do mantenedor (ver §2.6).

O objetivo desta spec é, então: **tornar a atualização um único comando confiável, documentado e verificável** — em vez do conhecimento arcano (`uninstall` + `cache clean` + `install`) que hoje só existe na cabeça de quem depurou o problema.

# 2. Regras de Negócio (Solução)

## 2.1 Comando único de atualização, gerado pelo `init`
- O `init` (Spec 21) passa a escrever no `package.json` do consumidor um script dedicado, ex.:
  `"sarak:update": "npm uninstall @sarak/lib-ui-core && npm cache clean --force && npm install github:Lib-Sarak/Sarak-Lib-UI-Core"`
- Requisitos do script: precisa **furar o pin do lockfile** e o **cache git do npm** (as duas causas reais do travamento). Um `npm install` simples NÃO satisfaz este critério — validar que satisfaz é parte do aceite.
- A URL do repositório usada no script deve ser a mesma que o consumidor usou na instalação (não hardcodar cegamente se o `init` souber a origem).

## 2.2 Identidade de build verificável (o consumidor precisa saber o que tem)
- Hoje é **impossível** o consumidor responder "qual build da Sarak eu tenho?": a `version` é sempre `3.0.0` e não há tag. O único jeito é ler o SHA no `resolved` do `package-lock.json` — obscuro.
- Entregar um mecanismo mínimo de identidade: gravar no pacote publicado o **commit/hash e a data do build** (ex.: `dist/BUILD_INFO.json` gerado no `npm run build`, ou campo equivalente exposto pela lib), de modo que o consumidor (e um agente de teste) consiga verificar objetivamente qual build está instalada.
- **Decisão a confirmar na execução (HITL):** adicionar também **bump de versão de desenvolvimento** (`3.0.1`, `3.0.2`…) a cada release de dev — barato e dá sinal semântico — ou deixar só o `BUILD_INFO` até o módulo sair de desenvolvimento. Recomendação: **`BUILD_INFO` agora** (resolve verificação sem criar cerimônia de versionamento antes da hora).

> **CORREÇÃO (follow-up, 2026-07-21) — o `BUILD_INFO` original era estruturalmente impreciso.**
> A 1ª execução gravou o campo como `commit` (implicando "o commit que este build publica"). Isso é
> **impossível de garantir**: o `dist/` (incluindo o próprio `BUILD_INFO.json`) é commitado DEPOIS de
> gerado — a instalação oficial é via `github:` e não há `prepare` script —, e o hash de um commit
> depende do seu conteúdo; gravar dentro dele o próprio hash é auto-referência circular. Evidência real
> colhida no ERP: após um `npm run sarak:update` bem-sucedido, `BUILD_INFO.json` reportava
> `599341cc...` enquanto o `resolved` do lock (e o HEAD real de `origin/main`) já estava em `b8f78ee...`
> — **FALSO NEGATIVO** (parecia desatualizado estando em dia). Correção aplicada:
> 1. **Campo renomeado** `commit`/`commitShort` → `baseCommit`/`baseCommitShort` — semântica honesta:
>    o commit-BASE sobre o qual o build foi gerado, sempre um passo atrás do commit que o publica.
>    `builtAt`/`libVersion` permanecem (são precisos). Campo `note` novo, autoexplicativo no próprio
>    JSON. (`scripts/generate-build-info.mjs`.)
> 2. **Verificação autoritativa nova:** `npm run sarak:check` (gerado pelo `init` junto do
>    `sarak:update`, `bin/scaffold/checkUpdate.mjs`) — lê o `resolved` REAL do
>    `package-lock.json` do consumidor e compara contra o HEAD remoto (`git ls-remote`), a única fonte
>    exata. `BUILD_INFO`/`baseCommit` nunca deve ser usado para essa pergunta.
> 3. Skill `ui-integra-consumidor` corrigida para apontar `sarak:check`/`resolved` como fonte de
>    verdade, com o porquê documentado (para ninguém "consertar" o `BUILD_INFO` de volta no futuro).
>
> Esta é uma correção de follow-up — **a Spec 39 permanece 🟢 Concluída**; o mecanismo central
> (`sarak:update` furando pin+cache) não mudou, só a peça de identidade de build que se mostrou
> insuficiente sozinha. Ver entrada correspondente no `00-progresso.md`.

## 2.3 Documentar o fluxo na skill de consumo
- `ui-integra-consumidor` ganha uma seção **"Como atualizar a biblioteca"** — hoje inexistente: a skill ensina a instalar e nunca menciona atualizar. Deve cobrir:
  - o comando (`npm run sarak:update`);
  - **por que `npm install` sozinho não basta** (o lock pina o commit; a versão não muda) — explicar, não só mandar;
  - como conferir o que está instalado (via `BUILD_INFO`/§2.2) e como confirmar que a atualização pegou.
- Espelhar `.claude/` (é symlink — propagação automática; conferir).

## 2.4 Modo de desenvolvimento local (opcional, avaliar)
- Para quem desenvolve a lib e o consumidor ao mesmo tempo, `file:../Sarak-Lib-UI-Core` (padrão que o `Sarak-MyService` já usa) ou `npm link` propaga instantaneamente, sem install. Avaliar se vale o `init` oferecer isso como opção de modo dev, e documentar o trade-off (não reproduz o pacote publicado — não serve para teste de instalação).

## 2.5 Desbloquear o ERP (validação real desta spec)
- Aplicar no `Earendel/ERP`: furar o pin, atualizar para o `origin/main` atual e **verificar objetivamente**: `dist/styles/` presente, `src/` ausente, `resolved` do lock apontando ao HEAD (`599341c` ou mais recente). `npm run build` do ERP verde.
- Se o manifesto do ERP usar campos que a Spec 30 mudou (`SarakActionCard`: painel via `mapping.details`, botão via `actionLabel`), ajustar **apenas o `manifest.json`** — nunca escrever componente React no consumidor.

## 2.6 Escopo negativo (decisão explícita do mantenedor, 2026-07-21)
- **Tags, releases e publicação em registry ficam de FORA.** O módulo ainda está em desenvolvimento e o mantenedor optou por não definir versionamento agora.
- Registrar como **item futuro** (para quando o módulo estabilizar): política de versionamento com tags (`#v3.1.0` permite ao consumidor travar numa versão e atualizar quando quiser) e a decisão registry-vs-git — **é o único caminho para atualização automática por semver**. Não implementar agora; deixar a porta documentada.

# 3. Critérios de Aceite
- [x] `init` gera o script de atualização no `package.json` do consumidor, e o script **comprovadamente** atualiza um consumidor travado num commit antigo (teste real, não teórico) — validado em consumidor descartável E no ERP real.
- [x] Um `npm install` comum num consumidor travado **continua** não atualizando (comportamento esperado do npm) — confirmado (`up to date in 1s`, `resolved` inalterado) — e a documentação explica isso, em vez de prometer o contrário.
- [x] O consumidor consegue responder "qual build eu tenho?" de forma objetiva (§2.2), antes e depois de atualizar — `dist/BUILD_INFO.json` (commit/commitShort/builtAt/libVersion), gerado por `scripts/generate-build-info.mjs` no `npm run build`, incluído no tarball.
- [x] Skill `ui-integra-consumidor` com a seção "Como atualizar a biblioteca", incluindo o porquê do `npm install` não bastar.
- [x] **ERP destravado e verificado:** `dist/styles/` presente, `src/` ausente, lock no HEAD atual (`599341c`), `npm run build` verde. (É o gate que libera a Spec 40.)
- [x] Gates da lib verdes: `RegistryParity` (5/5), `catalog:check` (em dia), `npm run build` (verde), `package:check` (64 arquivos, `dist/BUILD_INFO.json` incluído), `run_audit.mjs` sem regressão (baseline exato: 1 hardcode + 3 ghostvars + 3 órfãos, todos pré-existentes).

# 4. Plano de Testes (Quality Gate)
## Teste real do mecanismo (o coração desta spec)
- [x] Reproduzido o travamento num consumidor descartável (scratchpad): instalado de um commit antigo real (`7fd0bd1`) + spec git nua (igual ao ERP), confirmado que `npm install` não atualiza (`resolved` continua em `7fd0bd1`), rodado `sarak:update` e confirmado que atualizou para o HEAD atual (`599341c`) — evidência: `resolved` antes/depois + `dist/styles/` ausente→presente + `src/` presente→ausente.
## Smoke / unitário
- [x] `init` escreve o script de atualização (reusando o spec git real do consumidor, nunca um default cego — `bin/scaffold/generators/__tests__/packageJsonFields.test.mjs` + `bin/scaffold/__tests__/runInit.fs.test.mjs`); smoke do `init` segue verde (suíte `bin/scaffold` completa: 47/47).
- [x] `BUILD_INFO` é gerado pelo `npm run build` (`scripts/generate-build-info.mjs`) e entra no tarball (`package:check` cobre — `dist/BUILD_INFO.json` na `REQUIRED_PATHS`).
## Validação em consumidor real
- [x] ERP atualizado e verificado pelos 3 marcadores do §2.5 — **pré-condição da Spec 40 (Teste Real) satisfeita**. `manifest.json` do ERP ajustado (`actionLabel: "Ver contrato"` no `SarakActionCard`, único uso no arquivo) para preservar o texto do botão após a mudança da Spec 30; `npm run build` do ERP verde.
