---
tipo: "spec"
titulo: "Soberania de identidade do host — título/favicon/marca são do importador, a lib nunca vaza 'Sarak OS'"
dominio: "Provider / Efeitos globais do documento / Identidade / DX do consumidor"
status: "🟢 Executada (2026-07-26) — L1/L2/L3 entregues; gates verdes; falta só a validação de browser do dono (§6)"
prioridade: "Alta"
tags: ["spec", "correcao", "identidade", "branding", "document-title", "favicon", "provider", "vazamento"]
relacionados: ["24-modo-embarcado-adocao-incremental", "44-temas-json-e-persistencia", "48-slots-extensao-layout-chrome", "50-kit-de-uso-do-consumidor"]
---

> **Contexto:** a validação de browser do dono no ERP mostrou que a aba do navegador exibe **"Sarak OS"** — durante o load aparece o `<title>` do `index.html` do importador e, quando o React monta, a lib **sobrescreve** com o próprio brand. Princípio do dono: **a identidade da página (nome da aba, ícone, marca) é SEMPRE responsabilidade do importador** — a lib nunca deve impor a sua. É defeito de lib.

# 1. Visão Geral e Objetivo

Garantir que o `SarakUIProvider`, por padrão (zero-config), **não altera** a identidade da página do host — `document.title`, favicon e strings de marca ficam como o importador definiu (no `index.html` dele). A lib só toca nesses elementos quando o consumidor **explicitamente** pede (via `options.branding`/`systemName`). Fim do default `'Sarak OS'`, que é vazamento da marca da lib para dentro do produto do consumidor.

## 1.1 Princípios
- **O importador é dono da identidade:** título/favicon/marca default = os do host. A lib nunca escreve a própria marca por padrão.
- **Opt-in, não opt-out:** a lib só seta o título/favicon se o consumidor **fornecer** o valor; sem valor, **não toca** no que o host já definiu.
- **Uma fonte de verdade:** um só caminho decide `document.title` (hoje há dois efeitos que podem brigar).
- **Zero regressão do Modo Embarcado:** o Embarcado (Spec 24) já não mexe em título/favicon do host — manter.

# 2. Estado atual (confirmado no código — não re-descobrir)
- [`useBrandingManager.ts:7-12`](../../src/core/Provider/hooks/useBrandingManager.ts): `DEFAULT_BRANDING = { companyName: 'Sarak OS', loginName: 'Acesso ao Sistema', tabName: 'Sarak OS', logoBase64: null }` — o default **carrega a marca da lib**.
- [`useSarakUIEffects.ts:44-45`](../../src/core/Provider/hooks/useSarakUIEffects.ts): em Modo App, `if (branding?.tabName) document.title = branding.tabName`. Como `tabName` default é `'Sarak OS'` (sempre truthy), a lib **sempre sobrescreve** o `<title>` do host. (favicon via `logoBase64` é condicional e default `null` → só toca se o consumidor der — OK, manter o padrão.)
- [`DesignInjector.tsx:82-87`](../../src/core/Provider/components/DesignInjector.tsx): **segundo** setter de `document.title` — `if (s?.systemName) document.title = s.systemName` (condicional). Dois efeitos independentes escrevendo o mesmo `document.title` → podem correr/brigar.
- Modo Embarcado: ambos os setters já pulam quando `mode==='embedded'` (Spec 24). Testes de não-vazamento existem (`EmbeddedMode.test.tsx`).

# 3. Regras de Negócio (Solução) — LADO DA LIB

## L1. Defaults neutros (fim do 'Sarak OS')
- `DEFAULT_BRANDING` deixa de carregar a marca da lib: `tabName` default **`undefined`** (com o guard `if (branding?.tabName)` já existente, isso **preserva o `<title>` do host**); `companyName`/`loginName` default para valor **neutro/genérico** (ou `undefined`), nunca `'Sarak OS'` — a tela de login (`SarakAuthScreen`) não pode exibir a marca da lib.
- O favicon segue condicional (`logoBase64` default `null`): só troca se o consumidor fornecer. Manter.

