import { afterEach, describe, expect, it, vi } from 'vitest';
import { sarakDownloadCsv, sarakTableToCsv } from '../tableCsv';

interface Row extends Record<string, unknown> {
    name: string;
    amount: number;
}

const BRL = { type: 'currency', currency: 'BRL' } as const;
const columns = [
    { id: 'name', header: 'Nome' },
    { id: 'amount', header: 'Valor', format: BRL, aggregate: 'sum' as const },
];
const rows: Row[] = [{ name: 'Aluguel', amount: 1000 }, { name: 'Água; luz', amount: 200.5 }];
const plain = (text: string): string => text.replace(/\s/g, ' ');

describe('sarakTableToCsv', () => {
    it('começa com BOM UTF-8 e usa ponto e vírgula quando o locale tem vírgula decimal', () => {
        const csv = sarakTableToCsv(columns, rows, { locale: 'pt-BR' });
        expect(csv.charCodeAt(0)).toBe(0xFEFF);
        expect(csv.split('\r\n')[0]).toBe('﻿Nome;Valor');
    });

    it('usa vírgula em locale de ponto decimal e respeita o separador explícito', () => {
        expect(sarakTableToCsv(columns, rows, { locale: 'en-US' }).split('\r\n')[0]).toBe('﻿Nome,Valor');
        expect(sarakTableToCsv(columns, rows, { locale: 'pt-BR', separator: ',' }).split('\r\n')[0]).toBe('﻿Nome,Valor');
    });

    it('exporta o valor formatado, escapa o separador e inclui o rodapé', () => {
        const lines = sarakTableToCsv(columns, rows, { locale: 'pt-BR' }).split('\r\n');
        expect(plain(lines[1])).toBe('Aluguel;R$ 1.000,00');
        expect(lines[2]).toContain('"Água; luz"');
        expect(plain(lines[3])).toBe(';R$ 1.200,50');
    });

    it('formatted:false exporta o bruto e includeFooter:false tira o rodapé', () => {
        const lines = sarakTableToCsv(columns, rows, { locale: 'pt-BR', formatted: false, includeFooter: false }).split('\r\n');
        expect(lines).toHaveLength(3);
        expect(lines[1]).toBe('Aluguel;1000');
    });

    it('colunas da Table (key/label) e aspas duplas escapadas', () => {
        const csv = sarakTableToCsv([{ key: 'name', label: 'Nome' }], [{ name: 'Ele disse "oi"' }], { separator: ';' });
        expect(csv.split('\r\n')[1]).toBe('"Ele disse ""oi"""');
    });

    it('neutraliza texto que o Excel leria como fórmula', () => {
        const csv = sarakTableToCsv([{ key: 'name', label: 'Nome' }], [{ name: '=SOMA(A1)' }], { separator: ';' });
        expect(csv.split('\r\n')[1]).toBe("'=SOMA(A1)");
    });

    it.each(['=1+1', '+1+1', '-2+3', '@SUM(A1)', '\tcmd', '\rcmd'])('neutraliza o prefixo de fórmula em %j', (text) => {
        const csv = sarakTableToCsv([{ key: 'name', label: 'Nome' }], [{ name: text }], { separator: ';' });
        const cell = csv.slice(csv.indexOf('\r\n') + 2);
        expect(cell.replace(/^"|"$/g, '').startsWith("'")).toBe(true);
    });

    it('número negativo formatado e número bruto não ganham apóstrofo', () => {
        const brl = { type: 'currency', currency: 'BRL' } as const;
        const cols = [{ id: 'amount', header: 'Valor', format: brl }];
        const formatted = sarakTableToCsv(cols, [{ amount: -1234.5 }], { locale: 'pt-BR' }).split('\r\n')[1];
        expect(formatted.startsWith("'")).toBe(false);
        expect(formatted.replace(/\s/g, ' ')).toBe('-R$ 1.234,50');
        expect(sarakTableToCsv(cols, [{ amount: -5 }], { locale: 'pt-BR', formatted: false }).split('\r\n')[1]).toBe('-5');
    });
});

describe('sarakDownloadCsv', () => {
    afterEach(() => vi.restoreAllMocks());

    it('baixa um blob text/csv com o nome pedido', () => {
        const create = vi.fn(() => 'blob:x');
        const revoke = vi.fn();
        Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke });
        const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
        sarakDownloadCsv('faturas.csv', 'a;b');
        expect(click).toHaveBeenCalledTimes(1);
        expect((create.mock.calls[0] as unknown as [Blob])[0].type).toContain('text/csv');
        expect(revoke).toHaveBeenCalledWith('blob:x');
    });
});
