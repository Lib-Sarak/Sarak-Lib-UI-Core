---
tipo: "spec"
titulo: "Scaffolder — starter padrão (modelo MyService) + skills do modelo módulos-plugin"
dominio: "Scaffolder (init) / Skills de Consumo / DX"
status: "🟢 Concluída (2026-07-23/24) — starter padrão módulos-plugin gerado pelo init, sem backend"
prioridade: "Alta"
tags: ["spec", "virada", "design-system", "scaffolder", "skills", "modulos-plugin", "dx"]
relacionados: ["43-design-system-primeiro", "44-temas-json-e-persistencia", "40-teste-real", "21-scaffolder-init", "22-skills-de-consumo-golden-path"]
---

> **Contexto:** realiza o pedido do mantenedor: *"ao iniciar um novo projeto eu importo o módulo UI e o frontend é criado mantendo padrão"*. O starter gerado é o **esqueleto do modelo MyService** (Provider + Shell + Design Engine + módulo de exemplo). Sequenciada ANTES do Teste Real de propósito — o teste do ERP **usa** este starter, fechando o ciclo.

# 1. Visão Geral e Descrição do Problema

Hoje o `init` (Spec 21) gera um app **manifesto-only** (`main.tsx` renderizando `SarakManifestRenderer` sobre `app.manifest.json`) e as skills (Spec 22) ensinam a montar tudo via JSON, tratando React no consumidor como "defeito". No modelo oficial (Spec 43 — módulos-plugin) isso está invertido: o importador **registra módulos React** na base.

# 2. Regras de Negócio (Solução)

## 2.1 `init` gera o starter padrão (modelo MyService)
- O scaffolder passa a gerar um esqueleto **no padrão MyService**: `main.tsx` com `SarakUIProvider` (recebendo `options`/manifest do sistema + `customThemes`/`defaultTheme`) envolvendo `SarakShell`; um **módulo de exemplo** registrado via `registerSarakModule` (uma feature com uma tela) e um `registerLocalComponent` de exemplo; o Design Engine acessível (módulo nativo "personalization"). Espelhar o `safeRegister`/`registerSarakModuleSafe` do MyService `main.tsx` como o padrão de registro.
- **Sem backend** (Spec 44): sem `serverTs.mjs`, sem storage servidor; tema via localStorage/JSON.
- `npm run dev`/`build` do starter verdes; a tela inicial renderiza com o Design Engine funcionando.

## 2.2 Reescrever `ui-integra-consumidor` (modelo módulos-plugin)
- De "monte 100% via manifesto, React é defeito" para **"importe a base, registre seus módulos, altere o layout pela central (Design Engine)"**. Cobrir: instalar/atualizar (Spec 39), montar `SarakUIProvider`+`SarakShell`, `registerSarakModule` para features, `registerLocalComponent` para overrides, usar componentes/tokens (para o módulo ser temável — Spec 43 §3.3), temas em JSON (Spec 44).
- Incorporar os aprendizados REAIS do Teste Real (Spec 40) quando ele rodar — se a 45 fechar antes do teste, reabrir a skill para os ajustes finais depois (nota).

## 2.3 `ui-integra-escrever-manifesto` / `ui-auditoria-manifesto` — dependem da Spec 46
- A Spec 46 remove o renderizador de páginas por manifesto (#2). Estas skills são desse modelo → **removê-las** quando a 46 rodar, deixando nota de que o caminho é registrar módulos. Registrar a dependência (fecham na 46).

## 2.4 Espelhos e catálogo
- Espelhar `.agents` → `.claude` (symlink — conferir). Alinhar o catálogo à API pública real do modelo (Provider/Shell/registro de módulos/componentes/tokens), conforme a Spec 43/46 definirem.

# 3. Critérios de Aceite
- [x] `init` gera starter no padrão MyService (Provider + Shell + Design Engine + módulo de exemplo registrado), sem backend; `npm run dev`/`build` verdes.
- [x] `ui-integra-consumidor` reescrita para o modelo módulos-plugin; espelho `.claude` com hash igual (symlink — `diff` idêntico).
- [x] Skills do manifesto (#2) marcadas para remoção na Spec 46.
- [x] Catálogo coerente com a API pública real (sem framing que contradiga o modelo módulos-plugin).
- [x] Gates verdes; smoke do `init` (novo starter) verde.

# 4. Plano de Testes
- [x] Smoke: `init` em tmp → `npm install` → `npm run build` do starter verde, sem backend; o módulo de exemplo renderiza no Shell, tematizado (verificado com Playwright real, não só assíncrono de arquivo).
- [x] Dry-run de autoria: a skill reescrita ensina a registrar módulo/componente e usar tokens — sem tratar React como defeito; o exemplo do starter é a prova viva do padrão.

# 5. Execução (registro)

## 5.1 Escopo da remoção de backend (decisão desta execução)
A Spec 44 (Design Engine sem backend) **ainda não tinha sido executada** quando esta spec rodou — o roteiro documentado (43→44→45) foi invertido a pedido do mantenedor. Como a spec pediu explicitamente "SEM backend (sem `serverTs.mjs`)", a decisão tomada foi **colapsar as 3 stacks antigas (`vite-express`/`next`/`frontend-only`) numa única stack: front Vite puro**, já que a ÚNICA razão de existir das 3 era gerar servidor/backend para a persistência do Design Engine (Spec 19, agora superada) — sem backend, a distinção não faz mais sentido. Removidos do scaffolder: perguntas `stack`/`storage`/`schema`/`backendPort`; geradores `serverTs.mjs`/`nextVariant.mjs`/`frontendOnlyVariant.mjs`/`sarakEngine.mjs` (e seus testes) — ficaram sem nenhum chamador. `templates/app-starter.manifest.json`/`SARAK_STARTER_MANIFEST` **não foram removidos** (só pararam de ser lidos pelo `context.mjs`) — seguem publicados para quem quiser usar o motor de manifesto opcional.

## 5.2 Achados reais do smoke test (corrigidos nesta execução)
- **`@types/react`/`@types/react-dom` faltando:** o `tsc --noEmit` do starter gerado falhava (`TS7016` em `react-dom/client`) porque `react`/`react-dom` são `peerDependencies` (mirroradas via `buildDependencies`) mas seus `@types` só existiam nas `devDependencies` DA LIB (uso interno) — nunca copiados ao consumidor. Adicionados a `STARTER_DEV_DEPENDENCIES`.
- **Landing padrão era o Design Engine, não o módulo de exemplo:** sem `options.theme.defaultModuleId`, `useSarakShell` sempre auto-navega para `mx-customization` (prioridade 9999, sempre registrado) antes de qualquer módulo do consumidor — confirmado com Playwright (`hasWelcome: false` na raiz, `true` em `/exemplo`). Corrigido setando `defaultModuleId: 'exemplo'` no `main.tsx` gerado — a tela inicial agora mostra o módulo de exemplo.
- **Ambiental (não é bug, já documentado em specs anteriores):** `pg`/`better-sqlite3` (peerDependencies da lib, ainda não removidas — Spec 44) falham `node-gyp rebuild` neste ambiente sem Visual Studio Build Tools; contornado no smoke test removendo os dois do `package.json` gerado antes do `npm install` (mesma classe de achado já registrado na Spec 39).
