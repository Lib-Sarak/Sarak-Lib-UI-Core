import React from 'react';
import { Monitor, Smartphone, Tablet } from 'lucide-react';
import { SarakButton } from '../../../../components/atomic/Buttons/SarakButton';

const DEVICE_OPTIONS = [
    { value: 'desktop', label: 'Desktop', icon: Monitor },
    { value: 'tablet', label: 'Tablet', icon: Tablet },
    { value: 'smartphone', label: 'Mobile', icon: Smartphone }
] as const;

const PREVIEW_TOOLBAR_LABELS = {
    deviceGroup: 'Dispositivo do preview',
    stack: 'Empilhar previews',
    stackDisabledTitle: 'Abra a galeria de estilos para empilhar os previews.',
} as const;

type PreviewDevice = 'desktop' | 'tablet' | 'smartphone';

interface PreviewToolbarProps {
    previewDevice: PreviewDevice;
    setPreviewDevice: (device: PreviewDevice) => void;
    isPreviewStacked: boolean;
    setIsPreviewStacked: (stacked: boolean) => void;
    isGalleryOpen: boolean;
}

export const PreviewToolbar: React.FC<PreviewToolbarProps> = ({
    previewDevice,
    setPreviewDevice,
    isPreviewStacked,
    setIsPreviewStacked,
    isGalleryOpen,
}) => (
    <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
        <div role="group" aria-label={PREVIEW_TOOLBAR_LABELS.deviceGroup} className="flex min-w-0 flex-1 gap-1">
            {DEVICE_OPTIONS.map(({ value, label, icon: Icon }) => (
                <SarakButton
                    key={value}
                    onClick={() => setPreviewDevice(value)}
                    aria-pressed={previewDevice === value}
                    variant={previewDevice === value ? 'primary' : 'ghost'}
                    size="xs"
                    leftIcon={<Icon size={14} />}
                    className="flex-1"
                >
                    {label}
                </SarakButton>
            ))}
        </div>
        <label className={'flex shrink-0 items-center gap-2 ' + (isGalleryOpen ? 'cursor-pointer' : 'cursor-not-allowed')}>
            <input
                type="checkbox"
                role="switch"
                checked={isGalleryOpen && isPreviewStacked}
                onChange={() => setIsPreviewStacked(!isPreviewStacked)}
                aria-checked={isGalleryOpen && isPreviewStacked}
                aria-disabled={!isGalleryOpen}
                disabled={!isGalleryOpen}
                aria-label={PREVIEW_TOOLBAR_LABELS.stack}
                title={isGalleryOpen ? undefined : PREVIEW_TOOLBAR_LABELS.stackDisabledTitle}
                className="sr-only"
            />
            <span aria-hidden="true" title={isGalleryOpen ? undefined : PREVIEW_TOOLBAR_LABELS.stackDisabledTitle} className={'relative h-3 w-6 rounded-full transition-colors ' + (isGalleryOpen && isPreviewStacked ? 'bg-[var(--theme-primary)]' : 'bg-[var(--theme-border)]')}>
                <span className={'absolute top-0.5 h-2 w-2 rounded-full bg-[var(--color-theme-title,#ffffff)] transition-all ' + (isGalleryOpen && isPreviewStacked ? 'left-3.5' : 'left-0.5')} />
            </span>
            <span title={isGalleryOpen ? undefined : PREVIEW_TOOLBAR_LABELS.stackDisabledTitle}>{PREVIEW_TOOLBAR_LABELS.stack}</span>
        </label>
    </div>
);
