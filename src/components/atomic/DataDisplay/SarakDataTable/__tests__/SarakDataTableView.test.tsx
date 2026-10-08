import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SarakUIProvider } from '../../../../../core/Provider/SarakUIProvider';
import { SarakDataTableView } from '../SarakDataTableView';
import type { SarakDataTableViewModel } from '../useSarakDataTableViewModel';

describe('SarakDataTableView', () => {
    it('apresenta o estado de carregamento para o consumidor', () => {
        const model = {
            props: { loading: true },
            interactions: { entries: [] },
        } as unknown as SarakDataTableViewModel<Record<string, unknown>>;

        render(<SarakUIProvider><SarakDataTableView model={model} /></SarakUIProvider>);

        expect(screen.getByRole('status')).toHaveTextContent('Carregando');
    });
});
