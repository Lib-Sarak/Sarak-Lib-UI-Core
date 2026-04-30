import { useState, useEffect, useCallback, useRef } from 'react';
import { getRegisteredModules, getLocalComponent } from '../../core/Discovery/registry';
import api from '../services/api';
import { DiscoveredModule, ModuleManifest } from '../../constants/discovery';
import { useSarakUI } from '../../core/Provider/SarakUIProvider';
import { getAxiosErrorMessage } from '../utils/error-handler';

/**
 * Hook de Descoberta Atômica (v6.8 Quantum)
 * 
 * Escaneia os microserviços em busca de manifestos e gerencia o estado de disponibilidade.
 * Implementa trava anti-loop (Scanning Lock) e estabilização de dependências.
 */
export const useModuleDiscovery = (isEnabled: boolean = true) => {
    const { discoveryEndpoints, options } = useSarakUI();
    const [modules, setModules] = useState<DiscoveredModule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastScan, setLastScan] = useState<Date | null>(null);
    
    // Trava de Segurança (v6.8)
    const isScanning = useRef(false);
    const endpointsStr = JSON.stringify(discoveryEndpoints);

    console.log("[useModuleDiscovery] Render - isEnabled:", isEnabled, "Endpoints:", endpointsStr);

    const scanModules = useCallback(async () => {
        console.log("[useModuleDiscovery] scanModules triggered - isScanning:", isScanning.current, "isEnabled:", isEnabled);
        // Bloqueio de múltiplas chamadas simultâneas
        if (isScanning.current || !isEnabled) {
            if (!isEnabled) {
                setModules([]);
                setIsLoading(false);
            }
            return;
        }

        try {
            isScanning.current = true;
            setIsLoading(true);
            const results: DiscoveredModule[] = [];

            // 1. Escaneamento Paralelo de Microserviços
            const currentEndpoints = discoveryEndpoints || [];
            const manifestSuffix = options?.endpoints?.discoveryPath || '/module/manifest';
            
            const scanPromises = currentEndpoints.map(async (baseUrl: string) => {
                try {
                    const manifestUrl = baseUrl.startsWith('http') 
                        ? `${baseUrl}${manifestSuffix}`
                        : `${baseUrl}${manifestSuffix}`; // api.get might already have a baseURL if using relative paths
                    
                    const response = await api.get<ModuleManifest>(manifestUrl, {
                        timeout: 3000
                    });
                    
                    if (response.status === 200 && response.data.id) {
                        return {
                            ...response.data,
                            status: 'online',
                            baseUrl
                        } as DiscoveredModule;
                    }
                } catch (err: any) {
                    const suspectedId = baseUrl.split('/').pop() || 'unknown';
                    return {
                        id: suspectedId,
                        label: suspectedId.charAt(0).toUpperCase() + suspectedId.slice(1),
                        icon: 'AlertCircle', 
                        category: 'Offline',
                        version: '0.0.0',
                        priority: 0,
                        status: 'offline',
                        baseUrl,
                        endpoints: {},
                        error: err.message
                    } as DiscoveredModule;
                }
                return null;
            });

            const discoveredResults = await Promise.all(scanPromises);
            discoveredResults.forEach(r => { if (r) results.push(r); });

            // 3. Hidratação com Componentes Locais Registrados (Sovereign v9.0)
            const localModules = getRegisteredModules();
            console.log("[useModuleDiscovery] localModules found:", localModules.length);
            
            localModules.forEach(mod => {
                const existingIndex = results.findIndex(m => m.id === mod.id);
                const component = mod.component || getLocalComponent(mod.id);
                
                const localData = {
                    id: mod.id,
                    label: mod.label,
                    icon: mod.icon || 'Box',
                    category: mod.category || 'Sistema',
                    version: '1.0.0-local',
                    priority: mod.priority || 500,
                    status: 'online' as const,
                    baseUrl: 'local',
                    endpoints: {},
                    component: component
                };

                if (existingIndex >= 0) {
                    results[existingIndex] = { ...results[existingIndex], ...localData };
                } else {
                    results.push(localData);
                }
            });

            const sorted = results.sort((a, b) => (b.priority || 0) - (a.priority || 0));
            setModules(sorted);
            setLastScan(new Date());
        } finally {
            setIsLoading(false);
            isScanning.current = false;
        }
    }, [isEnabled, endpointsStr]); // Dependência estabilizada via stringify

    useEffect(() => {
        scanModules();
        if (isEnabled) {
            const timer = setInterval(scanModules, 60000); // 1 minuto de intervalo
            return () => clearInterval(timer);
        }
    }, [scanModules, isEnabled]);

    return {
        modules,
        isLoading,
        lastScan,
        refresh: scanModules
    };
};

