/**
 * SarakDataCards — degradação mobile do SarakDataTable (Spec 40.2 — L2)
 *
 * Princípio: **componente denso da lib é mobile-usável por padrão.** Uma tabela
 * colunar é ilegível num viewport de celular (colunas atropelam, a página transborda
 * na horizontal). Em vez de empurrar CSS para o consumidor (gambiarra), a própria lib
 * colapsa cada LINHA num CARD empilhado — rótulo (cabeçalho da coluna) + valor —, com
 * scroll só VERTICAL, contido no container: zero sobreposição, zero overflow da página.
 *
 * Reusa o mesmo `SarakColumn<T>` da tabela (mesmo `render`/`header`), então o consumidor
 * não redefine nada — o mesmo `SarakDataTable` vira tabela no desktop e cards no celular.
 *
 * Mantém a virtualização (`@tanstack/react-virtual`) com MEDIÇÃO DINÂMICA de altura
 * (`measureElement`) porque cards têm altura variável — assim uma lista longa continua
 * performática no celular sem risco de sobreposição por estimativa errada. Zero Hardcode:
 * cores/superfícies/raio/espaçamento vêm de tokens `--sarak-*`.
 */

import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { SarakColumn } from './columnModel';

export interface SarakDataCardsProps<T> {
    /** Mesmas colunas da tabela — reaproveitadas como pares rótulo/valor. */
    columns: Array<SarakColumn<T>>;
    /** Linhas de dados. */
    rows: T[];
    /** Altura da janela de scroll (default: 100% do contêiner pai). */
    height?: number | string;
    /** Altura estimada inicial de cada card em px (recalculada por medição). */
    estimatedCardHeight?: number;
    /** Cards extra montados fora da viewport (default: 6). */
    overscan?: number;
    /** Chave estável da linha (default: índice). */
    getRowKey?: (row: T, index: number) => React.Key;
    className?: string;
}

/** Valor exibido de uma célula (reusa o `render` da coluna ou o valor cru). */
const cellValue = <T,>(column: SarakColumn<T>, row: T, index: number): React.ReactNode =>
    column.render ? column.render(row, index) : String((row as Record<string, unknown>)[column.id] ?? '');

/**
 * Lista de cards empilhados — 1 card por linha, 1 par rótulo/valor por coluna.
 * Scroll estritamente vertical: `overflow-y: auto` + `overflow-x: hidden` no container.
 */
function SarakDataCards<T>({
    columns,
    rows,
    height = '100%',
    estimatedCardHeight,
    overscan = 6,
    getRowKey,
    className,
}: SarakDataCardsProps<T>) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const virtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => scrollRef.current,
        // Estimativa só inicial: `measureElement` corrige com a altura real de cada card.
        estimateSize: () => estimatedCardHeight ?? columns.length * 28 + 40,
        overscan,
    });

    return (
        <div
            ref={scrollRef}
            data-sarak-datacards="true"
            role="list"
            className={className}
            // `maxWidth: 100%` + `overflowX: hidden` garantem que a PÁGINA nunca transborda.
            style={{ height, maxWidth: '100%', overflowY: 'auto', overflowX: 'hidden', position: 'relative' }}
        >
            <div style={{ height: virtualizer.getTotalSize(), position: 'relative', width: '100%' }}>
                {virtualizer.getVirtualItems().map((virtualRow) => {
                    const row = rows[virtualRow.index];
                    return (
                        <div
                            key={getRowKey ? getRowKey(row, virtualRow.index) : virtualRow.key}
                            role="listitem"
                            data-index={virtualRow.index}
                            ref={virtualizer.measureElement}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                transform: `translateY(${virtualRow.start}px)`,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'calc(var(--sarak-layout-gap-sm, 8px) * 0.5)',
                                padding: 'var(--sarak-card-padding-md, var(--sarak-layout-gap-md, 16px))',
                                marginBottom: 'var(--sarak-layout-gap-sm, 8px)',
                                background: 'var(--sarak-card-bg, var(--color-theme-card, #1e293b))',
                                border: 'var(--sarak-border-width, 1px) solid var(--sarak-card-border-color, var(--border-color, #334155))',
                                borderRadius: 'var(--sarak-card-radius, 12px)',
                                color: 'var(--sarak-text-main, #ffffff)',
                                boxSizing: 'border-box',
                            }}
                        >
                            {columns.map((column) => (
                                <div
                                    key={column.id}
                                    data-column-id={column.id}
                                    className="min-w-0"
                                    // Estrutura inline (flex/gap por token) — o auditor trata
                                    // flex-direction/spacing em classe como hardcode estrutural.
                                    style={{ display: 'flex', flexDirection: 'column', gap: 'calc(var(--sarak-layout-gap-sm, 8px) * 0.25)' }}
                                >
                                    {/* Tipografia via classes (Zero Hardcode inline, igual ao SarakShellNav). */}
                                    <span className="text-2xs font-semibold uppercase tracking-wider text-[var(--text-muted,#94a3b8)]">
                                        {column.header}
                                    </span>
                                    <span className="text-sm break-words min-w-0">
                                        {cellValue(column, row, virtualRow.index)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default SarakDataCards;
