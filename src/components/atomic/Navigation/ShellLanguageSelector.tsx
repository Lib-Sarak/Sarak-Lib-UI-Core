import React, { useState } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { getLocalComponent } from '../../../core/Discovery/registry';
import { LANGUAGES } from '../../../core/Discovery/constants';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { SarakButton } from '../Buttons/SarakButton';
import { SarakMenuItem } from './SarakMenuItem';

export interface ShellLanguageSelectorProps {
    variant?: 'horizontal' | 'vertical';
}

interface ResolvedLanguage {
    id: string;
    name: string;
    flag: string;
}

/** Idioma habilitado que não bate com o catálogo curado (`Discovery/constants`)
 *  ainda conta para a regra de montagem — é o tema quem decide o conjunto,
 *  não o catálogo de rótulos/bandeiras conhecidos. */
const resolveLanguage = (code: string): ResolvedLanguage => {
    const known = LANGUAGES.find((lang) => lang.id === code);
    return known ? { id: known.id, name: known.name, flag: known.flag } : { id: code, name: code, flag: '🌐' };
};

/**
 * ShellLanguageSelector — lista os idiomas que o TEMA habilita
 * (`design.enabledLanguages`) e grava a escolha como PREFERÊNCIA do usuário
 * (`updatePreferences({ language })`), nunca no tema (specs/09 §4.7). Um
 * idioma só, ou nenhum, não monta — não há escolha possível
 * (ADR-014: "só monta quando tem com o que funcionar").
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

    const { design, updatePreferences } = useSarakUI();
    const [isOpen, setIsOpen] = useState(false);

    if (OverrideSelector) {
        return (
            <div className={`relative isolate !overflow-visible sarak-language-override-wrapper ${variant === 'horizontal' ? 'horizontal-variant' : ''}`}>
                <OverrideSelector variant={variant} />
            </div>
        );
    }

    const enabledLanguages = (design?.enabledLanguages || []).map(resolveLanguage);
    if (enabledLanguages.length <= 1) return null;

    // `design` já é o EFETIVO (`overlayPreferences` sobrepõe a preferência por cima
    // do tema) — é o único idioma que vale: a preferência, se o tema a oferece E a
    // habilita; senão, o idioma do próprio tema. Ler a preferência crua aqui mostraria
    // um idioma que o tema não habilita, ou ignoraria a preferência estar desligada.
    const currentCode = design?.language || enabledLanguages[0].id;
    const currentLang = enabledLanguages.find((lang) => lang.id === currentCode) || enabledLanguages[0];

    const selectLanguage = (code: string) => {
        updatePreferences({ language: code });
        setIsOpen(false);
    };

    const isHorizontal = variant === 'horizontal';

    const dropdown = (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: isHorizontal ? 10 : -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: isHorizontal ? 10 : -10 }}
                    className={`absolute z-[1000] w-40 bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl shadow-2xl backdrop-blur-xl ${
                        isHorizontal ? 'top-full right-0' : 'bottom-full left-0'
                    }`}
                    style={{
                        padding: 'calc(var(--sarak-layout-gap-sm, 8px) * 0.5)',
                        [isHorizontal ? 'marginTop' : 'marginBottom']: 'var(--sarak-layout-gap-sm, 8px)',
                    }}
                >
                    {enabledLanguages.map((lang) => (
                        <SarakMenuItem
                            key={lang.id}
                            active={currentLang.id === lang.id}
                            onClick={() => selectLanguage(lang.id)}
                            icon={<span>{lang.flag}</span>}
                            label={lang.name}
                            className={`rounded-lg text-2xs tracking-wider ${
                                currentLang.id === lang.id
                                    ? 'bg-[var(--theme-primary)] text-[var(--theme-on-primary)]'
                                    : 'text-[var(--theme-muted)] hover:bg-[var(--theme-muted)]/10 hover:text-[var(--theme-title)]'
                            }`}
                        >
                            {currentLang.id === lang.id && <Check size={10} />}
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
                    className="group normal-case font-normal font-tab tracking-normal h-9 rounded-xl bg-[var(--theme-muted)]/10 border border-[var(--theme-border)] hover:border-[var(--theme-primary)]/40 hover:bg-[var(--theme-muted)]/15"
                >
                    <div className="flex items-center w-full" style={{ gap: 'var(--sarak-layout-gap-sm, 8px)' }}>
                        <span className="text-2xs">{currentLang.flag}</span>
                        <span className="text-3xs font-black uppercase tracking-widest text-[var(--theme-title)]/60 group-hover:text-[var(--theme-title)]">
                            {currentLang.id}
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
                <span className="text-2xs font-bold text-[var(--theme-primary)]">{currentLang.id.toUpperCase()}</span>
            </SarakMenuItem>
            {dropdown}
        </div>
    );
};

export default ShellLanguageSelector;
