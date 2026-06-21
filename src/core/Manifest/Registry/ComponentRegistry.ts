/**
 * Component Registry e Resolver (Spec 22)
 *
 * Mapa de resolução `type → componente React`. Ponte entre a camada lógica (lê o
 * JSON) e a visual (átomos das Specs 10–15). Tipado e fechado por padrão (Regra 1),
 * com fallback seguro (Regra 2), passagem restrita de props (Regra 3), registro de
 * customizados pelo importador (Regra 4) e suporte a lazy (Regra 5).
 *
 * Zero Any: o keyword `any` não aparece. Componentes heterogêneos são guardados sob
 * `ManifestComponent` via cast tipado (`as unknown as`), nunca via `any`.
 */

import React from 'react';
import { SarakFallback } from './Fallback';
import { NATIVE_COMPONENTS, type NativeComponentType } from './nativeComponents';

/** Props que um componente renderizável recebe do manifesto (apenas dados + children). */
export interface ManifestComponentProps {
    children?: React.ReactNode;
    [prop: string]: unknown;
}

/** Tipo uniforme sob o qual qualquer componente é guardado no registry. */
export type ManifestComponent = React.ComponentType<ManifestComponentProps>;

/**
 * União de string-literais dos `type` oficiais da Sarak (Regra 1). Derivada das
 * chaves do mapa nativo: registrar/remover um átomo atualiza este tipo
 * automaticamente — barrando, em tempo de compilação, um `type` fora do conjunto.
 */
export type ComponentType = NativeComponentType;

/** Resultado de uma resolução de `type`. */
export interface ComponentResolution {
    /** Componente a renderizar (real ou fallback). */
    Component: ManifestComponent;
    /** True quando caiu no fallback (type desconhecido). */
    isFallback: boolean;
}

/** Contrato público do registry (Spec 22, §2). */
export interface ComponentRegistry {
    /** Resolve um `type` para um componente; nunca lança (cai no fallback). */
    resolve(type: string, nodeId?: string): ComponentResolution;
    /** Registra/atualiza um componente para um `type` (importador — Regra 4). */
    register<P extends object>(type: string, component: React.ComponentType<P>): void;
    /** True se o `type` está registrado. */
    has(type: string): boolean;
    /** Componente de fallback usado para `type` desconhecido. */
    getFallback(): ManifestComponent;
}

const toManifestComponent = <P extends object>(
    component: React.ComponentType<P>,
): ManifestComponent => component as unknown as ManifestComponent;

/** Cria um registry isolado, semeado com os componentes nativos oficiais. */
export const createComponentRegistry = (): ComponentRegistry => {
    const map = new Map<string, ManifestComponent>();

    for (const [type, component] of Object.entries(NATIVE_COMPONENTS)) {
        map.set(type, component as unknown as ManifestComponent);
    }

    const getFallback = (): ManifestComponent =>
        SarakFallback as unknown as ManifestComponent;

    return {
        has: (type: string): boolean => map.has(type),

        register: <P extends object>(type: string, component: React.ComponentType<P>): void => {
            map.set(type, toManifestComponent(component));
        },

        getFallback,

        resolve: (type: string, nodeId?: string): ComponentResolution => {
            const found = map.get(type);
            if (found) {
                return { Component: found, isFallback: false };
            }
            // Regra 2: não lança — loga o nó culpado e devolve o fallback.
            console.warn(
                `[Sarak:Manifest] type desconhecido "${type}"${nodeId ? ` (id: "${nodeId}")` : ''}. Renderizando fallback.`,
            );
            return { Component: getFallback(), isFallback: true };
        },
    };
};

/** Registry singleton padrão da biblioteca (usado pelo Renderer e pela API pública). */
export const defaultComponentRegistry: ComponentRegistry = createComponentRegistry();

/**
 * API pública para o importador registrar um componente customizado sem fork (Regra 4).
 * Exportada em `src/index.ts`.
 */
export const registerComponent = <P extends object>(
    type: string,
    component: React.ComponentType<P>,
): void => {
    defaultComponentRegistry.register(type, component);
};

/** Helper para resolver via registry padrão. */
export const resolveComponent = (type: string, nodeId?: string): ComponentResolution =>
    defaultComponentRegistry.resolve(type, nodeId);
