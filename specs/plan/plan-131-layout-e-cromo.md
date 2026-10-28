---
tipo: "plan"
titulo: "Dar ao layout ocupação de coluna, abas com rota, densidade de cartão e altura de página"
objetivo: "Fazer a tela do importador se compor sem classe utilitária nem cálculo de altura: SarakGridItem com span por dispositivo, SarakGrid com colunas declarativas, SarakTabs com rota, contador e painel ligado, SarakCard com densidade sm/md/lg e página que ocupa a altura que o cromo deixa"
dominio: "Layout / Cromo"
status: "🟡 Em execução"
prioridade: "Alta"
tags: ["plan", "rc.4", "layout", "cromo", "erp"]
relacionados: ["[[anexos/rc4-contrato]]", "[[05-cromo-e-slots]]", "[[07-responsividade-e-multidispositivo]]", "[[02-design-engine]]"]
depende_de: "plan-128-idioma-unico-e-feedback-rico"
retida_por: ""
destino_sintese: "specs/05-cromo-e-slots.md + specs/07-responsividade-e-multidispositivo.md"
---

# 1. Objetivo

Itens Layout 1–4 do contrato entregues, com `SarakGridItem` e `SarakTabPanel` públicos e a altura de página sem cálculo no importador.

# 2. Contexto

Contrato aceito: [`anexos/rc4-contrato.md`](anexos/rc4-contrato.md) §0 (valor por dispositivo), §1.1, §1.3, §2.7, §4. **Nomes,
tipos e padrões de lá são lei.**

O que a leitura revelou: o formato por dispositivo é `SarakResponsiveValue` (`src/core/Design/types.ts:9`); `SarakGrid`
(`src/components/atomic/Layouts/SarakGrid.tsx`) já aceita `templateColumns` responsivo e colapsa para 1 coluna no celular; o
dispositivo vem de `useSarakDevice()` (`core/Provider/DeviceProvider`), que lê os breakpoints do tema — use-o, porque classe
`@min-[768px]` não lê token (`00-contexto` §8). As classes `col-span-1/2/6/full` são contrato travado por teste (backlog 57, C5 da
`plan-119`) e **continuam**. `SarakTabs` (`src/components/atomic/UX/SarakTabs.tsx`) tem item só com `id`, `label`, `icon`,
`disabled`. `SarakCard` (`src/components/atomic/Cards/SarakCard.tsx`) não tem densidade; só existe `--sarak-card-padding-md`.
O cromo **já** tem `height: 100dvh` (`src/components/Layout/SarakAppChrome.tsx:197`); o `<main>` está em
`src/components/Layout/chrome/ChromeContentRegion.tsx:31`. `SarakAnalyticalPage` usa as variáveis legadas `--border-color` e
`--color-theme-card` (`src/components/Layout/SarakAnalyticalPage.tsx`).

**A demanda 12 do ERP** diz que, sem `height: 100%` em `html/body/#root`, o conteúdo rola a janela sob a topbar. Com o `100dvh`, isso
não deveria acontecer: **meça primeiro** (caso de navegador) e só corrija se reproduzir.

# 3. Escopo

## 3.1 Dentro
- `src/components/atomic/Layouts/` — `SarakGridItem.tsx` (novo, com teste) e `SarakGrid.tsx` (`columns`).
- `src/components/atomic/UX/SarakTabs.tsx` e `SarakTabPanel.tsx` (novo, com teste).
- `src/components/atomic/Cards/SarakCard.tsx` (`density`) e onde o motor emite `--sarak-card-padding-md` (para derivar `-sm`/`-lg`).
- `src/components/Layout/SarakAnalyticalPage.tsx` (`sidePanelWidth`, `fillHeight`, troca das variáveis legadas pelas `--sarak-*`).
- `src/components/Layout/chrome/ChromeContentRegion.tsx` e o CSS do `<main>` (coluna flexível, `min-height: 0`, classe `sarak-fill-height`).
- `browser-tests/` — um caso: página mais alta que a janela, sem a cadeia de altura no host: topbar fixa, rolagem só no `<main>`.
- Registro dos componentes novos onde a skill `ui-novo-componente` manda (paridade e barril).
- `src/core/i18n/catalogEntries.layout.ts` · `src/index.ts` (acréscimo) · `docs/migracoes.md` (uma subseção na `## 8.0.0`).

