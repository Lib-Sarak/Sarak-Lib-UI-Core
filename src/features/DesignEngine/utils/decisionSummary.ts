import type { DecisionId } from './decisions';
import type { LibraryTextFn } from '../../../core/i18n/useLibraryText';
import type { LibraryTextKey } from '../../../core/i18n/catalog';
import { presetLabel, presetTextKey } from '../Main/utils/paletteDraft';

type DraftRecord = Readonly<Record<string, unknown>>;

/** Um token responsivo (`{ mob, tab, desk }`) resume-se pelo valor do desktop. */
const asText = (value: unknown): string => {
    if (typeof value === 'string' || typeof value === 'number') return String(value);
    if (value !== null && typeof value === 'object') {
        const responsive = value as Record<string, unknown>;
        return asText(responsive.desk ?? responsive.tab ?? responsive.mob);
    }
    return '';
};

/** `'Outfit', sans-serif` → `Outfit`: o nome da família que o usuário escolheu. */
export const fontFamilyName = (value: unknown): string => asText(value).split(',')[0].replace(/['"]/g, '').trim();

const joinParts = (parts: readonly string[], separator = ' · '): string => parts.filter(Boolean).join(separator);

/** O nome da paleta do rascunho: a pronta pelo catálogo de textos, a criada pelo usuário como "Personalizada". */
export const paletteName = (draft: DraftRecord, text: LibraryTextFn): string => {
    const value = asText(draft.colorPalette);
    if (value === '') return asText(draft.primaryColor);
    if (value.startsWith('custom:')) return text('paletteCustomName');
    const key = presetTextKey(value);
    return key ? text(key) : presetLabel(value);
};

/** O nome legível de cada valor que a lista mostra; o valor que o catálogo de textos não conhece some da linha, nunca vira id. */
const VALUE_TEXT: Record<string, Record<string, LibraryTextKey>> = {
    navigationStyle: { sidebar: 'summaryNavSidebar', topbar: 'summaryNavTopbar' },
    layoutDensity: { compact: 'summaryDensityCompact', comfortable: 'summaryDensityComfortable', spacious: 'summaryDensitySpacious' },
    surfaceMaterial: { frosted: 'summaryMaterialFrosted', sleek: 'summaryMaterialSleek', industrial: 'summaryMaterialIndustrial', organic: 'summaryMaterialOrganic' },
    btnStyleType: {
        matte: 'summaryButtonMatte', neon: 'summaryButtonNeon', frosted: 'summaryButtonFrosted',
        borderline: 'summaryButtonBorderline', cyberpunk: 'summaryButtonCyberpunk', neumorphism: 'summaryButtonNeumorphism',
    },
    inputBorderType: { solid: 'summaryFieldSolid', dashed: 'summaryFieldDashed', none: 'summaryFieldNone', underline: 'summaryFieldUnderline' },
};

const valueName = (tokenId: string, draft: DraftRecord, text: LibraryTextFn): string => {
    const key = VALUE_TEXT[tokenId]?.[asText(draft[tokenId])];
    return key ? text(key) : '';
};

const SUMMARIES: Record<DecisionId, (draft: DraftRecord, text: LibraryTextFn) => string> = {
    theme: () => '',
    colors: paletteName,
    fonts: (draft) => joinParts([...new Set([fontFamilyName(draft.headingFont), fontFamilyName(draft.bodyFont)])], ' + '),
    shape: (draft, text) => joinParts([valueName('surfaceMaterial', draft, text), valueName('layoutDensity', draft, text)]),
    components: (draft, text) => {
        const button = valueName('btnStyleType', draft, text);
        const field = valueName('inputBorderType', draft, text);
        return button && field ? text('summaryComponents', { button, field }) : button || field;
    },
    layout: (draft, text) => {
        const style = valueName('navigationStyle', draft, text);
        return style ? text('summaryLayout', { style }) : '';
    },
    advanced: () => '',
};

/** A linha de valor que a lista mostra sob cada decisão: o que está valendo no rascunho agora. */
export const summarizeDecision = (id: DecisionId, draft: DraftRecord, text: LibraryTextFn): string => SUMMARIES[id](draft, text);
