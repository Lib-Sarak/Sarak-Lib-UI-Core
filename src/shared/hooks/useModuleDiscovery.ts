import { useState, useEffect, useCallback } from 'react';
import { getRegisteredModules } from '../registry';
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

        // Escaneamento Paralelo (v5.5 Performance Tier)
        const scanPromises = (discoveryEndpoints || []).map(async (baseUrl) => {
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

        // Adicionando Módulos Internos (Self-Manifest) via Sarak Atomic Registry
        const localModules = getRegisteredModules();
        localModules.forEach(mod => {
            // Se o módulo local ainda não foi descoberto via API (para evitar duplicatas)
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

        // 3. Fallback Dinâmico (v6.0): Módulos sem componente local usam o DynamicRenderer
        results.forEach(m => {
            if (!m.component && m.visualContracts && m.visualContracts.length > 0) {
                console.log(`[Sarak:Discovery] Atribuindo Renderizador Dinâmico ao módulo: ${m.id}`);
                // @ts-ignore - Injetando componente dinâmico
                m.component = () => React.createElement(DynamicRenderer, { contracts: m.visualContracts });
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
