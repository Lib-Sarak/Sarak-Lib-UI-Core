// @vitest-environment node
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { SARAK_DESIGN_MANIFEST } from '../manifest';
import * as colorEngine from '../utils/color-engine';
import { vi } from 'vitest';
import type { SarakTokenValue } from '../../Design/types';

vi.mock('../utils/color-engine', () => ({
    computeColorVariants: vi.fn((v, fallback) => v || fallback)
}));

describe('DESIGN_MANIFEST', () => {
    it('todo nome de `vars` é público (existe em `tokens.cssVars` do catálogo do kit)', () => {
        const catalog = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'sarak-ui/catalog.json'), 'utf-8')) as {
            tokens: { cssVars: string[] };
        };
        const publicNames = new Set(catalog.tokens.cssVars);
        const ghosts = Object.entries(SARAK_DESIGN_MANIFEST).flatMap(([key, entry]) =>
            (entry.vars ?? []).filter((name) => !publicNames.has(name)).map((name) => `${key}: ${name}`));
        expect(ghosts).toEqual([]);
    });

    it('não publica aliases de largura sem leitor', () => {
        expect(SARAK_DESIGN_MANIFEST.maxContentWidth).toBeUndefined();
    });

    it('should transform mode correctly', () => {
        expect(SARAK_DESIGN_MANIFEST.mode.transform?.('dark')).toBe('dark');
        expect(SARAK_DESIGN_MANIFEST.mode.transform?.('light')).toBe('light');
        expect(SARAK_DESIGN_MANIFEST.mode.transform?.('other')).toBe('light');
    });

    it('should transform colors using computeColorVariants', () => {
        // `buttonColor`/`buttonHoverColor`/`cardHoverColor`/`cardActiveColor`/
        // `buttonActiveColor` saíram desta lista (plan-21, 2026-08-10): eram
        // entradas ÓRFÃS do manifesto — nenhum token de schema com o mesmo id
        // e nenhuma var confirmada por outra fonte (R7 vão 2) — removidas do
        // `DESIGN_MANIFEST` junto das outras 22 entradas mortas.
        const colorProps = [
            'primaryColor', 'secondaryColor', 'tertiaryColor', 'accentColor',
            'surfaceColor', 'errorColor', 'successColor', 'warningColor',
            'textureColor', 'sidebarColor', 'topbarColor', 'cardBackgroundColor',
            'cardBorderColor', 'titleColor',
            'sidebarHoverColor', 'sidebarActiveColor', 'topbarHoverColor',
            'topbarActiveColor'
        ];

        colorProps.forEach(prop => {
            const transform = SARAK_DESIGN_MANIFEST[prop].transform;
            expect(transform).toBeDefined();
            // Because we mocked it to return v || fallback
            expect(transform?.('custom-color')).toBe('custom-color');
            expect(transform?.(undefined as unknown as SarakTokenValue)).toBeDefined(); // should return fallback
        });
    });

    it('should transform numbers correctly', () => {
        expect(SARAK_DESIGN_MANIFEST.sidebarMinWidth.transform?.('240')).toBe(240);
        expect(SARAK_DESIGN_MANIFEST.sidebarMinWidth.transform?.('invalid')).toBe(200);
        expect(SARAK_DESIGN_MANIFEST.sidebarMaxWidth.transform?.('500')).toBe(500);
        expect(SARAK_DESIGN_MANIFEST.sidebarMaxWidth.transform?.('invalid')).toBe(450);
    });

    it('não declara mais colorDepth nem colorVariation', () => {
        expect(SARAK_DESIGN_MANIFEST).not.toHaveProperty('colorDepth');
        expect(SARAK_DESIGN_MANIFEST).not.toHaveProperty('colorVariation');
    });

    // `logoScale`/`hapticIntensity` saíram desta lista (plan-21, 2026-08-10):
    // eram entradas ÓRFÃS do manifesto (R7 vão 2) — `logoScale` continua um
    // campo de payload válido (PAYLOAD_EXTRA_KEYS), só a entrada do manifesto
    // (que nunca alimentou CSS real — `useDesignVariables.ts` não lê
    // `DESIGN_MANIFEST`) foi removida; `hapticIntensity` não tinha nenhum
    // consumidor, nem de CSS nem de JS, em lugar nenhum do código.
    it('should transform floats correctly', () => {
        expect(SARAK_DESIGN_MANIFEST.cardSpotlightOpacity.transform?.('0.5')).toBe(0.5);
        expect(SARAK_DESIGN_MANIFEST.cardSpotlightOpacity.transform?.('invalid')).toBe(0);
        expect(SARAK_DESIGN_MANIFEST.sidebarMinWidth.transform?.('300')).toBe(300);
        expect(SARAK_DESIGN_MANIFEST.sidebarMinWidth.transform?.('invalid')).toBe(200);
        expect(SARAK_DESIGN_MANIFEST.sidebarMaxWidth.transform?.('500')).toBe(500);
        expect(SARAK_DESIGN_MANIFEST.sidebarMaxWidth.transform?.('invalid')).toBe(450);
    });

    // `headingLetterSpacing`, `chartPalette`, `useTabularNums`, `scaleRatio`
    // saíram do DESIGN_MANIFEST (plan-21, 2026-08-10, R7 vão 2 — entradas
    // órfãs, sem token de schema nem var confirmada). Os testes que as
    // caracterizavam saíram junto: a lógica de transform (`transformScaleRatio`
    // etc., em `manifest-transformers.ts`) ficou sem NENHUM chamador — nem a
    // própria `DESIGN_MANIFEST` era lida pelo injetor real de CSS
    // (`useDesignVariables.ts` deriva 100% de `MASTER_DESIGN_MAP`/schema, não
    // do manifesto) — então não há comportamento de produção para caracterizar
    // mais. As funções seguem exportadas em `manifest-transformers.ts`, não
    // removidas (fora do escopo desta plan).

    it('should transform layeredShadows correctly', () => {
        const transform = SARAK_DESIGN_MANIFEST.layeredShadows.transform!;
        const result = transform('2.0');
        expect(result).toContain('rgba(0,0,0,0.1)'); // 0.05 * 2.0 = 0.1

        const resultInvalid = transform('invalid');
        expect(resultInvalid).toContain('rgba(0,0,0,0.05)'); // 0.05 * 1.0 = 0.05
    });

    it('should transform fontScale correctly', () => {
        const transform = SARAK_DESIGN_MANIFEST.fontScale.transform!;
        expect(transform('pp')).toEqual({ px: '12px', factor: '0.75' });
        expect(transform('p')).toEqual({ px: '14px', factor: '0.85' });
        expect(transform('m')).toEqual({ px: '16px', factor: '1.0' });
        expect(transform('g')).toEqual({ px: '20px', factor: '1.25' });
        expect(transform('gg')).toEqual({ px: '24px', factor: '1.5' });
        expect(transform('unknown')).toEqual({ px: '16px', factor: '1.0' });
    });

    // `fluidScaling` saiu do DESIGN_MANIFEST (plan-21, 2026-08-10, R7 vão 2) —
    // mesma razão do bloco de comentário acima de `layeredShadows`.
});
