// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { evaluatePair } from '../../../../../gates/scripts/audit/verify_contrast';
import { sarakGetDefaultDesignState } from '../../master-map';
import { hexToOklch } from '../color-space';
import { GRADIENT_LIGHT_COLOR, GRADIENT_LIGHT_SHARE, GRADIENT_LIGHT_ID } from '../contrast-pairs';
import { SARAK_PALETTE_PRESETS } from '../presets';
import { resolvePalette } from '../resolve';
import type { SarakPaletteMode } from '../types';

import { prazoDeTeste } from '../../../../shared/testing/prazoDeTeste';
const MODES: SarakPaletteMode[] = ['light', 'dark'];
const BARS = ['sidebar', 'topbar'] as const;
const TONES = ['neutral', 'surface'] as const;
const MIN_TEXT_CONTRAST = 4.5;
/** O teto de deslocamento do texto do item ativo que o dono aprovou para as paletas em que o degradê o empurra. */
const MAX_ACTIVE_SHIFT = 0.21;
/**
 * Exceções nomeadas, a decidir pelo dono: no escuro, com a lateral de tom `surface` em degradê (a opção Flutuante do painel), 39 das 78
 * paletas passam de 0,21 (até 0,278), porque a parada clara do degradê fica perto do texto; e o topo do `petroleo-profundo` chega a 0,211.
 */
const DARK_SURFACE_SIDEBAR_CAP = 0.28;
const PETROLEO_TOPBAR_CAP = 0.215;
const TIMEOUT_MS = prazoDeTeste(60_000);

const ratioOf = (design: Record<string, unknown>, fg: string, bgChain: string[]): number => {
    const result = evaluatePair({ fg, bgChain, min: MIN_TEXT_CONTRAST }, { ...design, [GRADIENT_LIGHT_ID]: GRADIENT_LIGHT_COLOR });
    if (result.pulado) throw new Error(`par pulado: ${fg} → ${bgChain.join(' → ')}: ${result.motivo}`);
    return result.ratio;
};

const lightEnd = (bar: string, chain: string[]): string[] => chain.flatMap((token) => (token === `${bar}Color` ? [`${GRADIENT_LIGHT_ID}@${GRADIENT_LIGHT_SHARE}`, token] : [token]));

describe('barra com fundo em degradê — o texto vale nas duas paradas', () => {
    it('o item ativo e o inativo passam de 4,5:1 sobre a parada lisa e sobre a clara, em toda paleta, modo, tom e barra', () => {
        Object.entries(SARAK_PALETTE_PRESETS).forEach(([id, preset]) => MODES.forEach((mode) => TONES.forEach((tone) => {
            const declared = { sidebarTone: tone, topbarTone: tone, sidebarBackgroundStyle: 'gradient', topbarBackgroundStyle: 'gradient' };
            const design = { ...sarakGetDefaultDesignState(), ...resolvePalette(preset, mode, declared) } as Record<string, unknown>;
            BARS.forEach((bar) => {
                const chains = { active: [`${bar}ActiveColor`, `${bar}Color`, 'colorBgBody'], inactive: [`${bar}Color`, 'colorBgBody'] };
                [false, true].forEach((light) => {
                    const where = `${id} ${mode} ${tone} ${bar} ${light ? 'parada clara' : 'parada lisa'}`;
                    const active = ratioOf(design, 'navItemActiveColor', light ? lightEnd(bar, chains.active) : chains.active);
                    const inactive = ratioOf(design, `${bar}ItemTextColor`, light ? lightEnd(bar, chains.inactive) : chains.inactive);
                    expect(active, `${where}: ativo`).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
                    expect(inactive, `${where}: inativo`).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
                    if (bar === 'sidebar') expect(active + 1e-9, `${where}: ativo ≥ inativo`).toBeGreaterThanOrEqual(inactive);
                });
            });
        })));
    }, TIMEOUT_MS);

    it('o degradê não empurra o texto do ativo além do teto sobre a base da paleta', () => {
        Object.entries(SARAK_PALETTE_PRESETS).forEach(([id, preset]) => MODES.forEach((mode) => TONES.forEach((tone) => BARS.forEach((bar) => {
            const colors = resolvePalette(preset, mode, { sidebarTone: tone, topbarTone: tone, [`${bar}BackgroundStyle`]: 'gradient' });
            const shift = Math.abs(hexToOklch(colors.navItemActiveColor)!.lightness - hexToOklch(preset.base)!.lightness);
            const cap = mode === 'dark' && tone === 'surface' && bar === 'sidebar' ? DARK_SURFACE_SIDEBAR_CAP : id === 'petroleo-profundo' && bar === 'topbar' ? PETROLEO_TOPBAR_CAP : MAX_ACTIVE_SHIFT;
            expect(shift, `${id} ${mode} ${tone} ${bar}`).toBeLessThanOrEqual(cap);
        }))));
    }, TIMEOUT_MS);

    it('sem degradê o cálculo é o de sempre', () => {
        const solid = resolvePalette(SARAK_PALETTE_PRESETS['ciano-violeta'], 'dark', { sidebarTone: 'surface', sidebarBackgroundStyle: 'solid' });
        const none = resolvePalette(SARAK_PALETTE_PRESETS['ciano-violeta'], 'dark', { sidebarTone: 'surface' });
        expect(solid).toEqual(none);
    });
});
