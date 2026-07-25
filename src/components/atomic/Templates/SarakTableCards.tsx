import React from 'react';

/**
 * SarakTableCards — degradação mobile do `SarakTable` genérico (Spec 40.3 — L3).
 *
 * Mesmo princípio do `SarakDataCards` (Spec 40.2), estendido ao denso genérico que o
 * manifesto/consumidor usa: no celular uma tabela larga é ilegível e transborda a página.
 * Aqui cada LINHA vira um CARD empilhado com pares rótulo/valor, reusando as MESMAS colunas
 * e rótulos da tabela — sem o consumidor escrever CSS. Zero Hardcode: superfície/espaçamento
 * por tokens `--sarak-*`; estrutura (flex/gap/padding) inline (o auditor trata flex/spacing
 * EM CLASSE como hardcode estrutural nos átomos).
 */
export interface SarakTableCardsProps<T extends Record<string, unknown>> {
    rows: T[];
    /** Chaves das colunas (mesma ordem da tabela). */
    columns: string[];
    /** Rótulo legível por coluna (mesmo `columnLabels` da tabela). */
    columnLabels: Record<string, string>;
    loading?: boolean;
}

/** Valor exibido de uma célula — booleano vira Ativo/Inativo (paridade com a tabela). */
const displayValue = (value: unknown): string => {
    if (typeof value === 'boolean') return value ? 'Ativo' : 'Inativo';
    return String(value ?? '');
};

const cardStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--sarak-layout-gap-sm, 8px) * 0.5)',
    padding: 'var(--sarak-card-padding-md, var(--sarak-layout-gap-md, 16px))',
    background: 'var(--color-theme-card, #1e293b)',
    border: 'var(--sarak-border-width, 1px) solid var(--border-color, #334155)',
    borderRadius: 'var(--sarak-card-radius, 12px)',
    color: 'var(--sarak-text-main, #ffffff)',
    boxSizing: 'border-box',
};

export function SarakTableCards<T extends Record<string, unknown>>({
    rows,
    columns,
    columnLabels,
    loading = false,
}: SarakTableCardsProps<T>) {
    const items = loading ? Array.from({ length: 3 }, (_, i) => ({ __skeleton: i } as unknown as T)) : rows;

    return (
        <div
            role="list"
            data-sarak-tablecards="true"
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sarak-layout-gap-sm, 8px)', maxWidth: '100%' }}
        >
            {items.map((row, idx) => (
                <div key={String((row as Record<string, unknown>).id ?? idx)} role="listitem" style={cardStyle}>
                    {columns.map((col) => (
                        <div key={col} className="min-w-0" style={{ display: 'flex', flexDirection: 'column', gap: 'calc(var(--sarak-layout-gap-sm, 8px) * 0.25)' }}>
                            <span className="text-2xs font-black uppercase tracking-widest text-white/30">
                                {columnLabels[col]}
                            </span>
                            <span className="text-sm break-words min-w-0 text-white/70">
                                {loading ? '' : displayValue((row as Record<string, unknown>)[col])}
                            </span>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

export default SarakTableCards;
