---
tipo: "spec"
titulo: "Erradicar a marca da lib em componentes consumidor-facing — nenhum 'Sarak Lib'/'Sarak OS' renderizado no produto do consumidor"
dominio: "Componentes / Identidade / Zero-marca / DX do consumidor / Gate"
status: "🔴 Planejada (2026-07-26) — achado da revisão da Spec 47; fecha o SINK que a 47 (fonte) deixou de fora"
prioridade: "Alta"
tags: ["spec", "correcao", "identidade", "marca", "vazamento", "componentes", "gate"]
relacionados: ["47-soberania-identidade-host", "50-kit-de-uso-do-consumidor"]
---

> **Contexto:** a **Spec 47** fechou a identidade da PÁGINA (título/favicon) e a FONTE do vazamento (defaults de branding → `systemName`) — corretamente. Mas a revisão achou que os **SINKS** ficaram de fora: vários componentes **consumidor-facing** renderizam a marca da lib **hardcoded** (`'Sarak Lib …'`). O grep da 47 procurou só `'Sarak OS'`; a marca hardcoded na base é `'Sarak Lib'`. Com `systemName` agora `undefined` (efeito da 47), o `SarakEmptyState` inclusive **passou a exibir `'Sarak Lib'`** onde antes exibia `'Sarak OS'` — o vazamento mudou de string, não fechou. Mesmo princípio da 47: **a lib nunca impõe a própria marca no produto do consumidor.**

# 1. Visão Geral e Objetivo

Erradicar toda string de **marca da lib** renderizada por componentes que o **consumidor embute** no produto dele (`SarakEmptyState`, `SarakSearch`, chat, etc.): a saída visível não pode nomear `'Sarak'`/`'Sarak Lib'`/`'Sarak OS'`. Onde há fonte de configuração (marca do consumidor/`systemName`), cai nela; senão, num rótulo **neutro/genérico de função** — nunca a marca da lib. Travar com um **gate** para não regredir. Painéis **internos** do Design Engine (ferramenta de autoria da própria lib, não embutida pelo consumidor) ficam **fora** (allowlist documentada).

## 1.1 Princípios
- **Zero-marca no consumidor-facing:** nenhum componente que o consumidor renderiza no produto dele exibe o nome da lib. A lib é infraestrutura invisível, não uma marca estampada.
- **Neutro ou do consumidor, nunca da lib:** fallback = marca/`systemName` do consumidor quando existir, senão um rótulo **genérico de função** (ex.: "Sistema", "Busca") — jamais `'Sarak …'`.
- **Não quebrar a UI:** neutralizar o texto, nunca deixar um heading vazio/quebrado; onde for rótulo, aceitar override por prop quando fizer sentido.
- **Interno ≠ consumidor-facing:** os painéis do Design Engine (Kitchen Sink, abas de customização) são a ferramenta de autoria da lib — podem citar a lib; entram numa **allowlist** explícita, não são varridos.

# 2. Estado atual (confirmado no código — não re-descobrir)
Ocorrências de marca da lib em componentes **consumidor-facing** (fora de comentário/teste):
- [`SarakEmptyState.tsx:39`](../../src/components/atomic/Feedback/SarakEmptyState.tsx): `{systemName || 'Sarak Lib'}` — fallback nomeia a lib (regressão da 47: era `'Sarak OS'`).
- [`SarakEmptyState.tsx:111`](../../src/components/atomic/Feedback/SarakEmptyState.tsx): `Sarak Lib Core Engine` — **hardcoded**, sempre visível.
- [`SarakSearch.tsx:131`](../../src/components/atomic/Inputs/SarakSearch.tsx): `Sarak Lib Search Engine` — **hardcoded**.
- [`ChatHeader.tsx:20`](../../src/components/atomic/Templates/Chat/ChatHeader.tsx): `Agnostic Interface • Sarak Lib Engine` — **hardcoded**.
- [`SarakChat.tsx:21`](../../src/components/atomic/Templates/SarakChat.tsx): `label = 'Sarak AI Chat Lab'` — default de prop (sobrescrevível, mas o default nomeia a lib).
- **OK, NÃO mexer:** [`SidebarNav.tsx:107`](../../src/core/Shell/Components/SidebarNav.tsx) `{systemName || brand.name}` — já cai na marca do **consumidor**, sem nomear a lib.
- **Fora de escopo (allowlist — interno do Design Engine):** `KitchenSinkPreview` ("Sarak OS Kitchen Sink"), `LanguageTab`/`LayoutTab` (texto "Sarak OS") — ferramenta de autoria da lib, não embutida pelo consumidor.

