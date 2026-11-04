import React from 'react';

export interface SarakGateProps {
    /** Resultado da regra, calculado pelo host (papel, permissão, flag). `true` mostra os filhos. */
    allowed: boolean;
    /** Mostrado no lugar dos filhos quando `allowed` é `false`; omitido, nada aparece. */
    fallback?: React.ReactNode;
    children?: React.ReactNode;
}

/**
 * Mostra os filhos só quando o host diz que pode. A regra é do consumidor: a lib não conhece papel nem permissão,
 * e este componente esconde a interface — quem protege o dado é o servidor.
 */
export const SarakGate = ({ allowed, fallback = null, children }: SarakGateProps): React.ReactElement => (
    <>{allowed ? children : fallback}</>
);
