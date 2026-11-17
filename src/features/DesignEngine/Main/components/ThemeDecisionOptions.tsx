import React, { useState } from 'react';
import { PresetsCatalog, type PresetGroup } from '../../Canvas/components/PresetsCatalog';
import { PaletteSection } from './PaletteSection';
import { CollapsibleSection } from './CollapsibleSection';
import { PersonalityCatalog } from '../../Canvas/components/PersonalityCatalog';
import { usePersonalitySelection } from '../hooks/usePersonalitySelection';
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
    /** O tema escolhido na galeria e ainda não aplicado: a Personalidade não conta o que ele trouxe como ajuste manual. */
    draftThemeId?: string;
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

const PersonalityBody: React.FC<{ context: DecisionOptionsContext }> = ({ context }) => {
    const select = usePersonalitySelection({ draft: context.draft, sarak: context.sarak, draftThemeId: context.draftThemeId, onApplyPreset: context.onApplyPreset });
    return <PersonalityCatalog draft={context.sampleDraft ?? context.draft} currentMode={context.currentMode} onSelect={(personality) => { void select(personality); }} onPeek={context.onPeek} />;
};

const GroupBody: React.FC<{ group: OptionGroup; context: DecisionOptionsContext }> = ({ group, context }) => {
    if (group === 'personalities') return <PersonalityBody context={context} />;
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
                onPeek={context.onPeek}
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

/** O grupo tem uma opção aplicada: todo token que ela escreve já vale no rascunho. */
const hasAppliedOption = (group: OptionGroup, draft: Partial<SarakDesignState> | undefined): boolean => {
    const registered = getPresetGroup(group);
    if (!registered || !draft) return false;
    const values = draft as Record<string, unknown>;
    return registered.presets.some((preset) => {
        const entries = Object.entries(preset.design);
        return entries.length > 0 && entries.every(([id, value]) => values[id] === value);
    });
};

/**
 * Os grupos abertos de saída: o primeiro com uma opção aplicada (o "em uso") ou, sem nenhum, o primeiro — a decisão nunca abre
 * toda fechada. A galeria de temas é sempre o "em uso" da decisão que a tem: o tema aplicado é uma opção dela.
 */
const initialOpenGroups = (groups: readonly OptionGroup[], draft: Partial<SarakDesignState> | undefined): ReadonlySet<OptionGroup> => {
    const inUse = groups.includes('themes') ? 'themes' : (groups.find((group) => hasAppliedOption(group, draft)) ?? groups[0]);
    return new Set(inUse ? [inUse] : []);
};

/**
 * O nível 2, primeira metade: os grupos de opção visual da decisão, cada um com o componente real. Abrem fechados, menos o em
 * uso; `openAll` abre todos (a busca de token precisa achar a linha onde ela estiver).
 */
export const ThemeDecisionOptions: React.FC<{ groups: readonly OptionGroup[]; context: DecisionOptionsContext; openAll?: boolean }> = ({ groups, context, openAll = false }) => {
    const text = useLibraryText();
    const presetText = usePresetText();
    const [opened, setOpened] = useState<ReadonlySet<OptionGroup>>(() => initialOpenGroups(groups, context.sampleDraft ?? context.draft));
    const toggle = (group: OptionGroup): void => setOpened((current) => {
        const next = new Set(current);
        if (!next.delete(group)) next.add(group);
        return next;
    });
    return (
        <>
            {groups.map((group) => {
                const titleKey = GROUP_TITLE[group];
                const title = titleKey ? text(titleKey) : (getPresetGroup(group) || group === 'personalities' ? presetText.group(group) : undefined);
                if (!title) return <section key={group} data-option-group={group} className="flex flex-col gap-3"><GroupBody group={group} context={context} /></section>;
                return (
                    <CollapsibleSection key={group} title={title} toggleId={group} sectionProps={{ 'data-option-group': group }} open={openAll || opened.has(group)} onToggle={() => toggle(group)}>
                        <GroupBody group={group} context={context} />
                    </CollapsibleSection>
                );
            })}
        </>
    );
};
