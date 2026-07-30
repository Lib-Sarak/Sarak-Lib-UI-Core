/**
 * `SarakFlowEngine` (P26) — fronteira lazy.
 *
 * Mesma postura de `engines/charts/index.tsx`: `React.lazy` mantém `reactflow`
 * (peer pesado, mais o CSS que ele importa) FORA do grafo estático do barril
 * público — só carrega quando um fluxo é de fato renderizado.
 *
 * O `Suspense` é interno (via `LazyEngineWrapper`) para preservar o contrato público:
 * quem usa `<SarakFlowEngine />` não precisa declarar `Suspense`.
 */
import React, { lazy } from 'react';
import LazyEngineWrapper from '../LazyEngineWrapper';
import type { SarakFlowEngineProps } from './SarakFlowEngine';

export type { SarakFlowEngineProps } from './SarakFlowEngine';

const FlowEngineImpl = lazy(() => import('./SarakFlowEngine'));

export const SarakFlowEngine: React.FC<SarakFlowEngineProps> = (props) => (
    <LazyEngineWrapper>
        <FlowEngineImpl {...props} />
    </LazyEngineWrapper>
);

export default SarakFlowEngine;
