/**
 * Sanitização estrita de identificadores SQL (schema/tablePrefix) interpolados
 * diretamente em texto de query (Postgres/SQLite não aceitam identificador como
 * parâmetro bind — `$1`/`?` só cobrem VALORES). Sem esta barreira, `schema`/
 * `tablePrefix` vindos de `options` do consumidor seriam superfície de SQL
 * injection (Spec 19 §2.1 — Plano de Testes, caso `"a";DROP`).
 */
const IDENTIFIER_RE = /^[A-Za-z_][A-Za-z0-9_-]*$/;

export function sanitizeIdentifier(value: string, label: string): string {
    if (!IDENTIFIER_RE.test(value)) {
        throw new Error(
            `[Sarak-UI-Core/bridge-node] "${label}" inválido: "${value}" — use apenas letras, números, "_" e "-", começando por letra ou "_".`,
        );
    }
    return value;
}
