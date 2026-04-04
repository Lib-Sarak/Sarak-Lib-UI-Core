import React, { ReactNode, useEffect } from 'react';
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
    const { theme, setTheme } = useSarak();

    // Sincroniza tema inicial se fornecido
    useEffect(() => {
        if (initialTheme && !theme) {
            setTheme(initialTheme);
        }
    }, [initialTheme, setTheme, theme]);

    // Aplica a classe do layout ao body para variáveis CSS globais
    useEffect(() => {
        const layoutClass = Object.values(LAYOUTS).find(l => l.id === theme)?.class || 'layout-glass';
        document.body.classList.remove('layout-glass', 'layout-cyberpunk', 'layout-monolith');
        document.body.classList.add(layoutClass);
        
        // Setup base styles for Elite Glassmorphism
        document.body.style.backgroundColor = '#050505';
        document.body.style.color = '#ffffff';
        document.body.style.margin = '0';
        document.body.style.fontFamily = "'Inter', system-ui, -apple-system, sans-serif";
    }, [theme]);

    return (
        <div className="sarak-ui-root contents">
            {children}
        </div>
    );
};

export default SarakUIProvider;
