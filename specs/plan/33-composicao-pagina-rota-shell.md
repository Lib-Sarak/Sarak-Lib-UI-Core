---
tipo: "spec"
titulo: "Composição de Página, Rota e App-Shell como Dado"
dominio: "Sarak-Lib-UI-Core (Visual + Lógica / Híbrida)"
status: "🔴 A Implementar"
prioridade: "Crítica"
tags: ["spec", "shell", "routing", "pages", "manifest"]
relacionados: ["20-manifest-schema-e-gramatica-no", "30-contrato-importador-renderer", "14-expansao-navegacao"]
---

# 1. Visão Geral
O Renderer (Spec 30) hoje recebe **uma** árvore (uma tela), mas um CRM/ERP é **multi-página**. Esta spec eleva o manifesto de "uma tela" para "uma aplicação": define o **App-Shell data-driven** (sidebar + topbar + região de conteúdo trocável) e o **roteamento como dado** (qual manifesto renderiza em qual rota), integrando-se ao `router` do importador.

# 2. Regras de Negócio
- **Regra 1 — Diretiva `shell` (raiz):** O nó raiz aceita:
  ```
  shell?: { sidebar?: ManifestNode, topbar?: ManifestNode, content: "<slot-rotas>" }
  ```
  O Shell persiste entre navegações; apenas a região `content` troca. O componente visual `SarakShell` já existe — esta spec o liga ao manifesto via slots nomeados (Spec 20).
- **Regra 2 — Mapa de Rotas como Dado:** O manifesto raiz declara:
  ```
  routes?: { "<path>": ManifestNode | { lazy: "<manifestId>" } }
  ```
  A rota ativa resolve qual subárvore renderiza na região `content`. Suporta lazy de páginas grandes.
- **Regra 3 — Ponte com o Router do Importador:** A navegação reusa o `routerInterceptor` (Spec 30) — a Sarak NÃO controla a URL diretamente; ela pede ao host (`router.push` do Next.js, etc.) e reage à rota corrente fornecida pelo host.
- **Regra 4 — Contrato TS (Zero Any):** `interface ShellDirective` e `type RouteMap` tipados; `content` é um slot tipado, não `any`.
- **Regra 5 — Estado e Persistência Cross-Page:** Estado do Shell (sidebar recolhida, aba ativa) integra DataStore (Spec 21) e Persistência (Spec 28), sobrevivendo à troca de rota.

# 3. Critérios de Aceite
- [ ] Um manifesto com `shell` + 3 `routes` renderiza sidebar/topbar fixos e troca apenas o `content` ao navegar.
- [ ] A navegação aciona o `routerInterceptor` do host (não manipula `window.location` direto).
- [ ] `shell` e `routes` estão no catálogo da Spec 20 e passam na Conferência Funcional (Spec 34).
- [ ] A sidebar recolhida (persistida) permanece recolhida ao mudar de página.

# 4. Plano de Testes (Quality Gate)

## Testes Unitários
- [ ] **Deve** resolver a subárvore correta para a rota ativa, mantendo o Shell montado.
- [ ] **Deve** delegar a navegação ao `routerInterceptor` injetado.

## Testes de Contrato (API)
- [ ] **Deve** passar na Conferência Funcional (Spec 34) para `shell` e `routes`.

## Testes E2E (Integração)
- [ ] Navegar entre 2 páginas via um item da sidebar e confirmar que o Shell não remonta e o conteúdo troca isoladamente.
