import { afterEach, describe, expect, it, vi } from 'vitest';
import { sarakDownloadXlsx, sarakExportXlsx, sarakTableToSheetRows, sarakTableToXlsx, visibleColumns, XLSX_MIME } from '../tableXlsx';
import { columnLetters, crc32, escapeXml, safeSheetName } from '../xlsxFile';

const BRL = { type: 'currency', currency: 'BRL' } as const;
const columns = [
    { id: 'name', header: 'Nome' },
    { id: 'amount', header: 'Valor', format: BRL, aggregate: 'sum' as const },
    { id: 'note', header: 'Obs' },
];
const rows = [
    { name: 'Aluguel', amount: 1000, note: '=HYPERLINK("http://x")' },
    { name: 'Água', amount: -200.5, note: '@cmd' },
];
const plain = (text: unknown): string => String(text).replace(/\s/g, ' ');

/** Lê o zip "store" gerado: devolve cada parte, conferindo o CRC e o diretório central. */
function unzip(bytes: Uint8Array): Record<string, string> {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const endAt = bytes.length - 22;
    expect(view.getUint32(endAt, true)).toBe(0x06054B50);
    const total = view.getUint16(endAt + 10, true);
    let cursor = view.getUint32(endAt + 16, true);
    const decoder = new TextDecoder();
    const parts: Record<string, string> = {};
    for (let index = 0; index < total; index += 1) {
        expect(view.getUint32(cursor, true)).toBe(0x02014B50);
        const crc = view.getUint32(cursor + 16, true);
        const size = view.getUint32(cursor + 24, true);
        const nameLength = view.getUint16(cursor + 28, true);
        const localAt = view.getUint32(cursor + 42, true);
        const name = decoder.decode(bytes.subarray(cursor + 46, cursor + 46 + nameLength));
        expect(view.getUint32(localAt, true)).toBe(0x04034B50);
        const dataAt = localAt + 30 + view.getUint16(localAt + 26, true);
        const data = bytes.subarray(dataAt, dataAt + size);
        expect(crc32(data)).toBe(crc);
        parts[name] = decoder.decode(data);
        cursor += 46 + nameLength;
    }
    return parts;
}

afterEach(() => vi.restoreAllMocks());

describe('xlsxFile', () => {
    it('crc32 bate com o valor conhecido', () => {
        expect(crc32(new TextEncoder().encode('123456789'))).toBe(0xCBF43926);
    });

    it('letras de coluna, escape de XML e nome de aba seguros', () => {
        expect([0, 25, 26, 27, 701, 702].map(columnLetters)).toEqual(['A', 'Z', 'AA', 'AB', 'ZZ', 'AAA']);
        expect(escapeXml('a<b>&"c"\u0001')).toBe('a&lt;b&gt;&amp;&quot;c&quot;');
        expect(safeSheetName('Vendas/2026: [Q1]?')).toBe('Vendas 2026   Q1');
        expect(safeSheetName('x'.repeat(40))).toHaveLength(31);
        expect(safeSheetName('///')).toBe('Sheet1');
    });
});

