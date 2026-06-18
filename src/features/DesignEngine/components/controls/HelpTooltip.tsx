import React from 'react';
import { HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const HelpTooltip: React.FC<{ label: string, description?: string }> = ({ label, description }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    
    return (
        <div className="relative inline-flex items-center">
            <button 
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
                onClick={() => setIsOpen(!isOpen)}
                className="text-[var(--theme-muted)] hover:text-[var(--theme-primary)] transition-colors focus:outline-none p-1 rounded-full hover:bg-[var(--theme-layer)] cursor-help"
            >
                <HelpCircle size={10} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-72 p-5 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[9999] pointer-events-none"
                    >
                        <div className="flex flex-col gap-2 relative z-10">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--theme-primary)] shadow-[0_0_8px_var(--theme-primary)]" />
                                <span className="text-[10px] font-black uppercase text-[var(--theme-text)] tracking-[0.2em]">{label}</span>
                            </div>
                            <div className="h-[1px] w-full bg-[var(--theme-border)]" />
                            <p className="text-[10px] text-[var(--theme-muted)] leading-relaxed uppercase font-medium">
                                {description || `Configuração granular para o parâmetro ${label.toLowerCase()} no ecossistema Sarak UI.`}
                            </p>
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent border-t-[var(--theme-surface)]" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
