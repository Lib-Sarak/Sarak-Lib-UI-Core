import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SarakModal } from '../SarakModal';
import { sarakGetAllDesignTokens } from '../../../../core/Design/master-map';

const defaultOf = (id: string): unknown => sarakGetAllDesignTokens().find((item) => item.id === id)?.defaultValue;
const BLUR_PX = 8;

describe('SarakModal — véu e superfície governados por token', () => {
    it('o véu lê --sarak-modal-blur (modalOverlayBlur) no desfoque', () => {
        render(<SarakModal isOpen onClose={() => undefined} title="Aviso">Corpo</SarakModal>);
        const scrim = screen.getByRole('dialog', { name: 'Aviso' }).previousElementSibling;
        expect(scrim?.className).toContain('backdrop-blur-[var(--sarak-modal-blur,8px)]');
    });

    it('o painel lê --sarak-bg-modal (colorBgModal) e cai na superfície do tema', () => {
        render(<SarakModal isOpen onClose={() => undefined} title="Aviso">Corpo</SarakModal>);
        expect(screen.getByRole('dialog', { name: 'Aviso' }).className)
            .toContain('bg-[var(--sarak-bg-modal,var(--theme-surface))]');
    });

    it('o véu lê a cor do token modalOverlayColor (--sarak-modal-overlay-color), não um preto fixo', () => {
        render(<SarakModal isOpen onClose={() => undefined} title="Aviso">Corpo</SarakModal>);
        const scrim = screen.getByRole('dialog', { name: 'Aviso' }).previousElementSibling;
        expect(scrim?.className).toContain('bg-[var(--sarak-modal-overlay-color,rgba(0,0,0,0.4))]');
        expect(scrim?.className).not.toContain('bg-black/60');
    });

    it('os defaults do schema reproduzem o desenho de antes (8px de blur; superfície do tema)', () => {
        expect(defaultOf('modalOverlayBlur')).toBe(BLUR_PX);
        expect(defaultOf('colorBgModal')).toBe('var(--theme-surface)');
    });
});
