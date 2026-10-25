import React from 'react';
import { createRoot } from 'react-dom/client';
import { SarakDesignScope } from '@sarak/lib-ui-core';
import { sarakSovereignTheme } from '../src/core/Design/presets/themes/sarak-sovereign';
import { cyberpunkneonTheme } from '../src/core/Design/presets/themes/cyberpunk-neon';
import { minimalistAiry } from '../src/core/Design/presets/themes/minimalist-airy';
import { ProjectDetailPage } from './tela-detalhe.scene';
import { ProjectListPage } from './tela-lista.scene';

const THEMES = [sarakSovereignTheme, cyberpunkneonTheme, minimalistAiry];
const PROJECTS = [
    { id: 'atlas', title: 'Plataforma Atlas', description: 'Revisão dos fluxos de atendimento e operação.', status: 'Ativo', updatedAt: '24 out 2026', owners: 'Ana e Marcos' },
    { id: 'aurora', title: 'Painel Aurora', description: 'Indicadores de qualidade para as equipes regionais.', status: 'Em andamento', updatedAt: '22 out 2026', owners: 'Lia e Rafael' },
    { id: 'horizonte', title: 'Horizonte 2030', description: 'Planejamento e acompanhamento das próximas entregas.', status: 'Planejamento', updatedAt: '20 out 2026', owners: 'Joana e Caio' },
];
const PROJECT_DETAIL = {
    name: 'Plataforma Atlas',
    code: 'PRJ-2048',
    status: 'Ativo',
    owner: 'Ana Martins',
    team: 'Operações e experiência',
    createdAt: '12 mar 2026',
    description: 'Revisão dos fluxos de atendimento e operação.',
    activities: [
        { title: 'Revisão de prioridades', description: 'A equipe confirmou os próximos itens do ciclo.', happenedAt: 'Hoje, 10:24', author: 'Ana Martins' },
        { title: 'Documento atualizado', description: 'O plano de operação recebeu as últimas decisões.', happenedAt: 'Ontem, 16:40', author: 'Marcos Lima' },
    ],
};
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('O harness precisa do elemento #root.');

const params = new URLSearchParams(window.location.search);
const theme = THEMES.find((candidate) => candidate.id === params.get('theme')) ?? THEMES[0];
const scene = params.get('scene');
const handleExampleAction = (action: string): void => {
    window.dispatchEvent(new CustomEvent('sarak:composition-example-action', { detail: action }));
};

const content = scene === 'detail'
    ? <ProjectDetailPage
        project={PROJECT_DETAIL}
        onBack={() => handleExampleAction('voltar')}
        onEdit={() => handleExampleAction('editar')}
        onNavigate={(href) => handleExampleAction(`navegar para ${href}`)}
    />
    : <ProjectListPage
        projects={PROJECTS}
        searchTerm=""
        status="all"
        view="recent"
        loading={false}
        onCreateProject={() => handleExampleAction('criar projeto')}
        onExport={() => handleExampleAction('exportar projetos')}
        onSearchChange={(value) => handleExampleAction(`buscar ${value}`)}
        onStatusChange={(value) => handleExampleAction(`filtrar por ${value}`)}
        onViewChange={(value) => handleExampleAction(`visualizar ${value}`)}
        onOpenProject={(href) => handleExampleAction(`navegar para ${href}`)}
        onArchiveProject={(id) => handleExampleAction(`arquivar ${id}`)}
    />;

createRoot(rootElement).render(
    <SarakDesignScope design={theme.design} data-theme={theme.id}>
        {content}
    </SarakDesignScope>,
);
