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
import { useStructuralStyles } from '../hooks/useStructuralStyles';
import { twMerge } from 'tailwind-merge';
import { SarakButton } from '../Buttons';
import { useSecurityOrchestratorState } from './hooks/useSecurityOrchestratorState';
import api from '../../../shared/services/api';
import { SecurityOrchestratorStatus } from './components/SecurityOrchestratorStatus';
import { SecurityOrchestratorSetup } from './components/SecurityOrchestratorSetup';
import { SecurityOrchestratorDisable } from './components/SecurityOrchestratorDisable';

interface SarakSecurityOrchestratorProps {
    endpoint: string;
    label?: string;
    config?: Record<string, unknown>;
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
    const { step, mfaStatus, setupData, code, isValidating, error, setStep, setCode, fetchStatus, startSetup, handleEnable, handleDisable } = useSecurityOrchestratorState(endpoint);

    const { getContainerStyles, getFlexStyles } = useStructuralStyles();
    const layout = getContainerStyles();

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95 }
    };

    return (
        <div className={twMerge(`w-full max-w-2xl mx-auto bg-[var(--color-theme-card,#1e293b)] border-[var(--border-color,#334155)] overflow-hidden shadow-2xl`, layout.className)} style={layout.style}>
            {/* Header */}
            <div className="flex items-center border-b border-[var(--border-color,#334155)]" style={{ paddingBottom: 'var(--sarak-layout-gap-lg,24px)', marginBottom: 'calc(var(--sarak-layout-gap-md,16px) * 2)', gap: layout.style.gap }}>
                <div className="bg-[var(--sarak-primary-color,#3b82f6)]/10" style={{ borderRadius: 'calc(var(--sarak-border-radius-lg, 12px) * 0.75)', padding: 'var(--sarak-layout-gap-md,16px)' }}>
                    <Shield className="text-[var(--sarak-primary-color,#3b82f6)]" size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-black uppercase text-[var(--color-theme-title,#ffffff)]" style={{ letterSpacing: 'var(--sarak-tracking-tight, 0.2em)' }}>
                        {label || 'Orquestrador de Segurança'}
                    </h2>
                    <p className="text-2xs uppercase tracking-widest text-[var(--text-muted,#94a3b8)] font-bold">
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
                        className={twMerge(getFlexStyles('column', 'center', 'center').className, layout.className)}
                        style={{ padding: 'calc(var(--sarak-layout-gap-md,16px)*3) 0', gap: layout.style.gap }}
                    >
                        <RefreshCw className="animate-spin text-[var(--sarak-primary-color,#3b82f6)]" size={32} />
                        <span className="text-2xs uppercase font-black text-[var(--text-muted,#94a3b8)]" style={{ letterSpacing: 'var(--sarak-tracking-wide, 0.3em)' }}>Sincronizando Vault...</span>
                    </motion.div>
                )}

                {step === 'STATUS' && (
                    <SecurityOrchestratorStatus 
                        mfaStatus={mfaStatus}
                        containerVariants={containerVariants}
                        setStep={setStep as (step: string) => void}
                        startSetup={startSetup}
                    />
                )}

                {step === 'SETUP' && (
                    <SecurityOrchestratorSetup 
                        setupData={setupData}
                        qrSize={qrSize}
                        code={code}
                        setCode={setCode}
                        isValidating={isValidating}
                        error={error}
                        handleEnable={handleEnable}
                        containerVariants={containerVariants}
                        layout={layout}
                    />
                )}

                {step === 'DISABLE_CHALLENGE' && (
                    <SecurityOrchestratorDisable 
                        code={code}
                        setCode={setCode}
                        isValidating={isValidating}
                        error={error}
                        handleDisable={handleDisable}
                        setStep={setStep as (step: string) => void}
                        containerVariants={containerVariants}
                        layout={layout}
                    />
                )}

                {step === 'SUCCESS' && (
                    <motion.div 
                        key="success"
                        variants={containerVariants}
                        initial="hidden" animate="visible" exit="exit"
                        className={twMerge(getFlexStyles('column', 'center', 'center').className, "text-center", layout.className)}
                        style={{ padding: 'calc(var(--sarak-layout-gap-md,16px)*3) 0', gap: layout.style.gap }}
                    >
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/30">
                            <CheckCircle2 className="text-emerald-500" size={40} />
                        </div>
                        <div>
                            <div className="text-lg font-black uppercase text-[var(--color-theme-title,#ffffff)]" style={{ marginBottom: 'var(--sarak-layout-gap-sm,8px)', letterSpacing: 'var(--sarak-tracking-tight, 0.2em)' }}>Operação Concluída</div>
                            <p className="text-2xs uppercase tracking-widest text-[var(--text-muted,#94a3b8)] font-bold">
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
                        className={twMerge(getFlexStyles('column', 'center', 'center').className, "text-center", layout.className)}
                        style={{ padding: 'calc(var(--sarak-layout-gap-md,16px)*3) 0', gap: layout.style.gap }}
                    >
                        <ShieldAlert className="text-red-500" size={48} />
                        <div>
                            <div className="text-xs font-black uppercase tracking-widest text-red-500" style={{ marginBottom: 'var(--sarak-layout-gap-sm,8px)' }}>{error}</div>
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
