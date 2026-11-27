import { describe, it, expect } from 'vitest';
import { SARAK_ALL_THEMES } from '../../../Design/presets/themes/all';
import { composeThemeDesign } from '../../../Design/presets/themes/compose';
import { resolveThemeForMode } from '../../../Design/presets/themes/color-engine';
import { applyColorMode } from '../overlayPreferences';
import type { SarakTokenValue } from '../../../Design/types';
import type { SarakDesignState, SarakThemeEntry } from '../../types';

/** Os tokens de cor que o cromo e o texto leem: o fundo e o texto de cada barra, o marcador, o item ativo e os papéis de texto do corpo. */
const CHROME_COLOR_TOKEN = /^(sidebar|topbar)\w*Color$|^nav\w*Color$|^(title|subtitle|emphasis|primary|secondary|accent|text\w*|surface|status\w+|colorBg\w*)Color$|^colorBg\w*$/;

const nativeModeOf = (theme: { design: Record<string, SarakTokenValue> }): 'light' | 'dark' => (theme.design.mode === 'light' ? 'light' : 'dark');

/**
 * O design que o importador recebe: o tema entra no modo nativo (`initialTheme`) e o modo pedido (`defaultColorMode`) passa pelo
 * caminho de modo do Provider. O alvo é o que a composição do tema entrega para o mesmo modo.
 */
describe('o caminho de modo do Provider entrega o cromo que o tema declara', () => {
    const cases = SARAK_ALL_THEMES.flatMap((theme) => (['light', 'dark'] as const).map((mode) => ({ theme, mode })));

    const variants = [
        ['no tom do tema', {}],
        ['com as barras em tom contrastante e degradê', { sidebarTone: 'primary', topbarTone: 'secondary', sidebarBackgroundStyle: 'gradient', topbarBackgroundStyle: 'gradient' }],
    ] as const;

    it.each(cases.flatMap((item) => variants.map((variant) => [item.theme.id, item.mode, variant[0], item.theme, variant[1]] as const)))('%s no modo %s, %s', (_id, mode, _label, baseTheme, overrides) => {
        const theme = { ...baseTheme, design: { ...baseTheme.design, ...overrides } };
        const native = composeThemeDesign(resolveThemeForMode(theme, nativeModeOf(theme)) as Record<string, unknown>);
        const entry = { id: theme.id, design: theme.design, contraparte: theme.contraparte } as unknown as SarakThemeEntry;
        const viaProvider = applyColorMode(native, mode, entry) as unknown as Record<string, unknown>;
        const expected = composeThemeDesign(resolveThemeForMode(theme, mode) as Record<string, unknown>) as unknown as Record<string, unknown>;
        const divergent = Object.keys(expected)
            .filter((token) => CHROME_COLOR_TOKEN.test(token) && JSON.stringify(viaProvider[token]) !== JSON.stringify(expected[token]))
            .map((token) => `${token}: ${String(viaProvider[token])} ≠ ${String(expected[token])}`);
        expect(divergent).toEqual([]);
    });
});

/** O tom de barra que o usuário escolheu no painel (e o tema não declara) acompanha a troca de modo: a paleta do modo alvo é calculada com ele. */
describe('a troca de modo respeita o tom de barra escolhido', () => {
    const found = SARAK_ALL_THEMES.find((item) => item.contraparte !== undefined && item.id === 'sarak-sovereign') ?? SARAK_ALL_THEMES.find((item) => item.contraparte !== undefined)!;
    const theme = found as unknown as { id: string; design: Record<string, SarakTokenValue>; contraparte?: Record<string, SarakTokenValue> };
    const entry = { id: theme.id, design: theme.design, contraparte: theme.contraparte } as unknown as SarakThemeEntry;
    const native = nativeModeOf(theme);
    const target = native === 'dark' ? 'light' : 'dark';

    it('a lateral escolhida como invertida sai igual à composição do tema com o tom, no modo alvo', () => {
        const chosen = { ...theme, design: { ...theme.design, sidebarTone: 'inverse', topbarTone: 'inverse' } };
        const expected = composeThemeDesign(resolveThemeForMode(chosen, target) as Record<string, unknown>) as unknown as Record<string, unknown>;
        const current = composeThemeDesign(resolveThemeForMode(chosen, native) as Record<string, unknown>);
        const viaProvider = applyColorMode({ ...current, sidebarTone: 'inverse', topbarTone: 'inverse' } as SarakDesignState, target, entry) as unknown as Record<string, unknown>;
        expect(viaProvider.sidebarColor).toBe(expected.sidebarColor);
        expect(viaProvider.sidebarColor).not.toBe(composeThemeDesign(resolveThemeForMode(theme, target) as Record<string, unknown>).sidebarColor);
    });
});
