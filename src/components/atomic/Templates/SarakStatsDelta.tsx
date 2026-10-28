import { SarakIcon } from '../Icon/SarakIcon';
import { SarakValue } from '../Atoms/SarakValue';
import type { SarakValueFormat } from '../../../shared/format';
import type { ReactElement } from 'react';

export interface SarakStatsDeltaProps {
    delta: number;
    format?: SarakValueFormat;
    label?: string;
    /** Sentido bom da variação; `down` pinta a queda de verde e a alta de vermelho (despesa, atraso). */
    goodDirection?: 'up' | 'down';
}

type DeltaTone = 'success' | 'error' | 'neutral';

const TONE_COLORS: Readonly<Record<DeltaTone, string>> = {
    success: 'var(--sarak-status-success-color)',
    error: 'var(--sarak-status-error-color)',
    neutral: 'var(--sarak-text-muted)',
};

const toneOf = (delta: number, goodDirection: 'up' | 'down'): DeltaTone => {
    if (delta === 0) return 'neutral';
    return (delta > 0) === (goodDirection === 'up') ? 'success' : 'error';
};

/** Variação da métrica: a seta mostra o sentido real; só a cor segue `goodDirection`. */
export const SarakStatsDelta = ({ delta, format = { type: 'number' }, label, goodDirection = 'up' }: SarakStatsDeltaProps): ReactElement => {
    const tone = toneOf(delta, goodDirection);
    const direction = delta === 0 ? 'flat' : delta > 0 ? 'up' : 'down';

    return (
        <div
            className="text-sm font-semibold flex items-center"
            data-tone={tone}
            data-direction={direction}
            style={{ color: TONE_COLORS[tone], gap: 'calc(var(--sarak-layout-gap-md,16px) / 4)', marginTop: 'calc(var(--sarak-layout-gap-md,16px) / 6)' }}
        >
            {direction !== 'flat' && <span aria-hidden="true"><SarakIcon name={direction === 'up' ? 'ArrowUp' : 'ArrowDown'} size={14} /></span>}
            <span>
                {delta > 0 && '+'}
                <SarakValue value={delta} format={format} size="sm" signColor={false} />
            </span>
            {label && <span className="text-theme-muted font-normal">{label}</span>}
        </div>
    );
};
