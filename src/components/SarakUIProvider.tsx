import React, { ReactNode, useEffect, useState, useMemo } from 'react';
import '../styles/sarak-base.css';
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

    // Estado Local (Fallback Autônomo Elite v5.4.2)
    const [localLayout, setLocalLayout] = useState(() => localStorage.getItem('sarak_local_layout') || propTheme || 'glass');
    const [localMode, setLocalMode] = useState<'light' | 'dark' | 'system'>(() => (localStorage.getItem('sarak_local_mode') as any) || propMode || 'dark');
    const [localPrimary, setLocalPrimary] = useState(() => localStorage.getItem('sarak_local_primary') || propPrimary || '#3b82f6');
    const [localDensity, setLocalDensity] = useState(() => localStorage.getItem('sarak_local_density') || 'standard');
    const [localTexture, setLocalTexture] = useState(() => localStorage.getItem('sarak_local_texture') || 'none');
    const [isHydrated, setIsHydrated] = useState(false);

    // Motor de Injeção de Design Elite v5.4.2 (Full Parity)
    // Só é executado se NÃO houver um contexto global (Evita Split Brain)
    useEffect(() => {
        if (globalSarak) {
            setIsHydrated(true);
            return;
        }

        const root = document.documentElement;
        const body = document.body;

        root.style.setProperty('--primary-color', localPrimary);
        root.style.setProperty('--theme-primary', localPrimary);
        
        // Fontes e Escala
        const scaleId = localStorage.getItem('sarak_font_scale') || 'm';
        const scale = (SCALES as any)[scaleId.toUpperCase()] || SCALES.M;
        root.style.setProperty('--font-size-factor', scale.factor);
        root.style.setProperty('--sarak-font-size', `${16 * parseFloat(scale.factor)}px`);

        // Densidade e Textura
        const lowerLayout = localLayout?.toLowerCase() || 'glass';
        const layoutConfig = Object.values(LAYOUTS).find((l: any) => l.id.toLowerCase() === lowerLayout) || LAYOUTS.GLASS;
        
        const sarakClasses = Object.values(LAYOUTS).map((l: any) => l.class).filter(Boolean);
        const textureClasses = ['texture-none', 'texture-grid', 'texture-dots', 'texture-scanlines', 'texture-carbon', 'texture-paper', 'texture-topo'];
        const densityClasses = ['density-compact', 'density-standard', 'density-comfortable'];
        
        body.classList.remove(...sarakClasses, 'light', 'dark', ...textureClasses, ...densityClasses);
        
        body.classList.add(
            layoutConfig.class || 'layout-glass', 
            localMode === 'dark' ? 'dark' : 'light',
            `density-${localDensity}`,
            `texture-${localTexture}`
        );

        // Persistência em Modo Autônomo
        localStorage.setItem('sarak_local_layout', localLayout);
        localStorage.setItem('sarak_local_mode', localMode);
        localStorage.setItem('sarak_local_primary', localPrimary);
        localStorage.setItem('sarak_local_density', localDensity);
        localStorage.setItem('sarak_local_texture', localTexture);
        
        setIsHydrated(true);
    }, [globalSarak, localLayout, localMode, localPrimary, localDensity, localTexture]);

    if (!isHydrated) return null;

    return <>{children}</>;
};

export default SarakUIProvider;
