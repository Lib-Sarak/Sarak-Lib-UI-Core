import { useEffect, useState } from 'react';
import { isThemeSwitch } from '../../Provider/utils/themeSwitchMark';

interface SwitchState {
    /** As variáveis do último render, para comparar com as do próximo. */
    seen: Record<string, string>;
    /** Quantas trocas já houve; `settled` é até qual delas a pintura já passou. */
    serial: number;
    settled: number;
}

/**
 * `true` no commit em que as variáveis do escopo mudam em bloco (troca de tema ou de modo) e por dois quadros
 * depois, para a regra de `_motion.css` desligar a transição na pintura da troca. O estado é derivado no próprio
 * render: o atributo entra no MESMO commit que as variáveis novas, e o primeiro recálculo já o vê. Um ajuste de um
 * token só não chega ao corte.
 */
export const useThemeSwitchFlag = (variables: Record<string, string>): boolean => {
    const [state, setState] = useState<SwitchState>({ seen: variables, serial: 0, settled: 0 });

    if (state.seen !== variables) {
        setState({ ...state, seen: variables, serial: isThemeSwitch(state.seen, variables) ? state.serial + 1 : state.serial });
    }

    const { serial } = state;
    useEffect(() => {
        if (serial === 0 || typeof window.requestAnimationFrame !== 'function') return undefined;
        let secondFrame = 0;
        const firstFrame = window.requestAnimationFrame(() => {
            secondFrame = window.requestAnimationFrame(() => setState((current) => ({ ...current, settled: serial })));
        });
        return () => {
            window.cancelAnimationFrame(firstFrame);
            window.cancelAnimationFrame(secondFrame);
        };
    }, [serial]);

    return serial !== state.settled && typeof window.requestAnimationFrame === 'function';
};
