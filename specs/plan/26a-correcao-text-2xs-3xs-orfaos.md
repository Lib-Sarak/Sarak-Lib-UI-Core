---
tipo: "spec"
titulo: "Correção de Bug — text-2xs/text-3xs sem definição real (Débito Pré-Existente)"
dominio: "Design Engine / Desengessamento (Sarak UI Core)"
status: "🟢 Vigente"
prioridade: "Média"
tags: ["spec", "hardcoded", "valor", "typescale", "bug", "correcao"]
relacionados: ["26-correcao-hardcoded-valor-typescale-tracking", "20-correcao-hardcoded-base", "04-paridade-cinco-camadas"]
---

# 1. Contexto (Leitura Obrigatória)
Achado durante a análise da spec [[26-correcao-hardcoded-valor-typescale-tracking]]: as classes utilitárias `text-2xs` e `text-3xs`, usadas em **~60 arquivos** do módulo (átomos e features), **não têm nenhuma definição real no Tailwind**. Não existe `--text-2xs`/`--text-3xs` no bloco `@theme` (`src/styles/_theme.css`) nem em nenhum outro arquivo CSS do projeto, e o CSS compilado (`dist/sarak.css`) confirma **zero ocorrências** de `.text-2xs`/`.text-3xs`. Hoje essas classes são **no-ops silenciosos** — não aplicam nenhum `font-size`, deixando o texto no tamanho herdado do elemento pai.

Isto é um **débito pré-existente**, não introduzido pela campanha de hardcode, e está **fora do escopo literal da spec 26** (que trata apenas de `text-[Npx]`/`tracking-[Nem]` arbitrários em colchetes). Por decisão explícita do usuário, vira uma spec própria em vez de inflar o escopo da 26 ou ser corrigido silenciosamente.

> **Atenção:** corrigir isto **muda o comportamento visual** de ~60 arquivos (texto que hoje renderiza no tamanho herdado passa a renderizar no tamanho correto pretendido) — é correção de bug, não refactor que preserva 1:1. Por isso este documento exige HITL explícito no valor antes de propagar.

# 2. Escopo & Meta
**Meta:** decidir e aplicar uma definição real para `text-2xs`/`text-3xs` (via `@theme` em `src/styles/_theme.css`, com token real `--sarak-*`/`--theme-*` + fallback — **nunca `--sx-*`**), reaproveitando os mesmos tokens de type-scale que a spec 26 for criar (evitar dois sistemas paralelos de tamanho de fonte).

**Natureza:** correção de bug + Expansão (o valor final entra nas 5 camadas de paridade, mesmo fluxo da spec 26).

# 3. Instruções Detalhadas
1. **Levantamento:** confirmar via `grep`/inspeção visual os ~60 arquivos que usam `text-2xs`/`text-3xs` e o tamanho que cada um pressupõe pelo contexto (rótulos, badges, timestamps, legendas).
2. **Decidir o valor (HITL obrigatório):** propor um `font-size` para `2xs` e para `3xs` — idealmente os mesmos valores/tokens que a spec 26 consolidar para a escala de 7–12px — e **aprovar com o usuário antes de aplicar**, pois muda a aparência renderizada em produção.
3. **Definir o token real:** adicionar `--text-2xs`/`--text-3xs` ao bloco `@theme` de `src/styles/_theme.css`, apontando para a variável Sarak real (`var(--sarak-typescale-*, <valor>)`) — reaproveitar o token da spec 26 se cobrir o mesmo valor; senão, seguir as 5 camadas (Schema/MasterMap/Banco/Motor/Catálogo) via `ui-novo-componente`.
4. **Verificar:** rodar a suíte de testes completa (`vitest run`) e inspecionar visualmente uma amostra representativa (Cards, Feedback, Templates) para confirmar que o novo tamanho não quebra truncamento/overflow em nenhum layout existente.
5. **Conferência:** `auditor_ghostvars.mjs` (0 fantasmas). Este achado não altera a contagem do `auditor_hardcoded.mjs` (ele não varre classes sem correspondência de tema), então não há snapshot Antes/Depois de "duras" aqui — só o registro do comportamento corrigido.

# 4. Checklist de Validação
- [x] **V1** — `--text-2xs`/`--text-3xs` definidos no `@theme` e resolvendo para um valor real. Confirmado no CSS compilado: `.text-2xs{font-size:var(--text-2xs)}` / `.text-3xs{font-size:var(--text-3xs)}` (antes: zero ocorrências em `dist/sarak.css`).
- [x] **V2** — Nenhum token novo usa `--sx-*` (reaproveitou `--sarak-type-scale2xs`/`--sarak-type-scale3xs` da spec 26, ambos já validados).
- [x] **V3** — `auditor_ghostvars.mjs` = 0.
- [x] **V4** — `run_audit.mjs`: 7 dos 8 auditores verdes (mesmo padrão das specs 21-26); Paridade segue em 322 tokens (nenhum token novo — reaproveitou os da spec 26, então não há nova entrada nas 5 camadas para esta spec).
- [~] **V5** — Testes verdes (23 arquivos / 32 testes na amostra Cards/Feedback/Templates, sem quebra). **Inspeção visual não realizada** — este ambiente não tem navegador/Storybook disponível para renderizar e conferir overflow/truncamento de verdade; os testes automatizados (jsdom) não processam o CSS compilado, então não capturam a mudança de tamanho. Recomenda-se ao usuário abrir o Canvas/Storybook do projeto e checar visualmente uma amostra (Cards, Feedback, Templates) antes de publicar.
- [x] **V6** — Valor de `2xs`/`3xs` aprovado via HITL (reaproveitar typeScale3xs=9px/typeScale2xs=10px da spec 26) antes de aplicar.

# 5. Critérios de Aceite
- [x] `.text-2xs`/`.text-3xs` aplicam um `font-size` real no CSS compilado (`dist/sarak.css`).
- [x] Valor aprovado pelo usuário (HITL) antes da aplicação.
- [~] Nenhuma regressão visual nos ~60 arquivos consumidores — testes automatizados verdes; **amostragem visual pendente de conferência humana** (ambiente sem navegador).
- [x] Checklist V1–V6 marcado (V5 com ressalva de verificação visual pendente).

# 6. Notas de Execução
- Implementação mínima: apenas 2 linhas em `src/styles/_theme.css` (`--text-3xs: var(--sarak-type-scale3xs, 9px)`, `--text-2xs: var(--sarak-type-scale2xs, 10px)`), reaproveitando os tokens já criados/aprovados na spec 26 — nenhuma camada de paridade precisou de token novo.
- Rebuild de `dist/sarak.css` via `npm run build:css` para confirmar a regra real gerada.
- **Pendência explícita:** a verificação visual pedida no §3.4 não pôde ser feita neste ambiente (sem navegador/Storybook). Antes de considerar esta correção 100% fechada em produção, o usuário deve abrir uma amostra representativa (algum Card com badge, algum rótulo de Feedback) e confirmar visualmente que o texto que antes ficava no tamanho herdado agora aparece no tamanho correto, sem cortar/quebrar layout.
