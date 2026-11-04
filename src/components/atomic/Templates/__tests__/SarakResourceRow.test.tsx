import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SarakBadge } from '../../Feedback/SarakBadge';
import { SarakResourceRow } from '../SarakResourceRow';

describe('SarakResourceRow', () => {
    it('provides one row destination and separate keyboard-accessible actions', () => {
        const onAction = vi.fn();
        render(
            <SarakResourceRow
                title="Quarterly report"
                href="/reports/quarterly"
                badges={['Ready']}
                metadata={[{ label: 'Owner', value: 'Finance' }]}
                actions={[{ label: 'Open menu', onClick: onAction }]}
            />,
        );

        const destination = screen.getByRole('link', { name: 'Quarterly report' });
        expect(destination).toHaveAttribute('href', '/reports/quarterly');
        expect(destination.style.minHeight).toBe('var(--sarak-touch-target-min, 44px)');
        expect(screen.getByRole('article')).toBeInTheDocument();
        expect(screen.getByText('Ready')).toBeInTheDocument();
        const action = screen.getByRole('button', { name: 'Open menu' });
        expect(action.style.minHeight).toBe('var(--sarak-touch-target-min, 44px)');
        fireEvent.click(action);
        expect(onAction).toHaveBeenCalledOnce();
    });

    it('keeps a supplied badge as one badge inside the resource row', () => {
        render(
            <SarakResourceRow
                title="Quarterly report"
                badges={[<SarakBadge key="ready" variant="success">Ready</SarakBadge>]}
            />,
        );

        const resourceRow = screen.getByRole('article');
        const badgeLabel = within(resourceRow).getByText('Ready');
        const badge = badgeLabel.closest('span');

        expect(badge).not.toBeNull();
        expect(badge?.parentElement?.closest('span')).toBeNull();
    });
});

describe('SarakResourceRow layout e density', () => {
    it('sem as props novas mantém o desenho empilhado de hoje', () => {
        render(<SarakResourceRow title="Relatório" metadata={[{ label: 'Dono', value: 'Fin' }]} />);
        expect(screen.getByRole('article').querySelector('[class*="grid-cols-1"]')).toBeNull();
        expect(screen.getByRole('heading', { name: 'Relatório' }).style.textOverflow).toBe('');
    });

    it('inline corta o título com reticências e usa colunas por container query', () => {
        render(<SarakResourceRow layout="inline" title="Relatório trimestral" actions={[{ label: 'Abrir', onClick: vi.fn() }]} />);
        const heading = screen.getByRole('heading', { name: 'Relatório trimestral' });
        expect(heading.style.textOverflow).toBe('ellipsis');
        expect(heading.style.whiteSpace).toBe('nowrap');
        expect(screen.getByRole('article').querySelector('[class*="@min-[640px]:grid-cols"]')).not.toBeNull();
    });

    it('compact reduz o respiro da linha', () => {
        const { rerender } = render(<SarakResourceRow layout="inline" title="Linha" />);
        const grid = (): HTMLElement | null => screen.getByRole('article').querySelector<HTMLElement>('[class*="grid-cols-1"]');
        expect(grid()?.style.padding).toBe('var(--sarak-layout-gap-md, 16px)');
        rerender(<SarakResourceRow layout="inline" density="compact" title="Linha" />);
        expect(grid()?.style.padding).toBe('calc(var(--sarak-layout-gap-md, 16px) * 0.5)');
    });
});
