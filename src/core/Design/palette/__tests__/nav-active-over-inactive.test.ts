// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { evaluatePair } from '../../../../../gates/scripts/audit/verify_contrast';
import { sarakGetDefaultDesignState } from '../../master-map';
import { SARAK_PALETTE_PRESETS } from '../presets';
import { resolvePalette } from '../resolve';
import type { SarakPaletteMode } from '../types';

const MODES: SarakPaletteMode[] = ['light', 'dark'];
const MIN_TEXT_CONTRAST = 4.5;
/** Cada tom de barra de fundo claro, o único em que o item ativo é a cor de ênfase global (nos contrastantes é o texto do hover). */
const TONES = ['neutral', 'surface'] as const;
/** Os cálculos de todo o catálogo nos dois modos e dois tons cabem mal nos 5 s padrão. */
const TIMEOUT_MS = 30_000;

const ratioOf = (design: Record<string, unknown>, fg: string, bgChain: string[]): number => {
    const result = evaluatePair({ fg, bgChain, min: MIN_TEXT_CONTRAST }, design);
    if (result.pulado) throw new Error(`par pulado: ${fg} → ${bgChain.join(' → ')}: ${result.motivo}`);
    return result.ratio;
};

describe('barra lateral — o item ativo é o texto mais legível da lista', () => {
    it('nas paletas prontas, nos dois modos e tons, o ativo passa de 4,5:1 e não fica abaixo do inativo', () => {
        Object.entries(SARAK_PALETTE_PRESETS).forEach(([id, preset]) => MODES.forEach((mode) => TONES.forEach((tone) => {
            const colors = resolvePalette(preset, mode, { sidebarTone: tone, topbarTone: tone });
            const design = { ...sarakGetDefaultDesignState(), ...colors } as Record<string, unknown>;
            const active = ratioOf(design, 'navItemActiveColor', ['sidebarActiveColor', 'sidebarColor', 'colorBgBody']);
            const inactive = ratioOf(design, 'sidebarItemTextColor', ['sidebarColor', 'colorBgBody']);
            const label = `${id} ${mode} ${tone}: ativo ${active.toFixed(2)} × inativo ${inactive.toFixed(2)}`;
            expect(active, label).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
            expect(active + 1e-9, label).toBeGreaterThanOrEqual(inactive);
        })));
    }, TIMEOUT_MS);

    it('o inativo continua legível (4,5:1) e menos contrastante que o texto do corpo', () => {
        Object.entries(SARAK_PALETTE_PRESETS).forEach(([id, preset]) => MODES.forEach((mode) => {
            const design = { ...sarakGetDefaultDesignState(), ...resolvePalette(preset, mode) } as Record<string, unknown>;
            const inactive = ratioOf(design, 'sidebarItemTextColor', ['sidebarColor', 'colorBgBody']);
            expect(inactive, `${id} ${mode}`).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
            expect(inactive, `${id} ${mode}`).toBeLessThan(ratioOf(design, 'textColorMaster', ['sidebarColor', 'colorBgBody']));
        }));
    }, TIMEOUT_MS);
});
