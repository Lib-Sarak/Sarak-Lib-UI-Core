import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SarakWizard, type SarakWizardStep } from '../SarakWizard';

const buildSteps = (firstValidate?: SarakWizardStep['validate']): SarakWizardStep[] => [
    { id: 'dados', label: 'Dados', content: <p>conteúdo dados</p>, validate: firstValidate },
    { id: 'revisao', label: 'Revisão', content: <p>conteúdo revisão</p> },
];

describe('SarakWizard', () => {
    it('mostra o passo atual no stepper e só o conteúdo da etapa atual', () => {
        render(<SarakWizard steps={buildSteps()} onFinish={() => undefined} />);

        expect(screen.getByRole('group', { name: 'Assistente' })).toBeInTheDocument();
        expect(screen.getByText('conteúdo dados')).toBeInTheDocument();
        expect(screen.queryByText('conteúdo revisão')).not.toBeInTheDocument();
        expect(screen.getByText('Dados').closest('li')).toHaveAttribute('aria-current', 'step');
    });

    it('avança quando a validação deixa passar e volta sem validar', async () => {
        const onStepChange = vi.fn();
        render(<SarakWizard steps={buildSteps(() => true)} onFinish={() => undefined} onStepChange={onStepChange} />);

        fireEvent.click(screen.getByRole('button', { name: 'Avançar' }));
        expect(await screen.findByText('conteúdo revisão')).toBeInTheDocument();
        expect(onStepChange).toHaveBeenCalledWith(1);

        fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));
        expect(screen.getByText('conteúdo dados')).toBeInTheDocument();
    });

    it('validação que recusa segura a etapa e mostra a mensagem dela, ou a padrão para false', async () => {
        const validate = vi.fn().mockReturnValueOnce('Falta o nome').mockReturnValueOnce(false);
        render(<SarakWizard steps={buildSteps(validate)} onFinish={() => undefined} />);

        fireEvent.click(screen.getByRole('button', { name: 'Avançar' }));
        expect(await screen.findByRole('alert')).toHaveTextContent('Falta o nome');
        expect(screen.getByText('conteúdo dados')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Avançar' }));
        await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Revise esta etapa para continuar'));
    });

    it('aceita validação assíncrona', async () => {
        render(<SarakWizard steps={buildSteps(() => Promise.resolve(true))} onFinish={() => undefined} />);

        fireEvent.click(screen.getByRole('button', { name: 'Avançar' }));

        expect(await screen.findByText('conteúdo revisão')).toBeInTheDocument();
    });

    it('na última etapa o botão conclui e chama onFinish; cancelar só aparece com onCancel', async () => {
        const onFinish = vi.fn();
        const onCancel = vi.fn();
        render(<SarakWizard steps={buildSteps()} defaultStep={1} onFinish={onFinish} onCancel={onCancel} />);

        fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
        expect(onCancel).toHaveBeenCalled();

        fireEvent.click(screen.getByRole('button', { name: 'Concluir' }));
        await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1));
    });

    it('com step controlado, o assistente segue o host e só avisa a troca', async () => {
        const onStepChange = vi.fn();
        render(<SarakWizard steps={buildSteps()} step={0} onStepChange={onStepChange} onFinish={() => undefined} />);

        fireEvent.click(screen.getByRole('button', { name: 'Avançar' }));
        await waitFor(() => expect(onStepChange).toHaveBeenCalledWith(1));

        expect(screen.getByText('conteúdo dados')).toBeInTheDocument();
    });

    it('validate que rejeita mostra a mensagem na etapa e não deixa rejeição solta', async () => {
        const rejection = vi.fn();
        process.on('unhandledRejection', rejection);
        render(<SarakWizard steps={buildSteps(() => Promise.reject(new Error('Servidor indisponível')))} onFinish={() => undefined} />);

        fireEvent.click(screen.getByRole('button', { name: 'Avançar' }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Servidor indisponível');
        expect(screen.getByText('conteúdo dados')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Avançar' })).toBeEnabled();
        process.off('unhandledRejection', rejection);
        expect(rejection).not.toHaveBeenCalled();
    });

    it('onFinish que rejeita mostra a mensagem e permite tentar de novo', async () => {
        const onFinish = vi.fn().mockRejectedValueOnce(new Error('Falha ao salvar')).mockResolvedValueOnce(undefined);
        render(<SarakWizard steps={buildSteps()} defaultStep={1} onFinish={onFinish} />);

        fireEvent.click(screen.getByRole('button', { name: 'Concluir' }));
        expect(await screen.findByRole('alert')).toHaveTextContent('Falha ao salvar');

        fireEvent.click(screen.getByRole('button', { name: 'Concluir' }));
        await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(2));
    });
});
