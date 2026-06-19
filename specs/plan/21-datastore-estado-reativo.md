---
tipo: "spec"
titulo: "DataStore e Estado Reativo (Container de Estado)"
dominio: "Sarak-Lib-UI-Core (Lógica e Dados / Fundação)"
status: "🔴 A Implementar"
prioridade: "Crítica"
tags: ["spec", "logic", "state", "reactive", "datastore"]
relacionados: ["20-manifest-schema-e-gramatica-no", "23-motor-de-repeticao-renderfor", "24-motor-de-data-binding-pipes", "25-dispatcher-central-de-eventos", "28-persistencia-estado-local"]
---

# 1. Visão Geral
Define o **container de estado reativo** que sustenta metade do bloco funcional. É a árvore única de dados sobre a qual a interpolação (Spec 24) lê variáveis, o dispatcher (Spec 25) escreve (`mutate_state`), o avaliador condicional (Spec 26) decide visibilidade e a persistência (Spec 28) hidrata/salva. O Mestre Funcional alerta explicitamente contra "loops infinitos de re-renderização" — esta spec existe para tornar a reatividade **determinística e barata**, evitando que cada motor invente seu próprio mecanismo de estado.

# 2. Regras de Negócio
- **Regra 1: Fonte Única e Externa:** O estado vive em um **store externo único** (padrão `useSyncExternalStore`, não prop-drilling nem Context monolítico) injetado via a prop `dataStore` do `SarakManifestRenderer` (Spec 30). O importador fornece o estado inicial.
- **Regra 2: Leitura Segura por Caminho:** O store expõe `get(path)` com resolução segura de caminho (ex.: `user.address.street`), imune a `undefined` intermediário — compartilhado com o motor de Data Binding (Spec 24).
- **Regra 3: Escrita Imutável e em Lote (Anti-Loop):** Toda mutação (`set`/`mutate_state`) produz atualização imutável e é **agrupada (batched)** num único ciclo de render. Mutações disparadas dentro de render são proibidas; o motor protege contra cascatas de re-render.
- **Regra 4: Seletores e Re-render Mínimo:** Componentes assinam **fatias** do estado (seletores). Alterar uma fatia re-renderiza apenas os nós que a consomem, nunca a árvore inteira.
- **Regra 5: Escopo Local de Iteração:** O `renderFor` (Spec 23) empilha uma **camada de escopo** (`item`, `index`) resolvida por cima do store global, sem mutar o global. A resolução de caminho consulta o escopo local antes do global.
- **Regra 6: Contrato TypeScript (Zero Any):** A interface `SarakDataStore<TState>` é genérica e tipada (`get`, `set`, `subscribe`, `getScoped`). Proibido `any` na fronteira do store.

# 3. Critérios de Aceite
- [ ] Um `mutate_state` numa chave re-renderiza somente os componentes assinantes daquela fatia (verificável por contagem de render).
- [ ] Disparar 10 mutações em sequência não gera loop nem mais de um flush de render coalescido.
- [ ] `get("a.b.c")` com `b` indefinido devolve `undefined`/fallback sem lançar erro.
- [ ] O escopo de `renderFor` resolve `{{item.x}}` corretamente sem poluir o estado global.

# 4. Plano de Testes (Quality Gate)

## Testes Unitários
- [ ] **Deve** notificar apenas os assinantes da fatia alterada (seletor), não os demais.
- [ ] **Deve** coalescer múltiplas escritas síncronas em um único ciclo de notificação.
- [ ] **Deve** resolver caminhos com escopo local sobrepondo o global na ordem correta.

## Testes de Contrato (API)
- [ ] **Deve** exportar `SarakDataStore<TState>` tipado e o helper de criação do store.

## Testes E2E (Integração)
- [ ] Alterar o estado externo injetado pelo importador reflete imediatamente nos textos interpolados sem reload, sem travar a UI.
