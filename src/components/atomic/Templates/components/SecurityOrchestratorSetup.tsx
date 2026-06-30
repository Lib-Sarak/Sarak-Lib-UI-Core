import React from 'react';
import { motion, Variants } from 'framer-motion';
import { QrCode, Key } from 'lucide-react';
import { SarakButton } from '../../Buttons';
import { SarakInput } from '../../Inputs';
import { twMerge } from 'tailwind-merge';
import { useStructuralStyles } from '../../hooks/useStructuralStyles';

interface SecurityOrchestratorSetupProps {
    setupData: Record<string, unknown> | null;
    qrSize: number;
    code: string;
    setCode: (code: string) => void;
    isValidating: boolean;
    error: string | null;
    handleEnable: () => void;
    containerVariants: Variants;
    layout: { className: string; style: React.CSSProperties };
}

export const SecurityOrchestratorSetup: React.FC<SecurityOrchestratorSetupProps> = ({
    setupData,
    qrSize,
    code,
    setCode,
    isValidating,
    error,
    handleEnable,
    containerVariants,
    layout
}) => {
    const { getFlexStyles } = useStructuralStyles();

    return (
        <motion.div 
            key="setup"
            variants={containerVariants}
            initial="hidden" animate="visible" exit="exit"
            className={twMerge(getFlexStyles('column', 'center', 'center').className, "text-center", layout.className)}
            style={{ gap: layout.style.gap }}
        >
            <div className="text-xs font-black uppercase tracking-widest text-[var(--sx-color-text-title)]">Configuração de Segundo Fator</div>
            
            <div className="bg-white rounded-2xl shadow-xl border-4 border-[var(--sx-color-primary-base)]/20" style={{ padding: 'var(--sx-spacing-md)' }}>
                {setupData?.provisioning_uri ? (
                    <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(String(setupData.provisioning_uri || ''))}`}
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

            <div className={`max-w-xs ${getFlexStyles('column', 'flex-start', 'stretch', 'var(--sx-spacing-sm)').className}`} style={getFlexStyles('column', 'flex-start', 'stretch', 'var(--sx-spacing-sm)').style}>
                <p className="text-[10px] uppercase tracking-wider text-[var(--sx-color-text-muted)] leading-tight">
                    Escaneie o código acima com seu app de autenticação (Google Authenticator, Authy, etc.) e insira o código de 6 dígitos abaixo.
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
                    className="shadow-xl shadow-[var(--sx-color-primary-base)]/20"
                    style={{ paddingTop: 'var(--sx-spacing-md)', paddingBottom: 'var(--sx-spacing-md)' }}
                >
                    {isValidating ? 'Validando...' : 'Ativar Proteção'}
                </SarakButton>
            </div>
        </motion.div>
    );
};
