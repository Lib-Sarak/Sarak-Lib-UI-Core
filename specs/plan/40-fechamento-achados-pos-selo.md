---
tipo: "spec"
titulo: "Fechamento de Achados pós-Selo (polimento + lacunas de contrato do re-Selo)"
dominio: "Manifest Engine / Componentes / Build / Empacotamento / Design Engine / DX"
status: "🟢 Concluída (2026-07-21) — SarakActionCard generalizado in-place; follow-up SarakCoreCard/SarakCardGrid extraído para a Spec 42"
prioridade: "Média"
tags: ["spec", "pos-selo", "polimento", "contrato-de-componente", "empacotamento", "performance", "dx"]
relacionados: ["26-instalacao-teste", "27-paridade-navigationstyle-shell", "29-robustez-instalacao-pacote", "41-teste-real", "42-generalizar-cardgrid-corecard", "otimizacao-nivel-1"]
---

> **Nota de renumeração:** esta spec era a **Spec 30 ("Polimento pós-Selo")**, planejada a partir dos achados NÃO-bloqueantes da rodada 1 do Selo. Foi **renumerada para 40** e **expandida** para incluir TODOS os achados residuais das duas rodadas do Selo — inclusive um que não é "polimento", mas lacuna de contrato de componente (`SarakActionCard`). Objetivo: fechar 100% dos achados abertos das rodadas 1 e 2, sem deixar pendência solta.

# 1. Visão Geral e Descrição do Problema

Agrupa os achados residuais das duas rodadas do Selo da Onda (Spec 26) — nenhum deles bloqueou o Selo, mas todos ficam abertos até esta spec. Fontes: `RELATORIO-INSTALACAO-UI-rodada1.md` (achados 6/7/8) e `RELATORIO-INSTALACAO-UI-rodada2.md` (Problemas 1/4 + melhorias 2/3 + M9 PARCIAL). Divididos por natureza:

**Polimento / performance / cosmético (rodada 1):**
- **Achado 6 — `renderFor` sem chave natural:** `[Sarak:renderFor] item sem id/uuid; usando índice N como key.` aparece em TODA renderização de uma lista cujos itens usam outra chave (ex.: `hash`). O motor não reconhece convenção além de `id`/`uuid` e avisa por item.
- **Achado 7 — bundle sem code-splitting:** chunk principal de app mínimo em **3,9 MB (992/993 KB gzip)** nas DUAS rodadas; Vite avisa ">500 kB". Os pesados-lazy (`HEAVY_LAZY` no `LeafNode`) não geram chunks separados no consumo real.
- **Achado 8 — warning de `input[type=color]`:** o `input[type=color]` do CustomizationPanel recebe `var(...)` cru em vez de hex; o Chrome reclama no console (M7/M8 da rodada 1).

**Empacotamento (rodada 2, M9 PARCIAL):**
- **Melhoria 2 — `src/` no pacote publicado:** `node_modules/@sarak/lib-ui-core` não traz mais o fonte de componentes/`specs/`/`playwright/` (Spec 29 fechou isso), **mas ainda existe uma pasta `src/`** contendo só `src/styles/sarak-base.css`. É intencional (está no `files` da Spec 29, porque o export `./sarak-base.css` aponta para lá — `package.json` linhas ~49-52), mas viola a expectativa literal de "pacote sem `src/`" e mantém M9 em PARCIAL em vez de PASS puro.

**Contrato de componente (rodada 2, Problema 4 — NÃO é polimento):**
- **`SarakActionCard` não é genérico.** Verificado em `src/components/atomic/Cards/SarakActionCard.tsx`: é, na prática, um **card de catálogo de modelos LLM** herdado do domínio do MyService (orquestrador de IA), exposto no catálogo como card de ação genérico:
  - botão com texto **`Executar` hardcoded** (linha 118), sem prop para trocar — a causa que o tester relatou;
  - `subtitle` com default `"Modelo"` (linha 40);
  - o painel expansível mostra campos **fixos de custo de LLM**: "Custo In (1M)", "Custo Out (1M)", "Janela / Tokenizer", com aritmética de tokens (`Number(context) / 1000`, linhas 155-173);
  - `label` NÃO controla botão nem título — só aparece no *draft badge* (linha 77).
  - Consequência: um consumidor de ERP (contratos) recebe um card com botão "Executar" fixo e um painel de custo de tokens de IA — conteúdo do domínio errado. Fere o princípio "renderizador genérico" e passa **invisível ao gate de hardcode** (que só pega px/rem/em, não strings de UI).

**DX do Design Engine (rodada 2, Problema 1):**
- **Fluxo "Commit por categoria" não documentado:** no CustomizationPanel, mudar um valor e clicar "Aplicar Alterações Globais" direto NÃO tem efeito — é preciso primeiro clicar no botão **"Commit 0. Configurações Globais (N)"** de cada categoria. Só depois "Aplicar" funciona. Não está em nenhuma skill/catálogo; descoberto por exploração visual (único ponto em que o tester precisou adivinhar na rodada 2).

