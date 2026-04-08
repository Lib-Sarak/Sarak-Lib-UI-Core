/**
 * Sarak UI Core — Entry Point Elite v5.4
 * 
 * Portal de Componentes e Motor de Interface do Ecossistema Sarak.
 * 100% Restaurado para paridade visual e funcional original.
 */

// Motor de Temas e Constantes Elite
export { default as SarakUIProvider } from './components/SarakUIProvider';
export { default as ThemeToggle } from './components/ThemeToggle';
export * from './constants/theme';

// Componentes de Layout e UI Plug & Play
export * from './components/SarakShell';
export * from './components/CustomizationPanel';
export * from './components/ExpandableCard';
export * from './components/Controls';

import { registerSarakModule } from '@sarak/lib-shared';
import { CustomizationPanel } from './components/CustomizationPanel';

/**
 * Auto-Registro Matrix (Plug & Play): Aba de Customização do Sistema
 * Garante que o painel de design apareça automaticamente no ecossistema Sarak.
 */
registerSarakModule({
    id: 'mx-customization',
    label: 'Customização',
    icon: 'Palette',
    category: 'Sistema',
    priority: 99, 
    component: CustomizationPanel,
    subItems: [
        { id: 'themes', label: 'Temas & Estética', icon: 'Paintbrush' },
        { id: 'layout', label: 'Estrutura & Layout', icon: 'Layers' },
        { id: 'branding', label: 'Identidade Visual', icon: 'Fingerprint' }
    ]
});
