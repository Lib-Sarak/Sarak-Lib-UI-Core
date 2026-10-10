import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HyperGranularityTab } from '../HyperGranularityTab';

vi.mock('../../../../core/Provider/SarakUIProvider', () => ({
    useSarakUI: () => ({})
}));

describe('HyperGranularityTab', () => {
    it('should be defined and export its contents without crashing', () => {
        expect(HyperGranularityTab).toBeDefined();
    });

    const baseProps = () => ({
        draft: {},
        updateDraft: vi.fn(),
        handleApplyToSystem: vi.fn(),
        resetComponent: vi.fn(),
        resetToken: vi.fn(),
        toast: null
    });

    it('não oferece botão para gravar o rascunho no Command Center', () => {
        render(<HyperGranularityTab {...baseProps()} draft={{ primaryColor: '#fff' }} />);

        expect(screen.queryByRole('button', { name: 'Aplicar Soberania' })).toBeNull();
    });

    it('plan-37 (correção): exibe o toast recebido por prop (não um estado local de useDesignDraft)', () => {
        render(<HyperGranularityTab {...baseProps()} toast={{ type: 'success', message: 'Design aplicado ao sistema com sucesso.' }} />);

        expect(screen.getByText('Design aplicado ao sistema com sucesso.')).toBeDefined();
    });
});
