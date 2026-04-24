import React from 'react';
import { Check, Settings2, Trash2, Zap, Layout as LayoutIcon, Award } from 'lucide-react';
import { motion } from 'framer-motion';

interface ThemeCardProps {
    id: string;
    theme: any;
    isActive: boolean;
    isPreviewed: boolean;
    onPreview: (id: string) => void;
    onApply: (id: string) => void;
    onEdit?: (id: string, theme: any) => void;
    onDelete?: (id: string) => void;
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
    const isAdvanced = id.toLowerCase().includes('premium') || id.toLowerCase().includes('_v') || id.toLowerCase().includes('advanced');
    const isCustom = id.startsWith('custom-');

    return (
        <motion.div
            layout
            onClick={() => onPreview(id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`group relative flex flex-col p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                isActive
                ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)]/10 shadow-[0_10px_40px_rgba(59,130,246,0.15)] ring-1 ring-[var(--theme-primary)]/30'
                : isPreviewed
                    ? 'border-[var(--theme-primary)]/40 bg-[var(--theme-primary)]/5'
                    : 'border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
            }`}
        >
            <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span className={`text-xs font-black uppercase tracking-tighter ${isPreviewed || isActive ? 'text-[var(--theme-primary)]' : 'text-white'}`}>
                            {theme.name || id}
                        </span>
                        {isAdvanced && (
                            <div className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center gap-1">
                                <Award size={8} className="text-amber-500" />
                                <span className="text-[7px] font-black text-amber-500 uppercase tracking-widest">Advanced</span>
                            </div>
                        )}
                    </div>
                    <span className="text-[8px] font-bold uppercase tracking-[0.2em] opacity-30 italic">
                        {isCustom ? 'Custom Preset' : 'Sarak Core Model'}
                    </span>
                </div>

                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isActive ? 'bg-[var(--theme-primary)] text-white' : 'bg-white/5 text-white/20 group-hover:text-white/60'
                }`}>
                    <LayoutIcon size={18} />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={(e) => { e.stopPropagation(); onApply(id); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all ${
                        isActive
                        ? 'bg-[var(--theme-primary)] text-white shadow-lg shadow-[var(--theme-primary)]/20'
                        : isPreviewed
                            ? 'bg-white/10 text-white border border-white/10 hover:bg-[var(--theme-primary)] hover:border-transparent'
                            : 'bg-white/5 border border-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                    }`}
                >
                    <Check className={`w-3 h-3 ${isActive ? 'opacity-100' : 'opacity-40'}`} />
                    <span>{isActive ? 'Active Now' : 'Apply Layout'}</span>
                </button>

                {onEdit && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(id, theme); }}
                        className="p-2.5 rounded-xl border border-white/5 bg-white/5 text-white/20 hover:text-[var(--theme-primary)] hover:border-[var(--theme-primary)]/30 transition-all"
                    >
                        <Settings2 size={14} />
                    </button>
                )}
                
                {isCustom && onDelete && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(id); }}
                        className="p-2.5 rounded-xl border border-white/5 bg-white/5 text-white/20 hover:text-red-500 hover:border-red-500/30 transition-all"
                    >
                        <Trash2 size={14} />
                    </button>
                )}
            </div>

            {/* Indicator Dot */}
             {isActive && (
                <div className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--theme-primary)] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--theme-primary)]"></span>
                </div>
            )}
        </motion.div>
    );
};

interface ThemeListProps {
    layouts: any;
    customThemes: any[];
    currentLayout: string;
    previewLayoutId: string;
    onPreview: (id: string) => void;
    onApply: (id: string) => void;
    onEdit?: (id: string, theme: any) => void;
    onDelete?: (id: string) => void;
}

export const ThemeList: React.FC<ThemeListProps> = ({
    layouts,
    customThemes,
    currentLayout,
    previewLayoutId,
    onPreview,
    onApply,
    onEdit,
    onDelete
}) => {
    // Portar custom themes para o mesmo formato
    const customThemesObj = customThemes.reduce((acc, theme) => {
        acc[`custom-${theme.id}`] = theme;
        return acc;
    }, {} as any);

    const allThemes = { ...layouts, ...customThemesObj };
    
    // Categorização para visual Premium
    const advancedThemes = Object.entries(allThemes).filter(([id]) => id.toLowerCase().includes('premium') || id.toLowerCase().includes('_v') || id.toLowerCase().includes('advanced'));
    const baseThemes = Object.entries(allThemes).filter(([id]) => !id.toLowerCase().includes('premium') && !id.toLowerCase().includes('_v') && !id.toLowerCase().includes('advanced'));

    if (Object.keys(allThemes).length === 0) {
        return (
            <div className="p-8 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl bg-black/20">
                <LayoutIcon size={24} className="text-white/10 mb-3" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/20 text-center">Nenhum modelo disponível</span>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* Secção Advanced */}
            {advancedThemes.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-white/10" />
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40 italic">Advanced Collection</span>
                        <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-white/10" />
                    </div>
                    <div className="space-y-4">
                        {advancedThemes.map(([id, theme]: [string, any]) => (
                            <ThemeCard
                                key={id}
                                id={id}
                                theme={theme}
                                isActive={currentLayout?.toLowerCase() === id.toLowerCase()}
                                isPreviewed={previewLayoutId?.toLowerCase() === id.toLowerCase()}
                                onPreview={onPreview}
                                onApply={onApply}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Secção Base */}
            {baseThemes.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-white/5" />
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 italic">Essential Models</span>
                        <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-white/5" />
                    </div>
                    <div className="space-y-4">
                        {baseThemes.map(([id, theme]: [string, any]) => (
                            <ThemeCard
                                key={id}
                                id={id}
                                theme={theme}
                                isActive={currentLayout?.toLowerCase() === id.toLowerCase()}
                                isPreviewed={previewLayoutId?.toLowerCase() === id.toLowerCase()}
                                onPreview={onPreview}
                                onApply={onApply}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
