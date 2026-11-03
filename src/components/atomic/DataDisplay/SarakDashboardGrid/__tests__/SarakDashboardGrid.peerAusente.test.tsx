import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SarakDashboardGridImpl from '../SarakDashboardGridImpl';

vi.mock('react-grid-layout', () => ({ default: undefined }));

describe('SarakDashboardGrid sem o peer react-grid-layout', () => {
    it('mostra o fallback do peer opcional no lugar do painel', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        render(<SarakDashboardGridImpl widgets={[]} layout={[]} />);
        const alert = screen.getByRole('alert');
        expect(alert.getAttribute('data-sarak-optional-peer-missing')).toBe('true');
        expect(alert.textContent).toContain('react-grid-layout');
        warn.mockRestore();
    });
});
