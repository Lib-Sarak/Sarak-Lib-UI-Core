import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import { SarakSearch } from '../SarakSearch';

const renderSearch = (props: Partial<React.ComponentProps<typeof SarakSearch>> = {}) =>
    render(
        <SarakUIProvider>
            <SarakSearch isOpen onClose={() => undefined} {...props} />
        </SarakUIProvider>,
    );

describe('SarakSearch', () => {
    it('não renderiza o campo de busca quando fechado', () => {
        render(
            <SarakUIProvider>
                <SarakSearch isOpen={false} onClose={() => undefined} />
            </SarakUIProvider>,
        );
        expect(screen.queryByPlaceholderText('Search tool, record or configuration...')).not.toBeInTheDocument();
    });

    it('foca o campo de busca automaticamente ao abrir (conserto R10 — plan-22)', async () => {
        renderSearch();
        const input = screen.getByPlaceholderText('Search tool, record or configuration...');
        await waitFor(() => expect(document.activeElement).toBe(input));
    });

    it('atualiza o valor digitado', () => {
        renderSearch();
        const input = screen.getByPlaceholderText('Search tool, record or configuration...') as HTMLInputElement;
        fireEvent.change(input, { target: { value: 'financeiro' } });
        expect(input.value).toBe('financeiro');
    });

    it('fecha com Escape', () => {
        const onClose = vi.fn();
        renderSearch({ onClose });
        fireEvent.keyDown(window, { key: 'Escape' });
        expect(onClose).toHaveBeenCalled();
    });
});
