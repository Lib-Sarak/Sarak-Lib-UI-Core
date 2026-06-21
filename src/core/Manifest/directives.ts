/**
 * Catálogo Canônico de Diretivas Reservadas (Spec 20 — Onda 0)
 *
 * Análogo funcional do `theme_table_mapping` do Design Engine: cada chave de
 * COMPORTAMENTO do Manifesto vive aqui, com sua spec dona. A Conferência
 * Funcional (Spec 34) valida que cada entrada tem tipo + engine + teste.
 *
 * Diretivas NUNCA vazam como atributos de DOM — são interceptadas pelos motores
 * antes da renderização. Apenas `props` chegam ao átomo visual (Regra 4 da Spec 20).
 *
 * Este array é a fonte da verdade (C — Catálogo) consultada por:
 *  - `validateNode` (rejeita chave reservada escrita errado / chave fora do contrato);
 *  - `auditor_manifesto.mjs` (Spec 34 — cruza Contrato TS ↔ Runtime ↔ Catálogo).
 */

/**
 * Chaves estruturais do nó que NÃO são diretivas de comportamento nem `props`.
 * São tratadas explicitamente pela gramática (Regra 1 e Regra 6 da Spec 20).
 */
export const STRUCTURAL_KEYS = ['type', 'id', 'props', 'children', 'schemaVersion'] as const;
export type StructuralKey = (typeof STRUCTURAL_KEYS)[number];

/**
 * Nome canônico de cada diretiva reservada. União fechada e versionada:
 * adicionar capacidade funcional nova = adicionar uma entrada aqui (e seu tipo
 * em `types.ts`), sob validação da Conferência Funcional (Spec 34, Regra 5).
 */
export const RESERVED_DIRECTIVES = [
    'slots',
    'renderFor',
    'bindings',
    'actions',
    'onError',
    'renderIf',
    'disabledIf',
    'persistState',
    'validation',
    'source',
    'model',
    'form',
    'responsive',
    'shell',
    'routes',
    'theme',
    'aria',
] as const;

export type DirectiveName = (typeof RESERVED_DIRECTIVES)[number];

/**
 * Mapa diretiva → spec dona (a engine que a consome). Documenta a propriedade
 * de cada diretiva e alimenta a Regra 1 (3 Fontes da Verdade) da Spec 34.
 */
export const DIRECTIVE_OWNERS: Readonly<Record<DirectiveName, string>> = {
    slots: '20-manifest-schema-e-gramatica-no',
    renderFor: '23-motor-de-repeticao-renderfor',
    bindings: '24-motor-de-data-binding-pipes',
    actions: '25-dispatcher-central-de-eventos',
    onError: '25-dispatcher-central-de-eventos',
    renderIf: '26-motor-avaliacao-condicional',
    disabledIf: '26-motor-avaliacao-condicional',
    persistState: '28-persistencia-estado-local',
    validation: '29-validacao-schema-formularios',
    source: '31-fonte-de-dados-declarativa',
    model: '32-binding-bidirecional-de-formulario',
    form: '32-binding-bidirecional-de-formulario',
    responsive: '16-responsividade-como-dado',
    shell: '33-composicao-pagina-rota-shell',
    routes: '33-composicao-pagina-rota-shell',
    theme: '42-ponte-tema-designscope',
    aria: '41-contrato-de-acessibilidade',
} as const;

const RESERVED_SET: ReadonlySet<string> = new Set(RESERVED_DIRECTIVES);
const STRUCTURAL_SET: ReadonlySet<string> = new Set(STRUCTURAL_KEYS);

/** True se `key` é uma diretiva reservada conhecida. */
export const isReservedDirective = (key: string): key is DirectiveName => RESERVED_SET.has(key);

/** True se `key` é uma chave estrutural da gramática (type/id/props/children/schemaVersion). */
export const isStructuralKey = (key: string): key is StructuralKey => STRUCTURAL_SET.has(key);
