---
tipo: "spec"
titulo: "Scaffolder de Instalação (npx @sarak/lib-ui-core init)"
dominio: "Distribuição / DX de Instalação"
status: "🟢 Concluída (2026-07-19)"
prioridade: "Alta"
tags: ["spec", "scaffolder", "init", "golden-path", "instalacao"]
relacionados: ["08-consumo-externo-e-integracao"]
---

# 1. Visão Geral e Descrição do Problema

Testes reais de instalação mostraram que a skill de integração, por ser agnóstica de stack, deixa o agente consumidor "adivinhar" infraestrutura: em um teste, inventou NPM Workspaces (que quebram binários locais como `concurrently` no Windows); em outro, montou server/proxy/portas "no escuro"; em ambos, as `peerDependencies` não ficaram gravadas no `package.json` do consumidor (npm auto-instala mas não registra — irreproduzível em `npm ci`).

A correção estrutural é a lib **entregar o boilerplate pronta**: um binário `init` que materializa o Golden Path em 1 comando, com as poucas perguntas que são de fato decisão do consumidor.

# 2. Regras de Negócio (Solução)

## 2.1 Binário no pacote
- `package.json` da lib ganha `"bin": { "sarak-ui": "./bin/sarak-ui.mjs" }`; comando: `npx @sarak/lib-ui-core init` (ou `npx sarak-ui init` pós-install).
- Node puro (sem dependência nova); prompts via `node:readline`; idempotente (nunca sobrescreve arquivo existente sem `--force`; lista o que pulou).

## 2.2 Perguntas (só o que é decisão do consumidor)
1. **Stack**: `vite-express` (Golden Path — monolítico, DEFAULT) | `next` | `frontend-only` (host de backend em outra linguagem).
2. **Persistência de temas**: `sqlite` (referência, zero-config) | `postgres` (pede schema opcional) | `contrato-proprio` (meu backend implementa o contrato REST — ver spec plan/19; gera stub comentado).
3. **Nome/porta** do backend (default 3000) e porta do front (default 5173).

## 2.3 O que o `init` gera (Golden Path vite-express)
- **Aviso explícito anti-workspace**: tudo num único `package.json` (raiz do módulo).
- `package.json` (merge se existir): scripts `dev` (concurrently backend+vite), `dev:backend` (ts-node-dev), `dev:frontend` (vite), `build` (tsc + vite build) + **todas as peerDependencies gravadas** + devDeps (`vite`, `@vitejs/plugin-react`, `concurrently`, `ts-node-dev`, `typescript@^5` — NUNCA ^7, incompatível com ts-node-dev).
- `index.html`, `vite.config.ts` (proxy `/api` → porta do backend), `tsconfig.json` (exclude do front no tsc do backend).
- `src/main.tsx` (Provider + Renderer + rota via History API), `src/Sarak-Engine/index.ts` (store + `networkInterceptor` com injeção de auth comentada).
- `src/manifests/app.manifest.json` — cópia de `templates/app-starter.manifest.json` (rota `/design` inclusa — contrato).
- `src/server.ts` — Express com `express.json()`, `setupUIDatabase` + `createSarakUIExpressMiddleware` (com o storage escolhido) e um endpoint de exemplo `/api/v1/hello`.
- **Skills copiadas** para `.agents/skills/` e `.claude/skills/` (`ui-integra-escrever-manifesto`, `ui-auditoria-manifesto`) — a etapa manual da skill vira automática.
- Variante `next`: instrumentation + route handlers dos 3 handlers oficiais; variante `frontend-only`: só front + stub do contrato REST.

## 2.4 Relação com a skill
- `ui-integra-consumidor` passa a ORQUESTRAR o `init` (rodar o comando, conferir saída) em vez de ditar arquivos um a um — o texto vira: entrevista → `npx @sarak/lib-ui-core init` → validação → handoff. (Detalhado na spec plan/22.)

# 3. Critérios de Aceite
- [x] Em pasta vazia: `npm init -y && npm i <tarball local>` (equivalente ao `npm i github:...` — sem acesso à rede neste ambiente) `&& node node_modules/@sarak/lib-ui-core/bin/sarak-ui.mjs init --yes` (respostas default) → `npm run build` verde e `npm run dev:backend` sobe e responde em `/api/v1/hello` (smoke real, ver `00-progresso.md`).
- [x] `package.json` resultante contém TODAS as peerDependencies explícitas (mais `express`/`@types/express`, runtime do Golden Path).
- [x] Rodar `init` de novo não destrói nada (idempotência) e reporta o que pulou (`bin/scaffold/__tests__/runInit.fs.test.mjs`).
- [x] Skills presentes em `.agents/skills/` e `.claude/skills/` do consumidor após o init (`ui-integra-escrever-manifesto`, `ui-auditoria-manifesto`).
- [x] Nenhuma dependência nova no pacote da lib (`bin/` usa só `node:fs`/`node:path`/`node:readline`/`node:url`).

# 4. Plano de Testes (Quality Gate)
## Unitários
- [x] Geradores de arquivo (funções puras template→string) por stack/storage (`bin/scaffold/generators/__tests__/*.test.mjs`).
- [x] Merge de package.json preserva campos existentes e adiciona scripts/deps (`bin/scaffold/__tests__/mergePackageJson.test.mjs`).
## Integração (fs real em tmp)
- [x] `init` em dir temporário: estrutura completa criada; segunda execução não sobrescreve (`bin/scaffold/__tests__/runInit.fs.test.mjs`, 10 casos incl. `--force`, `next`, `frontend-only`, modo embarcado).
## E2E (smoke de instalação)
- [x] `npm pack` da lib → `npm init -y` + `npm install <tarball>` em tmp → `init --yes` → `npm install` → `npm run build` verde → `npm run dev:backend` responde em `/api/v1/hello` (achou e corrigiu 2 bugs reais: ver `00-progresso.md`).
