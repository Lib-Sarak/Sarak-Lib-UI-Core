import React, { useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { getPresetGroup } from '../../../../core/Design/presets/components/registry';
import { THEME_FONTS } from '../../../../core/Design/schema/typography';
import { usePresetText } from '../../hooks/usePresetText';
import { CuratedGrid } from './CuratedGrid';
import { ComponentPreset } from '../../../../core/Design/presets/components/cards';
import { CATALOG_GRID } from '../panelResponsive.presets';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import { useRequestFont } from '../../../../core/Provider/hooks/useRequestFont';
import { useOnFirstVisible } from '../hooks/useOnFirstVisible';
import { usePeekHandlers, type PeekHandler } from './peek';

import { SarakDesignState } from '../../../../core/Provider/types';

interface TypographyCatalogProps {
    onApplyPreset: (presetDesign: Partial<SarakDesignState>, isPartial?: boolean) => void;
    currentMode: string;
    onPeek?: PeekHandler;
}

export const TypographyCatalog: React.FC<TypographyCatalogProps> = ({ onApplyPreset, onPeek }) => {
    const text = usePresetText();
    return (
        // Container query (plan-35): reage ao `@container` de `PresetsCatalog.tsx`.
        <CuratedGrid
            group={getPresetGroup('fonts')!}
            gridClassName={CATALOG_GRID}
            sectionOf={(preset) => {
                const category = THEME_FONTS.find((font) => font.name === preset.name)?.category ?? 'Sans-Serif';
                return { id: category, title: text.fontCategory(category) };
            }}
            renderTile={(preset, index) => (
                <TypographyPresetPreview key={preset.id} preset={preset} index={index} onPeek={onPeek} onApply={() => onApplyPreset(preset.design, true)} />
            )}
        />
    );
};

/** O Aa grande e a linha de letras que mais distinguem uma fonte da outra (Gg, Qq, Rr e os algarismos): a frase em português sozinha deixa Inter e Outfit parecidas. */
const FONT_SPECIMEN = 'Aa';
const FONT_GLYPHS = 'Gg Qq Rr 0123';

const TypographyPresetPreview = ({ preset, index, onApply, onPeek }: { preset: ComponentPreset, index: number, onApply: () => void, onPeek?: PeekHandler }) => {
    const text = useLibraryText();
    const shown = usePresetText().preset(preset);
    const requestFont = useRequestFont();
    const cardRef = useRef<HTMLButtonElement>(null);
    const headingFont = preset.design.headingFont as string | undefined;
    const bodyFont = preset.design.bodyFont as string | undefined;
    const loadFamily = useCallback(() => {
        if (headingFont) requestFont(headingFont);
        if (bodyFont && bodyFont !== headingFont) requestFont(bodyFont);
    }, [requestFont, headingFont, bodyFont]);
    useOnFirstVisible(cardRef, loadFamily);
    const peek = usePeekHandlers(onPeek, () => preset.design);

    return (
        <motion.button
            ref={cardRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={onApply}
            data-option-tile=""
            title={shown.description}
            {...peek}
            className="group flex flex-col text-left overflow-hidden rounded-[var(--sarak-card-radius,10px)] border border-theme-border bg-theme-sidebar hover:border-theme-primary transition-colors duration-[var(--sarak-motion-dur-normal,0.3s)]"
        >
            <div data-option-sample="" className="flex w-full flex-col gap-1 bg-[var(--color-theme-bg,#06080d)] p-2 text-theme-text">
                <div className="flex items-end gap-2">
                    <span data-testid="font-sample-specimen" aria-hidden="true" className="text-4xl leading-none font-bold text-theme-primary" style={{ fontFamily: headingFont }}>{FONT_SPECIMEN}</span>
                    <span data-testid="font-sample-title" className="break-words text-sm leading-tight font-bold" style={{ fontFamily: headingFont }}>{text('fontSampleTitle')}</span>
                </div>
                <p data-testid="font-sample-glyphs" className="break-words text-xs tracking-wider" style={{ fontFamily: bodyFont }}>{FONT_GLYPHS}</p>
                <p data-testid="font-sample-body" className="break-words text-xs leading-snug text-theme-text/90" style={{ fontFamily: bodyFont }}>{text('fontSamplePhrase')}</p>
                <p className="break-words text-xs text-theme-text/60" style={{ fontFamily: bodyFont }}>{text('fontSampleNumber')}</p>
            </div>
            <div className="border-t border-theme-border px-2 py-1.5">
                <h3 className="break-words text-xs font-semibold leading-tight text-theme-text">{shown.name}</h3>
                <p className="sr-only">{shown.description}</p>
            </div>
        </motion.button>
    );
};
