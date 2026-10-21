import { describe, expect, it } from 'vitest';
import { toThemeCatalogEntry } from '../catalog';

describe('toThemeCatalogEntry — a entrada leve de um tema', () => {
    const dark = { id: 'meu', name: 'Meu', description: 'd', design: { mode: 'dark', primaryColor: '#111111', colorBgBody: '#000000', textColorMaster: '#ffffff' } };

    it('lê nome, descrição e modo nativo; sem contraparte, a oposta é sintetizada', () => {
        const entry = toThemeCatalogEntry(dark);
        expect(entry).toMatchObject({ id: 'meu', name: 'Meu', description: 'd', mode: 'dark', hasContraparte: false });
        expect(entry.swatch).toEqual({ primaryColor: '#111111', colorBgBody: '#000000', textColorMaster: '#ffffff' });
        expect(entry.swatchOpposite.colorBgBody).not.toBe('#000000');
    });

    it('com contraparte autorada, a amostra do modo oposto é a dela', () => {
        const entry = toThemeCatalogEntry({ ...dark, contraparte: { colorBgBody: '#fafafa', textColorMaster: '#101010' } });
        expect(entry.hasContraparte).toBe(true);
        expect(entry.swatchOpposite.colorBgBody).toBe('#fafafa');
        expect(entry.swatchOpposite.textColorMaster).toBe('#101010');
    });

    it('tema sem modo declarado é escuro (o padrão do schema); sem nome, cai no id', () => {
        const entry = toThemeCatalogEntry({ id: 'x', design: {} });
        expect(entry.mode).toBe('dark');
        expect(entry.name).toBe('x');
    });
});
