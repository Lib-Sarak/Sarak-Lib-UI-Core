import React from 'react';
import { PresetsCatalog, type PresetGroup } from '../../Canvas/components/PresetsCatalog';
import { PaletteSection } from './PaletteSection';
import { ThemeGlobalSettings } from './ThemeGlobalSettings';
import { usePresetText } from '../../hooks/usePresetText';
import { getPresetGroup } from '../../../../core/Design/presets/components/registry';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import type { LibraryTextKey } from '../../../../core/i18n/catalog';
import type { PeekHandler } from '../../Canvas/components/peek';
import type { SarakDesignState, SarakUIContextType } from '../../../../core/Provider/types';
import type { ComponentSchema } from '../../../../core/Design/types';
import type { ColumnTokenProps } from './DecisionTokenList';
import type { OptionGroup } from '../../utils/decisions';

/** Tudo que os grupos de opção visual precisam: o rascunho, a prévia ao vivo e as portas de aplicar. */
export interface DecisionOptionsContext extends ColumnTokenProps {
    sarak: SarakUIContextType;
    globalComponent: ComponentSchema | undefined;
    onApplyPreset: (presetDesign: Partial<SarakDesignState>, isPartial?: boolean) => void;
    onApplyFullTheme?: (design: Partial<SarakDesignState>, themeId?: string) => void;
    onPeek?: PeekHandler;
    /** O rascunho como a prévia o mostra (com o modo do usuário aplicado): as amostras partem dele, para seguir o modo da prévia e não o do tema. */
    sampleDraft?: Partial<SarakDesignState>;
    currentMode: 'light' | 'dark';
    draftMode: 'light' | 'dark';
    /** Tokens que o nível 2 já mostra por pergunta: o bloco global não os repete. */
    omitTokenIds?: ReadonlySet<string>;
}

const GROUP_TITLE: Partial<Record<OptionGroup, LibraryTextKey>> = {
    themes: 'optionGroupThemes',
    cards: 'optionGroupCards',
    atmosphere: 'optionGroupAtmosphere',
    buttons: 'optionGroupButtons',
    inputs: 'optionGroupInputs',
};

const PRESET_GROUP: Partial<Record<OptionGroup, PresetGroup>> = {
    themes: 'themes', fonts: 'fonts', cards: 'cards', atmosphere: 'atmosphere', buttons: 'buttons', inputs: 'inputs',
};

/** Todo grupo do registro de presets monta o catálogo dele, mesmo sem entrada na tabela acima. */
const presetGroupOf = (group: OptionGroup): PresetGroup | undefined => PRESET_GROUP[group] ?? (getPresetGroup(group) ? group : undefined);

const GroupBody: React.FC<{ group: OptionGroup; context: DecisionOptionsContext }> = ({ group, context }) => {
    const presetGroup = presetGroupOf(group);
    if (presetGroup) {
        return (
            <PresetsCatalog
                group={presetGroup}
                onApplyPreset={context.onApplyPreset}
                onApplyFullTheme={context.onApplyFullTheme}
                currentMode={context.currentMode}
                draftMode={context.draftMode}
                sarak={context.sarak}
                draft={context.sampleDraft ?? context.draft}
                onPeek={context.onPeek}
            />
        );
    }
    if (group === 'palettes') {
        return (
            <PaletteSection
                draft={context.draft as unknown as Record<string, unknown>}
                appliedDesign={context.sarak.systemDesign as unknown as Record<string, unknown> | undefined}
                updateDraft={context.updateDraft}
            />
        );
    }
    return (
        <ThemeGlobalSettings
            globalComponent={context.globalComponent}
            sarak={context.sarak}
            catalogMap={context.catalogMap}
            draft={context.draft}
            updateDraft={context.updateDraft}
            previewDevice={context.previewDevice}
            omitTokenIds={context.omitTokenIds}
        />
    );
};

/** O nível 2, primeira metade: os grupos de opção visual da decisão, cada um com o componente real. */
export const ThemeDecisionOptions: React.FC<{ groups: readonly OptionGroup[]; context: DecisionOptionsContext }> = ({ groups, context }) => {
    const text = useLibraryText();
    const presetText = usePresetText();
    return (
        <>
            {groups.map((group) => {
                const titleKey = GROUP_TITLE[group];
                const title = titleKey ? text(titleKey) : (getPresetGroup(group) ? presetText.group(group) : undefined);
                return (
                    <section key={group} aria-label={title} data-option-group={group} className="flex flex-col gap-3">
                        {title && <h3 className="text-xs font-semibold text-[var(--theme-muted)]">{title}</h3>}
                        <GroupBody group={group} context={context} />
                    </section>
                );
            })}
        </>
    );
};
