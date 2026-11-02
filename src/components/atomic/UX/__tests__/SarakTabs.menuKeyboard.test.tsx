import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import { SarakTabs, type SarakTabItem } from '../SarakTabs';

const HIDDEN_INDEX = 2;

vi.mock('../useTabsOverflow', () => ({
    useTabsOverflow: () => ({
        listRef: { current: null },
        wrapperRef: { current: null },
        hiddenIndexes: new Set([HIDDEN_INDEX]),
        moreAtStart: false,
        moreAtEnd: false,
        onScroll: () => undefined,
    }),
}));

const TABS: SarakTabItem[] = [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }, { id: 'c', label: 'C' }];

describe('SarakTabs teclado com overflow="menu"', () => {
    it('ArrowRight na última aba visível não ativa a escondida', () => {
        const onChange = vi.fn();
        render(<SarakTabs tabs={TABS} activeTab="b" onChange={onChange} overflow="menu" />);
        fireEvent.keyDown(screen.getByRole('tab', { name: 'B' }), { key: 'ArrowRight' });
        expect(onChange).not.toHaveBeenCalled();
    });

    it('ArrowLeft pula a escondida ao dar a volta e End vai à última visível', () => {
        const onChange = vi.fn();
        render(<SarakTabs tabs={TABS} activeTab="a" onChange={onChange} overflow="menu" />);
        fireEvent.keyDown(screen.getByRole('tab', { name: 'A' }), { key: 'ArrowLeft' });
        expect(onChange).toHaveBeenLastCalledWith('b');
        fireEvent.keyDown(screen.getByRole('tab', { name: 'A' }), { key: 'End' });
        expect(onChange).toHaveBeenLastCalledWith('b');
    });
});
