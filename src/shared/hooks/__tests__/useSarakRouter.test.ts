import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSarakRouter } from '../useSarakRouter';

/**
 * Cobertura 1:1 de `useSarakRouter` (R8) — plan-07, item 7.
 *
 * O hook vivia em `src/shared/`, que está FORA do escopo do `auditor_coverage`
 * (`:52-54` varre só `components`, `features` e `core`). Era violação de R8 na letra,
 * com o gate verde: o vão nº 6 da matriz ([[01-gates-e-baseline]] §9.2).
 *
 * Ampliar o escopo do auditor é da `plan-12`; aqui se escreve o teste que faltava.
 */

const irPara = (path: string) => window.history.replaceState(null, '', path);

describe('useSarakRouter', () => {
    beforeEach(() => irPara('/'));

    it('deriva os segmentos do path atual, ignorando as barras vazias', () => {
        irPara('/faturamento/notas/42');
        const { result } = renderHook(() => useSarakRouter());

        expect(result.current.currentPath).toBe('/faturamento/notas/42');
        expect(result.current.segments).toEqual(['faturamento', 'notas', '42']);
    });

    it('a raiz não produz segmento nenhum', () => {
        const { result } = renderHook(() => useSarakRouter());

        expect(result.current.currentPath).toBe('/');
        expect(result.current.segments).toEqual([]);
    });

    it('getParam devolve o segmento pelo índice, e `undefined` fora da faixa', () => {
        irPara('/modulos/clientes');
        const { result } = renderHook(() => useSarakRouter());

        expect(result.current.getParam(0)).toBe('modulos');
        expect(result.current.getParam(1)).toBe('clientes');
        expect(result.current.getParam(9)).toBeUndefined();
    });

    it('navigate empurra o path e o estado acompanha', () => {
        const { result } = renderHook(() => useSarakRouter());

        act(() => result.current.navigate('/relatorios'));

        expect(window.location.pathname).toBe('/relatorios');
        expect(result.current.currentPath).toBe('/relatorios');
        expect(result.current.segments).toEqual(['relatorios']);
    });

    it('navigate normaliza path sem barra inicial', () => {
        const { result } = renderHook(() => useSarakRouter());

        act(() => result.current.navigate('sem-barra'));

        expect(window.location.pathname).toBe('/sem-barra');
    });

    it('navigate com replace NÃO acrescenta entrada ao histórico', () => {
        const { result } = renderHook(() => useSarakRouter());
        const tamanhoAntes = window.history.length;

        act(() => result.current.navigate('/trocado', true));

        expect(window.location.pathname).toBe('/trocado');
        expect(window.history.length).toBe(tamanhoAntes);
    });

    it('com basePath, o prefixo é removido da leitura e recolocado na navegação', () => {
        irPara('/app/pedidos');
        const { result } = renderHook(() => useSarakRouter('/app'));

        expect(result.current.currentPath).toBe('/pedidos');
        expect(result.current.segments).toEqual(['pedidos']);

        act(() => result.current.navigate('/estoque'));

        expect(window.location.pathname).toBe('/app/estoque');
        expect(result.current.currentPath).toBe('/estoque');
    });

    it('com basePath, navegar para a raiz não deixa barra sobrando', () => {
        irPara('/app/qualquer');
        const { result } = renderHook(() => useSarakRouter('/app'));

        act(() => result.current.navigate('/'));

        expect(window.location.pathname).toBe('/app');
    });

    it('responde a popstate — o botão voltar do navegador', () => {
        irPara('/inicio');
        const { result } = renderHook(() => useSarakRouter());

        act(() => {
            window.history.replaceState(null, '', '/destino');
            window.dispatchEvent(new PopStateEvent('popstate'));
        });

        expect(result.current.currentPath).toBe('/destino');
    });
});
