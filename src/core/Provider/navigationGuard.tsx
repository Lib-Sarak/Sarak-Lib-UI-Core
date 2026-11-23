import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';

/** Pergunta se a navegação pode seguir: resolve `true` para sair, `false` para ficar. */
export type SarakNavigationGuard = () => Promise<boolean>;

interface NavigationGuardRegistry {
    /** Registra o guarda e devolve o desfazer. O mais recente vence. */
    register: (guard: SarakNavigationGuard) => () => void;
    /** Roda `go` na hora se nada guarda a saída; senão, só depois de o guarda responder `true`. */
    run: (go: () => void) => void;
}

const passThrough: NavigationGuardRegistry = {
    register: () => () => undefined,
    run: (go) => go(),
};

const NavigationGuardContext = createContext<NavigationGuardRegistry>(passThrough);

/**
 * Guarda de navegação do cromo: quem tem trabalho a perder (o painel de personalização, com rascunho sujo)
 * registra uma pergunta, e o `SarakAppChrome` a espera antes de chamar o `onNavigate` do host.
 */
export const SarakNavigationGuardProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const guardsRef = useRef<SarakNavigationGuard[]>([]);
    const registry = useMemo<NavigationGuardRegistry>(() => ({
        register: (guard) => {
            guardsRef.current.push(guard);
            return () => { guardsRef.current = guardsRef.current.filter((item) => item !== guard); };
        },
        run: (go) => {
            const guard = guardsRef.current[guardsRef.current.length - 1];
            if (!guard) { go(); return; }
            void guard().then((canLeave) => { if (canLeave) go(); });
        },
    }), []);
    return <NavigationGuardContext.Provider value={registry}>{children}</NavigationGuardContext.Provider>;
};

/** Registra o guarda enquanto `guard` existir (ou seja, enquanto houver o que perder). */
export const useRegisterNavigationGuard = (guard: SarakNavigationGuard | null): void => {
    const { register } = useContext(NavigationGuardContext);
    useEffect(() => (guard ? register(guard) : undefined), [guard, register]);
};

/** Envolve o `onNavigate` do host: com guarda registrado ele espera a resposta; sem guarda, navega na hora. */
export const useGuardedNavigate = (onNavigate?: (route: string) => void): ((route: string) => void) | undefined => {
    const { run } = useContext(NavigationGuardContext);
    const onNavigateRef = useRef(onNavigate);
    onNavigateRef.current = onNavigate;
    const guarded = useCallback((route: string) => run(() => onNavigateRef.current?.(route)), [run]);
    return onNavigate ? guarded : undefined;
};
