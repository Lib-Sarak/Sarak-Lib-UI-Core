import React from 'react';
import { useStructuralStyles } from '../hooks/useStructuralStyles';
import { useSarakDevice } from '../../../core/Provider/DeviceProvider';
import { sarakResolveResponsiveValue } from '../../../core/Design/resolveResponsiveValue';
import type { SarakResponsiveValue } from '../../../core/Design/types';
import type { SarakLayoutGap } from '../../../core/Design/resolveToken';
import { GridColumnsProvider } from './gridColumnsContext';

const toColumnTemplate = (count: number): string => `repeat(${count}, minmax(0, 1fr))`;

export interface SarakGridProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
    children: React.ReactNode;
    /**
     * Colunas do grid. Aceita:
     * - `string` fixo (ex.: `"1fr 1fr 1fr"`): mobile-first por padrão — **colapsa para 1
     *   coluna no celular** (nunca estoura a página), reflui no valor cheio em tablet/desktop.
     * - `SarakResponsiveValue<string>` (`{ mob, tab, desk }`): o consumidor controla por dispositivo.
     * Sem `templateColumns`, usa a estratégia de grid do Design Engine (também 1 coluna no celular).
     */
    templateColumns?: string | SarakResponsiveValue<string>;
    /**
     * Quantidade de colunas iguais: um número ou um valor por dispositivo (`{ mob, tab, desk }`).
     * Vence `templateColumns` se os dois vierem. Omitida, o grid faz o que fazia. Um número fixo
     * colapsa para 1 coluna no celular, como `templateColumns`; para ter mais, declare `mob`.
     */
    columns?: number | SarakResponsiveValue<number>;
    templateAreas?: string;
    gap?: SarakLayoutGap;
    as?: React.ElementType;
}

/**
 * Componente Atômico de Macro-Layout.
 * O SarakGrid é o container raiz que lê o Token de Layout do Design Engine
 * e organiza os componentes filhos (Cards, Tabelas, Gráficos) na malha correta.
 * Ele elimina a necessidade de chumbarmos "grid-cols-X" nas telas.
 *
 * Multidispositivo por padrão (Spec 40.3 — L2): um `templateColumns` fixo colapsa para
 * **uma coluna no celular** (via `useSarakDevice`), então nenhum grid estoura horizontalmente
 * no mobile sem o consumidor escrever CSS. Para controlar por dispositivo, passe um
 * `ResponsiveValue<string>`.
 */
export const SarakGrid: React.FC<SarakGridProps> = ({
    children,
    className = '',
    style,
    templateColumns,
    columns,
    templateAreas,
    gap,
    as: Component = 'div',
    ...props
}) => {
    const { getGridStyles } = useStructuralStyles();
    const device = useSarakDevice();

    // Mobile-first: um `templateColumns` fixo (string) vira 1 coluna no celular para não
    // estourar; um `ResponsiveValue` é resolvido no device ativo (controle do consumidor).
    // Sem `templateColumns`, delega a estratégia responsiva do Design Engine (já 1 col no mob).
    const columnCount = columns === undefined
        ? undefined
        : device === 'smartphone' && typeof columns === 'number'
            ? 1
            : sarakResolveResponsiveValue(columns, device);
    const resolvedColumns = columnCount !== undefined
        ? toColumnTemplate(Math.max(1, Math.floor(columnCount)))
        : templateColumns === undefined
        ? undefined
        : device === 'smartphone' && typeof templateColumns === 'string'
            ? '1fr'
            : sarakResolveResponsiveValue(templateColumns, device);

    const structuralStyles = getGridStyles(resolvedColumns, templateAreas, gap);

    // Os estilos estruturais responsivos precisam de um contêiner ancestral para
    // medir. Este wrapper fornece essa fronteira e mantém as props do consumidor
    // no elemento do grid.
    return (
        <div className="@container w-full">
            <GridColumnsProvider value={columnCount === undefined ? undefined : Math.max(1, Math.floor(columnCount))}>
                <Component
                    className={`${structuralStyles.className} ${className}`.trim()}
                    style={{ ...structuralStyles.style, ...style }}
                    {...props}
                >
                    {children}
                </Component>
            </GridColumnsProvider>
        </div>
    );
};
