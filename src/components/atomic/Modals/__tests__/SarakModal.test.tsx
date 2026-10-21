import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SarakModal, type SarakModalSize } from '../SarakModal';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

describe('SarakModal', () => {
    it('mantém a largura padrão equivalente aos 32rem anteriores', () => {
        render(<SarakUIProvider><SarakModal isOpen onClose={() => undefined} title="Detalhes">Conteúdo</SarakModal></SarakUIProvider>);

        const dialog = screen.getByRole('dialog', { name: 'Detalhes' });
        expect(dialog.dataset.size).toBe('lg');
        expect(dialog.className).toContain('max-w-lg');
        expect(dialog.style.maxWidth).toMatchInlineSnapshot('"var(--sarak-modal-width-lg)"');
    });

    it.each<SarakModalSize>(['sm', 'md', 'lg', 'xl', 'full'])(
        'aplica a largura tokenizada %s',
        (size) => {
            render(<SarakUIProvider><SarakModal isOpen onClose={() => undefined} size={size} title="Largura">Conteúdo</SarakModal></SarakUIProvider>);

            expect(screen.getByRole('dialog', { name: 'Largura' }).style.maxWidth)
                .toContain(`--sarak-modal-width-${size}`);
        },
    );
});
