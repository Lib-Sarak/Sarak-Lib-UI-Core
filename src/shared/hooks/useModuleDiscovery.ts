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
    const { discoveryEndpoints } = useSarakUI();
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
            const scanPromises = currentEndpoints.map(async (baseUrl: string) => {
                try {
                    const response = await api.get<ModuleManifest>(`${baseUrl}/module/manifest`, {
                        timeout: 3000 // Timeout reduzido para maior agilidade no boot
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

            // 2. Busca de Módulos de Sistema (Sovereign Seeds)
            try {
                const systemRes = await api.get<DiscoveredModule[]>('/ui/modules');
                if (systemRes.data && Array.isArray(systemRes.data)) {
                    systemRes.data.forEach(sysMod => {
                        // Evita duplicatas de sistema se já descobertas por manifesto
                        if (!results.find(r => r.id === sysMod.id)) {
                            const localComp = getLocalComponent(sysMod.id);
                            results.push({
                                ...sysMod,
                                status: 'online',
                                baseUrl: 'core',
                                endpoints: {},
                                component: localComp,
                                version: '1.0.0-core'
                            });
                        }
                    });
                }
            } catch (err) {
                console.warn("[Sarak:Discovery] Sistema de módulos offline (Aguardando boot do backend)");
            }

            // 3. Hidratação com Componentes Locais Registrados
            const localModules = getRegisteredModules();
            localModules.forEach(mod => {
                const existing = results.find(m => m.id === mod.id);
                if (existing) {
                    existing.component = mod.component;
                } else {
                    results.push({
                        id: mod.id,
                        label: mod.label,
                        icon: mod.icon || 'Box',
                        category: mod.category || 'Sistema',
                        version: '1.0.0-local',
                        priority: mod.priority || 0,
                        status: 'online',
                        baseUrl: 'local',
                        endpoints: {},
                        component: mod.component
                    });
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

