import React from 'react';
import { ChevronDown, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CategoryLabel: React.FC<{ 
    icon: React.ElementType, 
    title: string, 
    index: number, 
    isOpen: boolean, 
    onToggle: () => void,
    isDualView?: boolean,
    onToggleDual?: () => void,
    isDirty?: boolean,
    onReset?: () => void,
    onApply?: () => void,
    pillarId?: string
}> = ({ icon: Icon, title, index, isOpen, onToggle, isDualView, onToggleDual, isDirty, onReset, onApply, pillarId }) => (
    <div className={`w-full flex border-y border-[var(--theme-border)] transition-all ${isOpen ? 'bg-[var(--color-theme-card,#1e293b)]' : 'bg-transparent hover:bg-[var(--theme-surface)]'}`}>
    <div 
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToggle();
            }
        }}
        className="flex-1 px-6 py-4 flex items-center justify-between group cursor-pointer outline-none focus:bg-[var(--color-theme-card,#1e293b)]"
    >
        <div className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-2xs transition-all relative ${isOpen ? 'bg-[var(--theme-primary)] text-white shadow-[0_0_15px_rgba(var(--theme-primary-rgb),0.3)]' : 'bg-[var(--color-theme-card,#1e293b)] text-[var(--theme-muted)]'}`}>
                {index}
                {isDirty && !isOpen && (
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[var(--theme-primary)] rounded-full border-2 border-[var(--theme-bg)] animate-pulse" />
                )}
            </div>
            <div className="flex items-center gap-2">
                <Icon size={12} className={`transition-all ${isOpen ? 'text-[var(--theme-primary)]' : 'text-[var(--theme-muted)]'}`} />
                <span className={`text-2xs font-black uppercase tracking-[var(--sarak-tracking-tight,0.2em)] transition-all ${isOpen ? 'text-[var(--color-theme-title,#ffffff)]' : 'text-[var(--theme-muted)]'}`}>{title}</span>
            </div>
        </div>
        <div className="flex items-center gap-3">
            <AnimatePresence>
                {isDirty && (
                    <div className="flex items-center gap-2">
                        <motion.button
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            onClick={(e) => { e.stopPropagation(); onReset?.(); }}
                            title="Descartar Alterações neste Pilar"
                            className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-all active:scale-90"
                        >
                            <RotateCcw size={10} />
                        </motion.button>
                        
                        <motion.button
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            onClick={(e) => { e.stopPropagation(); onApply?.(); }}
                            title={`Aplicar apenas o pilar ${title} ao sistema`}
                            className="px-3 py-1.5 rounded-lg bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] hover:bg-[var(--theme-primary)] hover:text-white text-[var(--sarak-type-scale3xs,9px)] font-black uppercase tracking-tighter transition-all active:scale-95 flex items-center gap-1.5"
                        >
                            <span>Commit {title}</span>
                        </motion.button>
                    </div>
                )}
            </AnimatePresence>
            <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-[var(--theme-primary)]' : 'text-[var(--theme-muted)]'}`} />
        </div>
    </div>
        
        {isOpen && onToggleDual && (
            <button 
                onClick={(e) => { e.stopPropagation(); onToggleDual(); }}
                title="Ativar/Desativar Split View"
                className={`px-4 border-l border-[var(--theme-border)] flex items-center justify-center transition-all ${isDualView ? 'text-[var(--theme-primary)] bg-[var(--color-theme-card,#1e293b)]' : 'text-[var(--theme-muted)] hover:text-[var(--color-theme-title,#ffffff)]'}`}
            >
                <div className="relative">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="3" rx="2" />
                        <path d="M12 3v18" className={isDualView ? 'opacity-100' : 'opacity-20'} />
                    </svg>
                    {isDualView && <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-[var(--theme-primary)] rounded-full animate-pulse" />}
                </div>
            </button>
        )}
    </div>
);

export const Section: React.FC<{ id: string, icon: React.ElementType, title: string, activeSection: string | null, onToggle: (id: string | null) => void, children: React.ReactNode }> = ({ id, icon: Icon, title, activeSection, onToggle, children }) => (
    <div className="border-b border-[var(--theme-border)] last:border-0">
        <button onClick={() => onToggle(activeSection === id ? null : id)} className="w-full py-4 flex items-center justify-between hover:bg-[var(--theme-surface)] transition-all px-6 group">
            <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg transition-all ${activeSection === id ? 'bg-[var(--theme-primary)] text-white' : 'bg-[var(--color-theme-card,#1e293b)] text-[var(--theme-muted)] group-hover:text-[var(--color-theme-title,#ffffff)]'}`}><Icon size={14} /></div>
                <span className={`text-2xs font-black uppercase tracking-[var(--sarak-tracking-tight,0.2em)] transition-all ${activeSection === id ? 'text-[var(--color-theme-title,#ffffff)]' : 'text-[var(--theme-muted)] group-hover:text-[var(--color-theme-title,#ffffff)]'}`}>{title}</span>
            </div>
            <ChevronDown size={14} className={`transition-transform duration-300 ${activeSection === id ? 'rotate-180 text-[var(--theme-primary)]' : 'text-[var(--theme-muted)]'}`} />
        </button>
        <AnimatePresence>
            {activeSection === id && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: activeSection === id ? 'auto' : 0, opacity: activeSection === id ? 1 : 0 }} 
                    exit={{ height: 0, opacity: 0 }} 
                    transition={{ duration: 0.3, ease: "circOut" }} 
                    className={`bg-[var(--color-theme-card,#1e293b)] ${activeSection === id ? 'overflow-visible' : 'overflow-hidden'}`}
                >
                    <div className="p-6 pt-2">{children}</div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);
