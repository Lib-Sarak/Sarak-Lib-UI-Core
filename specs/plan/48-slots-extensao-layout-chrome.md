---
tipo: "spec"
titulo: "Slots de extensão do SarakAppChrome — o consumidor injeta imagens/animações/regiões custom no layout"
dominio: "Componentes / Cromo apresentacional / Extensibilidade / Slots / DX do consumidor"
status: "🟢 Executada (2026-07-26) — L1-L4 entregues; gates verdes (suíte 275 arq/840 testes, run_audit no baseline). Falta a validação de browser do dono (§6)"
prioridade: "Alta"
tags: ["spec", "feature", "cromo", "layout", "slots", "extensibilidade", "imagens", "animacoes"]
relacionados: ["40.2-correcoes-importacao-r2", "40.3-multidispositivo-por-padrao", "18-shell-consome-design-engine", "47-soberania-identidade-host", "50-kit-de-uso-do-consumidor"]
---

> **Contexto:** o dono quer que o **importador possa adicionar imagens, animações ou qualquer conteúdo** na parte de layout. Hoje o `SarakAppChrome` só aceita logo (`brand.logoUrl`), ações na topbar (`topbarActions`) e o conteúdo (`children`); e o Design Engine já faz **fundo/atmosfera global por tema**. Falta um conjunto de **slots nomeados** para o consumidor injetar conteúdo em regiões bem definidas do cromo, sem forkar a componente. Renderizador genérico: a lib fornece as **regiões**; o consumidor põe o que quiser.

# 1. Visão Geral e Objetivo

Dar ao `SarakAppChrome` **slots de extensão** — props `ReactNode` opcionais que marcam regiões do layout (banner, rodapé, cabeçalho/rodapé de sidebar, logo custom, camada decorativa de fundo, etc.). O consumidor preenche com **imagens, componentes animados ou qualquer React**, tematizável por token, **zero-config** (todos opcionais). Documentar os **dois níveis** de "adicionar imagem/animação": (a) **global por tema** (Design Engine/atmosfera — já existe) e (b) **por região via slots** (esta spec).

## 1.1 Princípios
- **A lib dá a região, o consumidor dá o conteúdo:** slot é `ReactNode`; a lib não presume o que vai dentro (imagem, vídeo, animação, banner).
- **Zero-config, aditivo, sem breaking change:** todos os slots são opcionais; `brand`/`topbarActions`/`children` atuais continuam funcionando; `topbarActions` é preservado (vira alias de `topbarEnd`).
- **Tematizável e acessível:** as regiões respondem aos tokens `--sarak-*`; os slots participam da ordem de foco de forma sensata; responsivo (Spec 40.3) — no mobile os slots refluem/degradam, nunca comem a tela.
- **Renderizador genérico:** o cromo é por-app; os slots não pressupõem host único.

# 2. Estado atual (confirmado no código — não re-descobrir)
- [`SarakAppChrome.tsx`](../../src/components/atomic/../components/Layout/SarakAppChrome.tsx) hoje: props `brand{name,logoUrl}`, `navItems`/`nav`, `activeRoute`, `onNavigate`, `navigationStyle`, `topbarActions` (React à direita da topbar), `className`, `style`, `children`. Nenhum slot para banner/rodapé/sidebar-header/decoração.
- **Fundo/atmosfera GLOBAL já existe** por tema: o Design Engine emite tokens de *atmosphere/media* e o `SarakBackgroundRenderer` (montado pelo `SarakUIProvider`) desenha fundo/imagem/gradiente/animação **globalmente** — o consumidor já consegue fundo animado **pelo tema**, sem código. O que falta é conteúdo **por região do cromo**.
- `SarakAppChromeMobile` (Spec 40.3) é o colapso mobile do cromo — os slots precisam ter lugar (ou degradar) também nele.

# 3. Regras de Negócio (Solução) — LADO DA LIB

## L1. Slots nomeados no `SarakAppChrome`
Adicionar props `ReactNode` opcionais (nomes finais podem ser afinados na execução, mantendo a intenção):
- `logo` — logo custom/animado (tem precedência sobre `brand.logoUrl` quando presente).
- `topbarStart` / `topbarEnd` — conteúdo custom no início/fim da topbar (`topbarEnd` = alias de `topbarActions`, preservado p/ compat).
- `sidebarHeader` / `sidebarFooter` — no topo/rodapé da sidebar (modo sidebar).
- `banner` — faixa full-width **acima** do conteúdo (avisos, promo, faixa animada).
- `footer` — rodapé da página.
- `decoration` (ou `background`) — **camada atrás** do conteúdo do cromo, para imagem/animação decorativa escopada ao cromo (complementa o fundo global do tema).
Cada slot é opcional; ausente = não renderiza a região (sem espaço morto). Posicionamento/medidas por token onde fizer sentido, nunca hardcode.

