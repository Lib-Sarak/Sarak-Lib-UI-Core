import React from 'react';
import { fireEvent, render, screen, type RenderResult } from '@testing-library/react';
import { expect, it } from 'vitest';
import { SarakOverlayProvider, useOverlay, type SarakOverlayController } from '../SarakOverlayProvider';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

const OpenModalButton: React.FC = (): React.ReactElement => {
    const overlay = useOverlay();
    return <button onClick={() => overlay.open({ kind: 'modal', title: 'Olá', message: 'corpo' })}>abrir</button>;
};

const ConfirmButton = ({ onStart }: { onStart: (confirmation: Promise<boolean>) => void }): React.ReactElement => {
    const overlay = useOverlay();
    return <button onClick={() => onStart(overlay.confirm({ title: 'Excluir registro?', message: 'Esta ação não pode ser desfeita.', tone: 'danger' }))}>confirmar ação</button>;
};

const OverlayProbe = ({ onReady }: { onReady: (controller: SarakOverlayController) => void }): React.ReactElement | null => {
    const controller = useOverlay();
    React.useEffect(() => onReady(controller), [controller, onReady]);
    return null;
};

const renderConfirmingOverlay = (onStart: (confirmation: Promise<boolean>) => void): RenderResult => render(
    <SarakUIProvider>
        <SarakOverlayProvider>
            <ConfirmButton onStart={onStart} />
        </SarakOverlayProvider>
    </SarakUIProvider>,
);

it('abre um modal com título e mensagem via controller', () => {
    render(<SarakUIProvider><SarakOverlayProvider><OpenModalButton /></SarakOverlayProvider></SarakUIProvider>);
    expect(screen.queryByText('corpo')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('abrir'));
    expect(screen.getByText('Olá')).toBeInTheDocument();
    expect(screen.getByText('corpo')).toBeInTheDocument();
});

it('useOverlay() sem Provider devolve operações no-op', async () => {
    let controller!: SarakOverlayController;
    render(<OverlayProbe onReady={(value) => { controller = value; }} />);
    expect(typeof controller.open).toBe('function');
    expect(typeof controller.close).toBe('function');
    await expect(controller.confirm({ title: 'Confirmação', message: 'Teste' })).resolves.toBe(false);
});

it('resolve true ao confirmar e devolve o foco ao disparador', async () => {
    let confirmation: Promise<boolean> | undefined;
    renderConfirmingOverlay((promise) => { confirmation = promise; });
    const trigger = screen.getByRole('button', { name: 'confirmar ação' });
    trigger.focus();
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Excluir registro?' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
    await expect(confirmation).resolves.toBe(true);
    expect(trigger).toHaveFocus();
});

it('resolve false ao pressionar Escape e devolve o foco ao disparador', async () => {
    let confirmation: Promise<boolean> | undefined;
    renderConfirmingOverlay((promise) => { confirmation = promise; });
    const trigger = screen.getByRole('button', { name: 'confirmar ação' });
    trigger.focus();
    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: 'Escape' });
    await expect(confirmation).resolves.toBe(false);
    expect(trigger).toHaveFocus();
});

it('resolve false ao cancelar e ao fechar pelo controle do modal', async () => {
    let confirmation: Promise<boolean> | undefined;
    renderConfirmingOverlay((promise) => { confirmation = promise; });
    fireEvent.click(screen.getByRole('button', { name: 'confirmar ação' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    await expect(confirmation).resolves.toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'confirmar ação' }));
    fireEvent.click(screen.getByRole('button', { name: 'Fechar modal' }));
    await expect(confirmation).resolves.toBe(false);
});
