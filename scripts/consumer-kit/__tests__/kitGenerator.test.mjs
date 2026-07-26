// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { injectBlock, kitHashOf, renderVersionFile } from '../kitFiles.mjs';
import { buildKitCatalog } from '../buildKitCatalog.mjs';
import { renderAppendix } from '../renderAppendix.mjs';

const MARCA = 'TESTE:BLOCO';
const comMarcadores = (miolo) => `prosa antes\n\n<!-- ${MARCA}:INICIO -->\n${miolo}\n<!-- ${MARCA}:FIM -->\n\nprosa depois\n`;

describe('injectBlock — o que preserva a prosa e o que derruba o gerador', () => {
    it('substitui só o miolo, preservando a prosa dos dois lados', () => {
        const saida = injectBlock({
            content: comMarcadores('conteúdo VELHO'),
            marker: MARCA,
            body: 'conteúdo NOVO',
            file: 'teste.md',
        });

        expect(saida).toContain('prosa antes');
        expect(saida).toContain('prosa depois');
        expect(saida).toContain('conteúdo NOVO');
        expect(saida).not.toContain('conteúdo VELHO');
    });

    it('é idempotente — reinjetar o mesmo corpo devolve o mesmo texto', () => {
        const args = { marker: MARCA, body: 'corpo estável', file: 'teste.md' };
        const primeira = injectBlock({ content: comMarcadores('qualquer'), ...args });

        expect(injectBlock({ content: primeira, ...args })).toBe(primeira);
    });

    it('falha ALTO quando o marcador não existe — kit que mente sobre estar em dia é pior que nenhum', () => {
        expect(() =>
            injectBlock({ content: 'prosa sem marcador', marker: MARCA, body: 'x', file: 'teste.md' }),
        ).toThrow(/marcador/);
    });

    it('falha quando os marcadores estão invertidos', () => {
        const invertido = `<!-- ${MARCA}:FIM -->\nmiolo\n<!-- ${MARCA}:INICIO -->`;

        expect(() => injectBlock({ content: invertido, marker: MARCA, body: 'x', file: 'teste.md' })).toThrow();
    });
});

describe('kitHashOf — carimbo por CONTEÚDO, não por commit', () => {
    it('muda quando a superfície muda e não muda quando ela não muda', () => {
        expect(kitHashOf('{"a":1}')).toBe(kitHashOf('{"a":1}'));
        expect(kitHashOf('{"a":1}')).not.toBe(kitHashOf('{"a":2}'));
    });
});

describe('buildKitCatalog — as fontes vivas realmente chegam ao kit', () => {
    const catalog = buildKitCatalog();

    it('lista componentes de `components/` E a API de `core/` (Provider/Shell)', () => {
        expect(Object.keys(catalog.components).length).toBeGreaterThan(50);
        expect(catalog.components.SarakUIProvider?.props?.length).toBeGreaterThan(0);
        expect(catalog.components.SarakButton).toBeTruthy();
    });

    it('deriva o contrato de responsividade do uso real de `useSarakDevice`', () => {
        expect(catalog.responsive.breakpoints.BREAKPOINT_TABLET).toBeGreaterThan(0);
        expect(catalog.responsive.breakpoints.BREAKPOINT_DESKTOP).toBeGreaterThan(
            catalog.responsive.breakpoints.BREAKPOINT_TABLET,
        );
        expect(catalog.responsive.autoAdapting).toContain('SarakAppChrome');
        // O wrapper preguiçoso, não só o `…Impl` interno — é o nome que o consumidor escreve.
        expect(catalog.responsive.autoAdapting).toContain('SarakDataTable');
    });

    it('deriva os slots do cromo das props `ReactNode` opcionais do SarakAppChrome', () => {
        const slots = catalog.chromeSlots.map((slot) => slot.slot);

        expect(slots).toContain('banner');
        expect(slots).toContain('decoration');
        expect(slots).not.toContain('children'); // obrigatória: é o conteúdo, não um slot
        expect(slots).not.toContain('navigationStyle'); // não é ReactNode
    });

    it('traz o schema de tokens de tema e os temas embutidos', () => {
        expect(catalog.designTokens.count).toBeGreaterThan(100);
        expect(catalog.designTokens.responsiveCapable.length).toBeGreaterThan(0);
        expect(catalog.themes.presetIds.length).toBeGreaterThan(0);
        expect(catalog.themes.referenceThemeIds.length).toBe(2);
    });

    it('não vaza nome de importador nenhum — o kit é genérico', () => {
        expect(/\bERP\b|earendel/i.test(JSON.stringify(catalog))).toBe(false);
    });
});

describe('renderVersionFile / renderAppendix', () => {
    const catalog = buildKitCatalog();

    it('o VERSION carrega o carimbo que o refresh do consumidor compara', () => {
        const texto = renderVersionFile({ catalog, kitHash: 'abc123' });

        expect(texto).toContain('kitHash=abc123');
        expect(texto).toContain(`libVersion=${catalog.lib.version}`);
    });

    it('o apêndice é gerado, não escrito à mão — traz as listas vivas', () => {
        const apendice = renderAppendix(catalog);

        expect(apendice).toContain('Apêndice A');
        expect(apendice).toContain('SarakButton');
        expect(apendice).toContain('--sarak-card-bg');
        expect(apendice).toContain(String(catalog.designTokens.count));
    });
});
