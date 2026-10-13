import React, { useState } from 'react';
import { fireEvent, render, screen, within, configure } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SarakKanban } from '../SarakKanban';
import type { SarakKanbanCard } from '../SarakKanban';
import { SarakChecklist } from '../SarakChecklist';
import { SarakCommentThread } from '../SarakCommentThread';
import { SarakActivityFeed } from '../SarakActivityFeed';
import { SarakAssigneePicker } from '../../Inputs/SarakAssigneePicker';
import { SarakDrawer } from '../../Modals/SarakDrawer';

const people = [{ id: 'p1', name: 'Ana Souza' }, { id: 'p2', name: 'Bruno Lima' }];
const columns = [
    { id: 'todo', title: 'A fazer', cards: [{ id: 'k1', title: 'Subir tela de login' }, { id: 'k2', title: 'Revisar PR' }] },
    { id: 'doing', title: 'Em andamento', cards: [] },
];

/** O detalhe do cartão montado SÓ com átomos da lib, aberto a partir do clique no quadro. */
function BoardWithDetail() {
    const [open, setOpen] = useState<SarakKanbanCard | null>(null);
    const [assignee, setAssignee] = useState<string | null>(null);
    const [items, setItems] = useState([{ id: 'i1', label: 'Escrever teste', done: false }, { id: 'i2', label: 'Subir PR', done: false }]);
    const [comments, setComments] = useState<Array<{ id: string; author: { name: string }; body: string; createdAt: Date }>>([]);

    return (
        <>
            <SarakKanban columns={columns} onCardClick={(card) => setOpen(card)} />
            <SarakDrawer isOpen={open !== null} onClose={() => setOpen(null)}>
                <h2>{open?.title}</h2>
                <SarakAssigneePicker people={people} value={assignee} onChange={setAssignee} clearable />
                <SarakChecklist
                    items={items}
                    showProgress
                    onToggle={(id, done) => setItems((prev) => prev.map((item) => (item.id === id ? { ...item, done } : item)))}
                />
                <SarakCommentThread
                    comments={comments}
                    onSubmit={(body) => setComments((prev) => [...prev, { id: `c${prev.length}`, author: { name: 'Ana Souza' }, body, createdAt: new Date() }])}
                />
                <SarakActivityFeed entries={[{ id: 'e1', text: 'Cartão criado', at: new Date() }]} />
            </SarakDrawer>
        </>
    );
}

// Estes casos abrem o detalhe (diálogo, checklist, comentários) a partir do cartão: com a máquina ocupada passam do
// `findBy*` padrão (1 s) e do teste padrão (5 s). Os limites são declarados para a montagem, não deixados à sorte.
const MOUNT_TIMEOUT_MS = 30_000;
configure({ asyncUtilTimeout: MOUNT_TIMEOUT_MS });
vi.setConfig({ testTimeout: MOUNT_TIMEOUT_MS + 15_000 });

describe('Detalhe do cartão — composição só com átomos da lib', () => {
    it('clicar no cartão abre o detalhe com título, responsável, checklist, comentários e histórico', async () => {
        render(<BoardWithDetail />);
        expect(screen.queryByRole('dialog')).toBeNull();

        fireEvent.click(await screen.findByText('Subir tela de login'));

        const dialog = await screen.findByRole('dialog');
        expect(within(dialog).getByRole('heading', { name: 'Subir tela de login' })).toBeInTheDocument();
        expect(within(dialog).getByText('Responsável')).toBeInTheDocument();
        expect(within(dialog).getByRole('region', { name: 'Lista de verificação' })).toBeInTheDocument();
        expect(within(dialog).getByRole('region', { name: 'Comentários' })).toBeInTheDocument();
        expect(within(dialog).getByRole('list', { name: 'Histórico' })).toBeInTheDocument();
    });

    it('os blocos funcionam dentro do detalhe: responsável, progresso do checklist e novo comentário', async () => {
        render(<BoardWithDetail />);
        fireEvent.click(await screen.findByText('Revisar PR'));
        const dialog = await screen.findByRole('dialog');

        fireEvent.change(within(dialog).getByRole('combobox'), { target: { value: 'bru' } });
        fireEvent.click(await within(dialog).findByRole('option', { name: 'Bruno Lima' }));
        expect(dialog.querySelector('[data-assignee-selected="p2"]')).not.toBeNull();

        expect(within(dialog).getByRole('progressbar', { name: '0 de 2' })).toHaveAttribute('aria-valuenow', '0');
        fireEvent.click(within(dialog).getByRole('checkbox', { name: /Escrever teste/ }));
        expect(within(dialog).getByRole('progressbar', { name: '1 de 2' })).toHaveAttribute('aria-valuenow', '1');

        fireEvent.change(within(dialog).getByRole('textbox', { name: 'Escreva um comentário' }), { target: { value: 'Pronto para revisão' } });
        fireEvent.click(within(dialog).getByRole('button', { name: 'Comentar' }));
        expect(within(dialog).getByText('Pronto para revisão')).toBeInTheDocument();
    });
});
