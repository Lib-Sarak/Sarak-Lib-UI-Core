import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { SarakTabs, type SarakTabItem } from '../SarakTabs';

const TABS: SarakTabItem[] = [
    { id: 'a', label: 'Aba A' },
    { id: 'b', label: 'Aba B', disabled: true },
    { id: 'c', label: 'Aba C' },
];

describe('SarakTabs — teclado e ARIA (caracterização Lote 9, R10)', () => {
    it('renderiza role="tablist" e cada aba com role="tab"', () => {
        render(<SarakTabs tabs={TABS} activeTab="a" onChange={vi.fn()} />);
        expect(screen.getByRole('tablist')).toBeInTheDocument();
        expect(screen.getAllByRole('tab')).toHaveLength(3);
    });

    it('a aba ativa tem aria-selected=true e tabIndex=0; as demais aria-selected=false e tabIndex=-1', () => {
        render(<SarakTabs tabs={TABS} activeTab="a" onChange={vi.fn()} />);
        const tabA = screen.getByRole('tab', { name: 'Aba A' });
        const tabC = screen.getByRole('tab', { name: 'Aba C' });
        expect(tabA).toHaveAttribute('aria-selected', 'true');
        expect(tabA).toHaveAttribute('tabindex', '0');
        expect(tabC).toHaveAttribute('aria-selected', 'false');
        expect(tabC).toHaveAttribute('tabindex', '-1');
    });

    it('a aba desabilitada tem aria-disabled e o atributo disabled nativo', () => {
        render(<SarakTabs tabs={TABS} activeTab="a" onChange={vi.fn()} />);
        const tabB = screen.getByRole('tab', { name: 'Aba B' });
        expect(tabB).toHaveAttribute('aria-disabled', 'true');
        expect(tabB).toBeDisabled();
    });

    it('clicar numa aba habilitada chama onChange com o id dela', () => {
        const onChange = vi.fn();
        render(<SarakTabs tabs={TABS} activeTab="a" onChange={onChange} />);
        fireEvent.click(screen.getByRole('tab', { name: 'Aba C' }));
        expect(onChange).toHaveBeenCalledWith('c');
    });

    it('clicar numa aba desabilitada NÃO chama onChange', () => {
        const onChange = vi.fn();
        render(<SarakTabs tabs={TABS} activeTab="a" onChange={onChange} />);
        fireEvent.click(screen.getByRole('tab', { name: 'Aba B' }));
        expect(onChange).not.toHaveBeenCalled();
    });

    it('ArrowRight a partir da aba ativa (index 0) pula a desabilitada e vai para a próxima habilitada (c)', () => {
        const onChange = vi.fn();
        render(<SarakTabs tabs={TABS} activeTab="a" onChange={onChange} />);
        fireEvent.keyDown(screen.getByRole('tab', { name: 'Aba A' }), { key: 'ArrowRight' });
        expect(onChange).toHaveBeenCalledWith('c');
    });

    it('ArrowLeft a partir da aba ativa (index 0) dá a volta e pula a desabilitada, indo para c', () => {
        const onChange = vi.fn();
        render(<SarakTabs tabs={TABS} activeTab="a" onChange={onChange} />);
        fireEvent.keyDown(screen.getByRole('tab', { name: 'Aba A' }), { key: 'ArrowLeft' });
        expect(onChange).toHaveBeenCalledWith('c');
    });

    it('Home vai para a primeira aba habilitada', () => {
        const onChange = vi.fn();
        render(<SarakTabs tabs={TABS} activeTab="c" onChange={onChange} />);
        fireEvent.keyDown(screen.getByRole('tab', { name: 'Aba C' }), { key: 'Home' });
        expect(onChange).toHaveBeenCalledWith('a');
    });

    it('End vai para a última aba habilitada', () => {
        const onChange = vi.fn();
        render(<SarakTabs tabs={TABS} activeTab="a" onChange={onChange} />);
        fireEvent.keyDown(screen.getByRole('tab', { name: 'Aba A' }), { key: 'End' });
        expect(onChange).toHaveBeenCalledWith('c');
    });
});
