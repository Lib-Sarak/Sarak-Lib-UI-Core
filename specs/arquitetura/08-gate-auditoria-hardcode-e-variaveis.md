---
tipo: "arquitetura"
titulo: "Gate de Auditoria de Hardcode e Variáveis-Fantasma"
dominio: "Design Engine (Sarak UI Core)"
status: "🟢 Vigente"
tags: ["arquitetura", "auditoria", "hardcode", "design-tokens", "gate", "quality"]
relacionados: ["01-arquitetura-motor-tema-design-engine", "04-paridade-cinco-camadas"]
---

# 1. Propósito
Consolida como padrão permanente os dois gates automatizados que protegem a Sarak-Lib-UI-Core contra a reintrodução de dois defeitos estruturais já erradicados da base: **hardcode geométrico/de valor** (Tailwind/CSS chumbado) e **variáveis-fantasma** (`var(--x)` consumido sem fonte emissora real). Qualquer refactor estrutural futuro nos componentes atômicos deve satisfazer os dois gates descritos aqui antes de ser considerado concluído.

# 2. Stack e Ferramentas
- `scripts/auditor_hardcoded.mjs` — detector AST de hardcode (valor + estrutural), registrado em `run_audit.mjs`.
- `scripts/auditor_ghostvars.mjs` — detector de variáveis-fantasma, cruza todo `var(--x)` consumido contra o registro real de variáveis emitidas (`useDesignVariables.ts`, schemas via `cssVars`, aliases de `src/styles/*.css`).
- Hooks Controladores da Camada 6 (`useStructuralStyles` + hooks de domínio) como destino de migração de todo hardcode estrutural.

# 3. Gate 1 — Hardcode (`auditor_hardcoded.mjs`)

## 3.1 Taxonomia dos 3 baldes
- **Corrigir / duro (reprova):** espaçamento (`p`/`m`/`gap`), direção (`flex-col`/`flex-row`), grid, e valores `px`/`rem`/`em` arbitrários. Devem migrar para os Hooks Controladores e para variáveis reais da engine (`--sarak-*`/`--theme-*`, sempre com fallback).
- **Tolerado (não reprova, permanente):** hairlines ≤2px (bordas, offsets de sombra, indicadores), incluindo variantes negativas.
- **Deduzido (não reprova, permanente):** proporções de ícone (`w-N`/`h-N`), `w-full`/`h-full`, classes de alinhamento (`items-*`/`justify-*`).

## 3.2 Exceções de política permanentes
- **Cores de marca de terceiro:** logos oficiais (ex. `SocialButton.tsx`, hex do Google) ficam fora do sistema de tokens por definição — identidade de terceiro não é tokenizável.
- **Grids sem token 1:1:** quando uma malha responsiva não tem equivalente direto no catálogo, o mecanismo correto é um **preset nomeado** no hook (`RESPONSIVE_GRID_PRESETS`, `RESPONSIVE_SPACING_PRESETS` em `useStructuralStyles.presets.ts`), nunca um carve-out permanente de exceção do auditor.
- **Componentes `internal/` desacoplados do `SarakUIProvider`** (ex. `CalendarPanel`) podem usar valores estruturais inline diretamente — são deliberadamente independentes da árvore de tema.

## 3.3 Known limitations do detector (não corrigir o código para contorná-las — documentar)
- Classes Tailwind definidas numa `const` separada e interpoladas via **template literal** no JSX não são flagradas (blind spot AST).
- Uma `const` com **string literal simples** (não template literal) É flagrada normalmente.
- Sintaxe Tailwind com `_` (underscore) no lugar de espaço em valores arbitrários de shadow não é flagrada (regex não distingue `_` de dígito).
- `sanitizeFallbacks()` do auditor não aceita sinal negativo no fallback (`var(--token, -2px)` quebra a extração) — convenção adotada: `calc(var(--token, <valor-positivo>) * -1)`.

# 4. Gate 2 — Variáveis-Fantasma (`auditor_ghostvars.mjs`)

## 4.1 Regra permanente
O namespace **`--sx-*` é proibido** em qualquer camada (TS, CSS, dist) — não é emitido por nenhuma fonte real da engine. Toda variável CSS consumida deve ser `--sarak-*` ou `--theme-*`, **sempre com fallback**, e deve ter uma fonte emissora real (`useDesignVariables.ts`, schema `cssVars`, ou alias de `src/styles/*.css`).

## 4.2 Regra de ordem de correção ("Raiz primeiro")
Ao corrigir um consumo fantasma compartilhado por múltiplos componentes, a fonte compartilhada (ex. hook controlador) deve ser corrigida **antes** dos consumidores individuais — evita re-trabalho e re-migração.

## 4.3 Critério de aceite permanente
Qualquer PR que toque estilos de componentes atômicos deve manter `auditor_ghostvars.mjs` = 0 consumos fantasma.

# 5. Critérios de Aceite (permanentes, para todo refactor estrutural futuro)
- [x] `auditor_hardcoded.mjs`: 0 violações duras (Corrigir), balde Tolerado/Deduzido só contém itens da taxonomia da Seção 3.
- [x] `auditor_ghostvars.mjs`: 0 consumos de variável sem fonte emissora real.
- [x] Nenhuma variável nova usa o namespace `--sx-*`.
- [x] Suite de testes verde (unitário + snapshot) após a migração.
- [x] Comportamento visual preservado (mudança é refactor 1:1, não redesign) — exceto quando o refactor for explicitamente uma correção de bug visual documentada com HITL.
