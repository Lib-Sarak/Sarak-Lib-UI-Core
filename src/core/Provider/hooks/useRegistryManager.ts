import { useState, useEffect } from 'react';
import {
    sarakGetRegisteredModules,
    sarakSubscribeToRegistry,
    sarakRegisterLocalComponent,
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
    const [registeredModules, setRegisteredModules] = useState<SarakModule[]>(() => sarakGetRegisteredModules());
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        // Registrar módulos do manifesto (se houver). O módulo `mx-customization` NÃO é mais
        // registrado aqui: o `src/index.ts` registrava o componente por efeito colateral de
        // import, e os dois saíram juntos. Registrar o módulo sem o componente deixaria uma
        // entrada de menu que não renderiza nada — e o registry acusaria em `console.warn`.
        // Quem quiser o Design Engine no Shell registra o par (ver `docs/migracoes.md`).
        const manifestModules = options?.manifest?.modules;
        if (Array.isArray(manifestModules)) {
            manifestModules.forEach((mod) => {
                registerSarakModule(mod as SarakModule);
            });
        }

        const updateModules = () => {
            const current = sarakGetRegisteredModules();
            setRegisteredModules([...current]);
        };

        updateModules();
        setIsHydrated(true);

        const unsubscribe = sarakSubscribeToRegistry(updateModules);
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
