import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SarakSplitPane } from '../SarakSplitPane';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

describe('SarakSplitPane', () => {
    it('should render left and right panes', () => {
        render(
            <SarakUIProvider>
                <SarakSplitPane 
                    leftPane={<div data-testid="left-pane">Left Content</div>}
                    rightPane={<div data-testid="right-pane">Right Content</div>}
                />
            </SarakUIProvider>
        );

        expect(screen.getByTestId('left-pane')).toBeInTheDocument();
        expect(screen.getByTestId('right-pane')).toBeInTheDocument();
    });

    it('should contain a resizer element', () => {
        render(
            <SarakUIProvider>
                <SarakSplitPane 
                    leftPane={<div>Left Content</div>}
                    rightPane={<div>Right Content</div>}
                />
            </SarakUIProvider>
        );

        // O divisor tem a classe cursor-col-resize
        const resizers = document.querySelectorAll('.cursor-col-resize');
        expect(resizers.length).toBeGreaterThan(0);
    });
});
