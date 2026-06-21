---
tipo: "spec"
titulo: "Binding Bidirecional e Ciclo de Vida de Formulário"
dominio: "Sarak-Lib-UI-Core (Lógica e Dados)"
status: "🔴 A Implementar"
prioridade: "Alta"
tags: ["spec", "logic", "forms", "binding", "two-way"]
relacionados: ["20-manifest-schema-e-gramatica-no", "21-datastore-estado-reativo", "24-motor-de-data-binding-pipes", "29-validacao-schema-formularios", "25-dispatcher-central-de-eventos"]
---

# 1. Visão Geral
O Data Binding (Spec 24) é **só-leitura** (interpola `{{ }}` para a tela). Formulários precisam do caminho inverso: o que o usuário digita deve voltar ao DataStore. Esta spec define o **binding bidirecional** (`model`) e o **ciclo de vida do formulário** (dirty, reset, montagem do payload de submit), completando a malha Inputs (Spec 11) ↔ Validação (Spec 29) ↔ Dispatcher (Spec 25).

# 2. Regras de Negócio
- **Regra 1 — Diretiva `model` (Two-Way):** Inputs ganham a diretiva reservada `model: "<stateKey>"`. O valor é lido do DataStore (Spec 21) e cada alteração escreve de volta via mutação controlada (batched), sem loop.
- **Regra 2 — Escopo de Formulário:** Um nó `SarakForm` define `form: { id, resetOn? }`, criando um **escopo de estado de formulário** (valores + dirty + touched + erros) isolado, montado sobre o DataStore.
- **Regra 3 — Montagem do Submit:** A ação `api_call` com `submit: true` (Spec 25) monta automaticamente o payload a partir dos `model` do formulário-escopo, respeitando o bloqueio da Validação (Spec 29) se houver erros.
- **Regra 4 — Dirty/Touched/Reset:** O motor rastreia campos sujos e tocados; `resetOn` (ex.: sucesso do submit) restaura os valores iniciais. Estados expostos para condicionais (`disabledIf: "{{form.isDirty}}"`).
- **Regra 5 — Contrato TS (Zero Any):** `interface FormModelDirective` e `type FormState` tipados; o valor do campo é genérico, nunca `any`.

# 3. Critérios de Aceite
- [ ] Digitar num input com `model: "user.name"` atualiza `{{user.name}}` em outros nós em tempo real, sem loop.
- [ ] Submeter monta o payload a partir dos `model`, e é bloqueado se a Validação (Spec 29) acusar erro.
- [ ] `resetOn` limpa o formulário ao sucesso; `isDirty` reflete corretamente.
- [ ] `model` e `form` estão no catálogo da Spec 20 e passam na Conferência Funcional (Spec 34).

# 4. Plano de Testes (Quality Gate)

## Testes Unitários
- [ ] **Deve** propagar a digitação ao DataStore e refletir em consumidores da fatia, sem re-render global.
- [ ] **Deve** montar o payload de submit somente com os campos do escopo do formulário.
- [ ] **Deve** marcar dirty/touched e restaurar em `resetOn`.

## Testes de Contrato (API)
- [ ] **Deve** passar na Conferência Funcional (Spec 34) para `model` e `form`.

## Testes E2E (Integração)
- [ ] Preencher um formulário, ver a interpolação espelhada, submeter com bloqueio por validação, corrigir e submeter com sucesso + reset.
