/**
 * `SarakChartEngine` (Spec 41 §2.4) — fronteira lazy.
 *
 * Mesma postura do `SarakMarkdownRenderer`/`SarakPDFViewer`: `React.lazy` mantém
 * `echarts` + `zrender` + `recharts` (peers pesados) FORA do grafo estático — só
 * carregam quando um gráfico é de fato renderizado. O barril público (`src/index.ts`)
 * exportava o `default` do módulo de implementação, o que anulava o code-splitting
 * que `components/engines/index.ts` já implementava e colocava ~2,7 MB de biblioteca
 * de gráfico no chunk principal de TODO consumidor, mesmo o que nunca desenha um gráfico.
 *
 * O `Suspense` é interno (via `LazyEngineWrapper`) para preservar o contrato público:
 * quem usa `<SarakChartEngine />` continua não precisando declarar `Suspense`.
 */
import React, { lazy } from 'react';
import LazyEngineWrapper from '../LazyEngineWrapper';
import type { SarakChartEngineProps } from './SarakChartEngine';

export type { SarakChartEngineProps } from './SarakChartEngine';

const ChartEngineImpl = lazy(() => import('./SarakChartEngine'));

export const SarakChartEngine: React.FC<SarakChartEngineProps> = (props) => (
    <LazyEngineWrapper>
        <ChartEngineImpl {...props} />
    </LazyEngineWrapper>
);

export default SarakChartEngine;
