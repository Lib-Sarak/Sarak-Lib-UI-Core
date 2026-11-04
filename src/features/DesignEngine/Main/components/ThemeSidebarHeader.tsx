import React from 'react';
import { Search, Zap } from 'lucide-react';
import { ThemeAdvancedMenu, type ThemeViewMode } from './ThemeAdvancedMenu';

interface ThemeSidebarHeaderProps {
    viewMode: ThemeViewMode;
    setViewMode: (mode: ThemeViewMode) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    /** "Outros ajustes" do menu Avançado: abre o pilar que a coluna não lista. */
    onOpenAdvancedTokens: () => void;
}

/** O topo da lista de decisões: título, menu Avançado e busca. Sem seletor de modo — a profundidade é a navegação. */
export const ThemeSidebarHeader: React.FC<ThemeSidebarHeaderProps> = ({
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    onOpenAdvancedTokens,
}) => (
    <div className="shrink-0 border-b border-[var(--theme-border)] bg-[var(--theme-surface)] p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--theme-primary)]">
                    <Zap className="h-3.5 w-3.5 text-theme-text" />
                </div>
                <span className="text-base font-semibold text-[var(--theme-title)]">
                    Design
                </span>
            </div>
            <ThemeAdvancedMenu viewMode={viewMode} setViewMode={setViewMode} onOpenAdvancedTokens={onOpenAdvancedTokens} />
        </div>
        <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--theme-muted)]" />
            <input
                type="text"
                placeholder="Buscar token..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] py-2.5 pl-9 pr-4 text-[length:var(--sarak-type-scale-caption,12px)] font-medium tracking-normal text-[var(--theme-title)] placeholder:text-[var(--theme-muted)] focus:border-[var(--theme-primary)]/50 focus:outline-none"
            />
        </div>
    </div>
);
