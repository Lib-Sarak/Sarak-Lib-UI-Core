import React, { ReactNode, useEffect, useCallback } from 'react';
import { useSarak, LAYOUTS } from '@sarak/lib-shared';

interface SarakUIProviderProps {
    children: ReactNode;
    theme?: string;
}

/**
 * SarakUIProvider (Elite v5.2)
 * Injetor de tokens de design e motor de renderização de temas.
 * Sincroniza o estado global da Lib-Shared com as classes de CSS da UI-Core.
 */
export const SarakUIProvider: React.FC<SarakUIProviderProps> = ({ 
    children, 
    theme: initialTheme 
}) => {
    const { 
        theme, setTheme, mode, toggleMode, 
        shortcuts, toggleNav, registeredActions
    } = useSarak();

    // Sincroniza tema inicial se fornecido
    useEffect(() => {
        if (initialTheme && !theme) {
            setTheme(initialTheme);
        }
    }, [initialTheme, setTheme, theme]);

    // Aplica a classe do layout ao body (Sincronização Elite)
    useEffect(() => {
        const layoutConfig = Object.values(LAYOUTS).find(l => l.id === theme) || LAYOUTS.GLASS;
        const layoutClass = layoutConfig.class || 'layout-glass';
        
        document.body.classList.add(layoutClass);

        // Setup base styles
        document.body.style.margin = '0';
        document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    }, [theme]);

    // --- Motor de Atalhos (Shortcuts Engine v5.2) ---
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        // Ignorar se estiver em campos de texto
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;
        if ((e.target as HTMLElement).isContentEditable) return;

        const shortcutsArray = Array.isArray(shortcuts) ? shortcuts : Object.values(shortcuts || {});

        shortcutsArray.forEach((shortcut: any) => {
            const keys = shortcut.keys || [];
            if (!keys.length) return;

            // Mapeamento de modificadores
            const ctrlReq = keys.some((k: string) => k.toLowerCase() === 'control' || k.toLowerCase() === 'ctrl' || k.toLowerCase() === 'meta');
            const shiftReq = keys.some((k: string) => k.toLowerCase() === 'shift');
            const altReq = keys.some((k: string) => k.toLowerCase() === 'alt');
            const mainKey = keys.find((k: string) => !['control', 'ctrl', 'shift', 'alt', 'meta'].includes(k.toLowerCase()));

            const ctrlMatch = ctrlReq ? (e.ctrlKey || e.metaKey) : !(e.ctrlKey || e.metaKey);
            const shiftMatch = shiftReq ? e.shiftKey : !e.shiftKey;
            const altMatch = altReq ? e.altKey : !e.altKey;
            const mainKeyMatch = mainKey?.toLowerCase() === e.key.toLowerCase();

            if (ctrlMatch && shiftMatch && altMatch && mainKeyMatch) {
                e.preventDefault();
                e.stopPropagation();
                
                console.info(`[Sarak OS] Shortcut Triggered: ${shortcut.id}`);

                // Ações Core
                if (shortcut.id === 'ui:toggleTheme') toggleMode();
                if (shortcut.id === 'ui:focusMode') toggleNav();
                
                // Ações Registradas (Dynamic Event Bus)
                if (registeredActions && registeredActions[shortcut.id]) {
                    registeredActions[shortcut.id]();
                }
                
                // Fallback para window (legado)
                const legacyActions = (window as any).SARAK_REGISTERED_ACTIONS || {};
                if (legacyActions[shortcut.id]) {
                    legacyActions[shortcut.id]();
                }
            }
        });
    }, [shortcuts, toggleMode, toggleNav, registeredActions]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown, { capture: true });
        return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
    }, [handleKeyDown]);

    return (
        <div className={`sarak-ui-root contents ${mode}`}>
            {children}
        </div>
    );
};

export default SarakUIProvider;


