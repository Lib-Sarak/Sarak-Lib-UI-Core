import { replaceDesignChoice } from '../../../core/Provider/utils/designChoices';
import type { ModeResolvableTheme } from '../../../core/Design/presets/themes/color-engine';
import type { SarakDesignState } from '../../../core/Provider/types';

type Tokens = Partial<SarakDesignState>;

/**
 * A espiada de uma opção que muda o papel de cor da barra: a cor que o tema declara não pode vencer o papel espiado, como não vence
 * o papel escolhido. Sem tom na espiada, ou sem o tema em memória, ela fica como veio.
 */
export const peekWithTones = (peek: Tokens | null, draft: Tokens, theme: ModeResolvableTheme | undefined, hostConfig?: Record<string, unknown>): Tokens | null => {
    if (!peek || !theme) return peek;
    if (peek.sidebarTone === undefined && peek.topbarTone === undefined) return peek;
    return replaceDesignChoice(draft as Record<string, unknown>, peek as Record<string, unknown>, theme, hostConfig) as Tokens;
};