## L2. Responsividade + acessibilidade dos slots
- No `SarakAppChromeMobile` (celular) os slots têm lugar coerente (ex.: `banner`/`footer` full-width; `sidebarHeader/Footer` migram para o drawer; `topbarStart/End` compactam) — **refluem, não estouram** (Spec 40.3). `decoration` fica atrás, sem capturar foco/toque (a11y).
- Ordem de foco por teclado sensata; `decoration`/`background` é `aria-hidden`/`pointer-events:none`.

## L3. Contrato documentado — os DOIS níveis de "adicionar imagem/animação"
- Documentar (catálogo/skill/`docs/`): **(a)** fundo/atmosfera **global por tema** (Design Engine — o que já existe, como usar) e **(b)** conteúdo **por região via slots** (esta spec, cada slot e onde aparece). Deixa claro qual usar para qual necessidade.

## L4. Handoff obrigatório para a Spec 50 (kit)
- Registrar na Spec 50 um **caso de autoria novo**: *"Extensibilidade de layout — adicionar imagens/animações/regiões custom (slots do cromo) + fundo global por tema"*. Como o catálogo do kit é **gerado por AST**, as novas props do `SarakAppChrome` entram sozinhas **se a 48 rodar ANTES da 50** (ordem do roteiro) — o ajuste na 50 é só **1 seção de prosa** + manter a ordem 48→50.

## Gates da lib
`catalog:check` (as novas props aparecem no `component-catalog`); `barrel:check` (o tipo `SarakAppChromeProps` já é exportado — manter verde); `npm run build` (DTS); **suíte COMPLETA** `npx vitest run` (teste por slot + por viewport); `package:check`; `run_audit.mjs` no **baseline** (slots por token, zero hardcode novo).

# 4. LADO DO ERP — herança (opcional)
- Nada obrigatório. O ERP **pode** usar os slots no `ErpChrome` (ex.: um `banner` de aviso, um `footer`, um logo animado) — ação normal de consumidor, sem CSS próprio. Serve de demonstração viva se o dono quiser.

# 5. Critérios de Aceite
- [x] **L1:** `SarakAppChrome` aceita os slots (`logo`/`topbarStart`/`topbarEnd`/`sidebarHeader`/`sidebarFooter`/`banner`/`footer`/`decoration`), todos opcionais; `brand`/`topbarActions`/`children` sem breaking change; tokens, não hardcode; teste por slot.
- [x] **L2:** slots refluem/degradam no `SarakAppChromeMobile` sem estourar a tela; `decoration` não captura foco/toque; testes por viewport.
- [x] **L3:** contrato documentado com os dois níveis (tema global + slots por região) — `docs/extensibilidade-de-layout.md`, shippado no pacote.
- [x] **L4:** caso de autoria de "extensibilidade de layout" registrado na Spec 50 (§5 casos + critério de aceite) + ordem 48→50 mantida.
- [x] `barrel:check`/`catalog:check` verdes (as 8 props novas no `component-catalog`); demais gates da lib verdes; entrada no `00-progresso.md`.

## 5.1 Decisões de execução (registro)
- **Geometria do `banner`/`footer`:** regra ÚNICA para os três modos — `banner` é a **primeira** faixa do cromo e `footer` a **última**, ambas full-width, com a barra de navegação (topbar/sidebar/hambúrguer) e o conteúdo entre elas. Evita caso especial por dispositivo (o refluxo mobile é o mesmo do desktop, só mais estreito) e torna "full-width" literal também no modo sidebar.
- **`topbarStart`/`topbarEnd` no modo sidebar:** não existe barra superior ali, então **degradam** para topo/rodapé da sidebar (o `topbarEnd` mantém exatamente o markup que o `topbarActions` já tinha) — nada de conteúdo do consumidor some em silêncio.
- **Empilhamento do `decoration`:** a raiz só vira contexto próprio (`position: relative` + `isolation: isolate`) **quando há decoração**; sem ela, a raiz fica byte a byte como antes.
- **Extração interna:** `chrome/ChromeFrame.tsx` (moldura comum aos 3 modos) + `chrome/ChromeSlots.tsx` (regiões) + `chrome/navItem.ts` (tipo movido) — necessária para manter `SarakAppChrome.tsx` sob o teto de 250 linhas do Clean Code. Subpasta de propósito: só `.tsx` de RAIZ de `components/Layout/` entram no `barrel:check`/catálogo, então os blocos internos não viram peça pública.
- **Âncoras `data-sarak-slot`:** cada região expõe uma âncora estável para teste e CSS do consumidor, sem depender da estrutura interna.

# 6. Validação prática (dono, browser)
- Montar um `SarakAppChrome` com um `banner` (imagem/animação), um `footer` e um `decoration` de fundo → aparecem nas regiões certas, tematizados, e **refluem no mobile** sem quebrar; a nav e o conteúdo continuam funcionando.

# 7. Fronteiras (não fazer)
- Não forkar a componente nem embutir lógica de negócio nos slots (são `ReactNode` puros).
- Não tornar nenhum slot obrigatório; não quebrar `brand`/`topbarActions`/`children`.
- Não reimplementar fundo global (já é do Design Engine) — os slots **complementam**, não substituem.
- Não host/mono-SPA; não fazer deploy; não commitar sem autorização.