## 3.2 Fora
- Token novo no schema do painel (os de padding são derivados — contrato §4).
- `SarakAppChrome` além do `<main>`, salvo se a medição do passo 2 reproduzir o defeito (aí o conserto entra, declarado no resumo).
- O guia do kit (é da `plan-119`, lote 8). Arquivos gerados.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Contrato | `specs/plan/anexos/rc4-contrato.md` §0, §1.1, §1.3, §2.7, §4, **§9** | o que entregar e como verificar |
| Spec fixa | `specs/05-cromo-e-slots.md` · `specs/07-responsividade-e-multidispositivo.md` | cromo e regra por dispositivo |
| Spec fixa | `arquitetura/02-design-engine.md` §10 | variável com um dono, reserva igual ao padrão (R41–R43) |
| Spec fixa | `specs/10-seguranca-e-acessibilidade.md` | padrão ARIA de abas e de navegação |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `ui-novo-componente` · `ui-arquitetura-design` | sempre · componente novo com paridade · CSS por token |
| Código | arquivos de §2 | ler antes de editar |

# 5. Instruções de execução

1. Fotografe o worktree.
2. Escreva o caso de navegador da demanda 12 e diga no resumo se reproduz na rc.3. Reproduziu: corrija o cromo e diga onde.
3. `SarakGridItem` e `SarakGrid.columns` (§1.1, §2.7), pelo `useSarakDevice()`; no celular, `span` maior que as colunas vira `full`.
4. `SarakTabs` + `SarakTabPanel` (§1.3, §2.7): sem `href`, padrão `tablist`/`tab`/`tabpanel` com setas; com `href`, `<nav>` de links
   com `aria-current="page"` e `onNavigate` que impede a recarga; `count` dentro do nome acessível.
5. `SarakCard density` e `--sarak-card-padding-sm`/`-lg` derivados do `md`, com um dono só (R42).
6. `SarakAnalyticalPage`: `sidePanelWidth`, `fillHeight`, variáveis legadas trocadas.
7. Subseção em `docs/migracoes.md`; `npm run barrel:check`; `npm run verify -- --tier=quick` uma vez, resumo colado (contrato §9).

# 6. Critérios de aceite

- [ ] `SarakGridItem`: `grid-column` certo em `mob`, `tab` e `desk` (dispositivo simulado) — teste.
- [ ] Abas sem `href`: `aria-controls` ↔ `id` do painel, `aria-labelledby` de volta, setas mudam a aba — teste por papel.
- [ ] Abas com `href`: `role="navigation"`, link com `aria-current="page"`, `onNavigate` chamado e recarga impedida — teste.
- [ ] `SarakCard density="sm"|"lg"` lê `--sarak-card-padding-sm|lg`, e o padrão `md` não muda — teste.
- [ ] Caso de navegador escrito; resultado da rc.3 relatado.
- [ ] `SarakAnalyticalPage` sem `--border-color` nem `--color-theme-card` (grep colado).
- [ ] Sem prop nova, comportamento da rc.3 (testes existentes passam sem alteração).
- [ ] Resumo com a tabela item do contrato → teste.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum — comportamento provado por teste de componente e por um caso de navegador.

- `npx vitest run SarakGrid SarakTabs SarakTabPanel SarakCard SarakAnalyticalPage ChromeContentRegion SarakAppChrome src/core/i18n` — uma vez.
- O caso de navegador roda **no fechamento**, dentro do `cromo-css-real:check` único da campanha (contrato §9); a aprovação desta
  plan fica condicionada a ele.
- Diff lido contra o contrato; `git diff --stat` só com a §3.1. O `quick` do executor é aceito pelo resumo colado.

# 8. Destino da síntese

**Destino:** `specs/05-cromo-e-slots.md` + `specs/07-responsividade-e-multidispositivo.md` — textos prontos:

> **05:** O cromo tem altura própria (`100dvh`) e não depende de `html/body/#root`; o `<main>` é coluna flexível com `min-height: 0`;
> o filho que enche a altura usa `fillHeight` ou `sarak-fill-height`.
>
> **07:** Ocupação de coluna por dispositivo é `SarakGridItem span` (`SarakResponsiveValue`), resolvida pelo `DeviceProvider`; as
> classes `col-span-*` seguem suportadas.

---

# 9. Resumo da execução

---

# 10. Veredito
