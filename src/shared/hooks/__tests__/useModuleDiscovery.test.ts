import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

/**
 * Cobertura 1:1 de `useModuleDiscovery` (R8) — plan-07, item 7.
 *
 * `src/shared/` está FORA do escopo do `auditor_coverage` (`:52-54`) — vão nº 6 da
 * matriz ([[01-gates-e-baseline]] §9.2). Ampliar o escopo é da `plan-12`; o teste é daqui.
 *
 * As DUAS fronteiras são mockadas (o Provider e o registry global) porque o valor do
 * hook não está em ler nenhum dos dois: está em **filtrar, ordenar e preencher default**.
 */

const useSarakUI = vi.fn();
const getRegisteredModules = vi.fn();

vi.mock('../../../core/Provider/SarakUIProvider', () => ({ useSarakUI: () => useSarakUI() }));
vi.mock('../../../core/Discovery/registry', () => ({ getRegisteredModules: () => getRegisteredModules() }));

const { useModuleDiscovery } = await import('../useModuleDiscovery');

type Estado = { registeredModules?: unknown[]; isHydrated?: boolean; design?: Record<string, unknown> };

const montar = (estado: Estado, doRegistry: unknown[] = []) => {
    useSarakUI.mockReturnValue({ registeredModules: [], isHydrated: true, design: {}, ...estado });
    getRegisteredModules.mockReturnValue(doRegistry);
    return renderHook(() => useModuleDiscovery()).result;
};

beforeEach(() => {
    useSarakUI.mockReset();
    getRegisteredModules.mockReset();
});

describe('useModuleDiscovery', () => {
    it('antes da hidratação não devolve módulo e se declara carregando', () => {
        const r = montar({ isHydrated: false }, [{ id: 'a' }]);

        expect(r.current.modules).toEqual([]);
        expect(r.current.isLoading).toBe(true);
    });

    it('o registry global tem prioridade sobre o que veio do Provider', () => {
        const r = montar({ registeredModules: [{ id: 'do-provider' }] }, [{ id: 'do-registry' }]);

        expect(r.current.modules.map((m) => m.id)).toEqual(['do-registry']);
    });

    it('cai para o Provider quando o registry global está vazio', () => {
        const r = montar({ registeredModules: [{ id: 'do-provider' }] }, []);

        expect(r.current.modules.map((m) => m.id)).toEqual(['do-provider']);
    });

    it('ordena por prioridade DECRESCENTE', () => {
        const r = montar({}, [{ id: 'baixa', priority: 10 }, { id: 'alta', priority: 900 }, { id: 'media', priority: 500 }]);

        expect(r.current.modules.map((m) => m.id)).toEqual(['alta', 'media', 'baixa']);
    });

    it('descarta entrada sem `id` — módulo sem identidade não vira item de menu', () => {
        const r = montar({}, [{ id: 'valido' }, { label: 'sem id' }]);

        expect(r.current.modules.map((m) => m.id)).toEqual(['valido']);
    });

    it('no modo padrão, filtra os módulos de demonstração', () => {
        const r = montar({}, [{ id: 'grid-system' }, { id: 'demo-ui' }, { id: 'debug-module' }, { id: 'blueprint-test' }, { id: 'real' }]);

        expect(r.current.modules.map((m) => m.id)).toEqual(['real']);
    });

    it("com moduleBlacklist='none', os de demonstração passam", () => {
        const r = montar({ design: { moduleBlacklist: 'none' } }, [{ id: 'demo-ui' }, { id: 'real' }]);

        expect(r.current.modules.map((m) => m.id).sort()).toEqual(['demo-ui', 'real']);
    });

    it('preenche os defaults de quem só declarou o id', () => {
        const [mod] = montar({}, [{ id: 'cru' }]).current.modules;

        expect(mod).toMatchObject({
            id: 'cru',
            label: 'cru',
            icon: 'Box',
            category: 'Sistema',
            version: '1.0.0-local',
            priority: 500,
            status: 'online',
            baseUrl: '',
        });
        expect(mod.visualContracts).toEqual([]);
    });

    it('deriva o baseUrl do endpoint removendo o sufixo /api', () => {
        const [mod] = montar({}, [{ id: 'x', endpoints: { base: 'https://erp.local/api' } }]).current.modules;

        expect(mod.baseUrl).toBe('https://erp.local');
    });

    it('um baseUrl explícito vence a derivação', () => {
        const [mod] = montar({}, [{ id: 'x', baseUrl: 'https://explicito', endpoints: { base: 'https://outro/api' } }]).current.modules;

        expect(mod.baseUrl).toBe('https://explicito');
    });

    it('expõe `refresh` — descoberta é passiva, mas o contrato mantém o método', () => {
        const r = montar({}, []);

        expect(typeof r.current.refresh).toBe('function');
        expect(() => r.current.refresh()).not.toThrow();
    });
});
