import React from 'react';
import { motion, Variants } from 'framer-motion';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';
import { SarakButton } from '../../Buttons';
import { useStructuralStyles } from '../../hooks/useStructuralStyles';

interface SecurityOrchestratorStatusProps {
    mfaStatus: Record<string, unknown> | null;
    containerVariants: Variants;
    setStep: (step: 'STATUS' | 'SETUP' | 'DISABLE_CHALLENGE' | 'SUCCESS' | 'ERROR' | 'LOADING') => void;
    startSetup: () => void;
}

export const SecurityOrchestratorStatus: React.FC<SecurityOrchestratorStatusProps> = ({
    mfaStatus,
    containerVariants,
    setStep,
    startSetup
}) => {
    const { getFlexStyles } = useStructuralStyles();

    return (
        <motion.div 
            key="status"
            variants={containerVariants}
            initial="hidden" animate="visible" exit="exit"
            className={getFlexStyles('column', 'flex-start', 'stretch', 'var(--sarak-layout-gap-lg,24px)').className}
            style={getFlexStyles('column', 'flex-start', 'stretch', 'var(--sarak-layout-gap-lg,24px)').style}
        >
            <div className="flex items-center justify-between bg-[var(--color-theme-card,#1e293b)]/40 border border-[var(--border-color,#334155)] rounded-xl" style={{ padding: 'var(--sarak-layout-gap-lg,24px)' }}>
                <div className="flex items-center" style={{ gap: 'var(--sarak-layout-gap-md,16px)' }}>
                    {mfaStatus?.enabled ? (
                        <ShieldCheck className="text-emerald-500" size={32} />
                    ) : (
                        <ShieldAlert className="text-amber-500" size={32} />
                    )}
                    <div>
                        <div className="text-xs font-black uppercase tracking-widest text-[var(--color-theme-title,#ffffff)]">Autenticação de Dois Fatores (2FA)</div>
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

            <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 flex" style={{ padding: 'var(--sarak-layout-gap-md,16px)', gap: 'var(--sarak-layout-gap-sm,8px)' }}>
                <AlertTriangle className="text-amber-500 shrink-0" size={16} />
                <p className="text-amber-500/80 uppercase leading-relaxed font-medium" style={{ fontSize: 'var(--sarak-type-scale2xs, 10px)' }}>
                    A segurança do seu ecossistema depende de uma identidade forte. Recomendamos manter o MFA ativo em todos os módulos Sarak.
                </p>
            </div>
        </motion.div>
    );
};
