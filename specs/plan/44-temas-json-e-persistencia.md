---
tipo: "spec"
titulo: "Design Engine como central de layout do sistema — temas JSON, aplica a todas as telas, sem backend"
dominio: "Design Engine / Temas / Persistência / Segurança / Empacotamento"
status: "🟢 Concluída (2026-07-24) — Design Engine sem backend, temas JSON validados no load, bug de loop infinito corrigido"
prioridade: "Máxima"
tags: ["spec", "virada", "design-engine", "temas", "central-de-layout", "persistencia", "seguranca", "remocao-backend"]
relacionados: ["43-design-system-primeiro", "45-scaffolder-react-e-skills", "40-teste-real", "19-porta-de-persistencia-ui", "16-tokens-semanticos-e-validacao-de-valores"]
---

> **Contexto:** este é o objetivo declarado do produto (mantenedor, 2026-07-22): *"uma central de modificação do layout que se aplique ao sistema inteiro — aplicar a aba Design Engine na prática"*, com *"opção de que o importador crie temas em JSON e adicione ao código dele"*. E, sendo uma biblioteca de FRONT, **sem backend próprio** (o módulo não está em produção — o que não é usado se remove).

# 1. Visão Geral e Descrição do Problema

A central de layout (Design Engine) já existe (CustomizationPanel + o módulo nativo "personalization"), mas hoje pressupõe **backend próprio da lib** para persistir: `endpoints.branding` (fetch a um servidor), `backend/node/` (adapters pg/sqlite, REST, `setupUIDatabase`/`createSarakUIExpressMiddleware`), `backend/sarak_ui_core/` (Python), `dist/backend-node.*`, export `./backend/node`, 2º `tsup` no `build:js`, `pg`/`better-sqlite3`, e o `serverTs.mjs` do `init`.

Para uma biblioteca de front, carregar servidor é passivo de segurança (endpoint/banco/auth = superfície de ataque que não é da lib). E, com temas virando **dado no código do consumidor**, o backend perde função.

## 1.1 Três necessidades de persistência, separadas
| Persistir | Onde | Backend? |
|---|---|---|
| **Definição de tema/template** (o dev cria em JSON) | JSON no código do consumidor (prop do Provider) | Não — é código |
| **Seleção/ajuste do usuário final** (persistir no reload) | localStorage (`persistence.storageKey`, já existe) | Não |
| **Sync multi-dispositivo** (opcional) | backend do PRÓPRIO consumidor, via callback | Só se ele quiser, e é dele |

# 2. Regras de Negócio (Solução)

## 2.1 A central aplica ao sistema inteiro (o valor central)
- Garantir/testar que trocar tema ou template no Design Engine **repinta todas as telas** — os componentes Sarak e qualquer módulo/componente do importador que use os tokens (`var(--sarak-*)`). Mecanismo: as CSS vars no escopo do Provider (já existe via `DesignInjector`/`useDesignManager`). Documentar a regra: módulo com estilo hardcoded fora do contrato NÃO é atingido (Spec 43 §2.2).
- **Multi-template:** confirmar que o catálogo de templates/temas (multi-template) é trocável pela central e a troca atinge tudo.

## 2.2 Temas como JSON do consumidor (o pedido do usuário)
- Formalizar/documentar a prop **`customThemes`** do `SarakUIProvider` (já existe: `SarakUIProvider.tsx:85,101` — merge com `GLOBAL_THEMES`) como o caminho oficial: o dev cria arquivos JSON de tema no repo dele e passa `customThemes` + `defaultTheme`.
- Documentar o **schema de um tema** (chaves de token válidas + valores) no catálogo — o dev escreve tema conferindo o catálogo (regra dura de tokens estendida ao consumidor).

## 2.3 Validação/segurança do tema no load (a segurança de verdade)
- **Tema é DADO validado, nunca código.** Ao carregar QUALQUER tema (arquivo, `customThemes`, localStorage), validar contra o schema de tokens: **só chaves conhecidas, valores com tipo checado** (cor / número / enum). Valor fora do contrato → `console.warn` + descartado (postura Spec 16/17), nunca injetado. A validação vale independentemente da fonte — é o que torna localStorage e JSON-de-arquivo seguros por construção.
- Confirmar (grep + teste) que nenhum valor de tema chega a `dangerouslySetInnerHTML` ou a um `<style>` sem sanitização.

