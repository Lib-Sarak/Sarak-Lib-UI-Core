import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, User, ChevronDown, KeyRound, LogOut } from 'lucide-react';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { LANGUAGES as ALL_LANGUAGES } from '../../../core/Discovery/constants';
import { LANGUAGE_STORAGE_KEY } from '../../../core/Provider/constants';
import { SarakButton } from '../Buttons/SarakButton';
import { SarakIconButton } from '../Buttons/SarakIconButton';

/** O preset de SarakButton é para rótulo de AÇÃO (maiúsculas, tracking largo, peso
 * preto) — os usos deste arquivo são rótulo de ESTADO (idioma/módulo ativo) ou item
 * de menu; neutraliza via `style` (vence a classe) em vez de brigar com a cascata. */
const PLAIN_LABEL_STYLE: React.CSSProperties = { textTransform: 'none', letterSpacing: 'normal', fontWeight: 500 };

export interface UserPayload {
    email?: string;
    [key: string]: unknown;
}

export interface ModuleConfig {
    id: string;
    label: string;
    [key: string]: unknown;
}

export interface LanguageOption {
    id: string;
    label: string;
}

export const LanguageSelector = () => {
    const { design } = useSarakUI();
    const enabledLanguages = design?.enabledLanguages;
    const [current, setCurrent] = React.useState(localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'pt');

    const handleLangChange = (lang: string) => {
        if (lang === current) return;
        localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
        setCurrent(lang);

        // Directly swap the Google Translate cookie
        const value = lang === 'pt' ? '' : `/pt/${lang}`;
        document.cookie = `googtrans=${value}; path=/`;
        document.cookie = `googtrans=${value}; path=/; domain=${window.location.hostname}`;

        // Small exit animation and reload
        document.body.style.opacity = '0.5';
        document.body.style.transition = 'opacity 0.3s ease';
        setTimeout(() => window.location.reload(), 300);
    };

    // Filter enabled languages
    const activeLangs = (enabledLanguages || ['pt', 'en', 'es'])
        .map((id: string) => ALL_LANGUAGES.find((l: LanguageOption) => l.id === id))
        .filter(Boolean) as LanguageOption[];

    return (
        <div
            className="flex items-center bg-[var(--color-theme-card,#1e293b)] border border-[var(--border-color,#334155)]-border rounded-xl"
            style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) * 0.25)', padding: 'calc(var(--sarak-layout-gap-md,16px) * 0.25) var(--sarak-layout-gap-sm, 8px)' }}
        >
            {activeLangs.map(l => (
                <SarakButton
                    key={l.id}
                    onClick={() => handleLangChange(l.id)}
                    variant="ghost"
                    size="xs"
                    style={{
                        ...PLAIN_LABEL_STYLE,
                        padding: 'calc(var(--sarak-layout-gap-md,16px) * 0.25) calc(var(--sarak-layout-gap-md,16px) * 0.375)',
                        color: current === l.id ? 'var(--theme-primary)' : 'var(--theme-muted)',
                    }}
                >
                    {l.label}
                </SarakButton>
            ))}
        </div>
    );
};

