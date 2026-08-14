import React from 'react';
import { useStructuralStyles } from '../hooks/useStructuralStyles';
import { useSarakDevice } from '../../../core/Provider/DeviceProvider';
import { resolveResponsiveValue } from '../../../core/Design/resolveResponsiveValue';
import type { ResponsiveValue } from '../../../core/Design/types';

export interface SarakGridProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
    children: React.ReactNode;
    /**
     * Colunas do grid. Aceita:
     * - `string` fixo (ex.: `"1fr 1fr 1fr"`): mobile-first por padrão — **colapsa para 1
     *   coluna no celular** (nunca estoura a página), reflui no valor cheio em tablet/desktop.
     * - `ResponsiveValue<string>` (`{ mob, tab, desk }`): o consumidor controla por dispositivo.
     * Sem `templateColumns`, usa a estratégia de grid do Design Engine (também 1 coluna no celular).
     */
    templateColumns?: string | ResponsiveValue<string>;
    templateAreas?: string;
    gap?: string;
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
    const resolvedColumns = templateColumns === undefined
        ? undefined
        : device === 'smartphone' && typeof templateColumns === 'string'
            ? '1fr'
            : resolveResponsiveValue(templateColumns, device);

    const structuralStyles = getGridStyles(resolvedColumns, templateAreas, gap);

    // plan-41: as classes de container query que `getGridStyles` produz — prefixo
    // `@min-[` + medida + `]:` seguido do utilitário, ex.: `grid-cols-N` — precisam
    // de um ANCESTRAL com `container-type` para medir. O próprio grid não pode ser o
    // container de si mesmo (medido: `container-type` no MESMO elemento não faz a
    // query dele casar). Sem `SarakShell`/painel acima (que já plantam `@container`),
    // a classe nunca ativava — achado real em consumidor (`plan-40`). Este wrapper é
    // o container; o consumidor continua recebendo `className`/`style`/`...props` no
    // elemento do grid, como antes.
    // ⚠️ plan-44: NÃO cole o prefixo, a medida e o utilitário acima num único
    // trecho de texto contínuo — o scanner do Tailwind lê este arquivo como TEXTO,
    // reconheceria a junção como candidato de classe e tentaria gerar CSS a partir
    // dela. Foi exatamente essa junção, com `…` no lugar da medida, que derrubou
    // `npm run build` duas vezes (`SyntaxError: Invalid media query` no
    // `lightningcss`). Mantenha o prefixo, a medida e o utilitário em trechos
    // separados por texto comum, como acima.
    return (
        <div className="@container w-full">
            <Component
                className={`${structuralStyles.className} ${className}`.trim()}
                style={{ ...structuralStyles.style, ...style }}
                {...props}
            >
                {children}
            </Component>
        </div>
    );
};
