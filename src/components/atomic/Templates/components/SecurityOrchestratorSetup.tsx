import React from 'react';
import { motion, Variants } from 'framer-motion';
import { QrCode, Key } from 'lucide-react';
import { SarakButton } from '../../Buttons';
import { SarakInput } from '../../Inputs';
import { twMerge } from 'tailwind-merge';

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
    return (
        <motion.div 
            key="setup"
            variants={containerVariants}
            initial="hidden" animate="visible" exit="exit"
            className={twMerge("flex flex-col items-center text-center", layout.className)}
            style={{ gap: layout.style.gap }}
        >
            <div className="text-xs font-black uppercase tracking-widest text-[var(--sx-color-text-title)]">Configuração de Segundo Fator</div>
            
            <div className="p-4 bg-white rounded-2xl shadow-xl border-4 border-[var(--sx-color-primary-base)]/20">
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
    );
};
