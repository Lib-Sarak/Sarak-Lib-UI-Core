/**
 * SarakMarkdownRenderer (Spec 15, Regra 1) — fronteira lazy.
 *
 * `React.lazy` mantém `react-markdown` + `react-syntax-highlighter` (peers pesados)
 * FORA do entry: só carregam quando um Markdown é de fato renderizado — telas sem
 * Markdown pagam custo zero. Sempre renderize sob `<Suspense>`.
 */

import { lazy } from 'react';

export type { SarakMarkdownRendererProps } from './SarakMarkdownRendererImpl';

export const SarakMarkdownRenderer = lazy(() => import('./SarakMarkdownRendererImpl'));
