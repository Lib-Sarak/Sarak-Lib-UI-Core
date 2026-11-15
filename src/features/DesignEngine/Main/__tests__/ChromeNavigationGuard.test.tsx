import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { SarakAppChrome } from '../../../../components/Layout/SarakAppChrome';
import SarakUIProvider from '../../../../core/Provider/SarakUIProvider';
import { SarakDeviceProvider, type SarakDeviceType } from '../../../../core/Provider/DeviceProvider';
import { useLeavePanelGuard } from '../hooks/useLeavePanelGuard';
import { LeavePanelDialog } from '../components/LeavePanelDialog';

const NAV = [{ label: 'Propostas', route: '/propostas' }, { label: 'Design', route: '/design' }];

afterEach(() => localStorage.clear());

/** O par que o painel monta: o guarda (com o rascunho que ele tem) e a pergunta de três escolhas. */
const PanelStandIn: React.FC<{ isDirty: boolean; onApply: () => void; onDiscard: () => void }> = ({ isDirty, onApply, onDiscard }) => {
    const guard = useLeavePanelGuard({ isDirty, onApply, onDiscard });
    return <LeavePanelDialog isOpen={guard.isAsking} onChoose={guard.choose} />;
};

const setup = (device: SarakDeviceType, isDirty: boolean) => {
    const onNavigate = vi.fn();
    const onApply = vi.fn();
    const onDiscard = vi.fn();
    render(
        <SarakUIProvider config={{ mode: 'dark' }}>
            <SarakDeviceProvider overrideDevice={device}>
                <SarakAppChrome nav={NAV} activeRoute="/design" onNavigate={onNavigate}>
                    <PanelStandIn isDirty={isDirty} onApply={onApply} onDiscard={onDiscard} />
                </SarakAppChrome>
            </SarakDeviceProvider>
        </SarakUIProvider>,
    );
    return { onNavigate, onApply, onDiscard };
};

const clickProposals = async () => { await act(async () => { fireEvent.click(screen.getByText('Propostas')); }); };
const choose = async (id: string) => { await act(async () => { fireEvent.click(screen.getByTestId(`sarak-panel-leave-${id}`)); }); };

describe('SarakAppChrome — o guarda de navegação do painel', () => {
    it('rascunho limpo: a rota muda na hora e nada é perguntado', async () => {
        const { onNavigate } = setup('desktop', false);
        await clickProposals();
        expect(onNavigate).toHaveBeenCalledWith('/propostas');
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('rascunho sujo: pergunta, e o `onNavigate` do host não é chamado antes da escolha', async () => {
        const { onNavigate } = setup('desktop', true);
        await clickProposals();
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(onNavigate).not.toHaveBeenCalled();
    });

    it('"Ficar no painel": não navega e não mexe no rascunho', async () => {
        const { onNavigate, onApply, onDiscard } = setup('desktop', true);
        await clickProposals();
        await choose('stay');
        expect(onNavigate).not.toHaveBeenCalled();
        expect(onApply).not.toHaveBeenCalled();
        expect(onDiscard).not.toHaveBeenCalled();
    });

    it('"Descartar e sair": descarta e navega', async () => {
        const { onNavigate, onDiscard, onApply } = setup('desktop', true);
        await clickProposals();
        await choose('discard');
        expect(onDiscard).toHaveBeenCalledTimes(1);
        expect(onApply).not.toHaveBeenCalled();
        expect(onNavigate).toHaveBeenCalledWith('/propostas');
    });

    it('"Aplicar e sair": aplica e navega', async () => {
        const { onNavigate, onApply, onDiscard } = setup('desktop', true);
        await clickProposals();
        await choose('apply');
        expect(onApply).toHaveBeenCalledTimes(1);
        expect(onDiscard).not.toHaveBeenCalled();
        expect(onNavigate).toHaveBeenCalledWith('/propostas');
    });

    it('a barra de topo (tablet) passa pelo mesmo guarda', async () => {
        const { onNavigate } = setup('tablet', true);
        await clickProposals();
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(onNavigate).not.toHaveBeenCalled();
    });
});
