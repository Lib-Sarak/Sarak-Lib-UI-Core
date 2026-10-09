import React from 'react';
import { SarakButton } from '../../../../components/atomic/Buttons/SarakButton';
import { ADDITIONAL_PREVIEW_SCREENS } from '../previewScreens';

interface MoreScreensMockProps {
    selectPreviewApp: (appId: string) => void;
}

export const MoreScreensMock: React.FC<MoreScreensMockProps> = ({ selectPreviewApp }) => (
    <main className="@container flex h-full min-h-0 flex-col gap-[var(--sarak-layout-gap-md,16px)] overflow-y-auto bg-[var(--theme-bg,#050505)] p-[var(--sarak-layout-gap-md,16px)] text-[var(--theme-title,#ffffff)]">
        <header className="flex flex-col gap-[var(--sarak-layout-gap-sm,12px)]">
            <h1 className="text-[var(--sarak-type-scale-xl,20px)] font-semibold">Mais telas</h1>
            <p className="text-[var(--sarak-type-scale-caption,12px)] text-[var(--theme-muted,rgba(255,255,255,0.4))]">
                Escolha outra tela para continuar a prévia.
            </p>
        </header>
        <div className="grid grid-cols-1 gap-[var(--sarak-layout-gap-sm,12px)] @min-[768px]:grid-cols-2">
            {ADDITIONAL_PREVIEW_SCREENS.map(({ id, label }) => (
                <SarakButton
                    key={id}
                    variant="secondary"
                    size="sm"
                    fullWidth
                    onClick={() => selectPreviewApp(id)}
                >
                    {label}
                </SarakButton>
            ))}
        </div>
    </main>
);
