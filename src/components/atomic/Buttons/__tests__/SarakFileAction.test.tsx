import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SarakFileAction } from '../SarakFileAction';

const BLOB = new Blob(['conteúdo'], { type: 'text/plain' });

beforeEach(() => {
    URL.createObjectURL = vi.fn(() => 'blob:fake');
    URL.revokeObjectURL = vi.fn();
});
afterEach(() => vi.restoreAllMocks());

describe('SarakFileAction', () => {
    it('baixa: mostra carregando, entrega o arquivo por âncora com o nome e chama onDone', async () => {
        let resolve!: (blob: Blob) => void;
        const load = vi.fn(() => new Promise<Blob>((done) => { resolve = done; }));
        const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
        const onDone = vi.fn();
        render(<SarakFileAction load={load} filename="relatorio.txt" onDone={onDone} />);

        fireEvent.click(screen.getByRole('button', { name: 'Baixar' }));
        expect(screen.getByRole('button')).toBeDisabled();

        resolve(BLOB);
        await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));
        expect(click).toHaveBeenCalledTimes(1);
        expect(URL.createObjectURL).toHaveBeenCalledWith(BLOB);
        expect(screen.getByRole('button', { name: 'Baixar' })).toBeEnabled();
    });

    it('abre numa aba nova, sem opener', async () => {
        const open = vi.spyOn(window, 'open').mockImplementation(() => null);
        render(<SarakFileAction load={() => Promise.resolve(BLOB)} mode="open" />);

        fireEvent.click(screen.getByRole('button', { name: 'Abrir' }));

        await waitFor(() => expect(open).toHaveBeenCalledWith('blob:fake', '_blank', 'noopener'));
    });

    it('erro: avisa, repassa ao host e oferece tentar de novo, que carrega outra vez', async () => {
        vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
        const failure = new Error('rede');
        const load = vi.fn().mockRejectedValueOnce(failure).mockResolvedValueOnce(BLOB);
        const onError = vi.fn();
        render(<SarakFileAction load={load} onError={onError} />);

        fireEvent.click(screen.getByRole('button', { name: 'Baixar' }));
        expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível obter o arquivo');
        expect(onError).toHaveBeenCalledWith(failure);

        fireEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));
        await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
        expect(load).toHaveBeenCalledTimes(2);
    });

    it('sem filename o download segue por âncora com download vazio, nunca navega a aba', async () => {
        const anchors: HTMLAnchorElement[] = [];
        vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function click(this: HTMLAnchorElement) { anchors.push(this); });
        render(<SarakFileAction load={() => Promise.resolve(BLOB)} />);

        fireEvent.click(screen.getByRole('button', { name: 'Baixar' }));

        await waitFor(() => expect(anchors).toHaveLength(1));
        expect(anchors[0].hasAttribute('download')).toBe(true);
        expect(anchors[0].download).toBe('');
    });

    it.each(['text/html', 'image/svg+xml', 'application/xhtml+xml', ''])('mode=open com %s baixa em vez de abrir na origem do sistema', async (type) => {
        const open = vi.spyOn(window, 'open').mockImplementation(() => null);
        const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
        render(<SarakFileAction load={() => Promise.resolve(new Blob(['<script>1</script>'], { type }))} mode="open" />);

        fireEvent.click(screen.getByRole('button', { name: 'Abrir' }));

        await waitFor(() => expect(click).toHaveBeenCalledTimes(1));
        expect(open).not.toHaveBeenCalled();
    });

    it.each(['application/pdf', 'image/png', 'text/plain;charset=utf-8'])('mode=open abre %s', async (type) => {
        const open = vi.spyOn(window, 'open').mockImplementation(() => null);
        render(<SarakFileAction load={() => Promise.resolve(new Blob(['x'], { type }))} mode="open" />);

        fireEvent.click(screen.getByRole('button', { name: 'Abrir' }));

        await waitFor(() => expect(open).toHaveBeenCalledTimes(1));
    });
});
