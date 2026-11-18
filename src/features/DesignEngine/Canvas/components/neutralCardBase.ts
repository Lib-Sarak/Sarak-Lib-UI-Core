import { sarakGetAllDesignTokens, sarakGetDefaultDesignState } from '../../../../core/Design/master-map';
import { composeThemeForMode } from '../../../../core/Design/presets/themes/compose';
import { SARAK_BOOT_THEMES } from '../../../../core/Design/presets/themes/boot';
import type { SarakDesignState } from '../../../../core/Provider/types';

type Mode = 'light' | 'dark';

/** Os ids dos tokens de cor: o que a base neutra pega do tema de referência, no modo da prévia. */
const colorTokenIds = (): readonly string[] => sarakGetAllDesignTokens().filter((token) => token.type === 'color').map((token) => token.id);

const BASE_BY_MODE = new Map<Mode, Partial<SarakDesignState>>();

/**
 * A base neutra da amostra de um card: o design padrão do motor, inteiro, e as cores do tema padrão do sistema no modo
 * da prévia. É fixa por modo — não segue o rascunho, então o mesmo preset tem a mesma amostra em qualquer tema atual —
 * mas segue o modo que a prévia mostra: com as cores escuras do padrão fixas, a amostra ficaria escura na prévia clara.
 */
export const neutralCardBase = (mode: Mode): Partial<SarakDesignState> => {
    const cached = BASE_BY_MODE.get(mode);
    if (cached) return cached;
    const theme = SARAK_BOOT_THEMES[0] as unknown as Parameters<typeof composeThemeForMode>[0];
    const reference = composeThemeForMode(theme, mode) as unknown as Record<string, unknown>;
    const colors = Object.fromEntries(colorTokenIds().filter((id) => reference[id] !== undefined).map((id) => [id, reference[id]]));
    const base = { ...sarakGetDefaultDesignState(), ...colors } as Partial<SarakDesignState>;
    BASE_BY_MODE.set(mode, base);
    return base;
};
