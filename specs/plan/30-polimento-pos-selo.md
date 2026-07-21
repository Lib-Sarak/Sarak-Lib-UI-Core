---
tipo: "spec"
titulo: "Polimento pós-Selo (chave natural do renderFor + bundle sem code-splitting + warning de input color)"
dominio: "Manifest Engine / Build / Design Engine / DX"
status: "🔴 Planejada (baixa prioridade — executar DEPOIS do re-Selo; NÃO bloqueia o Selo)"
prioridade: "Baixa"
tags: ["spec", "correcao-pos-selo", "polimento", "performance", "dx", "nao-bloqueante"]
relacionados: ["26-instalacao-teste", "otimizacao-nivel-1"]
---

# 1. Visão Geral e Descrição do Problema

Achados menores/observações do Selo da Onda (Spec 26), classificados na triagem como **pendências conhecidas que NÃO bloqueiam o Selo**. Agrupados aqui para não se perderem, com prioridade baixa e execução **após** o re-Selo (o Selo é reavaliado sem depender destes). São três:

- **Achado 6 (renderFor — chave natural, M5 observação):** `[Sarak:renderFor] item sem id/uuid; usando índice N como key.` aparece em TODA renderização de uma lista cujos itens usam outra chave natural (ex.: `hash`) em vez de `id`/`uuid`. O motor de listas não reconhece convenções de chave além de `id`/`uuid` e avisa a cada item, poluindo o console mesmo quando há uma chave estável perfeitamente boa.
- **Achado 7 (bundle sem code-splitting, observação de build):** o chunk principal de um app mínimo (~8 componentes) ficou em **3,9 MB (992 KB gzip)**; o Vite avisa "Some chunks are larger than 500 kB after minification". Não bloqueou o build, mas é um sintoma de que os pesados (pdfjs-dist, echarts, reactflow, etc. — ver memórias Onda 9/10) podem não estar sendo splitados no consumo real.
- **Achado 8 (warning de `input[type=color]`, cosmético):** `The specified value "var(--sarak-text-main,#ffffff)" does not conform to the required format...` — algum `input[type=color]` interno do CustomizationPanel recebe um `var(...)` não resolvido em vez de um hex. Ruído no console durante M7/M8; não afeta função.

# 2. Regras de Negócio (Solução)

## 2.1 renderFor: chave natural configurável / heurística mais esperta (achado 6)
- Reconhecer convenções de chave além de `id`/`uuid` no motor de `renderFor` — no mínimo aceitar `key`/`hash`/`slug` como chaves naturais estáveis; idealmente permitir declarar a chave no manifesto (ex.: `renderFor: { source, key: "hash" }`). Só cair no índice (com o warn) quando NENHUMA chave estável existir. Reduzir/deduplicar o warn (uma vez por lista, não por item).
- Se abrir novo campo no `renderFor`, seguir a paridade e regenerar o catálogo.

## 2.2 Code-splitting no consumo (achado 7)
- Investigar por que os pesados-lazy (já marcados `React.lazy` no `LeafNode`, `HEAVY_LAZY`) não geram chunks separados no build do consumidor: pode ser configuração do template do `init` (Vite `manualChunks`/`build.rollupOptions`), ou o jeito como o bundle da lib expõe os pesados. Escopo: reduzir o chunk inicial de um app mínimo, sem quebrar o zero-config. Candidato natural à skill `otimizacao-nivel-1` (medir antes/depois — o número atual 3,9 MB / 992 KB gzip é o baseline).

## 2.3 input color recebe hex resolvido (achado 8)
- No componente do CustomizationPanel que usa `input[type=color]`, garantir que o `value` seja um hex resolvido (resolver a CSS var para o valor computado antes de passar ao input, ou usar um fallback hex), eliminando o warning nativo do Chrome. Puramente cosmético.

# 3. Critérios de Aceite
- [ ] Uma lista via `renderFor` com itens que têm `hash` (ou outra chave natural declarada) NÃO emite o warn de "sem id/uuid" a cada item.
- [ ] O chunk inicial de um app mínimo do template do `init` cai de forma mensurável (baseline 3,9 MB / 992 KB gzip), com os pesados em chunks sob demanda; build segue verde e zero-config.
- [ ] O CustomizationPanel não emite o warning de `input[type=color]` com `var(...)`.
- [ ] Gates verdes: `RegistryParity`, `catalog:check`, `npm run build`, `run_audit.mjs` 0 falhas.

# 4. Plano de Testes (Quality Gate)
## Unitários
- [ ] `renderFor`: item com `hash`/`key`/`slug` → usa a chave natural, sem warn; item sem nenhuma chave → índice + warn dedup (uma vez por lista).
- [ ] input color: recebe hex resolvido (sem `var(...)` cru) — asserção sobre o valor passado ao input.
## Build / medição
- [ ] Comparação antes/depois do tamanho do chunk inicial de um app mínimo (via `otimizacao-nivel-1`); registrar os números no progresso.
