import { describe, expect, it } from 'vitest';
import { CHROME_WIDGET_POSITION_TOKEN_IDS } from '../../../schema/preferences';
import { SARAK_GLOBAL_THEMES } from '../index';

describe('composição dos temas distribuídos', () => {
    it('não declara posição de widgets nem oculta a busca da barra', () => {
        SARAK_GLOBAL_THEMES.forEach((theme) => {
            Object.values(CHROME_WIDGET_POSITION_TOKEN_IDS).forEach((tokenId) => {
                expect(theme.design, `${theme.id}.${tokenId}`).not.toHaveProperty(tokenId);
            });
            expect(theme.design.searchPositionSidebar, theme.id).not.toBe('hidden');
        });
    });
});
