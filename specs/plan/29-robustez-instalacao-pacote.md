---
tipo: "spec"
titulo: "Robustez da primeira instalação (empacotamento do pacote + entrada do init + skills de instalação)"
dominio: "Empacotamento / Scaffolder (bin) / Skills de Consumo / DX de instalação"
status: "🟡 Executada (2026-07-20) — gates unitários/smoke verdes; validação final é o re-Selo (P15)"
prioridade: "Alta"
tags: ["spec", "correcao-pos-selo", "empacotamento", "scaffolder", "cli", "skills", "golden-path"]
relacionados: ["21-scaffolder-init", "22-skills-de-consumo-golden-path", "26-instalacao-teste", "18-shell-consome-design-engine"]
---

# 1. Visão Geral e Descrição do Problema

Reúne os achados do Selo da Onda que são falhas do **primeiro contato** com o pacote — o que você baixa, o comando que você roda, e a skill que te guia até a primeira tela. Três achados de motor/pacote (bug de lib) + dois de instrução (lacuna de skill), todos verificados no código:

- **Achado 4 (empacotamento — M9 contexto):** `package.json` da lib **não tem campo `files` nem `.npmignore`** (confirmado em `package.json`). `npm install github:Lib-Sarak/Sarak-Lib-UI-Core` copia o repositório-fonte INTEIRO para `node_modules/@sarak/lib-ui-core` — `src/`, `specs/`, `playwright/`, `__snapshots__/`, `vitest.config.ts`, `Template-Ts/`. Infla a instalação, expõe artefatos de desenvolvimento e cria a tentação de "ler o código-fonte" bem debaixo do `node_modules`.
- **Achado 3 (`init --help` + TTY — M1 PARCIAL):** `bin/sarak-ui.mjs:44-50` só reconhece o subcomando `init`; qualquer outra coisa cai numa mensagem de uso com `exitCode 1` — **não existe `--help` de verdade**. As flags reais (`--yes`/`--stack`/`--storage`/`--mode`/`--force`) só apareceram por acidente. E `bin/scaffold/prompts.mjs:25-27` cria `readline` **incondicionalmente**: sem TTY (pipe/CI/agente) e sem `--yes`, a entrevista degenera (EOF → defaults ou hang) e o processo pode terminar com `exit 0` **sem escrever arquivo nenhum e sem erro** — parece ter funcionado. Falta um guard `process.stdin.isTTY`.
- **Achado 2 (`npm install` no diretório errado — M2 FAIL):** a skill `ui-integra-consumidor` (`.agents/skills/ui-integra-consumidor/SKILL.md:42-43`) manda `npm install github:...` como **primeira ação** da Etapa 2, sem nenhum passo garantindo um `package.json` na raiz **antes**. Num diretório sem `package.json` (projeto sem frontend ainda — o caso real do ERP), o npm sobe a árvore de diretórios até o `package.json` ancestral mais próximo (no teste, `C:\Users\Igor\package.json`, projeto não relacionado) e instala lá — 289 pacotes + dependência injetada — sem erro nem aviso. Poluição silenciosa de um projeto alheio.
- **Achado 5 (fluxo "salvar novo tema" — M7 fricção):** personalizar um tema padrão (read-only) no CustomizationPanel e clicar "Aplicar Alterações Globais" não muda nada visível — só abre um modal "Persistência de Tema / salvar como Novo Tema" **não documentado** em nenhuma skill/catálogo. Só descoberto por exploração cega. Depois de completo, funciona e persiste (M7/M8 = PASS no resto).

# 2. Regras de Negócio (Solução)

