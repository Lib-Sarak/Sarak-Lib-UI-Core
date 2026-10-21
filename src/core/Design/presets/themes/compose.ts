import { sarakGetDefaultDesignState } from '../../master-map';
import type { SarakDesignState } from '../../../Provider/types';

/**
 * Chaves do `design` que NÃO são do tema: identidade do sistema, idioma do host
 * e o modo do usuário. Sobrevivem à troca de tema; tudo o mais é do tema escolhido.
 */
export const THEME_PRESERVED_KEYS = [
    'systemName',
    'logoUrl',
    'logoDarkUrl',
    'language',
    'availableLanguages',
    'enabledLanguages',
    'mode',
] as const;

/**
 * A função ÚNICA que compõe o `design` quando um tema é aplicado, nesta ordem:
 * padrão de TODO token do schema → o que não é do tema (identidade e modo do
 * usuário) → o `config` do host → o tema já resolvido para o modo. O tema vence
 * o que declara; o `config` vale no resto; o token que o tema novo não declara
 * e o host não fixou volta ao padrão — nunca herda o valor do tema anterior.
 *
 * Chamada pelo Provider (`useDesignSync`) e pela prévia do painel
 * (`useDesignDraft`): duas portas, um resolvedor.
 */
export const composeThemeDesign = (
    resolvedTheme: Record<string, unknown>,
    previous?: Partial<SarakDesignState> | Record<string, unknown>,
    hostConfig?: Partial<SarakDesignState> | Record<string, unknown>,
): SarakDesignState => {
    const preserved: Record<string, unknown> = {};
    const prev = (previous ?? {}) as Record<string, unknown>;
    THEME_PRESERVED_KEYS.forEach((key) => {
        if (prev[key] !== undefined) preserved[key] = prev[key];
    });
    return { ...sarakGetDefaultDesignState(), ...preserved, ...(hostConfig ?? {}), ...resolvedTheme } as unknown as SarakDesignState;
};
