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
 * Comportamento de `isAutoHideEnabled` para o cromo do modo ui-kit.
 *
 * Comportamento de REFERÊNCIA que de fato funciona no Shell é o do `DockNav`
 * (`DockNav.tsx:26` + o sensor de `SarakShell.tsx:92-107`): a nav só existe no ar
 * quando visível, e uma faixa sensível na borda a revela de volta — reimplementado
 * aqui porque `src/core/Shell/` não é tocado por esta plan (§3.2). A wiring
 * equivalente do `SidebarNav` (`SidebarNav.tsx:62-69`) chama `setIsNavVisible`, mas
 * nada em `SarakShell` esconde a `SidebarNav` a partir desse estado — achado fora
 * do escopo, registrado no resumo da execução.
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
