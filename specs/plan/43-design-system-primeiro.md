---
tipo: "spec"
titulo: "Virada — Modelo de consumo por módulos-plugin (padrão MyService) como oficial"
dominio: "Arquitetura / Tese do produto / Modelo de consumo"
status: "🟢 Concluída (2026-07-23) — ATO ÂNCORA da virada executado, escopo enxuto"
prioridade: "Máxima"
tags: ["spec", "virada", "design-system", "modulos-plugin", "discovery", "tese"]
relacionados: ["44-temas-json-e-persistencia", "45-scaffolder-react-e-skills", "40-teste-real", "18-shell-consome-design-engine"]
---

> **Correção de premissa (2026-07-22):** entradas anteriores desta sessão afirmaram que o `Sarak-MyService` "rodava o modelo de componentes atômicos". **Isso era falso** (erro do planejador, verificado no código). O MyService roda o **modelo de módulos-plugin (Discovery + Shell, Spec 04)** — `registerSarakModule`/`registerLocalComponent`. A decisão do mantenedor é **assumir ESSE modelo como oficial** (é o único com consumidor provado), com os componentes atômicos como blocos internos. As specs foram corrigidas para este alvo.

# 1. Visão Geral

Estabelecer o **modelo de consumo por módulos-plugin** (o do MyService) como o modelo oficial da lib, e a API pública mínima para um sistema importador plugar seu negócio nele. O objetivo do produto (Spec 44): uma **central de layout (Design Engine)** que aplica tema/template ao sistema inteiro. Esta spec é o ato âncora enxuto — só o que destrava o Teste Real.

# 2. A Nova Tese (ato âncora)

> **A Sarak-Lib-UI-Core é uma BASE de front com Shell + Design Engine central.** O sistema importador **registra seus módulos de negócio** (React) na lib (`registerSarakModule`/`registerLocalComponent`); a lib fornece o **Shell** (navegação, layout), o **Design Engine** (central de tema/template que aplica ao sistema inteiro) e os **componentes atômicos** como blocos. O importador **altera o layout pela central** (Design Engine) e pode **criar o que precisar** (módulo/componente próprio). É exatamente o padrão do MyService, agora oficial.

- O renderizador de páginas por manifesto (`src/core/Manifest/` — SarakManifestRenderer) **não** é o modelo (falhou no Teste Real) e sai na Spec 46.
- Reescrever o "Princípio vigente do planejamento" no `00-indice.md` e a §1 do manifesto arquitetural (`specs/specs/00-*`) para este texto. O antigo ("renderizador genérico via manifesto") vira histórico.

## 2.1 Des-depreciar o modelo #1 (Shell/Discovery)
- Hoje `src/core/Manifest/Registry/manifestExclusions.ts` marca `SarakShell`/`DynamicRenderer` como "Shell legado (Spec 04)". Com a remoção do #2 (Spec 46), o #1 **deixa de ser legado — é o modelo**. Atualizar essa marcação e a narrativa (não é mais "consumidores novos usam shell/routes do manifesto").

## 2.2 Fronteira do que a central tematiza (regra dura)
- A troca de tema/template atinge **tudo que consome os tokens** (componentes Sarak + módulos que usam `var(--sarak-*)`). Marcação de módulo com **estilo hardcoded fora do contrato de tokens NÃO é tematizada**. Documentar: para um módulo ser temável pela central, ele usa componentes Sarak e/ou os tokens.

# 3. Regras de Negócio (Solução)

## 3.1 API pública do modelo de módulos (confirmar e documentar)
- Garantir públicos e tipados em `src/index.ts`: `SarakUIProvider`/`useSarakUI`, `SarakShell`, `registerSarakModule`, `registerLocalComponent`, `getRegisteredModules`/`getLocalComponent` (o suficiente para plugar), e os **componentes atômicos** (`SarakButton` etc. já exportados via `export *` — auditar que TODOS os do catálogo estão expostos).
- Documentar o contrato de um **módulo** (`SarakModule`: o que exporta — `SarakUI` etc.) e de um **componente local** (`registerLocalComponent(id, component)`), com exemplo mínimo de registro (espelhando o `safeRegister`/`registerSarakModuleSafe` do MyService `main.tsx`).

## 3.2 `SarakUIProvider` + `SarakShell` como a base montável
- Documentar/testar a montagem canônica: `SarakUIProvider` (com `options`/`manifest` do sistema + branding) envolvendo `SarakShell`, que renderiza os módulos registrados com navegação e tema. É o esqueleto que o starter (Spec 45) gera e que o Teste Real (Spec 40) usa.

