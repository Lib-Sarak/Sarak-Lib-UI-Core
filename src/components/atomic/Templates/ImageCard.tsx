import React from 'react';
import { motion } from 'framer-motion';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { CardSchema } from '../../../core/Design/schema/cards';

export interface ImageCardProps {
    src: string;
    alt?: string;
    title?: string;
    subtitle?: string;
    children?: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({
    src,
    alt = 'Image Card',
    title,
    subtitle,
    children,
    className = '',
    onClick
}) => {
    const { design } = useSarakUI();
    
    // Ler configs do design
    const overlayOpacity = design?.imageCardOverlayOpacity ?? 0.5;
    const hoverZoom = design?.imageCardHoverZoom ?? 1.05;
    const hoverStyle = design?.cardHoverStyle || 'lift';

    return (
        <motion.div
            onClick={onClick}
            whileHover={hoverStyle === 'lift' ? { y: -4, scale: 1.01 } : hoverStyle === 'expand' ? { scale: 1.02 } : {}}
            className={`relative overflow-hidden group cursor-pointer ${className}`}
            style={{
                borderRadius: 'var(--sarak-card-radius, 12px)',
                borderWidth: 'var(--sarak-card-border-width, 1px)',
                borderStyle: 'solid',
                borderColor: 'var(--sarak-card-border-color, rgba(255,255,255,0.1))',
                backgroundColor: 'var(--sarak-card-bg)',
                boxShadow: hoverStyle === 'glow-only' ? 'none' : '0 10px 30px -10px rgba(0,0,0,0.5)',
            }}
        >
            {/* Background Image Layer */}
            <motion.div 
                className="absolute inset-0 w-full h-full"
                transition={{ duration: 0.4, ease: "easeOut" }}
                whileHover={{ scale: hoverZoom }}
            >
                <img 
                    src={src} 
                    alt={alt} 
                    className="w-full h-full object-cover" 
                />
            </motion.div>

            {/* Overlay Layer */}
            <div 
                className="absolute inset-0 transition-opacity duration-300"
                style={{
                    backgroundColor: 'var(--sarak-card-bg)',
                    opacity: overlayOpacity
                }}
            />

            {/* Content Layer */}
            <div className="relative z-10 p-6 flex flex-col h-full justify-end">
                {title && <h3 className="text-xl font-bold text-[var(--sx-color-text-title)]">{title}</h3>}
                {subtitle && <p className="text-sm text-[var(--sx-color-text-muted)] mt-1">{subtitle}</p>}
                
                {children && <div className="mt-4">{children}</div>}
            </div>

            {/* Hover Glow Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                 style={{
                     boxShadow: `inset 0 0 40px var(--sarak-card-glow-color, rgba(0,242,255,0.1))`
                 }}
            />
        </motion.div>
    );
};
