import React, { useState } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { getLocalComponent } from '../../Discovery/registry';
import { SarakButton } from '../../../components/atomic/Buttons/SarakButton';
import { SarakMenuItem } from '../../../components/atomic/Navigation/SarakMenuItem';

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

    const dropdown = (
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
                        <SarakMenuItem
                            key={lang.code}
                            active={currentLang.code === lang.code}
                            onClick={() => {
                                setCurrentLang(lang);
                                setIsOpen(false);
                            }}
                            icon={<span>{lang.flag}</span>}
                            label={lang.label}
                            className={`rounded-lg text-2xs tracking-wider ${
                                currentLang.code === lang.code
                                    ? 'bg-[var(--theme-primary)] text-[var(--theme-on-primary)]'
                                    : 'text-[var(--theme-muted)] hover:bg-[var(--theme-muted)]/10 hover:text-[var(--theme-title)]'
                            }`}
                        >
                            {currentLang.code === lang.code && <Check size={10} />}
                        </SarakMenuItem>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );

    if (isHorizontal) {
        return (
            <div className="relative">
                <SarakButton
                    variant="ghost"
                    onClick={() => setIsOpen(!isOpen)}
                    className="group normal-case font-tab tracking-normal h-9 rounded-xl bg-[var(--theme-muted)]/10 border border-[var(--theme-border)] hover:border-[var(--theme-primary)]/40 hover:bg-[var(--theme-muted)]/15"
                >
                    <div className="flex items-center gap-2 w-full">
                        <span className="text-2xs">{currentLang.flag}</span>
                        <span className="text-3xs font-black uppercase tracking-widest text-[var(--theme-title)]/60 group-hover:text-[var(--theme-title)]">
                            {currentLang.code.split('-')[0]}
                        </span>
                        <ChevronDown size={10} className={`text-[var(--theme-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                </SarakButton>
                {dropdown}
            </div>
        );
    }

    return (
        <div className="relative">
            <SarakMenuItem
                onClick={() => setIsOpen(!isOpen)}
                className="group font-tab"
                icon={<Globe size={18} className="text-[var(--theme-muted)] group-hover:text-[var(--theme-primary)]" />}
                label="Language"
            >
                <span className="text-2xs font-bold text-[var(--theme-primary)]">{currentLang.code.split('-')[0].toUpperCase()}</span>
            </SarakMenuItem>
            {dropdown}
        </div>
    );
};

export default ShellLanguageSelector;
