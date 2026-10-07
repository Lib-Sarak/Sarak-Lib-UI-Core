import { SarakAlert } from '../Feedback/SarakAlert';
import { useLibraryText } from '../../../core/i18n/useLibraryText';

interface SarakTableErrorStateProps {
    containerClassName?: string;
    error: string;
    onRetry?: () => void;
}

export const SarakTableErrorState = ({ containerClassName, error, onRetry }: SarakTableErrorStateProps) => {
    const text = useLibraryText();

    return (
        <div className={containerClassName} style={{ padding: 'var(--sarak-layout-gap-md,16px)' }}>
            <SarakAlert
                variant="error"
                title={text('dataLoadErrorTitle')}
                message={error}
                action={onRetry ? { label: text('retry'), onClick: onRetry } : undefined}
            />
        </div>
    );
};
