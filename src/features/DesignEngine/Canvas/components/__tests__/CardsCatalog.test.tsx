import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';

// Cada opção desenha componentes reais (botão em 4 estados, campo, cartão): a lista inteira em jsdom passa dos 5 s padrão sob carga.
vi.setConfig({ testTimeout: prazoDeTeste(30000) });
import { CardsCatalog } from '../CardsCatalog';
import { useDesignVariables } from '../../../../../core/Design/hooks/useDesignVariables';
import { THEME_CARD_PRESETS } from '../../../../../core/Design/presets/components/cards';
import type { SarakDesignState } from '../../../../../core/Provider/types';

import { prazoDeTeste } from '../../../../../shared/testing/prazoDeTeste';
// O cartão real do painel (`SarakTitleCard`) lê o design pelo contexto; sem o Provider, o teste entrega um design vazio.
vi.mock('../../../../../core/Provider/SarakUIProvider', async (importOriginal) => ({
    ...(await importOriginal<typeof import('../../../../../core/Provider/SarakUIProvider')>()),
    useSarakUI: () => ({ design: {}, isDrafting: false }),
}));

vi.mock('../../../../../core/Design/hooks/useDesignVariables', () => ({
    useDesignVariables: vi.fn(() => ({ variables: {}, attributes: {} }))
}));

vi.mock('framer-motion', async () => {
    const actual = await vi.importActual('framer-motion');
    return { ...actual as any, motion: { button: ({ children, className, ...props }: any) => <button className={className} {...props}>{children}</button>, div: ({ children, className, style, initial: _initial, animate: _animate, whileHover: _whileHover, ...props }: any) => <div className={className} style={style} {...props}>{children}</div> } };
});

describe('CardsCatalog', () => {
    it('renderiza os cards curados por padrão, sem abas, e faz snapshot', () => {
        const { container } = render(<CardsCatalog onApplyPreset={vi.fn()} currentMode="dark" />);
        expect(screen.getByText('Vidro mínimo')).toBeInTheDocument();
        expect(container).toMatchSnapshot();
    });

    it('miniaturas dos cards acompanham o modo efetivo do catálogo', () => {
        const { container } = render(<CardsCatalog onApplyPreset={vi.fn()} currentMode="light" />);

        expect(container.querySelector('.sarak-design-scope')?.classList.contains('light')).toBe(true);
    });

    it('a textura do card é um grupo à parte, sem aba nenhuma', () => {
        render(<CardsCatalog onApplyPreset={vi.fn()} currentMode="dark" section="textures" />);
        expect(screen.queryByRole('button', { name: /^(Texturas|Curados)$/ })).toBeNull();
        expect(screen.getByText('Grade técnica')).toBeInTheDocument();
    });

    it('a grade é a única do painel: colunas automáticas pela largura da coluna, não da janela', () => {
        const { container } = render(<CardsCatalog onApplyPreset={vi.fn()} currentMode="dark" />);
        const grid = container.querySelector('.grid') as HTMLElement;
        expect(grid.className).not.toMatch(/\bmd:grid-cols-2\b/);
        expect(grid.className).toContain('grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))]');
    });

    it('o card é desenhado sobre o rascunho (o tema atual): o rascunho entra no escopo da amostra', () => {
        const draft = { colorPalette: 'rascunho-marcador' } as unknown as Partial<SarakDesignState>;
        vi.mocked(useDesignVariables).mockClear();
        render(<CardsCatalog onApplyPreset={vi.fn()} currentMode="dark" draft={draft} />);
        const designs = vi.mocked(useDesignVariables).mock.calls.map((call) => call[0] as unknown as Record<string, unknown>);
        expect(designs.length).toBeGreaterThan(0);
        expect(designs.every((design) => design.colorPalette === 'rascunho-marcador')).toBe(true);
    });

    it('o card é o cartão real do painel, e a amostra de card não herda a textura do rascunho', () => {
        const draft = { cardTextureType: 'grid' } as unknown as Partial<SarakDesignState>;
        const { container } = render(<CardsCatalog onApplyPreset={vi.fn()} currentMode="dark" draft={draft} />);
        const card = container.querySelector('.sarak-card') as HTMLElement;
        expect(card).toHaveTextContent('CPU Cluster');
        expect(card.getAttribute('data-sx-card-texture-type')).toBe('none');
    });

    it('a textura continua sobre o rascunho (ela se soma à paleta já escolhida)', () => {
        const draft = { colorPalette: 'rascunho-marcador' } as unknown as Partial<SarakDesignState>;
        render(<CardsCatalog onApplyPreset={vi.fn()} currentMode="dark" draft={draft} section="textures" />);
        vi.mocked(useDesignVariables).mockClear();
        render(<CardsCatalog onApplyPreset={vi.fn()} currentMode="dark" draft={draft} section="textures" />);
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
