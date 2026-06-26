/**
 * SarakPDFViewer (Spec 15, Regra 2) — fronteira lazy.
 *
 * `React.lazy` mantém `pdfjs-dist` (peer pesado) FORA do entry: só carrega quando um PDF
 * é de fato renderizado — telas sem PDF pagam custo zero. Sempre renderize sob `<Suspense>`.
 */

import { lazy } from 'react';

export type { SarakPDFViewerProps } from './SarakPDFViewerImpl';

export const SarakPDFViewer = lazy(() => import('./SarakPDFViewerImpl'));
