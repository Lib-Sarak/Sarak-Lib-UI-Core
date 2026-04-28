import React from 'react';
import { Check } from 'lucide-react';

interface CompactThemeCardProps {
    id: string;
    theme: any;
    isActive: boolean;
    isPreviewed: boolean;
    onApply: (id: string) => void;
}

const CompactThemeCard: React.FC<CompactThemeCardProps> = ({ id, theme, isActive, isPreviewed, onApply }) => {
    return (
        <button
            onClick={() => onApply(id)}
            className={`w-full flex items-center justify-between px-6 py-4 rounded-xl border-2 transition-all group ${
                isActive
                ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)]/10 text-white shadow-[0_0_20px_rgba(var(--theme-primary-rgb),0.1)]'
                : isPreviewed
                    ? 'border-[var(--theme-primary)]/40 bg-[var(--theme-primary)]/5 text-white/60'
                    : 'border-white/5 bg-white/[0.02] text-white/30 hover:border-white/10 hover:bg-white/[0.05] hover:text-white'
            }`}
        >
            <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full transition-all ${isActive ? 'bg-[var(--theme-primary)] animate-pulse' : 'bg-white/10'}`} />
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">
                    {theme.name || id}
                </span>
            </div>
            {isActive ? (
                <Check size={14} className="text-[var(--theme-primary)]" />
            ) : (
                <span className="text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-40 transition-opacity">
                    {isPreviewed ? 'Selected' : 'Select Project'}
                </span>
            )}
        </button>
    );
};

interface ThemeListProps {
    layouts: any;
    customThemes: any[];
    currentLayout: string;
    previewLayoutId: string;
    onPreview: (id: string) => void;
    onApply: (id: string) => void;
}

export const ThemeList: React.FC<ThemeListProps> = ({
    layouts,
    customThemes,
    currentLayout,
    previewLayoutId,
    onApply
}) => {
    // Portar custom themes
    const customThemesObj = customThemes.reduce((acc, theme) => {
        acc[`custom-${theme.id}`] = theme;
        return acc;
    }, {} as any);

    const allThemes = { ...layouts, ...customThemesObj };
    
    const advancedThemes = Object.entries(allThemes).filter(([id]) => id.toLowerCase().includes('premium') || id.toLowerCase().includes('_v') || id.toLowerCase().includes('advanced'));
    const baseThemes = Object.entries(allThemes).filter(([id]) => !id.toLowerCase().includes('premium') && !id.toLowerCase().includes('_v') && !id.toLowerCase().includes('advanced'));

    return (
        <div className="space-y-8">
            {/* Secção Advanced */}
            {advancedThemes.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-3 px-2 mb-4">
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 italic">High Performance Models</span>
                        <div className="flex-1 h-[1px] bg-white/5" />
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        {advancedThemes.map(([id, theme]: [string, any]) => (
                            <CompactThemeCard
                                key={id}
                                id={id}
                                theme={theme}
                                isActive={currentLayout?.toLowerCase() === id.toLowerCase()}
                                isPreviewed={previewLayoutId?.toLowerCase() === id.toLowerCase()}
                                onApply={onApply}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Secção Base */}
            {baseThemes.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-3 px-2 mb-4">
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 italic">Sovereign Essentials</span>
                        <div className="flex-1 h-[1px] bg-white/5" />
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        {baseThemes.map(([id, theme]: [string, any]) => (
                            <CompactThemeCard
                                key={id}
                                id={id}
                                theme={theme}
                                isActive={currentLayout?.toLowerCase() === id.toLowerCase()}
                                isPreviewed={previewLayoutId?.toLowerCase() === id.toLowerCase()}
                                onApply={onApply}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
