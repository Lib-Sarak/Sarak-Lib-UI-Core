import React, { ReactNode, useEffect, useState, useMemo } from 'react';
import '../styles/sarak-base.css';
import { LAYOUTS, SCALES, DENSITY, SarakContext } from '@sarak/lib-shared';
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

    // Injeção de Fontes (Elite v5.4.1 - Mirror Global)
    // Injeta o @import original no topo absoluto do <head> para garantir validade CSS
    useEffect(() => {
        if (typeof document === 'undefined') return;
        const FONT_ID = 'sarak-core-fonts';
        
        // DEBUG_LOG_MARKER: Rastreio de Ativos
        if (document.getElementById(FONT_ID)) {
            console.log('ℹ️ [FontEngine] Fontes já presentes no DOM. Ignorando reinjeção.');
            return;
        }

        console.log('🖋️ [FontEngine] Iniciando injeção dinâmica no Head. Preparando Google Fonts CDN...');
        const style = document.createElement('style');
        style.id = FONT_ID;
        style.textContent = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&family=Space+Grotesk:wght@300;500;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Fira+Code:wght@400;500&family=Outfit:wght@300;400;600&family=JetBrains+Mono:wght@400;700&family=Cabinet+Grotesk:wght@400;700;900&family=Satoshi:wght@300;400;700;900&family=Sentient:ital,wght@0,400;0,700;1,400&family=Fraunces:ital,wght@0,400;0,700;1,400&family=Syne:wght@400;700;800&family=Space+Mono:wght@400;700&family=Bricolage+Grotesque:wght@400;700;800&family=Public+Sans:wght@400;500;700&family=Anton&family=Lora:ital,wght@0,400;0,600;1,400&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Rajdhani:wght@500;700&family=Orbitron:wght@700;900&family=Quicksand:wght@400;700&family=Fredoka+One&family=Nunito:wght@400;700&family=Cinzel:wght@400;700&family=Oswald:wght@400;700&family=Plus+Jakarta+Sans:wght@400;700&family=Archivo+Black&family=Syncopate:wght@700&family=Figtree:wght@400;700&family=Urbanist:wght@400;800&family=Barlow+Condensed:wght@600&family=Share+Tech+Mono&display=swap');`;
        
        try {
            document.head.prepend(style);
            console.log('✅ [FontEngine] Injeção concluída com sucesso no topo do Head.');
        } catch (e) {
            console.error('❌ [FontEngine Error] Falha crítica ao injetar fontes:', e);
        }
    }, []);

    // Motor de Injeção de Design Elite v5.4.2 (Full Parity)
    // Só é executado se NÃO houver um contexto global (Evita Split Brain)
    useEffect(() => {
        // DEBUG_LOG_MARKER: Verificação de Federação
        if (globalSarak) {
            console.log('🔗 [SarakUIProvider] Bridge Mode: Contexto Global detectado. Delegando controle ao SharedProvider.');
            setIsHydrated(true);
            return;
        }

        console.group('%c🛰️ [SarakUIProvider] Autonomous Mode Trace', 'color: #a855f7; font-weight: bold;');
        const root = document.documentElement;
        const body = document.body;

        try {
            console.log('   -> Aplicando estado local (Isolated View)...');
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
            console.log('✅ [SarakUIProvider] Injeção autônoma finalizada.');
        } catch (error) {
            console.error('❌ [SarakUIProvider Error] Falha no motor autônomo:', error);
        } finally {
            console.groupEnd();
        }
    }, [globalSarak, localLayout, localMode, localPrimary, localDensity, localTexture]);

    // Valor do Contexto para Modo Autônomo (Elite v5.4.3)
    const fallbackContextValue = useMemo(() => ({
        layout: localLayout,
        setLayout: setLocalLayout,
        theme: localLayout,
        setTheme: setLocalLayout,
        mode: localMode,
        setMode: setLocalMode,
        toggleMode: () => setLocalMode(prev => prev === 'dark' ? 'light' : 'dark'),
        primaryColor: localPrimary,
        setPrimaryColor: setLocalPrimary,
        sidebarWidth: 260,
        setSidebarWidth: () => {},
        isNavHidden: false,
        setIsNavHidden: () => {},
        toggleNav: () => {},
        navigationStyle: 'sidebar' as const,
        user: { email: 'Sarak Isolated', role: 'System' },
        logout: () => console.log('Sarak UI-Core: Logout ignored in Isolated Mode'),
        registeredModules: [],
        enabledLanguages: ['pt', 'en'],
        language: 'pt',
        setLanguage: () => {},
        isHydrated: true,
        loading: false
    }), [localLayout, localMode, localPrimary, localDensity, localTexture]);

    if (!isHydrated) return null;

    // Se estiver em modo orquestrado, apenas renderiza os filhos.
    // Se estiver em modo autônomo, provê o contexto necessário para os componentes internos.
    if (globalSarak) {
        return <>{children}</>;
    }

    return (
        <SarakContext.Provider value={fallbackContextValue as any}>
            {children}
        </SarakContext.Provider>
    );
};

export default SarakUIProvider;
