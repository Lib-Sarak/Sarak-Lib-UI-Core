import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { SARAK_ALL_THEMES } from '../all';
import { SARAK_THEME_CATALOG } from '../catalog.generated';
import { SARAK_THEME_LOADERS } from '../loaders';
import { SARAK_BOOT_THEMES } from '../boot';
import { SARAK_DEFAULT_THEME_ID, SARAK_THEME_PRESET_IDS } from '../index';
import { toThemeCatalogEntry } from '../catalog';

const THEMES_DIR = path.resolve(__dirname, '..');

describe('catálogo embarcado — id ↔ arquivo ↔ loader ↔ all.ts ↔ catálogo leve', () => {
    it('all.ts lista exatamente os ids de SARAK_THEME_PRESET_IDS, na mesma ordem', () => {
        expect(SARAK_ALL_THEMES.map((theme) => theme.id)).toEqual([...SARAK_THEME_PRESET_IDS]);
    });

    it('todo id tem arquivo <id>.ts em themes/', () => {
        SARAK_THEME_PRESET_IDS.forEach((id) => {
            expect(fs.existsSync(path.join(THEMES_DIR, `${id}.ts`)), id).toBe(true);
        });
    });

    it('todo tema, exceto o padrão, tem loader — e o loader devolve o MESMO tema de all.ts', async () => {
        const lazy = SARAK_THEME_PRESET_IDS.filter((id) => id !== SARAK_DEFAULT_THEME_ID);
        expect(Object.keys(SARAK_THEME_LOADERS).sort()).toEqual([...lazy].sort());
        for (const id of lazy) {
            const loaded = await SARAK_THEME_LOADERS[id as keyof typeof SARAK_THEME_LOADERS]();
            expect(loaded).toBe(SARAK_ALL_THEMES.find((theme) => theme.id === id));
        }
    });

    it('o boot leva só o tema padrão', () => {
        expect(SARAK_BOOT_THEMES.map((theme) => theme.id)).toEqual([SARAK_DEFAULT_THEME_ID]);
    });

    it('o tema padrão é o sarak-sovereign e não é um id inexistente', () => {
        expect(SARAK_DEFAULT_THEME_ID).toBe('sarak-sovereign');
        expect(SARAK_THEME_PRESET_IDS).toContain(SARAK_DEFAULT_THEME_ID);
        expect(SARAK_THEME_PRESET_IDS).not.toContain('classic');
    });

    it('o catálogo leve é exatamente o que o gerador produziria a partir dos temas (sem drift)', () => {
        expect(SARAK_THEME_CATALOG).toEqual(SARAK_ALL_THEMES.map((theme) => toThemeCatalogEntry(theme)));
    });

    it('cada entrada traz a amostra de cor dos DOIS modos', () => {
        SARAK_THEME_CATALOG.forEach((entry) => {
            ['swatch', 'swatchOpposite'].forEach((key) => {
                const swatch = entry[key as 'swatch' | 'swatchOpposite'];
                expect(swatch.primaryColor, `${entry.id}.${key}.primaryColor`).toBeTruthy();
                expect(swatch.colorBgBody, `${entry.id}.${key}.colorBgBody`).toBeTruthy();
                expect(swatch.textColorMaster, `${entry.id}.${key}.textColorMaster`).toBeTruthy();
            });
        });
    });

    it('trava de peso: o catálogo leve não carrega o design (só metadado e amostra)', () => {
        SARAK_THEME_CATALOG.forEach((entry) => {
            expect(Object.keys(entry).sort()).toEqual(
                ['description', 'hasContraparte', 'id', 'mode', 'name', 'swatch', 'swatchOpposite'],
            );
        });
    });
});
