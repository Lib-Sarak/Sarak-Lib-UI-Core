import { useEffect, useCallback, useMemo } from 'react';
import { useSarakUI } from '../Provider/SarakUIProvider';
import { useModuleDiscovery } from '../../shared/hooks/useModuleDiscovery';
import { useSarakRouter } from '../../shared/hooks/useSarakRouter';
import { DiscoveredModule } from '../Discovery/types';
import { useSarakShellUI } from './hooks/useSarakShellUI';

export const useSarakShell = (loggedIn: boolean) => {
    const { design, options } = useSarakUI();
    const { modules: discoveredModules, isLoading: isDiscovering } = useModuleDiscovery(loggedIn);
    const { segments, navigate } = useSarakRouter();
    const { state: uiState, updateState, toggleNav, startResizingSidebar, startResizingTopbar } = useSarakShellUI();
    
    // O módulo ativo é derivado do primeiro segmento da URL
    const activeModuleId = segments[0] || null;
    
    const setActiveModuleId = useCallback((id: string) => {
        navigate(`/${id}`);
    }, [navigate]);

    // Module activation (Native Routing v10.2): `defaultModuleId` do consumidor manda; sem
    // ele, abre o primeiro módulo descoberto. O desempate por `mx-customization` saiu junto
    // com o id legado — a lib não elege mais um módulo dela como tela inicial do host.
    useEffect(() => {
        if (discoveredModules.length > 0 && !activeModuleId) {
            const defaultId = options?.theme?.defaultModuleId;
            const targetMod = defaultId ? discoveredModules.find((m: DiscoveredModule) => m.id === defaultId) : null;

            navigate(`/${targetMod ? targetMod.id : discoveredModules[0].id}`, true);
        }
    }, [discoveredModules, activeModuleId, navigate, options?.theme?.defaultModuleId]);

    // Fechar menu mobile ao trocar de módulo
    useEffect(() => {
        updateState({ isMobileNavOpen: false });
    }, [activeModuleId, updateState]);

    const activeModule = useMemo(() => discoveredModules.find((m: DiscoveredModule) => m.id === activeModuleId), [discoveredModules, activeModuleId]);
    
    const groupedModules = useMemo(() => {
        return discoveredModules.reduce((acc: Record<string, DiscoveredModule[]>, mod: DiscoveredModule) => {
            const cat = mod.category || 'System Modules';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(mod);
            return acc;
        }, {} as Record<string, DiscoveredModule[]>);
    }, [discoveredModules]);

    return {
        design,
        discoveredModules,
        isDiscovering,
        activeModuleId,
        setActiveModuleId,
        activeModule,
        groupedModules,
        isSearchOpen: uiState.isSearchOpen,
        setIsSearchOpen: (v: boolean) => updateState({ isSearchOpen: v }),
        isNavVisible: uiState.isNavVisible,
        setIsNavVisible: (v: boolean) => updateState({ isNavVisible: v }),
        isMobileNavOpen: uiState.isMobileNavOpen,
        setIsMobileNavOpen: (v: boolean) => updateState({ isMobileNavOpen: v }),
        toggleNav,
        startResizingSidebar,
        startResizingTopbar,
        startResizing: startResizingSidebar // Alias para compatibilidade v10.2
    };
};