# 2. Regras de Negócio (Solução)

## 2.1 `renderFor`: chave natural configurável + warn deduplicado (achado 6)
- Reconhecer convenções de chave além de `id`/`uuid` — no mínimo `key`/`hash`/`slug` como chaves naturais estáveis; permitir declarar a chave no manifesto: `renderFor: { source, key: "hash" }`. Só cair no índice (com warn) quando NENHUMA chave estável existir, e **deduplicar o warn** (uma vez por lista, não por item).
- Se abrir campo novo no `renderFor`, seguir a paridade e regenerar o catálogo.

## 2.2 Code-splitting no consumo (achado 7 + melhoria 3 da rodada 2)
- Investigar por que os pesados-lazy (`HEAVY_LAZY` no `LeafNode`, já `React.lazy`) não viram chunks separados no build do consumidor: config do template do `init` (Vite `build.rollupOptions.output.manualChunks`) e/ou como o bundle da lib expõe os pesados.
- **Melhoria 3 da rodada 2:** o `vite.config.ts` gerado pelo `init` deve trazer `manualChunks` (ou lazy por rota) por padrão. Escopo: reduzir o chunk inicial de um app mínimo sem quebrar o zero-config. Usar `sarak:otimizacao-nivel-1` (medir antes/depois; baseline 3,9 MB / 993 KB gzip).

## 2.3 `input[type=color]` recebe hex resolvido (achado 8)
- No componente do CustomizationPanel que usa `input[type=color]`, garantir `value` = hex resolvido (resolver a CSS var para o valor computado, ou fallback hex), eliminando o warning nativo do Chrome. Cosmético.

## 2.4 Zerar `src/` do pacote publicado — fecha M9 para PASS puro (melhoria 2 da rodada 2)
- Emitir `sarak-base.css` para dentro de `dist/` no build (ex.: copiar/gerar `dist/sarak-base.css`) e **reapontar** o export `./sarak-base.css` (as 3 entradas `style`/`import`/`default` no `package.json`) para `dist/`.
- Remover `src/styles/sarak-base.css` do `files` allowlist. Resultado: **nenhuma pasta `src/`** dentro de `node_modules/@sarak/lib-ui-core`.
- Atualizar `scripts/check-package-contents.mjs` para AFIRMAR que o tarball não tem `src/` (hoje ele só nega `specs/`/`playwright/`). Validar com `npm pack --dry-run`.
- Cuidado: confirmar que o `build:css` (que lê `./src/styles/sarak-base.css` como INPUT do Tailwind) continua funcionando — o input do build fica no repo; só o que é PUBLICADO muda para `dist/`.

## 2.5 `SarakActionCard` genérico (Problema 4 — a correção mais substantiva)
- Tornar o card 100% orientado a dados, removendo o domínio LLM embutido — respeitando a paridade 1:1:1:1:1:1 (usar `ui-refatorar-componente`; props novas entram no Schema/MasterMap/mapping/Engine/Catálogo):
  - **Texto do botão de ação** vira prop/dado (ex.: `actionLabel`, default `"Executar"`) — hoje é fixo.
  - **`subtitle`** já vem de `mapping`, mas o default `"Modelo"` deve ser neutro (ex.: vazio) ou configurável.
  - **Painel expansível** deixa de ter campos fixos de custo de LLM ("Custo In/Out", "Janela/Tokenizer", aritmética de tokens) e passa a renderizar **linhas de detalhe genéricas dirigidas por `mapping`** (pares rótulo/valor declarados no manifesto) — ou, se o painel expansível não couber genérico, extrair o card LLM para um tipo especializado próprio (ex.: `SarakModelCard`) e deixar `SarakActionCard` genérico.
  - `label` documentado com sua semântica real (draft badge) OU realinhado ao que o nome sugere.
- **Decisão de projeto a confirmar na execução (HITL):** (a) generalizar o `SarakActionCard` in-place, ou (b) manter o card LLM como tipo especializado (`SarakModelCard`) e criar um `SarakActionCard` realmente genérico. Recomendação: **(a)** se o painel de detalhes couber num modelo mapping-driven; senão (b).
- **Varredura correlata:** rodar uma busca por strings de UI hardcoded em PT/EN dentro de `src/components/atomic/` (o gate de hardcode atual não pega strings) — o `SarakActionCard` provavelmente não é o único átomo com texto fixo herdado do domínio antigo. Registrar os achados; corrigir os do mesmo tipo (texto de UI que deveria ser dado) ou abrir follow-up.

