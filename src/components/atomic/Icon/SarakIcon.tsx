import React from 'react';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { IconMap, type IconFamily } from './IconMap';
import { ICONE_DESCONHECIDO, type IconName } from './iconNames';

export interface SarakIconProps {
    name: IconName | string;
    size?: number | string;
    className?: string;
    color?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
}

/** Espessura de traço por peso, para as famílias que a expõem como número. */
const TRACO_LUCIDE: Record<string, number> = { thin: 1, light: 1.5, regular: 2, bold: 2.5, fill: 3, duotone: 2 };
const TRACO_TABLER: Record<string, number> = { thin: 1, light: 1.25, regular: 1.5, bold: 2, fill: 2.5, duotone: 1.5 };

/** Nomes já avisados, para não poluir o console a cada render (postura da Spec 17). */
const jaAvisados = new Set<string>();

function avisarNomeDesconhecido(name: string): void {
    if (jaAvisados.has(name)) return;
    jaAvisados.add(name);
    console.warn(
        `[Sarak:Icon] ícone "${name}" fora do contrato — renderizando "${ICONE_DESCONHECIDO}" no lugar. ` +
        'Os nomes válidos estão na seção "Ícones" de docs/component-catalog.md. ' +
        'Precisa de um nome novo? Acrescente-o em src/components/atomic/Icon/iconNames.ts (as três famílias são cobradas pelo compilador).'
    );
}

export const SarakIcon: React.FC<SarakIconProps> = ({ name, size = 24, className = '', color, style, onClick }) => {
    const { design } = useSarakUI();
    const family = (design?.iconFamily || 'lucide') as IconFamily;
    const weight = design?.iconWeight || 'regular';

    const triple = IconMap[name as IconName];
    if (!triple) avisarNomeDesconhecido(String(name));

    // Degradação visível, nunca tela quebrada: nome fora do contrato vira o ícone de aviso.
    const ResolvedIcon = (triple ?? IconMap[ICONE_DESCONHECIDO])[family] ?? IconMap[ICONE_DESCONHECIDO].lucide;

    if (family === 'phosphor') {
        return <ResolvedIcon size={size} className={className} weight={weight} color={color} style={style} onClick={onClick} />;
    }

    if (family === 'tabler') {
        return <ResolvedIcon size={size} className={className} stroke={TRACO_TABLER[weight] || 1.5} color={color} style={style} onClick={onClick} />;
    }

    return <ResolvedIcon size={size} className={className} strokeWidth={TRACO_LUCIDE[weight] || 2} color={color} style={style} onClick={onClick} />;
};
