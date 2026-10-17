/**
 * As fontes que o host registra (`options.fonts.custom`): o registro validado e a validação do tema com ele.
 *
 * O registro decide o que a lib CARREGA e LISTA, não o que o tema aceita: nome com caractere de CSS, URL com
 * esquema perigoso, peso ou estilo fora do conjunto fechado são recusados, sempre com aviso. Os avisos são
 * deduplicados por mensagem — cada caso usa uma família própria.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { SarakCustomFont } from '../../providerProps';
import { HOST_FONT_CATEGORY, getHostFontRegistry } from '../hostFonts';

const file = (url = '/fontes/marca.woff2', weight: SarakCustomFont['files'][number]['weight'] = 400) => ({ url, weight });
const registryOf = (custom: SarakCustomFont[]) => getHostFontRegistry({ custom });
const warnSpy = () => vi.spyOn(console, 'warn').mockImplementation(() => undefined);

afterEach(() => vi.restoreAllMocks());

describe('registro — o que entra', () => {
    it('família válida vira o valor `\'<família>\', <genérica>`, com categoria e faces', () => {
        const registry = registryOf([
            { family: 'Marca Sans', category: 'Sans-Serif', files: [file('/fontes/marca.woff2', 400), { url: 'https://cdn.exemplo.test/marca-italic.woff', weight: 'bold', style: 'italic' }] },
            { family: 'Marca_Serif-2', fallback: 'serif', files: [file('fontes/serif.woff2', 700)] },
        ]);
        expect(registry?.fonts).toEqual([
            { family: 'Marca Sans', value: "'Marca Sans', sans-serif", category: 'Sans-Serif' },
            { family: 'Marca_Serif-2', value: "'Marca_Serif-2', serif", category: HOST_FONT_CATEGORY },
        ]);
        expect(registry?.manifest['Marca Sans'].faces.map(({ file: name, weight, style }) => [name, weight, style])).toEqual([
            ['/fontes/marca.woff2', '400', 'normal'],
            ['https://cdn.exemplo.test/marca-italic.woff', 'bold', 'italic'],
        ]);
        expect(registry?.values.get("'Marca_Serif-2', serif")).toBe('Marca_Serif-2');
    });

    it('sem `custom` (ou vazio, ou origem em texto) não há registro; a mesma lista dá o mesmo registro', () => {
        expect(getHostFontRegistry()).toBeUndefined();
        expect(getHostFontRegistry('bundled')).toBeUndefined();
        expect(getHostFontRegistry({ custom: [] })).toBeUndefined();
        const custom: SarakCustomFont[] = [{ family: 'Memo Font', files: [file()] }];
        expect(getHostFontRegistry({ custom })).toBe(getHostFontRegistry({ source: 'google', custom }));
    });
});

describe('registro — o que é recusado, com aviso', () => {
    it.each([
        ['aspas e chaves de CSS', 'Fonte"; } body { color: red'],
        ['fim de tag', 'x</style><script>'],
        ['ponto e vírgula', 'Fonte;Outra'],
        ['começa com espaço', ' Fonte'],
        ['longo demais', 'F'.repeat(65)],
        ['família da lib', 'Inter'],
        ['família da lib em outra caixa', 'jetbrains mono'],
    ])('nome com %s', (_label, family) => {
        const warn = warnSpy();
        expect(registryOf([{ family, files: [file()] }])?.fonts).toEqual([]);
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('options.fonts.custom: família'));
    });

    it('família repetida: vale a primeira', () => {
        const registry = registryOf([{ family: 'Dupla', files: [file('/a.woff2')] }, { family: 'Dupla', files: [file('/b.woff2')] }]);
        expect(registry?.manifest.Dupla.faces[0].file).toBe('/a.woff2');
    });

    it.each([
        'javascript:alert(1)', 'data:text/html;base64,PHNjcmlwdD4=', 'file:///etc/fonte.woff2', 'http://cdn.exemplo.test/f.woff2',
        'url(/f.woff2)', ' /f.woff2', 'vbscript:x', '/f.woff2;}body{x', '',
    ])('URL perigosa ou fora do conjunto: %s', (url) => {
        const warn = warnSpy();
        const family = `Url ${Math.abs([...url].reduce((hash, char) => hash * 31 + char.charCodeAt(0), 7) % 99999)}`;
        expect(registryOf([{ family, files: [file(url)] }])?.fonts).toEqual([]);
        expect(warn).toHaveBeenCalledWith(expect.stringContaining(`família "${family}" recusado`));
    });

    it('peso fora de 100–900/normal/bold, estilo fora de normal/italic e fallback fora das genéricas', () => {
        warnSpy();
        const bad = registryOf([
            { family: 'Peso Torto', files: [file('/p.woff2', 450 as never)] },
            { family: 'Estilo Torto', files: [{ url: '/e.woff2', weight: 400, style: 'oblique' as never }] },
            { family: 'Fallback Torto', fallback: 'fantasy' as never, files: [file()] },
        ]);
        expect(bad?.fonts).toEqual([]);
        const partial = registryOf([{ family: 'Meio Certa', files: [file('/ok.woff2'), file('javascript:x')] }]);
        expect(partial?.manifest['Meio Certa'].faces.map((face) => face.file)).toEqual(['/ok.woff2']);
    });

    it('`data:font/…;base64` é aceito', () => {
        const registry = registryOf([{ family: 'Embutida', files: [file('data:font/woff2;base64,d09GMgABAAAAAA==')] }]);
        expect(registry?.fonts).toHaveLength(1);
    });
});

describe('registro — cada lista, o seu', () => {
    it('dois registros (dois Providers) não compartilham famílias nem arquivos', () => {
        const registryA = registryOf([{ family: 'Ilha A', files: [file('/a.woff2')] }]);
        const registryB = registryOf([{ family: 'Ilha B', files: [file('/b.woff2')] }]);
        expect(Object.keys(registryA?.manifest ?? {})).toEqual(['Ilha A']);
        expect(Object.keys(registryB?.manifest ?? {})).toEqual(['Ilha B']);
        expect(registryB?.values.has("'Ilha A', sans-serif")).toBe(false);
    });
});
