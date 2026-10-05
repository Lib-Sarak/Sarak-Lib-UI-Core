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
});
