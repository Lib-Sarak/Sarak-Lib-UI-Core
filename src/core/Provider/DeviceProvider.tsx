import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { BREAKPOINT_TABLET, BREAKPOINT_DESKTOP } from '../Design/breakpoints';

export type DeviceType = 'smartphone' | 'tablet' | 'desktop';

const DeviceContext = createContext<DeviceType>('desktop');

export const useSarakDevice = (): DeviceType => {
    return useContext(DeviceContext);
};

interface DeviceProviderProps {
    children: ReactNode;
    /** Se fornecido, sequestra o valor (usado pelo Gêmeo Digital) */
    overrideDevice?: DeviceType;
}

export const DeviceProvider: React.FC<DeviceProviderProps> = ({ children, overrideDevice }) => {
    const [device, setDevice] = useState<DeviceType>('desktop');

    useEffect(() => {
        // Se houver override, não precisamos escutar a janela.
        if (overrideDevice) return;

        const handleResize = () => {
            const width = window.innerWidth;
            if (width < BREAKPOINT_TABLET) {
                setDevice('smartphone');
                return;
            }
            if (width < BREAKPOINT_DESKTOP) {
                setDevice('tablet');
                return;
            }
            setDevice('desktop');
        };

        // Escuta ativamente
        window.addEventListener('resize', handleResize);
        handleResize(); // Executa na montagem

        return () => window.removeEventListener('resize', handleResize);
    }, [overrideDevice]);

    // O override ganha prioridade máxima se existir (Gêmeo Digital)
    const activeDevice = overrideDevice || device;

    return (
        <DeviceContext.Provider value={activeDevice}>
            {children}
        </DeviceContext.Provider>
    );
};
