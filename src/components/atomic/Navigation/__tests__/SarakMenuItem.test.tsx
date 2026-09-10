import React from 'react';
import { render, screen, renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SarakMenuItem } from '../SarakMenuItem';
import { useDesignVariables } from '../../../../core/Design/hooks/useDesignVariables';
import { GLOBAL_THEMES } from '../../../../core/Design/presets/themes';
import { getDefaultDesignState } from '../../../../core/Design/master-map';
import { parseToRgba } from '../../../../core/Provider/utils/color-engine';

describe('SarakMenuItem', () => {
    it('monta sem SarakUIProvider (é átomo)', () => {
        expect(() => render(<SarakMenuItem label="Módulo" />)).not.toThrow();
        expect(screen.getByRole('button', { name: 'Módulo' })).toBeInTheDocument();
    });

    it('métrica de LISTA, não de botão de ação: sem uppercase/tracking-widest/font-black', () => {
        render(<SarakMenuItem label="Módulo" />);
        const item = screen.getByRole('button', { name: 'Módulo' });
        const classes = item.className.split(' ');
        expect(classes).not.toContain('uppercase');
        expect(classes).not.toContain('tracking-widest');
        expect(classes).not.toContain('font-black');
        expect(classes).not.toContain('py-4');
        expect(classes).not.toContain('px-6');
    });

    it('orientação vertical resolve largura cheia NA ORIGEM — nunca emite min-w-fit', () => {
        render(<SarakMenuItem label="Módulo" />);
        const classes = screen.getByRole('button', { name: 'Módulo' }).className.split(' ');
        expect(classes).toContain('w-full');
        expect(classes).not.toContain('w-max');
        expect(classes).not.toContain('min-w-fit');
    });

    it('rótulo longo trunca (classe truncate no span de rótulo)', () => {
        render(<SarakMenuItem label="Um rótulo de módulo bem comprido, maior que a sidebar" />);
        const label = screen.getByText('Um rótulo de módulo bem comprido, maior que a sidebar');
        expect(label.className).toContain('truncate');
    });

    it('estado ativo: aria-current="page" e tom de destaque', () => {
        render(<SarakMenuItem label="Módulo" active />);
        const item = screen.getByRole('button', { name: 'Módulo' });
        expect(item).toHaveAttribute('aria-current', 'page');
    });

    it('estado inativo: sem aria-current', () => {
        render(<SarakMenuItem label="Módulo" />);
        expect(screen.getByRole('button', { name: 'Módulo' })).not.toHaveAttribute('aria-current');
    });

    it('desabilitado/offline: atributo disabled e onClick não dispara', () => {
        const onClick = vi.fn();
        render(<SarakMenuItem label="Módulo" disabled onClick={onClick} />);
        const item = screen.getByRole('button', { name: 'Módulo' });
        expect(item).toBeDisabled();
    });

    it('colapsado: some o rótulo, mantém o ícone', () => {
        render(<SarakMenuItem label="Módulo" icon={<span data-testid="icon" />} collapsed />);
        expect(screen.queryByText('Módulo')).not.toBeInTheDocument();
        expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('orientação horizontal: aba compacta, sem w-full', () => {
        render(<SarakMenuItem label="Aba" orientation="horizontal" />);
        const classes = screen.getByRole('button', { name: 'Aba' }).className.split(' ');
        expect(classes).not.toContain('w-full');
        expect(classes).toContain('shrink-0');
    });

    it('a className do chamador VENCE os defaults do átomo — merge, não concatenação', () => {
        render(<SarakMenuItem label="Módulo" className="text-lg" />);
        const classes = screen.getByRole('button', { name: 'Módulo' }).className.split(' ');
        expect(classes).toContain('text-lg');
        expect(classes).not.toContain('text-sm');
    });

    it('title cai para o texto do rótulo quando não informado', () => {
        render(<SarakMenuItem label="Módulo" />);
        expect(screen.getByRole('button', { name: 'Módulo' })).toHaveAttribute('title', 'Módulo');
    });
});

describe('SarakMenuItem — cor de ativo/hover do cromo por orientação', () => {
    it('vertical ATIVO consome --sarak-sidebar-active-color (sidebar/drawer)', () => {
        render(<SarakMenuItem label="Módulo" orientation="vertical" active />);
        const classes = screen.getByRole('button', { name: 'Módulo' }).className;
        expect(classes).toContain('var(--sarak-sidebar-active-color');
    });

    it('vertical INATIVO consome --sarak-sidebar-hover-color no hover', () => {
        render(<SarakMenuItem label="Módulo" orientation="vertical" />);
        const classes = screen.getByRole('button', { name: 'Módulo' }).className;
        expect(classes).toContain('hover:bg-[var(--sarak-sidebar-hover-color');
    });

    it('horizontal ATIVO consome --sarak-topbar-active-color (topbar)', () => {
        render(<SarakMenuItem label="Aba" orientation="horizontal" active />);
        const classes = screen.getByRole('button', { name: 'Aba' }).className;
        expect(classes).toContain('var(--sarak-topbar-active-color');
        expect(classes).not.toContain('var(--sarak-sidebar-active-color');
    });

    it('horizontal INATIVO NÃO usa a cor de hover da sidebar', () => {
        render(<SarakMenuItem label="Aba" orientation="horizontal" />);
        const classes = screen.getByRole('button', { name: 'Aba' }).className;
        expect(classes).not.toContain('--sarak-sidebar-hover-color');
    });

    it('horizontal INATIVO consome --sarak-topbar-hover-color no hover (própria orientação)', () => {
        render(<SarakMenuItem label="Aba" orientation="horizontal" />);
        const classes = screen.getByRole('button', { name: 'Aba' }).className;
        expect(classes).toContain('hover:bg-[var(--sarak-topbar-hover-color');
    });

    it('vertical e horizontal ATIVO consomem --sarak-nav-active-color para texto/ícone (token que significa o efeito)', () => {
        render(<SarakMenuItem label="Módulo" orientation="vertical" active />);
        expect(screen.getByRole('button', { name: 'Módulo' }).className).toContain('var(--sarak-nav-active-color');

        render(<SarakMenuItem label="Aba" orientation="horizontal" active />);
        expect(screen.getByRole('button', { name: 'Aba' }).className).toContain('var(--sarak-nav-active-color');
    });
});

/**
 * Igualdade de string não prova distinção visual: duas cores podem ser bytes
 * diferentes e ainda assim indistinguíveis a olho (ex. `#e7e9ef` × `#e9eaed`,
 * ΔE ≈ 1,6). E razão de luminância sozinha também engana na direção oposta —
 * dois tons de mesma luminância e matizes bem diferentes (ciano × cinza) dão
 * contraste baixo mas são obviamente diferentes. A régua correta é distância
 * perceptual: converte para Lab (CIE 1976) e mede a distância euclidiana (ΔE76).
 * 2.3 é o limiar de "diferença perceptível" (JND) — CIE76.
 */
const JND_DELTA_E = 2.3;

function srgbChannelToLinear(c: number): number {
    const cs = c / 255;
    return cs <= 0.04045 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
}

function rgbToXyz(r: number, g: number, b: number): [number, number, number] {
    const [rl, gl, bl] = [r, g, b].map(srgbChannelToLinear);
    return [
        (rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375) * 100,
        (rl * 0.2126729 + gl * 0.7151522 + bl * 0.072175) * 100,
        (rl * 0.0193339 + gl * 0.119192 + bl * 0.9503041) * 100,
    ];
}

/** sRGB (0-255) → Lab (D65), para medir distância perceptual, não byte a byte. */
function toLab(r: number, g: number, b: number): [number, number, number] {
    const [x, y, z] = rgbToXyz(r, g, b);
    const [xn, yn, zn] = [95.047, 100, 108.883];
    const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
    const [fx, fy, fz] = [f(x / xn), f(y / yn), f(z / zn)];
    return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

function deltaE76(a: [number, number, number], b: [number, number, number]): number {
    return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
}

/** `efetiva = alfa × cor + (1 − alfa) × fundo`, canal a canal — mesma fórmula do `auditor_contraste`. */
function compositeOverOpaque(topCss: string, bottom: [number, number, number]): [number, number, number] {
    const top = parseToRgba(topCss);
    return [
        top.a * top.r + (1 - top.a) * bottom[0],
        top.a * top.g + (1 - top.a) * bottom[1],
        top.a * top.b + (1 - top.a) * bottom[2],
    ];
}

function isDistinguishable(css1: [number, number, number], css2: [number, number, number]): boolean {
    return deltaE76(toLab(...css1), toLab(...css2)) > JND_DELTA_E;
}

/**
 * Em TODO tema shippado, o item ativo se distingue do inativo nas duas
 * orientações — varredura de `GLOBAL_THEMES` inteiro (não amostra), pelo mesmo
 * caminho de runtime que o Provider usa (`useDesignVariables`). Distinção por
 * FUNDO (`sidebarActiveColor`/`topbarActiveColor` compostos sobre
 * `sidebarColor`/`topbarColor`) OU por TEXTO (`navItemActiveColor` composto
 * sobre o mesmo fundo, contra `textColorMuted` composto sobre o fundo inativo),
 * medido por ΔE — não por desigualdade de string. Tema que falhar aqui é
 * achado a relatar, não tema a editar (fora do escopo).
 */
describe('SarakMenuItem — realce do item ativo em TODO tema shippado (varredura, não amostra)', () => {
    it.each(GLOBAL_THEMES.map((theme) => [theme.id, theme] as const))(
        `tema "%s": o item ativo se distingue do inativo nas DUAS orientações (ΔE > ${JND_DELTA_E})`,
        (_id, theme) => {
            const design = { ...getDefaultDesignState(), ...(theme.design as Record<string, unknown>) };
            const { result } = renderHook(() => useDesignVariables(design));
            const { variables } = result.current;

            const activeTextCss = variables['--sarak-nav-active-color'];
            const inactiveTextCss = variables['--text-muted'];

            for (const [activeBgVar, baseBgVar] of [
                ['--sarak-sidebar-active-color', '--sarak-sidebar-bg'],
                ['--sarak-topbar-active-color', '--sarak-topbar-bg'],
            ] as const) {
                const baseBg = parseToRgba(variables[baseBgVar]);
                const baseBgRgb: [number, number, number] = [baseBg.r, baseBg.g, baseBg.b];
                const activeBgRgb = compositeOverOpaque(variables[activeBgVar], baseBgRgb);

                const distinguishByBg = isDistinguishable(activeBgRgb, baseBgRgb);
                const distinguishByText =
                    activeTextCss !== undefined &&
                    inactiveTextCss !== undefined &&
                    isDistinguishable(
                        compositeOverOpaque(activeTextCss, activeBgRgb),
                        compositeOverOpaque(inactiveTextCss, baseBgRgb),
                    );

                expect(distinguishByText || distinguishByBg).toBe(true);
            }
        }
    );
});
