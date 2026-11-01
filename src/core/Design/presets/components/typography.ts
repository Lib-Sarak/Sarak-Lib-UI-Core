import { ComponentPreset } from './cards';
import { THEME_FONTS } from '../../schema/typography';

/** Escolher uma fonte troca só o título e o corpo: mono, tamanho e peso do H1 são decisões do tema. */
export const TYPOGRAPHY_PRESETS: ComponentPreset[] = THEME_FONTS.map(font => ({
    id: `typo-${font.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: font.name,
    description: `Preset de tipografia focado na família ${font.category}.`,
    design: {
        headingFont: font.value,
        bodyFont: font.value
    }
}));
