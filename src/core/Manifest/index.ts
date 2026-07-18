/**
 * Bloco Funcional — Fundação do Contrato (Onda 0)
 *
 * Ponto de re-export interno do "cérebro" do Motor UI: gramática do nó (Spec 20),
 * estado reativo (Spec 21), registry tipado (Spec 22) e o Renderer mínimo (harness).
 * O contrato público para o importador é re-exportado em `src/index.ts`.
 */

// Spec 20 — Manifest Schema e Gramática do Nó
export type {
    ManifestNode,
    ManifestRoot,
    ManifestProps,
    ManifestValue,
    SlotMap,
    RenderForDirective,
    ManifestAction,
    ActionList,
    ConditionExpression,
    BindingExpression,
    PersistDirective,
    ValidationRule,
    ValidationRuleName,
    ValidationTypeName,
    ValidationSchema,
    DataSourceDirective,
    FormModelDirective,
    FormScopeDirective,
    FormResetTrigger,
    ResponsiveDirective,
    ShellDirective,
    RouteMap,
    RouteTarget,
    ThemeDirective,
    AriaDirective,
    DataSourceMethod,
    DataNodeState,
    DataSourceStates,
} from './types';
export { SUPPORTED_SCHEMA_VERSION } from './types';
export {
    RESERVED_DIRECTIVES,
    DIRECTIVE_OWNERS,
    STRUCTURAL_KEYS,
    isReservedDirective,
    isStructuralKey,
    type DirectiveName,
} from './directives';
export {
    validateManifestNode,
    validateManifestRoot,
    separateNodeParts,
    type ManifestValidationError,
    type ManifestValidationResult,
    type NodeParts,
} from './validateNode';

// Spec 21 — DataStore e Estado Reativo
export {
    createSarakDataStore,
    type SarakDataStore,
    type Selector,
} from './DataStore/SarakDataStore';
export {
    getByPath,
    setByPath,
    resolveScopedPath,
    type StateRecord,
} from './DataStore/resolvePath';

// Spec 22 — Component Registry e Resolver
export {
    createComponentRegistry,
    defaultComponentRegistry,
    registerComponent,
    resolveComponent,
    type ComponentRegistry,
    type ComponentType,
    type ComponentResolution,
    type ManifestComponent,
    type ManifestComponentProps,
} from './Registry/ComponentRegistry';
export { NATIVE_COMPONENTS, type NativeComponentType } from './Registry/nativeComponents';
export { SarakFallback, type SarakFallbackProps } from './Registry/Fallback';
export { SarakErrorFallback, type SarakErrorFallbackProps } from './Registry/Fallback';

// Spec 17 — Telas DX da raiz (payload ausente/inválido) e resiliência por diretiva.
export {
    SarakMissingManifestScreen,
    SarakInvalidManifestScreen,
    type SarakInvalidManifestScreenProps,
} from './Registry/InvalidManifestScreen';
export {
    sanitizeDirectives,
    emitDirectiveWarnings,
    resetDirectiveWarnings,
    type DirectiveWarning,
    type SanitizeResult,
} from './nodes/sanitizeDirectives';

// Spec 24 — Data Binding e Pipes
export {
    interpolate,
    interpolateProps,
    resolveExpression,
    resolveBinding,
    registerPipe,
    getPipe,
    hasPipe,
    type Pipe,
} from './Binding';

// Spec 23 — Motor de Repetição (renderFor)
export {
    expandRenderFor,
    VIRTUALIZE_THRESHOLD,
    type ExpandedNode,
    type RenderForResult,
} from './RenderFor';

// Spec 31 — Fonte de Dados Declarativa
export {
    useDataSource,
    type NetworkInterceptor,
    type NetworkRequest,
    type DataSourceController,
} from './DataSource';

// Spec 26 — Motor de Avaliação Condicional (renderIf/disabledIf)
export { evaluateCondition, ConditionSyntaxError } from './Conditional';

// Spec 25 — Dispatcher Central de Eventos
export {
    runActions,
    ACTION_HANDLERS,
    SubmitBlockedError,
    debounce,
    throttle,
    type DispatchContext,
    type ActionHandler,
    type OverlayController,
    type OverlayRequest,
    type NavigateFn,
} from './Dispatcher';

// Specs 29 + 32 — Formulários (validação, two-way `model`, ciclo de vida do `form`)
export {
    validateValue,
    firstErrorMessage,
    createFormScope,
    FORM_META_KEY,
    FormScopeContext,
    useFormScope,
    resolveModelValue,
    coerceEventValue,
    type ValidationError,
    type FormScope,
    type FormStore,
} from './Form';

// Spec 27 — Error Boundaries e Fallbacks as Data
export { SarakErrorBoundary, type SarakErrorBoundaryProps } from './ErrorBoundary';

// Spec 28 — Persistência de Estado Local (localStorage)
export {
    STORAGE_NAMESPACE,
    namespacedKey,
    readPersisted,
    writePersisted,
    removePersisted,
    subscribeStorage,
    usePersistedSlice,
} from './Storage';

// Spec 30 — Renderer (Motor de Dados Vivo a partir da Onda 1)
export {
    SarakManifestRenderer,
    default as SarakManifestRendererDefault,
    type SarakManifestRendererProps,
} from './SarakManifestRenderer';

// Spec 08 §3.1 — Manifesto-starter oficial (shell + navegação + Design Engine).
// O mesmo conteúdo é distribuído como arquivo em `templates/app-starter.manifest.json`.
export { SARAK_STARTER_MANIFEST } from './templates/starter';

// Spec 16 — Resolutor oficial de tokens semânticos de espaçamento.
export {
    SPACING_TOKENS,
    SPACING_TOKEN_NAMES,
    isPassthroughCss,
    isResolvableSpacing,
    resolveToken,
    resetTokenWarnings,
    type ResolveTokenOptions,
} from './Tokens';
