import React, { useState } from 'react';
import type { SarakThemePreset } from '../../../../core/Design/presets/themes';
import { resolveThemeForMode } from '../../../../core/Design/presets/themes/color-engine';
import type { SarakTokenValue } from '../../../../core/Design/types';
import { upgradeThemePayload } from '../../../../core/Design/master-map';
import { Sparkles, Layout, Type, Layers, MousePointer2, Keyboard, X } from 'lucide-react';
import { SarakButton } from '../../../../components/atomic/Buttons/SarakButton';
import { CardsCatalog } from './CardsCatalog';
import { AtmosphereCatalog } from './AtmosphereCatalog';
import { TypographyCatalog } from './TypographyCatalog';
import { ButtonsCatalog } from './ButtonsCatalog';
import { InputsCatalog } from './InputsCatalog';
import { PresetCard } from './PresetCard';
import { PresetCardPending } from './PresetCardPending';
import { useCatalogThemes } from './useCatalogThemes';
import { THEME_GALLERY_GRID_2COL } from '../panelResponsive.presets';

import { SarakDesignState, SarakUIContextType } from '../../../../core/Provider/types';

interface PresetsCatalogProps {
    onApplyPreset: (presetDesign: Partial<SarakDesignState>, isPartial?: boolean) => void;
    /** `themeId`: qual tema do catálogo gerou este payload — o rascunho o acompanha,
     * e só é anunciado ao sistema (`resolvedThemeId`) quando o rascunho é aplicado. */
    onApplyFullTheme?: (design: Partial<SarakDesignState>, themeId?: string) => void;
    currentMode: 'light' | 'dark';
    draftMode: 'light' | 'dark';
    /** Contexto do Provider — lê `themeCatalog` (lista leve) e `allThemes` (temas com `design` em memória). */
    sarak?: SarakUIContextType;
    onClose: () => void;
}

type PresetTab = 'globals' | 'cards' | 'typography' | 'atmosphere' | 'buttons' | 'inputs';

const TABS: { id: PresetTab; label: string; icon: React.ElementType }[] = [
    { id: 'globals', label: 'Temas', icon: Sparkles },
    { id: 'cards', label: 'Cards', icon: Layout },
    { id: 'typography', label: 'Tipografia', icon: Type },
    { id: 'atmosphere', label: 'Atmosfera', icon: Layers },
    { id: 'buttons', label: 'Botões', icon: MousePointer2 },
    { id: 'inputs', label: 'Campos', icon: Keyboard },
];

