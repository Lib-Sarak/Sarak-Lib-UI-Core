---
name: ui-integra-consumidor
description: Instala e acopla o motor SarakManifestRenderer (@sarak/lib-ui-core) num sistema consumidor (Next.js/React/FastAPI), do zero — npm install, peerDependencies, SarakUIProvider, DataStore e Interceptors. Use quando o usuário pedir para baixar/instalar/importar a biblioteca Sarak UI (ex.: "baixe a biblioteca Sarak-UI <link>, ela será responsável por toda a renderização do sistema"), iniciar a infraestrutura do front-end com a Lib, ou plugar o motor de renderização declarativa num projeto novo. NÃO acione proativamente.
---

# Skill: Integrar Consumidor (Infraestrutura)

Skill responsável pela instalação plug-and-play do Motor Declarativo (Sarak-Lib-UI-Core) no projeto
cliente. **Desde a Spec 21, a instalação é feita pelo scaffolder oficial** (`npx @sarak/lib-ui-core init`)
— esta skill conduz a entrevista, roda o comando, valida a saída e faz o handoff. Ela **nunca mais
escreve arquivo de infraestrutura à mão** (isso é o que causava a adivinhação de infra que gerou os
2 relatórios de erro de instalação real que motivaram a Spec 21).

## Quando usar
- Quando o usuário informar que está num repositório que consumirá a `Sarak-Lib-UI-Core` e precisa acoplar o sistema (Engine) na raiz do projeto.
- Quando for necessário plugar roteamento do framework hospedeiro ou cabeçalhos de autenticação na Engine.
- Use APENAS quando o usuário solicitar explicitamente a instalação/integração inicial. NÃO acione proativamente.

## Golden Path (leia antes de tudo)
- **A instalação é MONOLÍTICA:** um único `package.json` na raiz do projeto do consumidor. **NÃO use
  NPM Workspaces** — eles quebram binários locais (`concurrently`, `ts-node-dev`) no Windows (achado
  real de instalação que motivou a Spec 21). Se o consumidor já é um monorepo com workspaces, rode o
  `init` dentro do pacote específico que vai hospedar a Sarak — nunca na raiz do monorepo.
- **Stack default:** `vite-express` (Golden Path — Vite + Express num único `package.json`, subindo
  junto via `concurrently`). Alternativas: `next` (App Router) e `frontend-only` (backend em outra
  linguagem/porta, fora do Node).
- O `init` é **idempotente**: nunca sobrescreve arquivo existente sem `--force`; reporta o que pulou.

## Workflow

1. **Entrevista de Instalação (HITL) — faça TODAS estas perguntas ANTES de rodar qualquer comando**
   - **PRIMEIRA PERGUNTA — Modo de renderização:** *"O módulo vai renderizar um sistema NOVO (interface 100% via manifesto — Modo App) ou vai renderizar SOBRE um frontend que JÁ EXISTE (Modo Embarcado — ilhas de manifesto dentro do front atual)?"*
     - **Modo App:** o `init` (Etapa 2) monta o projeto inteiro (front + backend). É o default: `options` sem `mode`.
     - **Modo Embarcado:** suportado (Spec 24), mas o `init` **não** sabe montar a ilha dentro de um host que já existe — ele só garante os artefatos comuns (`Sarak-Engine/`, manifesto, skills). A montagem em si é manual (Etapa 4 abaixo). Registre a escolha do usuário: ela muda as Etapas 2, 3 e 4.
     - **Se Embarcado, pergunte também:** *"A adoção começa por quais rotas/regiões do front atual?"* — a migração é incremental: 1 ilha → mais rotas → shell completo → (opcional) virar Modo App. Registre o alvo inicial.
   - **Stack**: `vite-express` (Golden Path, DEFAULT) | `next` | `frontend-only` (backend em outra linguagem).
   - **Persistência de temas — é uma PORTA (Spec 19), não uma escolha de banco.** 3 opções, apresente as 3:
     1. **Referência embarcada** — `sqlite` (zero-config, arquivo local) ou `postgres` (pede `schema` opcional, default `ui_core`). O `init` gera o `setupUIDatabase`/`createSarakUIExpressMiddleware` prontos, sem SQL cru.
     2. **Contrato REST** (`storage: custom` no `init`) — o backend do consumidor, em QUALQUER linguagem, implementa os 5 endpoints documentados em `docs/ui-storage-contract.md`. O `init` gera um stub comentado apontando pra lá, sem middleware nenhum.
     3. **`UIStorageAdapter` customizado** (Supabase/Firebase/API própria) — bypassa pg/sqlite por completo; ver `docs/examples/storage-supabase.md`. Fora do alcance do `init` (o consumidor escreve o adapter e passa `{ storage: meuAdapter }` na chamada gerada pelo stub).
   - **Portas** do backend/frontend (default 3000/5173) — só relevante para `vite-express`.
