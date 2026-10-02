import { describe, expect, it } from 'vitest';
import { runPublicPrefixCheck } from '../check-public-prefix.mjs';

describe('check-public-prefix', () => {
    it('reprova nome público sem prefixo e informa a espécie', () => {
        const result = runPublicPrefixCheck({ dtsContent: 'export { reorder };', exclusions: {} });

        expect(result.violations).toEqual([
            { name: 'reorder', species: 'função camelCase', conforms: false },
        ]);
        expect(result.error).toBeNull();
    });

    it('aceita prefixos válidos para tipos, constantes, hooks e funções', () => {
        const dtsContent = 'export { type SarakThemePayload, SARAK_THEME_AXES, useSarakTheme, sarakReorder, getSarakModule };';
        const result = runPublicPrefixCheck({ dtsContent, exclusions: {} });

        expect(result.violations).toEqual([]);
        expect(result.staleExclusions).toEqual([]);
        expect(result.error).toBeNull();
    });

    it('reprova exceção obsoleta de nome já conforme', () => {
        const result = runPublicPrefixCheck({
            dtsContent: 'export { SarakThemePayload };',
            exclusions: { SarakThemePayload: 'Tipo público já está conforme.' },
        });

        expect(result.staleExclusions).toEqual(['SarakThemePayload']);
    });
});
