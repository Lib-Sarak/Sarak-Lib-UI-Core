import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Shield, 
    ShieldCheck, 
    ShieldAlert, 
    Key, 
    RefreshCw, 
    QrCode,
    CheckCircle2,
    AlertTriangle
} from 'lucide-react';
import api from '../../../shared/services/api';

interface SarakSecurityOrchestratorProps {
    endpoint: string;
    label?: string;
    config?: any;
}

/**
 * SarakSecurityOrchestrator (v7.5)
 * 
 * Componente especializado em fluxos de soberania de segurança.
 * Gerencia o ciclo de vida do MFA: Status, Setup e Ativação.
 */
export const SarakSecurityOrchestrator: React.FC<SarakSecurityOrchestratorProps> = ({ endpoint, label }) => {
    const [step, setStep] = useState<'LOADING' | 'STATUS' | 'SETUP' | 'SUCCESS' | 'ERROR'>('LOADING');
    const [mfaStatus, setMfaStatus] = useState<any>(null);
    const [setupData, setSetupData] = useState<any>(null);
    const [code, setCode] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStatus = async () => {
        try {
            setStep('LOADING');
            const response = await api.get(`${endpoint}/mfa/status`);
            setMfaStatus(response.data);
            setStep('STATUS');
        } catch (err: any) {
            console.error('[SecurityOrchestrator] Status Error:', err);
            setError('Falha ao verificar status de segurança');
            setStep('ERROR');
        }
    };

    const startSetup = async () => {
        try {
            setIsValidating(true);
            const response = await api.get(`${endpoint}/mfa/setup`);
            setSetupData(response.data);
            setStep('SETUP');
        } catch (err: any) {
            setError('Erro ao iniciar configuração de MFA');
        } finally {
            setIsValidating(false);
        }
    };

    const handleEnable = async () => {
        if (code.length !== 6) return;
        try {
            setIsValidating(true);
            setError(null);
            await api.post(`${endpoint}/mfa/enable`, { code });
            setStep('SUCCESS');
            // Refresh status after a short delay
            setTimeout(fetchStatus, 2000);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Código inválido ou expirado');
        } finally {
            setIsValidating(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, [endpoint]);

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95 }
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-theme-card border-theme rounded-theme overflow-hidden shadow-2xl" style={{ padding: 'var(--theme-pad)' }}>
            {/* Header */}
            <div className="flex items-center gap-4 mb-8 border-b border-[var(--theme-border)] pb-6">
                <div className="p-3 bg-[var(--theme-primary)]/10 rounded-xl">
                    <Shield className="text-[var(--theme-primary)]" size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-black uppercase tracking-[0.2em] text-[var(--theme-title)]">
                        {label || 'Orquestrador de Segurança'}
                    </h2>
                    <p className="text-2xs uppercase tracking-widest text-[var(--theme-muted)] font-bold">
                        Gestão de Identidade e Autenticação Multifator
                    </p>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {step === 'LOADING' && (
                    <motion.div 
                        key="loading"
                        variants={containerVariants}
                        initial="hidden" animate="visible" exit="exit"
                        className="flex flex-col items-center justify-center py-12 gap-4"
                    >
                        <RefreshCw className="animate-spin text-[var(--theme-primary)]" size={32} />
                        <span className="text-2xs uppercase font-black tracking-[0.3em] text-[var(--theme-muted)]">Sincronizando Vault...</span>
                    </motion.div>
                )}

                {step === 'STATUS' && (
                    <motion.div 
                        key="status"
                        variants={containerVariants}
                        initial="hidden" animate="visible" exit="exit"
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between p-6 bg-white/[0.02] border border-[var(--theme-border)] rounded-xl">
                            <div className="flex items-center gap-4">
                                {mfaStatus?.enabled ? (
                                    <ShieldCheck className="text-emerald-500" size={32} />
                                ) : (
                                    <ShieldAlert className="text-amber-500" size={32} />
                                )}
                                <div>
                                    <div className="text-xs font-black uppercase tracking-widest text-[var(--theme-title)]">Autenticação de Dois Fatores (2FA)</div>
                                    <div className="text-2xs uppercase tracking-widest font-bold opacity-50">
                                        Status: {mfaStatus?.enabled ? 'Ativo e Protegido' : 'Desativado'}
                                    </div>
                                </div>
                            </div>
                            
                            {!mfaStatus?.enabled && (
                                <button 
                                    onClick={startSetup}
                                    className="px-6 py-2 bg-[var(--theme-primary)] text-white text-2xs font-black uppercase tracking-widest rounded-lg shadow-lg shadow-[var(--theme-primary)]/20 hover:brightness-110 transition-all"
                                >
                                    Configurar
                                </button>
                            )}
                        </div>

                        <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20 flex gap-3">
                            <AlertTriangle className="text-amber-500 shrink-0" size={16} />
                            <p className="text-[10px] text-amber-500/80 uppercase leading-relaxed font-medium">
                                A segurança do seu ecossistema depende de uma identidade forte. Recomendamos manter o MFA ativo em todos os módulos Sarak.
                            </p>
                        </div>
                    </motion.div>
                )}

                {step === 'SETUP' && (
                    <motion.div 
                        key="setup"
                        variants={containerVariants}
                        initial="hidden" animate="visible" exit="exit"
                        className="flex flex-col items-center text-center gap-6"
                    >
                        <div className="text-xs font-black uppercase tracking-widest text-[var(--theme-title)]">Configuração de Segundo Fator</div>
                        
                        {/* QR Code Container */}
                        <div className="p-4 bg-white rounded-2xl shadow-xl border-4 border-[var(--theme-primary)]/20">
                            {setupData?.provisioning_uri ? (
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(setupData.provisioning_uri)}`}
                                    alt="MFA QR Code"
                                    className="w-48 h-48"
                                />
                            ) : (
                                <div className="w-48 h-48 flex items-center justify-center bg-gray-100">
                                    <QrCode className="text-gray-300" size={48} />
                                </div>
                            )}
                        </div>

                        <div className="max-w-xs space-y-2">
                            <p className="text-[10px] uppercase tracking-wider text-[var(--theme-muted)] leading-tight">
                                Escaneie o código acima com seu app de autenticação (Google Authenticator, Authy, etc.) e insira o código de 6 dígitos abaixo.
                            </p>
                        </div>

                        <div className="w-full max-w-xs space-y-4">
                            <div className="relative">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--theme-muted)]" size={16} />
                                <input 
                                    type="text" 
                                    maxLength={6}
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                    placeholder="000000"
                                    className="w-full bg-white/[0.03] border border-[var(--theme-border)] rounded-xl py-4 px-12 text-center text-xl font-black tracking-[0.5em] text-[var(--theme-title)] focus:outline-none focus:border-[var(--theme-primary)] transition-all"
                                />
                            </div>

                            {error && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] uppercase font-black text-red-500 tracking-widest">
                                    {error}
                                </motion.div>
                            )}

                            <button 
                                onClick={handleEnable}
                                disabled={code.length !== 6 || isValidating}
                                className="w-full py-4 bg-[var(--theme-primary)] text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-[var(--theme-primary)]/20 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isValidating ? 'Validando...' : 'Ativar Proteção'}
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 'SUCCESS' && (
                    <motion.div 
                        key="success"
                        variants={containerVariants}
                        initial="hidden" animate="visible" exit="exit"
                        className="flex flex-col items-center justify-center py-12 gap-6 text-center"
                    >
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/30">
                            <CheckCircle2 className="text-emerald-500" size={40} />
                        </div>
                        <div>
                            <div className="text-lg font-black uppercase tracking-[0.2em] text-[var(--theme-title)] mb-2">Sucesso na Ativação</div>
                            <p className="text-2xs uppercase tracking-widest text-[var(--theme-muted)] font-bold">
                                Sua conta agora possui uma camada adicional de soberania.
                            </p>
                        </div>
                    </motion.div>
                )}

                {step === 'ERROR' && (
                    <motion.div 
                        key="error"
                        variants={containerVariants}
                        initial="hidden" animate="visible" exit="exit"
                        className="flex flex-col items-center justify-center py-12 gap-6 text-center"
                    >
                        <ShieldAlert className="text-red-500" size={48} />
                        <div>
                            <div className="text-xs font-black uppercase tracking-widest text-red-500 mb-2">{error}</div>
                            <button 
                                onClick={fetchStatus}
                                className="px-6 py-2 border border-[var(--theme-border)] text-[var(--theme-title)] text-2xs font-black uppercase tracking-widest rounded-lg hover:bg-white/5 transition-all"
                            >
                                Tentar Novamente
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
