import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SarakTabs, type SarakTabItem } from '../SarakTabs';

const tabs: SarakTabItem[] = [
    { id: 'a', label: 'A' },
    { id: 'b', label: 'B', disabled: true },
    { id: 'c', label: 'C' },
];

describe('SarakTabs — navegação por teclado (Spec 41, Regra 3)', () => {
    it('ArrowRight pula a aba desabilitada e seleciona a próxima habilitada', () => {
        const onChange = vi.fn();
        render(<SarakTabs tabs={tabs} activeTab="a" onChange={onChange} />);
        fireEvent.keyDown(screen.getByRole('tab', { name: 'A' }), { key: 'ArrowRight' });
        expect(onChange).toHaveBeenCalledWith('c');
    });

    it('ArrowLeft a partir da primeira aba volta circularmente para a última habilitada', () => {
        const onChange = vi.fn();
        render(<SarakTabs tabs={tabs} activeTab="a" onChange={onChange} />);
        fireEvent.keyDown(screen.getByRole('tab', { name: 'A' }), { key: 'ArrowLeft' });
        expect(onChange).toHaveBeenCalledWith('c');
    });

    it('Home/End vão para a primeira/última aba habilitada', () => {
        const onChange = vi.fn();
        render(<SarakTabs tabs={tabs} activeTab="c" onChange={onChange} />);
        const activeTab = screen.getByRole('tab', { name: 'C' });
        fireEvent.keyDown(activeTab, { key: 'Home' });
        expect(onChange).toHaveBeenLastCalledWith('a');
        fireEvent.keyDown(activeTab, { key: 'End' });
        expect(onChange).toHaveBeenLastCalledWith('c');
    });

    it('a aba ativa tem tabIndex 0 e as demais -1 (roving tabindex)', () => {
        render(<SarakTabs tabs={tabs} activeTab="a" onChange={() => undefined} />);
        expect(screen.getByRole('tab', { name: 'A' })).toHaveAttribute('tabindex', '0');
        expect(screen.getByRole('tab', { name: 'C' })).toHaveAttribute('tabindex', '-1');
    });
});
