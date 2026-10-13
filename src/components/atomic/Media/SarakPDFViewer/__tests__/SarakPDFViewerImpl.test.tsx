import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock do pdfjs-dist: jsdom não tem canvas/worker reais — só validamos o componente.
const getPage = vi.fn(() => Promise.resolve({
    getViewport: () => ({ width: 100, height: 140 }),
    render: () => ({ promise: Promise.resolve() }),
}));
vi.mock('pdfjs-dist', () => ({
    GlobalWorkerOptions: { workerSrc: '' },
    getDocument: () => ({ promise: Promise.resolve({ numPages: 3, getPage }), destroy: vi.fn() }),
}));

import SarakPDFViewerImpl from '../SarakPDFViewerImpl';

// A primeira montagem carrega o conjunto de ícones (`SarakIcon`), que leva ~1,3 s sozinho e muito mais com a máquina
// ocupada: acima do `findBy*` padrão (1 s) e do teste padrão (5 s). O tempo é declarado para o carregamento, em vez
// de depender da carga.
const LOAD_TIMEOUT_MS = 30_000;
const TEST_TIMEOUT_MS = LOAD_TIMEOUT_MS + 15_000;
const loaded = () => screen.findByText('1 / 3', {}, { timeout: LOAD_TIMEOUT_MS });

describe('Spec 15 (Onda 10) — SarakPDFViewer: controles tokenizados', () => {
    it('monta a barra de controles e mostra a paginação após carregar o documento', async () => {
        render(<SarakPDFViewerImpl src="/doc.pdf" />);
        expect(await loaded()).toBeInTheDocument();
        expect(screen.getByRole('toolbar', { name: 'Controles do PDF' })).toBeInTheDocument();
        expect(screen.getByLabelText('Aumentar zoom')).toBeInTheDocument();
        expect(screen.getByLabelText('Baixar PDF')).toBeInTheDocument();
    }, TEST_TIMEOUT_MS);

    it('navega entre páginas e altera o zoom pelos controles', async () => {
        render(<SarakPDFViewerImpl src="/doc.pdf" />);
        await loaded();

        fireEvent.click(screen.getByLabelText('Próxima página'));
        expect(screen.getByText('2 / 3')).toBeInTheDocument();

        expect(screen.getByText('120%')).toBeInTheDocument();
        fireEvent.click(screen.getByLabelText('Aumentar zoom'));
        expect(screen.getByText('140%')).toBeInTheDocument();
    }, TEST_TIMEOUT_MS);

    it('dispara onDownload com a src ao clicar em Baixar', async () => {
        const onDownload = vi.fn();
        render(<SarakPDFViewerImpl src="/doc.pdf" onDownload={onDownload} />);
        await loaded();
        fireEvent.click(screen.getByLabelText('Baixar PDF'));
        expect(onDownload).toHaveBeenCalledWith('/doc.pdf');
    }, TEST_TIMEOUT_MS);
});
