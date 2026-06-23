/**
 * Nó-folha do Manifesto (Spec 22 + 24 + 25 + 26 + 29 + 32)
 *
 * Resolve o `type` (Spec 22), interpola props (Spec 24), aplica `disabledIf` (Spec 26),
 * fia o two-way `model` (Spec 32) com a Validação (Spec 29) e, se houver `actions`,
 * injeta um handler de evento estável (memoizado por modificador) que roda a cadeia do
 * Dispatcher (Spec 25) com debounce/throttle. O handler sempre executa a closure mais
 * recente via ref — o timer sobrevive a re-renders (essencial para o debounce de busca).
 */

import React, { useEffect, useMemo, useReducer, useRef } from 'react';
import type { ManifestNode } from '../types';
import { separateNodeParts } from '../validateNode';
import { interpolateProps } from '../Binding/interpolate';
import { evaluateCondition } from '../Conditional/evaluateCondition';
import { runActions, debounce, throttle, type DispatchContext } from '../Dispatcher';
import { useFormScope } from '../Form/context';
import { resolveModelValue, coerceEventValue } from '../Form/model';
import { validateValue } from '../Form/validate';
import { usePersistedSlice } from '../Storage';
import { SarakFallback } from '../Registry/Fallback';
import { ManifestNodeRenderer } from './renderNode';
import { useResponsiveProps } from './useResponsiveProps';
import { mapAriaDirective } from './aria';
import type { NodeRendererProps } from './context';

/** Maior `debounce`/`throttle` declarado entre as ações do nó (Spec 25, Regra 3). */
const deriveRate = (actions: ManifestNode['actions']): { debounceMs: number; throttleMs: number } => {
    let debounceMs = 0;
    let throttleMs = 0;
    for (const action of actions ?? []) {
        if (typeof action.debounce === 'number') debounceMs = Math.max(debounceMs, action.debounce);
        if (typeof action.throttle === 'number') throttleMs = Math.max(throttleMs, action.throttle);
    }
    return { debounceMs, throttleMs };
};

