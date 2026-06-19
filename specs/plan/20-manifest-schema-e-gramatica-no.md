---
tipo: "spec"
titulo: "Manifest Schema e Gramática do Nó (Contrato JSON)"
dominio: "Sarak-Lib-UI-Core (Lógica e Dados / Fundação)"
status: "🔴 A Implementar"
prioridade: "Crítica"
tags: ["spec", "logic", "manifest", "schema", "contrato"]
relacionados: ["22-component-registry-resolver", "21-datastore-estado-reativo", "30-contrato-importador-renderer"]
---

# 1. Visão Geral
Esta é a **spec-fundação do bloco funcional**: define a gramática canônica do nó do Manifesto JSON que TODOS os motores subsequentes (renderFor, pipes, dispatcher, condicional, validação) consomem. Sem este contrato único, cada motor inventaria um formato de JSON conflitante, inviabilizando a integração. Aqui mora a tipagem `ManifestNode` que é a Lei do JSON — análoga ao papel que o `SarakThemePayload` exerce para o Design Engine.

# 2. Regras de Negócio
- **Regra 1: Estrutura do Nó:** Todo nó do manifesto obedece à forma `{ type, id?, props?, children?, ...diretivas }`. `type` é uma string resolvida pelo Registry (Spec 22); `props` são repassadas ao componente; `children` é um array de nós aninhados.
- **Regra 2: Diretivas Reservadas (Conjunto Fechado):** As chaves de comportamento são um conjunto **fechado e versionado**: `renderFor`, `renderIf`, `disabledIf`, `actions`, `onError`, `validation`, `persistState`, `bindings`. Diretivas NUNCA vazam como atributos de DOM — são interceptadas pelos motores antes da renderização.
- **Regra 3: Contrato TypeScript Inquebrável (Zero Any):** O nó é descrito por uma interface `ManifestNode` estritamente tipada (sem `any`, sem `Record<string, unknown>` aberto para as diretivas). As diretivas têm tipos próprios (`RenderForDirective`, `ActionList`, `ValidationSchema`, etc.). Chave fora do contrato é erro de validação do manifesto, não silêncio.
- **Regra 4: Resolução de `props` vs Diretivas:** O parser separa diretivas (comportamento) de `props` (visual). Apenas `props` e os valores interpolados resolvidos chegam ao átomo visual.
- **Regra 5: Versionamento do Manifesto:** O nó raiz declara `schemaVersion`. O Renderer (Spec 30) recusa versões incompatíveis com fallback explícito ("Manifesto de UI Inválido"), permitindo evolução sem quebra silenciosa.

# 3. Critérios de Aceite
- [ ] A interface `ManifestNode` compila com `strict: true` e **zero `any`**, cobrindo todas as diretivas reservadas com tipos próprios.
- [ ] Um nó com chave de diretiva desconhecida (ex.: `renderForr`) é rejeitado pela validação do manifesto com mensagem clara, não passa adiante.
- [ ] Diretivas (`renderIf`, `actions`...) jamais aparecem como atributos no DOM renderizado.
- [ ] O nó raiz sem `schemaVersion` compatível aciona o fallback de manifesto inválido.

# 4. Plano de Testes (Quality Gate)

## Testes Unitários
- [ ] **Deve** validar um nó bem-formado e separar corretamente `props` de diretivas.
- [ ] **Deve** rejeitar nós com chaves reservadas escritas incorretamente, devolvendo o `path`/`id` do nó culpado.
- [ ] **Deve** garantir (via teste de tipo) que `ManifestNode` não admite `any` nas diretivas.

## Testes de Contrato (API)
- [ ] **Deve** exportar a interface `ManifestNode` e os tipos de diretiva no `src/index.ts` para consumo externo tipado.

## Testes E2E (Integração)
- [ ] Ingerir um manifesto com nós aninhados e diretivas mistas, confirmando que a árvore resultante respeita a gramática sem vazar diretivas no HTML.
