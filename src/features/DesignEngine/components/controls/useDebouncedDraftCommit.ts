import { useEffect, useRef, useState } from 'react';

// 150ms: rápido o bastante para parecer instantâneo entre a última interação e o
// commit; devagar o bastante para colapsar dezenas de eventos de arrasto/tecla num
// único `updateDraft` (plan-36 — a faixa sugerida era 100–150ms).
const DRAFT_COMMIT_DEBOUNCE_MS = 150;

/**
 * Estado local IMEDIATO (o controle nunca trava, cada pixel/tecla reflete na hora) +
 * propagação para `onCommit` (`updateDraft`) DEBOUNCED — plan-36: arrastar um slider ou
 * digitar num campo do painel não recomputa mais o dicionário inteiro de tokens a cada
 * evento, só ao final de uma pausa de digitação/arrasto.
 *
 * `value` de fora (reset, troca de token selecionado) sempre vence — sincronizado via
 * `useEffect`, o mesmo padrão de `ColorControl.tsx`.
 */
export function useDebouncedDraftCommit<T>(value: T, onCommit: (value: T) => void) {
    const [localValue, setLocalValue] = useState(value);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pendingValueRef = useRef<T | null>(null);
    const onCommitRef = useRef(onCommit);
    onCommitRef.current = onCommit;

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    // Ao desmontar (trocar de pilar, fechar o painel) DENTRO da janela de debounce, o
    // commit pendente não pode ser DESCARTADO — `onCommit` é `updateDraft`, que mora em
    // `useDesignDraft` (ThemeCustomizationTab) e sobrevive ao desmonte deste controle; um
    // `setState` tardio pós-desmonte é no-op no React 18, então não há rede de segurança
    // depois. Esvazia em vez de descartar: só dispara se havia algo pendente — desmontar
    // sem edição pendente não chama nada.
    useEffect(() => () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            onCommitRef.current(pendingValueRef.current as T);
        }
    }, []);

    const commit = (next: T) => {
        setLocalValue(next);
        pendingValueRef.current = next;
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            timerRef.current = null;
            onCommitRef.current(next);
        }, DRAFT_COMMIT_DEBOUNCE_MS);
    };

    return [localValue, commit] as const;
}
