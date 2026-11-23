import type { SarakDesignState, SarakThemeEntry } from '../../../core/Provider/types';
import type { SarakTokenValue } from '../../../core/Design/types';

type TokenRecord = Record<string, SarakTokenValue>;

const sameValue = (a: unknown, b: unknown): boolean =>
    a === b || (typeof a === 'object' && a !== null && typeof b === 'object' && b !== null && JSON.stringify(a) === JSON.stringify(b));

/**
 * A troca de modo substitui uma customização de cor pela contraparte do tema? É quando o rascunho tem, num token que a
 * contraparte declara, um valor que não é o do tema no modo atual (customizado) e que a troca não preserva.
 */
export const discardsCustomColor = (current: SarakDesignState, next: SarakDesignState, theme: SarakThemeEntry | undefined): boolean => {
    const counterpart = theme?.contraparte;
    if (!counterpart || (current.mode === 'light' ? 'light' : 'dark') === (next.mode === 'light' ? 'light' : 'dark')) return false;
    const nativeMode = theme?.design?.mode === 'light' ? 'light' : 'dark';
    const source = ((current.mode === 'light' ? 'light' : 'dark') === nativeMode ? theme?.design : counterpart) as TokenRecord | undefined;
    return Object.keys(counterpart).some((tokenId) => {
        const value = (current as unknown as TokenRecord)[tokenId];
        return !sameValue(value, source?.[tokenId]) && !sameValue(value, (next as unknown as TokenRecord)[tokenId]);
    });
};