export const LeafNode: React.FC<NodeRendererProps> = ({ node, path, scope, ctx }) => {
    const actions = node.actions;
    const onError = node.onError;
    const modelPath = node.model?.path;
    const validationSchema = node.validation;
    const { debounceMs, throttleMs } = useMemo(() => deriveRate(actions), [actions]);

    // Escopo de formulário ativo (Spec 32): registra o campo, lê dirty/touched/submit
    // e fornece a validade ao bloqueio de submit (via DispatchContext).
    const formScope = useFormScope();

    // Re-render quando o meta-estado do form muda (touched/submitAttempted) para que o
    // erro apareça mesmo sem mudança de valor (ex.: tentativa de submit).
    const [, forceRender] = useReducer((tick: number) => tick + 1, 0);
    useEffect(() => {
        if (!formScope) return undefined;
        return formScope.subscribe(forceRender);
    }, [formScope]);

    // Registro do campo no escopo do formulário (para validar/montar o submit).
    useEffect(() => {
        if (!formScope || !modelPath) return undefined;
        return formScope.registerField(modelPath, validationSchema);
    }, [formScope, modelPath, validationSchema]);

    // Persistência local (Spec 28): liga a fatia ao localStorage. O caminho é o `model`
    // quando houver; senão o próprio `key` vira o caminho no estado (decisão híbrida).
    const persist = node.persistState;
    usePersistedSlice(
        ctx.store,
        persist ? (modelPath ?? persist.key) : undefined,
        persist?.key,
        persist?.sensitive,
    );

    // Closure sempre atual (lê scope/global frescos) por trás de uma identidade estável.
    const latest = useRef<() => void>(() => undefined);
    latest.current = (): void => {
        if (!actions || actions.length === 0) return;
        const dispatchCtx: DispatchContext = {
            store: ctx.store,
            interceptor: ctx.interceptor,
            toast: ctx.toast,
            navigate: ctx.navigate,
            overlay: ctx.overlay,
            form: formScope ?? undefined,
            scope,
            global: ctx.global,
        };
        void runActions(actions, dispatchCtx, onError);
    };

    const runner = useMemo<() => void>(() => {
        let handler: () => void = () => latest.current();
        if (throttleMs > 0) handler = throttle(handler, throttleMs);
        if (debounceMs > 0) handler = debounce(handler, debounceMs);
        return handler;
    }, [debounceMs, throttleMs]);

    // Responsividade como dado (Spec 16): sobrepõe as props base com a camada do
    // breakpoint ativo ANTES da interpolação (cascata mobile-first). Hook chamado
    // incondicionalmente, antes de qualquer early-return.
    const { props } = separateNodeParts(node);
    const responsiveProps = useResponsiveProps(props, node.responsive);

    const { Component, isFallback } = ctx.registry.resolve(node.type, node.id ?? path);
    if (isFallback) {
        return <SarakFallback type={node.type} nodeId={node.id ?? path} />;
    }

    // Props finais são `unknown` para acomodar handlers de evento (funções não são `ManifestValue`).
    const finalProps: Record<string, unknown> = { ...interpolateProps(responsiveProps, scope, ctx.global) };

    // a11y como dado (Spec 41, Regra 5): a diretiva `aria` do nó vira atributos ARIA reais
    // repassados ao átomo (`label` → `aria-label`, etc.). Aplicada antes do `disabledIf`
    // para que o `aria-disabled` derivado da regra (abaixo) tenha a palavra final.
    Object.assign(finalProps, mapAriaDirective(node.aria));

    // `disabledIf` (Spec 26, Regra 2): NÃO remove o nó — apenas bloqueia ações. Injeta
    // `disabled`/`aria-disabled` e o átomo aplica seu próprio estilo de desabilitado.
    const isDisabled =
        node.disabledIf !== undefined && evaluateCondition(node.disabledIf, scope, ctx.global);
    if (isDisabled) {
        finalProps.disabled = true;
        finalProps['aria-disabled'] = true;
    }

    // --- Two-way binding `model` (Spec 32, Regra 1) + Validação (Spec 29) ---
    const actionRunner = actions && actions.length > 0 && !isDisabled ? runner : undefined;

    if (modelPath) {
        const modelValue = resolveModelValue(modelPath, scope, ctx.global);
        // Controlado: boolean → `checked` (Switch); demais → `value` (Input/Select/...).
        if (typeof modelValue === 'boolean') {
            finalProps.checked = modelValue;
        } else {
            finalProps.value = (modelValue ?? '') as string | number;
        }

        // Reatividade visual (Spec 29, Regra 3): exibe o erro após `touched` ou submit.
        if (validationSchema && validationSchema.length > 0) {
            const fieldErrors = validateValue(modelValue, validationSchema);
            const reveal = formScope?.isTouched(modelPath) || formScope?.submitAttempted;
            if (fieldErrors.length > 0 && reveal) {
                finalProps.error = fieldErrors[0].message;
            }
        }
    }

    // onChange: escreve o valor de volta (model) e/ou dispara as ações (Dispatcher).
    if (modelPath || actionRunner) {
        finalProps.onChange = (event: unknown): void => {
            if (modelPath && !isDisabled) {
                ctx.store?.set(modelPath, coerceEventValue(event));
                formScope?.markDirty(modelPath);
            }
            actionRunner?.();
        };
    }

    // onBlur: marca o campo como tocado para revelar o erro de validação (Spec 29).
    if (modelPath && validationSchema && validationSchema.length > 0) {
        finalProps.onBlur = (): void => {
            formScope?.markTouched(modelPath);
        };
    }

    // Clique (botões) dispara a cadeia do Dispatcher.
    if (actionRunner) {
        finalProps.onClick = actionRunner;
    }

    const children = node.children?.map((child, index) => (
        <ManifestNodeRenderer
            key={`${path}.children[${index}]`}
            node={child}
            path={`${path}.children[${index}]`}
            scope={scope}
            ctx={ctx}
        />
    ));

    return <Component {...finalProps}>{children}</Component>;
};
