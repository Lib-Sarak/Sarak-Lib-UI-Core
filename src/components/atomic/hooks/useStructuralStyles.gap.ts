import { resolveToken } from '../../../core/Manifest/Tokens';

/**
 * Resolve a medida de `gap` vinda de prop (token semântico ou CSS já válido) para
 * CSS aplicável, caindo no default do Design Engine quando ausente/inválida.
 *
 * Extraído de `useStructuralStyles` (Spec 16) para manter o hook enxuto: é a ponte
 * entre a prop crua do manifesto e o resolutor oficial de tokens.
 */
export const resolveGap = (
    override: string | undefined,
    fallback: string | number,
    atom: string,
): string | number =>
    override == null ? fallback : (resolveToken(override, { atom, prop: 'gap' }) ?? fallback);
