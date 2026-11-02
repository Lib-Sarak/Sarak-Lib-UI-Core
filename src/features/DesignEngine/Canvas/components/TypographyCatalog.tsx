import React, { useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { TYPOGRAPHY_PRESETS } from '../../../../core/Design/presets/components/typography';
import { ComponentPreset } from '../../../../core/Design/presets/components/cards';
import { CATALOG_GRID_2COL } from '../panelResponsive.presets';
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
    return (
        // Container query (plan-35): reage ao `@container` de `PresetsCatalog.tsx`.
        <div className={`grid ${CATALOG_GRID_2COL} gap-6`}>
            {TYPOGRAPHY_PRESETS.map((preset, i) => (
                <TypographyPresetPreview key={preset.id} preset={preset} index={i} onPeek={onPeek} onApply={() => onApplyPreset(preset.design, true)} />
            ))}
        </div>
    );
};

/** O Aa grande e a linha de letras que mais distinguem uma fonte da outra (Gg, Qq, Rr e os algarismos): a frase em português sozinha deixa Inter e Outfit parecidas. */
const FONT_SPECIMEN = 'Aa';
const FONT_GLYPHS = 'Gg Qq Rr 0123';

const TypographyPresetPreview = ({ preset, index, onApply, onPeek }: { preset: ComponentPreset, index: number, onApply: () => void, onPeek?: PeekHandler }) => {
    const text = useLibraryText();
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
            transition={{ delay: index * 0.1 }}
            onClick={onApply}
            {...peek}
            className="group flex flex-col text-left rounded-2xl border border-theme-border overflow-hidden sarak-card hover:border-theme-primary hover:shadow-[0_10px_40px_-10px_rgba(var(--theme-primary-rgb),0.1)] transition-all duration-[var(--sarak-motion-dur-normal,0.3s)]"
        >
            <div className="min-h-56 w-full relative p-8 flex flex-col justify-end gap-2 bg-[var(--color-theme-bg,#06080d)] text-theme-text overflow-hidden">
                <div className="flex items-end gap-4">
                    <span data-testid="font-sample-specimen" aria-hidden="true" className="text-7xl leading-none font-bold text-theme-primary" style={{ fontFamily: headingFont }}>{FONT_SPECIMEN}</span>
                    <span data-testid="font-sample-title" className="text-3xl leading-tight font-bold" style={{ fontFamily: headingFont }}>{text('fontSampleTitle')}</span>
                </div>
                <p data-testid="font-sample-glyphs" className="text-xl tracking-wider" style={{ fontFamily: bodyFont }}>{FONT_GLYPHS}</p>
                <p data-testid="font-sample-body" className="text-base text-theme-text/90" style={{ fontFamily: bodyFont }}>{text('fontSamplePhrase')}</p>
                <p className="text-sm text-theme-text/60" style={{ fontFamily: bodyFont }}>{text('fontSampleNumber')}</p>
            </div>

            <div className="p-4 bg-theme-sidebar">
                <h3 className="text-sm font-bold text-theme-text">{preset.name}</h3>
                <p className="text-xs text-theme-muted mt-1">{preset.description}</p>
            </div>
        </motion.button>
    );
};
