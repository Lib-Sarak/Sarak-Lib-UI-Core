import React, { useState } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShellLanguageSelectorProps {
    variant?: 'horizontal' | 'vertical';
}

const LANGUAGES = [
    { code: 'pt-BR', label: 'Português', flag: '🇧🇷' },
    { code: 'en-US', label: 'English', flag: '🇺🇸' }
];

/**
 * ShellLanguageSelector — Global Language Switcher (v8.5)
 * Standardizes language selection in the Sarak Shell.
 */
export const ShellLanguageSelector: React.FC<ShellLanguageSelectorProps> = ({ 
    variant = 'horizontal' 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentLang, setCurrentLang] = useState(LANGUAGES[0]);
    
    const isHorizontal = variant === 'horizontal';

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 transition-all group ${
                    isHorizontal 
                        ? 'h-9 px-3 rounded-xl bg-white/5 border border-white/10 hover:border-[var(--theme-primary)]/40 hover:bg-white/10' 
                        : 'w-full px-3 py-2.5 rounded-xl text-white/40 hover:bg-white/5 hover:text-white'
                }`}
            >
                {isHorizontal ? (
                    <>
                        <span className="text-[10px]">{currentLang.flag}</span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--theme-title)]/60 group-hover:text-[var(--theme-title)]">
                            {currentLang.code.split('-')[0]}
                        </span>
                        <ChevronDown size={10} className={`text-[var(--theme-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </>
                ) : (
                    <>
                        <Globe size={18} className="text-[var(--theme-muted)] group-hover:text-[var(--theme-primary)]" />
                        <span className="text-sm font-tab flex-1 text-left">Language</span>
                        <span className="text-[10px] font-bold text-[var(--theme-primary)]">{currentLang.code.split('-')[0].toUpperCase()}</span>
                    </>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: isHorizontal ? 10 : -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: isHorizontal ? 10 : -10 }}
                        className={`absolute z-[1000] w-40 bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl shadow-2xl backdrop-blur-xl p-1 ${
                            isHorizontal ? 'top-full mt-2 right-0' : 'bottom-full mb-2 left-0'
                        }`}
                    >
                        {LANGUAGES.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => {
                                    setCurrentLang(lang);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                                    currentLang.code === lang.code 
                                        ? 'bg-[var(--theme-primary)] text-white' 
                                        : 'text-white/40 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span>{lang.flag}</span>
                                    <span>{lang.label}</span>
                                </div>
                                {currentLang.code === lang.code && <Check size={10} />}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ShellLanguageSelector;
