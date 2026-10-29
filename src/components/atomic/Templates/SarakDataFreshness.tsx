import type { ReactElement } from 'react';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { useSarakLanguage } from '../../../core/i18n/useSarakLanguage';
import { parseDataTimestamp } from './hooks/dataTimestamp';

interface SarakDataFreshnessProps {
    updatedAt?: Date | string | number | null;
    stale?: boolean;
}

export const SarakDataFreshness = ({ updatedAt, stale = false }: SarakDataFreshnessProps): ReactElement | null => {
    const text = useLibraryText();
    const { locale } = useSarakLanguage();
    const timestamp = parseDataTimestamp(updatedAt ?? undefined);
    if (!timestamp) return null;

    const time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(timestamp);
    return (
        <p className="text-xs text-theme-muted">
            <time dateTime={timestamp.toISOString()}>{text('dataReadAt', { time })}</time>
            {stale && <><span> </span><span role="status">{text('dataStale')}</span></>}
        </p>
    );
};
