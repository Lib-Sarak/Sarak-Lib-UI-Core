/**
 * Critério de aceite (Spec 19 §3): o exemplo Supabase documentado compila e cobre
 * as 7 operações da porta — validado por teste de TIPO (o import abaixo já falha
 * a compilação se `createSupabaseStorageAdapter` não satisfizer `UIStorageAdapter`)
 * e um smoke test funcional contra um client fake — SEM REDE nenhuma.
 */
import { describe, it, expect } from 'vitest';
import { createSupabaseStorageAdapter, type SupabaseLikeClient } from '../../../docs/examples/storage-supabase.example';
import type { UIStorageAdapter } from '../storageAdapter';

/** Client fake em memória com a mesma forma estrutural do `SupabaseClient` real. */
function createFakeSupabaseClient(): SupabaseLikeClient {
    const themes = new Map<string, Record<string, unknown>>();
    const brandings = new Map<string, Record<string, unknown>>();
    const matches = (row: Record<string, unknown>, query: Record<string, unknown>): boolean =>
        Object.entries(query).every(([key, value]) => row[key] === value);

    return {
        from(table: string) {
            const store = table === 'custom_themes' ? themes : brandings;
            return {
                select: () => ({
                    match: (query: Record<string, unknown>) => ({
                        maybeSingle: async () => ({ data: [...store.values()].find((r) => matches(r, query)) ?? null, error: null }),
                    }),
                }),
                insert: (row: Record<string, unknown>) => {
                    const id = `id-${store.size + 1}`;
                    const stored = { id, ...row };
                    store.set(id, stored);
                    return { select: () => ({ single: async () => ({ data: stored, error: null }) }) };
                },
                update: (patch: Record<string, unknown>) => ({
                    match: (query: Record<string, unknown>) => ({
                        select: () => ({
                            single: async () => {
                                const row = [...store.values()].find((r) => matches(r, query));
                                if (!row) return { data: null, error: null };
                                Object.assign(row, patch);
                                return { data: row, error: null };
                            },
                        }),
                    }),
                }),
            };
        },
    };
}

describe('docs/examples/storage-supabase.example.ts — validação de tipo + smoke test', () => {
    it('createSupabaseStorageAdapter satisfaz UIStorageAdapter estruturalmente', () => {
        const adapter: UIStorageAdapter = createSupabaseStorageAdapter(createFakeSupabaseClient());
        expect(typeof adapter.getActiveTheme).toBe('function');
        expect(typeof adapter.saveActiveDesign).toBe('function');
        expect(typeof adapter.createTheme).toBe('function');
        expect(typeof adapter.updateTheme).toBe('function');
        expect(typeof adapter.activateTheme).toBe('function');
        expect(typeof adapter.getBranding).toBe('function');
        expect(typeof adapter.saveBranding).toBe('function');
    });

    it('cobre as 7 operações contra o client fake (sem rede)', async () => {
        const adapter = createSupabaseStorageAdapter(createFakeSupabaseClient());
        const scope = { system: 'global', userId: null };

        expect(await adapter.getActiveTheme(scope)).toBeNull();

        const created = await adapter.createTheme(scope, { name: 'Tema', design: { mode: 'dark' }, isActive: true });
        expect(created.name).toBe('Tema');

        const updated = await adapter.updateTheme(scope, created.id, { name: 'Tema 2' });
        expect(updated?.name).toBe('Tema 2');

        const activated = await adapter.activateTheme(scope, created.id);
        expect(activated?.id).toBe(created.id);

        expect(await adapter.getBranding(scope)).toBeNull();
        const branding = await adapter.saveBranding(scope, { companyName: 'X' });
        expect(branding.companyName).toBe('X');
    });
});
