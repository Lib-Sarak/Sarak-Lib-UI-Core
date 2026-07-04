/**
 * SarakOverlayProvider + useOverlay (Spec 13 ↔ Spec 25)
 *
 * Host imperativo de overlays que o Dispatcher abre via `open_modal`/`open_drawer`.
 * Mantém um único overlay ativo por vez e o materializa no `SarakModal`/`SarakDrawer`.
 * O controller (`open`/`close`) casa estruturalmente com o `OverlayController` do
 * Dispatcher — sem import cruzado core↔components (evita ciclo).
 *
 * Conteúdo nesta onda: `title` + `message` (texto). Conteúdo rico como nó de manifesto
 * é refinamento posterior (Spec 30/33).
 */

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { SarakModal } from './SarakModal';
import { SarakDrawer } from './SarakDrawer';

export interface SarakOverlayRequest {
    kind: 'modal' | 'drawer';
    title?: string;
    message?: string;
}

/** Casa estruturalmente com o `OverlayController` do Dispatcher (Spec 25), sem import cruzado. */
export interface SarakOverlayController {
    open(request: SarakOverlayRequest): void;
    close(): void;
}

const OverlayContext = createContext<SarakOverlayController | null>(null);

export const SarakOverlayProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [current, setCurrent] = useState<SarakOverlayRequest | null>(null);

    const open = useCallback((request: SarakOverlayRequest) => setCurrent(request), []);
    const close = useCallback(() => setCurrent(null), []);
    const controller = useMemo<SarakOverlayController>(() => ({ open, close }), [open, close]);

    const isModal = current?.kind === 'modal';
    const isDrawer = current?.kind === 'drawer';

    return (
        <OverlayContext.Provider value={controller}>
            {children}

            <SarakModal isOpen={isModal} onClose={close} title={current?.title}>
                <p>{current?.message}</p>
            </SarakModal>

            <SarakDrawer isOpen={isDrawer} onClose={close}>
                <div style={{ padding: 'var(--sarak-layout-gap-lg, 24px)' }}>
                    {current?.title && <h2 className="text-lg font-bold" style={{ marginBottom: 'var(--sarak-layout-gap-sm, 8px)' }}>{current.title}</h2>}
                    <p>{current?.message}</p>
                </div>
            </SarakDrawer>
        </OverlayContext.Provider>
    );
};

/** Acessa o controller de overlays; no-op fora do Provider (degrada sem quebrar). */
export const useOverlay = (): SarakOverlayController => {
    const ctx = useContext(OverlayContext);
    const noop = useMemo<SarakOverlayController>(
        () => ({
            open: (): void => {
                console.warn('[Sarak:Overlay] useOverlay() sem SarakOverlayProvider; ignorado.');
            },
            close: (): void => undefined,
        }),
        [],
    );
    return ctx ?? noop;
};
