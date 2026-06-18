import React from 'react';
import { User, Lock, Eye, EyeOff, ShieldCheck, ChevronRight } from 'lucide-react';
import { SarakInput } from '../../Inputs';
import { SarakButton, SarakIconButton } from '../../Buttons';

interface AuthFormFieldsProps {
    mfaStep: boolean;
    isRegistering: boolean;
    username: string;
    setUsername: (val: string) => void;
    password?: string;
    setPassword?: (val: string) => void;
    mfaCode?: string;
    setMfaCode?: (val: string) => void;
    showPassword?: boolean;
    setShowPassword?: (val: boolean) => void;
    isPending?: boolean;
    setMfaStep: (val: boolean) => void;
    onForgot?: () => void;
}

export const AuthFormFields: React.FC<AuthFormFieldsProps> = ({
    mfaStep,
    isRegistering,
    username,
    setUsername,
    password,
    setPassword,
    mfaCode,
    setMfaCode,
    showPassword,
    setShowPassword,
    isPending,
    setMfaStep,
    onForgot
}) => {
    return (
        <>
            {!mfaStep ? (
                <>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-theme-muted uppercase tracking-widest ml-1">E-mail de Acesso</label>
                        <SarakInput
                            type="email"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="seu@email.com"
                            autoComplete="off"
                            leftIcon={<User className="h-5 w-5" />}
                            fullWidth
                        />
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between px-1">
                            <label className="text-xs font-bold text-theme-muted uppercase tracking-widest">Senha</label>
                            {!isRegistering && onForgot && (
                                <SarakButton 
                                    onClick={onForgot}
                                    variant="ghost"
                                    className="text-xs font-bold text-theme-primary px-0 py-0 h-auto hover:opacity-80"
                                >
                                    Esqueceu?
                                </SarakButton>
                            )}
                        </div>
                        <SarakInput
                            type={showPassword ? "text" : "password"}
                            required
                            value={password || ''}
                            onChange={(e) => setPassword?.(e.target.value)}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            leftIcon={<Lock className="h-5 w-5" />}
                            rightIcon={setShowPassword ? (
                                <SarakIconButton
                                    onClick={() => setShowPassword(!showPassword)}
                                    icon={showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    variant="ghost"
                                    className="text-[var(--sarak-input-icon-color,var(--sx-color-text-muted))] hover:text-theme-text px-1 py-1"
                                />
                            ) : undefined}
                            fullWidth
                        />
                    </div>
                </>
            ) : (
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-theme-muted uppercase tracking-widest ml-1">Código de Segurança</label>
                    <SarakInput
                        type="text"
                        required
                        maxLength={6}
                        value={mfaCode || ''}
                        onChange={(e) => setMfaCode?.(e.target.value.replace(/\D/g, ''))}
                        placeholder="000000"
                        autoFocus
                        className="text-center text-2xl tracking-[0.5em]"
                        leftIcon={<ShieldCheck className="h-5 w-5" />}
                        fullWidth
                    />
                    <SarakButton 
                        onClick={() => setMfaStep(false)}
                        variant="ghost"
                        className="text-xs font-bold text-theme-muted hover:text-theme-primary mt-2 px-0 h-auto"
                    >
                        ← Voltar para senha
                    </SarakButton>
                </div>
            )}

            <SarakButton
                type="submit"
                isLoading={isPending}
                variant="primary"
                fullWidth
                className="mt-4"
                rightIcon={!isPending ? <ChevronRight className="w-4 h-4" /> : undefined}
            >
                {mfaStep ? 'Confirmar Acesso' : (isRegistering ? 'Criar Minha Conta' : 'Acessar Sistema')}
            </SarakButton>
        </>
    );
};
