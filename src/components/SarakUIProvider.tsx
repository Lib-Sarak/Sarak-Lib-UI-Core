import React, { ReactNode, useEffect, useState, useCallback, useMemo } from 'react';
import { LAYOUTS, SCALES, DENSITY } from '../constants/theme';

/**
 * Tenta obter o contexto da Shared se disponível, 
 * caso contrário falha silenciosamente para o estado local.
 */
let sharedContext: any = null;
try {
    sharedContext = require('@sarak/lib-shared');
} catch (e) {
    // Shared não disponível - operando em modo autônomo
}

interface SarakUIProviderProps {
    children: ReactNode;
    theme?: string;
    mode?: 'light' | 'dark' | 'system';
    primaryColor?: string;
}

/**
 * SarakUIProvider (Elite v5.4 - Autonomous Engine)
 * O "Cérebro" de UI da Sarak Matrix. 
 * Responsável por injetar 100% dos tokens de design e gerenciar o estado estético.
 */
export const SarakUIProvider: React.FC<SarakUIProviderProps> = ({ 
    children, 
    theme: initialTheme,
    mode: initialMode,
    primaryColor: initialPrimaryColor
}) => {
    // --- ESTADO INTERNO (FALLBACK AUTÔNOMO) ---
    const [localTheme, setLocalTheme] = useState(() => localStorage.getItem('sarak_layout') || initialTheme || 'glass');
    const [localMode, setLocalMode] = useState<'light' | 'dark' | 'system'>(() => (localStorage.getItem('sarak_mode') as any) || initialMode || 'dark');
    const [localPrimaryColor, setLocalPrimaryColor] = useState(() => localStorage.getItem('sarak_primary_color') || initialPrimaryColor || '#3b82f6');
    const [localFontScale, setLocalFontScale] = useState(() => localStorage.getItem('sarak_font_scale') || 'm');
    const [localDensity, setLocalDensity] = useState(() => localStorage.getItem('sarak_layout_density') || 'standard');
    const [localNavStyle, setLocalNavStyle] = useState<'sidebar' | 'topbar'>(() => (localStorage.getItem('sarak_nav_style') as any) || 'sidebar');
    const [localSidebarWidth, setLocalSidebarWidth] = useState(() => parseInt(localStorage.getItem('sarak_sidebar_width') || '260'));

    // --- Tenta conectar com o useSarak da Shared ---
    let sarak: any = {};
    try {
        if (sharedContext?.useSarak) {
            sarak = sharedContext.useSarak();
        }
    } catch (e) {
        // useSarak chamando fora do provider ou não disponível
    }

    // Resolvendo valores finais (Prioridade: Shared > Local)
    const theme = sarak.theme || sarak.layout || localTheme;
    const mode = sarak.mode || localMode;
    const primaryColor = sarak.primaryColor || localPrimaryColor;
    const fontScale = sarak.fontScale || localFontScale;
    const layoutDensity = sarak.layoutDensity || localDensity;
    const navigationStyle = sarak.navigationStyle || localNavStyle;
    const sidebarWidth = sarak.sidebarWidth || localSidebarWidth;

    // --- MOTOR DE DOM PATCHING (RESTORE v5.4) ---
    useEffect(() => {
        const root = document.documentElement;
        
        // 1. Variáveis de Cores e Dimensões
        root.style.setProperty('--primary-color', primaryColor);
        root.style.setProperty('--theme-primary', primaryColor);
        root.style.setProperty('--sidebar-width', `${sidebarWidth}px`);
        
        // 2. Escala de Fonte
        const scale = (SCALES as any)[fontScale.toUpperCase()] || SCALES.M;
        root.style.setProperty('--font-size-factor', scale.factor);
        root.style.setProperty('--sarak-font-size', `${16 * parseFloat(scale.factor)}px`);

        // 3. Densidade
        const density = (DENSITY as any)[layoutDensity.toUpperCase()] || DENSITY.STANDARD;
        root.style.setProperty('--theme-gap', density.gap);
        root.style.setProperty('--theme-padding', density.pad);
        root.style.setProperty('--radius-theme', density.radius);

        // 4. Classes do Body (Paridade de Layout)
        const lowerTheme = theme?.toLowerCase() || 'glass';
        const layoutConfig = Object.values(LAYOUTS).find((l: any) => l.id.toLowerCase() === lowerTheme) || LAYOUTS.GLASS;
        
        // Limpeza de classes legadas para evitar colisão
        const allLayoutClasses = Object.values(LAYOUTS).map((l: any) => l.class).filter(Boolean);
        document.body.classList.remove(...allLayoutClasses, 'light', 'dark', 'nav-sidebar', 'nav-topbar');
        
        document.body.classList.add(layoutConfig.class || 'layout-glass');
        document.body.classList.add(mode === 'dark' ? 'dark' : 'light');
        document.body.classList.add(`nav-${navigationStyle}`);

        // Persistência local (Garantia de Autonomia)
        localStorage.setItem('sarak_layout', theme);
        localStorage.setItem('sarak_mode', mode);
        localStorage.setItem('sarak_primary_color', primaryColor);
        localStorage.setItem('sarak_font_scale', fontScale);
        localStorage.setItem('sarak_layout_density', layoutDensity);
        localStorage.setItem('sarak_nav_style', navigationStyle);
        localStorage.setItem('sarak_sidebar_width', sidebarWidth.toString());

    }, [theme, mode, primaryColor, fontScale, layoutDensity, navigationStyle, sidebarWidth]);

    // --- MOTOR DE VIEWPORT SCALING (RESTORATION v5.7.1) ---
    useEffect(() => {
        const handleResize = () => {
            const root = document.documentElement;
            // Cálculo Premium: Baseado em 1920px (Full HD)
            const vScale = Math.min(Math.max(window.innerWidth / 1920, 0.7), 1.25);
            root.style.setProperty('--sarak-viewport-scale', vScale.toString());
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // --- SHORTCUTS ENGINE (PASS-THROUGH) ---
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

        // Atalhos de Sistema Rápidos
        if (e.ctrlKey && e.key.toLowerCase() === 'q') {
            sarak.toggleMode ? sarak.toggleMode() : setLocalMode(prev => prev === 'dark' ? 'light' : 'dark');
        }
    }, [sarak]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return (
        <div className={`sarak-ui-root contents ${mode} ${theme}`}>
            {children}
        </div>
    );
};

export default SarakUIProvider;
