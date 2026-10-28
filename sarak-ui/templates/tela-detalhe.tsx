import type { ReactElement } from 'react';
import {
    SarakButton,
    SarakDescriptionList,
    SarakFlex,
    SarakPageHeader,
    SarakResourceRow,
    SarakSection,
} from '@sarak/lib-ui-core';

export interface ProjectDetail {
    name: string;
    code: string;
    status: string;
    owner: string;
    team: string;
    createdAt: string;
    description: string;
    activities: Array<{ title: string; description: string; happenedAt: string; author: string }>;
}

export interface ProjectDetailPageProps {
    project: ProjectDetail;
    onBack: () => void;
    onEdit: () => void;
    onNavigate: (href: string) => void;
}

export function ProjectDetailPage({ project, onBack, onEdit, onNavigate }: ProjectDetailPageProps): ReactElement {
    return (
        <SarakFlex direction="column" gap="spacing-lg" wrap={false}>
            <ProjectDetailHeader project={project} onBack={onBack} onEdit={onEdit} onNavigate={onNavigate} />
            <ProjectOverviewSection project={project} />
            <ProjectActivitySection activities={project.activities} />
        </SarakFlex>
    );
}

function ProjectDetailHeader({ project, onBack, onEdit, onNavigate }: ProjectDetailPageProps): ReactElement {
    return (
        <SarakPageHeader
            title={project.name}
            subtitle={project.description}
            breadcrumbs={[{ label: 'Projetos', href: '/projetos' }, { label: project.name }]}
            onBreadcrumbNavigate={onNavigate}
            primaryActions={<SarakButton type="button" onClick={onEdit}>Editar projeto</SarakButton>}
            secondaryActions={<SarakButton type="button" variant="secondary" onClick={onBack}>Voltar</SarakButton>}
        />
    );
}

function ProjectOverviewSection({ project }: Pick<ProjectDetailPageProps, 'project'>): ReactElement {
    return (
        <SarakSection title="Visão geral" description="Informações principais do projeto." variant="card">
            <SarakDescriptionList
                aria-label="Dados do projeto"
                items={[
                    { label: 'Código', value: project.code },
                    { label: 'Situação', value: project.status },
                    { label: 'Responsável', value: project.owner },
                    { label: 'Equipe', value: project.team },
                    { label: 'Criado em', value: project.createdAt },
                ]}
            />
        </SarakSection>
    );
}

function ProjectActivitySection({ activities }: Pick<ProjectDetail, 'activities'>): ReactElement {
    return (
        <SarakSection title="Atividade recente" description="Atualizações registradas pela equipe.">
            {activities.map((activity) => <ProjectActivityRow key={`${activity.title}-${activity.happenedAt}`} activity={activity} />)}
        </SarakSection>
    );
}

function ProjectActivityRow({ activity }: { activity: ProjectDetail['activities'][number] }): ReactElement {
    return (
        <SarakResourceRow
            title={activity.title}
            description={activity.description}
            metadata={[{ label: 'Responsável', value: activity.author }, { label: 'Quando', value: activity.happenedAt }]}
        />
    );
}
