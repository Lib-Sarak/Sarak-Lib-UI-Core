// Núcleo do passo "catálogo = schema" da paridade (`verify_parity.ts`): confere, para cada token que está nas duas
// fontes, o TIPO e os VALORES permitidos (opções de um `select`, faixa de um `slider`). Pura, para o teste de mutação.
//
// -------------------------------------------------------------------------
// LIMITES DECLARADOS (R18) — o que este passo NÃO vê
// -------------------------------------------------------------------------
// 1. Só `type` e `allowedValues` (opções como texto, em qualquer ordem; faixa `min`/`max`/`step`). Não confere
//    rótulo, descrição, categoria, `cssVariables` nem `relatedTokens` — esses são prosa ou índice, não contrato.
// 1a. A origem das opções é a da validação (`constraints.options ?? options`): ler só `constraints.options` fez a
//    sincronização apagar as opções de 16 `select`. Um `select` do catálogo sem opção é achado por si (teste do repositório).
// 2. Opção é lida por `value` (ou `id` na falta dele) e comparada como TEXTO: `300` e `'300'` são a mesma opção.
// 3. Token que só existe numa das fontes é da paridade de presença (`verify_parity.ts`), não deste passo.
// 4. Não confere o padrão (`defaultValue`) — o do schema é o que `tokenContractParity` e o gate de reserva cobram.
// -------------------------------------------------------------------------

export interface SchemaTokenLike {
    id: string;
    type?: string;
    constraints?: { options?: Array<unknown>; min?: number; max?: number; step?: number };
    /** Opções declaradas no nível de cima do token (57 tokens do schema o fazem): a validação as lê também. */
    options?: Array<unknown>;
}

export interface CatalogEntryLike {
    tokenId: string;
    type?: string;
    allowedValues?: unknown;
}

export interface CatalogDrift {
    tokenId: string;
    field: 'type' | 'allowedValues';
    catalog: string;
    schema: string;
}

const optionText = (option: unknown): string => {
    if (option !== null && typeof option === 'object') {
        const record = option as Record<string, unknown>;
        return String(record.value ?? record.id);
    }
    return String(option);
};

/** O que o schema permite, na forma do catálogo: lista de textos, `{ min, max, step? }` ou `null`. */
export function schemaAllowedValues(token: SchemaTokenLike): string[] | { min?: number; max?: number; step?: number } | null {
    // Como `getEnumOptions` da validação: `constraints.options ?? options`.
    const declared = token.constraints?.options ?? token.options;
    if (Array.isArray(declared) && declared.length > 0) return declared.map(optionText);
    const constraints = token.constraints;
    if (!constraints) return null;
    if (constraints.min === undefined && constraints.max === undefined) return null;
    const range: { min?: number; max?: number; step?: number } = {};
    if (constraints.min !== undefined) range.min = constraints.min;
    if (constraints.max !== undefined) range.max = constraints.max;
    if (constraints.step !== undefined) range.step = constraints.step;
    return range;
}

const canonical = (value: unknown): string => {
    if (Array.isArray(value)) return JSON.stringify(value.map(optionText).sort());
    if (value !== null && typeof value === 'object') {
        const record = value as Record<string, unknown>;
        return JSON.stringify({ min: record.min, max: record.max, step: record.step });
    }
    return 'null';
};

/** As diferenças de tipo e de valores permitidos entre o catálogo e o schema. */
export function findCatalogDrift(schemaTokens: SchemaTokenLike[], catalogEntries: CatalogEntryLike[]): CatalogDrift[] {
    const byId = new Map(schemaTokens.map((token) => [token.id, token]));
    const drift: CatalogDrift[] = [];
    for (const entry of catalogEntries) {
        const token = byId.get(entry.tokenId);
        if (!token) continue;
        if (entry.type !== token.type) {
            drift.push({ tokenId: entry.tokenId, field: 'type', catalog: String(entry.type), schema: String(token.type) });
        }
        const expected = canonical(schemaAllowedValues(token));
        const actual = canonical(entry.allowedValues);
        if (expected !== actual) drift.push({ tokenId: entry.tokenId, field: 'allowedValues', catalog: actual, schema: expected });
    }
    return drift;
}
