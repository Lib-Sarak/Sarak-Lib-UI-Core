/**
 * Critério de aceite (Spec 19): `createSarakUIExpressMiddleware({ storage })` funciona
 * SEM nenhuma `connectionString` — a lib nunca deveria exigir infra específica quando
 * o consumidor já traz seu próprio adapter (caso real: acesso via API/Supabase).
 */
import { describe, it, expect, vi } from 'vitest';
import { randomUUID } from 'node:crypto';
import { createSarakUIExpressMiddleware } from '../expressAdapter';
import type { UIBranding, UIStorageAdapter, UIStorageScope, UITheme, UIThemeCreateInput, UIThemeUpdateInput } from '../storageAdapter';

/** Adapter 100% em memória — prova que a porta não exige SQL/driver nenhum. */
function createFakeStorageAdapter(): UIStorageAdapter {
    const themes = new Map<string, UITheme>();
    const brandings = new Map<string, UIBranding>();
    const scopeKey = (scope: UIStorageScope): string => `${scope.system}|${scope.userId ?? ''}`;

    return {
        async getActiveTheme(scope) {
            for (const theme of themes.values()) {
                if (theme.system === scope.system && theme.ownerId === scope.userId && theme.isActive) return theme;
            }
            return null;
        },
        async saveActiveDesign(scope, design) {
            const active = await this.getActiveTheme(scope);
            if (active) {
                active.design = { ...active.design, ...design };
                return active;
            }
            const created: UITheme = {
                id: randomUUID(),
                name: 'Personalizado',
                description: null,
                system: scope.system,
                ownerId: scope.userId,
                isPublic: false,
                isActive: true,
                design,
            };
            themes.set(created.id, created);
            return created;
        },
        async createTheme(scope, input: UIThemeCreateInput) {
            if (input.isActive) {
                for (const theme of themes.values()) {
                    if (theme.system === scope.system && theme.ownerId === scope.userId) theme.isActive = false;
                }
            }
            const created: UITheme = {
                id: randomUUID(),
                name: input.name,
                description: null,
                system: scope.system,
                ownerId: scope.userId,
                isPublic: false,
                isActive: input.isActive,
                design: input.design,
            };
            themes.set(created.id, created);
            return created;
        },
        async updateTheme(scope, themeId, input: UIThemeUpdateInput) {
            const theme = themes.get(themeId);
            if (!theme) return null;
            if (input.name !== undefined) theme.name = input.name;
            if (input.design !== undefined) theme.design = { ...theme.design, ...input.design };
            if (input.isActive) {
                for (const t of themes.values()) {
                    if (t.system === scope.system && t.ownerId === scope.userId) t.isActive = false;
                }
                theme.isActive = true;
            }
            return theme;
        },
        async activateTheme(scope, themeId) {
            const theme = themes.get(themeId);
            if (!theme) return null;
            for (const t of themes.values()) {
                if (t.system === scope.system && t.ownerId === scope.userId) t.isActive = false;
            }
            theme.isActive = true;
            return theme;
        },
        async getBranding(scope) {
            return brandings.get(scopeKey(scope)) ?? null;
        },
        async saveBranding(scope, branding) {
            const current = brandings.get(scopeKey(scope)) ?? {
                companyName: 'Sarak OS',
                loginName: 'Acesso ao Sistema',
                tabName: 'Sarak OS',
                logoBase64: null,
            };
            const updated: UIBranding = { ...current, ...(branding as Partial<UIBranding>) };
            brandings.set(scopeKey(scope), updated);
            return updated;
        },
    };
}

const makeRes = () => {
    let body = '';
    return {
        statusCode: 200,
        setHeader: (): void => undefined,
        end: (chunk?: string): void => {
            body = chunk ?? '';
        },
        get body() {
            return body;
        },
    };
};

describe('createSarakUIExpressMiddleware({ storage }) — sem connectionString', () => {
    it('atende os 5 endpoints inteiramente sobre um adapter fake em memória', async () => {
        const middleware = createSarakUIExpressMiddleware({ storage: createFakeStorageAdapter() });

        const getEmpty = makeRes();
        await middleware({ method: 'GET', url: '/api/ui/design', headers: {} }, getEmpty, vi.fn());
        expect(JSON.parse(getEmpty.body)).toEqual({ design: {} });

        const postDesign = makeRes();
        await middleware(
            { method: 'POST', url: '/api/ui/design', headers: {}, body: { design: { mode: 'dark' } } },
            postDesign,
            vi.fn(),
        );
        expect(JSON.parse(postDesign.body).design.mode).toBe('dark');

        const postBranding = makeRes();
        await middleware(
            { method: 'POST', url: '/api/ui/branding', headers: {}, body: { branding: { companyName: 'Fake Ltda' } } },
            postBranding,
            vi.fn(),
        );
        expect(JSON.parse(postBranding.body).success).toBe(true);

        const getBranding = makeRes();
        await middleware({ method: 'GET', url: '/api/ui/branding', headers: {} }, getBranding, vi.fn());
        expect(JSON.parse(getBranding.body).branding.companyName).toBe('Fake Ltda');

        const createTheme = makeRes();
        await middleware(
            { method: 'POST', url: '/api/ui/themes', headers: {}, body: { name: 'Tema Fake', design: { mode: 'light' }, is_active: true } },
            createTheme,
            vi.fn(),
        );
        const created = JSON.parse(createTheme.body);
        expect(created.name).toBe('Tema Fake');
        expect(created.is_active).toBe(true);

        const activate = makeRes();
        await middleware({ method: 'PUT', url: `/api/ui/themes/${created.id}/activate`, headers: {} }, activate, vi.fn());
        expect(JSON.parse(activate.body).is_active).toBe(true);
    });
});
