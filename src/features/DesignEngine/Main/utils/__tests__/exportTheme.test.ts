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
    it('monta o formato { id, name, design } e preserva os valores customizados', () => {
        const design = { mode: 'dark', primaryColor: '#00f2ff' } as unknown as SarakDesignState;
        const payload = buildThemeExportPayload(design, 'Meu Tema Corporativo');

        expect(payload.id).toBe('meu-tema-corporativo');
        expect(payload.name).toBe('Meu Tema Corporativo');
        // O export é COMPLETO (Spec 40.1 L6): inclui os valores customizados sobre TODOS os
        // tokens default — não mais só o subconjunto passado.
        expect(payload.design).toMatchObject({ mode: 'dark', primaryColor: '#00f2ff' });
        expect(Object.keys(payload.design).length).toBeGreaterThan(50);
        // Um eixo não informado (fonte) vem preenchido pelo default, nunca ausente.
        expect((payload.design as Record<string, unknown>).bodyFont).toBeDefined();
    });

    it('usa um nome-fallback quando o nome vem vazio', () => {
        const design = {} as SarakDesignState;
        const payload = buildThemeExportPayload(design, '   ');
        expect(payload.name).toBe('Meu Novo Tema');
    });
});
