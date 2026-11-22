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
        expect(style['--sarak-status-error-color']).toBeDefined();
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
