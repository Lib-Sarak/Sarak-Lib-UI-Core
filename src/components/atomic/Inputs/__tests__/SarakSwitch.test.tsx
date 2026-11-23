import React from 'react';
import { render as rtlRender, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import * as ComponentModule from '../SarakSwitch';
import { SarakSwitch } from '../SarakSwitch';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

const render = (ui: React.ReactElement) => rtlRender(<SarakUIProvider>{ui}</SarakUIProvider>);

describe('SarakSwitch', () => {
    it('exporta o componente', () => {
        expect(ComponentModule.SarakSwitch).toBeDefined();
    });

    it('com label e description, o nome acessível é só o label', () => {
        render(<SarakSwitch label="Ver pessoas" description="Mostra quem está online" onChange={() => {}} />);
        expect(screen.getByRole('switch', { name: 'Ver pessoas' })).toBeInTheDocument();
    });

    it('a descrição é a descrição acessível do controle', () => {
        render(<SarakSwitch label="Ver pessoas" description="Mostra quem está online" onChange={() => {}} />);
        expect(screen.getByRole('switch')).toHaveAccessibleDescription('Mostra quem está online');
    });

    it('mantém textos e ordem na tela: rótulo antes da descrição', () => {
        const { container } = render(<SarakSwitch label="Ver pessoas" description="Mostra quem está online" onChange={() => {}} />);
        const spans = Array.from(container.querySelectorAll('label span')).map((el) => el.textContent);
        expect(spans).toEqual(['Ver pessoas', 'Mostra quem está online']);
    });

    it('clicar no texto do rótulo continua alternando o controle', async () => {
        const onChange = vi.fn();
        render(<SarakSwitch label="Ver pessoas" description="Mostra quem está online" onChange={onChange} />);
        await userEvent.click(screen.getByText('Ver pessoas'));
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('clicar na descrição também alterna (faz parte do rótulo clicável)', async () => {
        const onChange = vi.fn();
        render(<SarakSwitch label="Ver pessoas" description="Mostra quem está online" onChange={onChange} />);
        await userEvent.click(screen.getByText('Mostra quem está online'));
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('sem label, o aria-label de quem chama é o nome', () => {
        render(<SarakSwitch aria-label="Notificações" onChange={() => {}} />);
        expect(screen.getByRole('switch', { name: 'Notificações' })).toBeInTheDocument();
    });

    it('com label e aria-label de quem chama, o aria-label vence', () => {
        render(<SarakSwitch label="Ver pessoas" aria-label="Pessoas" onChange={() => {}} />);
        expect(screen.getByRole('switch', { name: 'Pessoas' })).toBeInTheDocument();
    });

    it('só com description (sem label), a descrição não vira o nome', () => {
        render(<SarakSwitch description="Mostra quem está online" aria-label="Pessoas" onChange={() => {}} />);
        expect(screen.getByRole('switch', { name: 'Pessoas' })).toHaveAccessibleDescription('Mostra quem está online');
    });
});
