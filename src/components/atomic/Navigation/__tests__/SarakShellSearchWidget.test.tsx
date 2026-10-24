import React from 'react';
import { act, render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { SarakShellSearchWidget } from '../SarakShellSearchWidget';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

const customRender = (ui: React.ReactElement) => {
    return render(<SarakUIProvider>{ui}</SarakUIProvider>);
};

describe('ShellSearchWidget', () => {
    it('renderiza na variante icon e chama onClick', () => {
        const onClickMock = vi.fn();
        customRender(<SarakShellSearchWidget variant="icon" onClick={onClickMock} />);
        const btn = screen.getByRole('button', { name: /Buscar…/i });
        expect(btn).toBeInTheDocument();
        fireEvent.click(btn);
        expect(onClickMock).toHaveBeenCalled();
    });

    it('renderiza na variante bar e permite busca', () => {
        customRender(<SarakShellSearchWidget variant="bar" onClick={vi.fn()} items={[{ id: 'app1', label: 'Dashboard App', category: 'Core' }]} />);
        const input = screen.getByPlaceholderText('Busca inteligente…');
        expect(input).toBeInTheDocument();

        fireEvent.change(input, { target: { value: 'Dash' } });
        expect(screen.getByText('Resultados')).toBeInTheDocument();
        expect(screen.getByText('Dashboard App')).toBeInTheDocument();
    });

    it('com callback, seleciona o resultado e cancela a navegação do link', () => {
        const onSelect = vi.fn();
        customRender(
            <SarakShellSearchWidget
                variant="bar"
                onClick={vi.fn()}
                onSelect={onSelect}
                items={[{ id: '/projetos', label: 'Projetos', category: 'Gestão' }]}
            />,
        );
        fireEvent.change(screen.getByPlaceholderText('Busca inteligente…'), { target: { value: 'Projetos' } });
        const result = screen.getByRole('option', { name: /Projetos/ });
        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
        act(() => result.dispatchEvent(clickEvent));

        expect(clickEvent.defaultPrevented).toBe(true);
        expect(onSelect).toHaveBeenCalledWith({ id: '/projetos', label: 'Projetos', category: 'Gestão' });
        expect(screen.queryByRole('option', { name: /Projetos/ })).not.toBeInTheDocument();
    });

    it('sem callback, mantém um href real sem cancelar a navegação', () => {
        customRender(
            <SarakShellSearchWidget
                variant="bar"
                onClick={vi.fn()}
                items={[{ id: '#/projetos', label: 'Projetos' }]}
            />,
        );
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Projetos' } });
        const result = screen.getByRole('option', { name: /Projetos/ });
        expect(result).toHaveAttribute('href', '#/projetos');
        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
        act(() => result.dispatchEvent(clickEvent));
        expect(clickEvent.defaultPrevented).toBe(false);
        expect(screen.queryByRole('option', { name: /Projetos/ })).not.toBeInTheDocument();
    });

    it('o combobox expõe a lista e o resultado ativo; setas + Enter usam o callback', () => {
        const onSelect = vi.fn();
        customRender(
            <SarakShellSearchWidget
                variant="bar"
                onClick={vi.fn()}
                onSelect={onSelect}
                items={[{ id: '/a', label: 'Alpha' }, { id: '/b', label: 'Beta' }]}
            />,
        );
        const input = screen.getByRole('combobox');
        fireEvent.change(input, { target: { value: 'a' } });
        expect(input).toHaveAttribute('aria-controls', screen.getByRole('listbox').id);
        expect(input).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: /Alpha/ }).id);
        fireEvent.keyDown(input, { key: 'ArrowDown' });
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(onSelect).toHaveBeenCalledWith({ id: '/b', label: 'Beta' });
    });

    it('mostra o atalho só enquanto o campo está vazio e sem foco', () => {
        customRender(<SarakShellSearchWidget variant="bar" onClick={vi.fn()} />);
        const input = screen.getByRole('combobox');
        expect(screen.getByTestId('sarak-shell-search-shortcut')).toBeInTheDocument();
        expect(screen.getByTestId('sarak-shell-search-shortcut')).toHaveTextContent('Ctrl+K');
        fireEvent.focus(input);
        expect(screen.queryByTestId('sarak-shell-search-shortcut')).not.toBeInTheDocument();
        expect(input.style.boxShadow).toContain('var(--sarak-focus-width, 2px)');
        fireEvent.blur(input);
        fireEvent.change(input, { target: { value: 'busca' } });
        expect(screen.queryByTestId('sarak-shell-search-shortcut')).not.toBeInTheDocument();
    });
});

// os textos da própria lib seguem o idioma que vale.
describe('ShellSearchWidget — idioma que vale', () => {
    it('sai em inglês com `config.language: "en"`', () => {
        render(
            <SarakUIProvider config={{ language: 'en' }}>
                <SarakShellSearchWidget variant="bar" onClick={vi.fn()} />
            </SarakUIProvider>,
        );
        expect(screen.getByPlaceholderText('Smart search…')).toBeInTheDocument();
    });

    it('sem Provider, a variante icon sai em português (R34)', () => {
        render(<SarakShellSearchWidget variant="icon" onClick={vi.fn()} />);
        expect(screen.getByRole('button', { name: /Buscar…/i })).toBeInTheDocument();
    });
});

describe('ShellSearchWidget — teclado de busca no celular', () => {
    it('o campo da variante bar é type="search" e a tecla de ação do teclado é "Buscar"', () => {
        customRender(<SarakShellSearchWidget variant="bar" onClick={vi.fn()} />);
        const input = screen.getByPlaceholderText('Busca inteligente…');
        expect(input).toHaveAttribute('type', 'search');
        expect(input).toHaveAttribute('enterkeyhint', 'search');
    });
});
