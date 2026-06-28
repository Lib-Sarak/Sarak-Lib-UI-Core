import React from 'react';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { IconMap, IconName } from './IconMap';
import * as LucideIcons from 'lucide-react';
import { AlertCircle as LucideAlertCircle } from 'lucide-react';

export interface SarakIconProps {
    name: IconName | string;
    size?: number | string;
    className?: string;
    color?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
}

export const SarakIcon: React.FC<SarakIconProps> = ({ name, size = 24, className = '', color, style, onClick }) => {
    const { design } = useSarakUI();
    const family = (design?.iconFamily || 'lucide') as 'lucide' | 'phosphor' | 'tabler';
    const weight = design?.iconWeight || 'regular';

    const ResolvedIcon = IconMap[name as IconName]?.[family];

    if (!ResolvedIcon) {
        // Fallback robusto para Lucide direto caso o icone nao esteja mapeado
        const FallbackIcon = (LucideIcons as unknown as Record<string, React.ElementType>)[name as string] || LucideAlertCircle;
        const lucideStrokeMap: Record<string, number> = { thin: 1, light: 1.5, regular: 2, bold: 2.5, fill: 3, duotone: 2 };
        return <FallbackIcon size={size} className={className} strokeWidth={lucideStrokeMap[weight] || 2} color={color} style={style} onClick={onClick} />;
    }

    if (family === 'phosphor') {
        return <ResolvedIcon size={size} className={className} weight={weight} color={color} style={style} onClick={onClick} />;
    }
    
    if (family === 'tabler') {
        const strokeMap: Record<string, number> = { thin: 1, light: 1.25, regular: 1.5, bold: 2, fill: 2.5, duotone: 1.5 };
        return <ResolvedIcon size={size} className={className} stroke={strokeMap[weight] || 1.5} color={color} style={style} onClick={onClick} />;
    }
    
    const lucideStrokeMap: Record<string, number> = { thin: 1, light: 1.5, regular: 2, bold: 2.5, fill: 3, duotone: 2 };
    return <ResolvedIcon size={size} className={className} strokeWidth={lucideStrokeMap[weight] || 2} color={color} style={style} onClick={onClick} />;
};
