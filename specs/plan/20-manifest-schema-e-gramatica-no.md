---
tipo: "spec"
titulo: "Manifest Schema e Gramática do Nó (Contrato JSON)"
dominio: "Sarak-Lib-UI-Core (Lógica e Dados / Fundação)"
status: "🟢 Implementado"
prioridade: "Crítica"
tags: ["spec", "logic", "manifest", "schema", "contrato"]
relacionados: ["22-component-registry-resolver", "21-datastore-estado-reativo", "34-conferencia-funcional-do-manifesto", "30-contrato-importador-renderer"]
---

# 1. Visão Geral
Esta é a **spec-fundação do bloco funcional**: define a gramática canônica do nó do Manifesto JSON que TODOS os motores subsequentes (renderFor, pipes, dispatcher, condicional, validação) consomem. Sem este contrato único, cada motor inventaria um formato de JSON conflitante, inviabilizando a integração. Aqui mora a tipagem `ManifestNode` que é a Lei do JSON — análoga ao papel que o `SarakThemePayload` exerce para o Design Engine.

# 2. Regras de Negócio
- **Regra 1: Estrutura do Nó:** Todo nó do manifesto obedece à forma `{ type, id?, props?, children?, ...diretivas }`. `type` é uma string resolvida pelo Registry (Spec 22); `props` são repassadas ao componente; `children` é um array de nós aninhados.
- **Regra 2: Diretivas Reservadas (Conjunto Fechado e Vivo):** As chaves de comportamento formam um conjunto **fechado, versionado e catalogado** (ver "Catálogo de Diretivas Reservadas" abaixo). Diretivas NUNCA vazam como atributos de DOM — são interceptadas pelos motores antes da renderização. Cada capacidade funcional nova **registra sua diretiva neste catálogo** (o análogo funcional de adicionar um token ao `theme_table_mapping`), sob validação da Conferência Funcional (Spec 34).
- **Regra 3: Contrato TypeScript Inquebrável (Zero Any):** O nó é descrito por uma interface `ManifestNode` estritamente tipada (sem `any`, sem `Record<string, unknown>` aberto para as diretivas). As diretivas têm tipos próprios (`RenderForDirective`, `ActionList`, `ValidationSchema`, etc.). Chave fora do contrato é erro de validação do manifesto, não silêncio.
- **Regra 4: Resolução de `props` vs Diretivas:** O parser separa diretivas (comportamento) de `props` (visual). Apenas `props` e os valores interpolados resolvidos chegam ao átomo visual.
- **Regra 5: Versionamento do Manifesto:** O nó raiz declara `schemaVersion`. O Renderer (Spec 30) recusa versões incompatíveis com fallback explícito ("Manifesto de UI Inválido"), permitindo evolução sem quebra silenciosa.
- **Regra 6: Slots / Composição Nomeada:** Além de `children` (lista), um nó pode declarar `slots: { <nome>: ManifestNode }` para regiões nomeadas (ex.: header/body/footer, slot de mídia), repassadas ao componente como slots tipados (`SlotMap`).

## Catálogo de Diretivas Reservadas (vivo)
Catálogo canônico da camada funcional — toda diretiva existente e sua spec dona. É o análogo funcional do `theme_table_mapping`; a Conferência Funcional (Spec 34) valida que cada entrada tem **tipo + engine + teste**.

| Diretiva | Tipo (contrato TS) | Spec dona |
|---|---|---|
| `renderFor` | `RenderForDirective` | 23 |
| `bindings` / `{{ }}` | `BindingExpression` | 24 |
| `actions` / `onError` | `ActionList` | 25 |
| `renderIf` / `disabledIf` | `ConditionExpression` | 26 |
| `persistState` | `PersistDirective` | 28 |
| `validation` | `ValidationSchema` | 29 |
| `source` | `DataSourceDirective` | 31 |
| `model` / `form` | `FormModelDirective` | 32 |
| `responsive` | `ResponsiveDirective` | 16 |
| `shell` / `routes` | `ShellDirective` / `RouteMap` | 33 |
| `slots` | `SlotMap` | 20 |
| `theme` | `ThemeDirective` | 42 |
| `aria` | `AriaDirective` | 41 |

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
