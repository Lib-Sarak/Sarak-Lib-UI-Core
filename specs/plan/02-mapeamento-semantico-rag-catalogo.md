---
tipo: "spec"
titulo: "Mapeamento Semântico e RAG do Catálogo (Dicionário de Intenção)"
dominio: "Design Engine (Sarak UI Core)"
status: "🔴 A Implementar"
prioridade: "Alta"
tags: ["spec", "ai-agent", "semantic", "rag", "data-driven"]
relacionados: ["16-agente-llm-mapeamento-semantico", "07-agente-llm-design-e-expansao-estrutural", "01-auditoria-cobertura-componentes", "03-separacao-estrutural-chat-acao", "04-multi-preset-diversificado"]
---

> Esta spec substitui e absorve `specs/plan/16-agente-llm-mapeamento-semantico.md` (rascunho anterior, nunca implementado — o arquivo 16 agora só redireciona pra cá).

# 1. Visão Geral
O Design Agent hoje só enxerga o catálogo como uma lista plana de `{id, type, options, min, max}` (via `getDesignCatalog()`). Ele sabe **quais** chaves existem e **que forma de valor** cada uma aceita, mas não sabe **o que cada uma faz visualmente**, **quando usá-la**, ou **quais tokens combinam entre si** para produzir um resultado coerente. É por isso que pedidos abertos ("interface arejada e noturna", "totalmente diferente") tendem a resultar em mudanças rasas (normalmente só cor) — o caminho de menor resistência de um LLM sem contexto semântico. Esta spec define como preencher esse conteúdo e como entregá-lo ao agente sem estourar o orçamento de tokens do prompt a cada chamada.

# 2. Regras de Negócio
- **Regra 1 (Onde a semântica mora — decisão que a spec 16 deixava em aberto):** o campo `description` (já existe no tipo `DesignToken`, `src/core/Design/types.ts:41`, hoje vazio em 100% dos ~409 tokens) passa a ser preenchido diretamente nos arquivos de schema (`src/core/Design/schema/*.ts`), lado a lado com `id`/`label`/`type`. Não vira um dicionário separado — mantém a mesma fonte única da verdade (Schema → MasterMap → Catálogo JSON), sem criar uma 4ª fonte pra manter em paridade.
- **Regra 2 (Novo campo `axis`):** cada token ganha uma classificação de eixo visual — `color` | `geometry` | `elevation` | `texture` | `density` | `motion` — usada pela spec 04 (diversificação) pra saber "que tipo de variação" um token representa. Campo novo em `DesignToken` (`axis?: 'color' | 'geometry' | 'elevation' | 'texture' | 'density' | 'motion'`), opcional (tokens estruturais/não-visuais podem não ter eixo).
- **Regra 3 (RAG de verdade, não dump completo):** em vez de injetar os ~409 tokens inteiros em todo prompt (custoso, e foi a causa direta do truncamento observado em teste real), o agente faz **retrieval semântico**: embute a intenção do usuário, busca os N tokens mais relevantes (`similaritySearch`) e só esses entram no prompt.
- **Regra 4 (Reaproveitar infraestrutura existente, não criar nova):** a indexação usa `agent-design-operator/src/core/memory/vector_store_factory.ts` (`VectorStoreInterface.addDocuments`/`similaritySearch`) e `embeddings_factory.ts` — infraestrutura já implementada para o `default-agent`, ociosa para `design-operator`. `addDocuments`/`similaritySearch` já são parametrizados por `agentId`, então `design-operator` indexa no próprio namespace sem conflitar.
- **Regra 5 (Reindexação sob demanda, não em todo boot):** a indexação roda quando o catálogo muda (hash do catálogo serializado diferente do último indexado — mesmo padrão de `_ensureKnowledgeIndexed` em `agent_engine.ts`), não a cada chamada.

# 3. Critérios de Aceite
- [ ] 100% dos tokens existentes no catálogo (número exato depende do resultado da spec 01) têm `description` preenchida — texto explicando o efeito visual, quando usar, tokens relacionados.
- [ ] Tokens visuais relevantes têm `axis` classificado; documentar quais tokens ficam sem eixo (estruturais/não visuais) e por quê.
- [ ] `getDesignCatalog()` (`backend/node/catalog.ts`) passa a expor também `label`/`description`/`axis` (hoje só `id/type/options/min/max`).
- [ ] Pipeline de indexação: dado o catálogo, gera documentos (`{id, label, description, axis, type}`) e chama `vectorStore.addDocuments(...)` no namespace do `design-operator`.
- [ ] `routes.ts` do `agent-design-operator` troca o dump completo do catálogo no prompt por `similaritySearch` com o texto do pedido do usuário como query.
- [ ] Reindexação é idempotente e só roda quando o hash do catálogo muda.

# 4. Plano de Testes (Quality Gate)

## Testes Unitários
- [ ] **Deve** o pipeline de indexação gerar um documento por token com os 4 campos esperados (`id`, `label`, `description`, `axis`).
- [ ] **Deve** a reindexação ser pulada quando o hash do catálogo não mudou desde a última indexação.
- [ ] **Deve** `similaritySearch` com uma query de exemplo ("tema mais escuro e compacto") retornar tokens plausíveis (ex.: tokens de `mode`/densidade/espaçamento) no top-K.

## Testes de Contrato (API)
- *N/A* — a indexação/retrieval é interna ao `agent-design-operator`, não expõe endpoint novo.

## Testes E2E (Integração)
- [ ] Fluxo feliz: pedido de tema com adjetivos abertos ("moderno e arejado") resulta em payload que toca tokens de mais de um eixo (não só cor) — validação qualitativa, revisão manual do resultado.
