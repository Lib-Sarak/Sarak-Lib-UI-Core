import React, { useMemo, useRef } from 'react';
import { PERSONALITIES, type Personality } from '../../../../core/Design/presets/components/personalities';
import type { SarakDesignState } from '../../../../core/Provider/types';
import { usePresetText } from '../../hooks/usePresetText';
import { PERSONALITY_GRID } from '../panelResponsive.presets';
import { BAR_WIDGETS_OFF, barToneColors, useFontsOf } from './PresetGroupCatalog';
import { OptionTile } from './OptionTile';
import { SampleScope } from './SampleScope';
import type { PeekHandler } from './peek';
import { useValueWhileVisible } from '../hooks/useValueWhileVisible';

interface PersonalityCatalogProps {
    /** O rascunho como a prévia o mostra: cada amostra é a Personalidade aplicada por cima dele, com a paleta dele. */
    draft?: Partial<SarakDesignState>;
    currentMode: 'light' | 'dark';
    onSelect: (personality: Personality) => void;
    onPeek?: PeekHandler;
}

/**
 * O quadrado de uma Personalidade: a barra (lateral ou de topo) e dois blocos de conteúdo, só com as variáveis do escopo. Sem
 * texto: o nome está no cartão, e o efeito inteiro aparece na prévia ao espiar.
 */
const PersonalitySwatch: React.FC<{ orientation: 'topbar' | 'sidebar' }> = ({ orientation }) => (
    <div data-testid="personality-swatch" className={`flex h-full w-full ${orientation === 'topbar' ? 'flex-col' : 'flex-row'}`}>
        <div aria-hidden="true" className={`border-[var(--theme-border)] ${orientation === 'topbar' ? 'h-1/4 w-full border-b' : 'h-full w-1/4 border-r'}`} style={{ backgroundColor: 'var(--theme-sidebar, var(--theme-card))' }}>
            <span className="m-1.5 block h-1.5 w-1/2 rounded-full" style={{ backgroundColor: 'var(--theme-primary)' }} />
        </div>
        <div className="flex flex-1 flex-col gap-1.5 p-1.5">
            <div className="sarak-card h-1/2 w-full" />
            <div className="sarak-card h-1/3 w-3/4" />
        </div>
    </div>
);

const PersonalityTile: React.FC<PersonalityCatalogProps & { personality: Personality }> = ({ personality, draft, currentMode, onSelect, onPeek }) => {
    const text = usePresetText();
    const shown = text.preset(personality);
    useFontsOf(personality);
    const orientation = personality.design.navigationStyle === 'topbar' ? 'topbar' : 'sidebar';
    // Fora da área visível a opção guarda o rascunho que mostrou por último: não recalcula a paleta nem os escopos.
    const sampleRef = useRef<HTMLDivElement>(null);
    const shownDraft = useValueWhileVisible(sampleRef, draft);
    const tokens = useMemo(
        () => ({ ...BAR_WIDGETS_OFF, ...barToneColors(shownDraft, personality.design, currentMode), ...personality.design }) as Partial<SarakDesignState>,
        [shownDraft, personality.design, currentMode],
    );
    const sample = useMemo(() => shownDraft && (
        <SampleScope draft={shownDraft} tokens={tokens} mode={currentMode} slotClassName="h-full w-full">
            <PersonalitySwatch orientation={orientation} />
        </SampleScope>
    ), [shownDraft, currentMode, tokens, orientation]);
    return (
        <OptionTile name={shown.name} description={shown.description} sampleShape="square" onApply={() => onSelect(personality)} peekTokens={() => personality.design} onPeek={onPeek}>
            <div ref={sampleRef} className="h-full w-full">{sample}</div>
        </OptionTile>
    );
};

/** As Personalidades: um quadrado pequeno por opção, com o nome; a espiada mostra a estrutura inteira na prévia. */
export const PersonalityCatalog: React.FC<PersonalityCatalogProps> = (props) => {
    const text = usePresetText();
    return (
        <div data-preset-group="personalities" className="flex flex-col gap-3">
            <p className="text-[length:var(--sarak-type-scale-caption,12px)] text-[var(--theme-muted)]">{text.ui('personalityHint')}</p>
            <div className={`grid ${PERSONALITY_GRID} gap-3`}>
                {PERSONALITIES.map((personality) => <PersonalityTile key={personality.id} {...props} personality={personality} />)}
            </div>
        </div>
    );
};
