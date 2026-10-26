import * as TanstackReactVirtual from '@tanstack/react-virtual';

export type TanstackUseVirtualizer = typeof import('@tanstack/react-virtual').useVirtualizer;

export const getOptionalTanstackUseVirtualizer = (): TanstackUseVirtualizer | undefined => {
    const virtualizerHook: unknown = TanstackReactVirtual.useVirtualizer;
    return typeof virtualizerHook === 'function' ? virtualizerHook as TanstackUseVirtualizer : undefined;
};

export const requireTanstackUseVirtualizer = (): TanstackUseVirtualizer => {
    const virtualizerHook = getOptionalTanstackUseVirtualizer();
    if (!virtualizerHook) {
        throw new Error('The @tanstack/react-virtual peer is required after the optional-peer fallback check.');
    }
    return virtualizerHook;
};
