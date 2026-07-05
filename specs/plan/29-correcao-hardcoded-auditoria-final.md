---
tipo: "spec"
titulo: "Correção de Hardcode — Auditoria Final e Fechamento"
dominio: "Design Engine / Desengessamento (Sarak UI Core)"
status: "🟢 Concluída"
prioridade: "Alta"
tags: ["spec", "hardcoded", "desengessamento", "auditoria", "fechamento"]
relacionados: ["20-correcao-hardcoded-base", "07-agente-llm-design-e-expansao-estrutural"]
---

# 1. Contexto (Leitura Obrigatória)
> **Leia a [[20-correcao-hardcoded-base]].** Esta é a **etapa final** da campanha: não corrige domínio específico — **verifica e fecha**. Só executa após as specs 21–28.

# 2. Escopo & Meta
**Meta:** confirmar que a Metade B está concluída — **0 violações duras** e valor reduzido ao alvo (só hairlines tolerados) — e marcar a Seção 3 da spec [[07-agente-llm-design-e-expansao-estrutural]] como concluída.

# 3. Instruções Detalhadas
1. **Auditoria completa:** rode `node .agents/skills/ui-auditoria-modulo/scripts/run_audit.mjs` (suite inteira).
2. **Reconciliação global** no `auditor_hardcoded.mjs`:
   - Violações **duras = 0**.
   - Valor `px/rem/em` = somente hairlines tolerados.
   - Baldes deduzidos (ícones / `w-full,h-full` / alinhamento) **estáveis ou menores** que o baseline inicial da campanha.
3. **Varredura de regressão:** os 6 demais auditores verdes (TypeScript/Zero-Any, Paridade, CleanCode, Coverage, Arquitetura, Manifesto).
4. **Decisão de política pendente:** registrar a decisão final sobre o escopo dos `Templates/` e eventual tratamento do alinhamento macro.
5. **Fechamento:** atualizar a spec 07 (§3 Fase 4 e §4 critérios) marcando o desengessamento concluído.

# 4. Checklist de Validação (Gate Final)
- [x] `auditor_hardcoded.mjs`: **0 violações duras** (Estrutural líquido).
- [x] `auditor_ghostvars.mjs`: **0 variáveis-fantasma** (allowlist vazia).
- [x] Valor `px/rem/em`: somente hairlines tolerados (42 restantes, todos classificados — ver §4a).
- [x] Baldes deduzidos estáveis/menores vs. baseline inicial da campanha.
- [x] `run_audit.mjs`: os 7 auditores verdes (hardcoded é o 8º, tratado à parte por não ter meta "zero" no bucket Valor).
- [x] Spec 07 atualizada (§3/§4) com o desengessamento concluído.

## 4a. Decisão de Política Pendente (registrada nesta execução)
1. **Grids responsivas de `Templates/` + `CalendarPanel` (16 violações Estruturais):** decisão = **corrigir de verdade**, não carve-out. `useStructuralStyles.ts` ganhou presets nomeados (`RESPONSIVE_GRID_PRESETS`: `cardsStandard`/`catalogStandard`/`statsStandard`, `RESPONSIVE_SPACING_PRESETS`: `expandableCardBody`/`expandableCardHeader`), extraídos para `useStructuralStyles.presets.ts` (mantém o hook principal abaixo do limiar de Clean Code). `SarakCardGrid`/`SarakCatalogGrid`/`SarakStats`/`ExpandableCard` agora chamam o hook; `CalendarPanel` (componente `internal/` deliberadamente independente do `SarakUIProvider`) usa `gridTemplateColumns` inline direto, sem o hook, para não acoplar ao provider.
2. **Cores de marca do `SocialButton` (4 hex do logo Google):** decisão = **exceção de política documentada**, sem tokenizar — identidade visual de terceiro, fora do sistema de tokens do Design Engine.
3. **Demais 38 itens do bucket Valor:** classificados como hairlines tolerados (bordas/divisores/indicadores ≤2px), 1 falso-positivo já documentado na spec 27 (`SarakDrawer.tsx:77`) e 5 fixtures de teste E2E fora de escopo (precedente spec 28).

## 4b. Fixes reais aplicados (além da reconciliação de política)
- Token novo `presetCardShadowSpread` (`--sarak-preset-card-shadow-spread`, schema `cards.ts`) substituiu o `-2px` cru do box-shadow duplicado em `CardsCatalog.tsx`/`PresetCard.tsx`. Aplicado via `calc(var(--sarak-preset-card-shadow-spread, 2px) * -1)` — não `var(--x, -2px)` direto, porque o `sanitizeFallbacks()` do próprio auditor não aceita sinal negativo no fallback (`[0-9.]+` sem `-?`), achado confirmado durante a execução.
- `SarakVisualEngine.tsx` (padrão `factory-floor`): os dois stops `1px` do `linear-gradient` passaram a reusar o token já existente `dotGridDotSize` (`--sarak-dot-grid-dot-size`, spec 27) em vez de criar token novo.

# 5. Snapshot Inicial (baseline consolidado da campanha — capturado no início desta execução)
| Métrica | Valor |
|---|---:|
| Duras — total do módulo | 16 (Estrutural líquido; ~519 no início da campanha, specs 21-25 já haviam zerado quase tudo) |
| Valor px/rem/em — total | 48 (~273 no início da campanha) |
| Deduzido — ícones (w-N/h-N) | 190 |
| Deduzido — w-full/h-full | 84 |
| Deduzido — alinhamento | 239 |

# 6. Snapshot Final
| Métrica | Início campanha | Início spec 29 | Fim | Δ (spec 29) |
|---|---:|---:|---:|---:|
| Duras — total do módulo | ~519 | 16 | **0** | -16 |
| Valor px/rem/em — total | ~273 | 48 | **42** | -6 |
| Deduzido — ícones | — | 190 | 190 | 0 |
| Deduzido — w-full/h-full | — | 84 | 84 | 0 |
| Deduzido — alinhamento | — | 239 | 239 | 0 |

# 7. Critérios de Aceite
- [x] Suite `run_audit.mjs` 100% verde (7 auditores auxiliares + manifesto).
- [x] 0 violações duras (Estrutural líquido) confirmado e registrado.
- [x] Spec 07 marcada como Metade B concluída.
