import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { SarakPagination } from '../Navigation/SarakPagination';
import { SarakBreadcrumbs } from '../Navigation/SarakBreadcrumbs';
import { SarakStepper } from '../Navigation/SarakStepper';
import { SarakLink } from '../Navigation/SarakLink';
import { SarakShellNav } from '../Navigation/SarakShellNav';
import { SarakSpotlight } from '../Navigation/SarakSpotlight';
import { SarakEmptyState } from '../Feedback/SarakEmptyState';
import { SarakModal } from '../Modals/SarakModal';
import { SarakDrawer } from '../Modals/SarakDrawer';
import { SarakDatePicker } from '../Inputs/SarakDatePicker';
import { SarakUploader } from '../Inputs/SarakUploader';
import { SarakSearch } from '../Inputs/SarakSearch';

/**
 * R34 — "o átomo renderiza sem Provider": todo componente de
 * `src/components/atomic/**` que lê o catálogo de idioma da lib precisa
 * renderizar SEM `SarakUIProvider` e mostrar o texto padrão em português (a
 * base do catálogo). Ficam de fora só os widgets `Shell*`
 * (`ShellSearchWidget`, `ShellUserWidget`, `ShellThemeToggle`,
 * `ShellFontSizeControl`, `ShellNavigationStyleControl`,
 * `ShellPreferencesMenu`, `ShellLanguageSelector`), que por contrato montam
 * sob o Provider (specs/05 §2.2).
 *
 * Este teste cai se qualquer um destes componentes voltar a exigir Provider
 * (via `useSarakUI()` em vez de `useSarakUIOptional()`) para exibir o texto.
 */
describe('Componentes de src/components/atomic/** renderizam sem Provider, em português (R34)', () => {
    it('SarakPagination', () => {
        render(<SarakPagination current={1} total={5} onChange={() => {}} />);
        expect(screen.getByLabelText('Paginação')).toBeInTheDocument();
    });

    it('SarakBreadcrumbs', () => {
        render(<SarakBreadcrumbs items={[{ label: 'Início' }]} />);
        expect(screen.getByLabelText('Trilha de navegação')).toBeInTheDocument();
    });

    it('SarakStepper', () => {
        render(<SarakStepper steps={[{ label: 'Conta' }]} current={0} />);
        expect(screen.getByLabelText('Progresso por etapas')).toBeInTheDocument();
    });

    it('SarakLink', () => {
        render(<SarakLink href="https://exemplo.com" external>Site</SarakLink>);
        expect(screen.getByText('(abre em nova aba)', { exact: false })).toBeInTheDocument();
    });

    it('SarakShellNav', () => {
        render(<SarakShellNav items={[{ label: 'Início', route: '/' }]} />);
        expect(screen.getByLabelText('Navegação principal')).toBeInTheDocument();
    });

    it('SarakSpotlight', () => {
        render(<SarakSpotlight items={[]} open onSelect={() => {}} />);
        expect(screen.getByLabelText('Campo de busca')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Buscar…')).toBeInTheDocument();
    });

    it('SarakEmptyState', () => {
        const { container } = render(<SarakEmptyState />);
        expect(container.textContent).toContain('Sistema');
    });

    it('SarakModal', () => {
        render(
            <SarakModal isOpen onClose={() => {}}>
                <span>corpo</span>
            </SarakModal>,
        );
        expect(screen.getByLabelText('Fechar modal')).toBeInTheDocument();
    });

    it('SarakDrawer', () => {
        render(
            <SarakDrawer isOpen onClose={() => {}}>
                <span>corpo</span>
            </SarakDrawer>,
        );
        expect(screen.getByLabelText('Fechar painel')).toBeInTheDocument();
    });

    it('SarakDatePicker', () => {
        render(<SarakDatePicker />);
        expect(screen.getByText('Selecione…')).toBeInTheDocument();
    });

    it('SarakUploader', () => {
        render(<SarakUploader />);
        expect(screen.getByText('Arraste arquivos ou clique para selecionar')).toBeInTheDocument();
    });

    it('SarakSearch', () => {
        render(<SarakSearch isOpen onClose={() => {}} items={[]} />);
        expect(screen.getByPlaceholderText('Buscar ferramenta, registro ou configuração…')).toBeInTheDocument();
    });
});
