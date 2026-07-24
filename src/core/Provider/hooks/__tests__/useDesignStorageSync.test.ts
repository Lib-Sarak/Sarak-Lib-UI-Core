import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDesignStorageSync } from '../useDesignStorageSync';
import type { SarakDesignState } from '../../types';

const STORAGE_KEY = 'sarak-ui-design-test';

const dispatchStorage = (key: string | null, newValue: string | null): void => {
    window.dispatchEvent(new StorageEvent('storage', { key, newValue, storageArea: window.localStorage }));
};

describe('useDesignStorageSync (sincronização de tema entre abas/apps)', () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        warnSpy.mockRestore();
    });

    it('reaplica o design quando outra aba grava um tema válido na MESMA chave', () => {
        const setDesign = vi.fn();
        const design = { mode: 'dark' } as SarakDesignState;

        renderHook(() => useDesignStorageSync(true, STORAGE_KEY, true, design, setDesign));

        dispatchStorage(STORAGE_KEY, JSON.stringify({ mode: 'light', primaryColor: '#ff0000' }));

        expect(setDesign).toHaveBeenCalledTimes(1);
        const updater = setDesign.mock.calls[0][0] as (prev: SarakDesignState) => SarakDesignState;
        const next = updater(design);
        expect(next.mode).toBe('light');
        expect(next.primaryColor).toBe('#ff0000');
    });

    it('ignora um evento de `storage` com `key` diferente da chave de persistência', () => {
        const setDesign = vi.fn();
        const design = { mode: 'dark' } as SarakDesignState;

        renderHook(() => useDesignStorageSync(true, STORAGE_KEY, true, design, setDesign));

        dispatchStorage('outra-chave-qualquer', JSON.stringify({ mode: 'light' }));

        expect(setDesign).not.toHaveBeenCalled();
    });

    it('descarta um valor hostil (`</style><script>`) sem nunca injetá-lo no estado', () => {
        const setDesign = vi.fn();
        const design = { mode: 'dark' } as SarakDesignState;

        renderHook(() => useDesignStorageSync(true, STORAGE_KEY, true, design, setDesign));

        dispatchStorage(
            STORAGE_KEY,
            JSON.stringify({ primaryColor: '</style><script>alert(document.cookie)</script>', mode: 'light' })
        );

        expect(setDesign).toHaveBeenCalledTimes(1);
        const updater = setDesign.mock.calls[0][0] as (prev: SarakDesignState) => SarakDesignState;
        const next = updater(design);
        const serialized = JSON.stringify(next);
        expect(serialized).not.toContain('<script');
        expect(serialized).not.toContain('</style');
        expect(next.primaryColor).toBeUndefined();
        expect(next.mode).toBe('light');
        expect(warnSpy).toHaveBeenCalled();
    });

    it('descarta uma chave desconhecida no schema de tema sem quebrar o merge das demais chaves válidas', () => {
        const setDesign = vi.fn();
        const design = { mode: 'dark' } as SarakDesignState;

        renderHook(() => useDesignStorageSync(true, STORAGE_KEY, true, design, setDesign));

        dispatchStorage(STORAGE_KEY, JSON.stringify({ mode: 'light', chaveHostilDesconhecida: 'javascript:alert(1)' }));

        expect(setDesign).toHaveBeenCalledTimes(1);
        const updater = setDesign.mock.calls[0][0] as (prev: SarakDesignState) => SarakDesignState;
        const next = updater(design);
        expect(next).not.toHaveProperty('chaveHostilDesconhecida');
        expect(next.mode).toBe('light');
        expect(warnSpy).toHaveBeenCalled();
    });

    it('descarta JSON ilegível sem lançar e sem chamar setDesign', () => {
        const setDesign = vi.fn();
        const design = { mode: 'dark' } as SarakDesignState;

        renderHook(() => useDesignStorageSync(true, STORAGE_KEY, true, design, setDesign));

        expect(() => dispatchStorage(STORAGE_KEY, '{not valid json')).not.toThrow();
        expect(setDesign).not.toHaveBeenCalled();
        expect(warnSpy).toHaveBeenCalled();
    });

    it('não reaplica um evento cujo `newValue` já é o design corrente (anti-loop / própria escrita)', () => {
        const setDesign = vi.fn();
        const design = { mode: 'dark', primaryColor: '#00f2ff' } as SarakDesignState;

        renderHook(() => useDesignStorageSync(true, STORAGE_KEY, true, design, setDesign));

        // Simula o eco de uma escrita já refletida no estado local (o mesmo valor
        // serializado que o próprio Provider já tem) — não deve reaplicar.
        dispatchStorage(STORAGE_KEY, JSON.stringify(design));

        expect(setDesign).not.toHaveBeenCalled();
    });

    it('não escuta `storage` quando `enabled=false` (opt-out via `options.persistence.crossTabSync`)', () => {
        const setDesign = vi.fn();
        const design = { mode: 'dark' } as SarakDesignState;

        renderHook(() => useDesignStorageSync(true, STORAGE_KEY, false, design, setDesign));

        dispatchStorage(STORAGE_KEY, JSON.stringify({ mode: 'light' }));

        expect(setDesign).not.toHaveBeenCalled();
    });

    it('não escuta `storage` antes de hidratar', () => {
        const setDesign = vi.fn();
        const design = { mode: 'dark' } as SarakDesignState;

        renderHook(() => useDesignStorageSync(false, STORAGE_KEY, true, design, setDesign));

        dispatchStorage(STORAGE_KEY, JSON.stringify({ mode: 'light' }));

        expect(setDesign).not.toHaveBeenCalled();
    });

    it('remove o listener no cleanup (unmount não vaza handler)', () => {
        const setDesign = vi.fn();
        const design = { mode: 'dark' } as SarakDesignState;
        const removeSpy = vi.spyOn(window, 'removeEventListener');

        const { unmount } = renderHook(() => useDesignStorageSync(true, STORAGE_KEY, true, design, setDesign));
        unmount();

        expect(removeSpy).toHaveBeenCalledWith('storage', expect.any(Function));
        removeSpy.mockRestore();
    });
});
