import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SarakUIProvider, UIContext } from '../../../../core/Provider/SarakUIProvider';
import type { SarakUIContextType } from '../../../../core/Provider/types';

vi.mock('@dnd-kit/core', () => ({
    DndContext: undefined, DragOverlay: undefined, KeyboardSensor: undefined, MouseSensor: undefined,
    TouchSensor: undefined, closestCorners: undefined, useDroppable: undefined, useSensor: undefined, useSensors: undefined,
}));
vi.mock('@dnd-kit/sortable', () => ({
    SortableContext: undefined, sortableKeyboardCoordinates: undefined, useSortable: undefined,
    verticalListSortingStrategy: undefined,
}));
vi.mock('@tanstack/react-virtual', () => ({ useVirtualizer: undefined }));
vi.mock('echarts-for-react', () => ({ default: undefined }));
vi.mock('echarts/core', () => ({ use: undefined }));
vi.mock('echarts/components', () => ({ AriaComponent: undefined, LegendComponent: undefined }));
vi.mock('recharts', () => ({
    ResponsiveContainer: undefined, BarChart: undefined, LineChart: undefined,
    Line: undefined, XAxis: undefined, YAxis: undefined, Tooltip: undefined, Bar: undefined,
}));
vi.mock('pdfjs-dist', () => ({ getDocument: undefined, GlobalWorkerOptions: undefined }));
vi.mock('react-markdown', () => ({ default: undefined }));
vi.mock('react-syntax-highlighter', () => ({ Prism: undefined }));
vi.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({ atomDark: undefined, oneDark: undefined, oneLight: undefined }));
vi.mock('reactflow', () => ({
    default: undefined, Background: undefined, Controls: undefined, MiniMap: undefined, Panel: undefined,
    BackgroundVariant: undefined,
}));

import SarakDataGridImpl from '../../DataDisplay/SarakDataGrid/SarakDataGridImpl';
import SarakDataTableImpl from '../../DataDisplay/SarakDataTable/SarakDataTableImpl';
import SarakKanbanImpl from '../../DataDisplay/SarakKanban/SarakKanbanImpl';
import SarakPDFViewerImpl from '../../Media/SarakPDFViewer/SarakPDFViewerImpl';
import SarakMarkdownRendererImpl from '../../Media/SarakMarkdownRenderer/SarakMarkdownRendererImpl';
import SarakChartEngine from '../../../engines/charts/SarakChartEngine';
import SarakChatEngine from '../../../engines/chat/SarakChatEngine';
import SarakFlowEngine from '../../../engines/flows/SarakFlowEngine';

const expectMissingPeer = (element: React.ReactElement, component: string, packages: string[]): void => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const tree = <SarakUIProvider config={{}}>{element}</SarakUIProvider>;
    const { rerender } = render(tree);
    const alert = screen.getByRole('alert');

    expect(alert).toHaveAttribute('data-sarak-optional-peer-missing', 'true');
    expect(alert).toHaveTextContent(component);
    packages.forEach((packageName) => expect(alert).toHaveTextContent(packageName));
    expect(warning).toHaveBeenCalledTimes(1);

    rerender(tree);
    expect(warning).toHaveBeenCalledTimes(1);
};

afterEach(() => vi.restoreAllMocks());

describe('peers opcionais ausentes', () => {
    it('SarakKanban informa os dois pacotes de arrastar e soltar', () => {
        expectMissingPeer(<SarakKanbanImpl columns={[]} />, 'SarakKanban', ['@dnd-kit/core', '@dnd-kit/sortable']);
    });

    it('SarakDataGrid informa o virtualizador', () => {
        expectMissingPeer(<SarakDataGridImpl count={0} renderRow={() => null} />, 'SarakDataGrid', ['@tanstack/react-virtual']);
    });

    it('SarakDataTable informa o virtualizador', () => {
        expectMissingPeer(<SarakDataTableImpl columns={[]} rows={[]} />, 'SarakDataTable', ['@tanstack/react-virtual']);
    });

    it('SarakChartEngine informa os pacotes do ECharts padrão', () => {
        expectMissingPeer(<SarakChartEngine data={[]} />, 'SarakChartEngine', ['echarts', 'echarts-for-react']);
    });

    it('SarakChartEngine informa Recharts quando esse motor foi selecionado', () => {
        expectMissingPeer(<SarakChartEngine data={[]} config={{ engine: 'recharts' }} />, 'SarakChartEngine', ['recharts']);
    });

    it('SarakPDFViewer informa pdfjs-dist', () => {
        expectMissingPeer(<SarakPDFViewerImpl src="/document.pdf" workerSrc="/worker.mjs" />, 'SarakPDFViewer', ['pdfjs-dist']);
    });

    it('SarakChatEngine informa os dois pacotes de Markdown', () => {
        expectMissingPeer(<SarakChatEngine messages={[]} onSendMessage={() => undefined} />, 'SarakChatEngine', ['react-markdown', 'react-syntax-highlighter']);
    });

    it('SarakMarkdownRenderer informa os dois pacotes de Markdown', () => {
        expectMissingPeer(<SarakMarkdownRendererImpl content="" />, 'SarakMarkdownRenderer', ['react-markdown', 'react-syntax-highlighter']);
    });

    it('SarakFlowEngine informa reactflow', () => {
        expectMissingPeer(<SarakFlowEngine nodes={[]} edges={[]} />, 'SarakFlowEngine', ['reactflow']);
    });

    it.each([
        ['pt', 'precisa dos pacotes opcionais'],
        ['en', 'needs the optional peer packages'],
        ['es', 'necesita los paquetes opcionales'],
        ['fr', 'nécessite les paquets facultatifs'],
        ['de', 'benötigt die optionalen Pakete'],
        ['it', 'richiede i pacchetti opzionali'],
    ] as const)('localiza a mensagem no idioma %s', (language, expectedText) => {
        const design = { language };
        const context = { design } as unknown as SarakUIContextType;
        render(
            <UIContext.Provider value={context}>
                <SarakDataGridImpl count={0} renderRow={() => null} />
            </UIContext.Provider>,
        );

        expect(screen.getByRole('alert')).toHaveTextContent(expectedText);
    });
});
