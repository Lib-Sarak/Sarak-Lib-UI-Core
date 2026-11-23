// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { toggleKeepPalette } from '../keepPalette';
import { SARAK_ALL_THEMES } from '../../../../core/Design/presets/themes/all';
import { composeThemeDesign } from '../../../../core/Design/presets/themes/compose';
import { resolveThemeForMode } from '../../../../core/Design/presets/themes/color-engine';
import { PALETTE_ROLE_MAP } from '../../../../core/Design/palette/role-map';
import { resolveChosenPalette } from '../../../../core/Design/palette/resolve';
import type { SarakDesignState } from '../../../../core/Provider/types';
import type { SarakTokenValue } from '../../../../core/Design/types';

type DesignRecord = Record<string, unknown>;

const CHOSEN = 'custom:triadic:#d11a5f';
const ROLE_IDS = Object.keys(PALETTE_ROLE_MAP);

const declares = (theme: (typeof SARAK_ALL_THEMES)[number]): boolean =>
    ROLE_IDS.some((id) => id in (theme.design as DesignRecord));

const theme = SARAK_ALL_THEMES.find(declares)!;
const entry = { design: theme.design as Record<string, SarakTokenValue>, contraparte: theme.contraparte };
const mode = theme.design.mode === 'light' ? 'light' : 'dark';
const themed = (): DesignRecord => composeThemeDesign(resolveThemeForMode(entry, mode) as DesignRecord) as unknown as DesignRecord;
const asDesign = (record: DesignRecord): SarakDesignState => record as unknown as SarakDesignState;

describe('toggleKeepPalette — o rascunho do painel', () => {
    it('ligar põe a paleta vigente por cima das cores que o tema declara; o resto não muda', () => {
        const base: DesignRecord = { ...themed(), colorPalette: CHOSEN };
        const declared = ROLE_IDS.find((id) => id in (theme.design as DesignRecord))!;

        const next = toggleKeepPalette(null, asDesign(base), true, { theme: entry }) as unknown as DesignRecord;

        expect(next.keepPalette).toBe(true);
        expect(next.colorPalette).toBe(CHOSEN);
        const tones = { sidebarTone: next.sidebarTone, topbarTone: next.topbarTone };
        expect(next[declared]).toBe(resolveChosenPalette(CHOSEN, mode, tones)[declared]);
        expect(next.cardBorderRadius).toBe(base.cardBorderRadius);
    });

    it('desligar devolve a paleta e as cores do tema atual, e deixa o resto do rascunho', () => {
        const base = { ...themed(), colorPalette: CHOSEN, cardBorderRadius: 77 };
        const on = toggleKeepPalette(asDesign(base), asDesign(base), true, { theme: entry });

        const off = toggleKeepPalette(on, asDesign(base), false, { theme: entry }) as unknown as DesignRecord;

        expect(off.keepPalette).toBe(false);
        expect(off.colorPalette).toBe(theme.design.colorPalette);
        const declared = ROLE_IDS.filter((id) => id in (theme.design as DesignRecord));
        declared.forEach((id) => expect(off[id], id).toBe((theme.design as DesignRecord)[id]));
        expect(off.cardBorderRadius).toBe(77);
    });

    it('já no estado pedido, devolve o rascunho que recebeu (nada a regravar)', () => {
        const base = asDesign(themed());
        expect(toggleKeepPalette(null, base, false, { theme: entry })).toBeNull();
        const on = toggleKeepPalette(null, base, true, { theme: entry });
        expect(toggleKeepPalette(on, base, true, { theme: entry })).toBe(on);
    });

    it('sem tema em memória, desligar só abaixa o interruptor', () => {
        const base = { ...themed(), keepPalette: true, colorPalette: CHOSEN };
        const off = toggleKeepPalette(asDesign(base), asDesign(base), false, { theme: undefined }) as unknown as DesignRecord;
        expect(off).toEqual({ ...base, keepPalette: false });
    });
});
