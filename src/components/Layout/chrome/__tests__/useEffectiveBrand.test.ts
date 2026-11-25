import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useEffectiveBrand } from '../useEffectiveBrand';

describe('useEffectiveBrand', () => {
    it('sem Provider devolve a marca como veio', () => {
        const brand = { name: 'ERP' };
        expect(renderHook(() => useEffectiveBrand(brand)).result.current).toEqual({ name: 'ERP', logoUrl: undefined });
    });

    it('sem Provider e sem brand não inventa marca', () => {
        expect(renderHook(() => useEffectiveBrand(undefined)).result.current).toBeUndefined();
    });
});
