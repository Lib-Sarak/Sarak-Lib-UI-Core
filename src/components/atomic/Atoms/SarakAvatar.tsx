import React, { useState } from 'react';

export type SarakAvatarSize = 'xs' | 'sm' | 'md' | 'lg';

export interface SarakAvatarProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
    /**
     * Nome da pessoa; obrigatório e usado como texto alternativo padrão e como origem das iniciais.
     * Nome vazio (se a tipagem for contornada) exibe `?` no fallback.
     */
    name: string;
    /**
     * Endereço da foto. Omitido, o avatar mostra as iniciais; se a imagem falhar ao carregar,
     * também volta às iniciais. Para tentar novamente a mesma URL, remonte o componente.
     */
    src?: string;
    /**
     * Texto alternativo da foto e nome acessível do fallback. Omitido, usa `name`; string vazia
     * torna a imagem decorativa e deixa as iniciais sem nome acessível.
     */
    alt?: string;
    /**
     * Tamanho na escala `xs`/`sm`/`md`/`lg` dos átomos. Omitido, usa `md`; o tamanho acompanha
     * o token de espaçamento médio do tema.
     */
    size?: SarakAvatarSize;
}

const AVATAR_SIZE_STYLES: Record<SarakAvatarSize, React.CSSProperties> = {
    xs: {
        width: 'calc(var(--sarak-layout-gap-md, 16px) * 1.5)',
        height: 'calc(var(--sarak-layout-gap-md, 16px) * 1.5)',
        fontSize: 'calc(var(--sarak-type-scale-caption, 12px) * 0.75)',
    },
    sm: {
        width: 'calc(var(--sarak-layout-gap-md, 16px) * 2)',
        height: 'calc(var(--sarak-layout-gap-md, 16px) * 2)',
        fontSize: 'calc(var(--sarak-type-scale-caption, 12px) * 0.875)',
    },
    md: {
        width: 'calc(var(--sarak-layout-gap-md, 16px) * 2.5)',
        height: 'calc(var(--sarak-layout-gap-md, 16px) * 2.5)',
        fontSize: 'var(--sarak-type-scale-caption, 12px)',
    },
    lg: {
        width: 'calc(var(--sarak-layout-gap-md, 16px) * 3)',
        height: 'calc(var(--sarak-layout-gap-md, 16px) * 3)',
        fontSize: 'calc(var(--sarak-type-scale-caption, 12px) * 1.25)',
    },
};

const getInitials = (name: string): string => {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return '?';

    const firstInitial = words[0].charAt(0);
    const lastInitial = words[words.length - 1].charAt(0);
    return (words.length === 1 ? firstInitial : `${firstInitial}${lastInitial}`).toLocaleUpperCase();
};

const getAvatarStyle = (size: SarakAvatarSize, style?: React.CSSProperties): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
    overflow: 'hidden',
    borderRadius: '50%',
    backgroundColor: 'var(--sarak-surface-color, var(--theme-surface, transparent))',
    color: 'var(--sarak-text-main, var(--theme-title, currentColor))',
    fontWeight: 'var(--sarak-body-weight, 700)',
    lineHeight: 1,
    ...AVATAR_SIZE_STYLES[size],
    ...style,
});

export const SarakAvatar = ({
    name,
    src,
    alt,
    size = 'md',
    className,
    style,
    ...props
}: SarakAvatarProps): React.ReactElement => {
    const [failedSource, setFailedSource] = useState<string | undefined>();
    const accessibleName = alt ?? name;
    const shouldShowImage = Boolean(src && src !== failedSource);

    return (
        <span {...props} className={className} style={getAvatarStyle(size, style)}>
            {shouldShowImage ? (
                <img
                    src={src}
                    alt={accessibleName}
                    onError={() => setFailedSource(src)}
                    style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
                />
            ) : (
                <span role="img" aria-label={accessibleName}>
                    {getInitials(name)}
                </span>
            )}
        </span>
    );
};
