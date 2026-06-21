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
    ValidationSchema,
    DataSourceDirective,
    FormModelDirective,
    ResponsiveDirective,
    ShellDirective,
    RouteMap,
    ThemeDirective,
    AriaDirective,
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

// Spec 30 (mínima) — Renderer harness
export {
    SarakManifestRenderer,
    default as SarakManifestRendererDefault,
    type SarakManifestRendererProps,
} from './SarakManifestRenderer';
