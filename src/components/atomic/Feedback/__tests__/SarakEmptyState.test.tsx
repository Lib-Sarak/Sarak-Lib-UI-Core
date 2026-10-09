import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SarakEmptyState } from '../SarakEmptyState';
import { SarakButton } from '../../Buttons/SarakButton';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

describe('SarakEmptyState', () => {
    it('renderiza título, descrição, ícone e ação compostos', () => {
        render(
            <SarakEmptyState
                title="Acesso restrito"
                description="Peça acesso ao responsável pelo espaço."
                icon={<span aria-hidden="true">🔒</span>}
                action={<SarakButton>Solicitar acesso</SarakButton>}
            />,
        );

        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Acesso restrito' })).toBeInTheDocument();
        expect(screen.getByText('Peça acesso ao responsável pelo espaço.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Solicitar acesso' })).toBeInTheDocument();
    });
});

// os textos da própria lib seguem o idioma que vale.
describe('SarakEmptyState — idioma que vale', () => {
    it('a variante minimal sai em português por padrão', () => {
        render(
            <SarakUIProvider>
                <SarakEmptyState type="minimal" />
            </SarakUIProvider>,
        );
        expect(screen.getByText('Aguardando interação do sistema…')).toBeInTheDocument();
    });

    it('a variante minimal sai em inglês com `config.language: "en"`', () => {
        render(
            <SarakUIProvider config={{ language: 'en' }}>
                <SarakEmptyState type="minimal" />
            </SarakUIProvider>,
        );
        expect(screen.getByText('Waiting for system interaction…')).toBeInTheDocument();
    });

    it('a variante geometric sai em português por padrão', () => {
        render(
            <SarakUIProvider>
                <SarakEmptyState type="geometric" />
            </SarakUIProvider>,
        );
        expect(screen.getByText('VAZIO')).toBeInTheDocument();
        expect(screen.getByText('Inicie um módulo na barra de ferramentas')).toBeInTheDocument();
    });

    it('a variante default (abstract) sai em português por padrão', () => {
        const { container } = render(
            <SarakUIProvider>
                <SarakEmptyState />
            </SarakUIProvider>,
        );
        expect(container.textContent).toContain('O ecossistema está em equilíbrio.');
        expect(container.textContent).toContain('Nenhum sinal detectado na janela principal.');
    });
});
