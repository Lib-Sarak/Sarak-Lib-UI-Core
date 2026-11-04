import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { PresetsCatalog } from '../PresetsCatalog';

vi.mock('../../../../../core/Design/hooks/useDesignVariables', () => ({
    useDesignVariables: vi.fn(() => ({ variables: {}, attributes: {} }))
}));

vi.mock('framer-motion', async () => {
    const actual = await vi.importActual('framer-motion');
    return { ...actual as any, motion: { button: ({ children, className, ...props }: any) => <button className={className} {...props}>{children}</button> } };
});

describe('PresetsCatalog — um grupo por vez, sem cromo próprio', () => {
    const createProps = (group: React.ComponentProps<typeof PresetsCatalog>['group']) => ({
        group,
        onApplyPreset: vi.fn(),
        currentMode: 'dark' as const,
        draftMode: 'dark' as const,
    });

    it('o grupo de temas lista os embarcados e não traz cabeçalho, abas nem botão de fechar', async () => {
        const { container } = render(<PresetsCatalog {...createProps('themes')} />);

        expect(screen.queryByRole('heading', { name: 'Galeria de estilos' })).toBeNull();
        expect(screen.queryByRole('button', { name: 'Fechar galeria' })).toBeNull();
        expect(screen.queryByRole('group', { name: 'Categorias da galeria' })).toBeNull();
        // Prazo folgado: o catálogo carrega os temas sob demanda e, com a suíte inteira rodando em paralelo, passa dos 1000 ms padrão do `waitFor`.
        await waitFor(() => expect(container.querySelector('[aria-busy="true"]')).toBeNull(), { timeout: 10000 });
        expect(container).toMatchSnapshot();
    });

    it('aplica o tema pelo modo bruto do rascunho quando a preferência só clareia a galeria', async () => {
        const onApplyFullTheme = vi.fn();
        render(<PresetsCatalog {...createProps('themes')} currentMode="light" draftMode="dark" onApplyFullTheme={onApplyFullTheme} />);

        const themeCard = await screen.findByRole('button', { name: /Sarak Sovereign/i }, { timeout: 10000 });
        fireEvent.click(themeCard);

        expect(onApplyFullTheme).toHaveBeenCalledWith(expect.objectContaining({ mode: 'dark' }), 'sarak-sovereign');
    });

    it('o grupo de fontes monta os pares de fontes reais', () => {
        render(<PresetsCatalog {...createProps('fonts')} />);
        expect(screen.getAllByText('A atenção aos detalhes faz a diferença.')[0]).toBeInTheDocument();
    });

    it.each([
        ['cards', 'Curados'],
        ['buttons', 'Curados'],
        ['atmosphere', 'Atmosferas'],
    ] as const)('o grupo %s monta o próprio catálogo', (group, marker) => {
        render(<PresetsCatalog {...createProps(group)} />);
        expect(screen.getByRole('button', { name: marker })).toBeInTheDocument();
    }, 30000);

    it('o grupo de campos monta uma opção por preset de campo', () => {
        const { container } = render(<PresetsCatalog {...createProps('inputs')} />);
        expect(container.querySelectorAll('h3').length).toBeGreaterThan(0);
    }, 30000);

    it('carrega UMA fronteira @container que serve o grupo montado (fecha 06-painel-de-customizacao-e-preview.md §6.2)', () => {
        const { container } = render(<PresetsCatalog {...createProps('themes')} />);

        const containerBoundary = Array.from(container.querySelectorAll('div'))
            .find((el) => el.className.split(' ').includes('@container'));
        expect(containerBoundary).toBeTruthy();

        const globalsGrid = container.querySelector('.grid') as HTMLElement;
        expect(globalsGrid.className).not.toMatch(/md:grid-cols-2/);
        expect(globalsGrid.className).toMatch(/@min-\[240px\]:grid-cols-2/);
        // A grade mora DENTRO da fronteira de container — é dela que ela mede.
        expect(containerBoundary?.contains(globalsGrid)).toBe(true);
    });
});
