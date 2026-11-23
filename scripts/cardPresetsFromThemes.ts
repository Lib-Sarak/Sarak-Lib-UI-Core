/**
 * O preset de card de cada tema embarcado, DERIVADO do tema (nunca transcrito): os tokens de card que o tema declara, sem cor.
 *
 * Fica em `scripts/` porque só o gerador e o teste o usam: importa o mapa mestre e o tipo do token, que não entram no boot.
 * O que sai é gravado em `cardsThemes.generated.ts` por `generate-theme-card-presets.ts`.
 */
import { MASTER_DESIGN_MAP, sarakGetAllDesignTokens } from '../src/core/Design/master-map';
import type { SarakThemePreset } from '../src/core/Design/presets/themes';

/** As áreas de token que um preset de card pode escrever: as mesmas que o grupo `cards` do registro declara. */
export const CARD_PRESET_AREAS: readonly string[] = ['cards', 'cardTitle', 'cardAction'];

/** Prefixo do id: `card-theme-<id do tema>`. O id do tema nunca muda (`SARAK_THEME_PRESET_IDS`), então o do preset também não. */
export const THEME_CARD_PRESET_PREFIX = 'card-theme-';

/** Cor escrita à mão num valor de texto (hex, rgb, hsl, oklch): preset de estrutura não escreve cor. */
const COLOR_LITERAL = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\(/i;

export interface GeneratedCardPreset {
    id: string;
    name: string;
    description: string;
    design: Record<string, unknown>;
}

const colorTokenIds = (): ReadonlySet<string> =>
    new Set(sarakGetAllDesignTokens().filter((token) => token.type === 'color').map((token) => token.id));

const cardTokenIds = (): readonly string[] =>
    MASTER_DESIGN_MAP.components.filter((schema) => CARD_PRESET_AREAS.includes(schema.id)).flatMap((schema) => schema.tokens.map((token) => token.id));

/** O que o tema declara de card, na ordem do schema, menos a cor (token de cor ou valor de texto com cor literal). */
export const themeCardDesign = (theme: SarakThemePreset): Record<string, unknown> => {
    const colors = colorTokenIds();
    const design = theme.design;
    return Object.fromEntries(cardTokenIds()
        .filter((id) => id in design && design[id] !== undefined && !colors.has(id))
        .filter((id) => !(typeof design[id] === 'string' && COLOR_LITERAL.test(design[id] as string)))
        .map((id) => [id, design[id]]));
};

export const buildThemeCardPreset = (theme: SarakThemePreset): GeneratedCardPreset => ({
    id: `${THEME_CARD_PRESET_PREFIX}${theme.id}`,
    name: theme.name,
    description: `O card do tema ${theme.name}: forma, borda, sombra, textura e respiro que o tema declara.`,
    design: themeCardDesign(theme),
});
