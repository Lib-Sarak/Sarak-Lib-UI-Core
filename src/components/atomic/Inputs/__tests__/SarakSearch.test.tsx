import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import { SarakSearch } from '../SarakSearch';

const renderSearch = (props: Partial<React.ComponentProps<typeof SarakSearch>> = {}) =>
    render(
        <SarakUIProvider>
            <SarakSearch isOpen onClose={() => undefined} items={[]} {...props} />
        </SarakUIProvider>,
    );

describe('SarakSearch', () => {
    it('não renderiza o campo de busca quando fechado', () => {
        render(
            <SarakUIProvider>
                <SarakSearch isOpen={false} onClose={() => undefined} items={[]} />
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

describe('SarakSearch — itens do aplicativo (`items`/`onSelect`)', () => {
    const items = [
        { id: '/propostas', label: 'Propostas', category: 'Comercial' },
        { id: '/projetos', label: 'Projetos' },
    ];

    it('lista os itens recebidos', () => {
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

    it.each(['Enter', ' '])('com `onSelect`, teclado %s seleciona resultado e fecha', async (key) => {
        const onSelect = vi.fn();
        const onClose = vi.fn();
        const user = userEvent.setup();
        renderSearch({ items, onSelect, onClose });
        const result = screen.getByRole('button', { name: /Propostas/ });
        result.focus();

        await user.keyboard(key === ' ' ? ' ' : `{${key}}`);
        expect(onSelect).toHaveBeenCalledWith('/propostas');
        expect(onClose).toHaveBeenCalled();
    });

    it('sem `onSelect`, o resultado NÃO é acionável — mesmo comportamento de sempre', () => {
        renderSearch({ items });
        const resultado = screen.getByText('Propostas').closest('button, div');
        expect(resultado?.tagName).toBe('DIV');
    });

    it('com uma lista vazia, mostra o estado sem resultados', () => {
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
