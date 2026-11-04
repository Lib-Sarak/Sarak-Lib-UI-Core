import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import { SarakTabsMenu } from '../SarakTabsMenu';
import type { SarakTabItem } from '../SarakTabs';

const HIDDEN: SarakTabItem[] = [
    { id: 'x', label: 'Aba X' },
    { id: 'y', label: 'Aba Y', href: '/y' },
    { id: 'z', label: 'Aba Z' },
];
const TRIGGER_NAME = /mais abas|more tabs/i;

describe('SarakTabsMenu', () => {
    it('não renderiza nada sem abas escondidas', () => {
        const { container } = render(<SarakTabsMenu tabs={[]} activeTab="a" onSelect={vi.fn()} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('abre por clique, navega por setas/Home/End e fecha com Esc devolvendo o foco', () => {
        render(<SarakTabsMenu tabs={HIDDEN} activeTab="x" onSelect={vi.fn()} />);
        const trigger = screen.getByRole('button', { name: TRIGGER_NAME });
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
        fireEvent.click(trigger);
        const items = screen.getAllByRole('menuitem');
        expect(items).toHaveLength(3);
        expect(items[0]).toHaveFocus();
        fireEvent.keyDown(items[0], { key: 'ArrowDown' });
        expect(items[1]).toHaveFocus();
        fireEvent.keyDown(items[1], { key: 'End' });
        expect(items[2]).toHaveFocus();
        fireEvent.keyDown(items[2], { key: 'Home' });
        expect(items[0]).toHaveFocus();
        fireEvent.keyDown(items[0], { key: 'Escape' });
        expect(screen.queryByRole('menu')).toBeNull();
        expect(trigger).toHaveFocus();
    });

    it('escolher uma aba avisa e fecha; a ativa leva aria-current', () => {
        const onSelect = vi.fn();
        render(<SarakTabsMenu tabs={HIDDEN} activeTab="x" onSelect={onSelect} />);
        fireEvent.click(screen.getByRole('button', { name: TRIGGER_NAME }));
        expect(screen.getAllByRole('menuitem')[0]).toHaveAttribute('aria-current', 'true');
        fireEvent.click(screen.getAllByRole('menuitem')[2]);
        expect(onSelect).toHaveBeenCalledWith(HIDDEN[2]);
        expect(screen.queryByRole('menu')).toBeNull();
    });

    it('aba com href vira link no menu', () => {
        render(<SarakTabsMenu tabs={HIDDEN} activeTab="x" onSelect={vi.fn()} />);
        fireEvent.click(screen.getByRole('button', { name: TRIGGER_NAME }));
        expect(screen.getAllByRole('menuitem')[1]).toHaveAttribute('href', '/y');
    });
});
