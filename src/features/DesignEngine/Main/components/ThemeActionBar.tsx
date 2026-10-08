import React from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { SarakButton } from '../../../../components/atomic/Buttons/SarakButton';

const ACTION_LABELS = {
    apply: 'Aplicar',
    discard: 'Descartar',
    export: 'Exportar',
    undo: 'Desfazer última aplicação'
} as const;

interface ThemeActionBarProps {
    isDirty: boolean;
    dirtyTokenCount: number;
    onApply: () => void;
    onDiscard: () => void;
    onExport: () => void;
    canUndoLastApply: boolean;
    onUndoLastApply: () => void;
}

export const ThemeActionBar: React.FC<ThemeActionBarProps> = ({
    isDirty,
    dirtyTokenCount,
    onApply,
    onDiscard,
    onExport,
    canUndoLastApply,
    onUndoLastApply
}) => {
    const applyLabel = dirtyTokenCount > 0
        ? ACTION_LABELS.apply + ' (' + dirtyTokenCount + ')'
        : ACTION_LABELS.apply;

    return (
        <div role="group" aria-label="Ações do tema" className="shrink-0 border-t border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
            <div className="flex flex-col gap-2">
                <SarakButton
                    onClick={onApply}
                    disabled={dirtyTokenCount === 0}
                    variant="primary"
                    fullWidth
                    size="md"
                    leftIcon={<Check size={14} />}
                >
                    {applyLabel}
                </SarakButton>
                <div className="grid grid-cols-2 gap-2">
                    <SarakButton onClick={onDiscard} disabled={!isDirty} variant="secondary" size="sm">
                        {ACTION_LABELS.discard}
                    </SarakButton>
                    <SarakButton onClick={onExport} disabled={!isDirty} variant="ghost" size="sm">
                        {ACTION_LABELS.export}
                    </SarakButton>
                </div>
                {canUndoLastApply && (
                    <SarakButton
                        onClick={onUndoLastApply}
                        variant="ghost"
                        size="xs"
                        leftIcon={<RotateCcw size={12} />}
                        className="self-center"
                    >
                        {ACTION_LABELS.undo}
                    </SarakButton>
                )}
            </div>
        </div>
    );
};
