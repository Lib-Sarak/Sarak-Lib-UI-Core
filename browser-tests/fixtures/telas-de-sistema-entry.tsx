import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
    SarakApprovalQueue, SarakAuditLog, SarakDiffView, SarakLiveStatus, SarakMemberList, SarakPermissionMatrix,
    SarakRunProgress, SarakSessionList, SarakSettingsPage, SarakUIProvider, SarakUsageMeter, SarakVersionList,
} from '@sarak/lib-ui-core';

const mountNode = document.getElementById('root');

if (!mountNode) {
    throw new Error('O harness das telas de sistema precisa do elemento #root.');
}

const params = new URLSearchParams(window.location.search);
const MODE = params.get('mode') === 'light' ? 'light' : 'dark';
const DEFAULT_WIDTH = 960;
const WIDTH = Number(params.get('width')) || DEFAULT_WIDTH;
const STAGE_PADDING = 16;
const LONG_TEXT = 'Relatório trimestral de conciliação bancária das filiais do litoral norte e sul';

const SECTIONS = [
    { id: 'geral', title: 'Geral', description: 'Nome e idioma', content: <p>Conteúdo geral</p> },
    { id: 'avisos', title: 'Avisos', content: <p>Conteúdo de avisos</p>, dirty: true },
];
const FIELDS = [{ label: 'Prazo', before: '10 dias', after: '15 dias' }, { label: 'Apelido', after: 'Aninha' }, { label: 'Telefone', before: '1111' }];
const AUDIT = [
    { id: '1', actor: 'ana', action: 'login', target: LONG_TEXT, at: '2026-05-02T10:00:00Z', detail: <p>IP 10.0.0.1</p> },
    { id: '2', actor: 'beto', action: 'excluir', target: 'Pedido 12', at: '2026-05-01T09:30:00Z' },
];
const VERSIONS = [
    { id: 'v2', label: 'Versão 2', author: 'Ana', at: '2026-05-02T10:00:00Z', summary: 'Prazo ajustado', current: true, diff: { fields: FIELDS } },
    { id: 'v1', label: 'Versão 1', author: 'Beto', at: '2026-05-01T10:00:00Z' },
];
const APPROVALS = [
    { id: 'a', title: 'Cliente Alfa', requester: 'Ana', diff: { fields: FIELDS } },
    { id: 'b', title: LONG_TEXT, diff: { before: 'um\ndois', after: 'um\nDOIS\ntrês' } },
];
const PHASES = [
    { id: 'baixar', label: 'Baixar arquivos', status: 'done' as const },
    { id: 'traduzir', label: LONG_TEXT, status: 'running' as const, progress: 50 },
    { id: 'montar', label: 'Montar relatório', status: 'pending' as const },
];
const ROLES = [{ id: 'admin', label: 'Admin' }, { id: 'editor', label: 'Editor' }, { id: 'leitor', label: 'Leitor' }, { id: 'auditor', label: 'Auditor' }];
const GROUPS = [
    { id: 'docs', label: 'Documentos', permissions: [{ id: 'ler', label: 'Ler' }, { id: 'editar', label: 'Editar' }] },
    { id: 'conta', label: 'Conta', permissions: [{ id: 'faturar', label: 'Faturar' }] },
];
const MEMBERS = [{ id: 'm1', name: 'Ana Souza', email: 'ana.souza.com.nome.muito.longo@exemplo-empresa.com.br', role: 'Admin' }];
const INVITATIONS = [{ id: 'i1', email: 'carla@exemplo.com', role: 'Editor', sentAt: '2026-05-02T10:00:00Z' }];
const SESSIONS = [
    { id: 's1', device: 'Chrome no Windows', location: 'São Paulo', lastActiveAt: '2026-05-02T10:00:00Z', current: true },
    { id: 's2', device: 'Safari no iPhone', lastActiveAt: '2026-05-01T08:00:00Z' },
];

