/**
 * Escritor mínimo de planilha `.xlsx` — código próprio, sem dependência. Um `.xlsx` é um zip de XMLs; aqui o zip
 * é sem compressão (método "store") e a planilha tem uma aba, texto inline e uma linha de cabeçalho em negrito.
 * Este módulo só é carregado no clique de exportar (`import()` em `tableXlsx.ts`).
 */

/** Valor de célula: texto (nunca vira fórmula, é sempre `inlineStr`), número ou vazio. */
export type XlsxCell = string | number | null;

export interface XlsxSheet {
    name: string;
    /** Linhas de células; a primeira é o cabeçalho e sai em negrito. */
    rows: XlsxCell[][];
}

const XML_HEADER = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
const NS_MAIN = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
const NS_REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const NS_PKG_REL = 'http://schemas.openxmlformats.org/package/2006/relationships';
/** Caracteres de controle que o XML 1.0 não admite (tab, LF e CR são válidos). */
const INVALID_XML = /[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g;
const INVALID_SHEET_NAME = /[\\/?*[\]:]/g;
const MAX_SHEET_NAME = 31;
const BOLD_STYLE = 1;

export const escapeXml = (text: string): string =>
    text.replace(INVALID_XML, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Nome de aba que o Excel aceita: sem `\ / ? * [ ] :`, até 31 caracteres, nunca vazio. */
export const safeSheetName = (name: string): string => name.replace(INVALID_SHEET_NAME, ' ').trim().slice(0, MAX_SHEET_NAME) || 'Sheet1';

/** Índice de coluna (0 = A) → letras (`A`, `Z`, `AA`). */
export function columnLetters(index: number): string {
    let letters = '';
    for (let rest = index + 1; rest > 0; rest = Math.floor((rest - 1) / 26)) letters = String.fromCharCode(65 + ((rest - 1) % 26)) + letters;
    return letters;
}

function cellXml(value: XlsxCell, reference: string, style: number): string {
    const styleAttr = style ? ` s="${style}"` : '';
    if (value === null || value === '') return `<c r="${reference}"${styleAttr}/>`;
    if (typeof value === 'number') return Number.isFinite(value) ? `<c r="${reference}"${styleAttr}><v>${value}</v></c>` : `<c r="${reference}"${styleAttr}/>`;
    return `<c r="${reference}" t="inlineStr"${styleAttr}><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
}

function sheetXml(rows: readonly XlsxCell[][]): string {
    const body = rows
        .map((row, rowIndex) => `<row r="${rowIndex + 1}">${row.map((value, column) => cellXml(value, `${columnLetters(column)}${rowIndex + 1}`, rowIndex === 0 ? BOLD_STYLE : 0)).join('')}</row>`)
        .join('');
    return `${XML_HEADER}<worksheet xmlns="${NS_MAIN}"><sheetData>${body}</sheetData></worksheet>`;
}

const STYLES_XML = `${XML_HEADER}<styleSheet xmlns="${NS_MAIN}"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;

const relationship = (id: string, type: string, target: string): string =>
    `<Relationship Id="${id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/${type}" Target="${target}"/>`;

function packageParts(sheet: XlsxSheet): Array<[string, string]> {
    return [
        ['[Content_Types].xml', `${XML_HEADER}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`],
        ['_rels/.rels', `${XML_HEADER}<Relationships xmlns="${NS_PKG_REL}">${relationship('rId1', 'officeDocument', 'xl/workbook.xml')}</Relationships>`],
        ['xl/workbook.xml', `${XML_HEADER}<workbook xmlns="${NS_MAIN}" xmlns:r="${NS_REL}"><sheets><sheet name="${escapeXml(safeSheetName(sheet.name))}" sheetId="1" r:id="rId1"/></sheets></workbook>`],
        ['xl/_rels/workbook.xml.rels', `${XML_HEADER}<Relationships xmlns="${NS_PKG_REL}">${relationship('rId1', 'worksheet', 'worksheets/sheet1.xml')}${relationship('rId2', 'styles', 'styles.xml')}</Relationships>`],
        ['xl/styles.xml', STYLES_XML],
        ['xl/worksheets/sheet1.xml', sheetXml(sheet.rows)],
    ];
}

const CRC_TABLE = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n += 1) {
        let c = n;
        for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
        table[n] = c >>> 0;
    }
    return table;
})();