## 2.4 CustomizationPanel vira ferramenta de autoria (exporta JSON)
- O CustomizationPanel: **preview ao vivo via localStorage** + botão **"Exportar tema (JSON)"** que entrega o JSON para o dev colar num arquivo do repo. "Salvar novo tema" = exportar, não persistir em servidor.

## 2.5 Persistência da seleção do usuário final = localStorage (default)
- A escolha de tema/template/tweak do usuário final persiste em **localStorage** (reload mantém). A lógica de persistência vive na camada **Provider/Design** (`useDesignManager`/`useBrandingManager`) — nunca acoplada a `src/core/Manifest/Storage` (removido na Spec 46).
- **Porta opcional "traga sua persistência":** o `SarakUIProvider` expõe `initialTheme`/`onThemeChange` (callbacks) para o consumidor que quiser sync no backend DELE. A lib não ship servidor.

## 2.6 REMOVER o backend próprio (não rebaixar)
- Remover: `backend/node/`, `backend/sarak_ui_core/`, `backend/sql/`, a build `tsup backend/node/backend-node.ts` (2º comando do `build:js`), o export `./backend/node` + `typesVersions`, `dist/backend-node.*`, `pg`/`better-sqlite3` de peer/devDependencies (conferir que nada mais os usa), `endpoints.branding` como fetch a servidor (vira o callback de 2.5), e `bin/scaffold/generators/serverTs.mjs` + testes.
- Spec 19 (Porta de Persistência) marcada como superseded por esta (histórico preservado).
- Atualizar `check-package-contents.mjs`/`files`; `docs` de storage removidos/atualizados.
- **Sequência:** a persistência no Provider (2.5) tem que estar pronta ANTES de remover o backend, para o Design Engine não quebrar.

# 3. Critérios de Aceite
- [x] Trocar tema/template na central repinta **todas** as telas (componentes Sarak + módulo do importador que usa tokens); teste de propagação (`SarakShell.test.tsx`, herdado da Spec 43 + novo teste de regressão do loop).
- [x] Dev cria tema em JSON e passa via `customThemes`; schema de tema documentado (skill `ui-integra-consumidor`, apontando para `design-token-ids.ts` como fonte viva — não duplicado à mão).
- [x] Todo tema validado no load (só chaves/valores conhecidos; fora do contrato → warn + descartado); teste de que nenhum valor vira CSS/HTML cru (`validation.test.ts`, 8 casos incl. tentativas de breakout).
- [x] CustomizationPanel exporta JSON; preview via localStorage (já existente via `useDesignManager`).
- [x] Seleção do usuário final persiste em localStorage (camada Provider/Design); props `initialTheme`/`onThemeChange` no `SarakUIProvider`.
- [x] Backend REMOVIDO por completo; `npm pack` sem backend; grep-zero do removido; Design Engine funciona sem servidor.
- [x] Gates verdes: `catalog:check`, `npm run build` (sem o 2º tsup), `package:check`, `run_audit.mjs` sem regressão (baseline exato); suíte completa 293/893.

# 4. Plano de Testes
- [x] Propagação: trocar tema → componentes Sarak E um componente-de-token custom repintam (`SarakShell.test.tsx`, herdado).
- [x] Validação: tema com chave desconhecida / tipo errado / string com `<script>`/CSS → descartado + warn; render seguro (`validation.test.ts`).
- [x] Persistência: `useDesignManager`/`persistDesign` grava em localStorage a cada commit e chama `onThemeChange`; testado em `useThemePersistenceHandlers.test.ts`.
- [x] Empacotamento: `npm pack --dry-run` sem `backend`/`dist/backend-node` (58 arquivos, confirmado); `build:js` só o tsup do front (2º comando removido do script).
- [x] Regressão: Design Engine (Design Engine tab) verde sem backend (293 arquivos/893 testes); loop infinito de `activeThemeId`+`customThemes` instável reproduzido-e-corrigido com teste dedicado (`useDesignSync.test.ts` + `SarakShell.test.tsx`).

