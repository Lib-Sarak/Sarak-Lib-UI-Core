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
import { SarakButton, SarakSkeleton, SarakDataEmpty, SarakGrid } from '@sarak/lib-ui-core';

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

/** Card próprio, temável: só tokens públicos — a central alcança este componente. */
function CardItem({ item }: { item: Item }) {
    return (
        <article
            style={{
                background: 'var(--sarak-card-bg, transparent)',
                border: 'var(--sarak-card-border, none)',
                borderRadius: 'var(--sarak-card-radius, 8px)',
                padding: 'var(--sarak-card-padding-md, 16px)',
            }}
        >
            {/* A cor do texto comum é HERDADA do escopo pintado pelo Provider — não
                force. Títulos têm token próprio. */}
            <h3 style={{ color: 'var(--sarak-title-color, inherit)', fontFamily: 'var(--sarak-heading-font, inherit)' }}>
                {item.nome}
            </h3>
        </article>
    );
}

export function TelaExemplo() {
    const [estado, recarregar] = useItens();

    // 1/3 — CARREGANDO. Skeleton, nunca uma tela em branco.
    if (estado.fase === 'carregando') {
        return <SarakSkeleton rows={4} />;
    }

    // 2/3 — ERRO. Diga o que houve E ofereça a ação de repetir.
    if (estado.fase === 'erro') {
        return (
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
        );
    }

    // 3/3 — VAZIO. "Sem dados" NÃO é o mesmo que "carregando".
    if (estado.itens.length === 0) {
        return <SarakDataEmpty message="Nenhum item por aqui ainda." />;
    }

    // Caminho feliz. `SarakGrid` já colapsa para 1 coluna no celular — zero CSS seu.
    return (
        <SarakGrid templateColumns={{ mob: '1fr', tab: 'repeat(2, 1fr)', desk: 'repeat(3, 1fr)' }} gap="md">
            {estado.itens.map((item) => (
                <CardItem key={item.id} item={item} />
            ))}
        </SarakGrid>
    );
}
