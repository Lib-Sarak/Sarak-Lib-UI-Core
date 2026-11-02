import React from 'react';
import type { SarakThemePreset } from '../../../../core/Design/presets/themes';
import { resolveThemeForMode } from '../../../../core/Design/presets/themes/color-engine';
import type { SarakTokenValue } from '../../../../core/Design/types';
import { upgradeThemePayload } from '../../../../core/Design/master-map';
import { CardsCatalog } from './CardsCatalog';
import { AtmosphereCatalog } from './AtmosphereCatalog';
import { TypographyCatalog } from './TypographyCatalog';
import { ButtonsCatalog } from './ButtonsCatalog';
import { InputsCatalog } from './InputsCatalog';
import { PresetCard } from './PresetCard';
import { PresetCardPending } from './PresetCardPending';
import { useCatalogThemes } from './useCatalogThemes';
import { THEME_GALLERY_GRID_2COL } from '../panelResponsive.presets';
import type { PeekHandler } from './peek';

import { SarakDesignState, SarakUIContextType } from '../../../../core/Provider/types';

/** Os grupos de opções visuais que a coluna de decisões monta, um por vez. */
export type PresetGroup = 'themes' | 'cards' | 'fonts' | 'atmosphere' | 'buttons' | 'inputs';

interface PresetsCatalogProps {
    /** Qual grupo de opções desenhar. */
    group: PresetGroup;
    onApplyPreset: (presetDesign: Partial<SarakDesignState>, isPartial?: boolean) => void;
    /** `themeId`: qual tema do catálogo gerou este payload — o rascunho o acompanha,
     * e só é anunciado ao sistema (`resolvedThemeId`) quando o rascunho é aplicado. */
    onApplyFullTheme?: (design: Partial<SarakDesignState>, themeId?: string) => void;
    currentMode: 'light' | 'dark';
    draftMode: 'light' | 'dark';
    /** Contexto do Provider — lê `themeCatalog` (lista leve) e `allThemes` (temas com `design` em memória). */
    sarak?: SarakUIContextType;
    /** O rascunho atual: as amostras mostram cada opção aplicada por cima dele. */
    draft?: Partial<SarakDesignState>;
    /** Recebe o que a prévia grande deve compor enquanto o mouse ou o foco está numa opção; não grava nada. */
    onPeek?: PeekHandler;
}

interface ThemesGalleryProps extends Pick<PresetsCatalogProps, 'onApplyPreset' | 'onApplyFullTheme' | 'currentMode' | 'draftMode' | 'sarak' | 'onPeek'> {}

const ThemesGallery: React.FC<ThemesGalleryProps> = ({ onApplyPreset, onApplyFullTheme, currentMode, draftMode, sarak, onPeek }) => {
    // A lista é o catálogo LEVE (nome, modo, cor), completa na hora; o `design` de
    // cada embarcado chega sob demanda e o cartão vira a miniatura (`useCatalogThemes`).
    const { rows, loadTheme } = useCatalogThemes(sarak);

    // O modo do USUÁRIO tem que vencer — nunca o modo nativo do tema sozinho.
    // `resolveThemeForMode` decide entre o design nativo, a contraparte autorada ou o
    // fallback sintetizado. Só PRÉ-VISUALIZA — o id viaja com o payload para o rascunho,
    // e só é anunciado como `resolvedThemeId` quando o usuário aplicar
    // (`handleApplyToSystem`; 06-painel-de-customizacao-e-preview.md §4).
    const themePayload = (theme: SarakThemePreset) => upgradeThemePayload(resolveThemeForMode(
        { design: theme.design as Record<string, SarakTokenValue>, contraparte: theme.contraparte },
        draftMode,
    ));
    const applyTheme = (theme: SarakThemePreset | undefined) => {
        if (!theme) return;
        const payload = themePayload(theme);
        if (onApplyFullTheme) {
            onApplyFullTheme(payload, theme.id);
        } else {
            onApplyPreset(payload);
        }
    };

    return (
        <div className={`grid ${THEME_GALLERY_GRID_2COL} gap-4`}>
            {rows.map(({ entry, theme }, i) => (theme ? (
                <PresetCard
                    key={entry.id}
                    theme={theme}
                    currentMode={currentMode}
                    onApply={() => applyTheme(theme)}
                    peekTokens={() => themePayload(theme)}
                    onPeek={onPeek}
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
    );
};

/**
 * Um grupo de opções da galeria, sem cromo próprio: a coluna de decisões escolhe qual montar.
 * O `@container` mede o espaço real da coluna, nunca a janela (06-painel-de-customizacao-e-preview.md §6.2).
 */
export const PresetsCatalog: React.FC<PresetsCatalogProps> = ({
    group,
    onApplyPreset,
    onApplyFullTheme,
    currentMode,
    draftMode,
    sarak,
    draft,
    onPeek,
}) => (
    <div id={`presets-${group}`} className="@container w-full">
        {group === 'themes' && (
            <ThemesGallery
                onApplyPreset={onApplyPreset}
                onApplyFullTheme={onApplyFullTheme}
                currentMode={currentMode}
                draftMode={draftMode}
                sarak={sarak}
                onPeek={onPeek}
            />
        )}
        {group === 'cards' && <CardsCatalog onApplyPreset={onApplyPreset} currentMode={currentMode} draft={draft} onPeek={onPeek} />}
        {group === 'fonts' && <TypographyCatalog onApplyPreset={onApplyPreset} currentMode={currentMode} onPeek={onPeek} />}
        {group === 'atmosphere' && <AtmosphereCatalog onApplyPreset={onApplyPreset} currentMode={currentMode} draft={draft} onPeek={onPeek} />}
        {group === 'buttons' && <ButtonsCatalog onApplyPreset={onApplyPreset} currentMode={currentMode} draft={draft} onPeek={onPeek} />}
        {group === 'inputs' && <InputsCatalog onApplyPreset={onApplyPreset} currentMode={currentMode} draft={draft} onPeek={onPeek} />}
    </div>
);
