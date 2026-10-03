import type * as React from 'react';

export interface SarakCatalogItem {
    id: string;
    display_name: string;
    organization?: string;
    category?: string;
    description?: string;
    [key: string]: unknown;
}

export interface SarakCatalogGridProps {
    /** Itens filtrados e exibidos; obrigatória. Cada registro precisa de `id` e `display_name`; a busca ignora `description` e outros campos. */
    items: SarakCatalogItem[];

    /** Exibe o indicador de carga no lugar de todo o catálogo; omitida, os itens são renderizados sem espera. */
    loading?: boolean;

    /** Título obrigatório do catálogo; não há valor padrão e ele também fica oculto enquanto `loading` for verdadeiro. */
    title: string;

    /** Texto complementar do cabeçalho; omitido, a linha de subtítulo não aparece. */
    subtitle?: string;

    /** Mapeia cada valor de `item.category` para o rótulo do filtro; omitida, oferece apenas `all: 'Todos'`. Inclua `all` para manter o botão de mostrar tudo. */
    categories?: Record<string, string>;

    /** Habilita o botão que chama a rotina de sincronização; omitida, o botão não aparece. Ele fica fixo no canto inferior direito. */
    onSync?: () => void;

    /** Personaliza cada cartão já filtrado; omitida, o cartão padrão mostra `display_name` e `organization`. */
    renderCard?: (item: SarakCatalogItem) => React.ReactNode;

    /** Mensagem exibida quando a lista filtrada fica vazia; omitida, usa `Nenhum item encontrado.`. Não aparece durante o carregamento. */
    emptyMessage?: string;

    /** Sem efeito nesta implementação; omitir ou alterar o valor não muda a renderização atual. */
    role?: 'primary' | 'secondary' | 'neutral' | 'accent';

    /** Sem efeito nesta implementação; omitir ou alterar o valor não muda a renderização atual. */
    density?: 'compact' | 'standard' | 'spacious';

    /** Sem efeito nesta implementação; omitir ou alterar o valor não muda a renderização atual. */
    importance?: 'hero' | 'base' | 'subtle';
}
