import React from 'react';
import { PERSONALITIES, type Personality } from '../../../../core/Design/presets/components/personalities';
import type { SarakDesignState } from '../../../../core/Provider/types';
import { BarSample } from '../../Main/components/BarSample';
import { usePresetText } from '../../hooks/usePresetText';
import { CATALOG_GRID_2COL } from '../panelResponsive.presets';
import { BAR_WIDGETS_OFF, barToneColors, useFontsOf } from './PresetGroupCatalog';
import { OptionTile } from './OptionTile';
import { SampleScope } from './SampleScope';
import { SampleButton, SampleCard } from './SampleParts';
import type { PeekHandler } from './peek';

interface PersonalityCatalogProps {
    /** O rascunho como a prévia o mostra: cada amostra é a Personalidade aplicada por cima dele, com a paleta dele. */
    draft?: Partial<SarakDesignState>;
    currentMode: 'light' | 'dark';
    onSelect: (personality: Personality) => void;
    onPeek?: PeekHandler;
}

const PersonalityTile: React.FC<PersonalityCatalogProps & { personality: Personality }> = ({ personality, draft, currentMode, onSelect, onPeek }) => {
    const text = usePresetText();
    const shown = text.preset(personality);
    useFontsOf(personality);
    const miniature = personality.design.navigationStyle === 'topbar' ? 'topbar' : 'sidebar';
    const tokens = { ...BAR_WIDGETS_OFF, ...barToneColors(draft, personality.design, currentMode), ...personality.design } as Partial<SarakDesignState>;
    return (
        <OptionTile name={shown.name} description={shown.description} onApply={() => onSelect(personality)} peekTokens={() => personality.design} onPeek={onPeek}>
            {draft && (
                <div className="flex flex-col gap-2">
                    <BarSample draft={draft as SarakDesignState} mode={currentMode} tokens={tokens} miniature={miniature} />
                    <SampleScope draft={draft} tokens={tokens} mode={currentMode} slotClassName="min-h-24">
                        <div className="flex flex-col gap-3 p-2"><SampleCard /><SampleButton state="rest" /></div>
                    </SampleScope>
                </div>
            )}
        </OptionTile>
    );
};

/** As Personalidades: cada opção mostra a estrutura inteira aplicada à paleta que o rascunho já tem. */
export const PersonalityCatalog: React.FC<PersonalityCatalogProps> = (props) => {
    const text = usePresetText();
    return (
        <div data-preset-group="personalities" className="flex flex-col gap-3">
            <p className="text-[length:var(--sarak-type-scale-caption,12px)] text-[var(--theme-muted)]">{text.ui('personalityHint')}</p>
            <div className={`grid ${CATALOG_GRID_2COL} gap-6`}>
                {PERSONALITIES.map((personality) => <PersonalityTile key={personality.id} {...props} personality={personality} />)}
            </div>
        </div>
    );
};
