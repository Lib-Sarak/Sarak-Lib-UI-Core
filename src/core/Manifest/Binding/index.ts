/**
 * Motor de Data Binding e Pipes (Spec 24) — barrel.
 *
 * Engine de interpolação `{{ }}` + registro de pipes de formatação. Consumido pelo
 * Renderer (props) e pelo motor de repetição (Spec 23, resolução da lista-fonte).
 */

export {
    interpolate,
    interpolateProps,
    resolveExpression,
    resolveBinding,
} from './interpolate';
export {
    registerPipe,
    getPipe,
    hasPipe,
    type Pipe,
} from './pipes';
