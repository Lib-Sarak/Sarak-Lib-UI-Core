import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, createEvent } from '@testing-library/react';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import { SarakUploader } from '../SarakUploader';

const renderUploader = (props: Partial<React.ComponentProps<typeof SarakUploader>> = {}): ReturnType<typeof render> =>
    render(
        <SarakUIProvider>
            <SarakUploader label="Anexos" {...props} />
        </SarakUIProvider>,
    );

const buildFileDrop = (zone: HTMLElement, files: File[]): ReturnType<typeof createEvent.drop> => {
    const event = createEvent.drop(zone);
    Object.defineProperty(event, 'dataTransfer', {
        value: { files, items: files.map((f) => ({ kind: 'file', type: f.type, getAsFile: () => f })), types: ['Files'] },
    });
    return event;
};

describe('SarakUploader', () => {
    it('liga o rótulo visível à área que recebe foco e abre o seletor de arquivos', () => {
        renderUploader();
        const dropzone = screen.getByRole('button', { name: 'Anexos' });
        expect(dropzone).toHaveAttribute('aria-labelledby', screen.getByText('Anexos').id);
    });

    it('deve renderizar a área drag-and-drop acessível', () => {
        renderUploader({ hint: 'PNG até 2MB' });
        expect(screen.getByText('Anexos')).toBeInTheDocument();
        expect(screen.getByText(/Arraste arquivos/)).toBeInTheDocument();
        expect(screen.getByText('PNG até 2MB')).toBeInTheDocument();
    });

    it('deve emitir os arquivos aceitos ao soltar', async () => {
        const onChange = vi.fn();
        renderUploader({ onChange });
        const zone = screen.getByText(/Arraste arquivos/).closest('div') as HTMLElement;
        const file = new File(['conteudo'], 'doc.txt', { type: 'text/plain' });
        fireEvent(zone, buildFileDrop(zone, [file]));
        // react-dropzone processa o drop de forma assíncrona.
        await screen.findByText(/Arraste arquivos/);
        expect(onChange).toHaveBeenCalled();
        expect(onChange.mock.calls[0][0][0]).toBeInstanceOf(File);
    });

    it('deve marcar erro (hasError) com borda de perigo e mensagem', () => {
        renderUploader({ error: 'Arquivo muito grande' });
        const zone = screen.getByText(/Arraste arquivos/).closest('div') as HTMLElement;
        expect(zone).toHaveAttribute('aria-invalid', 'true');
        expect(screen.getByText('Arquivo muito grande')).toBeInTheDocument();
    });
});

// os textos da própria lib seguem o idioma que vale.
describe('SarakUploader — idioma que vale', () => {
    it('sai em inglês com `config.language: "en"`', () => {
        render(
            <SarakUIProvider config={{ language: 'en' }}>
                <SarakUploader />
            </SarakUIProvider>,
        );
        expect(screen.getByText('Drag files here or click to select')).toBeInTheDocument();
    });
});

describe('Erro de campo pelo SarakFieldError', () => {
    it('com `error`, há um role="alert" com o texto e o controle o referencia', () => {
        const { container } = render(<SarakUploader error="Campo obrigatório" />);
        const alert = screen.getByRole('alert');
        expect(alert).toHaveTextContent('Campo obrigatório');
        expect(alert.querySelector('svg')).not.toBeNull();
        expect(alert.id).toMatch(/-error$/);
        expect(container.querySelector('[aria-invalid="true"]')).toHaveAttribute('aria-describedby', alert.id);
    });

    it('sem `error`, nada é renderizado', () => {
        render(<SarakUploader />);
        expect(screen.queryByRole('alert')).toBeNull();
    });
});
