import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, X, ArrowRight } from 'lucide-react';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { getRegisteredModules } from '../../../core/Discovery/registry';

interface SarakSearchProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * SarakSearch (v6.0 Command Palette)
 * 
 * Global search component integrated into the Sarak ecosystem.
 */
export const SarakSearch: React.FC<SarakSearchProps> = ({ isOpen, onClose }) => {
    const { design } = useSarakUI();
    const { searchStyle } = design || {};
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
                    className={`absolute inset-0 bg-[var(--sx-color-background-base)]/${searchStyle === 'minimal' ? '20' : '60'} backdrop-blur-[var(--glass-blur)]`}
                />

                {/* Palette Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    className={`relative w-full ${searchStyle === 'minimal' ? 'max-w-lg mt-[5vh]' : 'max-w-2xl mt-[10vh]'} bg-[var(--sx-color-surface-base)] border border-[var(--sx-color-border-base)] rounded-[var(--radius-theme)] shadow-[var(--dynamic-shadow)] overflow-hidden`}
                >
                    {/* Input Area */}
                    <div className="flex items-center gap-4 px-6 py-5 border-b border-[var(--sx-color-border-base)] bg-[var(--sx-color-text-title)]/[0.02]">
                        <Search className="w-5 h-5 text-[var(--sx-color-text-muted)]" />
                        <input 
                            ref={inputRef}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search tool, record or configuration..."
                            className="flex-1 bg-transparent border-none outline-none text-[var(--sx-color-text-title)] text-lg placeholder:text-[var(--sx-color-text-muted)] font-medium"
                        />
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-[calc(var(--radius-theme)*0.5)] bg-[var(--sx-color-primary-base)]/10 border border-[var(--sx-color-primary-base)]/20 text-2xs text-[var(--sx-color-primary-base)] font-bold uppercase tracking-widest">
                            <span className="text-[12px]"><Command size={10} /></span>
                            <span>K</span>
                        </div>
                    </div>

                    {/* Results Area */}
                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
                        {filteredModules.length > 0 ? (
                            <div className="py-2">
                                <h4 className="text-2xs font-black uppercase tracking-[0.2em] text-[var(--sx-color-text-muted)] px-4 mb-2">Available Tools</h4>
                                {filteredModules.map(mod => (
                                    <div 
                                        key={mod.id}
                                        className="group h-14 px-4 flex items-center justify-between rounded-[calc(var(--radius-theme)*0.8)] hover:bg-[var(--sx-color-primary-base)]/5 transition-all cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-9 h-9 rounded-[calc(var(--radius-theme)*0.5)] bg-[var(--sx-color-surface-base)] flex items-center justify-center text-[var(--sx-color-text-muted)] group-hover:text-[var(--sx-color-primary-base)] group-hover:bg-[var(--sx-color-primary-base)]/10 transition-all border border-[var(--sx-color-border-base)]">
                                                <Command size={16} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-[var(--sx-color-text-title)]/80 group-hover:text-[var(--sx-color-primary-base)]">{mod.label}</span>
                                                <span className="text-2xs text-[var(--sx-color-text-muted)] uppercase tracking-widest">{mod.category || 'Module'}</span>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-[var(--sx-color-text-muted)] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 flex flex-col items-center justify-center text-center opacity-20">
                                <Search className="w-12 h-12 mb-4 text-[var(--sx-color-text-title)]" />
                                <span className="text-sm font-black uppercase tracking-widest text-[var(--sx-color-text-title)]">No results for "{query}"</span>
                            </div>
                        )}
                    </div>

                    {/* Footer Area */}
                    <div className="bg-[var(--sx-color-surface-base)]/40 border-t border-[var(--sx-color-border-base)] px-6 py-3 flex items-center justify-between">
                        <div className="flex gap-4">
                            <div className="flex items-center gap-1.5 text-2xs font-bold text-[var(--sx-color-text-muted)] uppercase tracking-widest">
                                <span className="px-1.5 py-0.5 rounded bg-[var(--sx-color-surface-base)] border border-[var(--sx-color-border-base)]">ESC</span>
                                <span>Close</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-2xs font-bold text-[var(--sx-color-text-muted)] uppercase tracking-widest">
                                <span className="px-1.5 py-0.5 rounded bg-[var(--sx-color-surface-base)] border border-[var(--sx-color-border-base)]">↑↓</span>
                                <span>Navigate</span>
                            </div>
                        </div>
                        <span className="text-2xs font-black uppercase tracking-widest text-[var(--sx-color-text-muted)] italic">Sarak Lib Search Engine</span>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default SarakSearch;

