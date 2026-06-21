/**
 * SarakDataGrid — BASE de virtualização (Spec 12, recorte da Onda 1)
 *
 * ⚠️ ESCOPO REDUZIDO: esta é apenas a *janela virtual* (windowing) que o motor de
 * repetição (Spec 23, Regra 4) delega para listas grandes (> limiar). As demais
 * Regras da Spec 12 — pinned/resize/reorder de colunas, Kanban, Charts/Sparklines,
 * Tree Views — ficam para a implementação COMPLETA da Spec 12 (onda posterior).
 *
 * Headless por design: não impõe markup de tabela nem cores próprias. Renderiza só
 * as linhas visíveis (60 FPS / 10k+ itens) e delega o conteúdo de cada linha ao
 * `renderRow`. Zero Hardcode: dimensões/efeitos via tokens `var(--sx-*)`.
 */

import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

export interface SarakDataGridProps {
    /** Quantidade total de linhas (a fonte real vive fora; aqui só virtualizamos). */
    count: number;
    /** Render de UMA linha pelo índice — chamado apenas para linhas visíveis. */
    renderRow: (index: number) => React.ReactNode;
    /** Altura estimada de cada linha em px (default: 44). */
    estimateSize?: number;
    /** Linhas extra montadas fora da viewport para scroll suave (default: 8). */
    overscan?: number;
    /** Altura da janela de scroll (default: 100% do contêiner pai). */
    height?: number | string;
    /** Classe utilitária extra do contêiner. */
    className?: string;
}

/**
 * Lista virtualizada vertical. Só as linhas dentro da viewport (+ overscan) são
 * montadas no DOM, mantendo a contagem de nós baixa independentemente de `count`.
 */
const SarakDataGridImpl: React.FC<SarakDataGridProps> = ({
    count,
    renderRow,
    estimateSize = 44,
    overscan = 8,
    height = '100%',
    className,
}) => {
    const parentRef = useRef<HTMLDivElement>(null);

    const virtualizer = useVirtualizer({
        count,
        getScrollElement: () => parentRef.current,
        estimateSize: () => estimateSize,
        overscan,
    });

    const virtualRows = virtualizer.getVirtualItems();

    return (
        <div
            ref={parentRef}
            data-sarak-datagrid="true"
            className={className}
            style={{ height, overflow: 'auto', position: 'relative' }}
        >
            <div style={{ height: virtualizer.getTotalSize(), width: '100%', position: 'relative' }}>
                {virtualRows.map((virtualRow) => (
                    <div
                        key={virtualRow.key}
                        data-index={virtualRow.index}
                        ref={virtualizer.measureElement}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            transform: `translateY(${virtualRow.start}px)`,
                        }}
                    >
                        {renderRow(virtualRow.index)}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SarakDataGridImpl;
