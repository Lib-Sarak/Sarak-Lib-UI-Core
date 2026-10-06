import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSovereignSearch } from '../useSovereignSearch';

const search = (query: string) =>
    renderHook(() => useSovereignSearch({}, query, 'typo')).result.current.filteredComponents;

describe('useSovereignSearch', () => {
    it('com busca, ignora o pilar e acha por sentido: `escrita` traz as fontes', () => {
        const ids = search('escrita').flatMap((component) => component.tokens.map((token) => token.id));
        expect(ids).toEqual(expect.arrayContaining(['headingFont', 'bodyFont', 'monoFont']));
    });

    it('acha pelo nome do catálogo que a tela mostra: `logo` acha identityAlignment', () => {
        const ids = search('logo').flatMap((component) => component.tokens.map((token) => token.id));
        expect(ids).toContain('identityAlignment');
    });

    it('componente cujo rótulo casa aparece no resultado com os tokens que casaram', () => {
        const component = search('typography').find((item) => item.id === 'typography');
        expect(component?.tokens.map((token) => token.id)).toContain('headingFont');
    });

    it('sem busca, filtra pelo pilar ativo', () => {
        const ids = search('').map((component) => component.id);
        expect(ids).toEqual(['typography']);
    });

    it('consulta sem resultado devolve lista vazia', () => {
        expect(search('xyzq')).toEqual([]);
    });
});