## L2. Uma fonte de verdade para `document.title`
- Consolidar os dois setters (`useSarakUIEffects` via `branding.tabName` **e** `DesignInjector` via `systemName`) num único caminho, com precedência definida e documentada. Regra: a lib **só** escreve `document.title` se o consumidor forneceu um valor (por qualquer das duas portas); **sem valor fornecido, não escreve nada** — o `<title>` do host permanece. Sem dois `useEffect` disputando.

## L3. Contrato "consumidor é dono da identidade" documentado
- Documentar (catálogo/skill/`docs/`) como o consumidor controla título/favicon/marca (`options.branding.initial.tabName`/`logoBase64`, `systemName`) e que **no Modo App o default é preservar o `<title>` do host**; no Embarcado já é do host. Handoff para a **Spec 50** (kit) incorporar como caso de autoria de "identidade".

## Gates da lib
`catalog:check`; `barrel:check`; `npm run build` (DTS); **suíte COMPLETA** `npx vitest run`; `package:check`; `run_audit.mjs` no **baseline**.

# 4. LADO DO ERP — herança (zero)
- Nenhuma mudança obrigatória no ERP: uma vez que a lib pare de vazar, a aba passa a mostrar o `<title>` do `index.html` de cada `web`. **Opcional:** se o ERP quiser um título controlado por app, passa `options.branding.initial.tabName` — mas é escolha dele, não exigência.

# 5. Critérios de Aceite
- [x] **L1:** nenhum default consumidor-facing carrega `'Sarak OS'` — `DEFAULT_BRANDING` perdeu `companyName` e `tabName` (nascem ausentes); `loginName` mantém `'Acesso ao Sistema'` (rótulo genérico, não é marca). Grep em `src/core`+`src/components` = 0 VALORES (só comentários/testes que documentam a correção); no bundle publicado, `tabName:"Sarak OS"`/`companyName:"Sarak OS"` = **0** — sobra apenas o heading "Sarak OS Kitchen Sink" do painel do Design Engine, a exclusão prevista neste critério.
- [x] **L2:** com **nenhuma** config, o `SarakUIProvider` (Modo App) **NÃO altera** `document.title` nem o favicon — coberto por `__tests__/HostIdentity.test.tsx` (seta título+favicon de host e afirma que sobrevivem à montagem). Fornecendo `tabName`/`systemName`, o título **é** setado por um caminho único (`useSarakUIEffects`), com precedência `tabName > systemName`; o 2º setter saiu do `DesignInjector`.
- [x] **L3:** contrato documentado em `docs/identidade-do-host.md` (shippado no pacote) + nota em `docs/migracoes.md` + regra e referência na skill `ui-integra-consumidor`. Handoff para a Spec 50 já previsto na linha 67 dela e conferido contra o que foi implementado.
- [x] Modo Embarcado sem regressão (`EmbeddedMode.test.tsx` verde; +2 casos de identidade no `HostIdentity.test.tsx`). Gates verdes: `catalog:check`, `barrel:check` (78/0), `build` (DTS 110,42 KB), suíte **273 arq / 808 testes**, `package:check` (56 arq.), `run_audit` no **baseline exato** (2 falhas pré-existentes). Entrada no `00-progresso.md`.

# 6. Validação prática (dono, browser)
- Abrir o ERP (conector + módulos): a aba mostra o **nome do host** (do `index.html`), **nunca "Sarak OS"**, e não "pisca" para a marca da lib depois do load.

# 7. Fronteiras (não fazer)
- Não remover a CAPACIDADE de o consumidor setar título/favicon/marca — só o **default que vaza**.
- Não mexer no comportamento (correto) do Modo Embarcado.
- Não tocar nas fontes globais (`useSarakUIEffects` de fontes) — é comportamento intencional, fora de escopo.
- Não fazer deploy; não commitar sem autorização.
