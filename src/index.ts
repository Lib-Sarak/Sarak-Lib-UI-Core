/**
 * Sarak UI Core — Entry Point Elite v5.2
 * 
 * Portal de Componentes e Motor de Interface do Ecossistema Sarak.
 */

// Re-exporta o motor central do Shared (Single Source of Truth)
export * from '@sarak/lib-shared';

// Componentes de Controle de Engine
export { default as ThemeToggle } from './components/ThemeToggle';

// Componentes de Layout e UI
export * from './components/ExpandableCard';
export * from './components/Controls';
export * from './components/SarakShell';
export * from './components/CustomizationPanel';

import { registerSarakModule } from '@sarak/lib-shared';
import { CustomizationPanel } from './components/CustomizationPanel';

// Auto-Registro Matrix (Plug & Play): Aba de Customização do Sistema
registerSarakModule({
    id: 'mx-customization',
    label: 'Customização',
    icon: 'Palette',
    category: 'Sistema',
    priority: 99, // Alta prioridade no menu de sistema
    component: CustomizationPanel,
    subItems: [
        { id: 'themes', label: 'Temas Ativos', icon: 'Paintbrush' },
        { id: 'branding', label: 'Identidade Visual', icon: 'Fingerprint' }
    ]
});
