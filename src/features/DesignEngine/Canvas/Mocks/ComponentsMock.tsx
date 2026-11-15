import React, { useState } from 'react';
import { SarakButton } from '../../../../components/atomic/Buttons/SarakButton';
import { SarakInput } from '../../../../components/atomic/Inputs/SarakInput';
import { SarakSwitch } from '../../../../components/atomic/Inputs/SarakSwitch';
import { SarakBadge, type SarakBadgeVariant } from '../../../../components/atomic/Feedback/SarakBadge';
import { SarakAlert } from '../../../../components/atomic/Feedback/SarakAlert';
import { SarakEmptyState } from '../../../../components/atomic/Feedback/SarakEmptyState';
import { SarakIcon } from '../../../../components/atomic/Icon/SarakIcon';

const SECTION_TITLE = 'text-2xs font-black uppercase tracking-widest text-[var(--theme-muted)]';
const BADGES: ReadonlyArray<{ variant: SarakBadgeVariant; label: string }> = [
    { variant: 'success', label: 'Aprovado' },
    { variant: 'danger', label: 'Atrasado' },
    { variant: 'primary', label: 'Em análise' },
    { variant: 'muted', label: 'Arquivado' },
];
/** A barra de rolagem lê `--scroll-*`, que o tema resolve na raiz: a lista as refaz a partir das variáveis do escopo, para a prévia ver a opção. */
const SCROLL_VARS = {
    '--scroll-w': 'var(--sarak-scroll-width, 6px)',
    '--scroll-r': 'var(--sarak-scroll-radius, 10px)',
    '--scroll-track': 'rgba(255, 255, 255, var(--sarak-scroll-track-opacity, 0.05))',
    '--scroll-thumb-op': 'var(--sarak-scroll-thumb-opacity, 0.2)',
    '--scroll-thumb-hover': 'var(--sarak-scroll-thumb-hover-opacity, 0.5)',
} as React.CSSProperties;
const SCROLL_ROWS = ['Pedido 1042', 'Pedido 1043', 'Pedido 1044', 'Pedido 1045', 'Pedido 1046', 'Pedido 1047', 'Pedido 1048', 'Pedido 1049'];

/** O componente real de cada controle: o interruptor liga e desliga, e o painel o desenha com o que o rascunho (ou a espiada) escolheu. */
const Controls: React.FC = () => {
    const [notify, setNotify] = useState(true);
    const [sync, setSync] = useState(false);
    const [alerts, setAlerts] = useState(true);
    return (
        <div className="space-y-3">
            <SarakInput type="text" placeholder="Buscar pedido..." fullWidth />
            <div className="flex flex-col gap-3 p-3.5 bg-theme-text/5" style={{ borderRadius: 'var(--sarak-card-radius)' }}>
                <SarakSwitch label="Avisar por e-mail" checked={notify} onChange={(event) => setNotify(event.target.checked)} />
                <SarakSwitch label="Sincronizar agora" checked={sync} onChange={(event) => setSync(event.target.checked)} />
                <SarakSwitch label="Alertas de estoque" checked={alerts} onChange={(event) => setAlerts(event.target.checked)} />
            </div>
        </div>
    );
};

/**
 * Os avisos de sistema: a bolha de dica e o aviso lateral desenhados como o painel os desenha, já que os reais
 * saem da moldura (portal no `body`). Leem as mesmas variáveis: raio da dica e largura do filete.
 */
const NoticeSurfaces: React.FC = () => (
    <div className="flex flex-wrap items-start gap-4">
        <div
            className="border border-[var(--sarak-tooltip-border,var(--theme-border))] bg-[var(--sarak-tooltip-bg,var(--theme-surface))] px-3 py-2 text-xs text-[var(--sarak-tooltip-text,var(--theme-title))]"
            style={{ borderRadius: 'var(--sarak-tooltip-radius, 6px)' }}
        >
            Copiar o código do pedido
        </div>
        <div
            className="flex min-w-[15rem] items-center gap-2 bg-[var(--theme-card)] px-3 py-2 text-xs text-[var(--theme-title)]"
            style={{ borderLeft: 'var(--sarak-toast-accent-width, 4px) solid var(--sarak-status-success-color, var(--theme-success))', borderRadius: 'var(--sarak-card-radius, 10px)' }}
        >
            <SarakIcon name="CheckCircle2" size={14} />
            Pedido salvo com sucesso
        </div>
    </div>
);

