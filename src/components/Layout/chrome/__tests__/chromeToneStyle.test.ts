import { describe, expect, it } from 'vitest';
import { resolveChromeToneStyle } from '../chromeToneStyle';

describe('resolveChromeToneStyle', () => {
    it.each(['neutral', 'surface'] as const)('no papel %s nada muda: estilo vazio', (tone) => {
        expect(resolveChromeToneStyle(tone, 'sidebar')).toEqual({});
        expect(resolveChromeToneStyle(tone, 'topbar')).toEqual({});
    });

    it.each(['primary', 'secondary', 'inverse'] as const)('no papel %s a lateral refaz texto, ênfase e borda a partir dos tokens dela', (tone) => {
        const style = resolveChromeToneStyle(tone, 'sidebar') as Record<string, string>;
        expect(style.color).toBe('var(--sarak-sidebar-item-text-color)');
        expect(style['--text-muted']).toBe('var(--sarak-sidebar-item-text-color)');
        expect(style['--sarak-text-main']).toBe('var(--sarak-sidebar-item-hover-text-color)');
        expect(style['--sarak-nav-active-color']).toBe('var(--sarak-sidebar-item-hover-text-color)');
        expect(style['--sarak-on-nav-active']).toBe('var(--sarak-sidebar-bg)');
        expect(style['--border-color']).toBe('var(--sarak-sidebar-border-color)');
    });

    it('selo, usuário e campo de busca ganham um véu do texto forte, não o fundo claro do cartão', () => {
        const style = resolveChromeToneStyle('primary', 'sidebar') as Record<string, string>;
        for (const variable of ['--theme-card', '--sarak-card-bg', '--sarak-input-bg']) {
            expect(style[variable]).toContain('color-mix(in srgb, var(--sarak-sidebar-item-hover-text-color)');
        }
        expect(style['--sarak-input-text-color']).toBe('var(--sarak-sidebar-item-hover-text-color)');
        expect(style['--sarak-input-icon-color']).toBe('var(--sarak-sidebar-item-text-color)');
    });

    it.each(['primary', 'secondary', 'inverse'] as const)('no papel %s o rodapé (nome, avatar, idioma, engrenagem) lê o texto da barra, não a cor primária do corpo', (tone) => {
        const style = resolveChromeToneStyle(tone, 'sidebar') as Record<string, string>;
        expect(style['--theme-primary']).toBe('var(--sarak-sidebar-item-hover-text-color)');
        expect(style['--sarak-primary-color']).toBe('var(--sarak-sidebar-item-hover-text-color)');
        expect(style['--sarak-on-surface']).toBe('var(--sarak-sidebar-item-hover-text-color)');
        expect(style['--theme-title']).toBe('var(--sarak-sidebar-item-hover-text-color)');
        expect(style['--theme-subtitle']).toBe('var(--sarak-sidebar-item-text-color)');
        expect(style['--sarak-subtitle-color']).toBe('var(--sarak-sidebar-item-text-color)');
        expect(style['--theme-on-primary']).toBe('var(--sarak-sidebar-bg)');
    });

    it('o texto sobre a cor primária da topbar segue o fundo da topbar', () => {
        const style = resolveChromeToneStyle('inverse', 'topbar') as Record<string, string>;
        expect(style['--theme-on-primary']).toBe('var(--sarak-topbar-bg)');
        expect(style['--sarak-on-surface']).toBe('var(--sarak-topbar-item-hover-text-color)');
    });

    it('a topbar contrastante preserva o véu da pílula na intensidade compartilhada com a paleta', () => {
        const style = resolveChromeToneStyle('primary', 'topbar', {
            topbarColor: '#005e22',
            topbarBackgroundStyle: 'gradient',
            topbarActiveItemStyle: 'pill',
            topbarItemTextColor: '#ecf7ed',
            topbarItemHoverTextColor: '#ecf7ed',
            topbarActiveColor: 'rgba(236, 247, 237, 0.2)',
            statusErrorColor: '#ef4444',
            colorBgBody: '#ffffff',
        }) as Record<string, string>;
        expect(style['--sarak-topbar-active-color']).toBe('rgba(236, 247, 237, 0.2)');
        expect(style['--sarak-topbar-item-hover-text-color']).toBe(style['--sarak-nav-active-color']);
        expect(style['--sarak-shell-logout-text-color']).toBeDefined();
        expect(style['--sarak-status-error-color']).toBeUndefined();
    });

    it('a lateral contrastante também entrega a cor do sair, medida sobre a parada, a faixa do usuário e a tinta de erro', () => {
        const style = resolveChromeToneStyle('primary', 'sidebar', {
            sidebarColor: '#005e22',
            sidebarBackgroundStyle: 'solid',
            sidebarActiveItemStyle: 'pill',
            sidebarItemTextColor: '#ecf7ed',
            sidebarItemHoverTextColor: '#ecf7ed',
            sidebarActiveColor: 'rgba(236, 247, 237, 0.2)',
            primaryColor: '#19e3f0',
            statusErrorColor: '#ef4444',
            colorBgBody: '#ffffff',
        }) as Record<string, string>;
        expect(style['--sarak-shell-logout-text-color']).toBeDefined();
    });

    it('no papel de superfície, a cor forte corrigida pinta o controle escolhido e o texto dele é o fundo da barra', () => {
        const style = resolveChromeToneStyle('surface', 'sidebar', {
            sidebarColor: '#f7eddd',
            sidebarBackgroundStyle: 'gradient',
            sidebarItemTextColor: '#0f0d15',
            sidebarItemHoverTextColor: '#0f0d15',
            colorBgBody: '#ffffff',
        }) as Record<string, string>;
        expect(style['--sarak-nav-active-color']).toBeDefined();
        expect(style['--sarak-on-nav-active']).toBe('var(--sarak-sidebar-bg)');
    });

    it('o texto inativo também passa 4,5:1 sobre a faixa do usuário (5% do marcador) e, na topbar, sobre a própria barra: o botão de idioma não leva tinta', () => {
        const channels = (hex: string): number[] => [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16));
        const luminance = (rgb: number[]): number => {
            const [r, g, b] = rgb.map((channel) => {
                const unit = channel / 255;
                return unit <= 0.03928 ? unit / 12.92 : ((unit + 0.055) / 1.055) ** 2.4;
            });
            return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        };
        const ratio = (foreground: number[], background: number[]): number => {
            const [light, dark] = [luminance(foreground), luminance(background)].sort((first, second) => second - first);
            return (light + 0.05) / (dark + 0.05);
        };
        const over = (top: number[], share: number, below: number[]): number[] => top.map((channel, index) => channel * share + below[index] * (1 - share));
        const base = channels('#005e22');
        const resolve = (bar: 'sidebar' | 'topbar'): number[] => channels((resolveChromeToneStyle('primary', bar, {
            [`${bar}Color`]: '#005e22',
            [`${bar}BackgroundStyle`]: 'solid',
            [`${bar}ActiveItemStyle`]: 'pill',
            [`${bar}ItemTextColor`]: '#b6c3c7',
            [`${bar}ItemHoverTextColor`]: '#ffffff',
            primaryColor: '#19e3f0',
            colorBgBody: '#ffffff',
        }) as Record<string, string>)[`--sarak-${bar}-item-text-color`]);
        const sidebarIdle = resolve('sidebar');
        expect(ratio(sidebarIdle, over(channels('#19e3f0'), 0.05, base))).toBeGreaterThanOrEqual(4.5);
        const topbarIdle = resolve('topbar');
        expect(ratio(topbarIdle, base)).toBeGreaterThanOrEqual(4.5);
        // A tinta de 10% que o botão não desenha mais não pode voltar à conta: com ela o texto saía mais claro que o necessário (3,87:1 sem ela).
        expect(ratio(topbarIdle, over(topbarIdle, 0.1, base))).toBeLessThan(4.5);
    });

    it('ajusta o texto inativo só o necessário para o ativo não perder para ele após escurecer o véu', () => {
        const style = resolveChromeToneStyle('inverse', 'topbar', {
            topbarColor: '#f4f4f4',
            topbarBackgroundStyle: 'gradient',
            topbarActiveItemStyle: 'pill',
            topbarItemTextColor: '#020617',
            topbarItemHoverTextColor: '#020617',
            topbarActiveColor: 'rgba(2, 6, 23, 0.2)',
            colorBgBody: '#ffffff',
        }) as Record<string, string>;
        expect(style['--sarak-topbar-item-text-color']).not.toBe('#020617');
    });

    it('um papel de superfície só corrige o texto forte quando a parada clara o exige', () => {
        const style = resolveChromeToneStyle('surface', 'sidebar', {
            sidebarColor: '#ffffff',
            sidebarBackgroundStyle: 'gradient',
            sidebarActiveItemStyle: 'pill',
            sidebarItemTextColor: '#767676',
            sidebarItemHoverTextColor: '#767676',
            sidebarActiveColor: 'rgba(118, 118, 118, 0.2)',
            navActiveMarkerColor: '#767676',
            colorBgBody: '#ffffff',
        }) as Record<string, string>;
        expect(style['--sarak-sidebar-item-hover-text-color']).not.toBe('var(--sarak-sidebar-item-hover-text-color)');
        expect(style['--theme-title']).toBe(style['--sarak-sidebar-item-hover-text-color']);
    });

    it('no neutro e na superfície o rodapé não muda: nenhuma dessas variáveis é refeita', () => {
        for (const tone of ['neutral', 'surface'] as const) {
            expect(resolveChromeToneStyle(tone, 'sidebar')).toEqual({});
        }
    });

    it('a topbar lê os tokens da topbar, nunca os da lateral', () => {
        const style = resolveChromeToneStyle('primary', 'topbar') as Record<string, string>;
        expect(Object.values(style).join(' ')).toContain('--sarak-topbar-item-text-color');
        expect(Object.values(style).join(' ')).not.toContain('sidebar');
    });
});
