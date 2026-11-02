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

    it('não escreve o atalho na tela e o declara em aria-keyshortcuts, nas duas variantes', () => {
        const { unmount } = customRender(<SarakShellSearchWidget variant="bar" onClick={vi.fn()} />);
        const input = screen.getByRole('combobox');
        expect(screen.queryByTestId('sarak-shell-search-shortcut')).not.toBeInTheDocument();
        expect(document.body.textContent).not.toMatch(/Ctrl|⌘/);
        expect(document.querySelector('kbd')).toBeNull();
        expect(input).toHaveAttribute('aria-keyshortcuts', 'Control+K');
        fireEvent.focus(input);
        expect(document.querySelector('kbd')).toBeNull();
        expect(input.style.boxShadow).toContain('var(--sarak-focus-width, 2px)');
        unmount();

        customRender(<SarakShellSearchWidget variant="icon" onClick={vi.fn()} />);
        expect(screen.getByRole('button', { name: /Buscar…/i })).toHaveAttribute('aria-keyshortcuts', 'Control+K');
        expect(document.querySelector('kbd')).toBeNull();
    });

    it('no Mac o atalho declarado é Meta+K', () => {
        const userAgent = vi.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)');
        try {
            customRender(<SarakShellSearchWidget variant="icon" onClick={vi.fn()} />);
            expect(screen.getByRole('button', { name: /Buscar…/i })).toHaveAttribute('aria-keyshortcuts', 'Meta+K');
        } finally {
            userAgent.mockRestore();
        }
    });

    it('a barra traz o gatilho em ícone para quando o contêiner não tem espaço, e ele abre a busca', () => {
        const onClick = vi.fn();
        customRender(<SarakShellSearchWidget variant="bar" onClick={onClick} />);
        const trigger = screen.getByRole('button', { name: /Buscar…/i });
        expect(trigger.parentElement!.className).toContain('@max-[10rem]:block');
        fireEvent.click(trigger);
        expect(onClick).toHaveBeenCalledTimes(1);
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

describe('ShellSearchWidget — compacto (lateral recolhida)', () => {
    it('compact mostra só o ícone: o rótulo "Buscar…" sai da tela, e o nome acessível fica', () => {
        render(<SarakUIProvider><SarakShellSearchWidget variant="icon" compact onClick={vi.fn()} /></SarakUIProvider>);
        const trigger = screen.getByRole('button', { name: /Buscar…/i });
        expect(trigger.textContent).toBe('');
    });

    it('sem compact (linha de menu) o rótulo segue à vista', () => {
        render(<SarakUIProvider><SarakShellSearchWidget variant="icon" onClick={vi.fn()} /></SarakUIProvider>);
        expect(screen.getByRole('button', { name: /Buscar…/i }).textContent).toContain('Buscar…');
    });
});
