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
            <div className="p-8 pb-4 shrink-0">
                <div className="flex items-center justify-between mb-6">
                    <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 uppercase tracking-tighter">
                        Central de Comando
                    </div>
                    <div className="flex gap-2">
                        <div className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-[var(--sarak-type-scale2xs,10px)] font-black text-red-400 uppercase tracking-widest animate-pulse">
                            v13.9 - AUDIT ACTIVE
                        </div>
                        <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[var(--sarak-type-scale2xs,10px)] font-black text-blue-400 uppercase tracking-widest">
                            v12.0 Sovereign
                        </div>
                    </div>
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

