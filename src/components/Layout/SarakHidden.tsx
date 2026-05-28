import React, { ReactNode } from 'react';
import { useSarakDevice, DeviceType } from '../../core/Provider/DeviceProvider';

interface SarakHiddenProps {
    children: ReactNode;
    /** Esconder quando o dispositivo ativo estiver nesta lista */
    on: DeviceType | DeviceType[];
}

/**
 * SarakHidden
 * 
 * Componente utilitário que não renderiza o conteúdo dependendo do dispositivo.
 * Isso evita poluição do DOM e uso de RAM em dispositivos que não exibirão o componente.
 */
export const SarakHidden: React.FC<SarakHiddenProps> = ({ children, on }) => {
    const device = useSarakDevice();
    const hideOn = Array.isArray(on) ? on : [on];

    if (hideOn.includes(device)) {
        return null;
    }

    return <>{children}</>;
};
