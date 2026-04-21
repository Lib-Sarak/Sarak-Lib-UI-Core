/**
 * Sarak UI Core — Entry Point Elite v5.4
 * 
 * Portal de Componentes e Motor de Interface do Ecossistema Sarak.
 * 100% Restaurado para paridade visual e funcional original.
 */

// Motor de Temas e Constantes Elite
export { default as SarakUIProvider, useSarakUI } from './components/SarakUIProvider';
export { default as ThemeToggle } from './components/ThemeToggle';
export * from './constants/design-tokens';
export * from './constants/theme';


// Componentes de Layout e UI Plug & Play
export * from './components/SarakShell';
export * from './components/CustomizationPanel';
export * from './components/ExpandableCard';
export * from './components/Controls';

export { useModuleDiscovery } from './shared/hooks/useModuleDiscovery';
export * from './constants/discovery';

// --- REGISTRO DE MÓDULOS INTERNOS (v5.5) ---
export * from './shared/registry';
import { registerSarakModule } from './shared/registry';
import ThemeCustomizationTab from './components/ThemeCustomization/ThemeCustomizationTab';

registerSarakModule({
    id: 'mx-customization',
    label: 'Personalização',
    icon: 'Palette',
    category: 'Design & UX',
    component: ThemeCustomizationTab,
    priority: 1000
});
