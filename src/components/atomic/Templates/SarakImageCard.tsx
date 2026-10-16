import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { CardSchema } from '../../../core/Design/schema/cards';
import { useStructuralStyles } from '../hooks/useStructuralStyles';
import { resolveCardHoverMotion } from '../Cards/cardHoverMotion';
import { useMotionTokens } from '../hooks/useMotionTokens';

export interface SarakImageCardProps {
    /** Endereço da imagem de fundo; é obrigatório e, sem uma fonte válida, a camada de imagem fica vazia. */
    src: string;
    /** Texto alternativo da imagem; sem a prop, usa o texto genérico `Image Card`, então informe uma descrição para imagens informativas. */
    alt?: string;
    /** Título sobreposto à imagem; omitido, o título não aparece. */
    title?: string;
    /** Texto secundário sob o título; omitido, o subtítulo não aparece. */
    subtitle?: string;
    /** Conteúdo adicional sob os textos; omitido, não há conteúdo extra. */
    children?: React.ReactNode;
    /** Acrescenta classes à raiz do cartão; omitida, nenhuma classe adicional é aplicada. */
    className?: string;
    /** Executa uma ação quando o cartão recebe clique; omitida, não há ação, e a raiz continua sem semântica de botão nem suporte de teclado. */
    onClick?: () => void;
}

export const SarakImageCard: React.FC<SarakImageCardProps> = ({
    src,
    alt = 'Image Card',
    title,
    subtitle,
    children,
    className = '',
    onClick
}) => {
    const { durations } = useMotionTokens();
    const { design } = useSarakUI();
    const { getFlexStyles } = useStructuralStyles();

    // Ler configs do design
    const overlayOpacity = design?.imageCardOverlayOpacity ?? 0.5;
    // Movimento reduzido (token ou preferência do sistema) zera o zoom: a imagem fica como está.
    const prefersReducedMotion = useReducedMotion();
    const hoverZoom = design?.reducedMotion === true || prefersReducedMotion ? 1 : (design?.imageCardHoverZoom ?? 1.05);
    const hoverStyle = design?.cardHoverStyle || 'lift';
    // `glow-only` não move o cartão: o brilho é o efeito, então acende na cor primária em vez do
    // tom quase transparente do brilho de repouso (`cardGlowColor`).
    const hoverGlowColor = hoverStyle === 'glow-only'
        ? 'color-mix(in srgb, var(--sarak-primary-color, #00f2ff) 40%, transparent)'
        : 'var(--sarak-card-glow-color, rgba(0, 242, 255, 0.05))';
    const contentStack = getFlexStyles('column', undefined, undefined, '0px');

    return (
        <motion.div
            onClick={onClick}
            // O ponteiro pousa no véu e no conteúdo (irmãos por cima da imagem), nunca na camada da
            // imagem: o hover vive aqui, na raiz, e desce à camada pelo rótulo `hover`.
            variants={{ hover: resolveCardHoverMotion(design) }}
            whileHover="hover"
            data-sx-card-interactive="true"
            className={`relative overflow-hidden group cursor-pointer ${className}`}
            style={{
                borderRadius: 'var(--sarak-card-radius, 12px)',
                borderWidth: 'var(--sarak-card-border-width, 1px)',
                borderStyle: 'solid',
                borderColor: 'var(--sarak-card-border-color, rgba(255,255,255,0.1))',
                backgroundColor: 'var(--sarak-card-bg)',
                boxShadow: hoverStyle === 'glow-only' ? 'none' : '0 var(--sarak-image-card-shadow-offset-y, 10px) var(--sarak-image-card-shadow-blur, 30px) calc(var(--sarak-image-card-shadow-spread, 10px) * -1) color-mix(in srgb, var(--sarak-card-shadow-color, #000000) 50%, transparent)',
            }}
        >
            {/* Background Image Layer */}
            <motion.div 
                className="absolute inset-0 w-full h-full"
                transition={{ duration: durations.normal, ease: "easeOut" }}
                variants={{ hover: { scale: hoverZoom } }}
            >
                <img 
                    src={src} 
                    alt={alt} 
                    className="w-full h-full object-cover" 
                />
            </motion.div>

            {/* Overlay Layer */}
            <div 
                className="absolute inset-0 transition-opacity duration-[var(--duration-normal,0.3s)]"
                style={{
                    backgroundColor: 'var(--sarak-card-bg)',
                    opacity: overlayOpacity
                }}
            />

            {/* Content Layer */}
            <div
                className={`relative z-10 ${contentStack.className} h-full justify-end`}
                style={{ ...contentStack.style, padding: 'var(--sarak-layout-gap-lg, 24px)' }}
            >
                {title && <h3 className="text-xl font-bold text-[var(--color-theme-title,#ffffff)]">{title}</h3>}
                {subtitle && <p className="text-sm text-[var(--text-muted,rgba(255,255,255,0.4))]" style={{ marginTop: 'calc(var(--sarak-layout-gap-md,16px) * 0.25)' }}>{subtitle}</p>}

                {children && <div style={{ marginTop: 'var(--sarak-layout-gap-md, 16px)' }}>{children}</div>}
            </div>

            {/* Hover Glow Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--duration-slow,0.6s)] pointer-events-none"
                 style={{
                     boxShadow: `inset 0 0 var(--sarak-image-card-glow-blur, 40px) ${hoverGlowColor}`
                 }}
            />
        </motion.div>
    );
};
