/**
 * Sarak UI Core — Entry Point v5.4
 * 
 * Component Portal and Interface Engine for the Sarak Ecosystem.
 * 100% Restored for original visual and functional parity.
 */

// Theme Engine and Constants
export { default as SarakUIProvider, useSarakUI } from './core/Provider/SarakUIProvider';
export { default as ThemeToggle } from './components/atomic/Buttons/ThemeToggle';
export * from './constants/design-tokens';
export * from './constants/theme';

// Layout Components and Plug & Play UI
export * from './core/Shell/SarakShell';
export * from './features/DesignEngine/Library/CustomizationPanel';
export * from './components/atomic/Atoms';
export * from './components/atomic/Cards/ExpandableCard';
export * from './components/atomic/Inputs/Controls';
export { default as SarakChartEngine } from './components/engines/charts/SarakChartEngine';

// Discovery and Dynamic Rendering (Universal Bridge)
export { default as DynamicRenderer } from './core/Discovery/DynamicRenderer';
export * from './core/Discovery/registry';
export * from './constants/discovery';
export { useModuleDiscovery } from './shared/hooks/useModuleDiscovery';

import { registerLocalComponent } from './core/Discovery/registry';
import { ThemeCustomizationTab } from './features/DesignEngine/Main/ThemeCustomizationTab';

// Metadata (Label, Icon, Category) will come from Seeds via API.
registerLocalComponent('mx-customization', ThemeCustomizationTab);

