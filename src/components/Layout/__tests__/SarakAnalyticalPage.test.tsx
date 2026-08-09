import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import * as ComponentModule from '../SarakAnalyticalPage';
import { SarakAnalyticalPage } from '../SarakAnalyticalPage';
import { DeviceProvider } from '../../../core/Provider/DeviceProvider';

describe('SarakAnalyticalPage', () => {
    it('should be defined and export its contents without crashing', () => {
        expect(ComponentModule).toBeDefined();
        // TODO: Injetar testes de montagem profunda caso o componente cresça em complexidade
    });

    // Caracterização (R10 — lote 10): os 4 botões nativos só existem no ramo mobile
    // (navBar/sidePanel viram drawer). Sem forçar `device=smartphone` o teste "passa"
    // sem exercitar nenhum deles — é o mesmo cuidado que o lote 9 já tinha registrado.
    describe('drawers mobile (device=smartphone)', () => {
        const renderMobile = () =>
            render(
                <DeviceProvider overrideDevice="smartphone">
                    <SarakAnalyticalPage
                        navBar={<div>Nav de verdade</div>}
                        sidePanel={<div>Painel de verdade</div>}
                        mainContent={<div>Conteúdo</div>}
                    />
                </DeviceProvider>,
            );

        it('abre o drawer de navegação ao clicar no botão de menu', () => {
            renderMobile();
            expect(screen.queryByText('Nav de verdade')).not.toBeInTheDocument();
            fireEvent.click(screen.getByLabelText('Abrir menu de navegação'));
            expect(screen.getByText('Nav de verdade')).toBeInTheDocument();
        });

        it('fecha o drawer de navegação ao clicar no botão de fechar', () => {
            renderMobile();
            fireEvent.click(screen.getByLabelText('Abrir menu de navegação'));
            expect(screen.getByText('Nav de verdade')).toBeInTheDocument();
            fireEvent.click(screen.getByLabelText('Fechar menu de navegação'));
            expect(screen.queryByText('Nav de verdade')).not.toBeInTheDocument();
        });

        it('abre e fecha o drawer do painel lateral pelos botões dedicados', () => {
            renderMobile();
            expect(screen.queryByText('Painel de verdade')).not.toBeInTheDocument();
            fireEvent.click(screen.getByLabelText('Abrir painel lateral'));
            expect(screen.getByText('Painel de verdade')).toBeInTheDocument();
            fireEvent.click(screen.getByLabelText('Fechar painel lateral'));
            expect(screen.queryByText('Painel de verdade')).not.toBeInTheDocument();
        });
    });
});
