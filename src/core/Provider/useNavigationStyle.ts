import { useContext } from 'react';
import { UIContext, DesignOverrideContext } from './SarakUIProvider';

/**
 * Fonte única de leitura de `navigationStyle` (Spec 27 §2.1): lê o Design Engine SEM
 * exigir o Provider — o draft de override (`DesignOverrideContext`) tem prioridade
 * sobre o design persistido, e degrada a `undefined` fora do `SarakUIProvider`.
 * Compartilhado por `SarakShellNav` (orientação do menu) e `ShellRouterNode`
 * (realocação de região do shell) — nunca duplicar esta leitura de contexto.
 */
export const useNavigationStyle = (): string | undefined => {
    const context = useContext(UIContext);
    const override = useContext(DesignOverrideContext);
    const design = (override ?? context?.design) as { navigationStyle?: unknown } | null | undefined;
    const value = design?.navigationStyle;
    return typeof value === 'string' ? value : undefined;
};
