import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SarakInput } from '../Inputs/SarakInput';

/** Item navegável da Command Palette (Spec 14, Regra 1). */
export interface NavigationItem {
    /** Identificador único. */
    id: string;
    /** Rótulo exibido e base da busca. */
    label: string;
    /** Termos extra para o filtro (além do label). */
    keywords?: string;
    /** Ícone opcional à esquerda. */
    icon?: React.ReactNode;
}

export interface SarakSpotlightProps {
    /** Itens disponíveis para navegação instantânea. */
    items: NavigationItem[];
    /** Atalho de ativação global (default: `mod+k` = Ctrl/Cmd+K). */
    shortcut?: string;
    /** Modo controlado: estado de abertura. */
    open?: boolean;
    /** Notifica mudanças de abertura (abrir via atalho / fechar via Esc). */
    onOpenChange?: (open: boolean) => void;
    /** Acionado ao confirmar um item (Enter ou clique). */
    onSelect: (item: NavigationItem) => void;
    /** Placeholder do input central. */
    placeholder?: string;
}

/**
 * Registra um atalho de teclado GLOBAL de forma segura (adiciona/remove o listener
 * no ciclo de vida). A closure sempre vê o handler mais recente via ref (Spec 14,
 * Regra 1 / Teste Unitário).
 */
const useGlobalShortcut = (combo: string, onTrigger: () => void): void => {
    const handlerRef = useRef(onTrigger);
    handlerRef.current = onTrigger;
    useEffect(() => {
        const parts = combo.toLowerCase().split('+').map((part) => part.trim());
        const key = parts[parts.length - 1];
        const needsMod = parts.some((part) => ['mod', 'ctrl', 'control', 'cmd', 'meta'].includes(part));
        const onKeyDown = (event: KeyboardEvent): void => {
            if (event.key.toLowerCase() !== key) return;
            if (needsMod && !(event.metaKey || event.ctrlKey)) return;
            event.preventDefault();
            handlerRef.current();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [combo]);
};

const matches = (item: NavigationItem, query: string): boolean => {
    const haystack = `${item.label} ${item.keywords ?? ''}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
};

/**
 * Command Palette global (Spec 14, Regra 1): modal por cima de tudo, acionável por
 * atalho, com input central + lista filtrada e navegação por teclado (setas + Enter).
 */
export const SarakSpotlight: React.FC<SarakSpotlightProps> = ({
    items,
    shortcut = 'mod+k',
    open,
    onOpenChange,
    onSelect,
    placeholder = 'Buscar…',
}) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);

    const isOpen = open ?? internalOpen;
    const setOpen = (next: boolean): void => {
        if (open === undefined) setInternalOpen(next);
        onOpenChange?.(next);
        if (next) {
            setQuery('');
            setActiveIndex(0);
        }
    };

    useGlobalShortcut(shortcut, () => setOpen(!isOpen));

    const results = useMemo(() => items.filter((item) => matches(item, query)), [items, query]);
    const active = Math.min(activeIndex, Math.max(results.length - 1, 0));

    if (!isOpen) return null;

    const choose = (item: NavigationItem | undefined): void => {
        if (!item) return;
        onSelect(item);
        setOpen(false);
    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActiveIndex((index) => Math.min(index + 1, results.length - 1));
            return;
        }
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex((index) => Math.max(index - 1, 0));
            return;
        }
        if (event.key === 'Enter') {
            event.preventDefault();
            choose(results[active]);
            return;
        }
        if (event.key === 'Escape') setOpen(false);
    };

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-start justify-center pt-[12vh] bg-black/50 backdrop-blur-sm"
            style={{ paddingLeft: 'var(--sarak-layout-gap-md, 16px)', paddingRight: 'var(--sarak-layout-gap-md, 16px)', paddingBottom: 'var(--sarak-layout-gap-md, 16px)' }}
            role="presentation"
            onClick={() => setOpen(false)}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Command Palette"
                className="w-full max-w-xl rounded-lg overflow-hidden border border-[var(--border-color,#334155)] bg-[var(--color-theme-card,#1e293b)] shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                {/* Composição atômica (R10 — lote 10): SarakInput renderiza <input> nativo por
                    baixo, preservando `autoFocus`/`onKeyDown` (spread via `...props`). Achado:
                    ao contrário do que a plan presumia, SarakSpotlight NÃO usa `useFocusTrap`
                    — não há Tab cíclico nem `containerRef`, só `autoFocus` + ESC no próprio
                    onKeyDown do input. `getInputStyles` sempre recalcula `border` por cima do
                    `style` (diferente de `getButtonStyles`, que no default 'matte' devolve
                    `{}`), então a borda vira um contorno 1px nos 4 lados (o token
                    `inputBorderType`, default 'solid') em vez do `border-b` original — a
                    diferença visual é aceita e documentada (não há automação visual nesta
                    base para provar mais que isso); `background`/`padding`/`fontSize` não são
                    tocados pelo átomo e continuam fiéis ao original via `style`. */}
                <SarakInput
                    autoFocus
                    type="text"
                    value={query}
                    placeholder={placeholder}
                    onChange={(event) => {
                        setQuery(event.target.value);
                        setActiveIndex(0);
                    }}
                    onKeyDown={onKeyDown}
                    aria-label="Campo de busca"
                    fullWidth
                    className="text-[var(--sarak-text-main,#ffffff)]"
                    style={{
                        background: 'transparent',
                        paddingInline: 'var(--sarak-layout-gap-md, 16px)',
                        paddingBlock: 'calc(var(--sarak-layout-gap-md, 16px) * 0.75)',
                    }}
                />
                <ul role="listbox" className="max-h-80 overflow-y-auto" style={{ paddingBlock: 'calc(var(--sarak-layout-gap-md, 16px) * 0.25)' }}>
                    {results.map((item, index) => (
                        <li
                            key={item.id}
                            role="option"
                            aria-selected={index === active}
                            onMouseEnter={() => setActiveIndex(index)}
                            onClick={() => choose(item)}
                            className={`flex items-center cursor-pointer text-sm ${
                                index === active
                                    ? 'bg-[var(--sarak-primary-color,#3b82f6)] text-[var(--color-theme-card,#1e293b)]'
                                    : 'text-[var(--sarak-text-main,#ffffff)]'
                            }`}
                            style={{ gap: 'calc(var(--sarak-layout-gap-md, 16px) * 0.75)', paddingInline: 'var(--sarak-layout-gap-md, 16px)', paddingBlock: 'var(--sarak-layout-gap-sm, 8px)' }}
                        >
                            {item.icon}
                            {item.label}
                        </li>
                    ))}
                    {results.length === 0 && (
                        <li className="text-center text-sm text-[var(--text-muted,#94a3b8)]" style={{ paddingInline: 'var(--sarak-layout-gap-md, 16px)', paddingBlock: 'var(--sarak-layout-gap-lg, 24px)' }}>
                            Nenhum resultado
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
};
