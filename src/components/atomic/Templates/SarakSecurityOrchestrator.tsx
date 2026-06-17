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
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import api from '../../../shared/services/api';
import { SarakButton } from '../Buttons';
import { SarakInput } from '../Inputs';

interface SarakSecurityOrchestratorProps {
    endpoint: string;
    label?: string;
    config?: any;
    role?: 'primary' | 'secondary' | 'neutral' | 'accent';
    density?: 'compact' | 'standard' | 'spacious';
    importance?: 'hero' | 'base' | 'subtle';
}

/**
 * SarakSecurityOrchestrator (v7.5)
 * 
 * Componente especializado em fluxos de soberania de segurança.
 * Gerencia o ciclo de vida do MFA: Status, Setup e Ativação.
 */
export const SarakSecurityOrchestrator: React.FC<SarakSecurityOrchestratorProps> = ({ endpoint, label }) => {
    const { qrSize = 200 } = useSarakUI();
    const [step, setStep] = useState<'LOADING' | 'STATUS' | 'SETUP' | 'SUCCESS' | 'ERROR' | 'DISABLE_CHALLENGE'>('LOADING');
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
            setCode('');
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
            setTimeout(fetchStatus, 2000);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Código inválido ou expirado');
        } finally {
            setIsValidating(false);
        }
    };

    const handleDisable = async () => {
        if (code.length !== 6) return;
        try {
            setIsValidating(true);
            setError(null);
            await api.post(`${endpoint}/mfa/disable`, { code });
            setStep('SUCCESS');
            setTimeout(fetchStatus, 2000);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Falha ao desativar MFA');
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
        <div className="w-full max-w-2xl mx-auto bg-[var(--sx-color-surface-base)] border-[var(--sx-color-border-base)] overflow-hidden shadow-2xl" style={{ padding: 'var(--sx-spacing-md)', borderRadius: 'var(--sx-radius-lg)' }}>
            {/* Header */}
            <div className="flex items-center gap-4 mb-8 border-b border-[var(--sx-color-border-base)] pb-6">
                <div className="p-3 bg-[var(--sx-color-primary-base)]/10" style={{ borderRadius: 'calc(var(--sx-radius-lg) * 0.75)' }}>
                    <Shield className="text-[var(--sx-color-primary-base)]" size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-black uppercase tracking-[0.2em] text-[var(--sx-color-text-title)]">
                        {label || 'Orquestrador de Segurança'}
                    </h2>
                    <p className="text-2xs uppercase tracking-widest text-[var(--sx-color-text-muted)] font-bold">
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
                        <RefreshCw className="animate-spin text-[var(--sx-color-primary-base)]" size={32} />
                        <span className="text-2xs uppercase font-black tracking-[0.3em] text-[var(--sx-color-text-muted)]">Sincronizando Vault...</span>
                    </motion.div>
                )}

                {step === 'STATUS' && (
                    <motion.div 
                        key="status"
                        variants={containerVariants}
                        initial="hidden" animate="visible" exit="exit"
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between p-6 bg-[var(--sx-color-surface-base)]/40 border border-[var(--sx-color-border-base)] rounded-xl">
                            <div className="flex items-center gap-4">
                                {mfaStatus?.enabled ? (
                                    <ShieldCheck className="text-emerald-500" size={32} />
                                ) : (
                                    <ShieldAlert className="text-amber-500" size={32} />
                                )}
                                <div>
                                    <div className="text-xs font-black uppercase tracking-widest text-[var(--sx-color-text-title)]">Autenticação de Dois Fatores (2FA)</div>
                                    <div className="text-2xs uppercase tracking-widest font-bold opacity-50">
                                        Status: {mfaStatus?.enabled ? 'Ativo e Protegido' : 'Desativado'}
                                    </div>
                                </div>
                            </div>
                            
                            {mfaStatus?.enabled ? (
                                <SarakButton 
                                    onClick={() => setStep('DISABLE_CHALLENGE')}
                                    variant="danger"
                                >
                                    Desativar
                                </SarakButton>
                            ) : (
                                <SarakButton 
                                    onClick={startSetup}
                                    variant="primary"
                                >
                                    Configurar
                                </SarakButton>
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
                        <div className="text-xs font-black uppercase tracking-widest text-[var(--sx-color-text-title)]">Configuração de Segundo Fator</div>
                        
                        {/* QR Code Container */}
                        <div className="p-4 bg-white rounded-2xl shadow-xl border-4 border-[var(--sx-color-primary-base)]/20">
                            {setupData?.provisioning_uri ? (
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(setupData.provisioning_uri)}`}
                                    alt="MFA QR Code"
                                    style={{ width: 'var(--sarak-qr-size, 200px)', height: 'var(--sarak-qr-size, 200px)' }}
                                />
                            ) : (
                                <div 
                                    style={{ width: 'var(--sarak-qr-size, 200px)', height: 'var(--sarak-qr-size, 200px)' }}
                                    className="flex items-center justify-center bg-gray-100"
                                >
                                    <QrCode className="text-gray-300" size={48} />
                                </div>
                            )}
                        </div>

                        <div className="max-w-xs space-y-2">
                            <p className="text-[10px] uppercase tracking-wider text-[var(--sx-color-text-muted)] leading-tight">
                                Escaneie o código acima com seu app de autenticação (Google Authenticator, Authy, etc.) e insira o código de 6 dígitos abaixo.
                            </p>
                        </div>

                        <div className="w-full max-w-xs space-y-4">
                                <SarakInput 
                                    type="text" 
                                    maxLength={6}
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                    placeholder="000000"
                                    leftIcon={<Key size={16} />}
                                    className="text-center text-xl font-black tracking-[0.5em]"
                                    fullWidth
                                />

                            {error && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] uppercase font-black text-red-500 tracking-widest">
                                    {error}
                                </motion.div>
                            )}

                            <SarakButton 
                                onClick={handleEnable}
                                disabled={code.length !== 6 || isValidating}
                                variant="primary"
                                fullWidth
                                className="py-4 shadow-xl shadow-[var(--sx-color-primary-base)]/20"
                            >
                                {isValidating ? 'Validando...' : 'Ativar Proteção'}
                            </SarakButton>
                        </div>
                    </motion.div>
                )}

                {step === 'DISABLE_CHALLENGE' && (
                    <motion.div 
                        key="disable"
                        variants={containerVariants}
                        initial="hidden" animate="visible" exit="exit"
                        className="flex flex-col items-center text-center gap-6"
                    >
                        <ShieldAlert className="text-red-500" size={48} />
                        <div>
                            <div className="text-xs font-black uppercase tracking-widest text-[var(--sx-color-text-title)] mb-2">Confirmar Desativação</div>
                            <p className="text-[10px] uppercase tracking-wider text-[var(--sx-color-text-muted)] max-w-xs">
                                Por segurança, insira o código de 6 dígitos do seu app para remover a proteção de segundo fator.
                            </p>
                        </div>

                        <div className="w-full max-w-xs space-y-4">
                                <SarakInput 
                                    type="text" 
                                    maxLength={6}
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                    placeholder="000000"
                                    leftIcon={<Key size={16} />}
                                    className="text-center text-xl font-black tracking-[0.5em] focus:border-red-500"
                                    fullWidth
                                />

                            {error && (
                                <div className="text-[10px] uppercase font-black text-red-500 tracking-widest">{error}</div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <SarakButton 
                                    onClick={() => setStep('STATUS')}
                                    variant="secondary"
                                >
                                    Cancelar
                                </SarakButton>
                                <SarakButton 
                                    onClick={handleDisable}
                                    disabled={code.length !== 6 || isValidating}
                                    variant="danger"
                                >
                                    {isValidating ? 'Processando...' : 'Confirmar'}
                                </SarakButton>
                            </div>
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
                            <div className="text-lg font-black uppercase tracking-[0.2em] text-[var(--sx-color-text-title)] mb-2">Operação Concluída</div>
                            <p className="text-2xs uppercase tracking-widest text-[var(--sx-color-text-muted)] font-bold">
                                O cofre de segurança foi atualizado com sucesso.
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
                            <SarakButton 
                                onClick={fetchStatus}
                                variant="secondary"
                            >
                                Tentar Novamente
                            </SarakButton>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
