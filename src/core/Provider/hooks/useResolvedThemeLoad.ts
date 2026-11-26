import { useEffect } from 'react';
import { getLoadedThemePreset, isSarakThemePresetId, sarakLoadThemePreset } from '../../Design/presets/themes/registry';

/**
 * Mantém em memória o tema embarcado que está no ar. O id que chega pelo `onLoad` ou pelo cache não passa pela porta de espera
 * do Provider (essa só olha o que o código pede), e sem o tema em memória a lib não tem contra o que extrair as escolhas: grava
 * o design inteiro. Carregado o tema, a coleção de temas muda e o design gravado pendente é refeito.
 */
export const useResolvedThemeLoad = (resolvedThemeId: string | undefined): void => {
    useEffect(() => {
        if (!resolvedThemeId || !isSarakThemePresetId(resolvedThemeId) || getLoadedThemePreset(resolvedThemeId)) return;
        sarakLoadThemePreset(resolvedThemeId).catch((error: unknown) => {
            console.error(`[SarakUIProvider] falha ao carregar o tema "${resolvedThemeId}":`, error);
        });
    }, [resolvedThemeId]);
};
