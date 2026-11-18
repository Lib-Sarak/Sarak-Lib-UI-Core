import { describe, it, expect } from 'vitest';
import { composeThemeDesign } from '../compose';
import { sarakGetDefaultDesignState } from '../../../master-map';

const LIST = 'sp-1|Marca|custom:analogous:#2563eb';
const theme = { mode: 'dark', primaryColor: '#ff0000' } as Record<string, unknown>;

describe('composeThemeDesign — as paletas salvas são do sistema, não do tema', () => {
    it('trocar de tema mantém a lista do design anterior', () => {
        expect(composeThemeDesign(theme, { savedPalettes: LIST }).savedPalettes).toBe(LIST);
    });

    it('um tema que traz o padrão do schema (vazio), como todo tema salvo pelo painel, não apaga a lista', () => {
        const saved = { ...sarakGetDefaultDesignState(), ...theme } as Record<string, unknown>;
        expect(saved.savedPalettes).toBe('');
        expect(composeThemeDesign(saved, { savedPalettes: LIST }).savedPalettes).toBe(LIST);
    });

    it('sem lista no design anterior, a do `config` do host vale', () => {
        expect(composeThemeDesign(theme, {}, { savedPalettes: LIST }).savedPalettes).toBe(LIST);
    });

    it('sem lista em lugar nenhum, o padrão (vazio)', () => {
        expect(composeThemeDesign(theme).savedPalettes).toBe('');
    });
});
