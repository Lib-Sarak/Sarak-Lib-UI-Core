---
tipo: "spec"
titulo: "Paridade de navigationStyle no ShellRouterNode (topbar não pode quebrar o Shell novo)"
dominio: "Manifest Engine / Shell / Design Engine / Paridade"
status: "🟡 Executada (2026-07-20) — unitário verde; validação final é o re-Selo (P15)"
prioridade: "Máxima"
tags: ["spec", "correcao-pos-selo", "shell", "navigationstyle", "paridade", "regressao"]
relacionados: ["18-shell-consome-design-engine", "33-composicao-pagina-rota-shell", "26-instalacao-teste", "04-estrutura-shell-discovery"]
---

# 1. Visão Geral e Descrição do Problema

Achado **0** (o mais grave) do Selo da Onda (Spec 26): ao ativar um tema com `navigationStyle: "topbar"` no Design Engine, a navegação **quebra visualmente** — vira uma faixa horizontal estreita e cortada no lugar da sidebar, mostrando 1-2 itens em vez da lista completa. É uma **regressão de paridade**: o Shell LEGADO já resolve isso; o motor declarativo novo (Spec 18/33) não.

Causa raiz confirmada por leitura de código:

- `SarakShellNav` **muda corretamente** sua orientação interna para horizontal quando `navigationStyle === 'topbar'` (`src/components/atomic/Navigation/SarakShellNav.tsx:114-119`, via o helper local `useNavigationStyle`).
- Mas `ShellRouterNode` (quem monta o chrome do shell a partir do manifesto) **sempre** envolve a região `shell.sidebar` num `<aside>` de largura FIXA (`--sarak-sidebar-width`, 240px; min 200 / max 450), **independentemente de `navigationStyle`** — `src/core/Manifest/nodes/ShellRouterNode.tsx:154-172`. Resultado: um menu horizontal inteiro espremido dentro de uma coluna de 240px pensada para menu vertical.
- O Shell LEGADO (`src/core/Shell/SarakShell.tsx:78-194`) já trata isso como **ramos mutuamente exclusivos**: `isTopbar`/`isDock`/`isGlass`/`isSidebar`. Quando `isTopbar`, a região de sidebar **nem é renderizada** — em vez disso um `<TopbarNav>` de largura cheia é montado no topo do conteúdo. O motor novo herdou a adaptação de **orientação** do item de nav (Spec 18), mas nunca a **realocação de região**.

Por que importa além do teste: o `Sarak-MyService` — piso mínimo de funcionalidade da onda (`Sarak-MyService/src/sarak.manifest.json:11`) — declara `"navigationStyle": "topbar"` como configuração de **produção real**. Ele só não quebra hoje porque roda sobre o Shell legado. Migrá-lo para o motor declarativo novo (objetivo declarado da onda "Renderizador Genérico") quebraria a navegação dele exatamente como no ERP. Isto é, portanto, um item de **PARIDADE** (o motor novo precisa alcançar o legado), não só um bug isolado.