## 5.1 Achado corrigido (Spec 43 §5.1): loop de render infinito
Corrigido na raiz: `useDesignSync` agora guarda o último `activeThemeId` efetivamente aplicado (`lastAppliedThemeIdRef`) e só chama `setDesign` quando o ID muda de verdade — não depende mais de `customThemes`/`allThemes` terem referência estável (embora o default do Provider também tenha sido estabilizado, como defesa em profundidade). Reproduzido e travado por teste em `useDesignSync.test.ts` (3 renders com array novo a cada vez, `setDesign` chamado só 1x) e em `SarakShell.test.tsx` (montagem real do Provider com `customThemes={[]}` inline).

## 5.2 Validação de schema (2.3) — implementação real
`validateDesign` (antes: só clampava 5 campos hardcoded e deixava passar QUALQUER chave) foi reescrito para validar contra o catálogo real de tokens (`MASTER_DESIGN_MAP`, via `getAllDesignTokens()`): cada chave reconhecida é tipo-checada por `token.type` (number/slider clampado nos limites; select contra o enum de `constraints.options`; color contra um padrão seguro; string/text/font/image/file contra um filtro anti-breakout `[<>{};]`). Chaves fora do catálogo de tokens mas dentro do contrato do payload (`PAYLOAD_EXTRA_KEYS`, espelho runtime de `SarakThemePayloadExtras`/`SarakRuntimeExtras`, em `payloadExtraKeys.ts`) passam por uma checagem genérica recursiva (`isSafeExtraValue`) — mesma barreira anti-HTML/CSS cru, sem tipo por enum/faixa. Chave desconhecida de ambas as fontes → `console.warn` + descartada. Reforço em profundidade: `useDesignVariables.ts` (que gera o `<style>` de CSS responsivo, no Modo Embarcado via `dangerouslySetInnerHTML` e no Modo App via `styleTag.innerHTML`) ganhou o mesmo filtro anti-breakout no ponto de interpolação — não dependia só da validação a montante.

## 5.3 Achado real de dependência colateral: `@types/node`
A remoção de `pg`/`better-sqlite3`/`@types/pg`/`@types/better-sqlite3` quebrou o `npm run build` (`DTS Build error: Cannot find name 'process'`) — `@types/node` nunca foi devDependency direta; chegava só transitivamente via `@types/pg`. `src/core/Manifest/Registry/InvalidManifestScreen.tsx` usa `process.env.NODE_ENV` de verdade (padrão válido, substituído em build time pelo bundler) e precisa do ambient type. Corrigido adicionando `@types/node` como devDependency explícita — dependência real, antes mascarada por acoplamento acidental.

## 5.4 BREAKING CHANGE real para o MyService: `options.endpoints.branding`
`Sarak-MyService/src/main.tsx` (único consumidor real) usa `options.endpoints.branding: '/api/ui/branding'` — campo removido por esta spec (2.6, texto original: "endpoints.branding como fetch a servidor vira callback"). Reescrever como `options.branding.onChange` é decisão do MyService (fora deste repo — não foi tocado). **Nota colateral encontrada, não desta spec:** o mesmo objeto `options` do MyService ainda carrega `designAgent: { sendPrompt: ... }`, campo removido pela Spec 23 (2026-07-19) — evidência de que o snapshot local do MyService já estava desatualizado em relação ao HEAD da lib antes desta execução, então "MyService intacto" não pôde ser verificado por build real (fora do escopo deste repo); a verificação foi por grep de uso de assinatura pública.
- [x] Nenhuma outra assinatura pública mudou (branding é o único ponto de acoplamento real achado); demais consumo do MyService (`SarakUIProvider`/`SarakShell`/`registerSarakModule`/`registerLocalComponent`/`customThemes`/`activeThemeId`) inalterado.
