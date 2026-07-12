/**
 * ENGAVETADO (Spec 02, revisão pós-incidente de produção — 2026-07-12).
 *
 * Este módulo implementava retrieval semântico (RAG) da Chamada B do Design
 * Agent: em vez do catálogo inteiro no prompt, buscava só os N tokens mais
 * "relevantes" pra intenção do usuário. Foi identificado como a CAUSA de uma
 * regressão em produção — não a correção que deveria ser.
 *
 * Diagnóstico: o truncamento original (Spec 03, Seção 1) acontecia na SAÍDA
 * do LLM (payload grande cortado por `max_tokens`), não na entrada. Injetar
 * o catálogo inteiro (~29k tokens, estático, cacheável) nunca foi o gargalo —
 * o gargalo era pedir pro modelo devolver ~400 chaves numa única resposta.
 * Além disso, com a config default do repo (`embeddings_provider: "local"` —
 * hash de bag-of-words sem semântica real — e `similarity_threshold: 0.7`),
 * o retrieval devolvia ZERO resultados pra a maioria dos pedidos em
 * linguagem natural, cegando o agente (ver `catalog_indexer.test.ts`, que
 * documentava esse achado, movido junto pra `tests/unit/toolbox/_shelved/`).
 *
 * A correção real (ver `theme_orchestrator.ts` + `theme_slice_filler.ts`)
 * ataca o lado certo do cano: fatia a SAÍDA por família de tokens (6 fatias,
 * ~70 chaves cada), não a ENTRADA.
 *
 * Este código NÃO foi deletado — o mecanismo de indexação/similaridade pode
 * servir depois pra um problema genuinamente de busca-em-corpus-grande (ex:
 * localizar um trecho relevante dentro de um brandbook de 200 páginas
 * ingerido pelas Specs 05/06, onde o "catálogo" a buscar não cabe inteiro no
 * prompt). Não é importado por nenhum caminho crítico — `routes.ts` não o
 * referencia mais.
 */
import { getDesignCatalog } from '@sarak/lib-ui-core/backend/node';
import { vectorStore } from '../../core/memory/vector_store_factory.js';
import { EmbeddingsFactory } from '../../core/memory/embeddings_factory.js';
import crypto from 'crypto';

const COLLECTION = 'design_catalog';
const AGENT_ID = 'design-operator';

let lastIndexedHash: string | null = null;

/**
 * Indexa o catálogo real de tokens (label/description/axis) no vector store do
 * design-operator — reindexação idempotente: só roda quando o
 * hash do catálogo serializado muda desde a última indexação.
 */
export async function ensureCatalogIndexed(embeddingsProviderName: string): Promise<void> {
    const catalog = getDesignCatalog();
    const serialized = JSON.stringify(catalog);
    const hash = crypto.createHash('sha256').update(serialized).digest('hex');

    if (hash === lastIndexedHash && await vectorStore.isIndexed(COLLECTION, AGENT_ID)) {
        return;
    }

    await vectorStore.clearAgentVectors(COLLECTION, AGENT_ID);

    const documents = catalog
        .filter(token => token.description)
        .map(token => ({
            text: `${token.label} (${token.id}): ${token.description}`,
            metadata: { id: token.id, type: token.type, axis: token.axis },
        }));

    const embeddingsProvider = EmbeddingsFactory.getEmbeddingsProvider(embeddingsProviderName);
    await vectorStore.addDocuments(COLLECTION, AGENT_ID, documents, embeddingsProvider);
    lastIndexedHash = hash;
}

/**
 * Retrieval semântico (RAG) do catálogo — busca os `topK` tokens mais relevantes
 * pra intenção do usuário. Engavetado (ver docblock do arquivo) — nenhum
 * caminho crítico depende mais disto.
 */
export async function retrieveRelevantTokens(userPrompt: string, embeddingsProviderName: string, topK = 20) {
    const embeddingsProvider = EmbeddingsFactory.getEmbeddingsProvider(embeddingsProviderName);
    const queryVector = await embeddingsProvider.embedQuery(userPrompt);
    return vectorStore.similaritySearch(COLLECTION, AGENT_ID, queryVector, topK);
}
