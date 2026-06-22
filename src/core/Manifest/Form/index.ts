/**
 * Bloco Funcional — Formulários (Onda 3: Specs 29 + 32)
 *
 * Validação declarativa (Spec 29), binding bidirecional `model` e ciclo de vida do
 * `form` (Spec 32). Consumido pelo LeafNode (fiação dos campos) e pelo Dispatcher
 * (bloqueio/montagem do submit).
 */

// Spec 29 — Validação
export {
    validateValue,
    firstErrorMessage,
    type ValidationError,
} from './validate';

// Spec 32 — Escopo de formulário e two-way binding
export {
    createFormScope,
    FORM_META_KEY,
    type FormScope,
    type FormStore,
} from './formScope';
export { FormScopeContext, useFormScope } from './context';
export { resolveModelValue, coerceEventValue } from './model';
