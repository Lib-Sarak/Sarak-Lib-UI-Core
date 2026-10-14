import { describe, expect, it } from 'vitest';
// @ts-expect-error — gate em .mjs sem declaração de tipos
import { findBlindIds, findDistLeaks, findSrcLeaks, readThemeIds, runChecks, staticClosure, staticSpecifiers } from '../check-theme-boot-closure.mjs';

const INDEX_SOURCE = `
export const SARAK_THEME_PRESET_IDS = ['sarak-sovereign', 'cyberpunk-neon', 'golden-hour'] as const;
export const SARAK_DEFAULT_THEME_ID = 'sarak-sovereign' as const satisfies string;
`;

const THEMES = 'src/core/Design/presets/themes';

const graph = (files: Record<string, string>) => (rel: string): string | null => (rel in files ? files[rel] : null);

describe('check-theme-boot-closure — o fecho estático do entry', () => {
    it('lê os ids e o tema padrão do FONTE de themes/index.ts', () => {
        expect(readThemeIds(INDEX_SOURCE)).toEqual({
            ids: ['sarak-sovereign', 'cyberpunk-neon', 'golden-hour'],
            defaultId: 'sarak-sovereign',
        });
    });

    it('não segue `import type`, import só de tipos nem `import()`', () => {
        const specs = staticSpecifiers(`
            import type { A } from './a';
            import { type B } from './b';
            import { c } from './c';
            export type { D } from './d';
            export { e } from './e';
            const lazy = () => import('./lazy');
        `);
        expect(specs).toEqual(['./c', './e']);
    });

    it('passa quando só o tema padrão está no fecho; o tema por import() fica de fora', () => {
        const read = graph({
            'src/index.ts': "export { SARAK_BOOT_THEMES } from './core/Design/presets/themes/boot';",
            [`${THEMES}/boot.ts`]: "import { sarakSovereignTheme } from './sarak-sovereign';",
            [`${THEMES}/sarak-sovereign.ts`]: "import type { SarakThemePreset } from './index';",
            [`${THEMES}/loaders.ts`]: "export const L = { a: () => import('./cyberpunk-neon') };",
            [`${THEMES}/cyberpunk-neon.ts`]: 'export const t = 1;',
        });
        const closure = staticClosure('src/index.ts', read);
        expect(findSrcLeaks(closure, ['sarak-sovereign', 'cyberpunk-neon'], 'sarak-sovereign')).toEqual([]);
    });

    it('MUTAÇÃO: importar um tema no barril faz falhar', () => {
        const read = graph({
            'src/index.ts': "export { cyberpunkneonTheme } from './core/Design/presets/themes/cyberpunk-neon';",
            [`${THEMES}/cyberpunk-neon.ts`]: 'export const cyberpunkneonTheme = 1;',
        });
        const closure = staticClosure('src/index.ts', read);
        expect(findSrcLeaks(closure, ['sarak-sovereign', 'cyberpunk-neon'], 'sarak-sovereign'))
            .toEqual([`${THEMES}/cyberpunk-neon.ts`]);
    });

    it('MUTAÇÃO: alcançar all.ts por qualquer caminho estático faz falhar', () => {
        const read = graph({
            'src/index.ts': "import './core/Provider/hooks/useX';",
            'src/core/Provider/hooks/useX.ts': "import { SARAK_ALL_THEMES } from '../../Design/presets/themes/all';",
            [`${THEMES}/all.ts`]: 'export const SARAK_ALL_THEMES = [];',
        });
        const closure = staticClosure('src/index.ts', read);
        expect(findSrcLeaks(closure, ['sarak-sovereign'], 'sarak-sovereign')).toEqual([`${THEMES}/all.ts`]);
    });

    it('o catálogo leve NÃO é tema: id no catálogo não aciona o marcador do dist', () => {
        const catalog = 'var C=[{id:"cyberpunk-neon",name:"Cyberpunk Neon",description:"x",mode:"dark",hasContraparte:!0}];';
        const files = new Map([['chunk-boot.js', catalog]]);
        expect(findDistLeaks(files, ['sarak-sovereign', 'cyberpunk-neon'], 'sarak-sovereign')).toEqual([]);
    });

    it('MUTAÇÃO: o corpo do tema no fecho do dist faz falhar; o do tema padrão não', () => {
        const body = (id: string) => `{id:"${id}",name:"N",description:"d",design:{mode:"dark"}}`;
        const files = new Map([['chunk-boot.js', `${body('sarak-sovereign')};${body('cyberpunk-neon')}`]]);
        expect(findDistLeaks(files, ['sarak-sovereign', 'cyberpunk-neon'], 'sarak-sovereign')).toEqual(['cyberpunk-neon']);
    });

    it('controle positivo: marcador ausente de todo o dist = gate cego, e é acusado', () => {
        const files = new Map([['a.js', 'nada']]);
        expect(findBlindIds(files, ['sarak-sovereign'])).toEqual(['sarak-sovereign']);
    });

    it('a árvore real passa em src/', () => {
        expect(runChecks({ mode: 'src' })).toEqual([]);
    });
});
