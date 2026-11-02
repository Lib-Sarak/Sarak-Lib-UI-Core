import React, { useMemo } from 'react';
import { SarakDesignScope } from '../../../../core/Design/components/DesignScope';
import type { SarakDesignState } from '../../../../core/Provider/types';
import { LazyWhenVisible } from './LazyWhenVisible';

interface SampleScopeProps {
    /** O rascunho atual: a amostra é a opção aplicada POR CIMA dele. */
    draft?: Partial<SarakDesignState>;
    /** Os tokens da opção. */
    tokens: Partial<SarakDesignState>;
    /** O modo do rascunho: a amostra segue ele, nunca um tema escuro fixo. */
    mode: 'light' | 'dark';
    /** Sem fundo próprio: a amostra aparece sobre o que estiver atrás (a atmosfera). */
    transparent?: boolean;
    className?: string;
    /** Classes do espaço reservado; `absolute inset-0` faz a amostra ocupar o tile inteiro. */
    slotClassName?: string;
    /** Variáveis extras só da amostra (por exemplo a opacidade de uma textura), que NÃO vão ao que se aplica ao clicar. */
    style?: React.CSSProperties;
    /** Atributos do escopo, como `data-sx-texture`. */
    scopeProps?: Record<string, string | undefined>;
    children: React.ReactNode;
}

/** As cores vêm das variáveis do ESCOPO: `text-theme-*` e `bg-theme-*` leem a variável do `@theme`, resolvida em `:root`, e não mudam dentro dele. */
const SCOPE_INK: React.CSSProperties = { color: 'var(--sarak-text-main)' };

/** O escopo de uma amostra: rascunho + opção + modo, desenhado só quando entra na área visível. */
export const SampleScope: React.FC<SampleScopeProps> = ({ draft, tokens, mode, transparent = false, className = '', slotClassName = 'min-h-48', style, scopeProps, children }) => {
    const design = useMemo(
        () => ({ ...draft, ...tokens, mode, globalBackgroundImageUrl: undefined }) as SarakDesignState,
        [draft, tokens, mode],
    );
    return (
        <LazyWhenVisible className={slotClassName}>
            <SarakDesignScope design={design} className={className} style={{ ...SCOPE_INK, ...(transparent ? {} : { backgroundColor: 'var(--sarak-bg-base)' }), ...style }} {...scopeProps}>
                {children}
            </SarakDesignScope>
        </LazyWhenVisible>
    );
};
