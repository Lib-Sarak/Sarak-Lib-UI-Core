import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SarakActivityFeed } from '../SarakActivityFeed';

const NOW = new Date('2026-10-09T12:00:00Z');
const entries = [
    { id: 'e1', actor: { name: 'Ana Souza' }, text: 'moveu para Em andamento', at: new Date(NOW.getTime() - 2 * 3_600_000) },
    { id: 'e2', text: 'Cartão criado', at: new Date(NOW.getTime() - 86_400_000) },
    { id: 'e3', text: 'Sem data confiável', at: 'não é data' },
];

describe('SarakActivityFeed', () => {
    beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(NOW); });
    afterEach(() => { vi.useRealTimers(); });

    it('lista nomeada, uma entrada por item, na ordem recebida', () => {
        render(<SarakActivityFeed entries={entries} />);
        const list = screen.getByRole('list', { name: 'Histórico' });
        expect(within(list).getAllByRole('listitem').map((li) => li.getAttribute('data-activity-id'))).toEqual(['e1', 'e2', 'e3']);
    });

    it('com autor: avatar (iniciais), nome em destaque e a frase; horário relativo com datetime', () => {
        render(<SarakActivityFeed entries={entries} />);
        const first = document.querySelector('[data-activity-id="e1"]') as HTMLElement;
        expect(within(first).getByText('AS')).toBeInTheDocument();
        expect(first).toHaveTextContent('Ana Souza moveu para Em andamento');
        const time = first.querySelector('time') as HTMLTimeElement;
        expect(time).toHaveTextContent('há 2 horas');
        expect(time).toHaveAttribute('datetime', '2026-10-09T10:00:00.000Z');
    });

    it('sem autor é evento do sistema (sem nome em destaque); data inválida some o horário; ontem em linguagem natural', () => {
        render(<SarakActivityFeed entries={entries} />);
        const system = document.querySelector('[data-activity-id="e2"]') as HTMLElement;
        expect(system.querySelector('strong')).toBeNull();
        expect(system).toHaveTextContent('ontem');
        expect((document.querySelector('[data-activity-id="e3"]') as HTMLElement).querySelector('time')).toBeNull();
    });

    it('estado vazio traduzido; o rótulo passado vence', () => {
        const { rerender } = render(<SarakActivityFeed entries={[]} />);
        expect(screen.getByRole('region', { name: 'Histórico' })).toHaveTextContent('Nenhuma atividade');
        rerender(<SarakActivityFeed entries={entries} label="Movimentação" />);
        expect(screen.getByRole('list', { name: 'Movimentação' })).toBeInTheDocument();
    });
});
