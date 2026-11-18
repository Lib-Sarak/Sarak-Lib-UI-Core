import { describe, it, expect, vi, afterEach } from 'vitest';
import { validateDesign } from '../validation';
import { sarakGetDefaultDesignState } from '../../../Design/master-map';
import type { SarakDesignState } from '../../types';

const BLUE = 'custom:analogous:#2563eb';

const validated = (savedPalettes: unknown): unknown =>
    (validateDesign({ ...sarakGetDefaultDesignState(), savedPalettes } as unknown as SarakDesignState) as unknown as Record<string, unknown>).savedPalettes;

afterEach(() => { vi.restoreAllMocks(); });

describe('validateDesign — savedPalettes', () => {
    it('a lista válida passa como está', () => {
        expect(validated(`sp-1|Marca|${BLUE}`)).toBe(`sp-1|Marca|${BLUE}`);
    });

    it('o padrão (vazio) segue vazio: ausente ou texto vazio leem como nenhuma paleta', () => {
        expect(validated('') ?? '').toBe('');
    });

    it('entrada inválida é descartada e o resto fica', () => {
        expect(validated(`sp-1|Marca|${BLUE}~sp-2|Ruim|oceano`)).toBe(`sp-1|Marca|${BLUE}`);
    });

    it('o nome com aspas ou chaves chega limpo: não abre string nem bloco na variável CSS', () => {
        expect(validated(`sp-1|a"b}c|${BLUE}`)).toBe(`sp-1|abc|${BLUE}`);
    });

    it('valor que não é texto é descartado', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        expect(validated(['sp-1'])).not.toEqual(['sp-1']);
    });
});
