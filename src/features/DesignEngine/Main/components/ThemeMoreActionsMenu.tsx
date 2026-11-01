import React, { useCallback, useEffect, useRef } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';

export interface ThemeMenuAction {
    id: string;
    label: string;
    onSelect: () => void;
    /** Ação destrutiva: ganha o tom de perigo. */
    danger?: boolean;
}

const ITEM_CLASS = 'flex w-full items-center rounded-md px-3 py-2 text-left text-[var(--sarak-type-scale-caption,12px)] font-medium normal-case tracking-normal hover:bg-[var(--theme-primary)]/15 focus:bg-[var(--theme-primary)]/15 focus:outline-none ';
const ITEM_NORMAL = 'text-[var(--color-theme-title,#f2f6fb)]';
const ITEM_DANGER = 'text-[var(--theme-error,#ef4444)]';

interface ThemeMoreActionsMenuProps {
    actions: ThemeMenuAction[];
    /** Quem hospeda decide se está aberto: a barra mantém só uma camada aberta por vez. */
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

/**
 * Menu "Mais ações" da barra do tema, no padrão de teclado do `ThemeAdvancedMenu`: a seta move o foco, Home e End
 * vão às pontas, Esc fecha e devolve o foco ao botão, Tab sai. Abre para cima: a barra fica no pé da coluna.
 */
export const ThemeMoreActionsMenu: React.FC<ThemeMoreActionsMenuProps> = ({ actions, isOpen, onOpenChange }) => {
    const text = useLibraryText();
    const rootRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

    const close = useCallback(() => {
        onOpenChange(false);
        triggerRef.current?.focus();
    }, [onOpenChange]);

    useEffect(() => {
        if (isOpen) itemRefs.current[0]?.focus();
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return undefined;
        const handleOutside = (event: MouseEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) onOpenChange(false);
        };
        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, [isOpen, onOpenChange]);

    const moveFocus = (current: number, step: number) => {
        itemRefs.current[(current + step + actions.length) % actions.length]?.focus();
    };

    const handleItemKeyDown = (event: React.KeyboardEvent, index: number) => {
        const targets: Record<string, () => void> = {
            ArrowDown: () => moveFocus(index, 1),
            ArrowUp: () => moveFocus(index, -1),
            Home: () => itemRefs.current[0]?.focus(),
            End: () => itemRefs.current[actions.length - 1]?.focus(),
            Escape: close,
            Tab: () => onOpenChange(false),
        };
        const action = targets[event.key];
        if (!action) return;
        if (event.key !== 'Tab') event.preventDefault();
        action();
    };

    const choose = (action: ThemeMenuAction) => {
        close();
        action.onSelect();
    };

    return (
        <div ref={rootRef} className="relative shrink-0">
            <button
                ref={triggerRef}
                type="button"
                aria-haspopup="menu"
                aria-expanded={isOpen}
                aria-label={text('themeMoreActions')}
                onClick={() => onOpenChange(!isOpen)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--theme-border)] text-[var(--theme-muted)] transition-colors hover:text-[var(--color-theme-title,#f2f6fb)] focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)]"
            >
                <MoreHorizontal size={16} aria-hidden="true" />
            </button>
            {isOpen && (
                <div
                    role="menu"
                    aria-label={text('themeMoreActions')}
                    className="absolute bottom-full right-0 z-50 mb-1 min-w-48 rounded-lg border border-[var(--theme-border)] bg-[var(--color-theme-card,#101622)] p-1 shadow-lg"
                >
                    {actions.map((action, index) => (
                        <button
                            key={action.id}
                            ref={(node) => { itemRefs.current[index] = node; }}
                            type="button"
                            role="menuitem"
                            tabIndex={-1}
                            onClick={() => choose(action)}
                            onKeyDown={(event) => handleItemKeyDown(event, index)}
                            className={ITEM_CLASS + (action.danger ? ITEM_DANGER : ITEM_NORMAL)}
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