export function crc32(bytes: Uint8Array): number {
    let crc = 0xFFFFFFFF;
    bytes.forEach((byte) => { crc = CRC_TABLE[(crc ^ byte) & 0xFF] ^ (crc >>> 8); });
    return (crc ^ 0xFFFFFFFF) >>> 0;
}

/** Data e hora no formato MS-DOS que o zip carrega. */
function dosDateTime(date: Date): { time: number; date: number } {
    return {
        time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
        date: ((Math.max(date.getFullYear(), 1980) - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
    };
}

const UTF8_FLAG = 0x0800;

/** Zip sem compressão com as partes dadas. */
export function zipStore(parts: ReadonlyArray<readonly [string, Uint8Array]>, now = new Date()): Uint8Array {
    const encoder = new TextEncoder();
    const stamp = dosDateTime(now);
    const chunks: Uint8Array[] = [];
    const central: Uint8Array[] = [];
    let offset = 0;
    parts.forEach(([name, data]) => {
        const nameBytes = encoder.encode(name);
        const crc = crc32(data);
        const local = new DataView(new ArrayBuffer(30));
        [[0, 0x04034B50, 4], [4, 20, 2], [6, UTF8_FLAG, 2], [8, 0, 2], [10, stamp.time, 2], [12, stamp.date, 2], [14, crc, 4], [18, data.length, 4], [22, data.length, 4], [26, nameBytes.length, 2], [28, 0, 2]]
            .forEach(([at, value, size]) => (size === 4 ? local.setUint32(at, value, true) : local.setUint16(at, value, true)));
        const entry = new DataView(new ArrayBuffer(46));
        [[0, 0x02014B50, 4], [4, 20, 2], [6, 20, 2], [8, UTF8_FLAG, 2], [10, 0, 2], [12, stamp.time, 2], [14, stamp.date, 2], [16, crc, 4], [20, data.length, 4], [24, data.length, 4], [28, nameBytes.length, 2], [30, 0, 2], [32, 0, 2], [34, 0, 2], [36, 0, 2], [38, 0, 4], [42, offset, 4]]
            .forEach(([at, value, size]) => (size === 4 ? entry.setUint32(at, value, true) : entry.setUint16(at, value, true)));
        chunks.push(new Uint8Array(local.buffer), nameBytes, data);
        central.push(new Uint8Array(entry.buffer), nameBytes);
        offset += 30 + nameBytes.length + data.length;
    });
    const centralSize = central.reduce((total, chunk) => total + chunk.length, 0);
    const end = new DataView(new ArrayBuffer(22));
    [[0, 0x06054B50, 4], [4, 0, 2], [6, 0, 2], [8, parts.length, 2], [10, parts.length, 2], [12, centralSize, 4], [16, offset, 4], [20, 0, 2]]
        .forEach(([at, value, size]) => (size === 4 ? end.setUint32(at, value, true) : end.setUint16(at, value, true)));
    const all = [...chunks, ...central, new Uint8Array(end.buffer)];
    const output = new Uint8Array(all.reduce((total, chunk) => total + chunk.length, 0));
    all.reduce((position, chunk) => { output.set(chunk, position); return position + chunk.length; }, 0);
    return output;
}

/** Planilha `.xlsx` (bytes) com uma aba. */
export function buildXlsx(sheet: XlsxSheet): Uint8Array {
    const encoder = new TextEncoder();
    return zipStore(packageParts(sheet).map(([name, xml]) => [name, encoder.encode(xml)] as const));
}
