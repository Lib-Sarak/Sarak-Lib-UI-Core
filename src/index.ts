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
// Multi-dispositivo (Spec 10/16 — L3 da Spec 40.1): DeviceProvider + useSarakDevice
// (device atual) + SarakHidden (oculta por dispositivo) + o tipo ResponsiveValue<T>
// (valor por breakpoint mob/tab/desk) que os tokens responsivos usam. API pública
// e documentada para o consumidor compor multi-dispositivo sem CSS próprio.
export * from './core/Provider/DeviceProvider';
export type { ResponsiveValue } from './core/Design/types';
export * from './components/Layout/SarakAnalyticalPage';
export * from './components/Layout/SarakHidden';
// Cromo apresentacional temável topbar/sidebar (Spec 40.1 — L2), sem host/registro.
// Navegação estruturada com ícone first-class via `SarakNavItem` (Spec 40.2 — L1).
export { SarakAppChrome } from './components/Layout/SarakAppChrome';
export type { SarakAppChromeProps, SarakNavItem } from './components/Layout/SarakAppChrome';
export * from './components/atomic/Icon/SarakIcon';
export * from './components/atomic/Icon/IconMap';
export { useDesignDraft } from './features/DesignEngine/hooks/useDesignDraft';
export { DESIGN_MANIFEST } from './core/Provider/manifest';
// Temas COMPLETOS de referência (Spec 40.1 — L6): o consumidor parte destes e customiza
// poucos valores, mantendo TODOS os eixos (cor+fonte+cromo+raio+espaçamento). Inclui os
// helpers de completude (defaults totais + aviso de eixo omitido) e o tipo `ThemePreset`.
export { GLOBAL_THEMES, THEME_PRESET_IDS } from './core/Design/presets/themes';
export type { ThemePreset, ThemePresetId } from './core/Design/presets/themes';
export { SARAK_REFERENCE_THEMES, getThemePreset } from './core/Design/presets/themes/reference';
export { getDefaultDesignState, getAllDesignTokens } from './core/Design/master-map';
export { THEME_AXES, findMissingThemeAxes, warnOnIncompleteTheme } from './core/Design/utils/themeAxes';
export * from './features/DesignEngine/Library/CustomizationPanel';
export * from './components/atomic/Atoms';
export * from './components/atomic/Cards/ExpandableCard';
export * from './components/atomic/Cards/SarakActionCard';
export * from './components/atomic/Cards/SarakSearchCard';
export * from './components/atomic/Cards/SarakTitleCard';
// API React pública do modelo módulos-plugin (Spec 43 §3.1) — faltavam inteiras no
// barrel público (só viviam no Registry do motor de manifesto, `nativeComponents.ts`).
// `SarakTabs` de `Layouts/` fica de fora do `export *`: colide de nome com
// `UX/SarakTabs` (já público abaixo) e são dois componentes DIFERENTES e
// incompatíveis (props `items/defaultActiveId` vs `tabs/activeTab/onChange`) —
// achado pré-existente desta auditoria, fora do escopo enxuto da Spec 43; a
// deduplicação fica para uma spec de refatoração dedicada.
export { SarakFlex } from './components/atomic/Layouts/SarakFlex';
export type { SarakFlexProps } from './components/atomic/Layouts/SarakFlex';
export { SarakGrid } from './components/atomic/Layouts/SarakGrid';
export type { SarakGridProps } from './components/atomic/Layouts/SarakGrid';
export { SarakSplitPane } from './components/atomic/Layouts/SarakSplitPane';
export type { SarakSplitPaneProps } from './components/atomic/Layouts/SarakSplitPane';
export { SarakAccordion } from './components/atomic/Layouts/SarakAccordion';
export type { SarakAccordionProps } from './components/atomic/Layouts/SarakAccordion';
export { SarakFormGroup } from './components/atomic/Layouts/SarakFormGroup';
export type { SarakFormGroupProps } from './components/atomic/Layouts/SarakFormGroup';
export * from './components/atomic/Navigation';
export * from './components/atomic/Inputs/Controls';
// Entrada de dados BÁSICA (achado Spec 40 — Teste Real): existiam e já estavam no
// Registry do motor de manifesto (`nativeComponents.ts`), mas nunca chegaram ao
// barril público React — mesma classe de lacuna do `SarakLink` (Spec 40, pré-req).
export { SarakInput } from './components/atomic/Inputs/SarakInput';
export type { SarakInputProps } from './components/atomic/Inputs/SarakInput';
export { SarakSelect } from './components/atomic/Inputs/SarakSelect';
export type { SarakSelectProps } from './components/atomic/Inputs/SarakSelect';
export { SarakTextarea } from './components/atomic/Inputs/SarakTextarea';
export type { SarakTextareaProps } from './components/atomic/Inputs/SarakTextarea';
export { SarakSlider } from './components/atomic/Inputs/SarakSlider';
export type { SarakSliderProps } from './components/atomic/Inputs/SarakSlider';
export { SarakSwitch } from './components/atomic/Inputs/SarakSwitch';
export type { SarakSwitchProps } from './components/atomic/Inputs/SarakSwitch';
export { SarakSearch } from './components/atomic/Inputs/SarakSearch';
export type { SarakSearchProps } from './components/atomic/Inputs/SarakSearch';
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
