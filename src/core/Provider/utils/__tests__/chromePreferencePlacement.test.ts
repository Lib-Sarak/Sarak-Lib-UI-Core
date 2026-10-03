import { describe, it, expect } from 'vitest';
import { splitPreferencesByPlacement } from '../chromePreferencePlacement';
import { PREFERENCE_POSITION_TOKEN_IDS } from '../../preferencesTypes';

describe('splitPreferencesByPlacement', () => {
    it('padrão de fábrica (chave ausente): colorMode e navCollapsed pinned, e o ⚙ NÃO nasce — a barra de hoje', () => {
        const result = splitPreferencesByPlacement(undefined);
        expect(result.pinned.sort()).toEqual(['colorMode', 'navCollapsed'].sort());
        expect(result.offered.sort()).toEqual(['colorMode', 'navCollapsed'].sort());
        expect(result.menu).toEqual([]);
    });

    it('todas em off: nada oferecido, nada fixado, ⚙ vazio', () => {
        const design = {
            [PREFERENCE_POSITION_TOKEN_IDS.colorMode]: 'off',
            [PREFERENCE_POSITION_TOKEN_IDS.fontSize]: 'off',
            [PREFERENCE_POSITION_TOKEN_IDS.navigationStyle]: 'off',
            [PREFERENCE_POSITION_TOKEN_IDS.navCollapsed]: 'off',
            [PREFERENCE_POSITION_TOKEN_IDS.language]: 'off',
        };
        expect(splitPreferencesByPlacement(design)).toEqual({ pinned: [], offered: [], menu: [] });
    });

    it("uma preferência 'menu' faz o ⚙ nascer com TODAS as oferecidas, fixadas inclusive", () => {
        const design = { [PREFERENCE_POSITION_TOKEN_IDS.fontSize]: 'menu' };
        const result = splitPreferencesByPlacement(design);
        // fontSize=menu + os dois pinned de fábrica (colorMode, navCollapsed)
        expect(result.menu.sort()).toEqual(['colorMode', 'fontSize', 'navCollapsed'].sort());
        expect(result.menu).toContain('colorMode'); // fixada também aparece no menu
        expect(result.pinned).not.toContain('fontSize');
    });

    it("só posições 'pinned' (nenhuma 'menu'): offered não vazio, mas menu (⚙) fica vazio", () => {
        const design = { [PREFERENCE_POSITION_TOKEN_IDS.language]: 'pinned' };
        const result = splitPreferencesByPlacement(design);
        expect(result.pinned).toContain('language');
        expect(result.offered).toContain('language');
        expect(result.menu).toEqual([]);
    });

    it('teto de código (widgets.themeToggle=false) vence a posição do tema, mesmo pinned', () => {
        const design = { [PREFERENCE_POSITION_TOKEN_IDS.colorMode]: 'pinned' };
        const result = splitPreferencesByPlacement(design, { colorMode: false });
        expect(result.pinned).not.toContain('colorMode');
        expect(result.offered).not.toContain('colorMode');
    });

    it('teto de código não atinge preferência sem teto (fontSize ignora ceilings de colorMode/navCollapsed)', () => {
        const design = { [PREFERENCE_POSITION_TOKEN_IDS.fontSize]: 'pinned' };
        const result = splitPreferencesByPlacement(design, { colorMode: false, navCollapsed: false });
        expect(result.pinned).toContain('fontSize');
    });

    it('cada uma das 5 preferências respeita as 3 posições, isoladamente', () => {
        const ids = Object.keys(PREFERENCE_POSITION_TOKEN_IDS) as Array<keyof typeof PREFERENCE_POSITION_TOKEN_IDS>;
        ids.forEach((id) => {
            const tokenId = PREFERENCE_POSITION_TOKEN_IDS[id];
            expect(splitPreferencesByPlacement({ [tokenId]: 'off' }).offered).not.toContain(id);
            expect(splitPreferencesByPlacement({ [tokenId]: 'menu' }).menu).toContain(id);
            expect(splitPreferencesByPlacement({ [tokenId]: 'pinned' }).pinned).toContain(id);
        });
    });
});
