---
tipo: "spec"
titulo: "Modo Embarcado e Adoção Incremental (renderizar sobre frontend existente)"
dominio: "Provider / CSS / Contrato do Importador"
status: "🟢 Concluída (2026-07-18)"
prioridade: "Alta"
tags: ["spec", "embedded", "brownfield", "css-scoping", "provider", "adocao-incremental"]
relacionados: ["08-consumo-externo-e-integracao", "16-tokens-semanticos-e-validacao-de-valores", "22-skills-de-consumo-golden-path"]
---

# 1. Visão Geral e Descrição do Problema

A biblioteca foi projetada para DOIS modos de consumo:
1. **Modo App (greenfield):** o sistema nasce com a lib — Provider+Renderer são a raiz, 100% da interface vem do manifesto. **Validado em campo** (teste `automacao`, E2E 11/11).
2. **Modo Embarcado (brownfield):** o sistema JÁ possui frontend próprio; a lib renderiza via manifesto **em cima/dentro** do front existente (ilhas por rota/região, migração incremental).

O contrato de COMPOSIÇÃO já suporta o modo 2 por desenho: o `SarakManifestRenderer` é um componente React comum (montável em qualquer ponto, múltiplas instâncias com DataStores próprios) e a lib nunca controla a URL (host decide quais rotas são manifesto via `route`/`routerInterceptor`). Tokens são prefixados (`--sarak-*`, Spec 08 §5).

**Porém o `SarakUIProvider` hoje se comporta como DONO da página** — 5 vazamentos confirmados no código que contaminam o front existente do host:

| # | Vazamento | Evidência |
|---|---|---|
| 1 | **CSS global com Preflight do Tailwind** — o bundle (~206KB) injetado no `<head>` ao importar começa com `@import "tailwindcss"` → reset global de elementos (h1-h6, botões, listas) re-estiliza o app inteiro do host | `src/styles/sarak-base.css:1`; injeção em `src/core/Provider/injectStyles.ts` |
| 2 | `document.title` sobrescrito pelo branding/systemName | `DesignInjector.tsx:38`, `useSarakUIEffects.ts:29` |
| 3 | Tokens/atributos escritos no `document.documentElement` (`:root`), incl. `--mouse-x/y` e `data-*` | `DesignInjector.tsx:27-51` |
| 4 | Overlays de página inteira montados pelo Provider (`NoiseOverlay`, `SarakBackgroundRenderer` com `isFixed`) por cima do front do host | `SarakUIProvider.tsx` (render) |
| 5 | Fontes/favicon injetados globalmente | `useSarakUIEffects.ts` |

O modo 2 nunca foi testado; hoje envolver uma ilha com o Provider contamina a página hospedeira.

# 2. Regras de Negócio (Solução)

## 2.1 `SarakUIOptions.mode: 'app' | 'embedded'` (default `'app'`)
- **`app`** (default): comportamento atual — zero breaking change.
- **`embedded`**: o Provider vira um cidadão da página, não o dono:
  - **CSS escopado:** gerar no build uma variante `dist/sarak-scoped.css` com preflight e utilities confinados a um seletor raiz (`.sarak-scope`) — Tailwind v4 suporta via configuração de `@import "tailwindcss"` com source/prefix/selector strategy (decidir a técnica exata na execução: `important: '.sarak-scope'`-like scoping, `@layer` + seletor, ou pós-processamento com `postcss-prefix-selector`). O `injectSarakStyles` injeta a variante escopada quando `mode: 'embedded'`.
  - **Tokens no container:** `DesignInjector` aplica vars/`data-*` num elemento-raiz da ilha (reusar o mecanismo do `DesignScope`, que já existe para a diretiva `theme`), não em `document.documentElement`. O Provider embedded renderiza um `<div className="sarak-scope">` envolvendo os children.
  - **Desligados:** `NoiseOverlay`, `SarakBackgroundRenderer` global, mutação de `document.title`/favicon/fontes globais (fontes: carregar via `@font-face` dentro do escopo ou exigir opt-in explícito).
  - **Mantidos:** toasts/overlays em portal (recebem a classe `.sarak-scope` no portal para herdarem o CSS escopado — atenção: portais saem da árvore, o seletor precisa acompanhá-los).
- Múltiplas ilhas: N Renderers sob 1 Provider embedded (recomendado) — documentar; N Providers na mesma página fica explicitamente fora do suporte nesta spec (registrar limitação).

## 2.2 Pergunta obrigatória na skill de importação
`ui-integra-consumidor` (Etapa 1 — entrevista) passa a perguntar **PRIMEIRO**: *"O módulo vai renderizar um sistema NOVO (tudo via manifesto — Modo App) ou vai renderizar SOBRE um frontend que já existe (Modo Embarcado)?"* — e bifurca o fluxo:
- **Modo App** → fluxo atual (template starter, shell/routes, init).
- **Modo Embarcado** → `mode: 'embedded'` no Provider, montagem por rota/região do host, migração incremental documentada (ilha → mais rotas → shell completo → Modo App). Enquanto esta spec não for executada, a skill deve avisar honestamente que o Modo Embarcado está em desenvolvimento (esta spec) e quais são os vazamentos conhecidos.

## 2.3 Gate de não-vazamento (bidirecional)
Teste E2E (harness Puppeteer): página host com estilos próprios (h1 com margem, botão estilizado, `<title>` próprio) + ilha Sarak embedded → asserções: (a) computed styles do host INALTERADOS após montar a ilha; (b) `document.title` do host preservado; (c) dentro da ilha, os átomos Sarak renderizam com os estilos Sarak (o escopo não pode quebrar a própria lib); (d) toast disparado do manifesto renderiza estilizado.

## 2.4 Documentação
- Spec 08 ganha seção "Modos de Consumo" (App vs Embarcado, tabela do que cada modo faz com a página).
- Receita brownfield completa na skill (spec 22 referencia; quem executar por último reconcilia).

# 3. Critérios de Aceite
- [x] `mode: 'embedded'`: nenhum estilo/atributo/título global do host alterado (gate 2.3 verde).
- [x] Ilha embedded renderiza manifesto completo com visual Sarak correto. *(Coberto: N Renderers com DataStores próprios, átomos com design tokens resolvidos e toast em portal estilizado. Shell completo e Design Engine DENTRO de ilha embarcada não foram exercitados — são ortogonais ao escopo de CSS; ver 00-progresso.)*
- [x] `mode: 'app'` (default) byte-a-byte com o comportamento atual (suítes existentes verdes sem modificação).
- [x] Variante `sarak-scoped.css` gerada no build; `catalog:check`/build verdes.
- [x] Skill `ui-integra-consumidor` com a pergunta de modo bifurcando o fluxo (espelhos sincronizados).

# 4. Plano de Testes (Quality Gate)
## Unitários
- [x] DesignInjector em modo embedded escreve vars no container, não em `documentElement`; `document.title` intocado.
- [x] injectSarakStyles seleciona a variante correta por modo.
## Integração
- [x] 2 Renderers sob 1 Provider embedded, DataStores independentes, sem interferência.
## E2E
- [x] Gate de não-vazamento bidirecional (2.3) — host intacto, ilha estilizada, toast funcional.
