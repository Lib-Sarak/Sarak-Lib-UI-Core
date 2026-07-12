import { describe, it, expect, vi, beforeEach } from 'vitest';

// Testes do módulo ENGAVETADO `src/toolbox/_shelved/catalog_indexer.ts` — ver o
// docblock daquele arquivo pra o diagnóstico completo do porquê ele saiu do
// caminho crítico (Spec 02, revisão pós-incidente). Mantidos verdes pra provar
// que o mecanismo (não a decisão de usá-lo na Chamada B) continua correto,
// caso sirva no futuro pra busca em corpus grande (ex: brandbook ingerido).
//
// `catalog_indexer.ts` guarda `lastIndexedHash` em estado de módulo — cada
// teste reimporta o módulo (e o `vectorStore` singleton, que vive na mesma
// cadeia de import) via `vi.resetModules()` para começar isolado, sem herdar
// o estado de indexação de um teste anterior.
describe('catalog_indexer (engavetado)', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('deve gerar um documento por token com id/label/description/axis representados', async () => {
    const { ensureCatalogIndexed } = await import('../../../../src/toolbox/_shelved/catalog_indexer.js');
    const { vectorStore } = await import('../../../../src/core/memory/vector_store_factory.js');
    const { getDesignCatalog } = await import('@sarak/lib-ui-core/backend/node');

    const addDocumentsSpy = vi.spyOn(vectorStore, 'addDocuments');

    await ensureCatalogIndexed('local');

    expect(addDocumentsSpy).toHaveBeenCalledTimes(1);

    const [tableName, agentId, documents] = addDocumentsSpy.mock.calls[0];
    expect(tableName).toBe('design_catalog');
    expect(agentId).toBe('design-operator');

    const catalog = getDesignCatalog();
    const describedTokens = catalog.filter((token) => token.description);
    expect(documents).toHaveLength(describedTokens.length);

    const btnStyleDoc = documents.find((doc: { metadata: { id: string } }) => doc.metadata.id === 'btnStyleType');
    expect(btnStyleDoc).toBeDefined();
    expect(btnStyleDoc!.text).toContain('Estilo do Botão');
    expect(btnStyleDoc!.text).toContain('btnStyleType');
    expect(btnStyleDoc!.text).toContain('Define a linguagem visual completa do botão');
    expect(btnStyleDoc!.metadata).toEqual({ id: 'btnStyleType', type: 'select', axis: 'texture' });
  });

  it('deve pular a reindexação quando o hash do catálogo não mudou desde a última indexação', async () => {
    const { ensureCatalogIndexed } = await import('../../../../src/toolbox/_shelved/catalog_indexer.js');
    const { vectorStore } = await import('../../../../src/core/memory/vector_store_factory.js');

    const addDocumentsSpy = vi.spyOn(vectorStore, 'addDocuments');

    await ensureCatalogIndexed('local');
    expect(addDocumentsSpy).toHaveBeenCalledTimes(1);

    // Catálogo não mudou entre as duas chamadas — segunda deve ser um no-op.
    await ensureCatalogIndexed('local');
    expect(addDocumentsSpy).toHaveBeenCalledTimes(1);
  });

  it('deve retornar tokens plausíveis no top-K para uma query de exemplo ("tema mais escuro e compacto") — com embeddings determinísticos', async () => {
    const { ensureCatalogIndexed, retrieveRelevantTokens } = await import('../../../../src/toolbox/_shelved/catalog_indexer.js');
    const { EmbeddingsFactory } = await import('../../../../src/core/memory/embeddings_factory.js');

    // A qualidade semântica do provider "local" (hash de bag-of-words, sem
    // embeddings reais) não garante ranking plausível em texto livre — é uma
    // limitação conhecida da implementação in-memory de dev/teste, e foi
    // justamente parte do que motivou o engavetamento deste módulo (ver
    // docblock de `_shelved/catalog_indexer.ts`). Este teste isola o
    // mecanismo de retrieval (busca + ranking por similaridade) com um
    // provider determinístico, validando que o *mecanismo* em si funciona.
    const fakeEmbeddingsProvider = {
      embedQuery: () => [1, 0],
      embedDocuments: (texts: string[]) => texts.map((text) => (/escuro|compact/i.test(text) ? [1, 0] : [0, 1])),
    };
    vi.spyOn(EmbeddingsFactory, 'getEmbeddingsProvider').mockReturnValue(fakeEmbeddingsProvider);

    await ensureCatalogIndexed('fake-semantic');
    const results = await retrieveRelevantTokens('tema mais escuro e compacto', 'fake-semantic', 10);

    expect(results.length).toBeGreaterThan(0);
    const ids = results.map((match: { metadata: { id: string } }) => match.metadata.id);
    expect(ids).toContain('mode');
  });
});
