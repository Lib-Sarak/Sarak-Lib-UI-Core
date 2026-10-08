import React from 'react';
import { ThemeCustomizationTab } from '../../Main/ThemeCustomizationTab';

/**
 * CustomizationPanel (v6.0)
 * Central de Comando Unificada - Foco 100% em Soberania e Gêmeo Digital.
 *
 * O painel monta **uma** aba: a de tema. Ele já importou sete — as outras seis nunca
 * foram renderizadas, então pagavam bundle sem alcance nenhum. Os imports mortos saíram
 * (decisão do dono, 2026-08-04); os componentes seguem em `../Panels/` com os seus testes,
 * prontos para quem decidir restaurar a navegação.
 */
export const CustomizationPanel: React.FC = () => {
    return (
        <div className="flex flex-col h-full animate-in fade-in zoom-in duration-500 overflow-hidden">
            {/* Header */}
            <div className="p-4 pb-2 shrink-0">
                <div className="mb-3 text-[var(--sarak-type-scale-xl,18px)] font-semibold text-[var(--color-theme-title,#ffffff)]">
                    Personalizar o tema
                </div>
            </div>

            {/* Sub-Components Viewport */}
            <div className="flex-grow p-8 pt-0 overflow-hidden">
                <div className="h-full bg-black/20 rounded-3xl border border-white/5 flex flex-col backdrop-blur-sm shadow-2xl overflow-hidden">
                    <ThemeCustomizationTab />
                </div>
            </div>
        </div>
    );
};

export default CustomizationPanel;

