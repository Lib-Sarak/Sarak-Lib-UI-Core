import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useSarakUI } from '../../Provider/SarakUIProvider';

interface ShellThemeToggleProps {
    variant?: 'horizontal' | 'vertical' | 'mini';
}

export const ShellThemeToggle: React.FC<ShellThemeToggleProps> = ({ variant = 'horizontal' }) => {
    const { design, applyConfigRaw } = useSarakUI();
    
    // Safely fallback to 'dark' if undefined
    const isDarkMode = (design?.mode || 'dark') === 'dark';

    const toggleTheme = () => {
        applyConfigRaw({ mode: isDarkMode ? 'light' : 'dark' });
    };

    if (variant === 'mini') {
        return (
            <button 
                onClick={toggleTheme}
                className="w-full flex justify-center p-2.5 rounded-xl text-[var(--theme-muted)] hover:bg-[var(--theme-muted)]/10 hover:text-[var(--theme-title)] transition-all"
                title={`Mudar para modo ${isDarkMode ? 'claro' : 'escuro'}`}
            >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
        );
    }

    if (variant === 'vertical') {
        return (
            <button 
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[var(--theme-muted)] hover:bg-[var(--theme-muted)]/10 hover:text-[var(--theme-title)] transition-all group"
            >
                {isDarkMode ? (
                    <Sun size={18} className="text-[var(--theme-muted)] group-hover:text-[var(--theme-primary)]" />
                ) : (
                    <Moon size={18} className="text-[var(--theme-muted)] group-hover:text-[var(--theme-primary)]" />
                )}
                <span className="text-sm font-tab flex-1 text-left">
                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </span>
            </button>
        );
    }

    // Horizontal Variant (Topbar)
    return (
        <button 
            onClick={toggleTheme}
            className="p-1.5 text-[var(--theme-muted)] hover:text-[var(--theme-title)] hover:bg-[var(--theme-muted)]/10 rounded-md transition-colors relative"
            title={`Mudar para modo ${isDarkMode ? 'claro' : 'escuro'}`}
        >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
    );
};
