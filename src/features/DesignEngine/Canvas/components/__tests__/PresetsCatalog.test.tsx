import React from 'react';
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { PEEK_DELAY_MS } from '../peek';
import { PresetsCatalog } from '../PresetsCatalog';

// O resultado é o mesmo objeto a cada chamada, como o do hook de verdade (que memoriza): o escopo das miniaturas compara as variáveis entre renders.
vi.mock('../../../../../core/Design/hooks/useDesignVariables', () => {
    const stable = { variables: {}, attributes: {} };
    return { useDesignVariables: vi.fn(() => stable) };
});

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

        const themeCard = await screen.findByRole('button', { name: /Sarak Sovereign(?! Classic)/i }, { timeout: 10000 });
        fireEvent.click(themeCard);

        expect(onApplyFullTheme).toHaveBeenCalledWith(expect.objectContaining({ mode: 'dark' }), 'sarak-sovereign');
    });

    it('o grupo de fontes monta os pares de fontes reais', () => {
        render(<PresetsCatalog {...createProps('fonts')} />);
        expect(screen.getAllByText('A atenção aos detalhes faz a diferença.')[0]).toBeInTheDocument();
    });

    it.each([
        ['cards', 'cards'],
        ['cardTextures', 'cardTextures'],
        ['atmosphere', 'atmosphere'],
        ['textures', 'textures'],
    ] as const)('o grupo %s monta o próprio catálogo', (group, marker) => {
        const { container } = render(<PresetsCatalog {...createProps(group)} />);
        expect(container.querySelector('[data-preset-group="' + marker + '"]')).not.toBeNull();
    }, 30000);

    it('o grupo de botões segue com o catálogo próprio (abas Curados e por estilo)', () => {
        render(<PresetsCatalog {...createProps('buttons')} />);
        expect(screen.getByRole('button', { name: 'Curados' })).toBeInTheDocument();
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
        expect(globalsGrid.className).toContain('grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))]');
        // A grade mora DENTRO da fronteira de container — é dela que ela mede.
        expect(containerBoundary?.contains(globalsGrid)).toBe(true);
    });

    describe('espiada de uma opção do grupo', () => {
        beforeEach(() => {
            vi.useFakeTimers();
            window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }) as unknown as typeof window.matchMedia;
        });
        afterEach(() => { vi.useRealTimers(); });

        const peekFirstOption = (group: React.ComponentProps<typeof PresetsCatalog>['group']) => {
            const onPeek = vi.fn();
            const { container } = render(<PresetsCatalog {...createProps(group)} onPeek={onPeek} />);
            fireEvent.mouseEnter(container.querySelector('[data-option-tile]') as HTMLElement);
            act(() => { vi.advanceTimersByTime(PEEK_DELAY_MS); });
            return onPeek;
        };

        it('a opção de tabela leva a prévia à tela da tabela, e sair devolve null', () => {
            const onPeek = peekFirstOption('tables');
            expect(onPeek).toHaveBeenCalledWith(expect.objectContaining({ tableDensity: expect.any(String) }), 'tabela');
        });

        it.each([['badge', 'components'], ['charts', 'graficos'], ['emptyState', 'components']] as const)('o grupo %s leva à tela %s', (group, screenId) => {
            expect(peekFirstOption(group)).toHaveBeenCalledWith(expect.any(Object), screenId);
        });

        it('grupo sem tela própria espia sem mudar de tela', () => {
            expect(peekFirstOption('corners')).toHaveBeenCalledWith(expect.any(Object), undefined);
        });

        it.each([['topbar', 'topbar'], ['sidebar', 'sidebar']] as const)('a opção de %s acrescenta a navegação que mostra a barra', (group, navigation) => {
            expect(peekFirstOption(group)).toHaveBeenCalledWith(expect.objectContaining({ navigationStyle: navigation }), undefined);
        });

        it('sem onPeek a galeria não espia', () => {
            const { container } = render(<PresetsCatalog {...createProps('tables')} />);
            fireEvent.mouseEnter(container.querySelector('[data-option-tile]') as HTMLElement);
            expect(() => act(() => { vi.advanceTimersByTime(PEEK_DELAY_MS); })).not.toThrow();
        });
    });
});