# 3. Regras de Negócio (Solução) — LADO DA LIB

## L1. Neutralizar cada string de marca (consumidor-facing)
- Para cada ocorrência da §2 (exceto `SidebarNav`, já correto): decidir deterministicamente — (a) há fonte do consumidor (`systemName`/`brand.name`)? → cai nela; senão (b) rótulo **genérico de função** (nunca `'Sarak …'`). Headings puramente decorativos que só nomeavam a lib → neutralizar (rótulo genérico) ou remover o nome; onde for prop `label`, o **default** vira neutro (segue sobrescrevível). Cada decisão registrada.
- Nada de heading vazio/quebrado; a UI continua coerente.

## L2. Gate anti-regressão (zero-marca)
- Um gate (script/teste, família `barrel:check`/`catalog:check`) que **falha o build** se um componente **consumidor-facing** renderizar um literal de marca da lib (`Sarak Lib`, `Sarak OS`, `Sarak AI`, etc. como TEXTO de saída), com **allowlist** explícita e comentada para os painéis internos do Design Engine (§2). Impede o carimbo de marca de voltar em silêncio.

## L3. Nota de migração + handoff p/ a Spec 50
- Registrar em `docs/migracoes.md` que esses rótulos decorativos mudaram (efeito visível pequeno). A Spec 50 (kit) não deve documentar/mostrar componentes estampando a marca da lib — handoff para a 50 (que roda depois).

## Gates da lib
`catalog:check`; `barrel:check`; o **gate novo da L2**; `npm run build` (DTS); **suíte COMPLETA** `npx vitest run` (snapshots afetados de `SarakEmptyState`/`SarakSearch`/chat revisados); `package:check`; `run_audit.mjs` no **baseline**.

# 4. LADO DO ERP — herança (zero)
- Nenhuma mudança no ERP. Uma vez que a lib pare de estampar a marca, os componentes que o ERP usa (ex.: estados vazios, busca) deixam de exibir `'Sarak Lib'`. Reinstalar o `file:` no store do pnpm para o `dist/` novo refletir.

# 5. Critérios de Aceite
- [ ] **L1:** nenhuma das ocorrências da §2 (exceto `SidebarNav`) renderiza a marca da lib; cada uma cai na fonte do consumidor ou num rótulo genérico; sem heading vazio/quebrado. Decisões registradas.
- [ ] **L2:** gate zero-marca verde; falha se um literal de marca voltar num componente consumidor-facing; allowlist dos painéis internos comentada.
- [ ] **L3:** nota em `docs/migracoes.md`; handoff p/ a Spec 50.
- [ ] Grep: `Sarak Lib`/`Sarak OS`/`Sarak AI` como TEXTO renderizado em componentes consumidor-facing = **0** (allowlist à parte). Gates da lib verdes; entrada no `00-progresso.md`.

# 6. Validação prática (dono, browser)
- Renderizar `SarakEmptyState`, `SarakSearch` e o chat no produto: **nenhum texto "Sarak Lib"/"Sarak OS"** aparece; os componentes seguem coerentes e tematizados.

# 7. Fronteiras (não fazer)
- Não mexer na identidade da PÁGINA (título/favicon — Spec 47, feito) nem no `SidebarNav` (já correto).
- Não varrer os painéis internos do Design Engine (allowlist) — são a ferramenta de autoria da lib.
- Não deixar rótulo vazio/quebrado; não remover a capacidade de o consumidor rotular (props seguem).
- Não host/mono-SPA; não fazer deploy; não commitar sem autorização.