describe('sarakTableToXlsx', () => {
    it('gera um zip válido com as partes de uma planilha do Excel', async () => {
        const parts = unzip(await sarakTableToXlsx(columns, rows, { locale: 'pt-BR', sheetName: 'Contas' }));
        expect(Object.keys(parts).sort()).toEqual(['[Content_Types].xml', '_rels/.rels', 'xl/_rels/workbook.xml.rels', 'xl/styles.xml', 'xl/workbook.xml', 'xl/worksheets/sheet1.xml']);
        expect(parts['xl/workbook.xml']).toContain('name="Contas"');
        expect(parts['xl/styles.xml']).toContain('<cellStyleXfs count="1">');
        expect(parts['xl/styles.xml']).toContain('<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>');
        expect(parts['xl/worksheets/sheet1.xml']).toContain('<c r="A1" t="inlineStr" s="1"><is><t xml:space="preserve">Nome</t></is></c>');
        expect(parts['xl/worksheets/sheet1.xml']).toContain('Aluguel');
    });

    it('exporta o valor formatado (moeda) e inclui o rodapé', () => {
        const sheet = sarakTableToSheetRows(columns, rows, { locale: 'pt-BR' });
        expect(sheet[0]).toEqual(['Nome', 'Valor', 'Obs']);
        expect(plain(sheet[1][1])).toBe('R$ 1.000,00');
        expect(plain(sheet[3][1])).toBe('R$ 799,50');
    });

    it('formatted:false exporta número como número e tira o rodapé com includeFooter:false', () => {
        const sheet = sarakTableToSheetRows(columns, rows, { formatted: false, includeFooter: false });
        expect(sheet).toHaveLength(3);
        expect(sheet[1][1]).toBe(1000);
        expect(sheet[2][1]).toBe(-200.5);
    });

    it('bloqueia fórmula vinda de dado: texto que começa com = + - @ ganha apóstrofo; moeda negativa não', () => {
        const sheet = sarakTableToSheetRows(columns, rows, { locale: 'pt-BR', includeFooter: false });
        expect(sheet[1][2]).toBe("'=HYPERLINK(\"http://x\")");
        expect(sheet[2][2]).toBe("'@cmd");
        expect(String(sheet[2][1]).startsWith("'")).toBe(false);
        const more = sarakTableToSheetRows([{ id: 'v', header: 'V' }], [{ v: '+1+1' }, { v: '-2+3' }, { v: '\tcmd' }, { v: 'ok' }], { includeFooter: false });
        expect(more.slice(1).map((row) => row[0])).toEqual(["'+1+1", "'-2+3", "'\tcmd", 'ok']);
        expect(sarakTableToSheetRows([{ id: 'v', header: '=1+1' }], [], {})[0][0]).toBe("'=1+1");
    });

    it('a fórmula neutralizada chega ao arquivo como texto, nunca como <f>', async () => {
        const parts = unzip(await sarakTableToXlsx(columns, rows, { locale: 'pt-BR' }));
        const sheet = parts['xl/worksheets/sheet1.xml'];
        expect(sheet).not.toContain('<f>');
        expect(sheet).toContain("'=HYPERLINK");
    });

    it('respeita as colunas visíveis e a ordem do estado', () => {
        const state = { hidden: ['note'], order: ['amount', 'name'] };
        expect(visibleColumns(columns, state).map((column) => ('id' in column ? column.id : column.key))).toEqual(['amount', 'name']);
        const sheet = sarakTableToSheetRows(columns, rows, { columnState: state, includeFooter: false, locale: 'pt-BR' });
        expect(sheet[0]).toEqual(['Valor', 'Nome']);
        expect(sheet[1]).toHaveLength(2);
    });

    it('colunas no formato da Table (key/label) funcionam', () => {
        expect(sarakTableToSheetRows([{ key: 'name', label: 'Nome' }], [{ name: 'Ana' }])).toEqual([['Nome'], ['Ana']]);
    });

    it('baixa com o tipo MIME de planilha e o nome pedido, e libera a URL', async () => {
        const created: Blob[] = [];
        vi.stubGlobal('URL', { createObjectURL: (blob: Blob) => { created.push(blob); return 'blob:x'; }, revokeObjectURL: vi.fn() });
        const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
        await sarakExportXlsx(columns, rows, { filename: 'contas.xlsx' });
        expect(click).toHaveBeenCalledOnce();
        expect(created[0].type).toBe(XLSX_MIME);
        expect((URL.revokeObjectURL as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith('blob:x');
        vi.unstubAllGlobals();
    });

    it('sarakDownloadXlsx usa o nome dado no atributo download', () => {
        vi.stubGlobal('URL', { createObjectURL: () => 'blob:y', revokeObjectURL: vi.fn() });
        let name = '';
        vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function click(this: HTMLAnchorElement) { name = this.download; });
        sarakDownloadXlsx('a.xlsx', new Uint8Array([1]));
        expect(name).toBe('a.xlsx');
        vi.unstubAllGlobals();
    });
});
