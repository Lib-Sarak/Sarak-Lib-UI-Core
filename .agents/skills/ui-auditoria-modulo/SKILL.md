---
name: ui-auditoria-modulo
description: Audita a integridade estrutural do Sarak-Lib-UI-Core. Varre o módulo em busca de quebras de Clean Code, falhas de cobertura (Coverage), violações de camada, tipagens inseguras (any), hardcoded, variáveis-fantasma e paridade de Design Tokens. Use APENAS quando pedirem para auditar a base ou validar um PR. NÃO acione proativamente.
---

# Skill: ui-auditoria-modulo

Auditor Mestre da integridade estrutural do **Sarak-Lib-UI-Core**. A auditoria não é analítica e
sim determinística: ela roda **8 scripts estáticos** (Node.js/AST) contra a base e acusa violações
diretas.

> **Esta skill ORQUESTRA; ela não define regra.** O enunciado de cada regra e o gate que a cobra
> estão em `specs/specs/00-regras-e-invariantes.md`; a leitura da saída de cada gate e a dívida
> item a item estão em `specs/specs/01-gates-e-baseline.md`. Quando esta skill divergir de uma
> spec, **a spec vence**.

## 🚨 A regra que evita a rodada perdida — LEIA ANTES DE RODAR

> **O `run_audit.mjs` NÃO está em zero. Compare com o BASELINE, NUNCA com zero.**

Ele sai com **exit 1** por dívida **conhecida e documentada**. Acusar regressão porque o auditor
saiu vermelho é o erro que este aviso existe para evitar. O baseline versionado é
`.githooks/audit-baseline.json` e está reproduzido em `specs/specs/01-gates-e-baseline.md` e no
Apêndice B de `sarak-dev/GUIA-MANUTENCAO.md`.

Cada número do baseline é o **máximo tolerado**: igual passa; **maior é regressão**; **menor**
significa que alguém pagou dívida — e aí o baseline precisa ser regravado com
`npm run audit:baseline`, **no mesmo commit do conserto que o justificou**, nunca sozinho.

## Os 8 auditores

| Script | O que cobra | Regra |
| --- | --- | --- |
| `auditor_hardcoded.mjs` | `#hex`/`px`/`rem`/`em` soltos + Tailwind estrutural em `atomic/`, com baldes de dedução | R2 |
| `auditor_ghostvars.mjs` | `var(--x)` consumida sem emissor real; namespace `--sx-*` proibido | R7 |
| `auditor_typescript.mjs` | zero `any` na AST de `src/` | R3 |
| `auditor_coverage.mjs` | teste 1:1 ao lado de cada componente/hook | R8 |
| `auditor_arquitetura.mjs` | as três camadas (`components`/`core` não importam de `features`) | R1 |
| `auditor_cleancode.mjs` | ≤250 linhas, zero `else if`, ≤3 hooks de estado, aninhamento ≤2 | R9 |
| `auditor_paridade.mjs` → `verify_parity.ts` | o token existe nas **três** fontes do dicionário | R4 |
| `auditor_presets.mjs` → `verify_presets.ts` | zero chave órfã em tema/preset embarcado | R5 |

*(O antigo `auditor_manifesto` — conferência funcional do motor de renderização por manifesto —
foi removido junto com o motor; ver `specs/adr/002-remocao-motor-manifesto.md`.)*

## Quando usar
- O usuário pediu explicitamente para "auditar as regras" ou "verificar a integridade do módulo".
- Ao revisar um *Pull Request* denso para este repositório.
- Use APENAS sob demanda. NÃO acione proativamente.

## Workflow de Auditoria

### 1. Ler o baseline PRIMEIRO
Abra `specs/specs/01-gates-e-baseline.md` (ou o Apêndice B do `sarak-dev/GUIA-MANUTENCAO.md`) e
carregue os números tolerados **antes** de rodar. Sem isso você não sabe distinguir dívida de
regressão.

