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
                <div className="text-xs font-black uppercase tracking-widest text-[var(--sx-color-text-title)]" style={{ marginBottom: 'var(--sx-spacing-sm)' }}>Confirmar Desativação</div>
                <p className="text-[10px] uppercase tracking-wider text-[var(--sx-color-text-muted)] max-w-xs">
                    Por segurança, insira o código de 6 dígitos do seu app para remover a proteção de segundo fator.
                </p>
            </div>

            <div className={`w-full max-w-xs ${getFlexStyles('column', 'flex-start', 'stretch', 'var(--sx-spacing-md)').className}`} style={getFlexStyles('column', 'flex-start', 'stretch', 'var(--sx-spacing-md)').style}>
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

                <div className={getGridStyles('repeat(2, minmax(0, 1fr))', undefined, 'var(--sx-spacing-md)').className} style={getGridStyles('repeat(2, minmax(0, 1fr))', undefined, 'var(--sx-spacing-md)').style}>
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
