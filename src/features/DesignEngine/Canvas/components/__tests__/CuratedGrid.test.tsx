import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';
import { getPresetGroup } from '../../../../../core/Design/presets/components/registry';
import { CuratedGrid } from '../CuratedGrid';

const renderGrid = (groupId: string, sectionOf?: React.ComponentProps<typeof CuratedGrid>['sectionOf']) => render(
    <CuratedGrid group={getPresetGroup(groupId)!} gridClassName="grid-cols-1" sectionOf={sectionOf} renderTile={(preset) => <div key={preset.id} data-testid="tile">{preset.id}</div>} />,
);

describe('CuratedGrid', () => {
    it('mostra só as destacadas e guarda o resto atrás do "Ver todas" com a contagem', () => {
        const group = getPresetGroup('buttons')!;
        renderGrid('buttons');
        expect(screen.getAllByTestId('tile')).toHaveLength(group.featured.length);
        const toggle = screen.getByRole('button', { name: `Ver todas (${group.presets.length})` });
        expect(toggle).toHaveAttribute('aria-expanded', 'false');

        fireEvent.click(toggle);
        expect(screen.getAllByTestId('tile')).toHaveLength(group.presets.length);
        expect(screen.getByRole('button', { name: 'Ver menos' })).toHaveAttribute('aria-expanded', 'true');

        fireEvent.click(screen.getByRole('button', { name: 'Ver menos' }));
        expect(screen.getAllByTestId('tile')).toHaveLength(group.featured.length);
    });

    it('grupo que cabe inteiro não tem "Ver todas"', () => {
        renderGrid('typeScale');
        expect(screen.queryByRole('button')).toBeNull();
        expect(screen.getAllByTestId('tile')).toHaveLength(getPresetGroup('typeScale')!.presets.length);
    });

    it('com "Ver todas" aberto, agrupa pelas seções quando o grupo as tem', () => {
        renderGrid('textures', (preset) => ({ id: preset.id.length > 9 ? 'long' : 'short', title: preset.id.length > 9 ? 'Compridos' : 'Curtos' }));
        fireEvent.click(screen.getByRole('button', { name: /Ver todas/ }));
        expect(screen.getByRole('heading', { name: 'Compridos' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Curtos' })).toBeInTheDocument();
    });
});
