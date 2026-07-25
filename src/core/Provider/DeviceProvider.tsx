import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { BREAKPOINT_TABLET, BREAKPOINT_DESKTOP } from '../Design/breakpoints';

export type DeviceType = 'smartphone' | 'tablet' | 'desktop';

/** Traduz uma largura de viewport (px) no dispositivo correspondente (mobile-first). */
export const deviceForWidth = (width: number): DeviceType => {
    if (width < BREAKPOINT_TABLET) return 'smartphone';
    if (width < BREAKPOINT_DESKTOP) return 'tablet';
    return 'desktop';
};

/** Largura atual da janela (default desktop no SSR / ambiente sem `window`). */
const currentWidth = (): number => (typeof window === 'undefined' ? BREAKPOINT_DESKTOP : window.innerWidth);

/**
 * Override do dispositivo (Gêmeo Digital / testes). `undefined` = usar a **detecção real**
 * do viewport. Este contexto carrega SÓ o override — NÃO o dispositivo detectado.
 *
 * Por quê (causa-raiz do L1 reprovado na 40.3, Rodada de correção): a versão anterior
 * centralizava o ESTADO detectado num contexto e todo consumidor lia esse valor. Isso tem
 * dois problemas em runtime real: (1) o estado inicial era `'desktop'` e só era corrigido
 * por um efeito pós-montagem — o cromo pintava desktop/topbar por um frame antes de virar
 * hambúrguer (flash); (2) se o build fragmentasse o módulo do contexto entre chunks, o
 * Provider e o consumidor podiam ler identidades diferentes e o consumidor ficava preso no
 * default `'desktop'`. A detecção agora é **self-contained no hook** (cada consumidor lê o
 * viewport direto), então vale mesmo que o contexto não atravesse fronteiras de bundle; o
 * contexto só transporta o override (usado em subárvores single-graph: preview e testes).
 */
const DeviceOverrideContext = createContext<DeviceType | undefined>(undefined);

/**
 * Dispositivo ATIVO. Detecção REAL do viewport por padrão (estado inicial já vem da largura
 * atual — sem flash de `'desktop'`), reavaliada a cada `resize`. Um `overrideDevice` num
 * `DeviceProvider` ancestral (Gêmeo Digital/testes) sequestra o valor e desliga a escuta.
 */
export const useSarakDevice = (): DeviceType => {
    const override = useContext(DeviceOverrideContext);
    const [detected, setDetected] = useState<DeviceType>(() => deviceForWidth(currentWidth()));

    useEffect(() => {
        if (override) return undefined; // override fixa o dispositivo — não escuta o viewport
        const sync = () => setDetected(deviceForWidth(window.innerWidth));
        window.addEventListener('resize', sync);
        sync(); // corrige na montagem (cobre remontagem / mudança de largura antes do 1º resize)
        return () => window.removeEventListener('resize', sync);
    }, [override]);

    return override ?? detected;
};

interface DeviceProviderProps {
    children: ReactNode;
    /** Se fornecido, sequestra o dispositivo (Gêmeo Digital / testes) e desliga a detecção real. */
    overrideDevice?: DeviceType;
}

/**
 * Provider do override de dispositivo. Sem `overrideDevice`, é um passthrough transparente:
 * a detecção real (no hook) governa. Mantido na API por compatibilidade e para o Gêmeo Digital
 * forçar um dispositivo no preview.
 */
export const DeviceProvider: React.FC<DeviceProviderProps> = ({ children, overrideDevice }) => (
    <DeviceOverrideContext.Provider value={overrideDevice}>
        {children}
    </DeviceOverrideContext.Provider>
);
