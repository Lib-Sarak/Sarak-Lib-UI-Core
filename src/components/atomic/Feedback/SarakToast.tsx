/**
 * SarakToast + SarakToastProvider (Spec 13 — Regra 1)
 *
 * Sistema de notificações em pilha, estável (sem conflito de z-index) e tokenizado.
 * As cores mapeiam o Status Schema (`--sarak-status-*-color`), sem hardcode. O
 * Provider expõe um controller imperativo via `useToast()` — é por aqui que o
 * Dispatcher (Spec 25) dispara a ação `trigger_toast`.
 *
 * Cada toast desmonta sozinho após `duration` ms. Quando há uma ação, a duração é de
 * pelo menos cinco segundos; zero ou valor negativo desabilita o auto-dismiss. A pilha
 * empilha com espaçamento, anima a entrada via transição CSS e é renderizada em portal.
 *
 * Zero Any: o controller é tipado; a fronteira não usa `any`.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { SarakPortalScope } from '../../../core/Provider/components/SarakPortalScope';
import { SarakButton } from '../Buttons/SarakButton';
import { SarakIconButton } from '../Buttons/SarakIconButton';
import { useLibraryText } from '../../../core/i18n/useLibraryText';

export type SarakToastVariant = 'success' | 'error' | 'warning' | 'info';

/** Ação opcional apresentada junto à mensagem do toast. */
export interface SarakToastAction {
    /** Texto visível do botão da ação. */
    label: string;
    /** Executado ao acionar o botão; o toast é dispensado em seguida. */
    onClick: () => void;
}

/** Opções aceitas ao criar uma notificação pelo controller de toasts. */
export interface SarakToastOptions {
    /** Texto principal exibido na notificação. */
    message: string;
    /** Variante semântica mapeada às cores do Status Schema (padrão: `info`). */
    variant?: SarakToastVariant;
    /** Duração até o fechamento automático em milissegundos (padrão: 3000). */
    duration?: number;
    /** Título opcional exibido acima da mensagem. */
    title?: string;
    /** Ação opcional exibida como botão; garante duração mínima de cinco segundos. */
    action?: SarakToastAction;
}

/** Controller público para criar e dispensar notificações. */
export interface SarakToastController {
    /** Adiciona uma notificação à pilha e devolve seu id para dispensa manual. */
    notify(options: SarakToastOptions): string;
    /** Remove da pilha a notificação identificada pelo id. */
    dismiss(id: string): void;
}

interface ToastEntry extends SarakToastOptions {
    id: string;
    variant: SarakToastVariant;
    duration: number;
}

interface ToastManager {
    toasts: ToastEntry[];
    notify: (options: SarakToastOptions) => string;
    dismiss: (id: string) => void;
}

const DEFAULT_DURATION_MS = 3000;
const ACTION_TOAST_MINIMUM_DURATION_MS = 5000;
const VARIANT_COLORS: Readonly<Record<SarakToastVariant, string>> = {
    success: 'var(--sarak-status-success-color, var(--theme-success, #10b981))',
    error: 'var(--sarak-status-error-color, var(--theme-error, #ef4444))',
    warning: 'var(--sarak-status-warning-color, var(--theme-warning, #f59e0b))',
    info: 'var(--sarak-status-info-color, var(--theme-info, #3b82f6))',
};

const ToastContext = createContext<SarakToastController | null>(null);

const getToastDuration = (duration: number | undefined, hasAction: boolean): number => {
    const requestedDuration = duration ?? DEFAULT_DURATION_MS;
    if (!hasAction || requestedDuration <= 0) return requestedDuration;
    return Math.max(requestedDuration, ACTION_TOAST_MINIMUM_DURATION_MS);
};

const clearToastTimer = (timers: Map<string, ReturnType<typeof setTimeout>>, id: string): void => {
    const timer = timers.get(id);
    if (!timer) return;
    clearTimeout(timer);
    timers.delete(id);
};

