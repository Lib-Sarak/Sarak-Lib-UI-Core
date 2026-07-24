import { useEffect, useRef } from 'react';
import { validateDesign } from '../utils/validation';
import { SarakDesignState, SetDesign } from '../types';

/**
 * useDesignStorageSync (Spec pré-Teste Real, lacuna 1 — sincronização cross-tab)
 *
 * Cada app/aba do modelo #3 (`packages/ui-kit`) monta seu PRÓPRIO
 * `SarakUIProvider`. Sem isto, trocar o tema num app não atinge os outros já
 * abertos — quebra a promessa "a central atinge todas as telas" fora da árvore
 * React de um único Provider. Escuta o evento `storage` (nativo do browser,
 * dispara em OUTRAS janelas/abas da mesma origem quando `localStorage` muda —
 * nunca na aba que fez a escrita) e reaplica o design quando a MESMA chave de
 * persistência do Provider muda em outro lugar.
 *
 * Segurança (herdada da Spec 44): o valor de `event.newValue` NUNCA é confiável
 * — passa por `JSON.parse` protegido + `validateDesign` (mesmo schema-check
 * contra `MASTER_DESIGN_MAP`/`PAYLOAD_EXTRA_KEYS`) antes de tocar o estado.
 * Chave/valor fora do contrato é descartado chave a chave (`console.warn`),
 * nunca injetado — mesmo comportamento de `validateDesign` em qualquer outra
 * fonte (localStorage no boot, `customThemes`, JSON exportado).
 *
 * Anti-loop: `lastKnownSerializedRef` acompanha o design SERIALIZADO atual
 * (atualizado sempre que `design` muda, não só quando este hook aplica um
 * evento). Um evento de `storage` cujo `newValue` já é o estado corrente é
 * no-op — cobre tanto reentrância de eventos duplicados quanto qualquer
 * ambiente (ex.: harness de teste) que dispare `storage` na própria janela.
 */
export const useDesignStorageSync = (
    isHydrated: boolean,
    storageKey: string,
    enabled: boolean,
    design: SarakDesignState,
    setDesign: SetDesign,
): void => {
    const lastKnownSerializedRef = useRef<string | null>(null);

    useEffect(() => {
        try {
            lastKnownSerializedRef.current = JSON.stringify(design);
        } catch {
            // design sempre serializável na prática (vem de validateDesign); defensivo.
        }
    }, [design]);

    useEffect(() => {
        if (!enabled || !isHydrated) return;
        if (typeof window === 'undefined') return;

        const handleStorage = (event: StorageEvent): void => {
            if (event.key !== storageKey) return;
            if (event.newValue == null) return;
            if (event.newValue === lastKnownSerializedRef.current) return;

            let parsed: unknown;
            try {
                parsed = JSON.parse(event.newValue);
            } catch {
                console.warn('[Sarak:Design] Tema recebido de outra aba/app é JSON inválido — descartado.');
                return;
            }

            if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
                console.warn('[Sarak:Design] Tema recebido de outra aba/app tem formato inválido — descartado.');
                return;
            }

            const validated = validateDesign(parsed);
            lastKnownSerializedRef.current = event.newValue;
            setDesign((prev) => ({ ...prev, ...validated }));
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [enabled, isHydrated, storageKey, setDesign]);
};
