import { useState, useEffect } from 'react';
import { 
    getRegisteredModules, 
    subscribeToRegistry, 
    registerLocalComponent, 
    registerSarakModule 
} from '../../Discovery/registry';
import { ThemeCustomizationTab } from '../../../features/DesignEngine/Main/ThemeCustomizationTab';

/**
 * useRegistryManager (v10.1)
 * 
 * Gerencia a descoberta de módulos, registro de componentes locais 
 * e sincronização com o registro global da Sarak.
 */
export const useRegistryManager = (options: any) => {
    const [registeredModules, setRegisteredModules] = useState<any[]>(() => getRegisteredModules());
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        console.log("[Sarak:Registry] Initing Discovery. Manifest present:", !!options?.manifest);

        // 1. Garantir que o componente de personalização está registrado globalmente
        registerLocalComponent('mx-customization', ThemeCustomizationTab);

        // 2. Registrar módulos do manifesto (se houver)
        if (options?.manifest?.modules) {
            options.manifest.modules.forEach((mod: any) => {
                registerSarakModule(mod);
            });
        }

        // 3. Garantir que o módulo de personalização existe no registro com prioridade máxima
        registerSarakModule({
            id: 'mx-customization',
            label: 'Design Engine',
            icon: 'Palette',
            category: 'Personalização',
            priority: 9999,
            component: ThemeCustomizationTab
        });

        const updateModules = () => {
            const current = getRegisteredModules();
            setRegisteredModules([...current]);
        };

        updateModules();
        setIsHydrated(true);

        const unsubscribe = subscribeToRegistry(updateModules);
        return () => unsubscribe();
    }, [options?.manifest]);

    return {
        registeredModules,
        isHydrated,
        setIsHydrated
    };
};
