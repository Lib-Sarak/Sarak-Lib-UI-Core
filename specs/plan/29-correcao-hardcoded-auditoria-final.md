---
tipo: "spec"
titulo: "Correção de Hardcode — Auditoria Final e Fechamento"
dominio: "Design Engine / Desengessamento (Sarak UI Core)"
status: "🔴 A Implementar"
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
- [ ] `auditor_hardcoded.mjs`: **0 violações duras**.
- [ ] Valor `px/rem/em`: somente hairlines tolerados.
- [ ] Baldes deduzidos estáveis/menores vs. baseline inicial da campanha.
- [ ] `run_audit.mjs`: os 7 auditores verdes.
- [ ] Spec 07 atualizada (§3/§4) com o desengessamento concluído.

# 5. Snapshot Inicial (baseline consolidado da campanha — preencher ANTES)
| Métrica | Valor |
|---|---:|
| Duras — total do módulo | _(esperado ~519 no início da campanha)_ |
| Valor px/rem/em — total | _(esperado ~273)_ |
| Deduzido — ícones | |
| Deduzido — w-full/h-full | |
| Deduzido — alinhamento | |

# 6. Snapshot Final (preencher DEPOIS)
| Métrica | Início campanha | Fim | Δ |
|---|---:|---:|---:|
| Duras — total do módulo | | **0** | |
| Valor px/rem/em — total | | | |
| Deduzido — ícones | | | |
| Deduzido — w-full/h-full | | | |
| Deduzido — alinhamento | | | |

# 7. Critérios de Aceite
- [ ] Suite `run_audit.mjs` 100% verde.
- [ ] 0 violações duras confirmado e registrado.
- [ ] Spec 07 marcada como Metade B concluída.
