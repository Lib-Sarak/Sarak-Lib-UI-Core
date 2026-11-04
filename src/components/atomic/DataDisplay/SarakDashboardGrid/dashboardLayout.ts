/**
 * Matemática pura do painel arrastável: mover e redimensionar pelo teclado, e compactar para cima.
 * Fica fora da fronteira lazy — não depende de `react-grid-layout`.
 */

/** Posição e tamanho de um widget, em células da grade. */
export interface SarakDashboardLayoutItem {
    /** Mesmo `id` do widget. */
    id: string;
    x: number;
    y: number;
    /** Largura em colunas. */
    w: number;
    /** Altura em linhas. */
    h: number;
    minW?: number;
    minH?: number;
}

const ARROW_STEP: Readonly<Record<string, readonly [number, number]>> = {
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0],
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
};

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

const overlaps = (a: SarakDashboardLayoutItem, b: SarakDashboardLayoutItem): boolean =>
    a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

/** Passo da seta, ou `undefined` se a tecla não é seta. */
export const dashboardArrowStep = (key: string): readonly [number, number] | undefined => ARROW_STEP[key];

/**
 * Sobe cada widget até encostar em outro, de cima para baixo; o resultado não tem sobreposição.
 * `firstId` ganha o desempate na mesma linha: o widget que acabou de ser movido fica com o lugar.
 */
export function compactDashboardLayout(layout: readonly SarakDashboardLayoutItem[], firstId?: string): SarakDashboardLayoutItem[] {
    const placed: SarakDashboardLayoutItem[] = [];
    const rank = (item: SarakDashboardLayoutItem): number => (item.id === firstId ? 0 : 1);
    const ordered = [...layout].sort((a, b) => a.y - b.y || rank(a) - rank(b) || a.x - b.x);
    ordered.forEach((item) => {
        let next = { ...item, y: 0 };
        while (placed.some((other) => overlaps(next, other))) next = { ...next, y: next.y + 1 };
        placed.push(next);
    });
    return layout.map((item) => placed.find((entry) => entry.id === item.id) ?? item);
}

/** Troca um item e compacta; o widget alterado vence a disputa por espaço e os outros é que cedem. */
function replaceItem(layout: readonly SarakDashboardLayoutItem[], next: SarakDashboardLayoutItem): SarakDashboardLayoutItem[] {
    return compactDashboardLayout(layout.map((item) => (item.id === next.id ? next : item)), next.id);
}

/** Passo vertical que cai sobre outro widget salta para o outro lado dele: é assim que dois widgets trocam de lugar. */
function jumpOver(layout: readonly SarakDashboardLayoutItem[], next: SarakDashboardLayoutItem, stepY: number): SarakDashboardLayoutItem {
    const hit = layout.filter((item) => item.id !== next.id && overlaps(item, next));
    if (stepY === 0 || hit.length === 0) return next;
    return { ...next, y: stepY > 0 ? Math.max(...hit.map((item) => item.y + item.h)) : Math.min(...hit.map((item) => item.y)) };
}

/** Move o widget uma célula na direção da seta, dentro das `columns` colunas. */
export function moveDashboardItem(
    layout: readonly SarakDashboardLayoutItem[],
    id: string,
    key: string,
    columns: number,
): SarakDashboardLayoutItem[] {
    const step = ARROW_STEP[key];
    const current = layout.find((item) => item.id === id);
    if (!step || !current) return [...layout];
    const moved = {
        ...current,
        x: clamp(current.x + step[0], 0, Math.max(columns - current.w, 0)),
        y: Math.max(current.y + step[1], 0),
    };
    return replaceItem(layout, jumpOver(layout, moved, step[1]));
}

/** Muda o tamanho do widget uma célula na direção da seta, respeitando `minW`, `minH` e as colunas. */
export function resizeDashboardItem(
    layout: readonly SarakDashboardLayoutItem[],
    id: string,
    key: string,
    columns: number,
): SarakDashboardLayoutItem[] {
    const step = ARROW_STEP[key];
    const current = layout.find((item) => item.id === id);
    if (!step || !current) return [...layout];
    const minW = current.minW ?? 1;
    return replaceItem(layout, {
        ...current,
        w: clamp(current.w + step[0], minW, Math.max(columns - current.x, minW)),
        h: Math.max(current.h + step[1], current.minH ?? 1),
    });
}

/** Ordem de leitura (de cima para baixo, da esquerda para a direita): a do empilhamento em contêiner estreito. */
export const readingOrder = (layout: readonly SarakDashboardLayoutItem[]): string[] =>
    [...layout].sort((a, b) => a.y - b.y || a.x - b.x).map((item) => item.id);

/** Completa o layout com um item padrão para cada id que ainda não tem posição, no fim do painel. */
export function completeDashboardLayout(
    ids: readonly string[],
    layout: readonly SarakDashboardLayoutItem[],
    columns: number,
): SarakDashboardLayoutItem[] {
    const known = layout.filter((item) => ids.includes(item.id));
    const bottom = known.reduce((max, item) => Math.max(max, item.y + item.h), 0);
    const missing = ids.filter((id) => !known.some((item) => item.id === id));
    return [...known, ...missing.map((id, index) => ({ id, x: 0, y: bottom + index * 2, w: Math.min(4, columns), h: 2 }))];
}
