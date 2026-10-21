import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SarakUIProvider, { useSarakUI } from '../../../../core/Provider/SarakUIProvider';
import { TemplatesTab } from '../../Main/TemplatesTab';
import { useDesignDraft } from '../useDesignDraft';

const TemplateUndoHarness = (props: {
    onUndoStart: () => void;
    onUndoFinish: () => void;
}): React.ReactElement => {
    const sarak = useSarakUI();
    const { handleThemePreview, handleApplyToSystem, undoLastApply } = useDesignDraft(sarak);

    return (
        <div>
            <span data-testid="active-theme-id">{sarak.resolvedThemeId}</span>
            <span data-testid="provider-hydrated">{String(sarak.isHydrated)}</span>
            <button
                data-testid="preview-next-theme"
                onClick={() => handleThemePreview({ primaryColor: '#222222' }, undefined, 'tema-novo')}
            >
                Preparar tema novo
            </button>
            <button data-testid="apply-next-theme" onClick={handleApplyToSystem}>Aplicar rascunho</button>
            <button
                data-testid="undo-theme-application"
                onClick={() => {
                    props.onUndoStart();
                    undoLastApply();
                    props.onUndoFinish();
                }}
            >
                Desfazer aplicação
            </button>
        </div>
    );
};

const TemplatePreviewHarness = (): React.ReactElement => {
    const sarak = useSarakUI();
    const { draft, handleThemePreview } = useDesignDraft(sarak);

    return (
        <>
            <span data-testid="active-theme-id">{sarak.resolvedThemeId}</span>
            <span data-testid="draft-primary-color">{String(draft.primaryColor ?? '')}</span>
            <TemplatesTab onApplyFullTheme={(design, themeId) => handleThemePreview(design, undefined, themeId)} />
        </>
    );
};

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.useRealTimers();
    localStorage.clear();
});

describe('aplicação de tema e persistência — integração com SarakUIProvider real', () => {
    it('escolher um modelo altera o rascunho sem anunciar nem gravar o tema', async () => {
        const onSave = vi.fn().mockResolvedValue(undefined);
        const customThemes = [{
            id: 'tema-modelo',
            name: 'Tema de modelo',
            design: { primaryColor: '#123456' },
        }];

        render(
            <SarakUIProvider customThemes={customThemes} options={{ persistence: { onSave } }}>
                <TemplatePreviewHarness />
            </SarakUIProvider>,
        );

        const initialThemeId = screen.getByTestId('active-theme-id').textContent;
        const template = screen.getByText('Tema de modelo').closest('.group');
        expect(template).not.toBeNull();
        await act(async () => {
            fireEvent.click(within(template as HTMLElement).getByRole('button', { name: 'Escolher tema' }));
        });

        expect(screen.getByTestId('draft-primary-color')).toHaveTextContent('#123456');
        expect(screen.getByTestId('active-theme-id')).toHaveTextContent(initialThemeId ?? '');
        expect(onSave).not.toHaveBeenCalled();
    });

    it('desfazer: a primeira gravação restaura o design e o id anteriores', async () => {
        let undoHandlerIsRunning = false;
        let undoSaveWasSynchronous = false;
        const onSave = vi.fn().mockImplementation(async () => {
            if (undoHandlerIsRunning) undoSaveWasSynchronous = true;
        });
        const customThemes = [
            { id: 'tema-inicial', name: 'Tema inicial', design: { primaryColor: '#111111' } },
            { id: 'tema-novo', name: 'Tema novo', design: { primaryColor: '#222222' } },
        ];

        render(
            <SarakUIProvider
                config={{ primaryColor: '#111111' }}
                initialTheme="tema-inicial"
                customThemes={customThemes}
                options={{ persistence: { onSave } }}
            >
                <TemplateUndoHarness
                    onUndoStart={() => { undoHandlerIsRunning = true; }}
                    onUndoFinish={() => { undoHandlerIsRunning = false; }}
                />
            </SarakUIProvider>,
        );

        await waitFor(() => expect(screen.getByTestId('provider-hydrated')).toHaveTextContent('true'));
        expect(screen.getByTestId('active-theme-id')).toHaveTextContent('tema-inicial');
        vi.useFakeTimers();

        fireEvent.click(screen.getByTestId('preview-next-theme'));
        await act(async () => {
            fireEvent.click(screen.getByTestId('apply-next-theme'));
        });

        expect(screen.getByTestId('active-theme-id')).toHaveTextContent('tema-novo');
        expect(onSave).toHaveBeenCalledTimes(1);
        onSave.mockClear();

        await act(async () => {
            fireEvent.click(screen.getByTestId('undo-theme-application'));
        });

        expect(screen.getByTestId('active-theme-id')).toHaveTextContent('tema-inicial');
        expect(onSave).toHaveBeenCalledTimes(1);
        expect(onSave).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({ primaryColor: '#111111' }),
            'tema-inicial',
        );
        expect(undoSaveWasSynchronous).toBe(true);
    });
});
