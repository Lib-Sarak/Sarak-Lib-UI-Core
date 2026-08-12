import type { SarakUIOptions } from '../types';

type PersistenceStrategy = 'local' | 'remote' | 'hybrid';

// Módulo (não `useRef`): o aviso é por SESSÃO, não por instância de Provider —
// dois Providers 'remote' sem porta configurada avisam uma vez juntos, não duas.
let hasWarnedRemoteWithoutPort = false;

/**
 * Resolve o `strategy` efetivo (ADR-009 §2.2). Sem `strategy`, o default é
 * `'hybrid'` — o comportamento de sempre, sem nome. `'remote'` sem `onSave` nem
 * `onLoad` configurados degrada para `'local'`, com um `console.warn` único por
 * sessão: nunca perde o tema em silêncio.
 */
export const resolveEffectiveStrategy = (persistence?: SarakUIOptions['persistence']): PersistenceStrategy => {
    const strategy = persistence?.strategy ?? 'hybrid';
    if (strategy !== 'remote') return strategy;
    if (persistence?.onSave || persistence?.onLoad) return strategy;

    if (!hasWarnedRemoteWithoutPort) {
        hasWarnedRemoteWithoutPort = true;
        console.warn(
            "[Sarak:Design] persistence.strategy: 'remote' sem onSave/onLoad configurado — " +
                "degradando para 'local' (localStorage) para não perder o tema.",
        );
    }
    return 'local';
};
