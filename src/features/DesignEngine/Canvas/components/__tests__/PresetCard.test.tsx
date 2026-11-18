import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import * as ComponentModule from '../PresetCard';
import { PresetCard } from '../PresetCard';
import { SarakThemePreset } from '../../../../../core/Design/presets/themes';

const themeOf = (patch: Record<string, unknown> = {}): SarakThemePreset => ({
    id: 'meu-tema',
    name: 'Meu Tema',
    description: 'Um tema de teste.',
    design: { primaryColor: '#ff0000', surfaceColor: '#101622', mode: 'dark', navigationStyle: 'sidebar' },
    ...patch,
} as unknown as SarakThemePreset);

describe('PresetCard — a miniatura é o sistema real com o tema', () => {
    afterEach(() => { vi.unstubAllGlobals(); });

    it('should be defined and export its contents without crashing', () => {
        expect(ComponentModule).toBeDefined();
    });

    it('é um botão só, com o id do tema em data-theme-id e o nome do tema como nome acessível', () => {
        const { container } = render(<PresetCard theme={themeOf()} currentMode="dark" onApply={() => {}} />);
        const button = screen.getByRole('button', { name: 'Meu Tema' });

        expect(container.querySelectorAll('button')).toHaveLength(1);
        expect(button).toHaveAttribute('data-theme-id', 'meu-tema');
        expect(container.querySelector('h3')).toHaveTextContent('Meu Tema');
    });

    it('o selo de navegação não entra no nome acessível nem fica sobre o nome', () => {
        render(<PresetCard theme={themeOf()} currentMode="dark" onApply={() => {}} />);

        expect(screen.getByRole('button', { name: 'Meu Tema' })).toBeInTheDocument();
        expect(screen.queryByText(/^sidebar$/i)).toBeNull();
    });

    it('o nome é proporcional à miniatura: sem caixa alta e com quebra por palavra', () => {
        const { container } = render(<PresetCard theme={themeOf({ name: 'Tema com nome comprido' })} currentMode="dark" onApply={() => {}} />);
        const name = container.querySelector('h3') as HTMLElement;

        expect(name).toHaveClass('text-xs', 'break-words');
        expect(name).not.toHaveClass('uppercase');
    });

    it('desenha o cromo real dentro do escopo do tema, escondido do leitor de tela', async () => {
        const { container } = render(<PresetCard theme={themeOf()} currentMode="dark" onApply={() => {}} />);
        const miniature = await waitFor(() => {
            const node = container.querySelector('[data-testid="theme-miniature"]');
            expect(node).not.toBeNull();
            return node as HTMLElement;
        });

        expect(miniature.closest('.sarak-design-scope')).not.toBeNull();
        expect(miniature.closest('[aria-hidden="true"]')).not.toBeNull();
    });

    it('a miniatura usa o modo pedido (a contraparte quando o tema a tem)', async () => {
        const theme = themeOf({ design: { mode: 'dark', surfaceColor: '#101622', navigationStyle: 'sidebar' }, contraparte: { surfaceColor: '#ffffff' } });
        const { container } = render(<PresetCard theme={theme} currentMode="light" onApply={() => {}} />);

        await waitFor(() => expect(container.querySelector('.sarak-design-scope')).toHaveClass('light'));
    });

    it('só desenha quando a opção entra na área visível, e só então resolve a paleta do tema', async () => {
        let reads = 0;
        const theme = themeOf();
        Object.defineProperty(theme, 'contraparte', { get: () => { reads += 1; return undefined; }, enumerable: true });
        let reveal: () => void = () => {};
        vi.stubGlobal('IntersectionObserver', class {
            constructor(callback: IntersectionObserverCallback) { reveal = () => callback([{ isIntersecting: true } as IntersectionObserverEntry], this as unknown as IntersectionObserver); }
            observe(): void {}
            disconnect(): void {}
        });
        const { container } = render(<PresetCard theme={theme} currentMode="dark" onApply={() => {}} />);

        expect(container.querySelector('[data-sx-lazy="pending"]')).toBeInTheDocument();
        expect(container.querySelector('[data-testid="theme-miniature"]')).toBeNull();
        expect(reads).toBe(0);

        reveal();
        await waitFor(() => expect(container.querySelector('[data-testid="theme-miniature"]')).not.toBeNull());
        expect(reads).toBeGreaterThan(0);
    });

    it('escolher chama onApply', () => {
        const onApply = vi.fn();
        render(<PresetCard theme={themeOf()} currentMode="dark" onApply={onApply} />);
        fireEvent.click(screen.getByRole('button', { name: 'Meu Tema' }));

        expect(onApply).toHaveBeenCalledTimes(1);
    });
});
