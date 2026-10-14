import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useThemeSeed } from '../useThemeSeed';
import { SARAK_ALL_THEMES } from '../../../Design/presets/themes/all';
import { SARAK_DEFAULT_THEME_ID } from '../../../Design/presets/themes';
import type { SarakThemeEntry, SarakThemePayload, SarakUIOptions } from '../../types';

const sovereign = SARAK_ALL_THEMES.find((theme) => theme.id === SARAK_DEFAULT_THEME_ID)!;

const seedOf = (props: {
    allThemes?: SarakThemeEntry[];
    activeThemeId?: string;
    initialTheme?: string;
    options?: SarakUIOptions;
    config?: SarakThemePayload;
}) => renderHook(() => useThemeSeed({
    allThemes: props.allThemes ?? [sovereign],
    activeThemeId: props.activeThemeId,
    initialTheme: props.initialTheme,
    optionsRef: { current: props.options ?? {} },
    configRef: { current: props.config ?? {} },
})).result.current;

afterEach(() => vi.restoreAllMocks());

describe('useThemeSeed — a semente do design', () => {
    it('sem nenhum pedido, o tema padrão explícito (e nunca o `classic` inexistente)', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const { resolveSeedThemeId, getSeedConfig } = seedOf({});

        expect(resolveSeedThemeId()).toBe(SARAK_DEFAULT_THEME_ID);
        expect(getSeedConfig().primaryColor).toBe(sovereign.design.primaryColor);
        expect(warn).not.toHaveBeenCalled();
    });

    it('activeThemeId vence initialTheme e options.theme.defaultTheme', () => {
        const custom: SarakThemeEntry = { id: 'meu', design: { primaryColor: '#123456' } };
        const { resolveSeedThemeId } = seedOf({
            allThemes: [sovereign, custom],
            activeThemeId: 'meu',
            initialTheme: SARAK_DEFAULT_THEME_ID,
            options: { theme: { defaultTheme: SARAK_DEFAULT_THEME_ID } } as SarakUIOptions,
        });
        expect(resolveSeedThemeId()).toBe('meu');
    });

    it('id EMBARCADO ainda não em memória é conhecido: semeia o id, sem aviso e sem cair no padrão', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const { resolveSeedThemeId } = seedOf({ initialTheme: 'cyberpunk-neon' });

        expect(resolveSeedThemeId()).toBe('cyberpunk-neon');
        expect(warn).not.toHaveBeenCalled();
    });

    it('id inexistente avisa nomeando o id e cai no tema padrão, no modo pedido', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const { resolveSeedThemeId, getSeedConfig } = seedOf({ initialTheme: 'classic', config: { mode: 'light' } });

        expect(resolveSeedThemeId()).toBe(SARAK_DEFAULT_THEME_ID);
        expect(warn.mock.calls.some((call) => String(call[0]).includes('"classic"'))).toBe(true);
        expect(getSeedConfig().primaryColor).toBe(sovereign.contraparte?.primaryColor);
    });

    it('options.theme.defaultTheme inexistente avisa UMA vez por id e usa o padrão', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const { resolveSeedThemeId } = seedOf({ options: { theme: { defaultTheme: 'nao-existe' } } as SarakUIOptions });

        expect(resolveSeedThemeId()).toBe(SARAK_DEFAULT_THEME_ID);
        expect(resolveSeedThemeId()).toBe(SARAK_DEFAULT_THEME_ID);
        const defaultWarns = warn.mock.calls.filter((call) => String(call[0]).includes('defaultTheme "nao-existe"'));
        expect(defaultWarns).toHaveLength(1);
    });

    it('a config do consumidor vence o tema na semente (a ordem de sempre)', () => {
        const { getSeedConfig } = seedOf({ config: { primaryColor: '#abcdef' } });
        expect(getSeedConfig().primaryColor).toBe('#abcdef');
    });
});
