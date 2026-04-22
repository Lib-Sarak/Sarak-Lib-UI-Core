/**
 * Sarak UI Core — Entry Point v5.4
 * 
 * Component Portal and Interface Engine for the Sarak Ecosystem.
 * 100% Restored for original visual and functional parity.
 */

// Theme Engine and Constants
export { default as SarakUIProvider, useSarakUI } from './components/SarakUIProvider';
export { default as ThemeToggle } from './components/ThemeToggle';
export * from './constants/design-tokens';
export * from './constants/theme';


// Layout Components and Plug & Play UI
export * from './components/SarakShell';
export * from './components/CustomizationPanel';
export * from './components/ExpandableCard';
export * from './components/Controls';

export { useModuleDiscovery } from './shared/hooks/useModuleDiscovery';
export * from './constants/discovery';

// --- INTERNAL MODULE REGISTRATION (v6.5) ---
export * from './shared/registry';
import { registerLocalComponent } from './shared/registry';
import ThemeCustomizationTab from './components/ThemeCustomization/ThemeCustomizationTab';

// registering the component linked to the ID.
// Metadata (Label, Icon, Category) will come from Seeds via API.
registerLocalComponent('mx-customization', ThemeCustomizationTab);

