import React from 'react';
import { Monitor, Smartphone, Tablet } from 'lucide-react';
import { SarakButton } from '../../../../components/atomic/Buttons/SarakButton';
import { SarakSelect } from '../../../../components/atomic/Inputs/SarakSelect';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import { PREVIEW_TOOLBAR_HINT } from '../panelResponsive.presets';
import { ADDITIONAL_PREVIEW_SCREENS, MAIN_PREVIEW_SCREENS, MORE_PREVIEW_SCREEN_ID } from '../previewScreens';

const DEVICE_OPTIONS = [
    { value: 'desktop', label: 'Desktop', icon: Monitor },
    { value: 'tablet', label: 'Tablet', icon: Tablet },
    { value: 'smartphone', label: 'Mobile', icon: Smartphone }
] as const;

const PREVIEW_TOOLBAR_LABELS = {
    deviceGroup: 'Dispositivo do preview',
    moreScreens: 'Mais telas',
} as const;

const SCREEN_OPTIONS = [
    ...MAIN_PREVIEW_SCREENS,
    ...ADDITIONAL_PREVIEW_SCREENS,
    { id: MORE_PREVIEW_SCREEN_ID, label: PREVIEW_TOOLBAR_LABELS.moreScreens },
].map(({ id, label }) => ({ value: id, label }));

type PreviewDevice = 'desktop' | 'tablet' | 'smartphone';
type PreviewMode = 'light' | 'dark';

interface PreviewToolbarProps {
    previewDevice: PreviewDevice;
    setPreviewDevice: (device: PreviewDevice) => void;
    /** O modo de cor do rascunho: a barra o troca sem passar pelo cromo simulado. */
    mode: PreviewMode;
    onModeChange: (mode: PreviewMode) => void;
    activePreviewApp: string;
    selectPreviewApp: (appId: string) => void;
    /** Uma opção está sendo espiada: a prévia mostra o efeito sem gravar. */
    isPeeking?: boolean;
}

const ModeSwitch: React.FC<Pick<PreviewToolbarProps, 'mode' | 'onModeChange'>> = ({ mode, onModeChange }) => {
    const text = useLibraryText();
    const options = [
        { value: 'light', label: text('previewModeLight') },
        { value: 'dark', label: text('previewModeDark') },
    ] as const;
    return (
        <div role="group" aria-label={text('previewModeGroup')} className="flex shrink-0 gap-1">
            {options.map(({ value, label }) => (
                <SarakButton
                    key={value}
                    onClick={() => onModeChange(value)}
                    aria-pressed={mode === value}
                    variant={mode === value ? 'primary' : 'ghost'}
                    size="xs"
                >
                    {label}
                </SarakButton>
            ))}
        </div>
    );
};

/** A barra da prévia: modo claro/escuro, tela de amostra e dispositivo — tudo que muda COMO a prévia é vista, nunca o que o tema grava. */
export const PreviewToolbar: React.FC<PreviewToolbarProps> = ({
    previewDevice,
    setPreviewDevice,
    mode,
    onModeChange,
    activePreviewApp,
    selectPreviewApp,
    isPeeking = false,
}) => {
    const text = useLibraryText();
    return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
        <ModeSwitch mode={mode} onModeChange={onModeChange} />
        <SarakSelect
            label={text('previewScreenLabel')}
            hideLabel
            value={activePreviewApp}
            options={SCREEN_OPTIONS}
            onChange={(event) => selectPreviewApp(event.target.value)}
        />
        <p role={isPeeking ? 'status' : undefined} className={'min-w-0 flex-1 truncate text-[var(--sarak-type-scale-caption,12px)] ' + PREVIEW_TOOLBAR_HINT + ' ' + (isPeeking ? 'font-bold text-theme-primary' : 'text-[var(--theme-muted)]')}>
            {isPeeking ? text('peekNotice') : text('previewHint')}
        </p>
        <div role="group" aria-label={PREVIEW_TOOLBAR_LABELS.deviceGroup} className="flex shrink-0 gap-1">
            {DEVICE_OPTIONS.map(({ value, label, icon: Icon }) => (
                <SarakButton
                    key={value}
                    onClick={() => setPreviewDevice(value)}
                    aria-pressed={previewDevice === value}
                    variant={previewDevice === value ? 'primary' : 'ghost'}
                    size="xs"
                    leftIcon={<Icon size={14} />}
                >
                    {label}
                </SarakButton>
            ))}
        </div>
    </div>
    );
};
