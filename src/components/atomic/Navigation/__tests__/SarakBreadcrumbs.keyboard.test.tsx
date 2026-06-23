import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SarakBreadcrumbs } from '../SarakBreadcrumbs';

const items = [
    { label: 'Início', href: '/' },
    { label: 'Seção', href: '/secao' },
    { label: 'Atual' },
];

describe('SarakBreadcrumbs — teclado (Spec 41, Regra 3)', () => {
    it('Enter e Espaço ativam um item interativo como o clique', () => {
        const onNavigate = vi.fn();
        render(<SarakBreadcrumbs items={items} onNavigate={onNavigate} />);
        const link = screen.getByText('Início');

        fireEvent.keyDown(link, { key: 'Enter' });
        expect(onNavigate).toHaveBeenCalledWith('/');

        fireEvent.keyDown(link, { key: ' ' });
        expect(onNavigate).toHaveBeenCalledTimes(2);
    });

    it('o item atual (último) não é focável nem ativável', () => {
        const onNavigate = vi.fn();
        render(<SarakBreadcrumbs items={items} onNavigate={onNavigate} />);
        const current = screen.getByText('Atual');
        expect(current).not.toHaveAttribute('tabindex');
        fireEvent.keyDown(current, { key: 'Enter' });
        expect(onNavigate).not.toHaveBeenCalled();
    });
});
