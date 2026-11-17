// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { resolvePalette } from '../../../../../core/Design/palette/resolve';
import { SARAK_PALETTE_PRESETS } from '../../../../../core/Design/palette/presets';
import type { SarakDesignState } from '../../../../../core/Provider/types';
import { barToneColors } from '../PresetGroupCatalog';

const draft = { colorPalette: 'ciano-violeta' } as unknown as Partial<SarakDesignState>;

describe('barToneColors — o que a amostra recalcula com o papel da opção', () => {
    it('com o tom da topbar em surface, a amostra leva o texto do item ativo que a lib emite para esse tom', () => {
        const colors = barToneColors(draft, { topbarTone: 'surface' } as Partial<SarakDesignState>, 'dark') as Record<string, string>;
        const emitted = resolvePalette(SARAK_PALETTE_PRESETS['ciano-violeta'], 'dark', { topbarTone: 'surface' });
        expect(colors.navItemActiveColor).toBe(emitted.navItemActiveColor);
        expect(colors.topbarColor).toBe(emitted.topbarColor);
    });

    it('não leva o resto da paleta: só as chaves da barra e as de navegação', () => {
        const colors = barToneColors(draft, { topbarTone: 'surface' } as Partial<SarakDesignState>, 'dark');
        expect(Object.keys(colors).every((id) => /^(sidebar|topbar|nav)/.test(id))).toBe(true);
    });

    it('com o fundo em degradê o texto do ativo é o que passa nas duas paradas, não o do fundo liso', () => {
        const solid = barToneColors(draft, { sidebarTone: 'surface' } as Partial<SarakDesignState>, 'dark') as Record<string, string>;
        const gradient = barToneColors(draft, { sidebarTone: 'surface', sidebarBackgroundStyle: 'gradient' } as Partial<SarakDesignState>, 'dark') as Record<string, string>;
        expect(gradient.navItemActiveColor).not.toBe(solid.navItemActiveColor);
    });
});
