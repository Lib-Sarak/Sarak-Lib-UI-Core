---
tipo: "spec"
titulo: "Fonte de Dados Declarativa (Async Loading + Ciclo de Vida)"
dominio: "Sarak-Lib-UI-Core (Lógica e Dados)"
status: "🟢 Implementado"
prioridade: "Crítica"
tags: ["spec", "logic", "datasource", "async", "lifecycle"]
relacionados: ["20-manifest-schema-e-gramatica-no", "21-datastore-estado-reativo", "23-motor-de-repeticao-renderfor", "27-error-boundaries-e-fallbacks", "30-contrato-importador-renderer"]
---

# 1. Visão Geral
Resolve o problema-raiz do Mestre Funcional (*"tabelas não buscam dados"*): hoje o dispatcher (Spec 25) só faz `api_call` por **evento** (clique), e o `renderFor` (Spec 23) itera um array que **ninguém popula**. Esta spec adiciona a capacidade **declarativa** de um nó carregar seus próprios dados ao renderizar, depositá-los no DataStore e exibir os estados de carregamento/vazio/erro — fechando o fluxo "JSON vira app viva".

# 2. Regras de Negócio
- **Regra 1 — Diretiva `source`:** O `ManifestNode` (Spec 20) ganha a diretiva reservada:
  ```
  source?: { endpoint, method?, params?, into: "<stateKey>", trigger?: "onMount" | "manual" }
  ```
  No `onMount`, o motor invoca o `networkInterceptor` do importador (Spec 30), e deposita o resultado no DataStore (Spec 21) na chave `into` — de onde o `renderFor` (Spec 23) passa a iterar.
- **Regra 2 — Ciclo de Vida do Nó de Dados:** Cada nó com `source` expõe os estados `loading | success | empty | error`, fiados a componentes existentes: **loading → Skeleton (Spec 13)**, **empty → Empty State (Spec 13)**, **error → Fallback (Spec 27)**. O nó declara opcionalmente overrides via `states: { loading?, empty?, error? }` (também nós Sarak).
- **Regra 3 — Contrato TS (Zero Any):** `interface DataSourceDirective` e `type DataNodeState` tipados; o payload de retorno é genérico `<TData>`, nunca `any`.
- **Regra 4 — Anti-Loop e Cache:** A busca dispara uma única vez por montagem (chaveada por `endpoint`+`params`); reexecução só por `trigger: manual` ou mudança das `params` interpoladas. Resultado integra o batching do DataStore (Spec 21).
- **Regra 5 — Sem rede embutida:** A biblioteca NUNCA chama `fetch` direto; toda E/S passa pelo `networkInterceptor` injetado (mantém auth/JWT sob o importador).

# 3. Critérios de Aceite
- [ ] Um `SarakDataGrid` com `source: { endpoint: '/clients', into: 'clients' }` carrega ao montar e o `renderFor: "{{clients}}"` desenha as linhas, sem código externo.
- [ ] Durante a busca aparece o Skeleton; lista vazia mostra o Empty State; erro de rede mostra o Fallback sem derrubar o resto da tela.
- [ ] A diretiva `source` está no catálogo da Spec 20 e passa na Conferência Funcional (Spec 34).
- [ ] Nenhuma chamada de rede ocorre sem o `networkInterceptor`.

# 4. Plano de Testes (Quality Gate)

## Testes Unitários
- [ ] **Deve** transicionar loading → success/empty/error corretamente conforme a resposta mockada do interceptor.
- [ ] **Deve** depositar o resultado na chave `into` e disparar re-render apenas dos assinantes daquela fatia.
- [ ] **Deve** não refazer a busca em re-render sem mudança de `params` (anti-loop).

## Testes de Contrato (API)
- [ ] **Deve** passar na Conferência Funcional (Spec 34): diretiva `source` com engine, contrato TS sem `any` e teste.

## Testes E2E (Integração)
- [ ] Montar uma tabela que busca dados de um interceptor de teste, exibindo skeleton → linhas, e simular falha exibindo o fallback isolado.