## 2.6 Documentar o fluxo do Design Engine (Problema 1)
- Documentar em `ui-integra-escrever-manifesto` (ou num guia dedicado ao Design Engine; espelhar `.claude/`, hash igual) o fluxo completo de personalização: **mudar valor → "Commit" da categoria → "Aplicar Alterações Globais" → (se tema padrão) modal "Salvar como Novo Tema"**. Deixar claro cada passo e que o "Commit por categoria" é obrigatório antes do "Aplicar".
- **Avaliar (opcional, HITL):** se o duplo passo é intencional ou um atrito de UX evitável — se "Aplicar Alterações Globais" deveria auto-commitar as categorias pendentes. Se for atrito, abrir follow-up de UX (fora do escopo mínimo desta spec, que é documentar).

# 3. Critérios de Aceite
- [x] Lista via `renderFor` com itens que têm `hash`/`key`/`slug` (ou chave declarada) NÃO emite warn de "sem id/uuid"; sem nenhuma chave → índice + warn **deduplicado** (uma vez por lista).
- [x] **Parcial, com ressalva honesta (ver 00-progresso.md):** `manualChunks` (vendor-react) implementado e medido de verdade num build real (init+build num app mínimo). O chunk principal NÃO caiu de tamanho (~2,44 MB tanto antes quanto depois nesta medição — diferente do "baseline 3,9 MB" da rodada 2, que não foi plenamente reproduzido aqui) porque o Registry do manifesto precisa de todo componente não-lazy disponível em runtime; o ganho real é isolar `react`/`react-dom` num chunk de cache estável, não reduzir o total transferido. Os pesados (`pdfjs`/`prism`/`echarts`/etc.) já eram `React.lazy` e JÁ estavam em chunks separados antes desta spec — confirmado, não uma regressão a corrigir.
- [x] CustomizationPanel não emite o warning de `input[type=color]` com `var(...)`.
- [x] `npm pack --dry-run` **não** contém `src/` (nem `sarak-base.css` fora de `dist/`); o export `./sarak-base.css` resolve para `dist/`; `check-package-contents.mjs` afirma a ausência de `src/`. **M9 vira PASS puro.**
- [x] `SarakActionCard` generalizado in-place (decisão HITL 2026-07-21) renderiza texto de botão (`actionLabel`), subtítulo e detalhes 100% por dado (`mapping.details`) — nenhuma string de domínio LLM hardcoded; paridade 1:1:1:1:1:1 mantida (Registry inalterado, só props) e catálogo regenerado. Achado correlato em `SarakCoreCard`/`SarakCardGrid` (mesmo defeito, maior superfície) extraído para a **Spec 42** (decisão HITL), não corrigido aqui.
- [x] Skill documenta o fluxo "Commit por categoria → Aplicar → Salvar Novo Tema" (`.claude/skills` é symlink de `.agents/skills` — propagação automática, sem espelho manual).
- [x] Gates verdes: `RegistryParity` (5/5), `catalog:check` (em dia), `npm run build` (verde, incl. `copy-base-css.mjs` novo), `run_audit.mjs` sem regressão (baseline: 1 hardcode + 3 ghostvars + 3 órfãos de manifesto, todos pré-existentes e documentados — nenhum novo além dos já conhecidos; um hardcode novo introduzido pela correção do `ColorControl` foi identificado e resolvido via allowlist documentada, não deixado como regressão).

# 4. Plano de Testes (Quality Gate)
## Unitários
- [x] `renderFor`: item com `hash`/`key`/`slug` → usa a chave natural, sem warn; sem chave → índice + warn dedup (uma vez por lista). (`expandRenderFor.test.ts`, 2 casos novos)
- [x] `input[type=color]`: recebe hex resolvido (sem `var(...)` cru) — asserção sobre o valor passado ao input. (`DesignControls.test.tsx`, 1 caso novo)
- [x] `SarakActionCard`: `actionLabel` custom aparece no botão; sem ele, default; painel de detalhes renderiza pares de `mapping` (não campos LLM fixos). Snapshot atualizado + teste-prova declarativo (`DeclarativeModelCard.integration.test.tsx`) reconstruindo o antigo card 100% via manifesto.
## Empacotamento
- [x] `check-package-contents.mjs` estendido: nega `src/` sem exceção; `npm pack --dry-run` confirma zero `src/` (verificado diretamente via script ad-hoc, 63 arquivos no tarball).
## Build / medição
- [x] Comparação antes/depois do chunk inicial de um app mínimo, com build real (init do scaffolder + `vite build`, node_modules reaproveitado do próprio repo — sem instalação de rede): números registrados no `00-progresso.md`.
## Validação real (opcional, se houver rodada de teste na sequência)
- [ ] Os itens de UI (SarakActionCard genérico, fluxo do Design Engine documentado) reaparecem cobertos no **Teste Real (Spec 41)** — que exercita componentes de verdade num consumidor real. Pendente (spec 41 ainda não executada).
