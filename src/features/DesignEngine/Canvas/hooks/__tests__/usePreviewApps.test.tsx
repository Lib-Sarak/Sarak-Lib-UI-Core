import { fireEvent, render, renderHook, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { usePreviewApps } from '../usePreviewApps';

describe('usePreviewApps', () => {
    it('registra a tela Mais telas e encaminha uma escolha', () => {
        const selectPreviewApp = vi.fn();
        const { result } = renderHook(() => usePreviewApps({}, {}, 'standard', selectPreviewApp));

        expect(result.current['more-screens']).toBeDefined();
        render(result.current['more-screens']);
        fireEvent.click(screen.getByRole('button', { name: 'Matriz' }));
        expect(selectPreviewApp).toHaveBeenCalledWith('matrix');
    });
});
