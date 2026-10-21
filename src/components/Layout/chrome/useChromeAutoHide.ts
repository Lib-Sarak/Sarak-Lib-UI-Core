import { useState } from 'react';

export interface ChromeAutoHideState {
    /** Falso só quando `isAutoHideEnabled` está ativo E o ponteiro não está sobre a nav/sensor. */
    isVisible: boolean;
    /** Props do sensor (faixa fina na borda) — só é montado quando `!isVisible`. */
    sensorProps: { onMouseEnter: () => void };
    /** Props da própria superfície (aside/header) — reesconde ao sair do hover. */
    surfaceProps: { onMouseEnter: () => void; onMouseLeave: () => void };
}

/**
 * Controla a visibilidade da navegação do cromo enquanto o ponteiro entra e sai
 * da superfície ou da faixa que a revela.
 */
export const useChromeAutoHide = (enabled: boolean): ChromeAutoHideState => {
    const [hovered, setHovered] = useState(false);
    const isVisible = !enabled || hovered;
    return {
        isVisible,
        sensorProps: { onMouseEnter: () => setHovered(true) },
        surfaceProps: {
            onMouseEnter: () => setHovered(true),
            onMouseLeave: () => enabled && setHovered(false),
        },
    };
};
