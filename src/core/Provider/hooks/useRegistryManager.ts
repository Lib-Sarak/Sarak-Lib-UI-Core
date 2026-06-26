import { useState, useEffect } from 'react';
import {
    getRegisteredModules,
    subscribeToRegistry,
    registerLocalComponent,
    registerSarakModule,
    type SarakModule
} from '../../Discovery/registry';
import { SarakUIOptions } from '../types';

/**
 * useRegistryManager (v10.1)
 * 
 * Gerencia a descoberta de módulos, registro de componentes locais 
 * e sincronização com o registro global da Sarak.
 */
export const useRegistryManager = (options: SarakUIOptions) => {
    const [registeredModules, setRegisteredModules] = useState<SarakModule[]>(() => getRegisteredModules());
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {

        // 1. O componente local 'mx-customization' já é registrado na raiz (index.ts) para evitar
        // dependência circular (Core -> Features). O registry vai resolver a referência pelo ID.

        // 2. Registrar módulos do manifesto (se houver)
        const manifestModules = options?.manifest?.modules;
        if (Array.isArray(manifestModules)) {
            manifestModules.forEach((mod) => {
                registerSarakModule(mod as SarakModule);
            });
        }

        // 3. Garantir que o módulo de personalização existe no registro com prioridade máxima
        registerSarakModule({
            id: 'mx-customization',
            label: 'Design Engine',
            icon: 'Palette',
            category: 'Personalização',
            priority: 9999
            // O componente será resolvido através de registerLocalComponent('mx-customization') no entrypoint
        });

        const updateModules = () => {
            const current = getRegisteredModules();
            setRegisteredModules([...current]);
        };

        updateModules();
        setIsHydrated(true);

        const unsubscribe = subscribeToRegistry(updateModules);
        return () => {
            unsubscribe();
        };
    }, [options?.manifest]);

    return {
        registeredModules,
        isHydrated,
        setIsHydrated
    };
};
