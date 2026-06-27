import React from 'react';

/**
 * Sarak Dynamic Engine Exports v7.0
 * Implements Code Splitting for heavy visualization libraries.
 */

export const SarakChartEngine = React.lazy(() => import('./charts/SarakChartEngine'));
export const SarakFlowEngine = React.lazy(() => import('./flows/SarakFlowEngine'));
export const SarakChatEngine = React.lazy(() => import('./chat/SarakChatEngine'));
export const SarakVisualEngine = React.lazy(() => import('./visuals/SarakVisualEngine'));
export const PaletteSelector = React.lazy(() => import('./visuals/PaletteSelector').then(m => ({ default: m.PaletteSelector })));

export { default as LazyEngineWrapper } from './LazyEngineWrapper';
