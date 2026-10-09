import React from 'react';
import { describe, it, expect } from 'vitest';
import * as ComponentModule from '../SarakSelect';
import { render, screen } from '@testing-library/react';
import { SarakSelect } from '../SarakSelect';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

// O SarakSelect lê o design pelo Provider (`useSarakUI`), então estes testes o montam dentro dele.
const renderSelect = (ui: React.ReactElement) => render(<SarakUIProvider>{ui}</SarakUIProvider>);

describe('SarakSelect', () => {
    it('should be defined and export its contents without crashing', () => {
        expect(ComponentModule).toBeDefined();
        // TODO: Injetar testes de montagem profunda caso o componente cresça em complexidade
    });
});

describe('Erro de campo pelo SarakFieldError', () => {
    it('com `error`, há um role="alert" com o texto e o controle o referencia', () => {
        renderSelect(<SarakSelect error="Campo obrigatório"><option>a</option></SarakSelect>);
        const alert = screen.getByRole('alert');
        expect(alert).toHaveTextContent('Campo obrigatório');
        expect(alert.querySelector('svg')).not.toBeNull();
        expect(alert.id).toMatch(/-error$/);
        expect(screen.getByRole('combobox')).toHaveAttribute('aria-describedby', alert.id);
    });

    it('sem `error`, nada é renderizado', () => {
        renderSelect(<SarakSelect ><option>a</option></SarakSelect>);
        expect(screen.queryByRole('alert')).toBeNull();
    });
});

describe('SarakSelect — sem Provider (R34)', () => {
    it('renderiza sem SarakUIProvider, com o default de borda aplicado', () => {
        render(<SarakSelect aria-label="País"><option>Brasil</option></SarakSelect>);

        expect(screen.getByRole('combobox').style.border).toContain('1px solid');
    });
});

describe('SarakSelect — rótulo', () => {
    it('com `label`, o rótulo fica ligado ao controle', () => {
        renderSelect(<SarakSelect label="País"><option>Brasil</option></SarakSelect>);

        expect(screen.getByLabelText('País')).toBe(screen.getByRole('combobox'));
    });

    it('respeita o `id` informado', () => {
        renderSelect(<SarakSelect id="pais" label="País"><option>Brasil</option></SarakSelect>);

        expect(screen.getByLabelText('País')).toHaveAttribute('id', 'pais');
    });

    it('com `error`, o campo fica inválido e aria-describedby aponta para a mensagem', () => {
        renderSelect(<SarakSelect label="País" error="Escolha um país"><option>Brasil</option></SarakSelect>);

        const select = screen.getByRole('combobox');
        expect(select).toHaveAttribute('aria-invalid', 'true');
        expect(select).toHaveAttribute('aria-describedby', screen.getByRole('alert').id);
    });

    it('sem `label`, não há rótulo visível', () => {
        const { container } = renderSelect(<SarakSelect aria-label="Sem rótulo"><option>a</option></SarakSelect>);

        expect(container.querySelector('label')).toBeNull();
    });
});
