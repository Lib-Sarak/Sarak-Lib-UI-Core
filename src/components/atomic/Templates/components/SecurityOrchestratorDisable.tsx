import React from 'react';
import { motion, Variants } from 'framer-motion';
import { ShieldAlert, Key } from 'lucide-react';
import { SarakButton } from '../../Buttons';
import { SarakInput } from '../../Inputs';
import { twMerge } from 'tailwind-merge';
import { useStructuralStyles } from '../../hooks/useStructuralStyles';

interface SecurityOrchestratorDisableProps {
    code: string;
    setCode: (code: string) => void;
    isValidating: boolean;
    error: string | null;
    handleDisable: () => void;
    setStep: (step: 'STATUS' | 'SETUP' | 'DISABLE_CHALLENGE' | 'SUCCESS' | 'ERROR' | 'LOADING') => void;
    containerVariants: Variants;
    layout: { className: string; style: React.CSSProperties };
}

export const SecurityOrchestratorDisable: React.FC<SecurityOrchestratorDisableProps> = ({
    code,
    setCode,
    isValidating,
    error,
    handleDisable,
    setStep,
    containerVariants,
    layout
}) => {
    const { getFlexStyles, getGridStyles } = useStructuralStyles();

    return (
        <motion.div 
            key="disable"
            variants={containerVariants}
            initial="hidden" animate="visible" exit="exit"
            className={twMerge(getFlexStyles('column', 'center', 'center').className, "text-center", layout.className)}
            style={{ gap: layout.style.gap }}
        >
            <ShieldAlert className="text-red-500" size={48} />
            <div>
                <div className="text-xs font-black uppercase tracking-widest text-[var(--color-theme-title,#ffffff)]" style={{ marginBottom: 'var(--sarak-layout-gap-sm,8px)' }}>Confirmar Desativação</div>
                <p className="uppercase tracking-wider text-[var(--text-muted,#94a3b8)] max-w-xs" style={{ fontSize: 'var(--sarak-type-scale2xs, 10px)' }}>
                    Por segurança, insira o código de 6 dígitos do seu app para remover a proteção de segundo fator.
                </p>
            </div>

            <div className={`w-full max-w-xs ${getFlexStyles('column', 'flex-start', 'stretch', 'var(--sarak-layout-gap-md,16px)').className}`} style={getFlexStyles('column', 'flex-start', 'stretch', 'var(--sarak-layout-gap-md,16px)').style}>
                <SarakInput 
                    type="text" 
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    leftIcon={<Key size={16} />}
                    className="text-center text-xl font-black focus:border-red-500"
                    style={{ letterSpacing: 'var(--sarak-tracking-widest, 0.5em)' }}
                    fullWidth
                />

                {error && (
                    <div className="uppercase font-black text-red-500 tracking-widest" style={{ fontSize: 'var(--sarak-type-scale2xs, 10px)' }}>{error}</div>
                )}

                <div className={getGridStyles('repeat(2, minmax(0, 1fr))', undefined, 'var(--sarak-layout-gap-md,16px)').className} style={getGridStyles('repeat(2, minmax(0, 1fr))', undefined, 'var(--sarak-layout-gap-md,16px)').style}>
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
    );
};
