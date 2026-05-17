import React from 'react';

/**
 * Sarak Dynamic Engine Exports v7.0
 * Implements Code Splitting for heavy visualization libraries.
 */

export const SarakChartEngine = React.lazy(() => import('./charts/SarakChartEngine')) as React.LazyExoticComponent<React.ComponentType<any>>;
export const SarakFlowEngine = React.lazy(() => import('./flows/SarakFlowEngine')) as React.LazyExoticComponent<React.ComponentType<any>>;
export const SarakChatEngine = React.lazy(() => import('./chat/SarakChatEngine')) as React.LazyExoticComponent<React.ComponentType<any>>;
export const SarakVisualEngine = React.lazy(() => import('./visuals/SarakVisualEngine')) as React.LazyExoticComponent<React.ComponentType<any>>;
export const PaletteSelector = React.lazy(() => import('./visuals/PaletteSelector').then(m => ({ default: m.PaletteSelector }))) as React.LazyExoticComponent<React.ComponentType<any>>;

export { default as LazyEngineWrapper } from './LazyEngineWrapper';
