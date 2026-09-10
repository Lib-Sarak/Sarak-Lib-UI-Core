/**
 * Reprodução do sintoma real: boot do Provider SEM nenhuma mídia configurada
 * (a configuração default de todo consumidor) não pode emitir nenhum aviso
 * "Valor inseguro" para `globalBackgroundImageUrl`. `isSafeMediaString('')`
 * recusava a string vazia — o `defaultValue` e o `legacyValue` do próprio
 * token — e cada render do Provider emitia o aviso. Verificado montando o
 * Provider de verdade, não só chamando a função.
 */
import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SarakUIProvider from '../SarakUIProvider';

describe('Boot do Provider sem mídia — console limpo', () => {
    it('nenhum aviso "Valor inseguro" ao montar sem `config`', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        render(
            <SarakUIProvider>
                <div>app</div>
            </SarakUIProvider>,
        );

        const insecureMediaWarnings = warnSpy.mock.calls.filter((call) =>
            String(call[0]).includes('Valor inseguro')
        );
        expect(insecureMediaWarnings).toEqual([]);

        warnSpy.mockRestore();
    });

    it('nenhum aviso "Valor inseguro" ao montar com `config={{ globalBackgroundImageUrl: "" }}` explícito', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        render(
            <SarakUIProvider config={{ globalBackgroundImageUrl: '' }}>
                <div>app</div>
            </SarakUIProvider>,
        );

        const insecureMediaWarnings = warnSpy.mock.calls.filter((call) =>
            String(call[0]).includes('Valor inseguro')
        );
        expect(insecureMediaWarnings).toEqual([]);

        warnSpy.mockRestore();
    });
});
