import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSecurityOrchestratorState } from '../useSecurityOrchestratorState';
import api from '../../../../../shared/services/api';

vi.mock('../../../../../shared/services/api', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
    }
}));

describe('useSecurityOrchestratorState characterization', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('initial fetchStatus sets mfaStatus and step to STATUS', async () => {
        (api.get as unknown as { mockResolvedValueOnce: (val: unknown) => void }).mockResolvedValueOnce({ data: { enabled: true } });
        
        const { result } = renderHook(() => useSecurityOrchestratorState('/api/security'));
        
        expect(result.current.step).toBe('LOADING');
        
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });
        
        expect(result.current.step).toBe('STATUS');
        expect(result.current.mfaStatus).toEqual({ enabled: true });
    });

    it('startSetup sets setupData and step to SETUP', async () => {
        (api.get as unknown as { mockResolvedValueOnce: (val: unknown) => void }).mockResolvedValueOnce({ data: {} }); // initial fetchStatus
        (api.get as unknown as { mockResolvedValueOnce: (val: unknown) => void }).mockResolvedValueOnce({ data: { qrCode: 'base64' } }); // startSetup
        
        const { result } = renderHook(() => useSecurityOrchestratorState('/api/security'));
        
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        await act(async () => {
            await result.current.startSetup();
        });
        
        expect(result.current.step).toBe('SETUP');
        expect(result.current.setupData).toEqual({ qrCode: 'base64' });
    });
});
