/**
 * Sarak UI Core — Entry Point v5.4
 * 
 * Component Portal and Interface Engine for the Sarak Ecosystem.
 * 100% Restored for original visual and functional parity.
 */

// Theme Engine and Constants
export { default as SarakUIProvider, useSarakUI } from './core/Provider/SarakUIProvider';
// Modo de consumo (Spec 24): `app` (default) vs `embedded` (ilha sobre front existente).
export type { SarakUIMode } from './core/Provider/types';
export { SARAK_SCOPE_CLASS, SARAK_MODE_ATTRIBUTE } from './core/Provider/scope';
export { DesignScope } from './core/Design/components/DesignScope';
export { default as ThemeToggle } from './components/atomic/Buttons/ThemeToggle';
export * from './components/atomic/Buttons/SarakButton';
export * from './components/atomic/Buttons/SarakIconButton';


// Layout Components and Plug & Play UI
export * from './core/Shell/SarakShell';
export * from './core/Provider/DeviceProvider';
export * from './components/Layout/SarakAnalyticalPage';
export * from './components/Layout/SarakHidden';
export * from './components/atomic/Icon/SarakIcon';
export * from './components/atomic/Icon/IconMap';
export { useDesignDraft } from './features/DesignEngine/hooks/useDesignDraft';
export { DESIGN_MANIFEST } from './core/Provider/manifest';
export * from './features/DesignEngine/Library/CustomizationPanel';
export * from './components/atomic/Atoms';
export * from './components/atomic/Cards/ExpandableCard';
export * from './components/atomic/Inputs/Controls';
// Entrada de dados avançada (Spec 11 / Onda 8) — também resolvíveis via manifesto.
export * from './components/atomic/Inputs/SarakRangeSlider';
export * from './components/atomic/Inputs/SarakMultiSelect';
export * from './components/atomic/Inputs/SarakUploader';
export * from './components/atomic/Inputs/SarakDatePicker';
export * from './components/atomic/Inputs/SarakTimePicker';
// RichText WYSIWYG blindado (Spec 11 / Onda 10) — contentEditable + sanitizeHtml.
export * from './components/atomic/Inputs/SarakRichText';
export * from './components/atomic/Templates';
export * from './components/atomic/Modals';
export * from './components/atomic/Feedback';
export * from './components/atomic/UX';
// Densidade de dados (Spec 12 / Onda 9): DataGrid (windowing), DataTable (colunar
// avançado), Sparkline (micro-gráfico) e TreeView. Resolvíveis via manifesto.
export * from './components/atomic/DataDisplay';
// Renderizadores de mídia (Spec 15): Markdown (lazy) + Lightbox + PDFViewer (lazy, Onda 10).
export * from './components/atomic/Media';
export { default as SarakChartEngine } from './components/engines/charts/SarakChartEngine';

// Manifest Engine — Bloco Funcional (Contrato do Importador — Spec 30)
// Porta de entrada da automação total: `<SarakManifestRenderer />` + suas Interfaces
// TS. Contrato (Spec 30, Regra 2): `payload` · `dataStore` (21) · `networkInterceptor`
// (31) · `routerInterceptor` (25) — e `route`/`shell`/`routes` da composição em app
// multi-página (Spec 33). Fundação 20–22; engines 23–29/31; responsividade como dado
// (16). Os átomos isolados (SarakButton, etc.) seguem exportados acima (Regra 1).
export * from './core/Manifest';

// Discovery and Dynamic Rendering (Universal Bridge)
export { default as DynamicRenderer } from './core/Discovery/DynamicRenderer';
export * from './core/Discovery/registry';
export * from './core/Discovery/types';
export { useModuleDiscovery } from './shared/hooks/useModuleDiscovery';
export { useSarakRouter } from './shared/hooks/useSarakRouter';
export type { SarakRouterState } from './shared/hooks/useSarakRouter';

import { registerLocalComponent } from './core/Discovery/registry';
import { CustomizationPanel } from './features/DesignEngine/Library/CustomizationPanel';

// Component mapping for the registry. 
// We use the unified CustomizationPanel (v12.0) as the target for both IDs.
registerLocalComponent('mx-customization', CustomizationPanel);
registerLocalComponent('personalization', CustomizationPanel);
