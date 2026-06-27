import React from 'react';
import { motion, Variants } from 'framer-motion';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';
import { SarakButton } from '../../Buttons';

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
    return (
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
    );
};
