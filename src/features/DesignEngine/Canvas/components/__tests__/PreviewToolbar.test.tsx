import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PreviewToolbar } from '../PreviewToolbar';

const createProps = (overrides: Partial<React.ComponentProps<typeof PreviewToolbar>> = {}) => ({
    previewDevice: 'desktop' as const,
    setPreviewDevice: vi.fn(),
    isPreviewStacked: false,
    setIsPreviewStacked: vi.fn(),
    isGalleryOpen: true,
    ...overrides
});

describe('PreviewToolbar', () => {
    it('expõe os três dispositivos e encaminha a troca ao estado do preview', async () => {
        const user = userEvent.setup();
        const setPreviewDevice = vi.fn();
        render(<PreviewToolbar {...createProps({ setPreviewDevice })} />);

        await user.click(screen.getByRole('button', { name: 'Tablet' }));

        expect(screen.getByRole('group', { name: 'Dispositivo do preview' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Desktop' })).toHaveAttribute('aria-pressed', 'true');
        expect(setPreviewDevice).toHaveBeenCalledWith('tablet');
    });

    it('alterna Empilhar previews por switch acessível', async () => {
        const user = userEvent.setup();
        const setIsPreviewStacked = vi.fn();
        render(<PreviewToolbar {...createProps({ setIsPreviewStacked })} />);

        const stackSwitch = screen.getByRole('switch', { name: 'Empilhar previews' });
        expect(stackSwitch).toHaveAttribute('aria-disabled', 'false');
        await user.click(stackSwitch);

        expect(setIsPreviewStacked).toHaveBeenCalledWith(true);
    });

    it('desativa o empilhamento e explica o motivo enquanto a galeria está fechada', async () => {
        const setIsPreviewStacked = vi.fn();
        render(<PreviewToolbar {...createProps({ isGalleryOpen: false, isPreviewStacked: true, setIsPreviewStacked })} />);

        const stackSwitch = screen.getByRole('switch', { name: 'Empilhar previews' });
        expect(stackSwitch).toBeDisabled();
        expect(stackSwitch).toHaveAttribute('aria-disabled', 'true');
        expect(stackSwitch).toHaveAttribute('aria-checked', 'false');
        expect(stackSwitch).toHaveAttribute('title', 'Abra a galeria de estilos para empilhar os previews.');

        await userEvent.setup().click(stackSwitch);
        expect(setIsPreviewStacked).not.toHaveBeenCalled();
    });
});
