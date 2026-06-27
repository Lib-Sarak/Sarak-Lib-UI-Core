import { useState, useCallback, useEffect } from 'react';
import api from '../../../../shared/services/api';

type StepType = 'LOADING' | 'STATUS' | 'SETUP' | 'SUCCESS' | 'ERROR' | 'DISABLE_CHALLENGE';

export type MfaStatus = Record<string, unknown>;
export type SetupData = Record<string, unknown>;

export const useSecurityOrchestratorState = (endpoint: string) => {
    const [state, setState] = useState({
        step: 'LOADING' as StepType,
        mfaStatus: null as MfaStatus | null,
        setupData: null as SetupData | null,
        code: '',
        isValidating: false,
        error: null as string | null,
    });

    const setStep = useCallback((step: StepType) => setState(p => ({ ...p, step })), []);
    const setCode = useCallback((code: string) => setState(p => ({ ...p, code })), []);

    const fetchStatus = useCallback(async () => {
        try {
            setState(p => ({ ...p, step: 'LOADING' }));
            const response = await api.get(`${endpoint}/mfa/status`);
            setState(p => ({ ...p, mfaStatus: response.data, step: 'STATUS', code: '' }));
        } catch (err: unknown) {
            console.error('[SecurityOrchestrator] Status Error:', err);
            setState(p => ({ ...p, error: 'Falha ao verificar status de segurança', step: 'ERROR' }));
        }
    }, [endpoint]);

    const startSetup = useCallback(async () => {
        try {
            setState(p => ({ ...p, isValidating: true }));
            const response = await api.get(`${endpoint}/mfa/setup`);
            setState(p => ({ ...p, setupData: response.data, step: 'SETUP', isValidating: false }));
        } catch (err: unknown) {
            console.error(err);
            setState(p => ({ ...p, error: 'Erro ao iniciar configuração de MFA', isValidating: false }));
        }
    }, [endpoint]);

    const handleEnable = useCallback(async () => {
        if (state.code.length !== 6) return;
        try {
            setState(p => ({ ...p, isValidating: true, error: null }));
            await api.post(`${endpoint}/mfa/enable`, { code: state.code });
            setState(p => ({ ...p, step: 'SUCCESS', isValidating: false }));
            setTimeout(fetchStatus, 2000);
        } catch (err: unknown) {
            const errorMsg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Código inválido ou expirado';
            setState(p => ({ ...p, error: errorMsg, isValidating: false }));
        }
    }, [endpoint, state.code, fetchStatus]);

    const handleDisable = useCallback(async () => {
        if (state.code.length !== 6) return;
        try {
            setState(p => ({ ...p, isValidating: true, error: null }));
            await api.post(`${endpoint}/mfa/disable`, { code: state.code });
            setState(p => ({ ...p, step: 'SUCCESS', isValidating: false }));
            setTimeout(fetchStatus, 2000);
        } catch (err: unknown) {
            const errorMsg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Falha ao desativar MFA';
            setState(p => ({ ...p, error: errorMsg, isValidating: false }));
        }
    }, [endpoint, state.code, fetchStatus]);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    return {
        ...state,
        setStep,
        setCode,
        fetchStatus,
        startSetup,
        handleEnable,
        handleDisable
    };
};
