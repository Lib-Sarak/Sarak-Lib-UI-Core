import React, { ReactNode, useEffect, useState, useMemo } from 'react';
import { LAYOUTS, SCALES, DENSITY } from '../constants/theme';
import { useSarak as useGlobalSarak } from '@sarak/lib-shared';

interface SarakUIProviderProps {
    children: ReactNode;
    theme?: string;
    mode?: 'light' | 'dark' | 'system';
    primaryColor?: string;
}

/**
 * SarakUIProvider (Elite v5.4.1)
 * 
 * Motor de UI Federado: 
 * 1. Se estiver dentro de um SarakProvider (Shared), atua apenas como ponte.
 * 2. Se estiver isolado, assume o controle total do estado estético.
 */
export const SarakUIProvider: React.FC<SarakUIProviderProps> = ({ 
    children, 
    theme: propTheme, 
    mode: propMode, 
    primaryColor: propPrimary 
}) => {
    // Tenta obter o contexto global da Shared
    let globalSarak: any = null;
    try {
        globalSarak = useGlobalSarak();
    } catch (e) {
        // Shared não presente ou Provider ausente na árvore
    }

    // Estado Local (Fallback Autônomo)
    const [localLayout, setLocalLayout] = useState(() => localStorage.getItem('sarak_local_layout') || propTheme || 'glass');
    const [localMode, setLocalMode] = useState<'light' | 'dark' | 'system'>(() => (localStorage.getItem('sarak_local_mode') as any) || propMode || 'dark');
    const [localPrimary, setLocalPrimary] = useState(() => localStorage.getItem('sarak_local_primary') || propPrimary || '#3b82f6');
    const [isHydrated, setIsHydrated] = useState(false);

    // Motor de Injeção de Design Elite v5.4.1
    // Só é executado se NÃO houver um contexto global (Evita Split Brain)
    useEffect(() => {
        if (globalSarak) {
            setIsHydrated(true);
            return;
        }

        const root = document.documentElement;
        root.style.setProperty('--primary-color', localPrimary);
        root.style.setProperty('--theme-primary', localPrimary);
        
        // Fontes e Escala
        const scaleId = localStorage.getItem('sarak_font_scale') || 'm';
        const scale = (SCALES as any)[scaleId.toUpperCase()] || SCALES.M;
        root.style.setProperty('--font-size-factor', scale.factor);
        root.style.setProperty('--sarak-font-size', `${16 * parseFloat(scale.factor)}px`);

        // Densidade
        const densityId = localStorage.getItem('sarak_layout_density') || 'standard';
        const d = (DENSITY as any)[densityId.toUpperCase()] || DENSITY.STANDARD;
        root.style.setProperty('--theme-gap', d.gap);
        root.style.setProperty('--theme-padding', d.pad);
        root.style.setProperty('--radius-theme', d.radius);

        const lowerLayout = localLayout?.toLowerCase() || 'glass';
        const layoutConfig = Object.values(LAYOUTS).find((l: any) => l.id.toLowerCase() === lowerLayout) || LAYOUTS.GLASS;
        
        const sarakClasses = Object.values(LAYOUTS).map((l: any) => l.class).filter(Boolean);
        document.body.classList.remove(...sarakClasses, 'light', 'dark');
        
        document.body.classList.add(layoutConfig.class || 'layout-glass', localMode === 'dark' ? 'dark' : 'light');

        // Persistência em Modo Autônomo
        localStorage.setItem('sarak_local_layout', localLayout);
        localStorage.setItem('sarak_local_mode', localMode);
        localStorage.setItem('sarak_local_primary', localPrimary);
        
        setIsHydrated(true);
    }, [globalSarak, localLayout, localMode, localPrimary]);

    if (!isHydrated) return null;

    return <>{children}</>;
};

export default SarakUIProvider;
