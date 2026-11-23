import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';

// Cada opção desenha componentes reais (botão em 4 estados, campo, cartão): a lista inteira em jsdom passa dos 5 s padrão sob carga.
vi.setConfig({ testTimeout: 30000 });
import { AtmosphereCatalog } from '../AtmosphereCatalog';

vi.mock('framer-motion', async () => {
    const actual = await vi.importActual('framer-motion');
    return { ...actual as any, motion: { button: ({ children, className, ...props }: any) => <button className={className} {...props}>{children}</button> } };
});

describe('AtmosphereCatalog', () => {
    it('renderiza as atmosferas sem abas, com a opacidade', () => {
        const { container } = render(<AtmosphereCatalog onApplyPreset={vi.fn()} currentMode="dark" />);
        expect(screen.queryByText('Texturas')).toBeNull();
        expect(screen.getByText('Opacidade')).toBeInTheDocument();
        expect(container).toMatchSnapshot();
    });

    it('a textura do fundo é um grupo à parte: a mesma tela, com as texturas e sem aba', () => {
        const { container } = render(<AtmosphereCatalog onApplyPreset={vi.fn()} currentMode="dark" section="textures" />);
        expect(container.querySelector('[data-preset-group="textures"]')).not.toBeNull();
        expect(screen.queryByRole('button', { name: /^Texturas$/ })).toBeNull();
    });
});
