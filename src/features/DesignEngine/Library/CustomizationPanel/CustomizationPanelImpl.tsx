import React from 'react';
import { ThemeCustomizationTab } from '../../Main/ThemeCustomizationTab';

/**
 * CustomizationPanel (v6.0)
 * Central de Comando Unificada - Foco 100% em Soberania e Gêmeo Digital.
 *
 * O painel monta **uma** aba: a de tema. Dos seis componentes de aba que não eram
 * renderizados, `LanguageTab` e `ShortcutsTab` foram removidos; `AdvancedTab`,
 * `EngineCustomizationTab`, `HyperGranularityTab` e `LayoutTab` continuam em `../Panels/`
 * com os seus testes.
 */
export const CustomizationPanel: React.FC = () => {
    return (
        <div className="flex flex-col h-full animate-in fade-in zoom-in duration-[var(--sarak-motion-dur-slow,0.6s)] overflow-hidden">
            {/* Header */}
            <div className="p-4 pb-2 shrink-0">
                <div className="mb-3 text-[var(--sarak-type-scale-xl,20px)] font-semibold text-[var(--color-theme-title,#f2f6fb)]">
                    Personalizar o tema
                </div>
            </div>

            {/* Sub-Components Viewport */}
            <div className="flex-grow p-8 pt-0 overflow-hidden">
                <div className="h-full bg-theme-body/20 rounded-3xl border border-theme-text/5 flex flex-col backdrop-blur-sm shadow-2xl overflow-hidden">
                    <ThemeCustomizationTab />
                </div>
            </div>
        </div>
    );
};

export default CustomizationPanel;