## 2.1 Empacotamento: publicar só o necessário (motor/pacote — achado 4)
- Adicionar campo **`files`** ao `package.json` da lib (preferível ao `.npmignore` por ser allowlist explícita) restringindo o tarball ao que o consumidor precisa: `dist/`, `bin/`, `backend/`, `docs/manifest-catalog.md`, `docs/manifest-catalog.json`, `templates/` (+ o que o `init` copia; conferir `bin/scaffold/` e `SKILLS_TO_COPY`/`skillsSourceDir` em `context.mjs` — as skills copiadas precisam entrar no pacote). `package.json`/`README`/`LICENSE` entram por padrão do npm.
- **Cuidado (dependência do scaffolder):** o `init` copia skills de `ctx.skillsSourceDir` (`loadInitContext`) — se essas skills vierem de `.agents/skills/` no pacote, `.agents/` (ou o subconjunto necessário) TEM que estar no `files`, senão o `init` do consumidor não acha as skills. Mapear exatamente o que `runInit`/`copySkills` lê do pacote instalado antes de fechar a allowlist. Validar com `npm pack` (2.4).

## 2.2 Entrada do `init`: `--help` real + falha alta sem TTY (motor — achado 3)
- Implementar `--help`/`-h` de verdade em `bin/sarak-ui.mjs` (reconhecido com ou sem `init`): imprime uso, TODAS as flags (`--mode`/`--stack`/`--storage`/`--schema`/`--backend-port`/`--frontend-port`/`--force`/`--yes`) com defaults e exemplos, e sai com `exit 0`. A mensagem de uso residual atual vira essa ajuda canônica.
- **Guard de TTY:** antes de abrir a entrevista (`collectAnswers`), se `process.stdin.isTTY` for falso E não houver `--yes` nem flags suficientes para resolver as respostas, **falhar em voz alta** com `exit 1` e mensagem instruindo a passar `--yes` (defaults do Golden Path) ou as flags — **nunca** `exit 0` sem escrever nada. Automação (CI/agente/smoke) usa flags/`--yes` e não é afetada.
- Preservar a idempotência já existente (Spec 21 §2.1): rodar de novo completa o que faltou.

## 2.3 Skills de instalação (documentação — achados 2 e 5)
- `ui-integra-consumidor` (espelhar `.claude/`, hash igual): na Etapa 2, **antes** do `npm install github:...`, adicionar passo explícito — "garanta um `package.json` na raiz do diretório-alvo; se não existir, rode `npm init -y` primeiro". Explicar o porquê (sem `package.json`, o `npm install github:...` sobe a árvore e instala num ancestral, poluindo outro projeto em silêncio — achado real do Selo). Idealmente checar: `npm install` na Etapa 2 só depois de confirmar que o `package.json` está no diretório certo.
- `ui-integra-consumidor` **ou** `ui-integra-escrever-manifesto` (onde o Design Engine é descrito): documentar o fluxo **"tema padrão é read-only → personalizar exige Salvar como Novo Tema"**: ao editar um tema padrão da biblioteca no CustomizationPanel, "Aplicar Alterações Globais" abre o modal de persistência para salvar um tema novo (o padrão não é sobrescrito); só depois de salvar a personalização persiste. Deixar claro que isso é esperado, não um bug.

## 2.4 Validação de empacotamento (gate)
- Documentar/rodar `npm pack --dry-run` (ou `npm pack` + inspeção do tarball) confirmando que `src/`, `specs/`, `playwright/`, `__snapshots__/`, `vitest.config.ts`, `Template-Ts/` **não** entram e que `dist/`, `bin/`, `backend/`, `docs/manifest-catalog.*`, `templates/` e as skills que o `init` copia **entram**. Candidato a um smoke/script no `scripts/` verificando a lista de arquivos do tarball.

