import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { createSarakKitMock, renderWithSarak } from '../sarakTestKit';

// O consumidor resolve o nome pelo pacote instalado; aqui o nome aponta para o código-fonte.
vi.mock('@sarak/lib-ui-core', () => import('../../../index'));

// Cada caso pode ser o primeiro a carregar a lib inteira, e sob a suíte em paralelo isso passa dos 5 s do padrão.
const LIBRARY_LOAD_TIMEOUT_MS = 30_000;

const WhichTheme = (): React.ReactElement => <p>{useSarakUI().design ? 'com provider' : 'sem provider'}</p>;

interface Doubles {
    SarakDataTable: React.ComponentType<Record<string, unknown>>;
    SarakChartEngine: React.ComponentType<Record<string, unknown>>;
    SarakPDFViewer: React.ComponentType;
    SarakButton: unknown;
    extra?: unknown;
}

describe('renderWithSarak', { timeout: LIBRARY_LOAD_TIMEOUT_MS }, () => {
    it('monta dentro do SarakUIProvider e devolve o resultado do render', async () => {
        const view = await renderWithSarak(<WhichTheme />);

        expect(view.getByText('com provider')).toBeInTheDocument();
    });

    it('repassa as props do provider', async () => {
        const Retry = (): React.ReactElement => <p>{useLibraryText()('errorBoundaryRetry')}</p>;

        const view = await renderWithSarak(<Retry />, { provider: { config: { language: 'en' } } });

        expect(view.getByText('Try again')).toBeInTheDocument();
    });
});

describe('createSarakKitMock', { timeout: LIBRARY_LOAD_TIMEOUT_MS }, () => {
    const doubles = async (overrides?: Record<string, unknown>): Promise<Doubles> =>
        (await createSarakKitMock(overrides)) as unknown as Doubles;

    it('mantém a lib real e troca só os três que não rodam no jsdom', async () => {
        const kit = await doubles();
        const real = await import('../../../index');

        expect(kit.SarakButton).toBe(real.SarakButton);
        expect(kit.SarakDataTable).not.toBe(real.SarakDataTable);
    });

    it('a tabela desenha todas as linhas por render, accessor e id, com rodapé', async () => {
        const { SarakDataTable } = await doubles();
        render(
            <SarakDataTable
                rows={[{ id: 1, name: 'Ana', total: 10 }, { id: 2, name: 'Bia', total: 5 }]}
                getRowKey={(row: { id: number }) => row.id}
                columns={[
                    { id: 'name', header: 'Nome' },
                    { id: 'upper', header: 'Maiúsculo', accessor: (row: { name: string }) => row.name.toUpperCase() },
                    { id: 'total', header: 'Total', render: (row: { total: number }) => <b>{row.total}</b>, aggregate: 'sum' },
                ]}
            />,
        );

        expect(screen.getByRole('columnheader', { name: 'Nome' })).toBeInTheDocument();
        expect(screen.getByText('Ana')).toBeInTheDocument();
        expect(screen.getByText('BIA')).toBeInTheDocument();
        expect(screen.getByText('15')).toBeInTheDocument();
    });

    it('sem rodapé declarado, a tabela não desenha tfoot', async () => {
        const { SarakDataTable } = await doubles();
        const { container } = render(<SarakDataTable rows={[]} columns={[{ id: 'a', header: 'A' }]} />);

        expect(container.querySelector('tfoot')).toBeNull();
    });

    it('o gráfico entrega o clique do ponto', async () => {
        const { SarakChartEngine } = await doubles();
        const onPointClick = vi.fn();
        const datum = { label: 'Janeiro', value: 1 };
        render(<SarakChartEngine ariaLabel="Vendas" data={[datum]} onPointClick={onPointClick} />);

        fireEvent.click(screen.getByRole('button', { name: 'Janeiro' }));

        expect(screen.getByRole('img', { name: 'Vendas' })).toBeInTheDocument();
        expect(onPointClick).toHaveBeenCalledWith({ seriesKey: 'test', index: 0, datum });
    });

    it('o visualizador de PDF não carrega o pdfjs', async () => {
        const { SarakPDFViewer } = await doubles();
        render(<SarakPDFViewer />);

        expect(screen.getByRole('document')).toBeInTheDocument();
    });

    it('overrides acrescentam e trocam qualquer nome', async () => {
        const stub = (): null => null;
        const kit = await doubles({ extra: 1, SarakPDFViewer: stub });

        expect(kit.extra).toBe(1);
        expect(kit.SarakPDFViewer).toBe(stub);
    });
});
