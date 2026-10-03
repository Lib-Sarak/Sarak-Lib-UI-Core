import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import SarakUIProvider from '../../../../core/Provider/SarakUIProvider';
import { ChromeCollapseToggle } from '../ChromeCollapseToggle';

// `SarakIcon` lê `useSarakUI` (mandatório) — exige o Provider.
const renderToggle = (ui: React.ReactElement) => render(<SarakUIProvider>{ui}</SarakUIProvider>);

describe('ChromeCollapseToggle', () => {
    it('collapsed=false: rótulo "Recolher navegação" e ícone de sidebar (ChevronLeft)', () => {
        const { container } = renderToggle(<ChromeCollapseToggle orientation="sidebar" collapsed={false} onToggle={vi.fn()} />);
        expect(screen.getByLabelText('Recolher navegação')).toBeInTheDocument();
        expect(container.querySelector('[data-sarak-widget="collapse"]')).not.toBeNull();
    });

    it('collapsed=true: rótulo vira "Expandir navegação"', () => {
        renderToggle(<ChromeCollapseToggle orientation="sidebar" collapsed onToggle={vi.fn()} />);
        expect(screen.getByLabelText('Expandir navegação')).toBeInTheDocument();
    });

    it('clique dispara onToggle', () => {
        const onToggle = vi.fn();
        renderToggle(<ChromeCollapseToggle orientation="topbar" collapsed={false} onToggle={onToggle} />);
        fireEvent.click(screen.getByLabelText('Recolher navegação'));
        expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('é um <button> nativo (focável por teclado)', () => {
        renderToggle(<ChromeCollapseToggle orientation="sidebar" collapsed={false} onToggle={vi.fn()} />);
        expect(screen.getByLabelText('Recolher navegação').tagName).toBe('BUTTON');
    });
});
