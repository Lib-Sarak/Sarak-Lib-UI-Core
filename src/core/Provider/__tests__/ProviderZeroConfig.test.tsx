/**
 * Zero-config do feedback declarativo (Spec 08 §2 ↔ Spec 25):
 * o SarakUIProvider monta SarakToastProvider + SarakOverlayProvider sozinho —
 * `trigger_toast`/`open_modal`/`open_drawer` funcionam SEM passo extra do consumidor.
 * (Antes, os hooks degradavam para no-op silencioso na instalação canônica.)
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SarakUIProvider from '../SarakUIProvider';
import { useToast } from '../../../components/atomic/Feedback/SarakToast';
import { useOverlay } from '../../../components/atomic/Modals/SarakOverlayProvider';

const FeedbackProbe: React.FC = () => {
    const toast = useToast();
    const overlay = useOverlay();
    return (
        <div>
            <button type="button" onClick={() => toast.notify({ message: 'toast-zero-config' })}>
                disparar-toast
            </button>
            <button
                type="button"
                onClick={() => overlay.open({ kind: 'modal', title: 'modal-zero-config' })}
            >
                abrir-modal
            </button>
        </div>
    );
};

describe('SarakUIProvider — feedback declarativo zero-config', () => {
    it('toasts funcionam sem montar SarakToastProvider manualmente', async () => {
        render(
            <SarakUIProvider>
                <FeedbackProbe />
            </SarakUIProvider>,
        );
        await act(async () => {
            fireEvent.click(screen.getByText('disparar-toast'));
        });
        expect(await screen.findByText('toast-zero-config')).toBeInTheDocument();
    });

    it('overlays (open_modal) funcionam sem montar SarakOverlayProvider manualmente', async () => {
        render(
            <SarakUIProvider>
                <FeedbackProbe />
            </SarakUIProvider>,
        );
        await act(async () => {
            fireEvent.click(screen.getByText('abrir-modal'));
        });
        expect(await screen.findByText('modal-zero-config')).toBeInTheDocument();
    });
});
