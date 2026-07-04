---
tipo: "spec"
titulo: "Erradicação de Variáveis-Fantasma (--sx-*)"
dominio: "Design Engine / Desengessamento (Sarak UI Core)"
status: "🟢 Concluída"
prioridade: "Máxima"
tags: ["spec", "hardcoded", "css-vars", "fantasma", "foundation", "correcao"]
relacionados: ["20-correcao-hardcoded-base", "07-agente-llm-design-e-expansao-estrutural", "04-paridade-cinco-camadas"]
---

# 1. Contexto e Descoberta
Durante a revisão da Spec 22 descobriu-se um bug **sistêmico e silencioso**: os componentes consomem em massa variáveis CSS que **nenhuma fonte da engine emite**. O motor (`useDesignVariables.ts`) só emite `--sarak-<kebabId>` (auto) + os nomes listados em `cssVars` dos schemas (prefixos reais `--sarak-*` / `--theme-*`) + aliases definidos em `src/styles/*.css` (ex.: `--text-main: var(--sarak-text-main, #334155)`). O namespace **`--sx-*` não é definido em lugar algum** (nem TS, nem CSS, nem `dist/`).

**Efeito:** `var(--sx-spacing-md)` / `var(--sx-color-primary-base)` **não resolvem** → o estilo colapsa para o valor herdado/inicial (espaçamento some, cor falha) sem erro visível.

> **Por que isto é prioridade Máxima:** toda a campanha de desengessamento (Specs 21–29) estava migrando hardcodes **para variáveis-fantasma**. Migrar para um alvo quebrado não resolve nada. Esta spec precede a continuação da campanha.

# 2. Diagnóstico (gate: `auditor_ghostvars.mjs`)
Foi criado o auditor `auditor_ghostvars.mjs` (registrado no `run_audit.mjs`) que cruza cada `var(--x)` consumido contra o registro real de variáveis emitidas. Baseline:

| Família | Consumos fantasma |
|---|---:|
| `--sx-*` (cores, spacing, radius) | ~892 |
| `--sarak-*` inventados (ex.: `--sarak-spacing-md`, `--sarak-border-base`) | ~103 |
| `--theme-*` inventados (ex.: `--theme-text`, `--theme-layer`) | ~47 |
| Outros (`--animation-*`, `--heading-*`...) | ~41 |
| **Total** | **~1083** (97 variáveis distintas) |

# 3. Regras de Negócio
- **Regra 1 (Mapear ao real):** cada variável-fantasma deve ser substituída pela **variável real equivalente** emitida pela engine (`--sarak-*` / `--theme-*`) ou pelo alias semântico de `src/styles/*.css`.
- **Regra 2 (Fallback obrigatório):** todo `var(--real, <fallback>)` carrega um fallback igual ao valor atual (rede de segurança; impede recolapso e preserva 1:1).
- **Regra 3 (Sem inventar):** proibido criar novas `--sx-*`/`--sarak-*` soltas. Se um conceito não tem token, é **Expansão 1:1:1:1:1** (skill `ui-novo-componente`).
- **Regra 4 (Raiz primeiro):** corrigir `useStructuralStyles.ts` (emite `--sx-spacing-*` em 7+ pontos) **antes** dos consumidores — é o alvo compartilhado da campanha.

# 4. Plano de Execução (ondas)
1. **Triagem do laudo:** classificar as 97 variáveis em (a) fantasma real → mapear; (b) falso-positivo do detector (var real emitida por caminho não parseado) → adicionar ao allowlist/registro do auditor.
2. **HITL — Tabela de Mapeamento:** propor, para cada família, o destino real + fallback. Aprovação antes de codar. Exemplos a confirmar:
   - `--sx-spacing-md` → `var(--sarak-layout-gap-md, 16px)` (ou `--theme-gap`)
   - `--sx-color-primary-base` → `var(--sarak-color-primary, …)` / `--theme-primary`
   - `--sx-color-text-muted` → `var(--text-muted)` (alias já existente em `_colors.css`)
   - `--sx-radius-md` → token de raio real (`--sarak-*-radius`)
3. **Raiz:** corrigir `useStructuralStyles.ts`.
4. **Sweep:** substituir os consumos, arquivo a arquivo, preservando comportamento (inclui **re-migrar os 12 arquivos da Spec 21**, hoje comitados com fantasma — ver [[21-correcao-hardcoded-espacamento-templates-nucleo]]).
5. **Refino do auditor:** ajustar o registro/allowlist conforme a triagem (item 1) para zero falso-positivo.

# 5. Critérios de Aceite
- [ ] `auditor_ghostvars.mjs` = **0 consumos fantasma** (ou somente allowlist justificada).
- [ ] `useStructuralStyles.ts` sem nenhuma `--sx-*`.
- [ ] Os 12 arquivos da Spec 21 re-migrados para variáveis reais + fallback.
- [ ] `run_audit.mjs` verde (sem regressão nos demais auditores).
- [ ] Verificação **visual** (o auditor não detecta colapso por si só) confirmando 1:1.

# 6. Plano de Testes (Quality Gate)
- **Determinístico:** `node .agents/skills/ui-auditoria-modulo/scripts/auditor_ghostvars.mjs` → exit 0.
- **Suite:** `run_audit.mjs` verde.
- **Visual:** inspeção no Sarak UI Canvas (cores/espaçamentos) antes/depois.

# 7. Pendências de Definição (HITL)
- Tabela de mapeamento `--sx-*`/inventadas → variável real (Seção 4.2).
- Triagem dos ~150 flags `--sarak-*`/`--theme-*`: quais são fantasma real vs. falso-positivo do detector.