## 3.3 Contrato de tokens público (para módulos/componentes próprios do importador)
- Documentar no catálogo + skill o contrato de tokens/CSS vars público, para o importador tematizar **seu próprio módulo/componente** e ele responder à central. Ex.: `background: var(--sarak-card-bg)`, `color: var(--sarak-text-main)`, `gap: var(--sarak-layout-gap-md)`. É o que faz "trocar um tema atingir todas as telas" valer também para o código do importador.

## 3.4 Nota mínima na skill (reescrita completa é a Spec 45)
- Adicionar em `ui-integra-consumidor` uma seção **"Modelo de consumo: módulos-plugin"**: montar `SarakUIProvider`+`SarakShell`, `registerSarakModule` para features, `registerLocalComponent` para overrides, usar componentes/tokens. Suficiente para o Teste Real; o `init` React e o reenquadramento completo ficam na Spec 45.

# 4. Critérios de Aceite
- [x] Princípio vigente reescrito (`00-indice.md` + `specs/specs/00-*`) para "base com Shell + Design Engine central + módulos-plugin".
- [x] `manifestExclusions.ts` e narrativa atualizados: Shell/Discovery deixa de ser "legado".
- [x] API do modelo de módulos pública e tipada; TODOS os componentes atômicos do catálogo exportados (achado: `Cards/SarakActionCard`, `SarakSearchCard`, `SarakTitleCard`, e as pastas inteiras `Layouts/` e `Navigation/` faltavam no barrel `src/index.ts` — já estavam no `NATIVE_COMPONENTS` do motor de manifesto, mas nunca no export público React); teste que registra um módulo/componente e o renderiza no `SarakShell` sob o `SarakUIProvider`.
- [x] Contrato de tokens público documentado (para módulo/componente próprio do importador).
- [x] `ui-integra-consumidor` com a seção "Modelo de consumo: módulos-plugin" (mínima).
- [x] Regressão: o MyService (consumidor real do #1) continua funcionando (nenhuma API que ele usa mudou de assinatura — só exports novos/aditivos); a suíte do manifesto (#2) segue verde (nada removido ainda).
- [x] Gates verdes: `catalog:check`, `npm run build`, `run_audit.mjs` sem regressão (baseline exato: 1 hardcode + 3 ghostvars + 3 órfãos, todos pré-existentes). (`RegistryParity` é do #2 — permanece até a Spec 46.)

# 5. Plano de Testes
- [x] Registrar um módulo de exemplo (`registerSarakModule`) + um `registerLocalComponent`, montar sob `SarakUIProvider`+`SarakShell`, e provar que renderiza e é tematizado (`src/core/Shell/__tests__/SarakShell.test.tsx`).
- [x] Escape hatch: um componente próprio usando `var(--sarak-*)` responde à troca de tema (mesmo arquivo — troca `activeThemeId` entre dois temas e confirma que o token lido pelo componente do importador muda).
- [x] Regressão: MyService intacto; suíte do #2 verde (sai só na Spec 46) — suíte completa `npx vitest run`: 304 arquivos / 933 testes, 100% verdes.

## 5.1 Achado colateral (fora do escopo desta spec — Design Engine é a Spec 44)
Ao escrever o teste de montagem real (`SarakUIProvider`+`SarakShell`), foi reproduzido um **bug real de loop de render infinito**: `SarakUIProvider`'s `customThemes` tem default `= []` (novo array a cada render sem prop explícita); combinado com `useDesignSync` chamando `setDesign` incondicionalmente sempre que `activeThemeId` está setado, qualquer consumidor que passe `activeThemeId` sem também passar uma referência ESTÁVEL de `customThemes` entra em loop (render → novo `customThemes` → novo `allThemes` → efeito refaz `setDesign` → render...). Reproduzido com CPU ~100% num processo que nunca termina. Contornado no teste passando uma constante `customThemes` estável (não é fix de produção — registrado aqui para a Spec 44 avaliar). Dois outros achados de ambiente, também contornados só no teste: `fetch('/api/ui/design')` sem timeout pode pendurar o processo se algo responder na porta sem fechar a conexão (mock de `fetch` no teste); `framer-motion`/`AnimatePresence` não converge em jsdom (mesmo mock já usado em `SidebarNav.test.tsx`).
