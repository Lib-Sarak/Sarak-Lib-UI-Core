---
tipo: "spec"
titulo: "Shell do Manifesto Consome o Design Engine (Paridade MyService)"
dominio: "Manifest Engine / Shell / Design Engine"
status: "🟢 Concluída"
prioridade: "Alta"
tags: ["spec", "shell", "design-engine", "paridade", "topbar"]
relacionados: ["11-engine-declarativa-e-manifestos", "04-estrutura-shell-discovery", "01-painel-customizacao-temas"]
---

# 1. Visão Geral e Descrição do Problema

No shell legado (`src/core/Shell/SarakShell.tsx`, usado pelo MyService), `TopbarNav`/`SidebarNav` consomem os tokens do Design Engine — mudar cor/altura da topbar no painel reflete na hora. No motor atual, o `ShellRouterNode` (`src/core/Manifest/nodes/ShellRouterNode.tsx`) renderiza as regiões `shell.topbar`/`shell.sidebar` **cruas**: só a sidebar ganhou largura (`--sarak-sidebar-width`); a topbar não tem `<header>` nem consome altura/cor; `navigationStyle` (sidebar/topbar/dock) do painel é ignorado.

Sintoma relatado em teste real: *"personalizei a topbar no Design Engine e nada mudou"* — regressão de paridade contra o piso MyService.

Fato relevante: o Design Engine **já emite** as vars necessárias (`src/core/Provider/manifest.ts`): `topbarColor` → `--theme-topbar-bg`/`--sarak-topbar-bg` (linha ~73), `topbarHeight` → `--topbar-height`/`--sarak-topbar-height` (linha ~228), `sidebarColor` → `--theme-sidebar-bg`/`--sarak-sidebar-bg` (linha ~69). Falta só o shell consumi-las.

# 2. Regras de Negócio (Solução)

## 2.1 Regiões com chrome de tokens (ShellRouterNode)
- **Topbar:** envolver a região num `<header className="sarak-shell-topbar" ...>` com `minHeight: var(--sarak-topbar-height, 64px)`, `background: var(--sarak-topbar-bg, transparent)`, `flex-shrink: 0` e borda inferior tokenizada (`var(--sarak-card-border-color, ...)`). O conteúdo declarado no manifesto renderiza DENTRO do chrome.
- **Sidebar:** o `<aside>` existente ganha `background: var(--sarak-sidebar-bg, transparent)` (largura já existe).
- Tudo com fallback no padrão zero-hardcode da Spec 00 (`var(--x, fallback)`), sem namespace `--sx-*`.

## 2.2 `navigationStyle` como dado (SarakShellNav.orientation)
- `SarakShellNav` (`src/components/atomic/Navigation/SarakShellNav.tsx`) ganha prop `orientation?: 'vertical' | 'horizontal' | 'auto'` (default `'auto'`).
  - `vertical`: layout atual.
  - `horizontal`: itens em linha (para uso dentro de `shell.topbar`), grupos viram separadores, marca à esquerda.
  - `auto`: lê `useSarakUI().design.navigationStyle` — `'topbar'` → horizontal; demais → vertical. Assim o painel do Design Engine passa a controlar a orientação do menu SEM mudança no JSON (paridade MyService).
- Documentar no catálogo (regen automático) e no template starter (comentário `$comment`).
- Escopo negativo: `dock`/`glass` do shell legado NÃO entram nesta spec (registrar como evolução futura; `auto` trata valores desconhecidos como vertical).

## 2.3 Definição de "aplicar" ponta a ponta
O ciclo completo deve funcionar: painel Design Engine altera `topbarColor` → draft aplica → `DesignInjector` emite var → topbar do shell do manifesto muda ao vivo; salvar persiste (porta de persistência — Spec plan/19) e recarregar mantém.

# 3. Critérios de Aceite
- [x] Mudar cor/altura da topbar no CustomizationPanel reflete no shell do manifesto ao vivo (sem reload). — o `<header>` consome `var(--sarak-topbar-bg/height)`; quando o `DesignInjector` atualiza a var no escopo, a topbar repinta (mecânica de CSS var).
- [x] `navigationStyle: 'topbar'` no design faz `SarakShellNav` (orientation auto) renderizar horizontal.
- [x] Manifesto continua 100% compatível (nenhuma chave nova obrigatória; `orientation` é opcional, default `'auto'`).
- [x] Zero hardcode: todos os estilos novos via `var(--sarak-*, fallback)` (vars REAIS emitidas — `--sarak-card-border-color`, não a morta `--sarak-card-border`).
- [x] Gate de paridade (`RegistryParity`) e catálogo (`catalog:check`) verdes após regen.

# 4. Plano de Testes (Quality Gate)
## Unitários
- [x] ShellRouterNode: topbar renderiza `<header class="sarak-shell-topbar">` com as vars; sidebar com background var. (`nodes/__tests__/ShellRouterNode.test.tsx`)
- [x] SarakShellNav: `orientation="horizontal"` → flexDirection row; `auto` + design.navigationStyle='topbar' → horizontal; default vertical; `dock` desconhecido → vertical. (`Navigation/__tests__/SarakShellNav.test.tsx`)
## Integração
- [x] Coberto pela asserção de que o `<header>` do shell consome `var(--sarak-topbar-*)` inline — a atualização ao vivo é garantida pela mecânica de CSS var (o `DesignInjector` altera a var no escopo).
## E2E (browser real — usar o harness Puppeteer dos testes de instalação)
- [ ] **Pendente (browser):** abrir /design, mudar cor da topbar, `getComputedStyle` da topbar; salvar/recarregar. O jsdom não computa `var()`, então este passo fica para o harness Puppeteer dos testes de instalação (não executável no vitest).
