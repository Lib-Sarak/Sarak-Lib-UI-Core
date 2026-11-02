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
