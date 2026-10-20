import { afterEach, describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import * as ComponentModule from '../SarakStats';
import { SarakStats } from '../SarakStats';
import * as statsData from '../hooks/useSarakStatsData';

const SAMPLE_TOTAL = 3;
const SAMPLE_VOLUME = 1500;
const CONFIGURED_REVENUE = 1250;
const CACHED_METRIC_TOTAL = 5;

afterEach(() => vi.restoreAllMocks());

describe('SarakStats — superfície', () => {
    it('should be defined and export its contents without crashing', () => {
        expect(ComponentModule).toBeDefined();
    });

    // plan-41: `statsGrid.className` traz `@min-[1024px]:grid-cols-4` (container query),
    // que só ativa com um ancestral `container-type`. jsdom não avalia container query —
    // este teste prova só que o wrapper `@container` foi PLANTADO como ancestral do
    // grid, não que a query casou (prova real só em browser, plan-40).
    it('planta um wrapper @container como ancestral do grid (não prova que a query casa — jsdom não avalia container query)', () => {
        const { container } = render(<SarakStats data={{ total: SAMPLE_TOTAL }} />);

        const wrapper = container.firstElementChild as HTMLElement;
        expect(wrapper.className).toContain('@container');

        const grid = wrapper.firstElementChild as HTMLElement;
        expect(grid.className).toContain('grid');
        expect(grid.className).not.toContain('@container');
    });
});

describe('SarakStats — valores legados', () => {
    it('preserves zero and large values without formatting them as product metrics', () => {
        render(<SarakStats data={{ total: 0, volume: SAMPLE_VOLUME }} />);

        expect(screen.getByText('0')).toBeInTheDocument();
        expect(screen.getByText(String(SAMPLE_VOLUME))).toBeInTheDocument();
        expect(screen.getByText('0')).toHaveClass('tabular-nums');
    });
});

describe('SarakStats — configuração por métrica', () => {
    it('renders each metric label, icon, signed delta, hint and configured format', () => {
        render(
            <SarakStats
                data={{ revenue: CONFIGURED_REVENUE }}
                metrics={{
                    revenue: {
                        label: 'Receita',
                        icon: <span>↑</span>,
                        delta: 1,
                        format: { type: 'number', options: { useGrouping: false } },
                        hint: 'vs. mês anterior',
                    },
                }}
            />,
        );

        expect(screen.getByText('Receita')).toBeInTheDocument();
        expect(screen.getByText('↑')).toBeInTheDocument();
        expect(screen.getByText(String(CONFIGURED_REVENUE))).toBeInTheDocument();
        expect(screen.getByText('1').parentElement).toHaveTextContent('+1');
        expect(screen.getByText('vs. mês anterior')).toBeInTheDocument();
    });

    it('keeps previously loaded metrics visible with a stale notice and retry action', () => {
        const loadData = vi.fn();
        vi.spyOn(statsData, 'useSarakStatsData').mockReturnValue({
            stats: { total: CACHED_METRIC_TOTAL }, loading: false, error: 'Unavailable',
            updatedAt: new Date('2026-10-10T22:12:00.000Z'), loadData,
        } as ReturnType<typeof statsData.useSarakStatsData>);
        render(<SarakStats />);

        expect(screen.getByText(String(CACHED_METRIC_TOTAL))).toBeInTheDocument();
        expect(screen.getByText('Unavailable')).toBeInTheDocument();
        expect(screen.getByText('Desatualizado')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
        expect(loadData).toHaveBeenCalledOnce();
    });
});

describe('SarakStats — props removidas', () => {
    it('não aceita props visuais que não tinham efeito', () => {
        // @ts-expect-error `role` não tinha leitor e saiu da assinatura pública.
        const roleProp = <SarakStats role="primary" />;
        // @ts-expect-error `density` não tinha leitor e saiu da assinatura pública.
        const densityProp = <SarakStats density="compact" />;
        // @ts-expect-error `importance` não tinha leitor e saiu da assinatura pública.
        const importanceProp = <SarakStats importance="hero" />;

        expect([roleProp, densityProp, importanceProp]).toHaveLength(3);
    });
});