2. **Instalação de Dependências + scaffolder oficial**
   - **Ação:** `npm install @sarak/lib-ui-core` (github install: `npm install github:Lib-Sarak/Sarak-Lib-UI-Core`).
   - **Ação:** rode o scaffolder com as respostas da Etapa 1, via flags (não repita a entrevista por prompt interativo — passe tudo resolvido):
     ```bash
     npx sarak-ui init --mode app --stack vite-express --storage sqlite --backend-port 3000 --frontend-port 5173
     # antes de publicado no registro/sem link simbólico do bin, equivalente:
     node node_modules/@sarak/lib-ui-core/bin/sarak-ui.mjs init --mode app --stack vite-express --storage sqlite
     ```
     Flags: `--mode` (`app`|`embedded`), `--stack` (`vite-express`|`next`|`frontend-only`), `--storage` (`sqlite`|`postgres`|`custom`), `--schema` (só com `postgres`), `--backend-port`, `--frontend-port`, `--force` (sobrescreve arquivo existente), `--yes` (aceita todos os defaults do Golden Path sem perguntar nada — útil só quando a Etapa 1 já foi 100% Golden Path).
   - **O que o `init` garante sozinho** (Spec 21 — não repita nenhum destes passos à mão):
     - **TODAS as peerDependencies gravadas** no `package.json` do consumidor (nunca confie no auto-install do npm 7+, que instala em `node_modules` mas não registra — irreproduzível em `npm ci`).
     - `typescript` travado em `^5` (**nunca** `^7` — incompatível com `ts-node-dev`).
     - `vite.config.ts` (proxy `/api`), `tsconfig.json`+`tsconfig.server.json`, `index.html`, `src/main.tsx` (Provider+Renderer+navegação via History API), `src/Sarak-Engine/index.ts` (DataStore + `networkInterceptor` com injeção de auth comentada), `src/manifests/app.manifest.json` (cópia do template oficial) e `src/server.ts` (Express + storage escolhido) — variante `next`: `instrumentation.ts` + os 3 handlers oficiais do App Router; variante `frontend-only`: só front + `CONTRATO-BACKEND.md`.
     - As 2 skills de consumo (`ui-integra-escrever-manifesto`, `ui-auditoria-manifesto`) copiadas para `.agents/skills/` **e** `.claude/skills/` do consumidor — a Etapa 6 antiga desta skill deixou de existir; o `init` já faz isso.
   - **Ação:** `npm install` (o `init` só escreve `package.json`; quem baixa os pacotes é o npm).
3. **Validação**
   - Confira, nesta ordem: `npm run build` verde (type-check do backend + bundle do frontend); `npm run dev` sobe backend+front juntos (`concurrently`); a tela inicial do template renderiza com o Design Engine acessível em `/design`; um `trigger_toast` do manifesto aparece estilizado (CSS automático).
   - Se `npm run build`/`npm run dev` falhar por dependência ausente, confira se a Etapa 2 rodou `npm install` DEPOIS do `init` (o scaffolder só grava `package.json`, não baixa pacote nenhum).
