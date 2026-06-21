---
tipo: "spec"
titulo: "Conferência Funcional do Manifesto (Paridade Funcional)"
dominio: "Sarak-Lib-UI-Core (Lógica e Dados / Gate)"
status: "🔴 A Implementar"
prioridade: "Crítica"
tags: ["spec", "logic", "gate", "auditoria", "conferencia"]
relacionados: ["20-manifest-schema-e-gramatica-no", "21-datastore-estado-reativo", "22-component-registry-resolver", "02-plano-mestre-expansao-logica-e-dados"]
---

# 1. Visão Geral
Assim como o `verify_parity.ts` garante a Paridade 1:1:1:1:1 dos design tokens (Schema ↔ Banco ↔ Catálogo), o bloco funcional precisa de uma conferência **determinística** que garanta a integridade do contrato do Manifesto. Esta spec define a **Paridade Funcional** — o verificador que impede "diretivas-fantasma" e tipos órfãos, e a sua **incorporação obrigatória à `ui-auditoria-modulo`** como 7º sub-auditor.

# 2. Regras de Negócio
- **Regra 1 — As 3 Fontes da Verdade Funcionais:** A conferência valida que concordam:
  - **A — Contrato TS:** diretivas reservadas de `ManifestNode` (Spec 20), união `ComponentType` (Spec 22), assinaturas de Pipes/Actions/ValidationRules.
  - **B — Runtime:** o engine/handler registrado para cada diretiva; o componente no Registry para cada `type`; a implementação de cada pipe/action.
  - **C — Catálogo documentado:** as diretivas/tipos listados na Spec 20 e nos catálogos de pipes/actions.
- **Regra 2 — Violações que BLOQUEIAM (o "quebra de paridade" funcional):**
  - **Diretiva-fantasma:** chave em `ManifestNode` sem handler, ou handler para diretiva fora do contrato.
  - **Tipo órfão:** `ComponentType` que não resolve no Registry, ou componente registrado fora da união.
  - **Pipe/Action sem assinatura tipada** ou ausente do catálogo.
  - **`any` nos arquivos de contrato** funcionais (versão dirigida do auditor de `any`).
  - **Capacidade sem teste** correspondente.
- **Regra 3 — Determinístico (sem análise visual):** A verificação é por AST + leitura dos registries (igual aos auditores atuais), nunca por inspeção manual.
- **Regra 4 — Incorporação à Auditoria:** A `ui-auditoria-modulo` DEVE ganhar o sub-auditor `auditor_manifesto.mjs` (invocando o `verify_manifest_contract`), listado e agregado junto aos 6 existentes (Hardcoded, Typescript, Coverage, Arquitetura, CleanCode, Paridade). A auditoria geral só passa se a Conferência Funcional passar.
- **Regra 5 — Crescimento por Entrada:** Cada capacidade funcional nova (ex.: `source`, `model`, `responsive`, `shell`, `routes`, `slots`) é uma **entrada nova** validada por esta conferência — o análogo funcional de "adicionar token ao `theme_table_mapping`".

# 3. Critérios de Aceite
- [ ] Rodar a conferência detecta uma diretiva adicionada ao tipo sem handler (e vice-versa) e falha com o nome da diretiva.
- [ ] Detecta um `ComponentType` sem componente no Registry.
- [ ] Acusa `any` introduzido num arquivo de contrato funcional.
- [ ] A `ui-auditoria-modulo` executa a Conferência Funcional como 7º item e reprova o módulo se ela quebrar.

# 4. Plano de Testes (Quality Gate)

## Testes Unitários
- [ ] **Deve** comparar o conjunto de diretivas do tipo com o conjunto de handlers e reportar diferenças simétricas.
- [ ] **Deve** validar a cobertura Registry ↔ `ComponentType` nos dois sentidos.

## Testes de Contrato (API)
- [ ] **Deve** expor o resultado da conferência em formato agregável pelo `run_audit.mjs`.

## Testes E2E (Integração)
- [ ] Introduzir propositalmente uma diretiva-fantasma e confirmar que `run_audit.mjs` acusa "AUDITORIA FALHOU" pela Conferência Funcional.
