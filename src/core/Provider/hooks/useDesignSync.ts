import { useEffect, useRef, MutableRefObject } from 'react';
import { validateDesign } from '../utils/validation';
import { resolveThemeForMode } from '../../Design/presets/themes/color-engine';
import { composeThemeDesign } from '../../Design/presets/themes/compose';
import { SARAK_DEFAULT_THEME_ID } from '../../Design/presets/themes';
import { getLoadedThemePreset, isSarakThemePresetId } from '../../Design/presets/themes/registry';
import type { SarakTokenValue } from '../../Design/types';
import { SarakThemeEntry, SarakThemePayload, SetDesign } from '../types';

export const useDesignSync = (
    isHydrated: boolean,
    activeThemeId: string | undefined,
    allThemes: SarakThemeEntry[] | undefined,
    storageKey: string,
    hasHydratedRef: MutableRefObject<boolean>,
    setDesign: SetDesign,
    // O `config` do host por REF: estável entre renders, nunca dependência do efeito (spec 02 §3.1).
    configRef?: MutableRefObject<SarakThemePayload | undefined>,
    preferConfigOverCache = false,
) => {
    // Guarda o último `activeThemeId` efetivamente aplicado. Sem isso, qualquer
    // render que produza uma nova referência de `allThemes` (ex.: consumidor que
    // passa `customThemes={[...]}` inline, ou o default antigo `= []` do Provider)
    // reexecutaria este efeito e chamaria `setDesign` incondicionalmente — como
    // `setDesign` sempre recebe um objeto NOVO (spread), o React nunca faz bailout
    // por igualdade referencial, e o resultado é um loop de render infinito real
    // (reproduzido com CPU ~100%, achado na Spec 43 §5.1). O guard aplica o tema
    // só quando o ID pedido de fato muda — não a cada render.
    const lastAppliedThemeIdRef = useRef<string | undefined>(undefined);
    const previousStorageKeyRef = useRef(storageKey);

    // RE-HYDRATION & ACTIVE THEME ID SYNC
    useEffect(() => {
        if (!isHydrated) return;

        if (previousStorageKeyRef.current !== storageKey) {
            previousStorageKeyRef.current = storageKey;
            lastAppliedThemeIdRef.current = undefined;
            hasHydratedRef.current = false;
        }

        // Se temos um tema ativo definido explicitamente, ele é a verdade absoluta
        if (activeThemeId && allThemes) {
            if (lastAppliedThemeIdRef.current === activeThemeId) return;

            const activeTheme = allThemes.find(t => t.id === activeThemeId);
            if (activeTheme && activeTheme.design) {
                lastAppliedThemeIdRef.current = activeThemeId;
                // plan-26: o MODO do usuário tem que vencer — nunca o modo
                // nativo do tema sozinho. A troca NUNCA herda token do tema
                // anterior: `composeThemeDesign` parte do padrão do schema.
                setDesign((prev) => {
                    const requestedMode: 'light' | 'dark' = (prev.mode as 'light' | 'dark') || 'dark';
                    const resolved = resolveThemeForMode(
                        { design: activeTheme.design as Record<string, SarakTokenValue>, contraparte: activeTheme.contraparte },
                        requestedMode,
                    );
                    return validateDesign(composeThemeDesign(resolved, prev, configRef?.current));
                });
                return;
            }

            // Tema EMBARCADO que ainda não chegou à memória: o Provider já pediu a
            // carga; o efeito reroda quando `allThemes` ganha o tema. Enquanto isso o
            // tema atual continua na tela — nunca referência, nunca tela vazia.
            if (isSarakThemePresetId(activeThemeId)) return;

            // `activeThemeId` pedido não corresponde a NENHUM tema conhecido —
            // removido do catálogo, ou nunca existiu. Contrato de remoção
            // (R33): nunca lança, nunca deixa a tela sem tema — cai na
            // tema padrão no modo atual (a contraparte autorada), com um aviso.
            lastAppliedThemeIdRef.current = activeThemeId;
            console.warn(`[SarakUIProvider] activeThemeId "${activeThemeId}" não corresponde a nenhum tema conhecido — aplicando o tema padrão "${SARAK_DEFAULT_THEME_ID}" no modo atual.`);
            setDesign((prev) => {
                const requestedMode: 'light' | 'dark' = (prev.mode as 'light' | 'dark') || 'dark';
                const fallback = getLoadedThemePreset(SARAK_DEFAULT_THEME_ID);
                if (!fallback) return prev;
                const resolved = resolveThemeForMode(
                    { design: fallback.design as Record<string, SarakTokenValue>, contraparte: fallback.contraparte },
                    requestedMode,
                );
                return validateDesign(composeThemeDesign(resolved, prev, configRef?.current));
            });
            return;
        }

        // `activeThemeId` foi limpo — permite reaplicar se ele voltar a ser setado.
        lastAppliedThemeIdRef.current = undefined;

        if (preferConfigOverCache) {
            hasHydratedRef.current = true;
            return;
        }

        // Se não temos tema ativo, e ainda não hidratamos, tentamos ler do cache local
        if (!hasHydratedRef.current) {
            try {
                const saved = localStorage.getItem(storageKey);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    setDesign((prev) => validateDesign({ ...prev, ...parsed }));
                }
            } catch (error) {
                console.error('[Sarak:Design] localStorage re-hydration error:', error);
            }
            hasHydratedRef.current = true;
        }
    }, [isHydrated, storageKey, activeThemeId, allThemes, setDesign, hasHydratedRef, preferConfigOverCache]);
};
