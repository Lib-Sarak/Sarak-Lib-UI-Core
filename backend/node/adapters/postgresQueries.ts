/**
 * Construção pura (sem I/O) dos identificadores de tabela Postgres qualificados por
 * schema. Extraído do adapter para ser testável sem um Postgres real (Spec 19 §4 —
 * "queries geradas assertadas por snapshot" quando não há ambiente de banco disponível).
 */
import { sanitizeIdentifier } from '../identifiers';

/** `"schema"."table"`, com `schema` sanitizado (nunca concatenação livre). */
export const qualifyTable = (schema: string, table: string): string => {
    const s = sanitizeIdentifier(schema, 'schema');
    return `"${s}"."${table}"`;
};