export const PresetsCatalog: React.FC<PresetsCatalogProps> = ({
    onApplyPreset,
    onApplyFullTheme,
    currentMode,
    draftMode,
    sarak,
    onClose,
}) => {
    const [activeTab, setActiveTab] = useState<PresetTab>('globals');

    // A lista é o catálogo LEVE (nome, modo, cor), completa na hora; o `design` de
    // cada embarcado chega sob demanda e o cartão vira a miniatura (`useCatalogThemes`).
    const { rows, loadTheme } = useCatalogThemes(sarak);

    // O modo do USUÁRIO tem que vencer — nunca o modo nativo do tema sozinho.
    // `resolveThemeForMode` decide entre o design nativo, a contraparte autorada ou o
    // fallback sintetizado. Só PRÉ-VISUALIZA — o id viaja com o payload para o rascunho,
    // e só é anunciado como `resolvedThemeId` quando o usuário aplicar
    // (`handleApplyToSystem`; 06-painel-de-customizacao-e-preview.md §4).
    const applyTheme = (theme: SarakThemePreset | undefined) => {
        if (!theme) return;
        const resolved = resolveThemeForMode(
            { design: theme.design as Record<string, SarakTokenValue>, contraparte: theme.contraparte },
            draftMode,
        );
        const payload = upgradeThemePayload(resolved);
        if (onApplyFullTheme) {
            onApplyFullTheme(payload, theme.id);
        } else {
            onApplyPreset(payload);
        }
    };

    return (
        <div id="presets-catalog" className="w-full h-full flex flex-col relative bg-theme-bg">
            {/* Header com navegação própria por Categoria de Preset (Schema), independente do Pilar do painel humano */}
            <div className="px-4 py-3 border-b border-theme-border flex flex-col gap-3 bg-theme-sidebar backdrop-blur-md sticky top-0 z-10">
                <div className="flex min-w-0 items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="shrink-0 rounded-xl border border-theme-primary/20 bg-theme-primary/10 p-2.5 shadow-[0_0_20px_rgba(var(--theme-primary-rgb),0.2)]">
                            <Sparkles size={18} className="text-theme-primary" />
                        </div>
                        <div className="flex min-w-0 flex-col">
                            <h2 className="text-xs font-black uppercase text-theme-text tracking-[var(--sarak-tracking-wide,0.3em)]">Galeria de estilos</h2>
                            <span className="text-[var(--sarak-type-scale3xs,11px)] font-bold text-theme-primary uppercase tracking-widest mt-0.5">
                                Categoria: {TABS.find(tab => tab.id === activeTab)?.label}
                            </span>
                        </div>
                    </div>
                    <SarakButton
                        type="button"
                        variant="ghost"
                        size="xs"
                        leftIcon={<X size={14} />}
                        onClick={onClose}
                        aria-label="Fechar galeria"
                        title="Fechar galeria"
                        className="shrink-0 whitespace-nowrap"
                    >
                        Fechar
                    </SarakButton>
                </div>
                <div role="group" aria-label="Categorias da galeria" className="w-full min-w-0 overflow-x-auto">
                    <div className="flex w-max min-w-full flex-nowrap items-center gap-2 rounded-xl border border-theme-border bg-theme-body/20 p-1">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-[var(--sarak-type-scale-caption,12px)] font-black uppercase tracking-normal transition-all ${activeTab === tab.id ? 'bg-theme-primary text-theme-text shadow-lg' : 'text-theme-muted hover:text-theme-text hover:bg-theme-text/5'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Presets Body */}
            {/* `@container` (plan-35): a fronteira de medida ÚNICA para as grades desta aba
                E das quatro sub-catálogos (Cards/Typography/Buttons/Inputs) — todas
                descendentes, todas reagem ao espaço real deste painel, nunca à janela
                (fecha 06-painel-de-customizacao-e-preview.md §6.2). */}
            <div className="@container flex-1 overflow-y-auto custom-scrollbar p-6 bg-[radial-gradient(ellipse_at_top_right,rgba(var(--theme-primary-rgb),0.03)_0%,transparent_50%)]">
                {activeTab === 'globals' && (
                    <div className={`grid ${THEME_GALLERY_GRID_2COL} gap-4`}>
                        {rows.map(({ entry, theme }, i) => (theme ? (
                            <PresetCard
                                key={entry.id}
                                theme={theme}
                                currentMode={currentMode}
                                onApply={() => applyTheme(theme)}
                                index={i}
                            />
                        ) : (
                            // Escolhido antes de chegar: carrega e só então aplica — o tema
                            // atual permanece na tela até o novo estar pronto.
                            <PresetCardPending
                                key={entry.id}
                                entry={entry}
                                currentMode={currentMode}
                                onChoose={() => { void loadTheme(entry.id).then((loaded) => applyTheme(loaded as SarakThemePreset | undefined)); }}
                            />
                        )))}
                    </div>
                )}

                {activeTab === 'cards' && <CardsCatalog onApplyPreset={onApplyPreset} currentMode={currentMode} />}
                {activeTab === 'typography' && <TypographyCatalog onApplyPreset={onApplyPreset} currentMode={currentMode} />}
                {activeTab === 'atmosphere' && <AtmosphereCatalog onApplyPreset={onApplyPreset} currentMode={currentMode} />}
                {activeTab === 'buttons' && <ButtonsCatalog onApplyPreset={onApplyPreset} currentMode={currentMode} />}
                {activeTab === 'inputs' && <InputsCatalog onApplyPreset={onApplyPreset} currentMode={currentMode} />}
            </div>
        </div>
    );
};
