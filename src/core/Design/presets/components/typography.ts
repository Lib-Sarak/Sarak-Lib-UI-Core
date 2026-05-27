import { ComponentPreset } from './cards';
import { THEME_FONTS } from '../../schema/typography';

export const TYPOGRAPHY_PRESETS: ComponentPreset[] = THEME_FONTS.map(font => ({
    id: `typo-${font.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: font.name,
    description: `Preset de tipografia focado na família ${font.category}.`,
    design: {
        headingFont: font.value,
        bodyFont: font.value,
        monoFont: font.value,
        h1Size: 48,
        h1Weight: '800',
        h1LineHeight: 1.1,
        h1LetterSpacing: -1,
        bodyWeight: '400',
        bodyLineHeight: 1.6
    }
}));
