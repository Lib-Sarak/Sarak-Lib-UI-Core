import { describe, it, expect } from 'vitest';
import { slugifyThemeId, buildThemeExportPayload } from '../exportTheme';
import type { SarakDesignState } from '../../../../../core/Provider/types';

describe('slugifyThemeId', () => {
    it('converte um nome livre em kebab-case sem acentos', () => {
        expect(slugifyThemeId('Meu Tema Incrível!')).toBe('meu-tema-incrivel');
    });

    it('cai num fallback estável quando o nome fica vazio após a normalização', () => {
        expect(slugifyThemeId('   ')).toBe('meu-tema');
        expect(slugifyThemeId('!!!')).toBe('meu-tema');
    });
});

describe('buildThemeExportPayload (Spec 44 §2.4 — exportar, não persistir em servidor)', () => {
    it('monta o mesmo formato { id, name, design } dos temas embutidos (ThemePreset)', () => {
        const design = { mode: 'dark', primaryColor: '#00f2ff' } as unknown as SarakDesignState;
        const payload = buildThemeExportPayload(design, 'Meu Tema Corporativo');

        expect(payload).toEqual({
            id: 'meu-tema-corporativo',
            name: 'Meu Tema Corporativo',
            design
        });
    });

    it('usa um nome-fallback quando o nome vem vazio', () => {
        const design = {} as SarakDesignState;
        const payload = buildThemeExportPayload(design, '   ');
        expect(payload.name).toBe('Meu Novo Tema');
    });
});
