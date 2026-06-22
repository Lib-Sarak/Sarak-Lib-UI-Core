import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { usePersistedSlice } from '../usePersistedSlice';
import { namespacedKey } from '../safeStorage';
import { createSarakDataStore } from '../../DataStore/SarakDataStore';
import type { SarakDataStore } from '../../DataStore/SarakDataStore';
import type { StateRecord } from '../../DataStore/resolvePath';

// Harness mínimo: monta o hook ligando uma fatia ao storage.
const Harness: React.FC<{
    store: SarakDataStore<StateRecord>;
    path?: string;
    storageKey?: string;
    sensitive?: boolean;
}> = ({ store, path = 'ui.tab', storageKey = 'ui.tab', sensitive }) => {
    usePersistedSlice(store, path, storageKey, sensitive);
    return null;
};

describe('Spec 28 — usePersistedSlice', () => {
    beforeEach(() => window.localStorage.clear());

    it('hidrata o estado a partir do storage no mount', async () => {
        window.localStorage.setItem(namespacedKey('ui.tab'), JSON.stringify('settings'));
        const store = createSarakDataStore<StateRecord>({ ui: { tab: 'home' } });

        render(<Harness store={store} />);

        await waitFor(() => expect(store.get('ui.tab')).toBe('settings'));
    });

    it('grava no storage quando a fatia muda', async () => {
        const store = createSarakDataStore<StateRecord>({ ui: { tab: 'home' } });
        render(<Harness store={store} />);

        act(() => store.set('ui.tab', 'profile'));

        await waitFor(() =>
            expect(window.localStorage.getItem(namespacedKey('ui.tab'))).toBe(
                JSON.stringify('profile'),
            ),
        );
    });

    it('sincroniza mudança externa do storage de volta ao estado (cross-tab)', async () => {
        const store = createSarakDataStore<StateRecord>({ ui: { tab: 'home' } });
        render(<Harness store={store} />);

        window.localStorage.setItem(namespacedKey('ui.tab'), JSON.stringify('externo'));
        act(() => {
            window.dispatchEvent(new StorageEvent('storage', { key: namespacedKey('ui.tab') }));
        });

        await waitFor(() => expect(store.get('ui.tab')).toBe('externo'));
    });

    it('sem store/key: no-op silencioso (não quebra)', () => {
        expect(() => render(<Harness store={undefined as unknown as SarakDataStore<StateRecord>} />)).not.toThrow();
    });
});
