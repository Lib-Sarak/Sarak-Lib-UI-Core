import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { SARAK_GLOBAL_THEMES } from '../../../../core/Design/presets/themes';
import * as ComponentModule from '../SarakBadge';
import { SarakBadge } from '../SarakBadge';

const STATUS_THEME_COLOR_KEYS = [
    'statusSuccessColor',
    'statusErrorColor',
    'statusWarningColor',
    'statusInfoColor',
] as const;

function parseHexColor(color: unknown): [number, number, number] | undefined {
    if (typeof color !== 'string') return undefined;

    const match = /^#([\da-f]{6})$/i.exec(color);
    if (!match) return undefined;

    return [
        Number.parseInt(match[1].slice(0, 2), 16),
        Number.parseInt(match[1].slice(2, 4), 16),
        Number.parseInt(match[1].slice(4, 6), 16),
    ];
}

function getRelativeLuminance(color: unknown): number | undefined {
    const channels = parseHexColor(color);
    if (!channels) return undefined;

    const [red, green, blue] = channels.map((channel) => {
        const normalized = channel / 255;
        return normalized <= 0.04045
            ? normalized / 12.92
            : ((normalized + 0.055) / 1.055) ** 2.4;
    });

    return (0.2126 * red) + (0.7152 * green) + (0.0722 * blue);
}

function getBlackContrastRatio(background: unknown): number | undefined {
    const luminance = getRelativeLuminance(background);
    return luminance === undefined ? undefined : (luminance + 0.05) / 0.05;
}

describe('SarakBadge export', () => {
    it('should be defined and export its contents without crashing', () => {
        expect(ComponentModule).toBeDefined();
    });
});

describe('SarakBadge muted variant', () => {
    // `--theme-border` é contrato de "borda sutil, baixa opacidade" (specs/09-temas-e-presets
    // §2 — `cardBorderColor`), não de fundo — em tema de borda opaca (`neo-brutalism`) um
    // badge com esse token como fundo fica ilegível. `--theme-surface`
    // (`cardBackgroundColor`) é o token com contrato de fundo, e o par texto×fundo
    // resultante (`textColorMuted`/`cardBackgroundColor`) já é medido pelo
    // `auditor_contraste` (`gates/scripts/audit/verify_contrast.ts`, PAIRS).
    it('a variante muted soft NÃO usa o token de borda como fundo', () => {
        render(<SarakBadge variant="muted" soft>Rótulo</SarakBadge>);

        const badge = screen.getByText('Rótulo');
        expect(badge.className).not.toMatch(/theme-border/);
        expect(badge.className).toMatch(/theme-surface/);
        expect(badge.className).toMatch(/theme-muted/);
    });
});

describe('SarakBadge status variants', () => {
    it.each([
        { variant: 'success' as const, property: '--sarak-status-success-color', shape: '●' },
        { variant: 'danger' as const, property: '--sarak-status-error-color', shape: '◆' },
        { variant: 'warning' as const, property: '--sarak-status-warning-color', shape: '▲' },
        { variant: 'info' as const, property: '--sarak-status-info-color', shape: '■' },
    ])('uses the $variant theme property and status shape', ({ variant, property, shape }) => {
        render(<SarakBadge variant={variant}>Rótulo</SarakBadge>);

        const badge = screen.getByText(/Rótulo/);
        expect(badge.className).not.toMatch(/green-500|red-500|yellow-500|blue-500/);
        expect(badge.style.color).toContain(property);
        expect(badge.style.backgroundColor).toContain(property);
        expect(badge.querySelector('[data-status-shape]')).toHaveTextContent(shape);
    });
});

describe('SarakBadge solid status contrast', () => {
    it.each(['success', 'danger', 'warning', 'info'] as const)(
        'uses a dark foreground for the solid %s status',
        (variant) => {
            render(<SarakBadge variant={variant} soft={false}>Rótulo</SarakBadge>);

            expect(screen.getByText(/Rótulo/).className).toContain('text-black');
        },
    );

    it('keeps the foreground at WCAG AA contrast against bundled status colors in both theme modes', () => {
        for (const theme of SARAK_GLOBAL_THEMES) {
            const palettes: Array<{ label: string; colors: object }> = [
                { label: `${theme.id} (base)`, colors: theme.design },
            ];

            if (theme.contraparte) {
                palettes.push({
                    label: `${theme.id} (contraparte)`,
                    colors: { ...theme.design, ...theme.contraparte },
                });
            }

            for (const palette of palettes) {
                for (const key of STATUS_THEME_COLOR_KEYS) {
                    const ratio = getBlackContrastRatio(Reflect.get(palette.colors, key));
                    expect(ratio, `${palette.label}: ${key}`).toBeDefined();
                    if (ratio !== undefined) {
                        expect(ratio, `${palette.label}: ${key}`).toBeGreaterThanOrEqual(4.5);
                    }
                }
            }
        }
    });
});

describe('SarakBadge status shape', () => {
    it('allows status shapes to be disabled while preserving the label', () => {
        render(<SarakBadge variant="success" showStatusShape={false}>Pronto</SarakBadge>);

        const badge = screen.getByText('Pronto');
        expect(badge.querySelector('[data-status-shape]')).not.toBeInTheDocument();
        expect(badge).toHaveTextContent('Pronto');
    });
});

describe('SarakBadge — statusGlowBlur', () => {
    it('as variantes de status desenham o brilho com o raio do token, na cor do status', () => {
        render(<SarakBadge variant="danger">Falha</SarakBadge>);

        const shadow = screen.getByText('Falha').style.boxShadow;
        expect(shadow).toContain('var(--sarak-status-glow-blur, 0px)');
        expect(shadow).toContain('--sarak-status-error-color');
    });

    it('as variantes que não são de status não levam brilho', () => {
        render(<SarakBadge variant="primary">Rótulo</SarakBadge>);

        expect(screen.getByText('Rótulo').style.boxShadow).toBe('');
    });
});
