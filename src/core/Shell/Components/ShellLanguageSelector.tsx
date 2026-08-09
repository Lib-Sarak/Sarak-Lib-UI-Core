import React, { useState } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { getLocalComponent } from '../../Discovery/registry';
import { SarakButton } from '../../../components/atomic/Buttons/SarakButton';

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
    // Discovery Logic (v11.0): Procura no Registro e no Backup Global
    const fromRegistry = getLocalComponent('shell-language-selector');
    const fromGlobal = (typeof window !== 'undefined'
        ? (window as Window & { __SARAK_OVERRIDES__?: Record<string, React.ComponentType<{ variant?: string }>> }).__SARAK_OVERRIDES__?.['shell-language-selector']
        : null);
    const OverrideSelector = fromRegistry || fromGlobal;
    
    const [isOpen, setIsOpen] = useState(false);
    const [currentLang, setCurrentLang] = useState(LANGUAGES[0]);
    
    if (OverrideSelector) {
        return (
            <div className={`relative isolate !overflow-visible sarak-language-override-wrapper ${variant === 'horizontal' ? 'horizontal-variant' : ''}`}>
                <OverrideSelector variant={variant} />
            </div>
        );
    }

    const isHorizontal = variant === 'horizontal';

    return (
        <div className="relative">
            <SarakButton
                variant="ghost"
                onClick={() => setIsOpen(!isOpen)}
                className={`group normal-case font-tab tracking-normal ${
                    isHorizontal
                        ? 'h-9 rounded-xl bg-[var(--theme-muted)]/10 border border-[var(--theme-border)] hover:border-[var(--theme-primary)]/40 hover:bg-[var(--theme-muted)]/15'
                        : 'w-full rounded-xl text-[var(--theme-muted)] hover:bg-[var(--theme-muted)]/10 hover:text-[var(--theme-title)] justify-start'
                }`}
            >
                <div className="flex items-center gap-2 w-full">
                    {isHorizontal ? (
                        <>
                            <span className="text-2xs">{currentLang.flag}</span>
                            <span className="text-3xs font-black uppercase tracking-widest text-[var(--theme-title)]/60 group-hover:text-[var(--theme-title)]">
                                {currentLang.code.split('-')[0]}
                            </span>
                            <ChevronDown size={10} className={`text-[var(--theme-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </>
                    ) : (
                        <>
                            <Globe size={18} className="text-[var(--theme-muted)] group-hover:text-[var(--theme-primary)]" />
                            <span className="text-sm font-tab flex-1 text-left">Language</span>
                            <span className="text-2xs font-bold text-[var(--theme-primary)]">{currentLang.code.split('-')[0].toUpperCase()}</span>
                        </>
                    )}
                </div>
            </SarakButton>

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
                            <SarakButton
                                key={lang.code}
                                variant="ghost"
                                fullWidth
                                onClick={() => {
                                    setCurrentLang(lang);
                                    setIsOpen(false);
                                }}
                                className={`rounded-lg text-2xs tracking-wider ${
                                    currentLang.code === lang.code
                                        ? 'bg-[var(--theme-primary)] text-[var(--theme-on-primary)]'
                                        : 'text-[var(--theme-muted)] hover:bg-[var(--theme-muted)]/10 hover:text-[var(--theme-title)]'
                                }`}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2">
                                        <span>{lang.flag}</span>
                                        <span>{lang.label}</span>
                                    </div>
                                    {currentLang.code === lang.code && <Check size={10} />}
                                </div>
                            </SarakButton>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ShellLanguageSelector;
