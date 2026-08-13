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

    // plan-37 (correção, achado 2): ANTES este componente instanciava a própria
    // useDesignDraft(sarak), em paralelo à instância de ThemeCustomizationTab — duas
    // fontes de rascunho vivas ao mesmo tempo assim que o Command Center ficou
    // alcançável (a mesma configuração que a plan-36 removeu do MasterControlPanel).
    // Agora recebe tudo por prop; estes testes provam que o componente CONSOME a
    // instância recebida, em vez de criar a própria.
    it('plan-37 (correção): clicar em "Aplicar Soberania" chama o handleApplyToSystem recebido por prop', () => {
        const handleApplyToSystem = vi.fn();
        render(<HyperGranularityTab {...baseProps()} draft={{ primaryColor: '#fff' }} handleApplyToSystem={handleApplyToSystem} />);

        screen.getByText('Aplicar Soberania').click();

        expect(handleApplyToSystem).toHaveBeenCalledTimes(1);
    });

    it('plan-37 (correção): com draft vazio, o botão "Aplicar Soberania" fica desabilitado (reflete o draft recebido, não um estado interno)', () => {
        render(<HyperGranularityTab {...baseProps()} draft={{}} />);

        expect(screen.getByText('Aplicar Soberania').closest('button')).toBeDisabled();
    });

    it('plan-37 (correção): exibe o toast recebido por prop (não um estado local de useDesignDraft)', () => {
        render(<HyperGranularityTab {...baseProps()} toast={{ type: 'success', message: 'Design aplicado ao sistema com sucesso.' }} />);

        expect(screen.getByText('Design aplicado ao sistema com sucesso.')).toBeDefined();
    });
});
