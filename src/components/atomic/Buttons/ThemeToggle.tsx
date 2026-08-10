import React from 'react';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { Palette, ChevronRight, Check } from 'lucide-react';

// TODO: Substituir por presets canônicos de core/Design/presets/themes/ quando forem criados
const LAYOUTS: Record<string, { id: string; name: string; class: string; animation: string }> = {};

/**
 * R10 declarado, não corrigido (plan-22, triagem 2026-08-10): os 2 `<button>` deste
 * componente não são triados aqui. `LAYOUTS` está vazio desde a plan-15 — o componente
 * é um seletor de preset MORTO, exportado no barril público (`src/index.ts`), sem
 * consumidor interno. O dono decidiu REMOVER; remoção de export público é `major` e
 * foi agrupada na plan-23 junto de outras mudanças de contrato, para a quebra sair
 * numa versão só. Não marcar (não é encapsulamento), não consertar (o componente vai
 * sair), não remover aqui (fora do escopo desta plan).
 */
export const ThemeToggle: React.FC = () => {
    const { design, applyConfig } = useSarakUI();
    const theme = design?.layout;
    const setTheme = (layoutId: string) => applyConfig({ layout: layoutId });
    
    // Converte o objeto LAYOUTS em array para o seletor
    const layoutOptions = Object.values(LAYOUTS);

    
    const currentLayoutName = layoutOptions.find(l => l.id === theme)?.name || 'Default';

    return (
        <div className="relative group">
            <button
                className="flex items-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-sarak"
                style={{ gap: 'var(--sarak-layout-gap-sm, 8px)', paddingInline: 'var(--sarak-layout-gap-sm, 8px)', paddingBlock: 'calc(var(--sarak-layout-gap-md, 16px) * 0.375)' }}
            >
                <Palette className="w-4 h-4 text-[var(--sarak-primary-color,#3b82f6)]" />
                <span className="text-xs font-medium text-white/70">{currentLayoutName}</span>
                <ChevronRight className="w-3 h-3 text-white/30 group-hover:rotate-90 transition-sarak" />
            </button>

            {/* Dropdown de Temas */}
            <div
                className="absolute right-0 top-full w-64 overflow-y-auto bg-[var(--sarak-card-bg)] border border-[var(--sarak-card-border-color)] rounded-sarak shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-sarak z-[100] custom-scrollbar"
                style={{ marginTop: 'var(--sarak-layout-gap-sm, 8px)', padding: 'var(--sarak-layout-gap-sm, 8px)', maxHeight: 'var(--sarak-theme-dropdown-max-height, 400px)' }}
            >
                <div
                    className="text-2xs font-bold text-white/30 uppercase tracking-widest border-b border-white/5"
                    style={{ paddingInline: 'var(--sarak-layout-gap-sm, 8px)', paddingBlock: 'var(--sarak-layout-gap-sm, 8px)', marginBottom: 'calc(var(--sarak-layout-gap-md, 16px) * 0.25)' }}
                >
                    Layouts Premium Matrix
                </div>
                {layoutOptions.map((layout) => (
                    <button
                        key={layout.id}
                        onClick={() => setTheme(layout.id)}
                        className={`w-full flex items-center justify-between rounded-lg text-sm transition-colors ${
                            theme === layout.id
                            ? 'bg-[var(--sarak-primary-color-bg,rgba(59,130,246,0.1))] text-[var(--sarak-primary-color,#3b82f6)]'
                            : 'text-white/60 hover:bg-white/5 hover:text-white'
                        }`}
                        style={{ paddingInline: 'var(--sarak-layout-gap-sm, 8px)', paddingBlock: 'var(--sarak-layout-gap-sm, 8px)' }}
                    >
                        <div className="flex items-start" style={{ flexDirection: 'column' }}>
                            <span>{layout.name}</span>
                            <span className="text-2xs opacity-40 capitalize">{(layout.class || '').replace('layout-', '')} • {layout.animation}</span>
                        </div>
                        {theme === layout.id && <Check className="w-4 h-4" />}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ThemeToggle;
