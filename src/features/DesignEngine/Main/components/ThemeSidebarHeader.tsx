import React from 'react';
import { Search, Zap } from 'lucide-react';
import { ThemeAdvancedMenu, type ThemeViewMode } from './ThemeAdvancedMenu';
import type { ThemeEditMode } from '../hooks/usePreviewUIState';

const THEME_EDIT_MODES: Array<{ value: ThemeEditMode; label: string }> = [
    { value: 'impact', label: 'Impacto' },
    { value: 'essential', label: 'Essencial' },
    { value: 'complete', label: 'Completo' }
];

interface ThemeSidebarHeaderProps {
    viewMode: ThemeViewMode;
    setViewMode: (mode: ThemeViewMode) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    editMode: ThemeEditMode;
    setEditMode: (mode: ThemeEditMode) => void;
}

export const ThemeSidebarHeader: React.FC<ThemeSidebarHeaderProps> = ({
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    editMode,
    setEditMode
}) => (
    <div className="shrink-0 border-b border-[var(--theme-border)] bg-[var(--theme-surface)] p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--theme-primary)]">
                    <Zap className="h-3.5 w-3.5 text-theme-text" />
                </div>
                <span className="text-[var(--sarak-type-scale-xl,20px)] font-semibold text-[var(--color-theme-title,#f2f6fb)]">
                    Design
                </span>
            </div>
            <ThemeAdvancedMenu viewMode={viewMode} setViewMode={setViewMode} />
        </div>
        <div className="flex flex-col gap-3">
            <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--theme-muted)]" />
                <input
                    type="text"
                    placeholder="Buscar token..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="w-full rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] py-2.5 pl-9 pr-4 text-[var(--sarak-type-scale-caption,12px)] font-medium tracking-normal text-[var(--color-theme-title,#f2f6fb)] placeholder:text-[var(--theme-muted)] focus:border-[var(--theme-primary)]/50 focus:outline-none"
                />
            </div>
            <div className="flex flex-col gap-1.5">
                <span className="text-[var(--sarak-type-scale-caption,12px)] font-medium text-[var(--theme-muted)]">
                    Modo de edição
                </span>
                <div role="radiogroup" aria-label="Modo de edição" className="grid min-w-0 grid-cols-3 gap-1">
                    {THEME_EDIT_MODES.map((mode) => (
                        <label key={mode.value} className="min-w-0 cursor-pointer">
                            <input
                                type="radio"
                                name="theme-edit-mode"
                                value={mode.value}
                                className="peer sr-only"
                                checked={editMode === mode.value}
                                onChange={() => setEditMode(mode.value)}
                                aria-checked={editMode === mode.value}
                            />
                            <span
                                className={[
                                    'flex min-w-0 items-center justify-center rounded-lg border px-1 py-2 text-[var(--sarak-type-scale-caption,12px)] font-semibold normal-case tracking-normal transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--theme-primary)]',
                                    editMode === mode.value
                                        ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)]/15 text-[var(--color-theme-title,#f2f6fb)]'
                                        : 'border-[var(--theme-border)] text-[var(--theme-muted)] hover:text-[var(--color-theme-title,#f2f6fb)]'
                                ].join(' ')}
                            >
                                {mode.label}
                            </span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    </div>
);
