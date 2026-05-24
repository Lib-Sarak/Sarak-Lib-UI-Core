/**
 * Sarak UI Core — Entry Point v5.4
 * 
 * Component Portal and Interface Engine for the Sarak Ecosystem.
 * 100% Restored for original visual and functional parity.
 */

// Theme Engine and Constants
export { default as SarakUIProvider, useSarakUI } from './core/Provider/SarakUIProvider';
export { DesignScope } from './core/Design/components/DesignScope';
export { default as ThemeToggle } from './components/atomic/Buttons/ThemeToggle';


// Layout Components and Plug & Play UI
export * from './core/Shell/SarakShell';
export * from './components/atomic/Icon/SarakIcon';
export * from './components/atomic/Icon/IconMap';
export { useDesignDraft } from './features/DesignEngine/hooks/useDesignDraft';
export { DESIGN_MANIFEST } from './core/Provider/manifest';
export * from './features/DesignEngine/Library/CustomizationPanel';
export * from './components/atomic/Atoms';
export * from './components/atomic/Cards/ExpandableCard';
export * from './components/atomic/Inputs/Controls';
export * from './components/atomic/Templates';
export { default as SarakChartEngine } from './components/engines/charts/SarakChartEngine';

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
