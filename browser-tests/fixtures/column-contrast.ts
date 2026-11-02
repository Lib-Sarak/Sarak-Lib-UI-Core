import type { Page } from '@playwright/test';

export interface TextContrast {
    text: string;
    ratio: number;
}

/**
 * A razão de contraste de todo texto visível da coluna do painel, lida do navegador: a cor computada do texto sobre o
 * fundo efetivo (as camadas translúcidas dos ancestrais compostas até a primeira opaca).
 */
export const columnContrasts = (page: Page): Promise<TextContrast[]> => page.evaluate(() => {
    const canvas = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!;
    const rgba = (value: string): number[] => {
        canvas.clearRect(0, 0, 1, 1);
        canvas.fillStyle = '#000';
        canvas.fillStyle = value;
        canvas.fillRect(0, 0, 1, 1);
        const [red, green, blue] = canvas.getImageData(0, 0, 1, 1).data;
        const alpha = value.startsWith('rgba') || value.startsWith('color') || value.includes('/') ? Number(value.match(/([\d.]+)\)$/)?.[1] ?? 1) : 1;
        return [red, green, blue, Math.min(1, alpha)];
    };
    const blend = (top: number[], bottom: number[]): number[] =>
        [0, 1, 2].map((index) => top[index] * top[3] + bottom[index] * (1 - top[3])).concat(1);
    const linear = (channel: number): number => {
        const normalized = channel / 255;
        return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
    };
    const luminance = ([red, green, blue]: number[]): number => 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue);
    const backgroundOf = (element: Element): number[] => {
        const layers: number[][] = [];
        for (let node: Element | null = element; node; node = node.parentElement) {
            const channels = rgba(getComputedStyle(node).backgroundColor);
            if (channels[3] > 0) layers.push(channels);
            if (channels[3] === 1) break;
        }
        return layers.reduceRight((below, layer) => blend(layer, below), [255, 255, 255, 1]);
    };

    const found: Array<{ text: string; ratio: number }> = [];
    document.querySelector('.sarak-panel-column')!.querySelectorAll('*').forEach((element) => {
        const own = Array.from(element.childNodes)
            .filter((node) => node.nodeType === 3 && (node.textContent ?? '').trim() !== '')
            .map((node) => (node.textContent ?? '').trim()).join(' ');
        if (!own || ['OPTION', 'STYLE', 'SCRIPT'].includes(element.tagName)) return;
        const style = getComputedStyle(element);
        if (style.visibility === 'hidden' || Number(style.opacity) === 0) return;
        const background = backgroundOf(element);
        const foreground = blend(rgba(style.color), background);
        const [high, low] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
        found.push({ text: `${own.slice(0, 30)} <${element.tagName.toLowerCase()} ${String(element.getAttribute('class') ?? '').slice(0, 70)}>`, ratio: (high + 0.05) / (low + 0.05) });
    });
    return found;
});
