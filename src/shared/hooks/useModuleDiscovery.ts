import { useMemo } from 'react';
import { DiscoveredModule } from '../../core/Discovery/types';
import { useSarakUI } from '../../core/Provider/SarakUIProvider';
import { getRegisteredModules } from '../../core/Discovery/registry';


/**
 * Hook de Descoberta Passiva (v9.0 Industrial)
 * 
 * Este hook não realiza mais escaneamento proativo (Active Polling).
 * Ele apenas consome e formata os módulos que foram injetados ou registrados 
 * localmente no SarakUIProvider.
 */
export const useModuleDiscovery = (isEnabled: boolean = true) => {
    const { registeredModules, isHydrated, design } = useSarakUI();
    
    const formattedModules = useMemo(() => {
        if (!isHydrated) return [];

        // Soberania Total: Prioriza o Registry global para evitar race conditions
        const all = getRegisteredModules();
        const displayModules = (all.length > 0 ? all : registeredModules) as Partial<DiscoveredModule>[];

        // O filtro de Blacklist agora deve vir do estado do Design (SystemSchema)
        // Por padrão, filtramos apenas se o modo for 'standard'
        const isStandardMode = design?.moduleBlacklist !== 'none';
        const DEMO_BLACKLIST = isStandardMode ? ['grid-system', 'blueprint-test', 'demo-ui', 'debug-module'] : [];

        return displayModules
            .filter((mod) => mod.id && !DEMO_BLACKLIST.includes(mod.id))
            .sort((a, b) => (b.priority || 0) - (a.priority || 0))
            .map((mod) => ({
                id: mod.id!,
                label: mod.label || mod.id,
                icon: mod.icon || 'Box',
                category: mod.category || 'Sistema',
                version: mod.version || '1.0.0-local',
                priority: mod.priority || 500,
                status: 'online' as const,
                baseUrl: mod.baseUrl || (mod.endpoints?.base ? mod.endpoints.base.replace('/api', '') : ''),
                endpoints: mod.endpoints || {},
                component: mod.component,
                visualContracts: mod.visualContracts || []
            } as DiscoveredModule));
    }, [registeredModules, isHydrated, design?.moduleBlacklist]);

    return {
        modules: formattedModules,
        isLoading: !isHydrated,
        lastScan: new Date(),
        refresh: () => { /* Passive Discovery: refresh handled by registry listeners */ }
    };
};