export const ThemeToggle = () => {
    const { design, applyConfig } = useSarakUI();
    const mode = design?.mode || 'dark';
    const toggleMode = () => applyConfig({ mode: mode === 'dark' ? 'light' : 'dark' });
    return (
        <div className="flex items-center" style={{ gap: 'var(--sarak-layout-gap-sm, 8px)' }}>
            <LanguageSelector />
            <SarakIconButton
                onClick={toggleMode}
                data-action-id="ui:theme_toggle_btn"
                data-action-name="Toggle Brightness (Bar)"
                data-action-category="Interface"
                variant="secondary"
                size="md"
                style={{ backgroundColor: 'var(--color-theme-card,#1e293b)' }}
                icon={
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={mode}
                            initial={{ y: 20, opacity: 0, rotate: -45 }}
                            animate={{ y: 0, opacity: 1, rotate: 0 }}
                            exit={{ y: -20, opacity: 0, rotate: 45 }}
                            transition={{ duration: 0.2, ease: "backOut" }}
                        >
                            {mode === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                        </motion.div>
                    </AnimatePresence>
                }
            />
        </div>
    );
};

export const UserMenu = ({ user, onPasswordModal, onLogout }: { user: UserPayload | null, onPasswordModal: () => void, onLogout: () => void }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const userName = user?.email?.split('@')[0] || 'User';

    return (
        <div className="relative">
            <SarakButton
                onClick={() => setIsOpen(!isOpen)}
                variant="ghost"
                className="group"
                style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) * 0.75)', padding: 'var(--sarak-layout-gap-sm, 8px) calc(var(--sarak-layout-gap-md,16px) * 0.75)' }}
                rightIcon={
                    <>
                        <div className="w-8 h-8 rounded-full bg-theme-body border border-[var(--border-color,#334155)]-border flex items-center justify-center text-theme-muted group-hover:text-theme-primary transition-all">
                            <User className="w-4 h-4" />
                        </div>
                        <ChevronDown className={`w-3 h-3 text-theme-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </>
                }
            >
                <span className="text-xs font-bold text-theme-muted group-hover:text-theme-primary transition-all hidden sm:block uppercase tracking-widest">
                    {userName}
                </span>
            </SarakButton>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="absolute right-0 bottom-full w-48 bg-[var(--color-theme-card,#1e293b)] border border-[var(--border-color,#334155)]-border rounded-xl shadow-2xl z-50 overflow-hidden"
                            style={{ marginBottom: 'var(--sarak-layout-gap-sm, 8px)' }}
                        >
                            <div style={{ padding: 'calc(var(--sarak-layout-gap-md,16px) * 0.25)' }}>
                                <SarakButton
                                    onClick={() => { setIsOpen(false); onPasswordModal(); }}
                                    variant="ghost"
                                    fullWidth
                                    leftIcon={<KeyRound className="w-4 h-4 opacity-50" />}
                                    className="justify-start"
                                    style={{ ...PLAIN_LABEL_STYLE, justifyContent: 'flex-start', color: 'var(--text-main)', padding: 'calc(var(--sarak-layout-gap-md,16px) * 0.625) calc(var(--sarak-layout-gap-md,16px) * 0.75)' }}
                                >
                                    Change Password
                                </SarakButton>
                                <div className="h-px bg-theme-border" style={{ marginTop: 'calc(var(--sarak-layout-gap-md,16px) * 0.25)', marginBottom: 'calc(var(--sarak-layout-gap-md,16px) * 0.25)' }}></div>
                                <SarakButton
                                    onClick={() => { setIsOpen(false); onLogout(); }}
                                    variant="ghost"
                                    fullWidth
                                    leftIcon={<LogOut className="w-4 h-4" />}
                                    className="justify-start"
                                    style={{ ...PLAIN_LABEL_STYLE, justifyContent: 'flex-start', fontWeight: 700, color: 'var(--sarak-status-error-color,#ef4444)', padding: 'calc(var(--sarak-layout-gap-md,16px) * 0.625) calc(var(--sarak-layout-gap-md,16px) * 0.75)' }}
                                >
                                    Log Out
                                </SarakButton>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export const ModuleSelector = ({ currentModule, setCurrentModule, modules = [] }: { currentModule: string, setCurrentModule: (id: string) => void, modules: ModuleConfig[] }) => (
    <div className="flex items-center bg-theme-body/50 rounded-xl border border-[var(--border-color,#334155)]-border" style={{ padding: 'calc(var(--sarak-layout-gap-md,16px) * 0.25)' }}>
        {modules.map((mod: ModuleConfig) => (
            <SarakButton
                key={mod.id}
                onClick={() => setCurrentModule(mod.id)}
                variant="ghost"
                size="xs"
                className={`flex-grow ${currentModule === mod.id ? 'shadow-lg' : 'hover:text-theme-title hover:bg-theme-primary/5'}`}
                style={{
                    padding: 'calc(var(--sarak-layout-gap-md,16px) * 0.375) calc(var(--sarak-layout-gap-md,16px) * 0.75)',
                    backgroundColor: currentModule === mod.id ? 'var(--theme-primary)' : 'transparent',
                    color: currentModule === mod.id ? 'var(--color-theme-on-primary, #020617)' : 'var(--theme-muted)',
                }}
            >
                {mod.label}
            </SarakButton>
        ))}
    </div>
);



