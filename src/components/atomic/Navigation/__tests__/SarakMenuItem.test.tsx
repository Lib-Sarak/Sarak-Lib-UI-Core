import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SarakMenuItem } from '../SarakMenuItem';

describe('SarakMenuItem', () => {
    it('monta sem SarakUIProvider (é átomo)', () => {
        expect(() => render(<SarakMenuItem label="Módulo" />)).not.toThrow();
        expect(screen.getByRole('button', { name: 'Módulo' })).toBeInTheDocument();
    });

    it('métrica de LISTA, não de botão de ação: sem uppercase/tracking-widest/font-black', () => {
        render(<SarakMenuItem label="Módulo" />);
        const item = screen.getByRole('button', { name: 'Módulo' });
        const classes = item.className.split(' ');
        expect(classes).not.toContain('uppercase');
        expect(classes).not.toContain('tracking-widest');
        expect(classes).not.toContain('font-black');
        expect(classes).not.toContain('py-4');
        expect(classes).not.toContain('px-6');
    });

    it('orientação vertical resolve largura cheia NA ORIGEM — nunca emite min-w-fit', () => {
        render(<SarakMenuItem label="Módulo" />);
        const classes = screen.getByRole('button', { name: 'Módulo' }).className.split(' ');
        expect(classes).toContain('w-full');
        expect(classes).not.toContain('w-max');
        expect(classes).not.toContain('min-w-fit');
    });

    it('rótulo longo trunca (classe truncate no span de rótulo)', () => {
        render(<SarakMenuItem label="Um rótulo de módulo bem comprido, maior que a sidebar" />);
        const label = screen.getByText('Um rótulo de módulo bem comprido, maior que a sidebar');
        expect(label.className).toContain('truncate');
    });

    it('estado ativo: aria-current="page" e tom de destaque', () => {
        render(<SarakMenuItem label="Módulo" active />);
        const item = screen.getByRole('button', { name: 'Módulo' });
        expect(item).toHaveAttribute('aria-current', 'page');
    });

    it('estado inativo: sem aria-current', () => {
        render(<SarakMenuItem label="Módulo" />);
        expect(screen.getByRole('button', { name: 'Módulo' })).not.toHaveAttribute('aria-current');
    });

    it('desabilitado/offline: atributo disabled e onClick não dispara', () => {
        const onClick = vi.fn();
        render(<SarakMenuItem label="Módulo" disabled onClick={onClick} />);
        const item = screen.getByRole('button', { name: 'Módulo' });
        expect(item).toBeDisabled();
    });

    it('colapsado: some o rótulo, mantém o ícone', () => {
        render(<SarakMenuItem label="Módulo" icon={<span data-testid="icon" />} collapsed />);
        expect(screen.queryByText('Módulo')).not.toBeInTheDocument();
        expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('orientação horizontal: aba compacta, sem w-full', () => {
        render(<SarakMenuItem label="Aba" orientation="horizontal" />);
        const classes = screen.getByRole('button', { name: 'Aba' }).className.split(' ');
        expect(classes).not.toContain('w-full');
        expect(classes).toContain('shrink-0');
    });

    it('a className do chamador VENCE os defaults do átomo — merge, não concatenação', () => {
        render(<SarakMenuItem label="Módulo" className="text-lg" />);
        const classes = screen.getByRole('button', { name: 'Módulo' }).className.split(' ');
        expect(classes).toContain('text-lg');
        expect(classes).not.toContain('text-sm');
    });

    it('title cai para o texto do rótulo quando não informado', () => {
        render(<SarakMenuItem label="Módulo" />);
        expect(screen.getByRole('button', { name: 'Módulo' })).toHaveAttribute('title', 'Módulo');
    });
});
