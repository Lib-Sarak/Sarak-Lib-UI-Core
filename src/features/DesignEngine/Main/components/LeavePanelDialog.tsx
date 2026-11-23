import React from 'react';
import { SarakButton } from '../../../../components/atomic/Buttons/SarakButton';
import { SarakModal } from '../../../../components/atomic/Modals/SarakModal';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import type { LeavePanelChoice } from '../hooks/useLeavePanelGuard';

interface LeavePanelDialogProps {
    isOpen: boolean;
    onChoose: (choice: LeavePanelChoice) => void;
}

/**
 * A pergunta de quem sai do painel com rascunho sujo: ficar, aplicar ou descartar. Fechar o diálogo é ficar.
 * Os três botões ficam lado a lado, com a mesma largura; sem espaço, empilham todos com a mesma largura.
 */
export const LeavePanelDialog: React.FC<LeavePanelDialogProps> = ({ isOpen, onChoose }) => {
    const text = useLibraryText();
    return (
        <SarakModal
            isOpen={isOpen}
            onClose={() => onChoose('stay')}
            title={text('panelLeaveTitle')}
            size="xl"
            footer={(
                <div className="grid w-full" style={{ gap: 'var(--sarak-layout-gap-sm, 8px)', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, calc(var(--sarak-modal-width-md, 448px) / 2.5)), 1fr))' }}>
                    <SarakButton type="button" fullWidth variant="secondary" data-testid="sarak-panel-leave-stay" onClick={() => onChoose('stay')}>
                        {text('panelLeaveStay')}
                    </SarakButton>
                    <SarakButton type="button" fullWidth variant="danger" data-testid="sarak-panel-leave-discard" onClick={() => onChoose('discard')}>
                        {text('panelLeaveDiscard')}
                    </SarakButton>
                    <SarakButton type="button" fullWidth variant="primary" data-testid="sarak-panel-leave-apply" onClick={() => onChoose('apply')}>
                        {text('panelLeaveApply')}
                    </SarakButton>
                </div>
            )}
        >
            <div>{text('panelLeaveMessage')}</div>
        </SarakModal>
    );
};
