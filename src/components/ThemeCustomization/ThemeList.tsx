import React from 'react';
import { Check, Settings2, Trash2 } from 'lucide-react';

interface ThemeCardProps {
    id: string;
    theme: any;
    isActive: boolean;
    isPreviewed: boolean;
    viewMode: 'grid' | 'list';
    onPreview: (id: string) => void;
    onApply: (id: string) => void;
    onEdit: (id: string, theme: any) => void;
    onDelete: (id: string) => void;
}

export const ThemeCard: React.FC<ThemeCardProps> = ({
    id,
    theme,
    isActive,
    isPreviewed,
    onPreview,
    onApply,
    onEdit,
    onDelete
}) => {
    return (
        <div
            onClick={() => onPreview(id)}
            className={`group/item relative flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${isActive
                ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)]/10 shadow-lg shadow-[var(--theme-primary)]/20 scale-[1.01]'
                : isPreviewed
                    ? 'border-[var(--theme-primary)]/40 bg-[var(--theme-primary)]/5'
                    : 'border-[var(--theme-border)]/50 bg-[var(--theme-card)]/30 hover:border-[var(--theme-primary)]/20 hover:bg-[var(--theme-card)]'
                }`}
        >
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider ${isPreviewed ? 'text-[var(--theme-primary)]' : 'text-[var(--theme-title)]'}`}>
                        {theme.name}
                    </span>
                    {isActive && (
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--theme-primary)] animate-pulse" />
                            <span className="text-[7px] font-black text-[var(--theme-primary)] uppercase tracking-widest">In use</span>
                        </div>
                    )}
                </div>
                <span className="text-[7px] font-black uppercase opacity-60 mt-0.5">
                    {id.startsWith('custom-') ? 'Custom Preset' : 'Native Model'}
                </span>
            </div>

            <div className="flex gap-1.5 items-center">
                <button
                    onClick={(e) => { e.stopPropagation(); onApply(id); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${isActive
                        ? 'bg-[var(--theme-primary)] text-white shadow-md'
                        : 'bg-[var(--theme-card)]/50 border border-[var(--theme-border)]/50 text-[var(--theme-muted)] hover:border-[var(--theme-primary)]/30 hover:text-[var(--theme-primary)]'
                        }`}
                >
                    <Check className={`w-3 h-3 ${isActive ? 'opacity-100' : 'opacity-30'}`} />
                    <span>{isActive ? 'Active' : 'Apply'}</span>
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(id, theme); }}
                    className="w-7 h-7 rounded-lg border border-[var(--theme-border)]/50 bg-[var(--theme-card)]/50 text-[var(--theme-muted)] hover:border-[var(--theme-primary)]/30 hover:text-[var(--theme-primary)] transition-all flex items-center justify-center"
                    title="Settings"
                >
                    <Settings2 className="w-3.5 h-3.5" />
                </button>
                {id.startsWith('custom-') && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(id); }}
                        className="w-7 h-7 rounded-lg border border-[var(--theme-border)]/50 bg-[var(--theme-card)]/50 text-[var(--theme-muted)] hover:border-rose-500/30 hover:text-rose-500 transition-all flex items-center justify-center"
                        title="Delete"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
        </div>
    );
};

interface ThemeListProps {
    layouts: any;
    customThemes: any[];
    currentLayout: string;
    previewLayoutId: string;
    viewMode: 'grid' | 'list';
    onPreview: (id: string) => void;
    onApply: (id: string) => void;
    onEdit: (id: string, theme: any) => void;
    onDelete: (id: string) => void;
}

export const ThemeList: React.FC<ThemeListProps> = ({
    layouts,
    customThemes,
    currentLayout,
    previewLayoutId,
    viewMode,
    onPreview,
    onApply,
    onEdit,
    onDelete
}) => {
    // Merge customThemes array into an object format for easier mapping or just map both
    const customThemesObj = customThemes.reduce((acc, theme) => {
        acc[`custom-${theme.id}`] = theme;
        return acc;
    }, {} as any);

    const allThemes = { ...layouts, ...customThemesObj };

    return (
        <div className={viewMode === 'grid' ? "grid grid-cols-2 gap-3" : "space-y-3"}>
            {Object.entries(allThemes).map(([id, theme]: [string, any]) => (
                <ThemeCard
                    key={id}
                    id={id}
                    theme={theme}
                    isActive={currentLayout === id}
                    isPreviewed={previewLayoutId === id}
                    viewMode={viewMode}
                    onPreview={onPreview}
                    onApply={onApply}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
};
