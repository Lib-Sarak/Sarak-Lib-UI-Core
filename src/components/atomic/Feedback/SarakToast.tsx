/**
 * SarakToast + SarakToastProvider (Spec 13 — Regra 1)
 *
 * Sistema de notificações em pilha, estável (sem conflito de z-index) e tokenizado.
 * As cores mapeiam o Status Schema (`--sarak-status-*-color`), sem hardcode. O
 * Provider expõe um controller imperativo via `useToast()` — é por aqui que o
 * Dispatcher (Spec 25) dispara a ação `trigger_toast`.
 *
 * Cada toast desmonta sozinho após `duration` ms (Plano de Testes: mount/unmount por
 * timeout). A pilha empilha com espaçamento e anima a entrada via transição CSS.
 *
 * Zero Any: o controller é tipado; a fronteira não usa `any`.
 */

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { createPortal } from 'react-dom';

/** Variantes semânticas, mapeadas 1:1 ao Status Schema. */
export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

/** Opções de um disparo de toast (interface estável consumida pelo Dispatcher). */
export interface ToastOptions {
    /** Texto exibido. */
    message: string;
    /** Variante semântica (default: `info`). */
    variant?: ToastVariant;
    /** Duração até o auto-dismiss em ms (default: 3000). */
    duration?: number;
}

/** Controller público do sistema de toasts. */
export interface ToastController {
    /** Empilha um toast; devolve seu id (para dismiss manual). */
    notify(options: ToastOptions): string;
    /** Remove um toast pelo id. */
    dismiss(id: string): void;
}

interface ToastEntry extends Required<Omit<ToastOptions, 'duration'>> {
    id: string;
    duration: number;
}

/** Var CSS de cor por variante (Status Schema — Zero Hardcode). */
const VARIANT_COLOR: Readonly<Record<ToastVariant, string>> = {
    success: 'var(--sarak-status-success-color, var(--theme-success, #10b981))',
    error: 'var(--sarak-status-error-color, var(--theme-error, #ef4444))',
    warning: 'var(--sarak-status-warning-color, var(--theme-warning, #f59e0b))',
    info: 'var(--sarak-status-info-color, var(--theme-info, #3b82f6))',
};

const DEFAULT_DURATION = 3000;

const ToastContext = createContext<ToastController | null>(null);

/** Toast individual (apresentação). */
const SarakToast: React.FC<{ entry: ToastEntry; onDismiss: (id: string) => void }> = ({
    entry,
    onDismiss,
}) => {
    return (
        <div
            role="alert"
            data-sarak-toast="true"
            data-variant={entry.variant}
            className="flex items-center text-sm shadow-lg pointer-events-auto"
            style={{
                minWidth: '15rem',
                maxWidth: '22.5rem',
                gap: 'var(--sarak-layout-gap-sm, 8px)',
                paddingInline: 'var(--sarak-layout-gap-md, 16px)',
                paddingBlock: 'calc(var(--sarak-layout-gap-md, 16px) * 0.75)',
                borderRadius: 'var(--sarak-card-radius,12px)',
                background: 'var(--color-theme-card,#1e293b))',
                color: 'var(--sarak-text-main,#ffffff))',
                borderLeft: `4px solid ${VARIANT_COLOR[entry.variant]}`,
            }}
        >
            <span className="flex-1">{entry.message}</span>
            <button
                type="button"
                aria-label="Fechar notificação"
                onClick={() => onDismiss(entry.id)}
                style={{ color: 'var(--text-muted,#94a3b8)', lineHeight: 1 }}
            >
                ×
            </button>
        </div>
    );
};

/**
 * Provider do sistema de toasts. Renderiza a pilha num portal no `body` (z-index alto,
 * estável) e gerencia o ciclo de auto-dismiss. Envolva a app (ou o Renderer) com ele.
 */
export const SarakToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastEntry[]>([]);
    const seq = useRef(0);
    // Guarda os timers para limpar no unmount (sem vazamento).
    const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

    const dismiss = useCallback((id: string) => {
        setToasts((current) => current.filter((t) => t.id !== id));
        const timer = timers.current.get(id);
        if (timer) {
            clearTimeout(timer);
            timers.current.delete(id);
        }
    }, []);

    const notify = useCallback(
        (options: ToastOptions): string => {
            seq.current += 1;
            const id = `toast-${seq.current}`;
            const entry: ToastEntry = {
                id,
                message: options.message,
                variant: options.variant ?? 'info',
                duration: options.duration ?? DEFAULT_DURATION,
            };
            setToasts((current) => [...current, entry]);
            if (entry.duration > 0) {
                const timer = setTimeout(() => dismiss(id), entry.duration);
                timers.current.set(id, timer);
            }
            return id;
        },
        [dismiss],
    );

    // Limpa todos os timers pendentes ao desmontar o provider.
    useEffect(() => {
        const map = timers.current;
        return () => {
            map.forEach((timer) => clearTimeout(timer));
            map.clear();
        };
    }, []);

    const controller = useMemo<ToastController>(() => ({ notify, dismiss }), [notify, dismiss]);

    const stack =
        typeof document !== 'undefined'
            ? createPortal(
                  <div
                      data-sarak-toast-stack="true"
                      aria-live="polite"
                      className="fixed flex pointer-events-none"
                      style={{
                          flexDirection: 'column',
                          gap: 'var(--sarak-layout-gap-sm, 8px)',
                          bottom: 'var(--sarak-layout-gap-lg,24px)',
                          right: 'var(--sarak-layout-gap-lg,24px)',
                          zIndex: 'var(--z-index-tooltip, 9000)' as React.CSSProperties['zIndex'],
                      }}
                  >
                      {toasts.map((entry) => (
                          <SarakToast key={entry.id} entry={entry} onDismiss={dismiss} />
                      ))}
                  </div>,
                  document.body,
              )
            : null;

    return (
        <ToastContext.Provider value={controller}>
            {children}
            {stack}
        </ToastContext.Provider>
    );
};

/**
 * Acessa o controller de toasts. Fora de um `SarakToastProvider`, devolve um
 * controller no-op (loga um aviso) para que o Dispatcher degrade sem quebrar a árvore.
 */
export const useToast = (): ToastController => {
    const ctx = useContext(ToastContext);
    // `useMemo` é sempre chamado (regras de hooks); só usado se não houver Provider.
    const noop = useMemo<ToastController>(
        () => ({
            notify: (): string => {
                console.warn('[Sarak:Toast] useToast() sem SarakToastProvider; toast ignorado.');
                return '';
            },
            dismiss: (): void => undefined,
        }),
        [],
    );
    return ctx ?? noop;
};
