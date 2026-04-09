import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, X, ArrowRight } from 'lucide-react';
import { useSarakUI } from './SarakUIProvider';
import { getRegisteredModules } from '@sarak/lib-shared';

interface SarakSearchProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * SarakSearch (v6.0 Command Palette)
 * 
 * Componente de busca global com estética Matrix.
 */
export const SarakSearch: React.FC<SarakSearchProps> = ({ isOpen, onClose }) => {
    const { effective } = useSarakUI();
    const { searchStyle } = effective;
    const registeredModules = getRegisteredModules();
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            const handleEsc = (e: KeyboardEvent) => {
                if (e.key === 'Escape') onClose();
            };
            window.addEventListener('keydown', handleEsc);
            return () => window.removeEventListener('keydown', handleEsc);
        }
    }, [isOpen, onClose]);

    const filteredModules = registeredModules.filter(m => 
        m.label.toLowerCase().includes(query.toLowerCase()) ||
        m.id.toLowerCase().includes(query.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[600] flex items-start justify-center pt-[10vh] px-4">
                {/* Backdrop */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-[var(--theme-body)]/60 backdrop-blur-[var(--glass-blur)]"
                />

                {/* Palette Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    className="relative w-full max-w-2xl bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-[var(--radius-theme)] shadow-[var(--dynamic-shadow)] overflow-hidden"
                >
                    {/* Input Area */}
                    <div className="flex items-center gap-4 px-6 py-5 border-b border-[var(--theme-border)] bg-[var(--theme-title)]/[0.02]">
                        <Search className="w-5 h-5 text-[var(--theme-muted)]" />
                        <input 
                            ref={inputRef}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Buscar ferramenta, registro ou configuração..."
                            className="flex-1 bg-transparent border-none outline-none text-[var(--theme-title)] text-lg placeholder:text-[var(--theme-muted)] font-medium"
                        />
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-[calc(var(--radius-theme)*0.5)] bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/20 text-[10px] text-[var(--theme-primary)] font-bold uppercase tracking-widest">
                            <span className="text-[12px]"><Command size={10} /></span>
                            <span>K</span>
                        </div>
                    </div>

                    {/* Results Area */}
                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
                        {filteredModules.length > 0 ? (
                            <div className="py-2">
                                <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--theme-muted)] px-4 mb-2">Ferramentas Disponíveis</h4>
                                {filteredModules.map(mod => (
                                    <div 
                                        key={mod.id}
                                        className="group h-14 px-4 flex items-center justify-between rounded-[calc(var(--radius-theme)*0.8)] hover:bg-[var(--theme-primary)]/5 transition-all cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-9 h-9 rounded-[calc(var(--radius-theme)*0.5)] bg-[var(--theme-card)] flex items-center justify-center text-[var(--theme-muted)] group-hover:text-[var(--theme-primary)] group-hover:bg-[var(--theme-primary)]/10 transition-all border border-[var(--theme-border)]">
                                                <Command size={16} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-[var(--theme-title)]/80 group-hover:text-[var(--theme-primary)]">{mod.label}</span>
                                                <span className="text-[10px] text-[var(--theme-muted)] uppercase tracking-widest">{mod.category || 'Módulo'}</span>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-[var(--theme-muted)] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 flex flex-col items-center justify-center text-center opacity-20">
                                <Search className="w-12 h-12 mb-4 text-[var(--theme-title)]" />
                                <span className="text-sm font-black uppercase tracking-widest text-[var(--theme-title)]">Nenhum resultado para "{query}"</span>
                            </div>
                        )}
                    </div>

                    {/* Footer Area */}
                    <div className="bg-[var(--theme-sidebar)]/40 border-t border-[var(--theme-border)] px-6 py-3 flex items-center justify-between">
                        <div className="flex gap-4">
                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-[var(--theme-muted)] uppercase tracking-widest">
                                <span className="px-1.5 py-0.5 rounded bg-[var(--theme-card)] border border-[var(--theme-border)]">ESC</span>
                                <span>Fechar</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-[var(--theme-muted)] uppercase tracking-widest">
                                <span className="px-1.5 py-0.5 rounded bg-[var(--theme-card)] border border-[var(--theme-border)]">↑↓</span>
                                <span>Navegar</span>
                            </div>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--theme-muted)] italic">Sarak Matrix Search v6.7</span>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default SarakSearch;