/** O painel do diálogo sobre o fundo escurecido, na moldura: o diálogo real abre num portal e cobriria a tela do painel. */
const ModalSurface: React.FC = () => (
    <div className="relative flex h-44 items-center justify-center overflow-hidden rounded-[var(--sarak-card-radius,10px)] border border-[var(--theme-border)] bg-[var(--theme-body)]">
        <div className="absolute inset-0 bg-[var(--sarak-modal-overlay-color,rgba(2,4,8,0.6))] backdrop-blur-[var(--sarak-modal-blur,8px)]" aria-hidden="true" />
        <div
            className="sarak-modal-panel relative flex w-4/5 flex-col overflow-hidden bg-[var(--sarak-bg-modal,var(--theme-surface))]"
            style={{ borderRadius: 'var(--sarak-modal-border-radius, var(--radius-modal))' }}
        >
            <div className="border-b border-[var(--theme-border)] px-4 py-2 text-sm font-bold text-[var(--theme-title)]">Excluir pedido</div>
            <div className="px-4 py-3 text-xs text-[var(--theme-muted)]">Esta ação não pode ser desfeita.</div>
            <div className="flex justify-end gap-2 border-t border-[var(--theme-border)] px-4 py-2">
                <SarakButton variant="ghost" size="xs">Cancelar</SarakButton>
                <SarakButton variant="primary" size="xs">Excluir</SarakButton>
            </div>
        </div>
    </div>
);

/**
 * Os componentes que as decisões de Componentes mudam, na mesma tela: interruptor, selo, aviso, barra de rolagem,
 * estado vazio, diálogo e avisos de sistema. Interruptor, selo, aviso e estado vazio são os componentes reais da lib.
 */
export const MockComponents: React.FC<{ tokens?: unknown }> = () => (
    <div className="space-y-8">
        <h3 className="text-sm font-bold text-[var(--theme-title)] mb-6">Component Showcase</h3>

        <div className="grid grid-cols-2" style={{ gap: 'var(--theme-gap, 24px)' }}>
            <div className="space-y-4">
                <div className={SECTION_TITLE}>Button States</div>
                <div className="flex flex-col gap-3">
                    <SarakButton variant="primary">Primary Action</SarakButton>
                    <SarakButton variant="secondary">Secondary Outline</SarakButton>
                    <SarakButton variant="ghost">Ghost Neutral</SarakButton>
                </div>
            </div>
            <div className="space-y-4" data-peek-group="switch">
                <div className={SECTION_TITLE}>Inputs & Toggles</div>
                <Controls />
            </div>
        </div>

        <div className="space-y-4" data-peek-group="badge">
            <div className={SECTION_TITLE}>Badges & Indicators</div>
            <div className="flex flex-wrap gap-2">
                {BADGES.map(({ variant, label }) => <SarakBadge key={variant} variant={variant} soft>{label}</SarakBadge>)}
            </div>
        </div>

        <div className="space-y-4" data-peek-group="notice">
            <div className={SECTION_TITLE}>Avisos</div>
            <SarakAlert variant="warning" title="Estoque baixo" message="Restam 3 unidades deste item." />
            <NoticeSurfaces />
        </div>

        <div className="grid grid-cols-2" style={{ gap: 'var(--theme-gap, 24px)' }}>
            <div className="space-y-4" data-peek-group="modal">
                <div className={SECTION_TITLE}>Diálogo</div>
                <ModalSurface />
            </div>
            <div className="space-y-4" data-peek-group="scroll">
                <div className={SECTION_TITLE}>Lista com rolagem</div>
                <div className="custom-scrollbar h-44 overflow-y-auto rounded-[var(--sarak-card-radius,10px)] border border-[var(--theme-border)] bg-[var(--theme-card)] p-3" style={SCROLL_VARS}>
                    {SCROLL_ROWS.map((row) => <div key={row} className="border-b border-[var(--theme-border)] py-3 text-xs text-[var(--theme-title)] last:border-b-0">{row}</div>)}
                </div>
            </div>
        </div>

        <div className="space-y-4" data-peek-group="emptyState">
            <div className={SECTION_TITLE}>Estado vazio</div>
            <div className="relative h-56 overflow-hidden rounded-[var(--sarak-card-radius,10px)] border border-[var(--theme-border)] bg-[var(--theme-body)]">
                <SarakEmptyState />
            </div>
        </div>
    </div>
);
