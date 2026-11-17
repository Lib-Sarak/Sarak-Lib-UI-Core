import React from 'react';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import type { SarakShellNavItem } from '../SarakShellNav';
import { ShellNavGroup } from './ShellNavGroup';
import { isNavGroup } from './shellNavTree';
import { NAV_MORE_ATTRIBUTE } from './useHorizontalOverflow';

export interface ShellNavMoreProps {
    /** Os itens que não couberam na barra, na ordem da lista. */
    hiddenItems: SarakShellNavItem[];
    activeRoute?: string;
    /** `false` mantém o botão medido, mas sem visibilidade (nada ficou de fora). */
    visible: boolean;
    /** Onde o botão começa, em px a partir da borda esquerda da barra: logo depois do último item visível. */
    start: number;
    collapsed: boolean;
    onToggle: (item: SarakShellNavItem) => void;
    onSelect?: (route: string) => void;
}

/** A rota do botão: ele é grupo, não navega, e a rota só serve de chave. */
const MORE_ROUTE = '#sarak-nav-more';

/** O que o balão lista: os itens que não couberam e os filhos de um grupo que não coube (um nível só). */
const flattenForMore = (items: SarakShellNavItem[]): SarakShellNavItem[] =>
    items.flatMap((item) => (isNavGroup(item) ? item.children ?? [] : [item]));

/**
 * O botão "Mais" da topbar: começa logo depois do último item visível (fora do fluxo, para a largura natural da lista não
 * mudar) e abre num balão os itens que não couberam. É grupo de verdade (botão com `aria-expanded`, setas e Esc no balão) e se
 * marca ativo quando o item ativo está lá dentro. Só texto e seta: o ícone de reticências do Phosphor, no peso cheio, vira um
 * retângulo com pontos.
 */
export const ShellNavMore: React.FC<ShellNavMoreProps> = ({ hiddenItems, activeRoute, visible, start, collapsed, onToggle, onSelect }) => {
    const t = useLibraryText();
    return (
        <div
            {...{ [NAV_MORE_ATTRIBUTE]: 'true' }}
            className="absolute z-10 w-max"
            style={{
                insetInlineStart: `${start}px`,
                top: '50%',
                transform: 'translateY(-50%)',
                visibility: visible ? undefined : 'hidden',
            }}
        >
            <ShellNavGroup
                item={{ label: t('shellNavMore'), route: MORE_ROUTE, children: flattenForMore(hiddenItems) }}
                activeRoute={activeRoute}
                horizontal
                collapsed={collapsed}
                expanded={false}
                onToggle={onToggle}
                onSelect={onSelect}
                markActive
            />
        </div>
    );
};

export default ShellNavMore;
