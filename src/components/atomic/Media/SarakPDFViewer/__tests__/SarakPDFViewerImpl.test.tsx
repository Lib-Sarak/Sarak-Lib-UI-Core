import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { afterEach, describe, it, expect, vi } from 'vitest';

// Mock do pdfjs-dist: jsdom não tem canvas/worker reais — só validamos o componente.
const getPage = vi.fn(() => Promise.resolve({
    getViewport: () => ({ width: 100, height: 140 }),
    render: () => ({ promise: Promise.resolve() }),
}));
vi.mock('pdfjs-dist', () => ({
    GlobalWorkerOptions: { workerSrc: '' },
    getDocument: vi.fn(() => ({ promise: Promise.resolve({ numPages: 3, getPage }), destroy: vi.fn() })),
}));

import { getDocument } from 'pdfjs-dist';
import SarakPDFViewerImpl from '../SarakPDFViewerImpl';
import type { SarakPDFViewerProps } from '../SarakPDFViewerImpl';

// A primeira montagem carrega o conjunto de ícones (`SarakIcon`), que leva ~1,3 s sozinho e muito mais com a máquina
// ocupada: acima do `findBy*` padrão (1 s) e do teste padrão (5 s). O tempo é declarado para o carregamento, em vez
// de depender da carga.
const LOAD_TIMEOUT_MS = 30_000;
const TEST_TIMEOUT_MS = LOAD_TIMEOUT_MS + 15_000;
const loaded = () => screen.findByText('1 / 3', {}, { timeout: LOAD_TIMEOUT_MS });

afterEach(() => vi.restoreAllMocks());

describe('Spec 15 (Onda 10) — SarakPDFViewer: controles tokenizados', () => {
    it('monta a barra de controles e mostra a paginação após carregar o documento', async () => {
        render(<SarakPDFViewerImpl src="/doc.pdf" workerSrc="/pdf.worker.min.mjs" />);
        expect(await loaded()).toBeInTheDocument();
        expect(screen.getByRole('toolbar', { name: 'Controles do PDF' })).toBeInTheDocument();
        expect(screen.getByLabelText('Aumentar zoom')).toBeInTheDocument();
        expect(screen.getByLabelText('Baixar PDF')).toBeInTheDocument();
    }, TEST_TIMEOUT_MS);

    it('navega entre páginas e altera o zoom pelos controles', async () => {
        render(<SarakPDFViewerImpl src="/doc.pdf" workerSrc="/pdf.worker.min.mjs" />);
        await loaded();

        fireEvent.click(screen.getByLabelText('Próxima página'));
        expect(screen.getByText('2 / 3')).toBeInTheDocument();

        expect(screen.getByText('120%')).toBeInTheDocument();
        fireEvent.click(screen.getByLabelText('Aumentar zoom'));
        expect(screen.getByText('140%')).toBeInTheDocument();
    }, TEST_TIMEOUT_MS);

    it('dispara onDownload com a src ao clicar em Baixar', async () => {
        const onDownload = vi.fn();
        render(<SarakPDFViewerImpl src="/doc.pdf" workerSrc="/pdf.worker.min.mjs" onDownload={onDownload} />);
        await loaded();
        fireEvent.click(screen.getByLabelText('Baixar PDF'));
        expect(onDownload).toHaveBeenCalledWith('/doc.pdf');
    }, TEST_TIMEOUT_MS);

    it('mostra a orientação traduzida e avisa uma vez quando workerSrc falta', async () => {
        const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        vi.mocked(getDocument).mockClear();
        const propsWithoutWorkerSrc = { src: '/doc.pdf' } as SarakPDFViewerProps;
        const { rerender } = render(<SarakPDFViewerImpl {...propsWithoutWorkerSrc} />);

        expect(await screen.findByRole('alert')).toHaveTextContent('Configure a prop workerSrc com a URL do worker de PDF.js.');
        rerender(<SarakPDFViewerImpl {...propsWithoutWorkerSrc} />);

        const workerWarnings = warning.mock.calls.filter(([message]) =>
            typeof message === 'string' && message.includes('workerSrc'),
        );
        expect(workerWarnings).toHaveLength(1);
        expect(getDocument).not.toHaveBeenCalled();
    }, TEST_TIMEOUT_MS);
});
