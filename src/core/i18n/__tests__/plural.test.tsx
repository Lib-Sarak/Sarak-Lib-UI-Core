import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { SarakUIProvider } from '../../Provider/SarakUIProvider';
import { useLibraryText } from '../useLibraryText';

const textIn = (language: string) => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SarakUIProvider options={{ fonts: 'none', i18n: { languages: [language], language } }}>{children}</SarakUIProvider>
    );
    return renderHook(() => useLibraryText(), { wrapper }).result.current;
};

describe('useLibraryText — singular e plural escolhidos por `count`', () => {
    it.each([
        ['pt', 'approvalApproveSelected', 1, 'Aprovar 1 selecionado'],
        ['pt', 'approvalApproveSelected', 2, 'Aprovar 2 selecionados'],
        ['pt', 'approvalRejectSelected', 1, 'Rejeitar 1 selecionado'],
        ['pt', 'approvalRejectSelected', 2, 'Rejeitar 2 selecionados'],
        ['en', 'approvalApproveSelected', 1, 'Approve 1 selected'],
        ['en', 'approvalApproveSelected', 2, 'Approve 2 selected'],
        ['en', 'approvalRejectSelected', 1, 'Reject 1 selected'],
        ['en', 'approvalRejectSelected', 2, 'Reject 2 selected'],
        ['pt', 'tableRowsFound', 1, '1 registro encontrado'],
        ['pt', 'tableRowsFound', 5, '5 registros encontrados'],
        ['pt', 'fineTuningCount', 1, '1 ajuste'],
        ['pt', 'fineTuningCount', 3, '3 ajustes'],
        ['en', 'fineTuningCount', 1, '1 setting'],
        ['en', 'fineTuningCount', 0, '0 settings'],
    ] as const)('%s · %s com count %s → "%s"', (language, key, count, expected) => {
        expect(textIn(language)(key, { count })).toBe(expected);
    });

    it('chave sem forma singular continua valendo para qualquer count', () => {
        expect(textIn('pt')('searchResultsTitle', { count: 1 })).toBe('Resultados da busca (1)');
    });
});
