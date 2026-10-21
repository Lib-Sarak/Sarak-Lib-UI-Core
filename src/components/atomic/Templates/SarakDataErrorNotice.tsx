import type { ReactElement } from 'react';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { SarakAlert } from '../Feedback/SarakAlert';

interface SarakDataErrorNoticeProps {
    error: string;
    onRetry?: () => void;
}

export const SarakDataErrorNotice = ({ error, onRetry }: SarakDataErrorNoticeProps): ReactElement => {
    const text = useLibraryText();
    return (
        <SarakAlert
            variant="error"
            title={text('dataLoadErrorTitle')}
            message={error}
            action={onRetry ? { label: text('retry'), onClick: onRetry } : undefined}
        />
    );
};
