import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';

// Cada opção desenha componentes reais (botão em 4 estados, campo, cartão): a lista inteira em jsdom passa dos 5 s padrão sob carga.
vi.setConfig({ testTimeout: 30000 });
import { CardsCatalog } from '../CardsCatalog';
import { useDesignVariables } from '../../../../../core/Design/hooks/useDesignVariables';
import { THEME_CARD_PRESETS } from '../../../../../core/Design/presets/components/cards';
import type { SarakDesignState } from '../../../../../core/Provider/types';

vi.mock('../../../../../core/Design/hooks/useDesignVariables', () => ({
    useDesignVariables: vi.fn(() => ({ variables: {}, attributes: {} }))
}));

vi.mock('framer-motion', async () => {
    const actual = await vi.importActual('framer-motion');
    return { ...actual as any, motion: { button: ({ children, className, ...props }: any) => <button className={className} {...props}>{children}</button> } };
});

describe('CardsCatalog', () => {
    it('renderiza a aba Curados por padrão e faz snapshot', () => {
        const { container } = render(<CardsCatalog onApplyPreset={vi.fn()} currentMode="dark" />);
        expect(screen.getByText('Vidro mínimo')).toBeInTheDocument();
        expect(container).toMatchSnapshot();
    });

    it('miniaturas dos cards acompanham o modo efetivo do catálogo', () => {
        const { container } = render(<CardsCatalog onApplyPreset={vi.fn()} currentMode="light" />);

        expect(container.querySelector('.sarak-design-scope')?.classList.contains('light')).toBe(true);
    });

    it('troca para a camada automática de Texturas ao clicar na sub-aba', () => {
        render(<CardsCatalog onApplyPreset={vi.fn()} currentMode="dark" />);
        fireEvent.click(screen.getByRole('button', { name: /Texturas/i }));
        expect(screen.getByText('Grade técnica')).toBeInTheDocument();
    });

    it('a grade é a única do painel: colunas automáticas pela largura da coluna, não da janela', () => {
        const { container } = render(<CardsCatalog onApplyPreset={vi.fn()} currentMode="dark" />);
        const grid = container.querySelector('.grid') as HTMLElement;
        expect(grid.className).not.toMatch(/\bmd:grid-cols-2\b/);
        expect(grid.className).toContain('grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))]');
    });

    it('o card curado é desenhado sobre uma base neutra: o rascunho não entra no escopo da amostra', () => {
        const draft = { colorPalette: 'rascunho-marcador' } as unknown as Partial<SarakDesignState>;
        vi.mocked(useDesignVariables).mockClear();
        render(<CardsCatalog onApplyPreset={vi.fn()} currentMode="dark" draft={draft} />);
        const designs = vi.mocked(useDesignVariables).mock.calls.map((call) => call[0] as unknown as Record<string, unknown>);
        expect(designs.length).toBeGreaterThan(0);
        expect(designs.filter((design) => design.colorPalette === 'rascunho-marcador')).toEqual([]);
    });

    it('a base neutra segue o modo da prévia: no claro o fundo da amostra é claro, mesmo com um tema escuro no rascunho', () => {
        const draft = { colorBgBody: '#06080d', mode: 'dark' } as unknown as Partial<SarakDesignState>;
        const bodyOf = (mode: 'light' | 'dark'): string => {
            vi.mocked(useDesignVariables).mockClear();
            render(<CardsCatalog onApplyPreset={vi.fn()} currentMode={mode} draft={draft} />);
            return String((vi.mocked(useDesignVariables).mock.calls[0][0] as unknown as Record<string, unknown>).colorBgBody);
        };
        const light = bodyOf('light');
        const dark = bodyOf('dark');
        expect(light).not.toBe('#06080d');
        expect(light).not.toBe(dark);
    });

    it('a textura continua sobre o rascunho (ela se soma à paleta já escolhida)', () => {
        const draft = { colorPalette: 'rascunho-marcador' } as unknown as Partial<SarakDesignState>;
        render(<CardsCatalog onApplyPreset={vi.fn()} currentMode="dark" draft={draft} initialTab="textures" />);
        vi.mocked(useDesignVariables).mockClear();
        render(<CardsCatalog onApplyPreset={vi.fn()} currentMode="dark" draft={draft} initialTab="textures" />);
        const designs = vi.mocked(useDesignVariables).mock.calls.map((call) => call[0] as unknown as Record<string, unknown>);
        expect(designs.some((design) => design.colorPalette === 'rascunho-marcador')).toBe(true);
    });

    it('"Ver todas" abre o card de cada tema numa seção própria, com um tile por tema', () => {
        const { container } = render(<CardsCatalog onApplyPreset={vi.fn()} currentMode="dark" />);
        fireEvent.click(container.querySelector('[data-preset-toggle="cards"]') as HTMLElement);
        expect(screen.getByRole('heading', { name: 'Cards dos temas' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Cards curados' })).toBeInTheDocument();
        THEME_CARD_PRESETS.forEach((preset) => expect(screen.getAllByText(preset.name).length).toBeGreaterThan(0));
    });
});
