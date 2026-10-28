/**
 * TEMPLATE — uma tela real, com OS TRÊS ESTADOS.
 *
 * Toda tela que busca dados tem três estados, não um: carregando, erro e vazio.
 * Tratar só o caminho feliz é o defeito mais comum em tela nova — por isso o
 * esqueleto já vem com os três.
 *
 * O que este arquivo demonstra:
 *  - dados são SEU React (a biblioteca nunca chama rede sozinha);
 *  - componentes vêm do barril (confira nomes/props em `sarak-ui/catalog.json`);
 *  - o que a lib não tem, você escreve — com tokens `var(--sarak-*)`.
 */
import React from 'react';
import {
    SarakButton,
    SarakCard,
    SarakDataEmpty,
    SarakFlex,
    SarakGrid,
    SarakPageHeader,
    SarakSkeleton,
    type SarakResponsiveValue,
} from '@sarak/lib-ui-core';

const ITEM_GRID_COLUMNS: SarakResponsiveValue<string> = {
    mob: '1fr',
    tab: 'repeat(2, 1fr)',
    desk: 'repeat(3, 1fr)',
};

interface Item {
    id: string;
    nome: string;
}

type Estado =
    | { fase: 'carregando' }
    | { fase: 'erro'; mensagem: string }
    | { fase: 'pronto'; itens: Item[] };

/**
 * Busca de dados: hook SEU, cliente HTTP SEU, e sempre contra a `api/` DO PRÓPRIO
 * MÓDULO — nunca o endpoint interno de outro domínio (é o que mantém os módulos
 * desacopláveis).
 */
function useItens(): [Estado, () => void] {
    const [estado, setEstado] = React.useState<Estado>({ fase: 'carregando' });

    const buscar = React.useCallback(() => {
        setEstado({ fase: 'carregando' });
        fetch('/api/v1/itens')
            .then((resposta) => {
                if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
                return resposta.json() as Promise<Item[]>;
            })
            .then((itens) => setEstado({ fase: 'pronto', itens }))
            .catch((erro: unknown) => {
                setEstado({ fase: 'erro', mensagem: erro instanceof Error ? erro.message : 'Falha inesperada' });
            });
    }, []);

    React.useEffect(buscar, [buscar]);
    return [estado, buscar];
}

function CardItem({ item }: { item: Item }): React.ReactElement {
    return (
        <SarakCard>
            <SarakCard.Body>
                <h3>{item.nome}</h3>
            </SarakCard.Body>
        </SarakCard>
    );
}

export function TelaExemplo(): React.ReactElement {
    const [estado, recarregar] = useItens();

    return (
        <SarakFlex direction="column" gap="spacing-lg" wrap={false}>
            <SarakPageHeader title="Itens" subtitle="Itens carregados pelo módulo." />
            {estado.fase === 'carregando' && <SarakSkeleton rows={4} />}
            {estado.fase === 'erro' && (
                <div
                    role="alert"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 'var(--sarak-layout-gap-md, 16px)',
                    }}
                >
                    <p>Não foi possível carregar os itens: {estado.mensagem}</p>
                    <SarakButton variant="secondary" onClick={recarregar}>
                        Tentar de novo
                    </SarakButton>
                </div>
            )}
            {estado.fase === 'pronto' && estado.itens.length === 0 && (
                <SarakDataEmpty message="Nenhum item por aqui ainda." />
            )}
            {estado.fase === 'pronto' && estado.itens.length > 0 && (
                <SarakGrid templateColumns={ITEM_GRID_COLUMNS} gap="spacing-md">
                    {estado.itens.map((item) => (
                        <CardItem key={item.id} item={item} />
                    ))}
                </SarakGrid>
            )}
        </SarakFlex>
    );
}