### 2. Rodar a auditoria completa
```bash
node .agents/skills/ui-auditoria-modulo/scripts/run_audit.mjs
# equivalente: npm run audit
```
O script agrega as 8 varreduras e imprime o laudo por sub-auditor no stdout. **Exit 1 é o estado
esperado hoje** — o que importa são os números, não o código de saída.

### 3. Comparar, não julgar
Para cada auditor, ponha lado a lado o número medido e o número do baseline. O laudo ao usuário
tem três categorias, e cada achado cai em **uma**:
- **Baseline exato** — nada a fazer.
- **Regressão** (medido > baseline) — é isto que precisa de conserto, e é o único caso que bloqueia.
- **Dívida paga** (medido < baseline) — exige regravar o baseline junto do conserto.

O `auditor_hardcoded` imprime uma **reconciliação** (bruto → deduções → líquido); é o líquido que
se compara, não o bruto.

### 4. Plano de Correção (HITL)
- **PARE.** Apresente ao usuário só o que é **regressão**, com `arquivo:linha`.
- Explique qual regra numerada (R1–R17) cada item quebra.
- Pergunte explicitamente: "⚠️ O laudo apontou **N regressões** (fora as X do baseline conhecido).
  Confirma o início da correção?"

### 5. Correção — só o que foi aprovado
Corrija sequencialmente, e **só** os itens aprovados. Rode a auditoria de novo e mostre que o
número voltou ao baseline.

- **GhostVars:** corrija **migrando para a variável real + fallback** (`var(--sarak-…, <valor>)`).
  Ao corrigir um consumo fantasma **compartilhado**, conserte a fonte comum (o Hook Controlador)
  **antes** dos consumidores individuais — na ordem inversa, cada consumidor é migrado duas vezes.
- **Hardcode:** a saída correta é token ou Hook Controlador — nunca entrada nova na allowlist.
- **Coverage:** crie o teste **ao lado**, em `__tests__/<nome>.test.tsx`.

### 6. Fechamento
Rode também a suíte inteira (`npx vitest run`) — o `run_audit` não a cobre — e informe todos os
números finais comparados ao baseline.

## Regras
- **NUNCA** analise o código visualmente para achar erros. É fisicamente impossível auditar a
  paridade de centenas de chaves e o Clean Code de um sistema inteiro sem rodar o `run_audit.mjs`.
- **NUNCA** espere zero. Ver o aviso no topo.
- **NÃO** altere um arquivo apontado pelo auditor sem passar pelo fluxo HITL.
- **NUNCA afrouxe um auditor:** não relaxe allowlist para mascarar violação real, e **não exclua
  pasta do escopo** para baixar contagem. Gate com escopo menor que a regra deixa a regra violada
  em silêncio — foi assim que três das quatro categorias de engine ficaram fora do barril público
  sem que nada acendesse.
- **NUNCA maquie o número.** Mover código para `.ts`, para uma `const` interpolada ou trocar
  espaço por `_` a fim de escapar do detector é **fraude, não arquitetura**. O critério é o
  propósito, não o resultado numérico.
- **NÃO "aproveite para corrigir" o baseline.** Os itens do baseline são dívida conhecida com rota
  própria; fechá-los é tarefa dedicada, não efeito colateral de uma auditoria.

## Checklist "Auditoria Plena"
- [ ] Leu o baseline **antes** de rodar?
- [ ] Rodou `run_audit.mjs` inteiro (os 8 auditores)?
- [ ] Classificou cada achado em baseline exato / regressão / dívida paga?
- [ ] Fez o alerta HITL pedindo permissão, listando **só as regressões**?
- [ ] Aplicou os fixes aprovados e rodou de novo, provando o retorno ao baseline?
- [ ] Rodou `npx vitest run` **inteiro** ao final?

## Referências (Camada 3)
- `scripts/run_audit.mjs` — agregador dos 8 auditores.
- `scripts/verify_presets.ts` — motor do `auditor_presets` (drift de tema/preset contra o gabarito vivo).
- `.agents/skills/ui-novo-componente/scripts/verify_parity.ts` — motor do `auditor_paridade`
  (as três fontes do dicionário). Mora na skill vizinha; os dois auditores que os invocam vivem aqui.
