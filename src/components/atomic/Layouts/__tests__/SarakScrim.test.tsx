import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { SarakScrim } from '../SarakScrim';

describe('SarakScrim', () => {
    it('é um <button> nativo com o rótulo acessível recebido', () => {
        const { getByRole } = render(<SarakScrim onClose={() => {}} ariaLabel="Fechar menu" />);
        const scrim = getByRole('button', { name: 'Fechar menu' });
        expect(scrim.tagName).toBe('BUTTON');
        expect(scrim).toHaveAttribute('type', 'button');
        expect(scrim.tabIndex).not.toBe(-1);
    });

    it('clique chama onClose', () => {
        const onClose = vi.fn();
        const { getByRole } = render(<SarakScrim onClose={onClose} ariaLabel="Fechar menu" />);
        fireEvent.click(getByRole('button', { name: 'Fechar menu' }));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('cobre a tela cheia atrás do overlay (fixed inset-0)', () => {
        const { getByRole } = render(<SarakScrim onClose={() => {}} ariaLabel="Fechar menu" />);
        const scrim = getByRole('button', { name: 'Fechar menu' });
        expect(scrim.className).toContain('fixed');
        expect(scrim.className).toContain('inset-0');
    });
});