4. **Montagem da Ilha (SÓ no Modo Embarcado — o `init` não automatiza isto)**
   - **Ação (CSS escopado):** importe a variante escopada UMA vez, no entry point do host:
     ```ts
     import '@sarak/lib-ui-core/dist/sarak-scoped.css';
     ```
     Ela é idêntica ao stylesheet normal, porém com preflight e utilities confinados ao seletor `.sarak-scope`. **Nunca** importe `dist/sarak.css` num consumidor embarcado: é justamente o reset global que repinta os `h1`/`button`/`input` do host.
   - **Ação (marcação anti-flash, recomendada):** adicione `data-sarak-ui-mode="embedded"` no `<html>` do host (`index.html`, `app/layout.tsx`, template do servidor):
     ```html
     <html data-sarak-ui-mode="embedded">
     ```
     A injeção automática de CSS roda na IMPORTAÇÃO do módulo, antes de qualquer Provider montar. Com a marcação, ela nem acontece. Sem ela o Provider ainda remove o CSS global ao montar (e avisa no console em dev), mas pode haver um flash do host re-estilizado no meio do caminho.
   - **Ação (Provider):** monte a ilha no ponto do front existente onde ela deve aparecer, reaproveitando `dataStore`/`networkInterceptor` que o `init` já gerou em `src/Sarak-Engine/`:
     ```tsx
     import { dataStore, networkInterceptor } from './Sarak-Engine';
     import ilhaManifest from './manifests/app.manifest.json'; // cópia do template gerado pelo init

     <SarakUIProvider options={{ mode: 'embedded' }}>
         <SarakManifestRenderer payload={ilhaManifest} dataStore={dataStore} networkInterceptor={networkInterceptor} route={rotaAtiva} />
     </SarakUIProvider>
     ```
     O Provider renderiza um `<div class="sarak-scope">` ao redor dos filhos — é ele que ancora o CSS e recebe os design tokens.
   - **Múltiplas ilhas:** use **N `SarakManifestRenderer` sob 1 Provider embarcado** (cada Renderer com seu próprio `dataStore`). **N Providers na mesma página está FORA do suporte** — eles disputariam a mesma classe de escopo e o mesmo stylesheet.
   - **O que muda vs. Modo App (esperado, não é bug):** o título e o favicon da aba continuam sendo do host; as fontes do Google NÃO são injetadas (a ilha herda a tipografia do host — para forçar, use `options={{ mode: 'embedded', embedded: { injectGlobalFonts: true } }}`); `NoiseOverlay` e a mídia de fundo global do Design Engine não são renderizados (cobririam a página do host).
   - **Feedback continua zero-config:** toasts/modais/drawers vão para portal em `document.body` e recebem a classe de escopo automaticamente — nada a fazer.
   - **Verificação obrigatória antes de declarar pronto:** abra a página do host e confira, nesta ordem: (1) o front existente está visualmente IDÊNTICO ao de antes (títulos, botões, espaçamentos); (2) o título da aba não mudou; (3) dentro da ilha os componentes Sarak estão estilizados (não "crus"); (4) um `trigger_toast` do manifesto renderiza estilizado. Se (3) falhar, quase sempre é o import do CSS escopado faltando ou o `dist/sarak.css` importado por engano.
5. **Handoff (Ponto de Transição)**
   - **Ação:** Após a infraestrutura base estar acoplada e renderizando com sucesso o manifesto do template, informe ao usuário que a integração arquitetural terminou.
   - **Próximo Passo Obrigatório:** Oriente o usuário (ou você mesmo no próximo turno) a invocar a skill **`ui-integra-escrever-manifesto`** (já instalada no repositório do consumidor pelo `init`) para construir as telas — ela usa o catálogo GERADO `node_modules/@sarak/lib-ui-core/docs/manifest-catalog.md` como fonte da verdade de `type`s e props.

