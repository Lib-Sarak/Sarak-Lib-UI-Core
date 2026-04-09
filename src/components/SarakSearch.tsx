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
                    className="absolute inset-0 bg-black/60 backdrop-blur-md"
                />

                {/* Palette Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    className="relative w-full max-w-2xl bg-[#0f172a] border border-white/10 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden"
                >
                    {/* Input Area */}
                    <div className="flex items-center gap-4 px-6 py-5 border-b border-white/5 bg-white/[0.02]">
                        <Search className="w-5 h-5 text-white/20" />
                        <input 
                            ref={inputRef}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Buscar ferramenta, registro ou configuração..."
                            className="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder:text-white/10 font-medium"
                        />
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-white/40 font-bold uppercase tracking-widest">
                            <span className="text-[12px]"><Command size={10} /></span>
                            <span>K</span>
                        </div>
                    </div>

                    {/* Results Area */}
                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
                        {filteredModules.length > 0 ? (
                            <div className="py-2">
                                <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 px-4 mb-2">Ferramentas Disponíveis</h4>
                                {filteredModules.map(mod => (
                                    <div 
                                        key={mod.id}
                                        className="group h-14 px-4 flex items-center justify-between rounded-xl hover:bg-white/5 transition-all cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-white/40 group-hover:text-[var(--theme-primary)] group-hover:bg-[var(--theme-primary)]/10 transition-all border border-white/5">
                                                <Command size={16} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-white/80 group-hover:text-white">{mod.label}</span>
                                                <span className="text-[10px] text-white/20 uppercase tracking-widest">{mod.category || 'Módulo'}</span>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-white/0 group-hover:text-white/20 transition-all -translate-x-2 group-hover:translate-x-0" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 flex flex-col items-center justify-center text-center opacity-20">
                                <Search className="w-12 h-12 mb-4" />
                                <span className="text-sm font-black uppercase tracking-widest">Nenhum resultado para "{query}"</span>
                            </div>
                        )}
                    </div>

                    {/* Footer Area */}
                    <div className="bg-black/40 border-t border-white/5 px-6 py-3 flex items-center justify-between">
                        <div className="flex gap-4">
                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-white/40 uppercase tracking-widest">
                                <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">ESC</span>
                                <span>Fechar</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-white/40 uppercase tracking-widest">
                                <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">↑↓</span>
                                <span>Navegar</span>
                            </div>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/20 italic">Sarak Matrix Search v6.0</span>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default SarakSearch;
