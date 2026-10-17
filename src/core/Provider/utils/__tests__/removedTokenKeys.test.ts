import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Tema salvo com uma chave que saiu do schema não quebra: `validateDesign` a descarta,
 * avisa nomeando-a e o cartão/tabela desenham o padrão (nenhuma fonte de padrão a carrega).
 * O aviso é único por sessão (estado de módulo), então cada caso importa um módulo novo.
 */
const loadFresh = async () => {
    vi.resetModules();
    const { validateDesign } = await import('../validation');
    const { sarakGetDefaultDesignState } = await import('../../../Design/master-map');
    return { validateDesign, sarakGetDefaultDesignState };
};

describe('chaves retiradas por não terem leitor', () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        warnSpy.mockRestore();
    });

    const cases: Array<{ key: string; saved: string; sibling: string; siblingValue: string }> = [
        { key: 'cardContentAlignment', saved: 'space-between', sibling: 'cardTextAlign', siblingValue: 'center' },
        { key: 'tableActionPosition', saved: 'left', sibling: 'tableDensity', siblingValue: 'compact' },
        { key: 'cardImagePosition', saved: 'right', sibling: 'cardLayoutDirection', siblingValue: 'row' },
        { key: 'contentAlignment', saved: 'center', sibling: 'maxContentWidth', siblingValue: '1200px' },
    ];

    it.each(cases)('$key salvo é descartado com aviso que o nomeia, e o resto do tema vale', async ({ key, saved, sibling, siblingValue }) => {
        const { validateDesign, sarakGetDefaultDesignState } = await loadFresh();

        const result = validateDesign({ mode: 'dark', [key]: saved, [sibling]: siblingValue }) as Record<string, unknown>;

        expect(result).not.toHaveProperty(key);
        expect(result[sibling]).toBe(siblingValue);
        expect(warnSpy).toHaveBeenCalledTimes(1);
        expect(String(warnSpy.mock.calls[0][0])).toContain(`"${key}"`);
        expect(String(warnSpy.mock.calls[0][0])).toContain('removido do schema');

        // Padrão: nem os defaults do schema nem o tema validado trazem a chave.
        const merged = { ...sarakGetDefaultDesignState(), ...result } as Record<string, unknown>;
        expect(merged).not.toHaveProperty(key);
    });
});