# 3. Critérios de Aceite
- [x] `npm pack` da lib produz um tarball SEM `src/`/`specs/`/`playwright/`/`__snapshots__/`/configs de teste, e COM `dist/`/`bin/`/`docs/`/`templates/` + as skills que o `init` copia (o `init` do consumidor continua achando as skills). **Desvio consciente:** `backend/` (fonte TS) e o bridge Python `backend/sarak_ui_core/` ficaram FORA do tarball — mapeamento em `bin/scaffold/context.mjs` + os `exports`/`typesVersions` do `package.json` confirmou que `@sarak/lib-ui-core/backend/node` resolve 100% para `dist/backend-node.*` (nunca lê `backend/node/*.ts` cru); publicar a fonte ali seria repetir o achado 4 por outra porta. `src/styles/sarak-base.css` foi mantido (1 arquivo só) porque é o alvo real do subpath export `./sarak-base.css`.
- [x] `npx @sarak/lib-ui-core --help` e `... init --help` imprimem uso + todas as flags + defaults e saem com `exit 0`.
- [x] `init` sem TTY e sem `--yes`/flags falha com `exit 1` e mensagem instrutiva — nunca `exit 0` mudo sem escrever arquivos. Com `--yes` ou flags, roda não-interativo normalmente. Verificado com processo real (`node bin/sarak-ui.mjs init < /dev/null`, sem flags) → `exit 1`, zero arquivo escrito; com `--yes` → `exit 0`, 12 arquivos.
- [x] Skill `ui-integra-consumidor` (+ espelho `.claude`, hash igual — symlink, conferido via `sha256sum`) traz o passo "garanta `package.json` (npm init -y) antes do `npm install github:`" com o porquê, e `ui-integra-escrever-manifesto` documenta o fluxo "salvar novo tema".
- [x] Gates verdes: `RegistryParity` (5/5), `catalog:check` (em dia), `npm run build` (verde), `run_audit.mjs` sem regressão (mesmo baseline pré-existente); smoke do `init` (com flags/`--yes`) continua verde — validado com tarball REAL (`npm pack` → `npm install` → `init --yes` → `npm install` → `npm run build` → `npm run dev:backend` respondendo em `/api/v1/hello`).

# 4. Plano de Testes (Quality Gate)
## Unitários / smoke do scaffolder
- [x] `bin/sarak-ui.mjs`: `--help`/`-h` imprime uso e sai 0; subcomando desconhecido segue com uso + exit 1. Verificado por processo real (não só unitário).
- [x] `collectAnswers`/entrada do init: `isTTY` falso + sem `--yes`/flags → erro alto (exit 1), nenhum arquivo escrito de forma "fantasma"; `--yes` → resolve por defaults sem abrir readline. (`bin/scaffold/__tests__/prompts.test.mjs`, 9 casos: guard isolado + `collectAnswers` fim a fim com stream fake não-TTY).
- [x] Smoke existente do `init` (init em tmp com flags → npm install → build do consumidor) continua verde (`bin/scaffold/__tests__/runInit.fs.test.mjs`, inalterado, 40/40 em `bin/scaffold`).
## Empacotamento
- [x] Script `scripts/check-package-contents.mjs` (`npm run package:check`, plugado no `prepublishOnly`): roda `npm pack --dry-run --json`, nega `src/**` (exceto o único arquivo permitido)/`specs/`/`playwright/`/`__snapshots__/`/`Template-Ts/`/`.test.*`; afirma `dist/index.*`, `dist/backend-node.*`, `dist/sarak.css`, `bin/sarak-ui.mjs`, `docs/manifest-catalog.*`, `templates/app-starter.manifest.json` e as 2 skills copiadas pelo `init`. Tarball real: 53 arquivos, 757,8 kB comprimido.
## Re-teste real (validação final)
- [ ] **Re-Selo — P15, item 15 do roteiro (2ª execução da Spec 26, precedida da limpeza da Spec 31/P14):** o agente externo instala num diretório sem `package.json` (condição garantida pelo gate de prontidão da Spec 31), seguindo a skill atualizada, e (a) NÃO polui projeto ancestral (M2 → PASS), (b) descobre as flags via `--help` sem acidente (M1 → PASS), (c) o `node_modules/@sarak/lib-ui-core` não traz o código-fonte da lib (M9 reforçado), (d) personaliza um tema sem travar no modal não documentado (M7 sem fricção). O gate é o teste real.
