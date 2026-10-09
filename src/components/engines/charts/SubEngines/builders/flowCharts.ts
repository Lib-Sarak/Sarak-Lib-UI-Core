import type { ChartBuilderConfig, ChartOptionFragment, ChartTheme, SarakChartDataItem } from './types';

const SANKEY_CURVENESS = 0.5;
const SANKEY_LINK_OPACITY = 0.35;
const SANKEY_NODE_WIDTH = 14;
const SANKEY_NODE_GAP = 10;
const SANKEY_MARGIN_FACTOR = 2;

interface SankeyLink {
    source: string;
    target: string;
    value: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toNodeName(value: unknown): string | null {
    if (typeof value === 'string') return value.trim() ? value : null;
    return typeof value === 'number' && Number.isFinite(value) ? String(value) : null;
}

function toLink(item: unknown, valueKey: string): SankeyLink | null {
    if (!isRecord(item)) return null;
    const source = toNodeName(item.source);
    const target = toNodeName(item.target);
    const value = item[valueKey];
    if (source === null || target === null) return null;
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return null;
    return { source, target, value };
}

function reaches(from: string, to: string, links: readonly SankeyLink[]): boolean {
    const pending = [from];
    const visited = new Set<string>();
    while (pending.length > 0) {
        const node = pending.pop() as string;
        if (node === to) return true;
        if (visited.has(node)) continue;
        visited.add(node);
        links.forEach((link) => { if (link.source === node) pending.push(link.target); });
    }
    return false;
}

/** O sankey exige grafo sem ciclo: a ligação que fecharia um ciclo (ou aponta para si mesma) é descartada. */
function sanitizeLinks(data: unknown, valueKey: string): SankeyLink[] {
    const links: SankeyLink[] = [];
    if (!Array.isArray(data)) return links;
    data.forEach((item) => {
        const link = toLink(item, valueKey);
        if (link && !reaches(link.target, link.source, links)) links.push(link);
    });
    return links;
}

/** Há ao menos uma ligação válida (origem, destino e valor positivo) que não feche ciclo. */
export function hasSankeyData(data: unknown, valueKey: string): boolean {
    return sanitizeLinks(data, valueKey).length > 0;
}

export const buildSankeySeries = (
    data: SarakChartDataItem[],
    config: ChartBuilderConfig | undefined,
    theme: ChartTheme,
): ChartOptionFragment => {
    const links = sanitizeLinks(data, config?.dataKey || 'value');
    const names = new Set(links.flatMap((link) => [link.source, link.target]));
    const margin = theme.axisLabelMargin * SANKEY_MARGIN_FACTOR;
    return {
        series: [{
            type: 'sankey',
            data: [...names].map((name) => ({ name })),
            links,
            top: margin,
            bottom: margin,
            left: margin,
            right: margin,
            nodeWidth: SANKEY_NODE_WIDTH,
            nodeGap: SANKEY_NODE_GAP,
            emphasis: { focus: 'adjacency' },
            lineStyle: { color: 'gradient', curveness: SANKEY_CURVENESS, opacity: SANKEY_LINK_OPACITY },
            itemStyle: { borderColor: theme.surfaceColor, borderWidth: theme.borderWidth },
            label: { color: theme.textColor, fontSize: theme.fontSize, fontFamily: theme.bodyFont },
        }],
    };
};
