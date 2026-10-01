import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useAutocompleteController } from '../useAutocompleteController';

describe('useAutocompleteController', () => {
    it('filtra as opções locais pelo texto inicial', () => {
        const options = [
            { value: 'finance', label: 'Financeiro' },
            { value: 'technology', label: 'Tecnologia' },
        ];
        const { result } = renderHook(() => useAutocompleteController({
            options,
            debounceMs: 0,
            defaultValue: 'fin',
        }));

        expect(result.current.query).toBe('fin');
        expect(result.current.suggestions).toEqual([options[0]]);
        expect(result.current.shouldShowPanel).toBe(false);
    });
});
