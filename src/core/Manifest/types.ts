/**
 * Manifest Schema e Gramática do Nó (Spec 20 — Onda 0)
 *
 * `ManifestNode` é a Lei do JSON do bloco funcional — análoga ao `SarakThemePayload`
 * para o Design Engine. Todos os motores (renderFor, pipes, dispatcher, condicional,
 * validação) consomem esta gramática única.
 *
 * Contrato Zero Any (Regra 3): cada diretiva tem tipo próprio; não há `any` nem
 * `Record<string, unknown>` aberto nas diretivas. Nesta onda (0) as engines donas
 * (23–42) ainda não existem, então as diretivas são tipadas como PLACEHOLDERS
 * versionados — formato estável que as specs donas refinam sem quebrar o contrato.
 */

import type { DirectiveName } from './directives';

// ---------------------------------------------------------------------------
// Valores primitivos do manifesto (JSON-serializável, sem `any`)
// ---------------------------------------------------------------------------

/** Valor serializável de um manifesto JSON. Substitui qualquer `any` em props. */
export type ManifestValue =
    | string
    | number
    | boolean
    | null
    | ManifestValue[]
    | { [key: string]: ManifestValue };

/** Bag de props visuais repassadas ao átomo (apenas dados, nunca comportamento). */
export type ManifestProps = Record<string, ManifestValue>;

// ---------------------------------------------------------------------------
// Diretivas reservadas — tipos próprios (placeholders versionados da Onda 0)
// ---------------------------------------------------------------------------

/** Expressão de template do tipo `"{{caminho.de.estado}}"`. */
export type BindingExpression = string;

/** Expressão condicional avaliada de forma segura (Spec 26). Ex.: `"{{role}} === 'ADMIN'"`. */
export type ConditionExpression = string;

/** Diretiva de repetição (Spec 23). `source` aponta para a lista no estado. */
export interface RenderForDirective {
    /** Caminho/binding da lista a iterar (ex.: `"{{users}}"`). */
    source: BindingExpression;
    /** Nome da variável de item no escopo local (default: `item`). */
    as?: string;
    /** Nome da variável de índice no escopo local (default: `index`). */
    indexAs?: string;
    /** Caminho de propriedade usado como chave estável de reconciliação. */
    keyBy?: string;
}

/** Uma ação declarativa do dispatcher (Spec 25). Refinada pela spec dona. */
export interface ManifestAction {
    /** Tipo de ação: `api_call`, `navigate`, `mutate_state`, `trigger_toast`, etc. */
    type: string;
    /** Carga declarativa da ação (interpolável). */
    payload?: ManifestProps;
    /** Atraso de disparo em ms (debounce declarativo). */
    debounce?: number;
}

/** Lista de ações associadas a um evento/nó (Spec 25). */
export type ActionList = ManifestAction[];

/** Diretiva de persistência local (Spec 28). */
export interface PersistDirective {
    /** Chave sob a qual o estado é salvo/restaurado no storage. */
    key: string;
}

/** Regra única de validação de campo (Spec 29). */
export interface ValidationRule {
    /** Identificador da regra: `required`, `pattern`, `min`, `max`, etc. */
    rule: string;
    /** Argumento da regra (ex.: o regex de `pattern`). */
    value?: ManifestValue;
    /** Mensagem exibida quando a regra falha. */
    message?: string;
}

/** Schema de validação de um campo/formulário (Spec 29). */
export type ValidationSchema = ValidationRule[];

/** Diretiva de fonte de dados assíncrona (Spec 31). */
export interface DataSourceDirective {
    /** Endpoint/identificador da fonte. */
    endpoint: string;
    /** Caminho no estado onde o resultado é depositado. */
    target?: string;
}

/** Diretiva de modelo de formulário / two-way binding (Spec 32). */
export interface FormModelDirective {
    /** Caminho no estado vinculado ao campo. */
    path: string;
}

/** Diretiva responsiva (Spec 16). Override de props por breakpoint. */
export interface ResponsiveDirective {
    /** Overrides aplicados por breakpoint (`desktop`/`tablet`/`mobile`). */
    breakpoints: Record<string, ManifestProps>;
}

/** Mapa de rotas declarativas (Spec 33). */
export type RouteMap = Record<string, ManifestNode>;

/** Diretiva de app-shell (Spec 33). */
export interface ShellDirective {
    /** Identificador do layout de shell. */
    layout?: string;
}

/** Diretiva de tema por região (Spec 42 — bridge com DesignScope). */
export interface ThemeDirective {
    /** Nome do preset/escopo de tema aplicado à sub-árvore. */
    scope: string;
}

/** Diretiva de acessibilidade (Spec 41). */
export type AriaDirective = Record<string, string | number | boolean>;

/** Mapa de slots nomeados (Spec 20, Regra 6). Ex.: header/body/footer. */
export type SlotMap = Record<string, ManifestNode>;

// ---------------------------------------------------------------------------
// O nó do Manifesto
// ---------------------------------------------------------------------------

/**
 * Nó canônico do Manifesto (Spec 20). Forma: `{ type, id?, props?, children?, ...diretivas }`.
 * `type` é resolvido pelo Component Registry (Spec 22).
 */
export interface ManifestNode {
    /** Tipo do componente, resolvido pelo Registry (Spec 22). */
    type: string;
    /** Identificador opcional do nó (usado em mensagens de erro e reconciliação). */
    id?: string;
    /** Props visuais repassadas ao átomo (apenas dados). */
    props?: ManifestProps;
    /** Filhos aninhados (lista). */
    children?: ManifestNode[];
    /** Regiões nomeadas (Regra 6). */
    slots?: SlotMap;

    // --- Diretivas reservadas (comportamento; nunca vazam ao DOM) ---
    renderFor?: RenderForDirective;
    bindings?: BindingExpression[];
    actions?: ActionList;
    onError?: ActionList;
    renderIf?: ConditionExpression;
    disabledIf?: ConditionExpression;
    persistState?: PersistDirective;
    validation?: ValidationSchema;
    source?: DataSourceDirective;
    model?: FormModelDirective;
    form?: FormModelDirective;
    responsive?: ResponsiveDirective;
    shell?: ShellDirective;
    routes?: RouteMap;
    theme?: ThemeDirective;
    aria?: AriaDirective;
}

/**
 * Nó raiz do Manifesto: declara a versão do schema (Regra 5). O Renderer (Spec 30)
 * recusa versões incompatíveis com fallback explícito.
 */
export interface ManifestRoot extends ManifestNode {
    /** Versão do schema do manifesto (ex.: `1`). */
    schemaVersion: number;
}

/** Versão de schema suportada por esta build da fundação. */
export const SUPPORTED_SCHEMA_VERSION = 1 as const;

/**
 * Verificação de tipo (compile-time): garante que toda `DirectiveName` do catálogo
 * tem uma chave correspondente em `ManifestNode`. Se uma diretiva for adicionada ao
 * catálogo sem campo tipado aqui, isto deixa de compilar (diretiva-fantasma no tipo).
 */
type _DirectiveKeysExistOnNode = DirectiveName extends keyof ManifestNode ? true : never;
const _directiveParityCheck: _DirectiveKeysExistOnNode = true;
void _directiveParityCheck;
