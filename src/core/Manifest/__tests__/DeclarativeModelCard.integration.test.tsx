/**
 * Spec 40 §2.5 — Prova declarativa: o antigo card de catálogo de modelos LLM
 * (removido do `SarakActionCard` por embutir domínio) é 100% reconstruível via
 * manifesto, sem NENHUM componente React novo — só primitivos já registrados
 * (`SarakFlex`, `SarakTypography`, `SarakButton`, `renderFor`) + `mutate_state`/
 * `renderIf` para o toggle de expandir/recolher.
 *
 * Guarda de regressão: se um dia deixar de ser possível compor isto puramente em
 * JSON, este teste quebra — sinal de que a Engine perdeu expressividade genérica.
 *
 * Ressalva (Spec 40): a aritmética de domínio (`context / 1000` → "128k tokens")
 * não é expressável no manifesto (não há pipe de divisão) — por isso os detalhes
 * abaixo já chegam PRÉ-FORMATADOS no item, como qualquer consumidor real faria.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SarakManifestRenderer } from '../SarakManifestRenderer';
import { createComponentRegistry } from '../Registry/ComponentRegistry';
import { createSarakDataStore } from '../DataStore/SarakDataStore';
import { SarakUIProvider } from '../../Provider/SarakUIProvider';
import type { ManifestRoot } from '../types';

const buildModelCatalogCardManifest = (): ManifestRoot => ({
    schemaVersion: 1,
    type: 'SarakFlex',
    props: { direction: 'column' },
    children: [
        { type: 'SarakTypography', props: { variant: 'caption', content: '{{model.provider}}' } },
        { type: 'SarakTypography', props: { variant: 'h3', content: '{{model.name}}' } },
        {
            type: 'SarakButton',
            props: { children: 'Executar', 'data-testid': 'run-model' },
            actions: [{ type: 'trigger_toast', payload: { message: 'Modelo executado!', variant: 'success' } }],
        },
        {
            type: 'SarakButton',
            props: { children: 'Detalhes', 'data-testid': 'toggle-details' },
            actions: [{ type: 'mutate_state', payload: { path: 'ui.detailsOpen', value: true } }],
        },
        {
            type: 'SarakFlex',
            renderIf: '{{ui.detailsOpen}}',
            children: [
                {
                    type: 'SarakFlex',
                    renderFor: { source: '{{model.details}}', as: 'detail', keyBy: 'label' },
                    children: [
                        { type: 'SarakTypography', props: { variant: 'caption', content: '{{detail.label}}' } },
                        { type: 'SarakTypography', props: { variant: 'body', content: '{{detail.value}}' } },
                    ],
                },
            ],
        },
    ],
});

describe('Spec 40 §2.5 — composição declarativa do antigo card de modelo LLM', () => {
    it('renderiza provedor/nome, executa a ação e expande os detalhes pré-formatados via renderFor', async () => {
        const registry = createComponentRegistry();
        const store = createSarakDataStore({
            ui: { detailsOpen: false },
            model: {
                provider: 'OpenAI',
                name: 'gpt-5-mock',
                // Já formatado pelo consumidor — Sarak não faz aritmética de domínio.
                details: [
                    { label: 'Custo In (1M)', value: '$0.0050' },
                    { label: 'Custo Out (1M)', value: '$0.0150' },
                    { label: 'Janela / Tokenizer', value: '128k tokens | cl100k_base' },
                ],
            },
        });

        render(
            <SarakUIProvider>
                <SarakManifestRenderer
                    manifest={buildModelCatalogCardManifest()}
                    registry={registry}
                    dataStore={store}
                    networkInterceptor={async () => ({})}
                />
            </SarakUIProvider>,
        );

        expect(screen.getByText('OpenAI')).toBeInTheDocument();
        expect(screen.getByText('gpt-5-mock')).toBeInTheDocument();

        // Detalhes ainda não expandidos.
        expect(screen.queryByText('Custo In (1M)')).not.toBeInTheDocument();

        fireEvent.click(screen.getByTestId('toggle-details'));

        await waitFor(() => expect(screen.getByText('Custo In (1M)')).toBeInTheDocument());
        expect(screen.getByText('$0.0050')).toBeInTheDocument();
        expect(screen.getByText('Custo Out (1M)')).toBeInTheDocument();
        expect(screen.getByText('$0.0150')).toBeInTheDocument();
        expect(screen.getByText('Janela / Tokenizer')).toBeInTheDocument();
        expect(screen.getByText('128k tokens | cl100k_base')).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('run-model'));
        await waitFor(() => expect(screen.getByText('Modelo executado!')).toBeInTheDocument());
    });
});
