import fs from 'node:fs';
import path from 'node:path';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SarakButton } from '../Buttons/SarakButton';
import { SarakIconButton } from '../Buttons/SarakIconButton';
import { PremiumSwitch } from '../Templates/components/PremiumSwitch';
import { MessageBubble } from '../Templates/Chat/MessageBubble';
import { SarakTableGrid, type SarakTableViewProps } from '../Templates/SarakTableViewParts';
import { SarakUIProvider } from '../../../core/Provider/SarakUIProvider';
import type { TableInteractionsResult } from '../DataDisplay/SarakDataTable/useTableInteractions';

/**
 * O componente lê o token que o nomeia. O que o navegador computa (a variável vencendo a reserva) é
 * prova de `browser-tests/componente-le-o-token.spec.ts`; aqui, a CLASSE/ESTILO que o componente
 * escreve — a ponte entre o token e a tela — e o texto dos fontes onde o jsdom não alcança.
 */

const COMPONENTS_DIR = path.join(process.cwd(), 'src/components');

const walkTsx = (dir: string, out: string[] = []): string[] => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name !== '__tests__') walkTsx(full, out);
        } else if (/\.tsx$/.test(entry.name)) out.push(full);
    }
    return out;
};

const readSource = (relative: string): string => fs.readFileSync(path.join(COMPONENTS_DIR, relative), 'utf-8');

describe('botão: o primário lê btnPrimaryBg e btnPrimaryText (e não o texto mudo sobre a cor primária)', () => {
    it('SarakButton primary: fundo e texto são as variáveis dos tokens', () => {
        render(<SarakButton>Salvar</SarakButton>);
        const classes = screen.getByRole('button', { name: 'Salvar' }).className;

        expect(classes).toContain('bg-[var(--sarak-btn-primary-bg,#19e3f0)]');
        expect(classes).toContain('text-[var(--sarak-btn-primary-text,#04121a)]');
        expect(classes).not.toContain('text-[var(--text-muted');
    });

    it('SarakButton primary borderline: o preenchimento do hover lê o par do token', () => {
        render(<SarakUIProvider config={{ btnStyleType: 'borderline' }}><SarakButton>Salvar</SarakButton></SarakUIProvider>);
        const classes = screen.getByRole('button', { name: 'Salvar' }).className;

        expect(classes).toContain('hover:bg-[var(--sarak-btn-primary-bg,#19e3f0)]');
        expect(classes).toContain('hover:text-[var(--sarak-btn-primary-text,#04121a)]');
    });

    it('SarakButton secondary: o fundo é btnSecondaryBg e o hover usa o par primário legível', () => {
        render(<SarakButton variant="secondary">Cancelar</SarakButton>);
        const classes = screen.getByRole('button', { name: 'Cancelar' }).className;

        expect(classes).toContain('bg-[var(--sarak-btn-secondary-bg,rgba(255,255,255,0.05))]');
        expect(classes).not.toContain('--color-theme-card');
        expect(classes).toContain('hover:text-[var(--sarak-btn-primary-text,#04121a)]');
    });

    it.each(['neon', 'frosted'])('SarakButton secondary em estilo %s: o fundo inline é btnSecondaryBg', (btnStyleType) => {
        render(<SarakUIProvider config={{ btnStyleType }}><SarakButton variant="secondary">Cancelar</SarakButton></SarakUIProvider>);

        expect(screen.getByRole('button', { name: 'Cancelar' }).style.backgroundColor).toContain('--sarak-btn-secondary-bg');
    });

    it('SarakIconButton: primário e secundário leem os mesmos tokens', () => {
        render(<>
            <SarakIconButton icon={<i />} aria-label="p" />
            <SarakIconButton icon={<i />} variant="secondary" aria-label="s" />
        </>);

        const primary = screen.getByRole('button', { name: 'p' }).className;
        const secondary = screen.getByRole('button', { name: 's' }).className;
        expect(primary).toContain('bg-[var(--sarak-btn-primary-bg,#19e3f0)]');
        expect(primary).toContain('text-[var(--sarak-btn-primary-text,#04121a)]');
        expect(secondary).toContain('bg-[var(--sarak-btn-secondary-bg,rgba(255,255,255,0.05))]');
    });

    it('SarakIconButton neon: o brilho é a variável do token, e o do perigo vem da cor de erro do tema', () => {
        render(<SarakUIProvider config={{ btnStyleType: 'neon' }}>
            <SarakIconButton icon={<i />} aria-label="p" />
            <SarakIconButton icon={<i />} variant="danger" aria-label="d" />
        </SarakUIProvider>);

        expect(screen.getByRole('button', { name: 'p' }).style.boxShadow).toContain('--sarak-btn-neon-glow-color');
        const danger = screen.getByRole('button', { name: 'd' }).style.boxShadow;
        expect(danger).toContain('--sarak-status-error-color');
        expect(danger).not.toContain('239, 68, 68');
    });
});

