import { ComponentPreset } from './cards';
import { THEME_FONTS } from '../../schema/typography';

/** A categoria da fonte, dita em português; o catálogo de textos do painel traduz o resto. */
const CATEGORY_LABEL_PT: Record<string, string> = {
    'Sans-Serif': 'sem serifa',
    Serif: 'com serifa',
    Display: 'de destaque',
    Monospace: 'de espaçamento fixo',
    Handwriting: 'manuscrita',
};

/** Escolher uma fonte troca só o título e o corpo: mono, tamanho e peso do H1 são decisões do tema. */
export const TYPOGRAPHY_PRESETS: ComponentPreset[] = THEME_FONTS.map(font => ({
    id: `typo-${font.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: font.name,
    description: `Fonte ${CATEGORY_LABEL_PT[font.category] ?? font.category}.`,
    design: {
        headingFont: font.value,
        bodyFont: font.value
    }
}));
