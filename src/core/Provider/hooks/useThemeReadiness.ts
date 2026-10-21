import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { getLoadedThemePreset, getThemeCacheVersion, isSarakThemePresetId, sarakLoadThemePreset, subscribeThemeCache } from '../../Design/presets/themes/registry';
import { resolveStorageKey } from '../utils/resolveStorageKey';
import type { SarakUIOptions } from '../types';

/** `true` quando já há um `design` salvo para a chave de persistência — ele pinta sozinho, sem tema. */
const hasSavedDesign = (persistence: SarakUIOptions['persistence']): boolean => {
    if (typeof window === 'undefined') return false;
    try {
        return localStorage.getItem(resolveStorageKey(persistence)) !== null;
    } catch {
        return false;
    }
};

/**
 * A porta de espera do tema sob demanda. Responde: "o Provider já pode pintar a
 * aplicação?".
 *
 * Só espera quando o consumidor força, por código, um tema EMBARCADO que não está
 * em memória (`activeThemeId`/`initialTheme`/`options.theme.defaultTheme`) e não há
 * `design` salvo que pinte sozinho. Nenhum outro caminho espera: o tema padrão
 * está no boot, o tema salvo pinta do `design` guardado, o id inexistente é
 * decidido sem rede. Consumidor que quer zero espera chama `sarakPreloadThemes`
 * antes do render.
 *
 * A porta fecha UMA vez: depois do primeiro quadro, uma troca por código nunca
 * desmonta a aplicação — o tema atual fica na tela até o novo chegar
 * (`useDesignSync`). Falha de rede no `import()` libera a porta com erro no console.
 */
export const useThemeReadiness = (props: {
    requestedThemeId: string | undefined;
    controlled: boolean;
    persistence: SarakUIOptions['persistence'];
}): boolean => {
    const { requestedThemeId, controlled, persistence } = props;
    const [failedId, setFailedId] = useState<string | undefined>(undefined);
    const openedRef = useRef(false);
    // Reage à chegada do tema: relê o cache a cada versão.
    useSyncExternalStore(subscribeThemeCache, getThemeCacheVersion, getThemeCacheVersion);

    const needsLoad = Boolean(requestedThemeId)
        && isSarakThemePresetId(requestedThemeId as string)
        && !getLoadedThemePreset(requestedThemeId as string);

    useEffect(() => {
        if (!needsLoad || !requestedThemeId) return;
        sarakLoadThemePreset(requestedThemeId).catch((error: unknown) => {
            console.error(`[SarakUIProvider] falha ao carregar o tema "${requestedThemeId}":`, error);
            setFailedId(requestedThemeId);
        });
    }, [needsLoad, requestedThemeId]);

    if (openedRef.current) return true;
    const paintsFromSaved = !controlled && hasSavedDesign(persistence);
    const waiting = needsLoad && failedId !== requestedThemeId && !paintsFromSaved;
    if (!waiting) openedRef.current = true;
    return !waiting;
};
