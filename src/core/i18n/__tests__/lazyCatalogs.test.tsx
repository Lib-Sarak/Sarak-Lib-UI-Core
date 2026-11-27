import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { LIBRARY_TEXT_CATALOG } from '../catalog';
import { LANGUAGES } from '../languages';
import { useLibraryText } from '../useLibraryText';
import { isLazyCatalogLoaded, lazyCatalogEntry, loadLazyCatalogs, resetLazyCatalogsForTest } from '../lazyCatalogs';
import { LAZY_CATALOG } from '../lazyCatalogs.data';

describe('catálogos das peças opcionais — carga sob demanda', () => {
    beforeEach(() => resetLazyCatalogsForTest());

    it('não estão no catálogo do boot', () => {
        expect(Object.keys(LAZY_CATALOG).length).toBeGreaterThan(100);
        Object.keys(LAZY_CATALOG).forEach((key) => expect(LIBRARY_TEXT_CATALOG, key).not.toHaveProperty(key));
    });

    it('têm os seis idiomas, cada um não-vazio', () => {
        for (const [key, entry] of Object.entries(LAZY_CATALOG)) {
            LANGUAGES.forEach(({ id }) => expect((entry as Record<string, string>)[id]?.length, `${key}/${id}`).toBeGreaterThan(0));
        }
    });

    it('o primeiro quadro nunca mostra a chave crua; o texto chega quando o catálogo chega', async () => {
        const { result } = renderHook(() => useLibraryText());
        expect(result.current('copyButtonCopy')).toBe('');
        expect(lazyCatalogEntry('copyButtonCopy')).toBeUndefined();

        await waitFor(() => expect(isLazyCatalogLoaded()).toBe(true));
        expect(result.current('copyButtonCopy')).toBe(LAZY_CATALOG.copyButtonCopy.pt);
    });

    it('a leitura de texto do boot não pede a carga', () => {
        const { result } = renderHook(() => useLibraryText());
        expect(result.current('errorMessageUnknown')).toBe(LIBRARY_TEXT_CATALOG.errorMessageUnknown.pt);
        expect(isLazyCatalogLoaded()).toBe(false);
    });

    it('chamadas repetidas dividem uma só carga', async () => {
        const first = loadLazyCatalogs();
        expect(loadLazyCatalogs()).toBe(first);
        await first;
        expect(isLazyCatalogLoaded()).toBe(true);
    });
});
