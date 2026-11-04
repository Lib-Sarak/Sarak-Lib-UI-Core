import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SarakSection } from '../SarakSection';

describe('SarakSection', () => {
    it('uses the requested heading level and card variant', () => {
        render(
            <SarakSection title="Profile" headingLevel={3} variant="card">
                <p>Profile details</p>
            </SarakSection>,
        );

        expect(screen.getByRole('region', { name: 'Profile' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Profile', level: 3 })).toBeInTheDocument();
    });

    it('renders the library empty state', () => {
        render(
            <SarakSection
                title="Records"
                emptyState={{ title: 'No records', description: 'Try another filter' }}
            />,
        );

        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(screen.getByText('No records')).toBeInTheDocument();
    });

    it('renders the section loading state', () => {
        render(<SarakSection title="Records" loading loadingLabel="Loading records"><p>Loaded records</p></SarakSection>);

        expect(screen.getByRole('status', { name: 'Loading records' })).toHaveAttribute('aria-busy', 'true');
        expect(screen.queryByText('Loaded records')).not.toBeInTheDocument();
    });

    it('renders the section error state and retries on request', () => {
        const onRetry = vi.fn();
        render(
            <SarakSection
                title="Records"
                error={{ title: 'Could not load records', message: 'Try again later', retryLabel: 'Retry', onRetry }}
            />,
        );

        expect(screen.getByRole('alert')).toHaveTextContent('Could not load records');
        expect(screen.getByRole('alert')).toHaveTextContent('Try again later');
        fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
        expect(onRetry).toHaveBeenCalledOnce();
    });

    describe('erro de render do conteúdo', () => {
        const Failing = ({ shouldFail }: { shouldFail: boolean }): React.ReactElement => {
            if (shouldFail) throw new Error('falha interna');
            return <p>Records</p>;
        };

        beforeEach(() => {
            vi.spyOn(console, 'error').mockImplementation(() => undefined);
        });

        afterEach(() => {
            vi.restoreAllMocks();
        });

        it('fica no bloco: título, ações e a seção vizinha continuam', () => {
            render(
                <>
                    <SarakSection title="Broken" actions={<button>Export</button>}><Failing shouldFail /></SarakSection>
                    <SarakSection title="Healthy"><p>Still here</p></SarakSection>
                </>,
            );

            expect(screen.getByRole('alert')).toHaveTextContent('Este bloco não pôde ser exibido');
            expect(screen.getByRole('heading', { name: 'Broken' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
            expect(screen.getByText('Still here')).toBeInTheDocument();
        });

        it('recarregar os dados (loading) tenta de novo', () => {
            const { rerender } = render(<SarakSection title="Data"><Failing shouldFail /></SarakSection>);

            rerender(<SarakSection title="Data" loading loadingLabel="Loading"><Failing shouldFail={false} /></SarakSection>);
            rerender(<SarakSection title="Data"><Failing shouldFail={false} /></SarakSection>);

            expect(screen.getByText('Records')).toBeInTheDocument();
        });
    });
});
