import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, User, ChevronDown, KeyRound, LogOut } from 'lucide-react';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { LANGUAGES as ALL_LANGUAGES } from '../../../core/Discovery/constants';
import { LANGUAGE_STORAGE_KEY } from '../../../core/Provider/constants';

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
                <button
                    key={l.id}
                    onClick={() => handleLangChange(l.id)}
                    className={`text-2xs font-bold transition-all hover:text-theme-primary ${current === l.id ? 'text-theme-primary' : 'text-theme-muted'
                        }`}
                    style={{ padding: 'calc(var(--sarak-layout-gap-md,16px) * 0.25) calc(var(--sarak-layout-gap-md,16px) * 0.375)' }}
                >
                    {l.label}
                </button>
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
            <button
                onClick={toggleMode}
                data-action-id="ui:theme_toggle_btn"
                data-action-name="Toggle Brightness (Bar)"
                data-action-category="Interface"
                className="rounded-xl bg-[var(--color-theme-card,#1e293b)] border border-[var(--border-color,#334155)]-border text-theme-muted hover:text-theme-primary transition-all group overflow-hidden relative"
                style={{ padding: 'calc(var(--sarak-layout-gap-md,16px) * 0.625)' }}
            >
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
            </button>
        </div>
    );
};

export const UserMenu = ({ user, onPasswordModal, onLogout }: { user: UserPayload | null, onPasswordModal: () => void, onLogout: () => void }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const userName = user?.email?.split('@')[0] || 'User';

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center rounded-xl hover:bg-theme-primary/5 transition-colors group"
                style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) * 0.75)', padding: 'var(--sarak-layout-gap-sm, 8px) calc(var(--sarak-layout-gap-md,16px) * 0.75)' }}
            >
                <span className="text-xs font-bold text-theme-muted group-hover:text-theme-primary transition-all hidden sm:block uppercase tracking-widest">
                    {userName}
                </span>
                <div className="w-8 h-8 rounded-full bg-theme-body border border-[var(--border-color,#334155)]-border flex items-center justify-center text-theme-muted group-hover:text-theme-primary transition-all">
                    <User className="w-4 h-4" />
                </div>
                <ChevronDown className={`w-3 h-3 text-theme-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

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
                                <button onClick={() => { setIsOpen(false); onPasswordModal(); }} className="w-full flex items-center text-sm text-theme-main hover:bg-theme-primary/10 rounded-lg transition-colors text-left" style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) * 0.75)', padding: 'calc(var(--sarak-layout-gap-md,16px) * 0.625) calc(var(--sarak-layout-gap-md,16px) * 0.75)' }}>
                                    <KeyRound className="w-4 h-4 opacity-50" />
                                    <span>Change Password</span>
                                </button>
                                <div className="h-px bg-theme-border" style={{ marginTop: 'calc(var(--sarak-layout-gap-md,16px) * 0.25)', marginBottom: 'calc(var(--sarak-layout-gap-md,16px) * 0.25)' }}></div>
                                <button onClick={() => { setIsOpen(false); onLogout(); }} className="w-full flex items-center text-sm text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors text-left font-bold" style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) * 0.75)', padding: 'calc(var(--sarak-layout-gap-md,16px) * 0.625) calc(var(--sarak-layout-gap-md,16px) * 0.75)' }}>
                                    <LogOut className="w-4 h-4" />
                                    <span>Log Out</span>
                                </button>
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
            <button
                key={mod.id}
                onClick={() => setCurrentModule(mod.id)}
                className={`flex-grow rounded-lg text-2xs font-black transition-all duration-300 uppercase tracking-widest ${currentModule === mod.id
                    ? "bg-theme-primary text-white shadow-lg"
                    : "text-theme-muted hover:text-theme-title hover:bg-theme-primary/5"
                    }`}
                style={{ padding: 'calc(var(--sarak-layout-gap-md,16px) * 0.375) calc(var(--sarak-layout-gap-md,16px) * 0.75)' }}
            >
                {mod.label}
            </button>
        ))}
    </div>
);