## Regras (SRP - Responsabilidade Única)
- **NÃO escreva arquivo de infraestrutura à mão** (`vite.config.ts`, `server.ts`, `package.json` de scripts/deps, etc.) — isso é o que o `init` (Spec 21) existe para eliminar. A única saída manual permitida é a Etapa 4 (montagem da ilha embarcada), porque o scaffolder pressupõe um host que ainda não existe.
- **NÃO** ensine ou tente montar telas, formulários ou laços de repetição (`renderFor`) nesta skill. O foco aqui é estrito: DevOps e Infraestrutura Front-end.
- **SEMPRE** garanta que o componente importado nas rotas seja o Renderizador Mestre, bloqueando a importação direta de componentes atômicos isolados pelo desenvolvedor (garantindo que tudo passe pelo JSON).

## Referências
**Artefatos do pacote (`node_modules/@sarak/lib-ui-core/`):**
- `bin/sarak-ui.mjs` (`npx sarak-ui init`) — o scaffolder oficial (Spec 21); gera o Golden Path inteiro, Node puro, idempotente.
- `templates/app-starter.manifest.json` — manifesto inicial oficial (shell + nav + rota `/design` do Design Engine). Também exportado como `SARAK_STARTER_MANIFEST`; o `init` já copia isto para `src/manifests/app.manifest.json`.
- `docs/manifest-catalog.md` / `.json` — catálogo GERADO de types/props/ações/pipes/diretivas (fonte da verdade; nunca escreva manifesto de memória).
- `docs/ui-storage-contract.md` — contrato REST dos 5 endpoints da porta de persistência (Spec 19), para quem escolher `--storage custom`.
- `docs/examples/storage-supabase.md` — exemplo de `UIStorageAdapter` sobre Supabase, para quem quiser um adapter próprio.
- Exports de backend (`@sarak/lib-ui-core/backend/node`): `setupUIDatabase`, `createSarakUIExpressMiddleware`, `createDesignApiHandler`/`createBrandingApiHandler`/`createThemesApiHandler` (Next.js App Router) — o `init` já gera as chamadas certas; use esta lista só se for editar o `server.ts`/os route handlers gerados.

**Skills (ordem do fluxo):**
- `ui-contexto-repositorio` — ambientação (se estiver trabalhando NA lib).
- **Esta skill** → conduz a entrevista e roda o `init`.
- `ui-integra-escrever-manifesto` — handoff obrigatório: compor as telas JSON.
- `ui-auditoria-manifesto` — validar o JSON contra o catálogo antes de entregar.

**Specs da Biblioteca Core:**
- Spec 21 (`specs/plan/21-scaffolder-init.md`) — o scaffolder: o que ele gera, por stack/storage.
- Spec 08 (`08-consumo-externo-e-integracao.md`) — contrato de consumo: **§0 Modos de Consumo (App vs Embarcado)**, CSS automático, Provider obrigatório, §3.1 alcançabilidade/template, fronteira de confiança (interceptors), §6.2-b (autenticação como porta).
- Spec 19 (`19-porta-de-persistencia-ui.md`) — a porta de persistência (`UIStorageAdapter` + os 5 endpoints REST) que o `--storage` do `init` implementa.
- Spec 11 (`11-engine-declarativa-e-manifestos.md`) — gramática do manifesto/Registry/Dispatcher/shell+routes.
- Spec 01 (`01-painel-customizacao-temas.md`) — Design Engine (Regra 0: alcance via `{"type": "CustomizationPanel"}`).
- `references/examples.md` — exemplos práticos por stack (SPA/Vite, Next.js SSR, Express) incluindo persistência de temas.

**Ambiente (lições de instalação real):** `ts-node-dev` exige `typescript@^5` (v7 crasha); portas 3000/5173 ocupadas por processos node antigos causam teste contra código velho — libere-as antes de subir o dev.
