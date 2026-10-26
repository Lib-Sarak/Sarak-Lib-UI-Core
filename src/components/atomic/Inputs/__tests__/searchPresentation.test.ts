import { describe, expect, it } from 'vitest';
import { getSarakSearchItemSubtitle, getSearchModifierLabel } from '../internal/searchPresentation';

describe('search presentation', () => {
    it('mostra o modificador correspondente ao sistema operacional', () => {
        expect(getSearchModifierLabel('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')).toBe('Ctrl');
        expect(getSearchModifierLabel('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)')).toBe('⌘');
        expect(getSearchModifierLabel('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')).toBe('⌘');
    });

    it('usa categoria ou caminho útil e omite ids internos', () => {
        expect(getSarakSearchItemSubtitle({ id: '/propostas', label: 'Propostas', category: 'Comercial' })).toBe('Comercial');
        expect(getSarakSearchItemSubtitle({ id: '/propostas', label: 'Propostas' })).toBe('/propostas');
        expect(getSarakSearchItemSubtitle({ id: 'proposal-list', label: 'Propostas' })).toBeUndefined();
    });
});
