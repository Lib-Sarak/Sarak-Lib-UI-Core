import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCatalogThemes } from '../useCatalogThemes';
import { SARAK_THEME_CATALOG } from '../../../../../core/Design/presets/themes/catalog.generated';
import type { SarakUIContextType } from '../../../../../core/Provider/types';

describe('useCatalogThemes — a lista da galeria', () => {
    it('sem Provider: lista o catálogo INTEIRO na hora, e cada tema ganha o `design` quando chega', async () => {
        const { result } = renderHook(() => useCatalogThemes());

        expect(result.current.rows.map((row) => row.entry.id)).toEqual(SARAK_THEME_CATALOG.map((entry) => entry.id));
        await waitFor(() => expect(result.current.rows.every((row) => row.theme !== undefined)).toBe(true));
    });

    it('com Provider: o tema sem `design` em memória aparece só como metadado', () => {
        const sarak = {
            themeCatalog: SARAK_THEME_CATALOG.slice(0, 2),
            allThemes: [{ id: SARAK_THEME_CATALOG[0].id, design: { mode: 'dark' } }],
            loadTheme: async () => undefined,
        } as unknown as SarakUIContextType;
        const { result } = renderHook(() => useCatalogThemes(sarak));

        expect(result.current.rows).toHaveLength(2);
        expect(result.current.rows[0].theme).toBeDefined();
        expect(result.current.rows[1].theme).toBeUndefined();
        expect(result.current.loadTheme).toBe(sarak.loadTheme);
    });

    it('um tema de consumidor (custom/salvo) entra na lista com o `design` que já tem', () => {
        const custom = { id: 'meu', name: 'Meu', design: { mode: 'light' } };
        const sarak = {
            themeCatalog: [{ id: 'meu', name: 'Meu', description: '', mode: 'light', hasContraparte: false, swatch: {}, swatchOpposite: {} }],
            allThemes: [custom],
            loadTheme: async () => custom,
        } as unknown as SarakUIContextType;
        const { result } = renderHook(() => useCatalogThemes(sarak));

        expect(result.current.rows[0].theme).toBe(custom);
    });
});
