import React, { useCallback, useState } from 'react';
import { AuthHero } from './components/AuthHero';
import { AuthForm } from './components/AuthForm';

/**
 * Evento estruturado emitido por `onChange` (Spec 20) — o canal declarativo único
 * do template. A Engine injeta `onChange` quando o nó tem `actions` no manifesto
 * (mesmo mecanismo do `SarakShellNav.onChange`: LeafNode wire genérico) e o valor
 * emitido vira `{{$event}}` para a cadeia (ex.: `api_call` com `params: "{{$event}}"`).
 */
export interface SarakAuthScreenEvent {
    intent: 'submit' | 'social' | 'forgot' | 'masterLogin' | 'toggleRegister' | 'backToPassword';
    username?: string;
    password?: string;
    mfaCode?: string;
    isRegistering?: boolean;
    provider?: string;
}

export interface SarakAuthScreenProps {
    branding?: {
        name: string;
        logo?: string;
    };
    isRegistering?: boolean;
    setIsRegistering?: (val: boolean) => void;
    mfaStep?: boolean;
    setMfaStep?: (val: boolean) => void;
    username?: string;
    setUsername?: (val: string) => void;
    password?: string;
    setPassword?: (val: string) => void;
    mfaCode?: string;
    setMfaCode?: (val: string) => void;
    showPassword?: boolean;
    setShowPassword?: (val: boolean) => void;
    error?: string;
    isPending?: boolean;
    onSubmit?: (e: React.FormEvent) => void;
    onSocialLogin?: (provider: string) => void;
    socialConfig?: {
        enabled: boolean;
        display: 'compact' | 'full';
        providers: Array<{ id: string; variant: 'glass' | 'sovereign' }>;
    };
    onForgot?: () => void;
    onMasterLogin?: () => void;
    /** Canal declarativo único — ver `SarakAuthScreenEvent`. Dispara em toda interação de negócio. */
    onChange?: (event: SarakAuthScreenEvent) => void;
    role?: 'primary' | 'secondary' | 'neutral' | 'accent';
    density?: 'compact' | 'standard' | 'spacious';
    importance?: 'hero' | 'base' | 'subtle';
}

/**
 * Controlado se o host passar `value`+`setValue`; senão o componente guarda o próprio
 * estado. Nenhum campo exige o par via JSON (que não carrega função) — é o que torna
 * TODOS os campos opcionais (Spec 20, Regra 2.1: "sem nenhum callback imperativo
 * obrigatório").
 */
function useControllableState<T>(
    value: T | undefined,
    setValue: ((next: T) => void) | undefined,
    initial: T,
): [T, (next: T) => void] {
    const [internal, setInternal] = useState<T>(initial);
    const resolved = value !== undefined ? value : internal;
    const set = useCallback(
        (next: T) => {
            setInternal(next);
            setValue?.(next);
        },
        [setValue],
    );
    return [resolved, set];
}

/**
 * SarakAuthScreen (Industrial Template v10 — Spec 20)
 *
 * Template soberano para fluxos de autenticação. Autocontido por padrão: campos e
 * alternância de modo vivem em estado interno quando o host não os controla; o único
 * canal que o host PRECISA injetar é `onChange` (ou os callbacks imperativos
 * individuais, para uso direto em TSX) para saber o que aconteceu. A lib nunca decide
 * onde o token vive nem chama rede — só entrega o evento (receita canônica de sessão:
 * Spec 08 §6.2-b).
 */
export const SarakAuthScreen: React.FC<SarakAuthScreenProps> = (props) => {
    const [isRegistering, setIsRegistering] = useControllableState(props.isRegistering, props.setIsRegistering, false);
    const [mfaStep, setMfaStep] = useControllableState(props.mfaStep, props.setMfaStep, false);
    const [username, setUsername] = useControllableState(props.username, props.setUsername, '');
    const [password, setPassword] = useControllableState(props.password, props.setPassword, '');
    const [mfaCode, setMfaCode] = useControllableState(props.mfaCode, props.setMfaCode, '');
    const [showPassword, setShowPassword] = useControllableState(props.showPassword, props.setShowPassword, false);

    const emit = (event: SarakAuthScreenEvent): void => props.onChange?.(event);

    const handleSubmit = (e: React.FormEvent): void => {
        e.preventDefault();
        props.onSubmit?.(e);
        emit({
            intent: 'submit',
            username,
            password: mfaStep ? undefined : password,
            mfaCode: mfaStep ? mfaCode : undefined,
            isRegistering,
        });
    };

    const handleSocialLogin = (provider: string): void => {
        props.onSocialLogin?.(provider);
        emit({ intent: 'social', provider });
    };

    // "Esqueceu?"/"Master" só aparecem se o host se importa com o evento — TSX direto
    // (props.onForgot/onMasterLogin) OU manifesto (props.onChange). Preserva o
    // comportamento visual original (botão ausente quando ninguém reage a ele).
    const handleForgot = (props.onForgot || props.onChange)
        ? (): void => {
              props.onForgot?.();
              emit({ intent: 'forgot', username });
          }
        : undefined;

    const handleMasterLogin = (props.onMasterLogin || props.onChange)
        ? (): void => {
              props.onMasterLogin?.();
              emit({ intent: 'masterLogin' });
          }
        : undefined;

    const handleSetIsRegistering = (next: boolean): void => {
        setIsRegistering(next);
        emit({ intent: 'toggleRegister', isRegistering: next });
    };

    const handleSetMfaStep = (next: boolean): void => {
        setMfaStep(next);
        if (!next) emit({ intent: 'backToPassword' });
    };

    // plan-41: `@container` plantado na raiz — `AuthSocialLogin` (dentro de `AuthForm`)
    // usa `getGridStyles`, cuja classe `@min-[…]` (container query) precisa de um
    // ancestral com `container-type` para casar (achado real em consumidor, `plan-40`).
    return (
        <div className="@container min-h-screen w-full flex bg-theme-body text-theme-text selection:bg-theme-primary/30 font-sans overflow-hidden">
            <AuthHero branding={props.branding} />
            <AuthForm
                branding={props.branding}
                isRegistering={isRegistering}
                setIsRegistering={handleSetIsRegistering}
                mfaStep={mfaStep}
                setMfaStep={handleSetMfaStep}
                username={username}
                setUsername={setUsername}
                password={password}
                setPassword={setPassword}
                mfaCode={mfaCode}
                setMfaCode={setMfaCode}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                error={props.error}
                isPending={props.isPending}
                onSubmit={handleSubmit}
                onSocialLogin={handleSocialLogin}
                socialConfig={props.socialConfig}
                onForgot={handleForgot}
                onMasterLogin={handleMasterLogin}
            />
        </div>
    );
};
