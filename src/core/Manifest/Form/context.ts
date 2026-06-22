/**
 * Contexto React do Escopo de Formulário (Spec 32)
 *
 * Distribui o `FormScope` ativo para os campos descendentes (que têm `model`) e para
 * o botão de submit (que consulta a validade via Dispatcher). Fora de um `form`, o
 * contexto é `null` e os campos operam soltos (model ainda funciona; só não há escopo
 * de submit/reset).
 */

import { createContext, useContext } from 'react';
import type { FormScope } from './formScope';

/** Contexto do escopo de formulário ativo (null fora de um `form`). */
export const FormScopeContext = createContext<FormScope | null>(null);

/** Lê o escopo de formulário ativo, se houver. */
export const useFormScope = (): FormScope | null => useContext(FormScopeContext);
