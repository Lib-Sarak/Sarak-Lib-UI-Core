import React from 'react';
import { format } from 'date-fns';
import type { SarakDateLocale } from './CalendarPanel';
import { SarakIconButton } from '../../Buttons/SarakIconButton';

interface CalendarPanelMonthNavigationProps {
    locale?: SarakDateLocale;
    viewMonth: Date;
    onChangeMonth: (offset: number) => void;
}

export const CalendarPanelMonthNavigation = ({
    locale,
    viewMonth,
    onChangeMonth,
}: CalendarPanelMonthNavigationProps): React.ReactElement => (
    <div className="flex items-center justify-between" style={{ marginBottom: 'var(--sarak-layout-gap-sm, 8px)' }}>
        <NavButton label="Mês anterior" onClick={() => onChangeMonth(-1)} dir="prev" />
        <span className="text-sm font-bold capitalize text-[var(--text-muted,rgba(242,246,251,0.55))]">
            {format(viewMonth, 'MMMM yyyy', { locale })}
        </span>
        <NavButton label="Próximo mês" onClick={() => onChangeMonth(1)} dir="next" />
    </div>
);

const NavButton = ({ label, dir, onClick }: { label: string; dir: 'prev' | 'next'; onClick: () => void }): React.ReactElement => (
    <SarakIconButton
        variant="ghost"
        size="sm"
        aria-label={label}
        onClick={onClick}
        icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={dir === 'prev' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
            </svg>
        }
    />
);
