import { useState, useEffect, useCallback } from 'react';
import { getRegisteredModules, getLocalComponent } from '../registry';
import api from '../services/api';
import { DiscoveredModule, ModuleManifest } from '../../constants/discovery';
import { useSarakUI } from '../../components/SarakUIProvider';
import { DynamicRenderer } from '../../components/DynamicRenderer';
import React from 'react';


/**
 * Hook de Descoberta Atômica (v5.5)
 * 
 * Escaneia os microserviços em busca de manifestos e gerencia o estado de disponibilidade.
 */
export const useModuleDiscovery = (isEnabled: boolean = true) => {
    const { discoveryEndpoints } = useSarakUI();
    const [modules, setModules] = useState<DiscoveredModule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastScan, setLastScan] = useState<Date | null>(null);

    const scanModules = useCallback(async () => {
        if (!isEnabled) {
            setModules([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const results: DiscoveredModule[] = [];

        // Escaneamento Paralelo (v5.5)
        const scanPromises = (discoveryEndpoints || []).map(async (baseUrl: string) => {
            try {
                // Tenta buscar o manifesto protegido
                const response = await api.get<ModuleManifest>(`${baseUrl}/module/manifest`, {
                    timeout: 4000 
                });
                
                if (response.status === 200 && response.data.id) {
                    results.push({
                        ...response.data,
                        status: 'online',
                        baseUrl
                    });
                }
            } catch (err: any) {
                // Sarak Matrix V18.2: Módulos offline não somem, ficam 'grisados'
                const suspectedId = baseUrl.split('/').pop() || 'unknown';
                
                results.push({
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
                });
            }
        });

        await Promise.all(scanPromises);

        // 2. Busca de Módulos de Sistema (v6.5 Elite - Orientado a Seeds)
        try {
            const systemRes = await api.get<DiscoveredModule[]>('/ui/modules');
            if (systemRes.data && Array.isArray(systemRes.data)) {
                systemRes.data.forEach(sysMod => {
                    const localComp = getLocalComponent(sysMod.id);
                    results.push({
                        ...sysMod,
                        status: 'online',
                        baseUrl: 'core',
                        endpoints: {},
                        component: localComp,
                        version: '1.0.0-core'
                    });
                });
            }
        } catch (err) {
            console.error("[Sarak:Discovery] Erro ao carregar módulos de sistema:", err);
        }

        const localModules = getRegisteredModules();
        localModules.forEach(mod => {
            // Compatibilidade Legada para módulos registrados via registerSarakModule completo
            if (!results.find(m => m.id === mod.id)) {
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
            } else {
                // Se já foi descoberto, apenas injeta o componente local (Hydration)
                const existing = results.find(m => m.id === mod.id);
                if (existing) existing.component = mod.component;
            }
        });


        const sorted = results.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        setModules(sorted);
        setIsLoading(false);
        setLastScan(new Date());
    }, [isEnabled, discoveryEndpoints]);

    useEffect(() => {
        scanModules();
        if (isEnabled) {
            const timer = setInterval(scanModules, 60000);
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
