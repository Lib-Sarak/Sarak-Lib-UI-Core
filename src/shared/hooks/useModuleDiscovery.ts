import { useMemo } from 'react';
import { DiscoveredModule } from '../../constants/discovery';
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
    const { registeredModules, isHydrated, token } = useSarakUI();
    
    const formattedModules = useMemo(() => {
        if (!isHydrated) return [];

        // Soberania Total: Se o Registry global tem módulos, usamos eles diretamente 
        // para contornar atrasos de estado no Provider.
        const all = getRegisteredModules().length > 0 ? getRegisteredModules() : registeredModules;
        
        console.log(`[useModuleDiscovery] Sovereign Scan: ${all.length} modules found in Registry.`);

        return all
            .sort((a, b) => (b.priority || 0) - (a.priority || 0))
            .map(mod => {
                // Mapeamento de Labels Amigáveis para módulos conhecidos
                let label = mod.label;
                let icon = mod.icon || 'Box';
                let category = mod.category || 'Sistema';

                if (mod.id === 'translator-google') { label = 'Tradutor'; icon = 'Languages'; category = 'Utilidades'; }
                if (mod.id === 'llm-test-chat' || mod.id === 'chat') { label = 'Chat IA'; icon = 'MessageSquare'; category = 'IA'; }
                if (mod.id === 'usage') { label = 'Uso & Métricas'; icon = 'Activity'; category = 'Sistema'; }

                return {
                    id: mod.id,
                    label,
                    icon,
                    category,
                    version: mod.version || '1.0.0-local',
                    priority: mod.priority || 500,
                    status: 'online' as const,
                    baseUrl: mod.baseUrl || 'local',
                    endpoints: mod.endpoints || {},
                    component: mod.component
                } as DiscoveredModule;
            });
    }, [registeredModules, isHydrated]);

    return {
        modules: formattedModules,
        isLoading: !isHydrated,
        lastScan: new Date(), // Simulado para compatibilidade
        refresh: () => {
            console.log("[useModuleDiscovery] Manual refresh ignored in Passive Mode.");
        }
    };
};


