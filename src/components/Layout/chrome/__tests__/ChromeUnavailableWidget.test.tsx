import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';
import { ChromeUnavailableWidget } from '../ChromeUnavailableWidget';

describe('ChromeUnavailableWidget', () => {
    it('expõe o estado desabilitado e não executa uma ação', () => {
        render(
            <ChromeUnavailableWidget
                label="Conecte o widget"
                icon={<span aria-hidden="true">i</span>}
                variant="vertical"
            />,
        );

        const widget = screen.getByRole('button', { name: 'Conecte o widget' });
        expect(widget).toHaveAttribute('aria-disabled', 'true');
        expect(widget.onclick).toBeNull();
        fireEvent.click(widget);
        expect(widget).toHaveAttribute('aria-disabled', 'true');
    });

    it('na barra de topo o rótulo cede o lugar à navegação abaixo do breakpoint 2xl (fica o ícone e o aria-label); na lateral ele sempre aparece', () => {
        const icon = <span aria-hidden="true">i</span>;
        const { rerender } = render(<ChromeUnavailableWidget label="Conecte o widget" icon={icon} variant="horizontal" />);
        const horizontal = screen.getByRole('button', { name: 'Conecte o widget' });
        expect(horizontal.querySelector('span:not([aria-hidden])')!.className).toContain('hidden 2xl:inline');
        rerender(<ChromeUnavailableWidget label="Conecte o widget" icon={icon} variant="vertical" />);
        const vertical = screen.getByRole('button', { name: 'Conecte o widget' });
        expect(vertical.querySelector('span:not([aria-hidden])')!.className).not.toContain('hidden');
    });
});
