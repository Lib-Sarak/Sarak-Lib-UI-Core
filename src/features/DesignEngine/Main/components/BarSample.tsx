import React, { useMemo } from 'react';
import { SarakAppChrome, type SarakNavItem } from '../../../../components/Layout/SarakAppChrome';
import { SampleScope } from '../../Canvas/components/SampleScope';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import type { SarakDesignState } from '../../../../core/Provider/types';

interface BarSampleProps {
    /** O rascunho aberto no painel: a amostra é o cromo REAL desenhado por ele. */
    draft: SarakDesignState;
    mode: 'light' | 'dark';
}

/** Marca de amostra neutra: um monograma em SVG, sem nome nem cor de nenhuma marca real. */
const SAMPLE_LOGO = 'data:image/svg+xml;utf8,'
    + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="currentColor"/></svg>');

const noop = (): void => undefined;

/**
 * A amostra de um grupo de ajustes da barra: o próprio `SarakAppChrome`, no rascunho, num quadro pequeno. Troque o
 * papel de cor, a posição da marca ou o item ativo e a amostra muda na hora, porque não é um desenho — é o componente.
 */
export const BarSample: React.FC<BarSampleProps> = ({ draft, mode }) => {
    const text = useLibraryText();
    const navItems = useMemo<SarakNavItem[]>(() => [
        { id: 'home', label: text('barSampleHome'), href: '#home', icon: 'Home' },
        { id: 'sales', label: text('barSampleSales'), href: '#sales', icon: 'Briefcase' },
        { id: 'orders', label: text('barSampleOrders'), href: '#orders', icon: 'FileText', active: true },
    ], [text]);

    return (
        <div data-testid="bar-sample" className="overflow-hidden rounded-[var(--sarak-card-radius,10px)] border border-[var(--theme-border)]">
            <SampleScope draft={draft} tokens={{}} mode={mode} slotClassName="h-56" transparent>
                <div className="h-56 w-full" style={{ transform: 'translateZ(0)' }}>
                    <SarakAppChrome
                        brand={{ name: text('barSampleBrand'), logoUrl: SAMPLE_LOGO }}
                        navItems={navItems}
                        user={{ name: text('barSampleUser') }}
                        logout={noop}
                        onNavigate={noop}
                        style={{ height: '100%' }}
                    >
                        <div aria-hidden="true" className="h-full w-full" />
                    </SarakAppChrome>
                </div>
            </SampleScope>
        </div>
    );
};

export default BarSample;
