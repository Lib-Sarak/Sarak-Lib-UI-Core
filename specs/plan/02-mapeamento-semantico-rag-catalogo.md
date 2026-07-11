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

# 5. Taxonomia de Eixos (`axis`) — definição e critério de classificação

Use esta tabela para decidir o `axis` de cada token. Se um token realmente não se encaixa em nenhum (ex.: `mode`, `navigationStyle`, campos estruturais que só existem em runtime), **deixe `axis` indefinido** — não force.

| `axis` | O que cobre | Pistas no `id`/`type` |
|---|---|---|
| `color` | Qualquer token `type: 'color'`, ou `select` cujas opções são só nomes de cor/paleta | `id` contém `Bg`, `Color`, `Text`, `Border` (quando `type: 'color'`) |
| `geometry` | Raio de borda, espessura, proporção, posição/alinhamento estrutural | `id` contém `Radius`, `Width`, `Height`, `Padding`, `Gap`, `Position`, `Align` |
| `elevation` | Sombra, blur de fundo (backdrop), z-index visual, profundidade | `id` contém `Shadow`, `Blur`, `Glow`, `Elevation` |
| `texture` | Padrões visuais de superfície: ruído, grid, textura de fundo | `id` contém `Texture`, `Pattern`, `Grain`, `Noise` |
| `density` | Espaçamento entre elementos, tamanho de fonte em escala, compactação | `id` contém `Gap`, `Spacing`, `Density`, `Scale` (cuidado: `Gap`/`Spacing` podem ser `geometry` OU `density` — critério de desempate: se o token controla espaço **dentro** de um componente = `geometry`; se controla espaço **entre** vários elementos/densidade da tela = `density`) |
| `motion` | Duração/velocidade de transição, animação, hover scale | `id` contém `Speed`, `Duration`, `Scale` (quando é hover/active), `Transition`, `Pulse` |

# 6. Exemplos de Referência (copie exatamente este padrão)

Estes 6 exemplos são tokens **reais** de `src/core/Design/schema/buttons.ts` — use como modelo de tom, tamanho e conteúdo para as `description`s dos ~409 tokens. Cada `description` tem 1-3 frases: (1) o que o token controla visualmente, (2) quando/por que usar, (3) opcional — relação com outros tokens.

```ts
// src/core/Design/schema/buttons.ts — ANTES (estado atual, description ausente)
{
    id: 'btnStyleType',
    label: 'Estilo do Botão',
    type: 'select',
    constraints: { options: BUTTON_STYLE_OPTIONS },
    defaultValue: 'matte',
    cssVars: ['--sarak-btn-style-type']
},

// DEPOIS (com description + axis preenchidos)
{
    id: 'btnStyleType',
    label: 'Estilo do Botão',
    type: 'select',
    description: 'Define a linguagem visual completa do botão — matte (sólido, sóbrio, o mais neutro/corporativo), neon (brilho pulsante, clima cyberpunk/tech), frosted (vidro fosco translúcido, clima moderno/Apple-like), borderline (só contorno, minimalista/editorial), cyberpunk (wireframe anguloso), neumorphism (relevo suave, soft UI). Escolha isto ANTES de ajustar cores — o estilo muda quais outros tokens (glow, blur) fazem efeito.',
    axis: 'texture',
    constraints: { options: BUTTON_STYLE_OPTIONS },
    defaultValue: 'matte',
    cssVars: ['--sarak-btn-style-type']
},
{
    id: 'btnPrimaryBg',
    label: 'Fundo Primário',
    type: 'color',
    description: 'Cor de fundo do botão de maior ênfase (ação principal da tela, ex. "Confirmar", "Salvar"). É a cor mais visível do sistema depois da cor de marca — costuma ser a mesma ou derivada de `primaryColor`. Gera variantes automáticas de hover/active (`generateVariants: true`).',
    axis: 'color',
    defaultValue: '#00f2ff',
    generateVariants: true,
    cssVars: ['--sarak-btn-primary-bg']
},
{
    id: 'btnBorderRadius',
    label: 'Arredondamento (Master)',
    type: 'slider',
    description: 'Raio de borda geral do botão em pixels. 0 = quadrado/anguloso (clima industrial/técnico), valores altos (>40px) = pílula/totalmente arredondado (clima amigável/lúdico). É o valor "mestre" — os 4 cantos individuais (`btnRadiusTL/TR/BL/BR`) sobrescrevem por canto quando precisar de assimetria.',
    axis: 'geometry',
    isResponsive: true,
    unit: 'px',
    constraints: { min: 0, max: 120 },
    defaultValue: { mob: 6, tab: 8, desk: 8 },
    cssVars: ['--sarak-btn-border-radius', '--sarak-btn-radius-tl', '--sarak-btn-radius-tr', '--sarak-btn-radius-bl', '--sarak-btn-radius-br']
},
{
    id: 'btnHoverScale',
    label: 'Escala no Hover',
    type: 'slider',
    description: 'Fator de escala (zoom) do botão ao passar o mouse. 1.0 = sem efeito, >1.0 = cresce (feedback tátil/lúdico), <1.0 = encolhe (raro, sensação de "afundar"). Valores sutis (1.01-1.05) são mais elegantes; valores altos (>1.1) chamam muita atenção.',
    axis: 'motion',
    constraints: { min: 0.8, max: 1.2, step: 0.01 },
    defaultValue: 1.02,
    cssVars: ['--sarak-btn-hover-scale']
},
{
    id: 'btnNeonGlowColor',
    label: 'Cor do Brilho (Neon)',
    type: 'color',
    description: 'Cor do brilho/glow ao redor do botão — só tem efeito visível quando `btnStyleType` é \'neon\' ou \'cyberpunk\'. Normalmente usa a mesma cor de `btnPrimaryBg` em formato rgba com transparência, pra o brilho combinar com o botão.',
    axis: 'elevation',
    defaultValue: 'rgba(0, 242, 255, 0.4)',
    cssVars: ['--sarak-btn-neon-glow-color']
},
{
    id: 'btnNeonPulseSpeed',
    label: 'Velocidade de Pulso (s)',
    type: 'slider',
    description: 'Duração (em segundos) de um ciclo de pulsação do brilho neon — só relevante quando `btnStyleType` é \'neon\'. Valores baixos (0.5-1s) = pulsação rápida/urgente; valores altos (2-4s) = pulsação lenta/ambiente.',
    axis: 'motion',
    unit: 's',
    constraints: { min: 0.5, max: 4, step: 0.1 },
    defaultValue: 1.5,
    cssVars: ['--sarak-btn-neon-pulse-speed']
},
```

