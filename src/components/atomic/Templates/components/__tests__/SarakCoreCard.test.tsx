import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SarakCoreCard } from '../SarakCoreCard';
import { SarakUIProvider } from '../../../../../core/Provider/SarakUIProvider';

/**
 * Spec 42 — `SarakCoreCard` (variante `classic`, a DEFAULT do `SarakCardGrid`) é
 * genérico: nenhum texto nem aritmética de domínio LLM.
 *
 * Este arquivo nasceu como CARACTERIZAÇÃO do comportamento antigo (§2.1, rodada verde
 * antes do refactor: painel "Custo In/Out (1M)", "Janela de Contexto" = `context/1000`,
 * "Tokenizer", subtítulo default "Modelo"). Depois do refactor ele passou a asseverar o
 * comportamento novo — e as asserções negativas abaixo são o que impede o domínio de
 * voltar.
 */
const item = {
    name: 'Contrato #4471',
    party: 'Prefeitura de Salvador',
    summary: 'Prestação de serviços de manutenção predial.',
    specs: [
        { label: 'Valor mensal', value: 'R$ 18.500,00' },
        { label: 'Vigência', value: '24 meses' },
        { label: 'Responsável', value: 'Diretoria Jurídica' },
    ],
    entradas: ['digitalizado', 'assinado'],
    saidas: ['relatório'],
};

const mapping = {
    title: 'name',
    subtitle: 'party',
    description: 'summary',
    details: 'specs',
    input_caps: 'entradas',
    output_caps: 'saidas',
    icon: 'Box',
};

const renderCard = (props: Record<string, unknown> = {}) =>
    render(
        <SarakUIProvider config={{ mode: 'dark' }}>
            <SarakCoreCard item={item} mapping={mapping} {...props} />
        </SarakUIProvider>,
    );

describe('SarakCoreCard (Spec 42 — card classic genérico)', () => {
    it('matches snapshot com dados neutros (sem domínio LLM)', () => {
        const { asFragment } = renderCard();
        expect(asFragment()).toMatchSnapshot();
    });

    it('o painel de detalhes renderiza os pares de mapping.details, já formatados', () => {
        renderCard();

        expect(screen.getByText('Valor mensal')).toBeInTheDocument();
        expect(screen.getByText('R$ 18.500,00')).toBeInTheDocument();
        expect(screen.getByText('Vigência')).toBeInTheDocument();
        expect(screen.getByText('24 meses')).toBeInTheDocument();
        expect(screen.getByText('Responsável')).toBeInTheDocument();
        expect(screen.getByText('Diretoria Jurídica')).toBeInTheDocument();
    });

    it('nenhum campo/texto de domínio LLM sobrevive no card', () => {
        const { container } = renderCard();

        for (const leak of ['Custo In (1M)', 'Custo Out (1M)', 'Janela de Contexto', 'Tokenizer', 'tokens', 'Descrição Técnica', 'Ver Specs', 'Input Capacities', 'Output Capacities']) {
            expect(container.textContent).not.toContain(leak);
        }
    });

    it('item sem details não renderiza painel algum (nem "N/A"/"Desconhecida")', () => {
        const { container } = render(
            <SarakUIProvider config={{ mode: 'dark' }}>
                <SarakCoreCard item={{ name: 'Só título' }} mapping={{ title: 'name' }} />
            </SarakUIProvider>,
        );

        expect(screen.getByText('Só título')).toBeInTheDocument();
        expect(container.textContent).not.toContain('N/A');
        expect(container.textContent).not.toContain('Desconhecida');
    });

    it('details ignora entradas fora do formato { label, value }', () => {
        render(
            <SarakUIProvider config={{ mode: 'dark' }}>
                <SarakCoreCard
                    item={{ name: 'X', specs: ['solto', { label: 'Válido', value: 'ok' }, null] }}
                    mapping={{ title: 'name', details: 'specs' }}
                />
            </SarakUIProvider>,
        );

        expect(screen.getByText('Válido')).toBeInTheDocument();
        expect(screen.getByText('ok')).toBeInTheDocument();
        expect(screen.queryByText('solto')).not.toBeInTheDocument();
    });

    it('sem mapping.subtitle, o subtítulo é vazio (nunca "Modelo")', () => {
        const { container } = render(
            <SarakUIProvider config={{ mode: 'dark' }}>
                <SarakCoreCard item={{ name: 'Sem subtítulo' }} mapping={{ title: 'name' }} />
            </SarakUIProvider>,
        );

        expect(container.textContent).not.toContain('Modelo');
    });

    it('o expansor usa rótulos neutros e só existe quando há descrição', () => {
        const semDescricao = render(
            <SarakUIProvider config={{ mode: 'dark' }}>
                <SarakCoreCard item={{ name: 'Sem descrição' }} mapping={{ title: 'name' }} />
            </SarakUIProvider>,
        );
        expect(semDescricao.container.textContent).not.toContain('Ver mais');
        semDescricao.unmount();

        renderCard();
        fireEvent.click(screen.getByText('Ver mais'));

        expect(screen.getByText('Prestação de serviços de manutenção predial.')).toBeInTheDocument();
        expect(screen.getByText('Fechar')).toBeInTheDocument();
    });

    it('rótulos literais do mapping trocam os textos fixos do card', () => {
        renderCard({
            mapping: {
                ...mapping,
                input_caps_label: 'Documentos recebidos',
                output_caps_label: 'Documentos emitidos',
                description_label: 'Objeto do contrato',
                expand_label: 'Ver detalhes',
                collapse_label: 'Recolher',
            },
        });

        expect(screen.getByText('Documentos recebidos')).toBeInTheDocument();
        expect(screen.getByText('Documentos emitidos')).toBeInTheDocument();
        fireEvent.click(screen.getByText('Ver detalhes'));
        expect(screen.getByText('Objeto do contrato')).toBeInTheDocument();
        expect(screen.getByText('Recolher')).toBeInTheDocument();
    });

    it('as fileiras de chips renderizam sem cabeçalho quando o rótulo não é declarado', () => {
        renderCard();

        expect(screen.getByText('digitalizado')).toBeInTheDocument();
        expect(screen.getByText('assinado')).toBeInTheDocument();
        expect(screen.getByText('relatório')).toBeInTheDocument();
    });

    // plan-41: o painel de detalhes (`mapping.details`) usa `getGridStyles` — classe
    // `@min-[…]` (container query), que só ativa com um ancestral `container-type`.
    // jsdom não avalia container query — prova só que a raiz PLANTA `@container` (a
    // query casar é prova de browser real, plan-40).
    it('planta @container na raiz — ancestral do painel de detalhes que usa container query', () => {
        const { container } = renderCard();
        expect(container.querySelector('[class*="@container"]')).not.toBeNull();
    });

    it('delega para as variantes title/action/search sem renderizar o card classic', () => {
        const { container: title } = renderCard({ variant: 'title' });
        expect(title.textContent).not.toContain('Valor mensal');

        const { container: action } = renderCard({ variant: 'action' });
        expect(action.textContent).not.toContain('Vigência');

        const { container: search } = renderCard({ variant: 'search' });
        expect(search.textContent).not.toContain('Valor mensal');
    });
});
