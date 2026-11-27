import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DynamicTokenControl } from '../DynamicTokenControl';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import type { SarakDesignToken } from '../../../../core/Design/types';

const responsivo = { id: 'tk_resp', type: 'slider', defaultValue: 10, label: 'Tamanho', isResponsive: true } as unknown as SarakDesignToken;
const fixo = { id: 'tk_fixo', type: 'slider', defaultValue: 10, label: 'Tamanho' } as unknown as SarakDesignToken;

const withProvider = (ui: React.ReactElement) => render(<SarakUIProvider>{ui}</SarakUIProvider>);

describe('DynamicTokenControl — selo de dispositivo', () => {
    it.each([
        ['smartphone', /mobile/i],
        ['tablet', /tablet/i],
        ['desktop', /desktop/i],
    ])('token responsivo mostra o selo do dispositivo %s', (device, texto) => {
        withProvider(<DynamicTokenControl token={responsivo} draft={{}} updateDraft={vi.fn()} previewDevice={device} />);
        expect(screen.getByTestId('token-device-badge')).toHaveTextContent(texto);
    });

    it('token não responsivo não mostra selo', () => {
        withProvider(<DynamicTokenControl token={fixo} draft={{}} updateDraft={vi.fn()} previewDevice="tablet" />);
        expect(screen.queryByTestId('token-device-badge')).toBeNull();
    });

    it('com a prévia no mobile, mexer no controle muda só o ponto `mob` e há um único slider', async () => {
        const updateDraft = vi.fn();
        const draft = { tk_resp: { desk: 30, tab: 20, mob: 10 } };
        withProvider(<DynamicTokenControl token={responsivo} draft={draft as never} updateDraft={updateDraft} previewDevice="smartphone" />);
        const slider = screen.getByRole('slider');
        expect(screen.getAllByRole('slider')).toHaveLength(1);
        expect(slider).toHaveValue('10');
        fireEvent.change(slider, { target: { value: '55' } });
        await waitFor(() => expect(updateDraft).toHaveBeenCalled());
        expect(updateDraft).toHaveBeenLastCalledWith('tk_resp', { desk: 30, tab: 20, mob: 55 });
    });
});