**Checklist ao escrever cada `description`:** (1) começa descrevendo o efeito visual observável, nunca só repete o `label`; (2) menciona quando/por que usar esse valor específico (não só "controla X"); (3) se o token só faz efeito sob certa condição (outro token com valor específico), isso é dito explicitamente (ver `btnNeonGlowColor` acima); (4) 1-3 frases — não escrever um parágrafo longo, o custo de contexto do RAG é por token recuperado.

# 7. Pseudocódigo do Pipeline de Indexação

Interfaces reais já existentes (não inventar novas): `VectorStoreInterface.addDocuments(tableName, agentId, documents)` e `.similaritySearch(tableName, agentId, queryEmbedding, topK, threshold)` (`agent-design-operator/src/core/memory/vector_store_interface.ts`), `EmbeddingsInterface.embedDocuments(texts)`/`.embedQuery(text)` (`embeddings_interface.ts`). `documents` é sempre `{text: string, metadata?: object}[]` — confirmado em `memory_vector_store.ts:17-39`.

```ts
// agent-design-operator/src/toolbox/catalog_indexer.ts (novo arquivo)
import { getDesignCatalog } from '@sarak/lib-ui-core/backend/node';
import { vectorStore } from '../core/memory/vector_store_factory.js';
import { EmbeddingsFactory } from '../core/memory/embeddings_factory.js';
import crypto from 'crypto';

const COLLECTION = 'design_catalog';
const AGENT_ID = 'design-operator';

let lastIndexedHash: string | null = null;

export async function ensureCatalogIndexed(embeddingsProviderName: string): Promise<void> {
    const catalog = getDesignCatalog(); // agora inclui label/description/axis (Critério de Aceite 3)
    const serialized = JSON.stringify(catalog);
    const hash = crypto.createHash('sha256').update(serialized).digest('hex');

    if (hash === lastIndexedHash && await vectorStore.isIndexed(COLLECTION, AGENT_ID)) {
        return; // catálogo não mudou desde a última indexação — Regra 5
    }

    await vectorStore.clearAgentVectors(COLLECTION, AGENT_ID);

    const documents = catalog
        .filter(token => token.description) // só indexa tokens já documentados
        .map(token => ({
            text: `${token.label} (${token.id}): ${token.description}`,
            metadata: { id: token.id, type: token.type, axis: token.axis },
        }));

    const embeddingsProvider = EmbeddingsFactory.getEmbeddingsProvider(embeddingsProviderName);
    await vectorStore.addDocuments(COLLECTION, AGENT_ID, documents, embeddingsProvider);
    lastIndexedHash = hash;
}

export async function retrieveRelevantTokens(userPrompt: string, embeddingsProviderName: string, topK = 20) {
    const embeddingsProvider = EmbeddingsFactory.getEmbeddingsProvider(embeddingsProviderName);
    const queryVector = await embeddingsProvider.embedQuery(userPrompt);
    return vectorStore.similaritySearch(COLLECTION, AGENT_ID, queryVector, topK);
    // retorna [{ text, score, metadata: { id, type, axis } }, ...] — usar token.metadata.id
    // pra montar a lista de chaves permitidas que entra no prompt da Chamada B (spec 03)
}
```

`routes.ts` chama `ensureCatalogIndexed(...)` uma vez no boot (ou lazy na primeira requisição) e `retrieveRelevantTokens(prompt, ...)` a cada chamada, substituindo `buildCatalogPromptBlock()` (que hoje despeja o catálogo inteiro) pelo resultado do retrieval.
