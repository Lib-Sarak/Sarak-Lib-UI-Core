import React from 'react';
import { act, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TypographyCatalog } from '../TypographyCatalog';
import { TYPOGRAPHY_PRESETS } from '../../../../../core/Design/presets/components/typography';
import { UIContext } from '../../../../../core/Provider/context';
import type { SarakUIContextType } from '../../../../../core/Provider/types';

const loadBundledFonts = vi.fn();
vi.mock('../../../../../core/Provider/fontLoader', () => ({
    loadBundledFonts: (request: unknown) => loadBundledFonts(request),
}));

vi.mock('framer-motion', async () => {
    const actual = await vi.importActual('framer-motion');
    return { ...actual as any, motion: { button: React.forwardRef(({ children, className, initial, animate, transition, ...props }: any, ref: any) => <button ref={ref} className={className} {...props}>{children}</button>) } };
});

const renderCatalog = (fonts: unknown = 'bundled', onApplyPreset = vi.fn()) => render(
    <UIContext.Provider value={{ options: { fonts } } as unknown as SarakUIContextType}>
        <TypographyCatalog onApplyPreset={onApplyPreset} currentMode="dark" />
    </UIContext.Provider>,
);

const loadedFamilies = (): string[] => loadBundledFonts.mock.calls.flatMap(([request]) => request.families as string[]);

describe('TypographyCatalog', () => {
    let observers: Array<{ callback: IntersectionObserverCallback; element?: Element }>;

    beforeEach(() => {
        loadBundledFonts.mockClear();
        observers = [];
        class FakeObserver {
            entry: { callback: IntersectionObserverCallback; element?: Element };
            constructor(callback: IntersectionObserverCallback) { this.entry = { callback }; observers.push(this.entry); }
            observe(element: Element) { this.entry.element = element; }
            disconnect() { /* nada a soltar */ }
        }
        vi.stubGlobal('IntersectionObserver', FakeObserver);
    });
    afterEach(() => vi.unstubAllGlobals());

    const reveal = (element: Element): void => {
        const entry = observers.find((observer) => observer.element === element);
        act(() => { entry!.callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver); });
    };

    it('mostra o texto de amostra em português, com título, frase e número', () => {
        renderCatalog();
        expect(screen.getAllByText('Relatório mensal')).toHaveLength(TYPOGRAPHY_PRESETS.length);
        expect(screen.getAllByText('A atenção aos detalhes faz a diferença.')[0]).toBeInTheDocument();
        expect(screen.getAllByText('R$ 12.480,00')[0]).toBeInTheDocument();
    });

    it('cada cartão aplica a PRÓPRIA fonte: duas fontes dão font-family diferente em título e corpo', () => {
        renderCatalog();
        const [first, second] = screen.getAllByRole('button');
        const titleOf = (card: HTMLElement) => within(card).getByTestId('font-sample-title').style.fontFamily;
        const bodyOf = (card: HTMLElement) => within(card).getByTestId('font-sample-body').style.fontFamily;
        expect(titleOf(first)).toContain(TYPOGRAPHY_PRESETS[0].name);
        expect(bodyOf(first)).toContain(TYPOGRAPHY_PRESETS[0].name);
        expect(titleOf(second)).toContain(TYPOGRAPHY_PRESETS[1].name);
        expect(titleOf(first)).not.toBe(titleOf(second));
    });

    it('nada carrega antes de o cartão entrar na área visível; ao entrar, carrega só a família dele', () => {
        renderCatalog('bundled');
        expect(loadBundledFonts).not.toHaveBeenCalled();
        const [first] = screen.getAllByRole('button');
        reveal(first);
        expect(loadedFamilies()).toEqual([TYPOGRAPHY_PRESETS[0].name]);
    });

    it('origem google: o Provider já carregou as da lib, o cartão não injeta nada', () => {
        renderCatalog('google');
        reveal(screen.getAllByRole('button')[0]);
        expect(loadBundledFonts).not.toHaveBeenCalled();
    });

    it('origem none: não carrega, e o cartão ainda mostra a fonte declarada', () => {
        renderCatalog('none');
        const [first] = screen.getAllByRole('button');
        reveal(first);
        expect(loadBundledFonts).not.toHaveBeenCalled();
        expect(within(first).getByTestId('font-sample-title').style.fontFamily).toContain(TYPOGRAPHY_PRESETS[0].name);
    });

    it('a fonte do sistema não pede carga nenhuma', () => {
        renderCatalog('bundled');
        const systemIndex = TYPOGRAPHY_PRESETS.findIndex((preset) => preset.name === 'System Default');
        reveal(screen.getAllByRole('button')[systemIndex]);
        expect(loadBundledFonts).not.toHaveBeenCalled();
    });

    it('escolher um cartão entrega só headingFont e bodyFont ao painel', () => {
        const onApplyPreset = vi.fn();
        renderCatalog('bundled', onApplyPreset);
        screen.getAllByRole('button')[0].click();
        expect(onApplyPreset).toHaveBeenCalledWith(TYPOGRAPHY_PRESETS[0].design, true);
        expect(Object.keys(onApplyPreset.mock.calls[0][0]).sort()).toEqual(['bodyFont', 'headingFont']);
    });

    it('a grade reage a CONTAINER QUERY (@min-[768px]:), não mais a `md:` de viewport (plan-35)', () => {
        const { container } = renderCatalog();
        const grid = container.querySelector('.grid') as HTMLElement;
        expect(grid.className).not.toMatch(/\bmd:grid-cols-2\b/);
        expect(grid.className).toMatch(/@min-\[768px\]:grid-cols-2/);
    });
});
