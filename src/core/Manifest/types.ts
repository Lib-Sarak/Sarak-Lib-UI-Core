/**
 * Manifest Schema e Gramática do Nó (Spec 20). `ManifestNode` é a Lei do JSON do bloco
 * funcional — análoga ao `SarakThemePayload` do Design Engine; todos os motores a consomem.
 * Contrato Zero Any (Regra 3): cada diretiva tem tipo próprio (sem `any` nem `Record`
 * aberto); as specs donas refinam os tipos sem quebrar o contrato.
 */

import type { DirectiveName } from './directives';
import type { ThemePresetId } from '../Design/presets/themes';
import type { SarakThemePayload } from '../Provider/types';

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

// --- Diretivas reservadas — tipos próprios (refinados pelas specs donas) ---

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
    /** Atraso de disparo em ms (debounce declarativo — aguarda a parada). */
    debounce?: number;
    /** Taxa máxima de disparo em ms (throttle declarativo — limita a frequência). */
    throttle?: number;
    /**
     * Marca um `api_call` como submit de formulário (Spec 29/32): monta o payload a
     * partir dos `model` do form-escopo ativo e é BLOQUEADO se a Validação acusar erro.
     */
    submit?: boolean;
}

/** Lista de ações associadas a um evento/nó (Spec 25). */
export type ActionList = ManifestAction[];

/** Diretiva de persistência local (Spec 28). */
export interface PersistDirective {
    /** Chave sob a qual o estado é salvo/restaurado no storage (namespaced p/ `@sarak:`). */
    key: string;
    /** Se `true`, o valor é ofuscado (base64) antes de persistir no storage visível (Regra 4). */
    sensitive?: boolean;
}

/** Nomes de regra de validação suportados (Spec 29, Regra 1). */
export type ValidationRuleName = 'required' | 'minLength' | 'maxLength' | 'pattern' | 'type';

/** Tipos semânticos validáveis pela regra `type` (Spec 29, Regra 1). */
export type ValidationTypeName = 'email' | 'url' | 'numero';

/** Regra única de validação de campo (Spec 29). */
export interface ValidationRule {
    /** Identificador da regra: `required`, `minLength`, `maxLength`, `pattern`, `type`. */
    rule: ValidationRuleName;
    /**
     * Argumento da regra: comprimento (`minLength`/`maxLength`), regex string
     * (`pattern`) ou nome do tipo (`type`). `required` dispensa argumento.
     */
    value?: number | string;
    /** Mensagem custom exibida quando a regra falha (Regra 4). */
    message?: string;
}

/** Schema de validação de um campo/formulário (Spec 29). */
export type ValidationSchema = ValidationRule[];

/** Método HTTP declarativo da fonte de dados (Spec 31). */
export type DataSourceMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** Estados do ciclo de vida de um nó de dados (Spec 31, Regra 2). */
export type DataNodeState = 'loading' | 'success' | 'empty' | 'error';

/** Overrides dos estados de um nó com `source` (Spec 31, Regra 2): cada estado pode ter nó próprio. */
export interface DataSourceStates {
    /** Nó exibido durante o carregamento (default: Skeleton mínimo). */
    loading?: ManifestNode;
    /** Nó exibido quando o resultado é vazio (default: Empty State mínimo). */
    empty?: ManifestNode;
    /** Nó exibido em caso de erro (default: Fallback). */
    error?: ManifestNode;
}

/**
 * Fonte de dados assíncrona (Spec 31): carrega ao montar, deposita em `into`, expõe
 * o ciclo de vida; a E/S passa pelo `networkInterceptor` injetado (Regra 5).
 */
export interface DataSourceDirective {
    /** Endpoint/identificador da fonte (interpolável). */
    endpoint: string;
    /** Método HTTP (default: `GET`). */
    method?: DataSourceMethod;
    /** Parâmetros declarativos (interpoláveis via Spec 24). */
    params?: ManifestProps;
    /** Chave no DataStore onde o resultado é depositado (de onde o `renderFor` itera). */
    into: string;
    /** Quando disparar a busca (default: `onMount`). */
    trigger?: 'onMount' | 'manual';
    /** Overrides dos nós de estado (loading/empty/error). */
    states?: DataSourceStates;
}

/** Modelo de form / two-way binding (Spec 32, Regra 1): valor lido/escrito via `FormState`, nunca `any`. */
export interface FormModelDirective {
    /** Caminho no estado vinculado ao campo (lido do DataStore e escrito de volta). */
    path: string;
}

/** Evento que dispara o reset de um escopo de formulário (Spec 32, Regra 4). */
export type FormResetTrigger = 'submitSuccess';

/**
 * Diretiva de escopo de formulário (Spec 32, Regra 2). Cria um escopo isolado de
 * estado (valores + dirty + touched + erros) montado sobre o DataStore.
 */
export interface FormScopeDirective {
    /** Identificador do escopo de formulário. */
    id: string;
    /** Quando restaurar os valores iniciais (ex.: sucesso do submit). */
    resetOn?: FormResetTrigger;
}

/**
 * Diretiva responsiva (Spec 16, Regra 2): override de props em cascata
 * mobile-first (`mob` base → `tab` → `desk`). Cada camada é `Partial` das props
 * base — Zero Any (Regra 3); resolvida sem remontar o nó (Regra 5).
 */
export interface ResponsiveDirective {
    mob?: Partial<ManifestProps>;
    tab?: Partial<ManifestProps>;
    desk?: Partial<ManifestProps>;
}

/** Alvo de rota (Spec 33): subárvore inline ou referência lazy a manifesto externo. */
export type RouteTarget = ManifestNode | { lazy: string };

/** Mapa de rotas (Spec 33): caminho → subárvore montada na região `content`. */
export type RouteMap = Record<string, RouteTarget>;

/**
 * Diretiva de app-shell (Spec 33, Regra 1): regiões persistentes (sidebar/topbar)
 * + slot `content` ("<slot-rotas>") onde a rota ativa monta sua subárvore.
 */
export interface ShellDirective {
    sidebar?: ManifestNode;
    topbar?: ManifestNode;
    content: string;
}

/** Diretiva de tema por região (Spec 42 — bridge `DesignScope`): preset (`ThemePresetId`) ou
 *  binding `"{{designTheme}}"` (R4), ou override parcial (`SarakThemePayload`) sobre o herdado (R3). */
export type ThemeDirective = ThemePresetId | (string & {}) | Partial<SarakThemePayload>;

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
    form?: FormScopeDirective;
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
    /**
     * Tela de recuperação global (Spec 27, Regra 2): o nó renderizado pelos Error
     * Boundaries quando uma sub-árvore quebra. Ausente → cai no Fallback estático.
     */
    fallbackErrorUI?: ManifestNode;
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
