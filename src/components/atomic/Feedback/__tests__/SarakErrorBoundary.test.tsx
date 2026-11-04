import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SarakErrorBoundary } from '../SarakErrorBoundary';

const Failing = ({ shouldFail, thrown = new Error('falha interna') }: { shouldFail: boolean; thrown?: unknown }): React.ReactElement => {
    if (shouldFail) throw thrown;
    return <p>conteúdo</p>;
};

describe('SarakErrorBoundary', () => {
    beforeEach(() => {
        // O React registra todo erro capturado no console; aqui ele é o caso esperado.
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('sem erro, entrega o conteúdo e não acrescenta nó ao DOM', () => {
        const { container } = render(<SarakErrorBoundary><Failing shouldFail={false} /></SarakErrorBoundary>);

        expect(container.innerHTML).toBe('<p>conteúdo</p>');
    });

    it('o erro fica no bloco: o vizinho segue na tela e o texto interno do erro não aparece', () => {
        render(
            <div>
                <p>vizinho</p>
                <SarakErrorBoundary><Failing shouldFail /></SarakErrorBoundary>
            </div>,
        );

        expect(screen.getByText('vizinho')).toBeInTheDocument();
        expect(screen.getByRole('alert')).toHaveTextContent('Este bloco não pôde ser exibido');
        expect(screen.queryByText(/falha interna/)).not.toBeInTheDocument();
    });

    it('"Tentar de novo" remonta o conteúdo', () => {
        const mounted = vi.fn();
        let shouldFail = true;
        const Recovering = (): React.ReactElement => {
            React.useEffect(mounted, []);
            return <Failing shouldFail={shouldFail} />;
        };
        render(<SarakErrorBoundary><Recovering /></SarakErrorBoundary>);
        expect(mounted).not.toHaveBeenCalled();

        shouldFail = false;
        fireEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));

        expect(screen.getByText('conteúdo')).toBeInTheDocument();
        expect(mounted).toHaveBeenCalledTimes(1);
    });

    it('nova tentativa que falha de novo volta ao aviso', () => {
        render(<SarakErrorBoundary><Failing shouldFail /></SarakErrorBoundary>);

        fireEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));

        expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('onError recebe o erro e a pilha de componentes', () => {
        const onError = vi.fn();
        const thrown = new Error('x');
        render(<SarakErrorBoundary onError={onError}><Failing shouldFail thrown={thrown} /></SarakErrorBoundary>);

        expect(onError).toHaveBeenCalledTimes(1);
        expect(onError.mock.calls[0][0]).toBe(thrown);
        expect(onError.mock.calls[0][1].componentStack).toContain('Failing');
    });

    it.each([['string', 'texto'], ['null', null], ['undefined', undefined]])('captura `throw` de %s', (_name, thrown) => {
        render(<SarakErrorBoundary><Failing shouldFail thrown={thrown} /></SarakErrorBoundary>);

        expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('fallback em nó substitui o aviso', () => {
        render(<SarakErrorBoundary fallback={<p>meu aviso</p>}><Failing shouldFail /></SarakErrorBoundary>);

        expect(screen.getByText('meu aviso')).toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('fallback null é uma escolha: não desenha nada', () => {
        const { container } = render(<SarakErrorBoundary fallback={null}><Failing shouldFail /></SarakErrorBoundary>);

        expect(container).toBeEmptyDOMElement();
    });

    it('fallback em função recebe o erro e reset', () => {
        let shouldFail = true;
        const Recovering = (): React.ReactElement => <Failing shouldFail={shouldFail} thrown={new Error('motivo')} />;
        render(
            <SarakErrorBoundary fallback={({ error, reset }) => <button onClick={reset}>{(error as Error).message}</button>}>
                <Recovering />
            </SarakErrorBoundary>,
        );

        shouldFail = false;
        fireEvent.click(screen.getByRole('button', { name: 'motivo' }));

        expect(screen.getByText('conteúdo')).toBeInTheDocument();
    });

    it('trocar resetKeys limpa o erro; a mesma chave não', () => {
        const tree = (route: string, shouldFail: boolean): React.ReactElement => (
            <SarakErrorBoundary resetKeys={[route]}><Failing shouldFail={shouldFail} /></SarakErrorBoundary>
        );
        const { rerender } = render(tree('/a', true));

        rerender(tree('/a', false));
        expect(screen.getByRole('alert')).toBeInTheDocument();

        rerender(tree('/b', false));
        expect(screen.getByText('conteúdo')).toBeInTheDocument();
    });

    it('a troca de chave que causa o erro não apaga o aviso no mesmo ciclo', () => {
        const tree = (route: string, shouldFail: boolean): React.ReactElement => (
            <SarakErrorBoundary resetKeys={[route]}><Failing shouldFail={shouldFail} /></SarakErrorBoundary>
        );
        const { rerender } = render(tree('/a', false));

        rerender(tree('/b', true));

        expect(screen.getByRole('alert')).toBeInTheDocument();
    });
});