const useToastManager = (): ToastManager => {
    const [toasts, setToasts] = useState<ToastEntry[]>([]);
    const sequence = useRef(0);
    const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
    const dismiss = useCallback((id: string): void => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
        clearToastTimer(timers.current, id);
    }, []);
    const notify = useCallback((options: SarakToastOptions): string => {
        sequence.current += 1;
        const id = `toast-${sequence.current}`;
        const entry: ToastEntry = {
            ...options,
            id,
            variant: options.variant ?? 'info',
            duration: getToastDuration(options.duration, options.action !== undefined),
        };
        setToasts((current) => [...current, entry]);
        if (entry.duration > 0) timers.current.set(id, setTimeout(() => dismiss(id), entry.duration));
        return id;
    }, [dismiss]);

    useEffect(() => {
        const activeTimers = timers.current;
        return () => {
            activeTimers.forEach((timer) => clearTimeout(timer));
            activeTimers.clear();
        };
    }, []);
    return { toasts, notify, dismiss };
};

const ToastMessage = ({ title, message }: { title?: string; message: string }): React.ReactElement => (
    <div className="flex min-w-0 flex-1" style={{ flexDirection: 'column' }}>
        {title && <strong className="font-semibold">{title}</strong>}
        <span>{message}</span>
    </div>
);

const SarakToast = ({ entry, onDismiss }: { entry: ToastEntry; onDismiss: (id: string) => void }): React.ReactElement => {
    const text = useLibraryText();
    const handleAction = (): void => {
        entry.action?.onClick();
        onDismiss(entry.id);
    };
    return (
        <div role="alert" data-sarak-toast="true" data-variant={entry.variant} className="flex items-center text-sm shadow-lg pointer-events-auto" style={{
            minWidth: 'var(--sarak-toast-min-width, 15rem)', maxWidth: 'var(--sarak-toast-max-width, 22.5rem)',
            gap: 'var(--sarak-layout-gap-sm, 8px)', paddingInline: 'var(--sarak-layout-gap-md, 16px)',
            paddingBlock: 'calc(var(--sarak-layout-gap-md, 16px) * 0.75)', borderRadius: 'var(--sarak-card-radius,12px)',
            background: 'var(--color-theme-card,#1e293b)', color: 'var(--sarak-text-main,#ffffff)',
            borderLeft: `var(--sarak-toast-accent-width, 4px) solid ${VARIANT_COLORS[entry.variant]}`,
        }}>
            <ToastMessage title={entry.title} message={entry.message} />
            {entry.action && <SarakButton type="button" variant="ghost" size="xs" onClick={handleAction}>{entry.action.label}</SarakButton>}
            <SarakIconButton variant="ghost" size="xs" aria-label={text('toastClose')} onClick={() => onDismiss(entry.id)} style={{ color: 'var(--text-muted,#94a3b8)', lineHeight: 1, borderRadius: 0 }} icon="×" />
        </div>
    );
};

const ToastStack = ({ toasts, onDismiss }: { toasts: ToastEntry[]; onDismiss: (id: string) => void }): React.ReactElement | null => {
    if (typeof document === 'undefined') return null;
    return createPortal(
        <SarakPortalScope>
            <div data-sarak-toast-stack="true" aria-live="polite" className="fixed flex pointer-events-none" style={{
                flexDirection: 'column', gap: 'var(--sarak-layout-gap-sm, 8px)', bottom: 'var(--sarak-layout-gap-lg,24px)',
                right: 'var(--sarak-layout-gap-lg,24px)', zIndex: 'var(--z-index-tooltip, 9000)' as React.CSSProperties['zIndex'],
            }}>
                {toasts.map((entry) => <SarakToast key={entry.id} entry={entry} onDismiss={onDismiss} />)}
            </div>
        </SarakPortalScope>,
        document.body,
    );
};

export const SarakToastProvider = ({ children }: { children: React.ReactNode }): React.ReactElement => {
    const manager = useToastManager();
    const controller = useMemo<SarakToastController>(() => ({ notify: manager.notify, dismiss: manager.dismiss }), [manager.notify, manager.dismiss]);
    return (
        <ToastContext.Provider value={controller}>
            {children}
            <ToastStack toasts={manager.toasts} onDismiss={manager.dismiss} />
        </ToastContext.Provider>
    );
};

const NOOP_TOAST_CONTROLLER: SarakToastController = {
    notify: () => '',
    dismiss: () => undefined,
};

/** Acessa o controller de toasts; fora de SarakToastProvider devolve um controller no-op. */
export const useToast = (): SarakToastController => useContext(ToastContext) ?? NOOP_TOAST_CONTROLLER;
