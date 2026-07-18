---
tipo: "spec"
titulo: "Tokens Semânticos e Validação de Valores no Manifesto"
dominio: "Manifest Engine / Átomos Estruturais / Catálogo"
status: "🟢 Concluída"
prioridade: "Máxima"
tags: ["spec", "tokens", "manifest", "dx", "catalogo"]
relacionados: ["11-engine-declarativa-e-manifestos", "00-manifesto-arquitetural-ui-core"]
---

# 1. Visão Geral e Descrição do Problema

A lib é um renderizador genérico: o manifesto JSON descreve telas e os átomos traduzem props em CSS. Hoje há um **bug silencioso de tradução** e uma **lacuna de documentação de valores** que, somados, produzem "telas mal montadas" em qualquer consumidor:

1. **Bug:** `SarakFlex.gap` (e o mesmo padrão em Grid/FormGroup) joga a string do manifesto **crua no CSS**. Em `src/components/atomic/hooks/useStructuralStyles.ts` (função `getFlexStyles`, ~linha 70): `const gap = gapOverride || design?.layoutGap || 'var(--sarak-layout-gap-md, 16px)'` → `style: { gap }`. O padrão ensinado pelas skills e usado no template oficial (`"gap": "spacing-md"`) vira `gap: spacing-md` — **CSS inválido, descartado em silêncio pelo browser**. Todos os espaçamentos declarados em manifestos nunca aplicaram.
2. **Lacuna:** o catálogo gerado (`docs/manifest-catalog.md`) documenta props e tipos, mas **não documenta VALORES permitidos** (tokens de spacing, variants de tipografia/botão, vars CSS reais). Sem lista, agentes consumidores inventam tokens plausíveis (`spacing-xs`, `--sarak-color-border`, `--sarak-color-surface`, `variant: "h4"`) que não existem — e nada valida nem avisa.

Evidência real (teste ERP): manifesto gerado por agente usou os 4 tokens inventados acima; resultado foi tela sem espaçamento, sem bordas e sem hierarquia tipográfica, sem nenhum warning.

# 2. Regras de Negócio (Solução)

## 2.1 Resolutor oficial de tokens semânticos
- Criar um módulo puro `src/core/Manifest/Tokens/resolveToken.ts` (nome sugerido) com o mapa oficial:
  - `spacing-xs|sm|md|lg|xl` → `calc(var(--sarak-layout-gap-sm, 8px) * 0.5)` / `var(--sarak-layout-gap-sm, 8px)` / `var(--sarak-layout-gap-md, 16px)` / `var(--sarak-layout-gap-lg, 24px)` / `calc(var(--sarak-layout-gap-lg, 24px) * 1.5)` (valores exatos a confirmar contra os tokens reais emitidos por `src/core/Provider/manifest.ts`).
- Regras de resolução (nesta ordem): token semântico conhecido → traduz; string começando com `var(`, `calc(` ou valor CSS de comprimento válido (`px|rem|em|%|vh|vw` ou `0`) → passa direto; **qualquer outro valor → `console.warn` com o valor recebido, o átomo, e a lista de tokens válidos** + fallback para o default do Design Engine.
- Aplicar o resolutor em TODOS os pontos onde átomos estruturais aceitam medida vinda de prop: `getFlexStyles`, `getGridStyles`, `getFormGroupStyles`, `getResponsiveStackStyles` (todas em `useStructuralStyles.ts`) e quaisquer outros átomos que recebam `gap`/`padding` como prop string (auditar via catálogo).

## 2.2 Catálogo passa a documentar VALORES
- `scripts/generate-manifest-catalog.mjs` ganha uma seção **"Tokens e valores permitidos"**, gerada do código:
  - tokens semânticos de spacing (extraídos do mapa do resolutor — fonte única);
  - uniões literais já extraídas por AST (variants de `SarakButton`, `SarakTypography` etc.) — hoje já saem na tabela de props; adicionar destaque na seção de tokens;
  - lista das CSS vars públicas reais (extrair as chaves `vars:` de `src/core/Provider/manifest.ts` — ex.: `--sarak-layout-gap-md`, `--sarak-card-border-color`, `--sarak-topbar-bg`) com a instrução "sempre com fallback: `var(--x, valor)`".
- Regenerar `docs/manifest-catalog.{json,md}` (o `catalog:check` no build já cobra sincronismo).

## 2.3 Correção dos templates e gate anti-regressão
- Corrigir `templates/app-starter.manifest.json` (e o export `SARAK_STARTER_MANIFEST`): manter `"gap": "spacing-md"` etc. **apenas se** o resolutor os traduzir (após 2.1 eles passam a ser válidos — essa é a direção preferida: o template continua semântico).
- Novo teste-gate (junto de `src/core/Manifest/__tests__/StarterManifest.test.tsx`): percorrer todos os valores de `gap`/`padding`/`style` dos templates embarcados e falhar se algum não for resolvível pelo resolutor nem CSS válido.

# 3. Critérios de Aceite
- [x] `"gap": "spacing-md"` num manifesto produz `gap: var(--sarak-layout-gap-md, 16px)` real no DOM.
- [x] Valor inventado (ex.: `"banana"`, `"spacing-xxl"`) gera `console.warn` com sugestão e cai no default — a tela continua montada.
- [x] `docs/manifest-catalog.md` lista os tokens de spacing, as uniões de variants e as CSS vars públicas.
- [x] Gate de tokens dos templates verde; suítes existentes de Layouts/Manifest verdes.

# 4. Plano de Testes (Quality Gate)
## Unitários
- [x] resolveToken: cada token semântico → var esperada; `var(...)`/`16px`/`0` → passthrough; inválido → warn + fallback. (`src/core/Manifest/Tokens/__tests__/resolveToken.test.ts`)
- [x] SarakFlex com `gap="spacing-md"` → style.gap contém `--sarak-layout-gap-md` (renderização real via testing-library). (`src/components/atomic/Layouts/__tests__/SarakFlex.test.tsx`)
## Contrato
- [x] Catálogo regenerado contém a seção de tokens (check via `catalog:check`).
## E2E/Integração
- [x] Gate de tokens dos templates embarcados: toda medida de `gap`/`padding`/`style` é resolvível ou CSS válido. (`src/core/Manifest/__tests__/TemplateTokens.test.tsx` — substitui o teste de `getComputedStyle`, inviável no jsdom, que não computa `var()`.)
