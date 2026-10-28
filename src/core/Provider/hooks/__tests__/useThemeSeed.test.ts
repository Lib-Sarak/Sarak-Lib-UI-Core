import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useThemeSeed } from '../useThemeSeed';
import { SARAK_ALL_THEMES } from '../../../Design/presets/themes/all';
import { SARAK_DEFAULT_THEME_ID } from '../../../Design/presets/themes';
import { evaluatePair } from '../../../../../gates/scripts/audit/verify_contrast';
import { PAIRS } from '../../../Design/palette/contrast-pairs';
import { sarakGetDefaultDesignState } from '../../../Design/master-map';
import { composeThemeForMode } from '../../../Design/presets/themes/compose';
import type { SarakThemeEntry, SarakThemePayload, SarakUIOptions } from '../../types';

const sovereign = SARAK_ALL_THEMES.find((theme) => theme.id === SARAK_DEFAULT_THEME_ID)!;
/** O que o tema padrão pinta num modo: a paleta que ele declara, com a sobrescrita dele por cima. */
const sovereignIn = (mode: 'light' | 'dark') => composeThemeForMode(sovereign as never, mode) as unknown as Record<string, unknown>;

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
        expect(getSeedConfig().primaryColor).toBe(sovereignIn('dark').primaryColor);
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
        expect(getSeedConfig().primaryColor).toBe(sovereignIn('light').primaryColor);
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

    it('usa as cores dos papéis de texto do modo claro (as da paleta) e preserva as substituições do host', () => {
        const { getSeedConfig } = seedOf({
            config: { mode: 'light', titleColor: '#123456' },
        });
        const seed = getSeedConfig();

        expect(seed.titleColor).toBe('#123456');
        expect(seed.subtitleColor).toBe(sovereignIn('light').subtitleColor);
        expect(seed.emphasisColor).toBe(sovereignIn('light').emphasisColor);
    });

    it('ignora o id do cache quando o host declara que o config vence', () => {
        const storageKey = 'theme-seed-config-wins';
        const configTheme: SarakThemeEntry = {
            id: 'config-theme',
            design: { mode: 'dark', primaryColor: '#123456' },
        };
        const activeThemeKey = `${storageKey}::active-theme-id`;
        localStorage.setItem(activeThemeKey, 'cached-theme');

        try {
            const { resolveSeedThemeId, getSeedConfig } = seedOf({
                allThemes: [sovereign, configTheme],
                initialTheme: configTheme.id,
                config: { primaryColor: '#123456' },
                options: { persistence: { storageKey, preferConfigOverCache: true } },
            });

            expect(resolveSeedThemeId()).toBe('config-theme');
            expect(getSeedConfig().primaryColor).toBe('#123456');
        } finally {
            localStorage.removeItem(activeThemeKey);
        }
    });
});

describe('useThemeSeed — o texto da barra contra o fundo que o host declara', () => {
    it('barra escura num tema claro: o item inativo da semente mantém 4,5', () => {
        const seed = seedOf({ config: { mode: 'light', sidebarColor: '#111111' } }).getSeedConfig();
        const pair = PAIRS.find((candidate) => candidate.fg === 'sidebarItemTextColor')!;

        expect(seed.sidebarColor).toBe('#111111');
        expect(evaluatePair(pair, { ...sarakGetDefaultDesignState(), ...seed } as never)).toMatchObject({ pulado: false, pass: true });
    });
});
