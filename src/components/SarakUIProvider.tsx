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

    // --- Motor de Viewport Scaling (Auto-ajuste Sarak Matrix) ---
    useEffect(() => {
        const handleResize = () => {
            const root = document.documentElement;
            // Largura base para o design Sarak Elite é 1920px
            const targetWidth = 1920;
            const currentWidth = window.innerWidth;
            const scale = Math.min(Math.max(currentWidth / targetWidth, 0.85), 1.1);
            
            root.style.setProperty('--sarak-viewport-scale', scale.toString());
            
            // Opcional: Aplicar escala via transform no root se o usuário preferir zoom real
            // document.body.style.transform = `scale(${scale})`;
            // document.body.style.transformOrigin = 'top left';
            // document.body.style.width = `${100 / scale}%`;
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Aplica a classe do layout ao body (Limpando classes legadas)
    useEffect(() => {
        const layoutConfig = Object.values(LAYOUTS).find(l => l.id === theme) || LAYOUTS.GLASS;
        const layoutClass = layoutConfig.class || 'layout-glass';
        
        // SarakProvider já cuida da limpeza no Body no v5.4, 
        // mantemos aqui apenas garantias de estilo base.
        document.body.style.margin = '0';
        document.body.style.overflowX = 'hidden';
        document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    }, [theme]);

    // --- Motor de Atalhos (Shortcuts Engine v5.4) ---
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;
        if ((e.target as HTMLElement).isContentEditable) return;

        const shortcutsArray = Array.isArray(shortcuts) ? shortcuts : Object.values(shortcuts || {});

        shortcutsArray.forEach((shortcut: any) => {
            const keys = (shortcut.keys || []).map((k: string) => k.toLowerCase());
            if (!keys.length) return;


            const isCtrl = keys.includes('control') || keys.includes('ctrl') || keys.includes('meta');
            const isShift = keys.includes('shift');
            const isAlt = keys.includes('alt');
            
            const reqKey = keys.find((k: string) => !['control', 'ctrl', 'shift', 'alt', 'meta'].includes(k));
            if (!reqKey) return;

            const ctrlMatch = isCtrl ? (e.ctrlKey || e.metaKey) : !(e.ctrlKey || e.metaKey);
            const shiftMatch = isShift ? e.shiftKey : !e.shiftKey;
            const altMatch = isAlt ? e.altKey : !e.altKey;
            const keyMatch = e.key.toLowerCase() === reqKey.toLowerCase();

            if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
                e.preventDefault();
                e.stopPropagation();
                
                console.info(`[Sarak OS] Executing Action: ${shortcut.id}`);

                if (shortcut.id === 'ui:toggleTheme') toggleMode();
                if (shortcut.id === 'ui:focusMode') toggleNav();
                
                if (registeredActions && registeredActions[shortcut.id]) {
                    registeredActions[shortcut.id]();
                }
                
                const legacyActions = (window as any).SARAK_REGISTERED_ACTIONS || {};
                if (legacyActions[shortcut.id]) legacyActions[shortcut.id]();
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


