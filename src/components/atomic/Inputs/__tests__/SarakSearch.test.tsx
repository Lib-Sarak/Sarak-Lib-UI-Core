import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import { SarakSearch } from '../SarakSearch';

const renderSearch = (props: Partial<React.ComponentProps<typeof SarakSearch>> = {}) =>
    render(
        <SarakUIProvider>
            <SarakSearch isOpen onClose={() => undefined} {...props} />
        </SarakUIProvider>,
    );

describe('SarakSearch', () => {
    it('não renderiza o campo de busca quando fechado', () => {
        render(
            <SarakUIProvider>
                <SarakSearch isOpen={false} onClose={() => undefined} />
            </SarakUIProvider>,
        );
        expect(screen.queryByPlaceholderText('Buscar ferramenta, registro ou configuração…')).not.toBeInTheDocument();
    });

    it('foca o campo de busca automaticamente ao abrir (conserto R10 — plan-22)', async () => {
        renderSearch();
        const input = screen.getByPlaceholderText('Buscar ferramenta, registro ou configuração…');
        await waitFor(() => expect(document.activeElement).toBe(input));
    });

    it('atualiza o valor digitado', () => {
        renderSearch();
        const input = screen.getByPlaceholderText('Buscar ferramenta, registro ou configuração…') as HTMLInputElement;
        fireEvent.change(input, { target: { value: 'financeiro' } });
        expect(input.value).toBe('financeiro');
    });

    it('fecha com Escape', () => {
        const onClose = vi.fn();
        renderSearch({ onClose });
        fireEvent.keyDown(window, { key: 'Escape' });
        expect(onClose).toHaveBeenCalled();
    });

    // Spec 05 §2.4 — searchDropdownGap/searchDropdownWidth: o
    // "dropdown de busca" aqui é o próprio painel do palette (overlay), não um
    // dropdown inline sob um input.
    it('searchDropdownWidth/searchDropdownGap chegam ao painel do palette por token', () => {
        const { container } = renderSearch();
        const palette = container.querySelector('[style*="search-dropdown-width"]') as HTMLElement | null;
        expect(palette).not.toBeNull();
        expect(palette!.getAttribute('style')).toContain('var(--sarak-search-dropdown-width, 400px)');
        expect(palette!.getAttribute('style')).toContain('var(--sarak-search-dropdown-gap, 0.5rem)');
    });
});

// `items`/`onSelect` deixam quem chama alimentar a busca com a própria navegação, no
// lugar do registro do Discovery — sem eles, o caminho do registro continua intacto.
describe('SarakSearch — itens providos por fora (`items`/`onSelect`)', () => {
    const items = [
        { id: '/propostas', label: 'Propostas', category: 'Comercial' },
        { id: '/projetos', label: 'Projetos' },
    ];

    it('lista os `items` recebidos, não o registro do Discovery', () => {
        renderSearch({ items });
        expect(screen.getByText('Propostas')).toBeInTheDocument();
        expect(screen.getByText('Projetos')).toBeInTheDocument();
    });

    it('filtra os `items` pela mesma busca por texto', () => {
        renderSearch({ items });
        const input = screen.getByPlaceholderText('Buscar ferramenta, registro ou configuração…');
        fireEvent.change(input, { target: { value: 'propo' } });
        expect(screen.getByText('Propostas')).toBeInTheDocument();
        expect(screen.queryByText('Projetos')).not.toBeInTheDocument();
    });

    it('com `onSelect`, o resultado é um <button> real — clique seleciona e fecha', () => {
        const onSelect = vi.fn();
        const onClose = vi.fn();
        renderSearch({ items, onSelect, onClose });
        const resultado = screen.getByText('Propostas').closest('button');
        expect(resultado).not.toBeNull();
        // <button> nativo: focável e acionável por Enter/Espaço por construção do
        // browser — não há handler de teclado manual a testar aqui.
        fireEvent.click(resultado!);
        expect(onSelect).toHaveBeenCalledWith('/propostas');
        expect(onClose).toHaveBeenCalled();
    });

    it('sem `onSelect`, o resultado NÃO é acionável — mesmo comportamento de sempre', () => {
        renderSearch({ items });
        const resultado = screen.getByText('Propostas').closest('button, div');
        expect(resultado?.tagName).toBe('DIV');
    });

    it('sem `items`, continua usando o registro do Discovery (Shell intacto)', () => {
        renderSearch();
        expect(screen.getByText(/Nenhum resultado para/i)).toBeInTheDocument();
    });
});

// os textos da própria lib seguem o idioma que vale (specs/10 §3.6).
describe('SarakSearch — idioma que vale', () => {
    const items = [{ id: '/propostas', label: 'Propostas', category: 'Comercial' }];

    it('sai em português por padrão (sem preferência de idioma)', () => {
        renderSearch({ items });
        expect(screen.getByPlaceholderText('Buscar ferramenta, registro ou configuração…')).toBeInTheDocument();
        expect(screen.getByText('Ferramentas disponíveis')).toBeInTheDocument();
    });

    it('sai em inglês com `config.language: "en"`', () => {
        render(
            <SarakUIProvider config={{ language: 'en' }}>
                <SarakSearch isOpen onClose={() => undefined} items={items} />
            </SarakUIProvider>,
        );
        expect(screen.getByPlaceholderText('Search tool, record or configuration…')).toBeInTheDocument();
        expect(screen.getByText('Available tools')).toBeInTheDocument();
    });
});
