---
tipo: "spec"
titulo: "Correção de Hardcode — Valor: Type-scale e Tracking (Átomos / Expansão)"
dominio: "Design Engine / Desengessamento (Sarak UI Core)"
status: "🟢 Vigente"
prioridade: "Alta"
tags: ["spec", "hardcoded", "valor", "typescale", "expansao", "correcao"]
relacionados: ["20-correcao-hardcoded-base", "07-agente-llm-design-e-expansao-estrutural", "04-paridade-cinco-camadas"]
---

# 1. Contexto (Leitura Obrigatória)
> **Antes de qualquer linha de código, leia a [[20-correcao-hardcoded-base]].** Esta etapa é de **Expansão (paridade 1:1:1:1:1)** — vai **criar tokens**, não apenas rotear para hooks. Leia também `09-expansao-vs-configuracao` e `04-paridade-cinco-camadas`.

Etapa 6: eliminar os **valores arbitrários de tipografia** nos átomos — `text-[Npx]`, `tracking-[Nem]`, `leading-[…]` — criando a escala tipográfica como token.

> **Proibido `--sx-*`** — tokens criados/consumidos devem ser variáveis reais + fallback (`--sarak-*`/`--theme-*`). Ao fim, `auditor_ghostvars.mjs` → **0 fantasmas**.

# 2. Escopo & Meta
**Meta:** zerar os **~64** valores arbitrários de type-scale/tracking/leading em `src/components` (átomos), substituindo por tokens reais da engine (`var(--sarak-*, <valor>)`) — **nunca `--sx-*`**.

**Natureza:** **Expansão** — a maioria não tem token equivalente (`--sx-text-9px` não existe). Cada token novo exige as 5 camadas + **HITL**.

# 3. Instruções Detalhadas
1. **Baseline (ANTES):** rode `auditor_hardcoded.mjs` e preencha o **Snapshot Inicial** (§5).
2. **Consolidar a escala antes de migrar:** levante os tamanhos/trackings distintos usados (ex.: 7/8/9/10px) e proponha um conjunto fechado de tokens de type-scale — **HITL para aprovar** antes de propagar.
3. **Para cada token aprovado:** criar via skill `ui-novo-componente` nas 5 camadas (Schema, MasterMap, `theme_table_mapping.json`, DesignEngine, Catálogo) — **nunca chave órfã**.
4. **Migrar o consumo:** trocar `text-[9px]`/`tracking-[0.3em]` pelo token real criado (`var(--sarak-*, <valor>)`) — **nunca `--sx-*`**.
5. **Verificar verde:** testes + visual (densidade/legibilidade do texto).
6. **Conferência (DEPOIS):** rode `auditor_hardcoded.mjs` **e** `auditor_ghostvars.mjs` (= 0 fantasmas) e preencha o **Snapshot Final** (§6).

# 4. Checklist de Validação (Gate de Coerência — [[20-correcao-hardcoded-base]] §7)
- [x] **V1** — Duras do módulo não aumentaram. (16→16, sem alteração — fora do escopo desta spec)
- [x] **V2** — Nenhum balde deduzido aumentou. (ícones 190→190; w-full/h-full 84→84; alinhamento 239→239)
- [x] **V3** — Valor `px/rem/em` **caiu**: 288→245 no módulo (-43); 0 ocorrências residuais de `text-[Npx]`/`tracking-[Nem]` numérico em `src/components/atomic` (confirmado via varredura — o delta reportado é menor que a contagem manual de 53 porque o auditor agrupa múltiplos valores arbitrários da mesma linha/atributo num só registro).
- [x] **V4** — `run_audit.mjs`: 7 dos 8 auditores verdes (Ghost-Vars/TypeScript/Coverage/Arquitetura/CleanCode/**Paridade**/Manifesto — Paridade confirma 322 tokens nas 3 fontes); `auditor_hardcoded` segue reprovando só por violações fora do escopo (16 duras estruturais residuais + bucket Valor das specs 27/28).
- [x] **V5** — Comportamento preservado (26+19 arquivos de teste verdes nos domínios tocados; 4 snapshots precisaram de regeneração — todas mudanças esperadas de `className`→`style`, sem alteração de valor renderizado).
- [x] **V6** — Token novo respeita paridade 1:1:1:1:1 (11 tokens, `auditor_paridade.mjs` verde); sem componente novo; sem hook novo (migração via `style` inline, mesmo padrão de 22-25).

# 5. Snapshot Inicial (ANTES)
| Métrica | Valor |
|---|---:|
| Type-scale/tracking arbitrários (átomos, contagem manual) | 53 |
| Valor px/rem/em — total módulo | 288 |
| Tokens de type-scale novos | 0 |
| Duras — total do módulo | 16 |

# 6. Snapshot Final (DEPOIS)
| Métrica | Início | Fim | Δ |
|---|---:|---:|---:|
| Type-scale/tracking arbitrários (átomos, contagem manual) | 53 | 0 | -53 |
| Valor px/rem/em — total módulo | 288 | 245 | -43 |
| Tokens de type-scale novos | 0 | 11 | +11 |
| Duras — total do módulo | 16 | 16 | 0 |

# 7. Critérios de Aceite
- [x] 0 type-scale/tracking/leading arbitrários nos átomos.
- [x] Cada token novo presente nas 5 camadas (auditor de Paridade verde — 322 tokens).
- [x] Checklist V1–V6 integralmente marcado.
- [x] Snapshots Inicial e Final preenchidos e anexados.

# 8. Notas de Execução
- **Decisão de escala (HITL):** optou-se por **1 token por valor distinto** (5 tamanhos: 7/8/9/10/12px; 6 trackings: 0.2/0.25/0.3/0.4/0.5/0.8em) em vez de consolidar em passos semânticos — zero risco visual, nenhum valor renderizado mudou.
- **Tokens criados** em `src/core/Design/schema/typography.ts` (`typeScaleMicro/Tiny/3xs/2xs/Caption`, `trackingTight/Snug/Wide/Wider/Widest/Ultra`), registrados em `theme_table_mapping.json` e `catalog/partitions/typography.json`. **MasterMap e o motor (`useDesignVariables.ts`) não precisaram de nenhuma alteração de código** — são genéricos e já derivam `--sarak-<kebab-id>` de qualquer token do schema.
- **Sinergia com a spec 26a:** `typeScale3xs` (9px) e `typeScale2xs` (10px) ficam disponíveis para a 26a reaproveitar diretamente como `--text-3xs`/`--text-2xs` no `@theme`, evitando dois sistemas paralelos de tamanho — decisão final de valor para essas duas classes continua sendo da 26a (HITL próprio).
- **Achado durante a execução:** `Feedback/SarakBadge.tsx` tinha um `text-[10px]` dentro de um objeto `sizeClasses` (const separada) — diferente do que specs anteriores documentaram (auditor não flagra const separada), este caso **foi flagrado** pelo auditor (string literal simples, não template literal com interpolação). Migrado via novo campo `style` desestruturado no componente (`{ ..., style, ...props }`), mesclado com o token antes do spread de `...props` para não ser sobrescrito.
- **1 arquivo (`Inputs/SarakMultiSelect.tsx`) listado no plano não tinha nenhuma ocorrência real** — só classes de cor via `var(...)` já tokenizada (não valor numérico arbitrário); confirmado e removido do escopo efetivo sem alteração.
- **Achado de infraestrutura:** rodar `vitest run` na pasta `Templates` inteira de uma vez causou OOM no worker (mesmo problema já registrado na memória do projeto — "Vitest full-run worker crash"); contornado rodando os arquivos de teste tocados isoladamente.
