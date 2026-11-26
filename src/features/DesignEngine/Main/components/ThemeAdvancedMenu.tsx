import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import type { LibraryTextKey } from '../../../../core/i18n/catalog';

export type ThemeViewMode = 'preview' | 'catalog' | 'templates' | 'command-center';

/** `tokens` não troca de tela do painel: abre o pilar Avançado na própria coluna. */
type AdvancedEntryKind = ThemeViewMode | 'tokens';

const ADVANCED_ENTRIES: Array<{ mode: AdvancedEntryKind; labelKey: LibraryTextKey }> = [
    { mode: 'catalog', labelKey: 'advancedTokenTable' },
    { mode: 'command-center', labelKey: 'advancedPillarSearch' },
    { mode: 'templates', labelKey: 'advancedThemesJson' },
    { mode: 'tokens', labelKey: 'decisionAdvanced' },
    { mode: 'preview', labelKey: 'advancedBackToNormal' }
];

const ITEM_CLASS = 'flex w-full items-center rounded-md px-3 py-2 text-left text-[length:var(--sarak-type-scale-caption,12px)] font-medium normal-case tracking-normal text-[var(--theme-title)] hover:bg-[var(--theme-primary)]/15 focus:bg-[var(--theme-primary)]/15';

interface ThemeAdvancedMenuProps {
    viewMode: ThemeViewMode;
    setViewMode: (mode: ThemeViewMode) => void;
    /** "Outros ajustes": os tokens do pilar Avançado, que a lista de decisões não traz. */
    onOpenAdvancedTokens: () => void;
}

export const ThemeAdvancedMenu: React.FC<ThemeAdvancedMenuProps> = ({ viewMode, setViewMode, onOpenAdvancedTokens }) => {
    const text = useLibraryText();
    const [isOpen, setIsOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const isAdvancedActive = viewMode !== 'preview';

    const close = useCallback(() => {
        setIsOpen(false);
        triggerRef.current?.focus();
    }, []);

    useEffect(() => {
        if (isOpen) itemRefs.current[0]?.focus();
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return undefined;
        const handleOutside = (event: MouseEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, [isOpen]);

    const moveFocus = (current: number, step: number) => {
        const next = (current + step + ADVANCED_ENTRIES.length) % ADVANCED_ENTRIES.length;
        itemRefs.current[next]?.focus();
    };

    const handleItemKeyDown = (event: React.KeyboardEvent, index: number) => {
        const targets: Record<string, () => void> = {
            ArrowDown: () => moveFocus(index, 1),
            ArrowUp: () => moveFocus(index, -1),
            Home: () => itemRefs.current[0]?.focus(),
            End: () => itemRefs.current[ADVANCED_ENTRIES.length - 1]?.focus(),
            Escape: close,
            Tab: () => setIsOpen(false)
        };
        const action = targets[event.key];
        if (!action) return;
        if (event.key !== 'Tab') event.preventDefault();
        action();
    };

    const choose = (mode: AdvancedEntryKind) => {
        if (mode === 'tokens') onOpenAdvancedTokens();
        else setViewMode(mode);
        close();
    };

    return (
        <div ref={rootRef} className="relative">
            <button
                ref={triggerRef}
                type="button"
                aria-haspopup="menu"
                aria-expanded={isOpen}
                onClick={() => setIsOpen((open) => !open)}
                className={[
                    'flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[length:var(--sarak-type-scale-caption,12px)] font-semibold normal-case tracking-normal transition-colors',
                    isAdvancedActive
                        ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)]/15 text-[var(--theme-title)]'
                        : 'border-[var(--theme-border)] text-[var(--theme-muted)]'
                ].join(' ')}
            >
                {text('advancedTrigger')}
                <ChevronDown size={14} aria-hidden="true" />
            </button>
            {isOpen && (
                <div
                    role="menu"
                    aria-label={text('advancedMenu')}
                    className="absolute right-0 z-50 mt-1 min-w-48 rounded-lg border border-[var(--theme-border)] bg-[var(--color-theme-card,#101622)] p-1 shadow-lg"
                >
                    {ADVANCED_ENTRIES.map((entry, index) => (
                        <button
                            key={entry.mode}
                            ref={(node) => { itemRefs.current[index] = node; }}
                            type="button"
                            role="menuitem"
                            tabIndex={-1}
                            aria-current={entry.mode === viewMode ? 'page' : undefined}
                            onClick={() => choose(entry.mode)}
                            onKeyDown={(event) => handleItemKeyDown(event, index)}
                            className={ITEM_CLASS + (entry.mode === 'preview' ? ' mt-1 border-t border-[var(--theme-border)]' : '')}
                        >
                            {text(entry.labelKey)}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
