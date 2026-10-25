import type { ReactElement } from 'react';
import {
    SarakBadge,
    SarakButton,
    SarakFilterBar,
    SarakFlex,
    SarakInput,
    SarakPageHeader,
    SarakResourceRow,
    SarakSection,
    SarakSegmentedControl,
    SarakSelect,
} from '@sarak/lib-ui-core';

export interface ProjectListRecord {
    id: string;
    title: string;
    description: string;
    status: string;
    updatedAt: string;
    owners: string;
}

export interface ProjectListPageProps {
    projects: ProjectListRecord[];
    searchTerm: string;
    status: string;
    view: string;
    loading: boolean;
    error?: { title: string; message: string; onRetry: () => void };
    onCreateProject: () => void;
    onExport: () => void;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onViewChange: (value: string) => void;
    onOpenProject: (href: string) => void;
    onArchiveProject: (id: string) => void;
}

export function ProjectListPage(props: ProjectListPageProps): ReactElement {
    return (
        <SarakFlex as="main" direction="column" gap="spacing-lg" wrap={false} aria-label="Lista de projetos">
            <ProjectPageHeader onCreateProject={props.onCreateProject} />
            <ProjectFilterBar {...props} />
            <ProjectViewSelector value={props.view} onValueChange={props.onViewChange} />
            <ProjectListSection {...props} />
        </SarakFlex>
    );
}

function ProjectPageHeader({ onCreateProject }: Pick<ProjectListPageProps, 'onCreateProject'>): ReactElement {
    return (
        <SarakPageHeader
            title="Projetos"
            subtitle="Acompanhe as iniciativas e as equipes responsáveis."
            primaryActions={<SarakButton type="button" onClick={onCreateProject}>Novo projeto</SarakButton>}
        />
    );
}

function ProjectFilterBar({ searchTerm, status, onSearchChange, onStatusChange, onExport }: ProjectListPageProps): ReactElement {
    return (
        <SarakFilterBar ariaLabel="Filtros de projetos">
            <SarakInput
                label="Buscar projetos"
                type="search"
                placeholder="Nome ou descrição"
                value={searchTerm}
                onChange={(event) => onSearchChange(event.target.value)}
            />
            <SarakSelect label="Situação" value={status} onChange={(event) => onStatusChange(event.target.value)}>
                <option value="all">Todas</option>
                <option value="active">Ativos</option>
                <option value="paused">Pausados</option>
            </SarakSelect>
            <SarakButton type="button" variant="secondary" onClick={onExport}>Exportar</SarakButton>
        </SarakFilterBar>
    );
}

function ProjectViewSelector({ value, onValueChange }: Pick<ProjectListPageProps, 'view' | 'onViewChange'>): ReactElement {
    return (
        <SarakSegmentedControl
            ariaLabel="Visualização dos projetos"
            value={value}
            onValueChange={onValueChange}
            options={[
                { value: 'recent', label: 'Recentes' },
                { value: 'all', label: 'Todos' },
                { value: 'favorites', label: 'Favoritos' },
            ]}
        />
    );
}

function ProjectListSection(props: ProjectListPageProps): ReactElement {
    const error = props.error ? {
        title: props.error.title,
        message: props.error.message,
        retryLabel: 'Tentar novamente',
        onRetry: props.error.onRetry,
    } : undefined;
    const emptyState = props.projects.length === 0 ? {
        title: 'Nenhum projeto encontrado',
        description: 'Ajuste os filtros ou crie um projeto novo.',
        action: <SarakButton type="button" onClick={props.onCreateProject}>Criar projeto</SarakButton>,
    } : undefined;

    return (
        <SarakSection
            title="Projetos"
            description={`${props.projects.length} projetos nesta visualização`}
            loading={props.loading}
            loadingLabel="Carregando projetos"
            error={error}
            emptyState={emptyState}
            actions={<SarakButton type="button" variant="ghost" onClick={props.onExport}>Baixar relatório</SarakButton>}
        >
            {props.projects.map((project) => (
                <ProjectResourceItem
                    key={project.id}
                    project={project}
                    onOpenProject={props.onOpenProject}
                    onArchiveProject={props.onArchiveProject}
                />
            ))}
        </SarakSection>
    );
}

function ProjectResourceItem({
    project,
    onOpenProject,
    onArchiveProject,
}: {
    project: ProjectListRecord;
    onOpenProject: ProjectListPageProps['onOpenProject'];
    onArchiveProject: ProjectListPageProps['onArchiveProject'];
}): ReactElement {
    return (
        <SarakResourceRow
            title={project.title}
            description={project.description}
            href={`/projetos/${project.id}`}
            onNavigate={onOpenProject}
            badges={[<SarakBadge key="status" size="sm">{project.status}</SarakBadge>]}
            metadata={[
                { label: 'Atualizado em', value: project.updatedAt },
                { label: 'Responsáveis', value: project.owners },
            ]}
            actions={[{ label: 'Arquivar', variant: 'ghost', onClick: () => onArchiveProject(project.id) }]}
        />
    );
}
