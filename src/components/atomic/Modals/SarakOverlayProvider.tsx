/**
 * SarakOverlayProvider + useOverlay (Spec 13 ↔ Spec 25)
 *
 * Host imperativo de overlays que o Dispatcher abre via `open_modal`/`open_drawer`.
 * Mantém um único overlay ativo por vez e o materializa no `SarakModal`/`SarakDrawer`.
 * Os métodos `open`/`close` casam estruturalmente com o `OverlayController` do
 * Dispatcher — sem import cruzado core↔components (evita ciclo). `confirm()` amplia a
 * API do componente para diálogos com resultado booleano.
 *
 * O overlay aceita `title` + `message`; `confirm()` também permite rótulos customizados
 * e tom destrutivo. Conteúdo rico continua reservado para refinamento posterior.
 * A confirmação resolve `false` ao cancelar, fechar, substituir o overlay ou desmontar.
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { SarakButton } from '../Buttons/SarakButton';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { SarakDrawer } from './SarakDrawer';
import { SarakModal } from './SarakModal';

export interface SarakOverlayRequest {
    kind: 'modal' | 'drawer';
    title?: string;
    message?: string;
}

/** Opções visuais e textuais do diálogo de confirmação imperativo. */
export interface SarakConfirmOptions {
    /** Título do diálogo. */
    title: string;
    /** Mensagem que explica a ação a confirmar. */
    message: string;
    /** Rótulo do botão de confirmação (padrão localizado: Confirmar). */
    confirmLabel?: string;
    /** Rótulo do botão de cancelamento (padrão localizado: Cancelar). */
    cancelLabel?: string;
    /** Estilo do botão de confirmação; `danger` indica uma ação destrutiva. */
    tone?: 'default' | 'danger';
}

type ActiveOverlayRequest = SarakOverlayRequest & { confirmation?: SarakConfirmOptions };

/** Casa estruturalmente com o `OverlayController` do Dispatcher, sem import cruzado. */
export interface SarakOverlayController {
    /** Abre um modal ou drawer com título e mensagem opcionais. */
    open(request: SarakOverlayRequest): void;
    /** Fecha o overlay atual; uma confirmação pendente resolve com `false`. */
    close(): void;
    /** Abre um diálogo de confirmação e resolve `true` se confirmado, senão `false`. */
    confirm(options: SarakConfirmOptions): Promise<boolean>;
}

interface OverlayProviderState {
    current: ActiveOverlayRequest | null;
    controller: SarakOverlayController;
    close: () => void;
    finishConfirmation: (confirmed: boolean) => void;
}

const OverlayContext = createContext<SarakOverlayController | null>(null);

const useOverlayProviderState = (): OverlayProviderState => {
    const [current, setCurrent] = useState<ActiveOverlayRequest | null>(null);
    const pendingConfirmation = useRef<((confirmed: boolean) => void) | null>(null);
    const resolvePendingConfirmation = useCallback((confirmed: boolean) => {
        const resolve = pendingConfirmation.current;
        pendingConfirmation.current = null;
        resolve?.(confirmed);
    }, []);
    const open = useCallback((request: SarakOverlayRequest) => {
        resolvePendingConfirmation(false);
        setCurrent(request);
    }, [resolvePendingConfirmation]);
    const close = useCallback(() => {
        resolvePendingConfirmation(false);
        setCurrent(null);
    }, [resolvePendingConfirmation]);
    const confirm = useCallback((options: SarakConfirmOptions) => new Promise<boolean>((resolve) => {
        resolvePendingConfirmation(false);
        pendingConfirmation.current = resolve;
        setCurrent({ kind: 'modal', title: options.title, message: options.message, confirmation: options });
    }), [resolvePendingConfirmation]);
    const finishConfirmation = useCallback((confirmed: boolean) => {
        resolvePendingConfirmation(confirmed);
        setCurrent(null);
    }, [resolvePendingConfirmation]);
    const controller = useMemo<SarakOverlayController>(() => ({ open, close, confirm }), [open, close, confirm]);

    useEffect(() => () => resolvePendingConfirmation(false), [resolvePendingConfirmation]);
    return { current, controller, close, finishConfirmation };
};

const ModalConfirmationActions = ({ confirmation, onFinish }: {
    confirmation: SarakConfirmOptions;
    onFinish: (confirmed: boolean) => void;
}): React.ReactElement => {
    const text = useLibraryText();
    return (
        <div className="flex w-full justify-end" style={{ gap: 'var(--sarak-layout-gap-sm, 8px)' }}>
            <SarakButton type="button" variant="secondary" onClick={() => onFinish(false)}>
                {confirmation.cancelLabel ?? text('dialogCancel')}
            </SarakButton>
            <SarakButton
                type="button"
                variant={confirmation.tone === 'danger' ? 'danger' : 'primary'}
                onClick={() => onFinish(true)}
            >
                {confirmation.confirmLabel ?? text('dialogConfirm')}
            </SarakButton>
        </div>
    );
};

const OverlayHost = ({ current, close, finishConfirmation }: {
    current: ActiveOverlayRequest | null;
    close: () => void;
    finishConfirmation: (confirmed: boolean) => void;
}): React.ReactElement => (
    <>
        <SarakModal
            isOpen={current?.kind === 'modal'}
            onClose={close}
            title={current?.title}
            footer={current?.confirmation ? (
                <ModalConfirmationActions confirmation={current.confirmation} onFinish={finishConfirmation} />
            ) : undefined}
        >
            <p>{current?.message}</p>
        </SarakModal>
        <SarakDrawer isOpen={current?.kind === 'drawer'} onClose={close}>
            <div style={{ padding: 'var(--sarak-layout-gap-lg, 24px)' }}>
                {current?.title && <h2 className="text-lg font-bold" style={{ marginBottom: 'var(--sarak-layout-gap-sm, 8px)' }}>{current.title}</h2>}
                <p>{current?.message}</p>
            </div>
        </SarakDrawer>
    </>
);

export const SarakOverlayProvider = ({ children }: { children: React.ReactNode }): React.ReactElement => {
    const state = useOverlayProviderState();
    return (
        <OverlayContext.Provider value={state.controller}>
            {children}
            <OverlayHost current={state.current} close={state.close} finishConfirmation={state.finishConfirmation} />
        </OverlayContext.Provider>
    );
};

const NOOP_OVERLAY_CONTROLLER: SarakOverlayController = {
    open: () => undefined,
    close: () => undefined,
    confirm: () => Promise.resolve(false),
};

/** Acessa o controller de overlays; no-op fora do Provider (degrada sem quebrar). */
export const useOverlay = (): SarakOverlayController => useContext(OverlayContext) ?? NOOP_OVERLAY_CONTROLLER;
