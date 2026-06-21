import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SarakFallback } from '../Fallback';
import { SarakUIProvider } from '../../../Provider/SarakUIProvider';

describe('Spec 22 — SarakFallback', () => {
    it('deve renderizar o type desconhecido como alerta sem derrubar a árvore', () => {
        render(
            <SarakUIProvider>
                <SarakFallback type="Inexistente" />
            </SarakUIProvider>,
        );
        const alert = screen.getByRole('alert');
        expect(alert).toBeInTheDocument();
        expect(alert).toHaveTextContent('Inexistente');
        expect(alert.getAttribute('data-sarak-fallback')).toBe('true');
    });

    it('deve exibir o id do nó culpado quando fornecido', () => {
        render(
            <SarakUIProvider>
                <SarakFallback type="Fantasma" nodeId="no-7" />
            </SarakUIProvider>,
        );
        expect(screen.getByRole('alert')).toHaveTextContent('no-7');
    });

    it('deve omitir o trecho de id quando nodeId não é informado', () => {
        render(
            <SarakUIProvider>
                <SarakFallback type="Solto" />
            </SarakUIProvider>,
        );
        expect(screen.getByRole('alert').textContent).not.toContain('id:');
    });
});
