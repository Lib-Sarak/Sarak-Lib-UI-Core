import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import { SarakTable } from '../SarakTable';
import { sarakGetAllDesignTokens } from '../../../../core/Design/master-map';

interface Person extends Record<string, unknown> {
    id: number;
    name: string;
}

const people: Person[] = [
    { id: 1, name: 'Ana' },
    { id: 2, name: 'Beto' },
    { id: 3, name: 'Caio' },
];
const columns = [{ key: 'name', label: 'Nome' }];
const ZEBRA = 'bg-[color-mix(in_srgb,currentColor_4%,transparent)]';
const CARD_DEFAULT_RADIUS_PX = 14;

const renderTable = (config: Record<string, unknown>): void => {
    render(
        <SarakUIProvider config={config}>
            <SarakTable<Person> data={people} columns={columns} showSearch={false} responsive={false} getRowKey={(row) => row.id} />
        </SarakUIProvider>,
    );
};

const rowOf = (name: string): HTMLElement => screen.getByText(name).closest('tr') as HTMLElement;

describe('tableZebraStriping — listras alternadas nas linhas', () => {
    it('ligado, as linhas de índice ímpar ganham o fundo alternado e as pares não', () => {
        renderTable({ tableZebraStriping: true });
        expect(rowOf('Ana').className).not.toContain(ZEBRA);
        expect(rowOf('Beto').className).toContain(ZEBRA);
        expect(rowOf('Caio').className).not.toContain(ZEBRA);
    });

    it('desligado (padrão), nenhuma linha tem fundo alternado', () => {
        renderTable({ tableZebraStriping: false });
        ['Ana', 'Beto', 'Caio'].forEach((name) => expect(rowOf(name).className).not.toContain(ZEBRA));
    });
});

describe('tableBorderRadius — o raio do contêiner da tabela', () => {
    it('o contêiner lê --sarak-table-border-radius e cai no raio do cartão', () => {
        renderTable({});
        const container = screen.getByRole('table').closest('.card');
        expect(container?.className).toContain('rounded-[var(--sarak-table-border-radius,var(--sarak-card-radius,10px))]');
    });

    it('o padrão do schema é o raio padrão do cartão que o contêiner desenhava (8 no celular, 12 acima)', () => {
        const token = sarakGetAllDesignTokens().find((item) => item.id === 'tableBorderRadius');
        expect(token?.defaultValue).toEqual({ mob: 10, tab: CARD_DEFAULT_RADIUS_PX, desk: CARD_DEFAULT_RADIUS_PX });
    });
});

describe('tableBorderRadius — o raio chega pelos cantos que a regra importante de `.card` lê', () => {
    it('o contêiner declara os quatro cantos do cartão a partir do token da tabela', () => {
        renderTable({});
        const container = screen.getByRole('table').closest('.card') as HTMLElement;
        for (const corner of ['tl', 'tr', 'br', 'bl']) {
            expect(container.style.getPropertyValue(`--sarak-card-radius-${corner}`))
                .toBe('var(--sarak-table-border-radius, var(--sarak-card-radius, 10px))');
        }
    });
});
