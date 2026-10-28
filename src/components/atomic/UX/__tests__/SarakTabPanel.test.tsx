import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SarakTabs, type SarakTabItem } from '../SarakTabs';
import { SarakTabPanel } from '../SarakTabPanel';

const TABS: SarakTabItem[] = [
    { id: 'geral', label: 'Geral' },
    { id: 'itens', label: 'Itens', count: 3 },
    { id: 'notas', label: 'Notas' },
];

const Demo: React.FC = () => {
    const [aba, setAba] = useState('geral');
    return (
        <>
            <SarakTabs idPrefix="contrato" tabs={TABS} activeTab={aba} onChange={setAba} />
            <SarakTabPanel idPrefix="contrato" tabId={aba}>Panel of {aba}</SarakTabPanel>
        </>
    );
};

describe('SarakTabs + SarakTabPanel — abas sem href', () => {
    it('aria-controls da aba é o id do painel, e aria-labelledby do painel volta para a aba', () => {
        render(<Demo />);
        const tab = screen.getByRole('tab', { name: 'Geral' });
        const panel = screen.getByRole('tabpanel');
        expect(tab).toHaveAttribute('aria-controls', panel.id);
        expect(panel).toHaveAttribute('aria-labelledby', tab.id);
    });

    it('seta para a direita muda a aba e o painel acompanha', () => {
        render(<Demo />);
        fireEvent.keyDown(screen.getByRole('tab', { name: 'Geral' }), { key: 'ArrowRight' });
        expect(screen.getByRole('tab', { name: /Itens/ })).toHaveAttribute('aria-selected', 'true');
        expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel of itens');
    });

    it('o contador entra no nome acessível da aba', () => {
        render(<Demo />);
        expect(screen.getByRole('tab', { name: 'Itens 3' })).toBeInTheDocument();
    });

    it('panelId da aba vence o id derivado', () => {
        render(<SarakTabs idPrefix="x" tabs={[{ id: 'a', label: 'A', panelId: 'meu-painel' }]} activeTab="a" />);
        expect(screen.getByRole('tab', { name: 'A' })).toHaveAttribute('aria-controls', 'meu-painel');
    });

    it('sem idPrefix nem panelId, a aba não emite aria-controls (não aponta para painel inexistente)', () => {
        render(<SarakTabs tabs={TABS} activeTab="geral" />);
        for (const tab of screen.getAllByRole('tab')) expect(tab).not.toHaveAttribute('aria-controls');
    });

    it('sem idPrefix, o prefixo do id da aba é gerado e duas instâncias não colidem', () => {
        render(<><SarakTabs tabs={TABS} activeTab="geral" /><SarakTabs tabs={TABS} activeTab="geral" /></>);
        const ids = screen.getAllByRole('tab', { name: 'Geral' }).map((tab) => tab.id);
        expect(new Set(ids).size).toBe(2);
    });
});

describe('SarakTabs — abas com href (navegação)', () => {
    const ROUTES: SarakTabItem[] = [
        { id: 'a', label: 'Resumo', href: '/resumo' },
        { id: 'b', label: 'Faturas', href: '/faturas', count: 12 },
    ];

    it('a lista vira navigation de links, com aria-current na ativa e sem role="tab"', () => {
        render(<SarakTabs tabs={ROUTES} activeTab="b" />);
        expect(screen.getByRole('navigation')).toBeInTheDocument();
        expect(screen.queryByRole('tab')).toBeNull();
        expect(screen.getByRole('link', { name: 'Faturas 12' })).toHaveAttribute('aria-current', 'page');
        expect(screen.getByRole('link', { name: 'Resumo' })).not.toHaveAttribute('aria-current');
    });

    it('clique simples chama onNavigate, impede a recarga e avisa onChange', () => {
        const onNavigate = vi.fn();
        const onChange = vi.fn();
        render(<SarakTabs tabs={ROUTES} activeTab="a" onNavigate={onNavigate} onChange={onChange} />);
        const notPrevented = fireEvent.click(screen.getByRole('link', { name: 'Faturas 12' }));
        expect(notPrevented).toBe(false);
        expect(onNavigate).toHaveBeenCalledWith('/faturas', ROUTES[1]);
        expect(onChange).toHaveBeenCalledWith('b');
    });

    it('sem onNavigate o navegador segue o link (clique não é impedido)', () => {
        render(<SarakTabs tabs={ROUTES} activeTab="a" />);
        expect(fireEvent.click(screen.getByRole('link', { name: 'Resumo' }))).toBe(true);
    });
});
