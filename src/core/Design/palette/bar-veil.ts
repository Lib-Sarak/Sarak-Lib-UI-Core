import { parseToRgba } from '../../Provider/utils/color-engine';
import { pickOnColor } from '../../Provider/utils/on-color';
import type { PalettePlan } from './tone-plan';

type PaletteColors = Record<string, string>;

const BAR_VEIL_FUNCTIONS = ['HoverColor', 'ActiveColor'] as const;

/**
 * Num papel contrastante o hover e o ativo da barra são um véu translúcido sobre o fundo dela, calculado para o fundo
 * que a paleta imagina. Quando o host ou o tema fixam a cor da barra, o véu nasce do fundo que vale: o texto de maior
 * contraste sobre ele, na opacidade do papel — assim a barra clara ganha véu escuro e a escura, véu claro.
 */
export const deriveBarVeils = (
    effective: PaletteColors,
    overrides: PaletteColors,
    declared: Record<string, unknown>,
    plan: PalettePlan,
): PaletteColors => {
    const veils: PaletteColors = {};
    (plan.contrastingBars ?? []).forEach((bar) => {
        if (!(`${bar}Color` in overrides)) return;
        const base = parseToRgba(effective[`${bar}Color`]);
        if (base.a < 0.999) return;
        const on = parseToRgba(pickOnColor(effective[`${bar}Color`]));
        BAR_VEIL_FUNCTIONS.forEach((fn) => {
            const tokenId = `${bar}${fn}`;
            const alpha = plan.roles[tokenId]?.alpha;
            if (tokenId in declared || alpha === undefined) return;
            veils[tokenId] = `rgba(${Math.round(on.r)}, ${Math.round(on.g)}, ${Math.round(on.b)}, ${alpha})`;
        });
    });
    return veils;
};