Impacto na matriz do Selo: reclassifica **M7 de PASS para FAIL** (o achado #5, "salvar novo tema não documentado", é problema DIFERENTE e independente — tratado na Spec 29).

# 2. Regras de Negócio (Solução)

## 2.1 Fonte única de `navigationStyle` (Zero Hardcode / paridade de leitura)
- Extrair a lógica de leitura hoje privada em `SarakShellNav.tsx` (`useNavigationStyle` — lê `DesignOverrideContext` com prioridade sobre `UIContext.design`, degrada a `undefined` fora do Provider) para um **helper compartilhado** reutilizável pelo `ShellRouterNode` e pelo `SarakShellNav`. Uma única fonte de verdade — não duplicar a leitura do contexto (evita drift entre os dois lados, que foi a origem do bug).
- O helper vive na camada `core/` (é lógica de leitura de design, não um átomo) e não introduz dependência circular com os átomos.

## 2.2 Realocação de região no ShellRouterNode (a correção central)
- O `ShellRouterNode` passa a ler `navigationStyle` e decidir o **chrome** da região `shell.sidebar`:
  - `navigationStyle` **sidebar-like** (`'sidebar'`, ausente/desconhecido → default vertical): comportamento atual — `<aside>` de largura fixa com os tokens `--sarak-sidebar-width/min/max` + `--sarak-sidebar-bg` (Spec 18 intacta).
  - `navigationStyle: 'topbar'` (e, por extensão, qualquer estilo **horizontal**): a região `shell.sidebar` **NÃO** recebe o `<aside>` de largura fixa — renderiza como **faixa de largura cheia** (`flex-shrink: 0`, largura total, altura própria por conteúdo), posicionada acima do corpo, replicando a exclusividade mútua do `<TopbarNav>` legado. A coluna de conteúdo volta a ocupar 100% da largura abaixo dela.
- **Contrato de manifesto preservado (zero breaking change):** o autor continua declarando a navegação na região `shell.sidebar` (ou `shell.topbar`) como hoje; quem decide o layout final é o `navigationStyle` do tema em runtime. Nenhuma chave nova obrigatória; manifestos existentes seguem válidos.
- **Escopo negativo:** `dock`/`glass` do shell legado **não** entram nesta spec (mesma fronteira da Spec 18). Tratar `dock`/`glass` como o ramo default vertical por ora e registrar como evolução futura — mas a arquitetura da 2.2 deve deixar o ponto de extensão óbvio (um mapa estilo→chrome, não um `if topbar` isolado).

## 2.3 Zero Hardcode e tokens
- Toda medida/cor nova via `var(--sarak-*, fallback)` no padrão da Spec 00 — proibido `--sx-*` e valores duros. Reusar as vars que o Design Engine já emite (`--sarak-topbar-*`/`--sarak-sidebar-*`), sem criar token órfão (respeitar a paridade 1:1:1:1:1:1 — se precisar de token novo, passar pela skill `ui-novo-componente`; a intenção é NÃO precisar).

# 3. Critérios de Aceite
- [x] Com um tema `navigationStyle: 'topbar'` ativo, a navegação declarada em `shell.sidebar` renderiza como faixa horizontal de **largura cheia** (todos os itens visíveis), e o conteúdo ocupa 100% da largura abaixo — sem a coluna de 240px. Confirmado por asserção de DOM/estilo inline (`nodes/__tests__/ShellRouterNode.test.tsx`, describe "Spec 27").
- [x] Com `navigationStyle: 'sidebar'` (ou ausente/desconhecido), o comportamento é **idêntico ao atual** (nenhuma regressão na Spec 18): `<aside>` com largura/bg tokenizados.
- [x] `ShellRouterNode` e `SarakShellNav` leem `navigationStyle` da **mesma** fonte (helper compartilhado `src/core/Provider/useNavigationStyle.ts`) — sem duplicação de leitura de contexto.
- [x] Trocar `navigationStyle` no CustomizationPanel (`/design`) reflete o layout do shell **ao vivo** (sem reload), como já ocorre com cor/altura da topbar (Spec 18) — mecânica de contexto reativo idêntica; validação visual definitiva fica para o re-Selo (E2E browser).
- [x] Zero hardcode: todos os estilos novos via `var(--sarak-*, fallback)` com vars REAIS já emitidas (`--sarak-sidebar-bg`); nenhum token órfão criado.
- [x] Gates verdes: `RegistryParity` (5/5), `catalog:check` (em dia), `npm run build` (verde); `run_audit.mjs` sem regressão — exatamente o baseline pré-existente (1 hardcode `SarakTypography.tsx:42`; 3 vars-fantasma; 3 órfãos da Conferência Funcional), zero violação nova.

# 4. Plano de Testes (Quality Gate)
## Unitários
- [x] `ShellRouterNode`: com `navigationStyle='topbar'` no contexto de design, a região sidebar NÃO recebe as classes/estilo de largura fixa (`--sarak-sidebar-width`) e é renderizada em faixa cheia; com `'sidebar'`/ausente/`'dock'` desconhecido, mantém o `<aside>` fixo. (`nodes/__tests__/ShellRouterNode.test.tsx`, describe "Spec 27" — 4 casos novos)
- [x] Helper compartilhado de `navigationStyle`: prioridade do override sobre o persistido; degrada a `undefined` fora do Provider e para valor não-string (`src/core/Provider/__tests__/useNavigationStyle.test.tsx`, 4 casos).
## Integração
- [x] Uma árvore de shell completa (topbar + sidebar + rota) montada com design `topbar` vs `sidebar` produz a estrutura de regiões esperada (asserção sobre o DOM/estilo inline — a computação de `var()` real fica para o E2E).
## E2E (browser real — harness Puppeteer dos testes de instalação)
- [ ] **Validação final é o re-teste do Selo (P15), não só o unitário.** No browser: abrir `/design`, ativar `navigationStyle: 'topbar'`, confirmar via `getComputedStyle`/inspeção visual que a nav ocupa a largura cheia e mostra todos os itens; repetir com `sidebar`. jsdom não computa `var()`, então este passo roda no harness de browser — **pendente, é o item 15 do roteiro (re-Selo, precedido da limpeza da Spec 31/P14)**.
- [ ] Nota de paridade: a mesma validação deve ser o gate para uma eventual migração do `Sarak-MyService` (produção `topbar`) ao motor novo.
