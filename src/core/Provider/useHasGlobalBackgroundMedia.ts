import { useContext } from 'react';
import { UIContext, DesignOverrideContext } from './SarakUIProvider';

/**
 * Fonte única de leitura de `globalBackgroundImageUrl`: lê o Design Engine SEM exigir o
 * Provider — o draft de override (`DesignOverrideContext`) tem prioridade sobre o design
 * persistido, e degrada a `false` fora do `SarakUIProvider`. Espelha a mesma condição que
 * `SarakShell` já usa (`design.globalBackgroundImageUrl ? ... : ...`), para que
 * `SarakAppChrome` também deixe de pintar fundo próprio quando há mídia global
 * (specs/specs/05-cromo-e-slots.md §3).
 */
export const useHasGlobalBackgroundMedia = (): boolean => {
    const context = useContext(UIContext);
    const override = useContext(DesignOverrideContext);
    const design = (override ?? context?.design) as { globalBackgroundImageUrl?: unknown } | null | undefined;
    return Boolean(design?.globalBackgroundImageUrl);
};
