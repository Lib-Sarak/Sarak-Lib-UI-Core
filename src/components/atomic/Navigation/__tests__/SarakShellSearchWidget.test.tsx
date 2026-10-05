import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

    it('selecionar resultado clicável chama onSelect com o item e fecha a lista', () => {
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
        const result = screen.getByRole('link', { name: /Projetos/ });

        fireEvent.click(result);
        expect(onSelect).toHaveBeenCalledWith({ id: '/projetos', label: 'Projetos', category: 'Gestão' });
        expect(screen.queryByRole('link', { name: /Projetos/ })).not.toBeInTheDocument();
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
