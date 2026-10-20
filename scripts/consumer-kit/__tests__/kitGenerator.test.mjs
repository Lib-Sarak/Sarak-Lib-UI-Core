// @vitest-environment node
import fs from 'node:fs';
import { beforeAll, describe, it, expect } from 'vitest';
import { buildKitOutputs } from '../buildKitOutputs.mjs';
import { SPACING_TOKENS } from '../../../src/core/Design/resolveToken';
import { collectEmittedSarakCssVars } from '../collectEmittedSarakCssVars.mjs';
import { injectBlock, kitHashOf, MIGRATIONS, MIGRATIONS_SOURCE, renderVersionFile } from '../kitFiles.mjs';
import { buildKitCatalog } from '../buildKitCatalog.mjs';
import { renderAppendix } from '../renderAppendix.mjs';

const MARCA = 'TESTE:BLOCO';
const comMarcadores = (miolo) => `prosa antes\n\n<!-- ${MARCA}:INICIO -->\n${miolo}\n<!-- ${MARCA}:FIM -->\n\nprosa depois\n`;
let catalog;
let generatedOutputs;

// Limite próprio: montar o catálogo do kit lê o schema, os temas e o motor inteiros (~7–9 s medidos isolado) e o
// `hookTimeout` padrão é 10 s — sob a carga da suíte completa (≈4 workers, jsdom) o hook estourava sem erro do kit.
const KIT_BUILD_TIMEOUT_MS = 60_000;

beforeAll(() => {
    catalog = buildKitCatalog();
    generatedOutputs = buildKitOutputs(catalog);
}, KIT_BUILD_TIMEOUT_MS);

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

    it('leva ao catálogo o mapa de espaçamentos tipado do resolutor', () => {
        expect(catalog.tokens.spacing).toEqual(SPACING_TOKENS);
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

    it('leva a documentação do schema (kind, modeDependent, usage, interactsWith) ao catálogo e o pilar de cada token', () => {
        const byId = new Map(catalog.designTokens.ids.map((token) => [token.id, token]));
        const texture = byId.get('cardTextureOpacity');
        expect(texture.group).toBe('cards');
        expect(texture.kind).toBe('aesthetic');
        expect(texture.modeDependent).toBe(true);
        expect(texture.usage.length).toBeGreaterThan(20);
        expect(texture.interactsWith).toContain('cardTextureType');
        expect(catalog.designTokens.groups.cards).toBeTruthy();
    });

    it('lista só CSS Variables Sarak que a engine emite, incluindo variantes de cor válidas', () => {
        const emittedVars = collectEmittedSarakCssVars();

        expect(emittedVars.length).toBeGreaterThan(9);
        expect(catalog.tokens.cssVars).toEqual(emittedVars);
        expect(catalog.tokens.cssVars).not.toContain('--sarak-300-10');
        expect(catalog.tokens.cssVars).toContain('--sarak-primary-color-10');
        expect(emittedVars.every((variable) => variable.startsWith('--sarak-'))).toBe(true);
    });

    it('não vaza nome de importador nenhum — o kit é genérico', () => {
        expect(/\bERP\b|earendel/i.test(JSON.stringify(catalog))).toBe(false);
    });
});

describe('renderVersionFile / renderAppendix', () => {
    it('o VERSION carrega o carimbo que o refresh do consumidor compara', () => {
        const texto = renderVersionFile({ catalog, kitHash: 'abc123' });

        expect(texto).toContain('kitHash=abc123');
        expect(texto).toContain(`libVersion=${catalog.lib.version}`);
    });

    it('publica o carimbo estruturado e copia as migrações para o kit', () => {
        const { catalog: generatedCatalog, kitHash, outputs } = generatedOutputs;
        const { kitStamp, ...catalogSurface } = generatedCatalog;
        const hashInput = `${JSON.stringify(catalogSurface, null, 2)}\n`;

        expect(kitStamp).toEqual({
            libVersion: generatedCatalog.lib.version,
            kitSchemaVersion: generatedCatalog.schemaVersion,
            kitHash,
        });
        expect(kitHash).toBe(kitHashOf(hashInput));
        expect(outputs.get(MIGRATIONS)).toBe(fs.readFileSync(MIGRATIONS_SOURCE, 'utf8'));
    });

    it('o apêndice é gerado, não escrito à mão — traz as listas vivas', () => {
        const apendice = renderAppendix(catalog);

        expect(apendice).toContain('Apêndice A');
        expect(apendice).toContain('SarakButton');
        expect(apendice).toContain('--sarak-card-bg');
        expect(apendice).toContain(String(catalog.designTokens.count));
    });

    it('o apêndice traz o mapa dos tokens por pilar, só com o que o schema documentou', () => {
        const apendice = renderAppendix(catalog);
        const documented = catalog.designTokens.ids.filter((token) => token.usage);

        expect(apendice).toContain('### A.4b Mapa dos tokens por pilar');
        expect(apendice).toContain(`**${documented.length}** de ${catalog.designTokens.count} tokens`);
        expect(apendice).toContain('| `cardTextureOpacity` | estético | sim |');
        // token sem documentação não aparece como linha do mapa (o gate de documentação mantém a lista do que falta)
        const undocumented = catalog.designTokens.ids.find((token) => !token.usage);
        if (undocumented) expect(apendice).not.toContain(`| \`${undocumented.id}\` |`);
    });
});
