import { SarakIcon } from "../Icon/SarakIcon";
import React, { useState } from 'react';

import { motion, AnimatePresence } from 'framer-motion';

import { LANGUAGES } from '../../../core/i18n/languages';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { languageCode, primaryLanguage } from '../../../core/i18n/resolveLanguage';
import { useSarakLanguage } from '../../../core/i18n/useSarakLanguage';
import type { SarakI18nLanguage } from '../../../core/i18n/types';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { SarakButton } from '../Buttons/SarakButton';
import { SarakMenuItem } from './SarakMenuItem';

export interface SarakShellLanguageSelectorProps {
    /** Posiciona o seletor na barra ou na lateral; omitida, usa `horizontal`. Com zero ou um idioma habilitado, nada é renderizado. */
    variant?: 'horizontal' | 'vertical';
}

interface ResolvedLanguage {
    id: string;
    name: string;
    flag: string;
}

/** Idioma habilitado que não bate com o catálogo curado
 *  ainda conta para a regra de montagem — é o tema quem decide o conjunto,
 *  não o catálogo de rótulos/bandeiras conhecidos. */
const resolveLanguage = (entry: SarakI18nLanguage): ResolvedLanguage => {
    const code = languageCode(entry);
    const known = LANGUAGES.find((lang) => lang.id === primaryLanguage(code));
    const name = typeof entry === 'object' ? entry.label : known?.name ?? code;
    return { id: code, name, flag: known?.flag ?? '🌐' };
};

/** Idioma atual na lista: código exato, senão pela parte primária (`pt` ↔ `pt-BR`), senão o primeiro. */
const findCurrent = (list: ResolvedLanguage[], code: string): ResolvedLanguage =>
    list.find((lang) => lang.id === code)
    ?? list.find((lang) => primaryLanguage(lang.id) === primaryLanguage(code))
    ?? list[0];

/**
 * ShellLanguageSelector — lista os idiomas do SISTEMA (`options.i18n.languages`) ou, sem
 * eles, os que o TEMA habilita (`design.enabledLanguages`). A escolha vai por `setLanguage`:
 * avisa `onLanguageChange` e, sem idioma controlado, grava a PREFERÊNCIA do usuário, nunca o
 * tema (specs/09 §4.7). Um
 * idioma só, ou nenhum, não monta — não há escolha possível
 * (ADR-014: "só monta quando tem com o que funcionar").
 */
export const SarakShellLanguageSelector: React.FC<SarakShellLanguageSelectorProps> = ({
    variant = 'horizontal'
}) => {
    const { design, options } = useSarakUI();
    const { language, setLanguage } = useSarakLanguage();
    const t = useLibraryText();
    const [isOpen, setIsOpen] = useState(false);

    const OverrideSelector = typeof window !== 'undefined'
        ? (window as Window & {
            __SARAK_OVERRIDES__?: Record<string, React.ComponentType<{ variant?: string }>>;
        }).__SARAK_OVERRIDES__?.['shell-language-selector']
        : null;

    if (OverrideSelector) {
        return (
            <div className={`relative isolate !overflow-visible sarak-language-override-wrapper ${variant === 'horizontal' ? 'horizontal-variant' : ''}`}>
                <OverrideSelector variant={variant} />
            </div>
        );
    }

    const enabledLanguages = (options?.i18n?.languages ?? design?.enabledLanguages ?? []).map(resolveLanguage);
    if (enabledLanguages.length <= 1) return null;

    // `language` é a resolução única (controlado > preferência > tema > pt): o seletor mostra o que vale na tela.
    const currentLang = findCurrent(enabledLanguages, language);

    const selectLanguage = (code: string) => {
        setLanguage(code);
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
                    className={`absolute z-[calc(var(--sarak-z-sidebar,500)_+_100)] w-40 bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl shadow-[var(--dynamic-shadow)] backdrop-blur-xl ${
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
                                    : 'text-[var(--theme-muted)] hover:bg-[var(--theme-muted)]/10 hover:text-[var(--theme-text-primary,var(--sarak-text-main,#f2f6fb))]'
                            }`}
                        >
                            {currentLang.id === lang.id && <SarakIcon name="Check" size={10} />}
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
                        <span className="text-3xs font-black uppercase tracking-widest text-[var(--theme-text-primary,var(--sarak-text-main,#f2f6fb))]/60 group-hover:text-[var(--theme-text-primary,var(--sarak-text-main,#f2f6fb))]">
                            {currentLang.id}
                        </span>
                        <SarakIcon name="ChevronDown" size={10} className={`text-[var(--theme-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
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
                icon={<SarakIcon name="Globe" size={18} className="text-[var(--theme-muted)] group-hover:text-[var(--theme-primary)]" />}
                label={t('languageSelectorLabel')}
            >
                <span className="text-2xs font-bold text-[var(--theme-primary)]">{currentLang.id.toUpperCase()}</span>
            </SarakMenuItem>
            {dropdown}
        </div>
    );
};

export default SarakShellLanguageSelector;