const Piece = ({ id, children }: { id: string; children: React.ReactNode }): React.ReactElement => (
    <section data-testid={`peca-${id}`} style={{ marginBottom: 32 }}>{children}</section>
);

const App = (): React.ReactElement => {
    const [log, setLog] = useState<string[]>([]);
    const [dirty, setDirty] = useState(true);
    const [granted, setGranted] = useState<Record<string, string[]>>({ admin: ['ler', 'editar', 'faturar'], editor: ['ler'] });
    const note = (entry: string): void => setLog((previous) => [...previous, entry]);

    return (
        <SarakUIProvider config={{ mode: MODE }} options={{ fonts: 'none' }}>
            <div data-testid="stage" style={{ width: WIDTH, padding: STAGE_PADDING, boxSizing: 'content-box' }}>
                <Piece id="configuracoes">
                    <SarakSettingsPage
                        title="Configurações"
                        sections={SECTIONS}
                        isDirty={dirty}
                        onSave={() => { note('salvar'); setDirty(false); }}
                        onDiscard={() => { note('descartar'); setDirty(false); }}
                    />
                </Piece>
                <Piece id="auditoria"><SarakAuditLog entries={AUDIT} filters={{}} onFiltersChange={(filters) => note(`filtro:${filters.query ?? ''}`)} actors={['ana', 'beto']} /></Piece>
                <Piece id="diferenca"><SarakDiffView fields={FIELDS} /></Piece>
                <Piece id="versoes"><SarakVersionList versions={VERSIONS} onRestore={(id) => note(`restaurar:${id}`)} /></Piece>
                <Piece id="aprovacao"><SarakApprovalQueue items={APPROVALS} onApprove={(ids) => note(`aprovar:${ids.join(',')}`)} onReject={(ids, reason) => note(`rejeitar:${ids.join(',')}:${reason}`)} /></Piece>
                <Piece id="execucao"><SarakRunProgress title="Tradução" phases={PHASES} elapsedMs={125_000} onCancel={() => note('cancelar')} lastError="Tempo esgotado ao enviar" /></Piece>
                <Piece id="conexao">
                    <SarakLiveStatus status="offline" label="API" lastDataAt="2026-05-02T10:00:00Z" onRetry={() => note('tentar')} />
                    <SarakLiveStatus status="reconnecting" label="Tempo real" />
                    <SarakLiveStatus status="connected" label="Fila" lastDataAt="2026-05-02T10:00:00Z" />
                </Piece>
                <Piece id="uso">
                    <SarakUsageMeter label="Armazenamento" used={50} limit={100} unit="GB" />
                    <SarakUsageMeter label="Chamadas" used={85} limit={100} />
                    <SarakUsageMeter label="Convites" used={97} limit={100} />
                    <SarakUsageMeter label="Sessões" used={120} limit={100} />
                </Piece>
                <Piece id="permissoes">
                    <SarakPermissionMatrix
                        roles={ROLES}
                        groups={GROUPS}
                        granted={granted}
                        inherited={{ editor: ['editar'] }}
                        onToggle={(role, permission, value) => {
                            note(`permissao:${role}:${permission}:${value}`);
                            setGranted((previous) => ({ ...previous, [role]: value ? [...(previous[role] ?? []), permission] : (previous[role] ?? []).filter((id) => id !== permission) }));
                        }}
                    />
                </Piece>
                <Piece id="membros"><SarakMemberList members={MEMBERS} invitations={INVITATIONS} onRemoveMember={(id) => note(`remover:${id}`)} onResendInvitation={(id) => note(`reenviar:${id}`)} onRevokeInvitation={(id) => note(`revogar:${id}`)} /></Piece>
                <Piece id="sessoes"><SarakSessionList sessions={SESSIONS} onRevoke={(id) => note(`encerrar:${id}`)} onRevokeOthers={() => note('encerrar-outras')} /></Piece>
                <p data-testid="log">{log.join('|')}</p>
            </div>
        </SarakUIProvider>
    );
};

createRoot(mountNode).render(<App />);