describe('tabela: cabeçalho, linha e esqueleto leem os tokens da tabela', () => {
    const row = { id: 1, name: 'Ana' };
    const interactions: TableInteractionsResult<typeof row> = {
        entries: [{ row, index: 0, key: row.id }],
        sort: null,
        selectedKeys: new Set(),
        allVisibleSelected: false,
        partiallySelected: false,
        changeSort: vi.fn(),
        toggleRow: vi.fn(),
        toggleAll: vi.fn(),
    };
    const baseProps = (loading: boolean): SarakTableViewProps<typeof row> => ({
        filteredData: [row],
        interactions,
        columns: [{ key: 'name', label: 'Nome' }],
        columnKeys: ['name'],
        columnLabels: { name: 'Nome' },
        role: 'neutral',
        density: 'standard',
        loading,
        error: null,
        collapseToCards: false,
        canRefresh: false,
        showSearch: false,
        selectable: false,
        search: '',
        onSearchChange: vi.fn(),
        onRefresh: vi.fn(),
        cellDensityClass: 'cell',
        containerClassName: 'container',
    });

    it('cabeçalho: tableHeaderBg; linha: tableRowHoverBg e tableBorderColor', () => {
        const { container } = render(<SarakUIProvider><SarakTableGrid props={baseProps(false)} /></SarakUIProvider>);

        expect(container.querySelector('thead tr')?.className).toContain('bg-[var(--sarak-table-header-bg,');
        const rowClasses = container.querySelector('tbody tr')?.className ?? '';
        expect(rowClasses).toContain('hover:bg-[var(--sarak-table-row-hover,');
        expect(rowClasses).toContain('border-[var(--sarak-table-border,');
        expect(rowClasses).not.toMatch(/white\//);
    });

    it('esqueleto: o raio é skeletonRowRadius', () => {
        const { container } = render(<SarakUIProvider><SarakTableGrid props={baseProps(true)} /></SarakUIProvider>);

        const bar = container.querySelector('tbody tr td div');
        expect(bar?.className).toContain('rounded-[var(--sarak-skeleton-row-radius,4px)]');
        expect(bar?.className).not.toContain('rounded-md');
    });
});

describe('switch, chat: valores fixos viram token', () => {
    it('PremiumSwitch: o polegar é switchThumbBg', () => {
        const { container } = render(<PremiumSwitch checked={false} onChange={vi.fn()} />);

        expect(container.innerHTML).toContain('bg-[var(--sarak-switch-thumb,#ffffff)]');
        expect(container.innerHTML).not.toContain('bg-white');
    });

    it('MessageBubble: as etiquetas usam chatBubbleRadius e a bolha não tem a sombra fixa', () => {
        const { container } = render(
            <SarakUIProvider>
                <MessageBubble msg={{ id: '1', role: 'assistant', content: 'Oi', metadata: { model: 'm', reasoning: 'r' } } as never} />
            </SarakUIProvider>,
        );

        expect(container.innerHTML).toContain('rounded-[var(--sarak-chat-radius,12px)]');
        expect(container.innerHTML).not.toContain('rounded-md');
        expect(container.innerHTML).not.toContain('shadow-xl');
    });
});

describe('texto dos fontes: o que o jsdom não renderiza (sobreposição, modal, AuthForm, durações, cartões)', () => {
    it('sobreposições: a cor e o desfoque vêm de modalOverlayColor/modalOverlayBlur (ou searchBackdropBlur)', () => {
        const analytical = readSource('Layout/SarakAnalyticalPage.tsx');
        const spotlight = readSource('atomic/Navigation/SarakSpotlight.tsx');

        expect(analytical).not.toMatch(/bg-black\/50/);
        expect(analytical.match(/bg-\[var\(--sarak-modal-overlay-color,/g)).toHaveLength(2);
        expect(analytical).toContain('backdrop-blur-[var(--sarak-modal-blur,8px)]');
        expect(spotlight).not.toMatch(/bg-black\/50/);
        expect(spotlight).toContain('bg-[var(--sarak-modal-overlay-color,');
        expect(spotlight).toContain('backdrop-blur-[var(--sarak-search-backdrop-blur,8px)]');
    });

    it('modal: os botões não trocam o raio de btnBorderRadius por rounded-md', () => {
        expect(readSource('atomic/Modals/SarakModal.tsx')).not.toMatch(/rounded-md/);
    });

    it('AuthForm: aviso, erro e sucesso são as cores de status do tema', () => {
        const source = readSource('atomic/Templates/components/AuthForm.tsx');

        expect(source).not.toMatch(/\b(amber|red|emerald)-\d{3}\b/);
        expect(source).toContain('var(--sarak-status-warning-color,');
        expect(source).toContain('var(--sarak-status-error-color,');
        expect(source).toContain('var(--sarak-status-success-color,');
    });

    it('cartões: a etiqueta de rascunho é o tema (sem preto fixo nem sombra ciano fixa)', () => {
        for (const file of ['SarakTitleCard', 'SarakActionCard', 'SarakSearchCard']) {
            const source = readSource(`atomic/Cards/${file}.tsx`);
            expect(source, file).not.toContain('bg-black/60');
            expect(source, file).not.toContain('shadow-[0_0_10px_rgba(0,242,255,0.05)]');
            expect(source, file).toContain('shadow-[0_0_10px_var(--sarak-card-glow-color,');
        }
    });

    it('SarakActionCard: a cor de sombra do brilho não é usada como cor de texto', () => {
        expect(readSource('atomic/Cards/SarakActionCard.tsx')).not.toMatch(/text-\[var\(--sarak-shadow-glow/);
    });

    it('nenhum fundo de cartão da lib repete a classe de fundo que o tema já entrega', () => {
        const offenders = walkTsx(COMPONENTS_DIR).filter((file) => {
            const source = fs.readFileSync(file, 'utf-8');
            return source.split('\n').some((line) => /className/.test(line)
                && /(?<![\w-])(sarak-card|card)(?![\w-])/.test(line.split('bg-[var(--color-theme-card')[0])
                && line.includes('bg-[var(--color-theme-card'));
        });

        expect(offenders.map((file) => path.relative(COMPONENTS_DIR, file))).toEqual([]);
    });

    it('nenhuma duração de transição de classe é literal: leem motionDuration*', () => {
        const offenders = walkTsx(COMPONENTS_DIR).filter((file) => /(?<![\w-])duration-(200|300|500|700)(?![\w-])/.test(fs.readFileSync(file, 'utf-8')));

        expect(offenders.map((file) => path.relative(COMPONENTS_DIR, file))).toEqual([]);
        expect(readSource('atomic/Inputs/SarakSwitch.tsx')).toContain('duration-[var(--duration-normal,0.3s)]');
    });

    it('SarakFlowEngine: flowGridStyle mapeia cada opção para sua variante de fundo', () => {
        const source = readSource('engines/flows/SarakFlowEngine.tsx');
        const gridVariants = source.match(/const GRID_VARIANTS:[^{]*\{([^}]*)\}/)?.[1] ?? '';

        expect(source).toMatch(/GRID_VARIANTS\[String\(flowGridStyle\)\]/);
        expect(gridVariants).toMatch(/\bdots:\s*['"]dots['"]\s+as FlowBackgroundVariant/);
        expect(gridVariants).toMatch(/\blines:\s*['"]lines['"]\s+as FlowBackgroundVariant/);
    });
});
