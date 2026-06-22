import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SarakContextMenu } from '../SarakContextMenu';

describe('Spec 13 — SarakContextMenu (Regra 5)', () => {
    it('deve abrir na posição e renderizar em portal (escapando do overflow)', () => {
        render(
            <SarakContextMenu isOpen position={{ x: 50, y: 60 }} onClose={() => undefined}>
                <button>Editar</button>
            </SarakContextMenu>,
        );
        const menu = screen.getByRole('menu');
        expect(menu).toBeInTheDocument();
        // Portal: renderizado direto no body, não dentro de um wrapper local.
        expect(menu.parentElement).toBe(document.body);
    });

    it('deve fechar ao clicar fora (Critério: some ao clicar em outro lugar)', () => {
        const onClose = vi.fn();
        render(
            <SarakContextMenu isOpen position={{ x: 10, y: 10 }} onClose={onClose}>
                <button>Editar</button>
            </SarakContextMenu>,
        );
        fireEvent.mouseDown(document.body);
        expect(onClose).toHaveBeenCalled();
    });

    it('deve fechar no ESC', () => {
        const onClose = vi.fn();
        render(
            <SarakContextMenu isOpen position={{ x: 10, y: 10 }} onClose={onClose}>
                <button>Editar</button>
            </SarakContextMenu>,
        );
        fireEvent.keyDown(document, { key: 'Escape' });
        expect(onClose).toHaveBeenCalled();
    });

    it('não renderiza quando fechado', () => {
        render(
            <SarakContextMenu isOpen={false} position={{ x: 0, y: 0 }} onClose={() => undefined}>
                <button>Editar</button>
            </SarakContextMenu>,
        );
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
});
