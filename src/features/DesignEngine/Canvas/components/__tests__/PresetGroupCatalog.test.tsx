import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import { getPresetGroup } from '../../../../../core/Design/presets/components/registry';
import SarakUIProvider from '../../../../../core/Provider/SarakUIProvider';
import { PresetGroupCatalog } from '../PresetGroupCatalog';

/** Só o caso do "Ver todas" desliga a amostra: ele prova o botão, não o desenho dos 8 pares de fonte. */
const sampleSwitch = vi.hoisted(() => ({ off: false }));
vi.mock('../SampleScope', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../SampleScope')>();
    const Original = actual.SampleScope;
    const Scope = (props: React.ComponentProps<typeof Original>) => (sampleSwitch.off ? null : <Original {...props} />);
    return { ...actual, SampleScope: Scope };
});

const withProvider = (node: React.ReactElement) => <SarakUIProvider>{node}</SarakUIProvider>;

describe('PresetGroupCatalog', () => {
    it('desenha uma opção por preset do grupo, com o nome em português, e o clique aplica o que o preset escreve', () => {
        const onApplyPreset = vi.fn();
        render(withProvider(<PresetGroupCatalog groupId="switch" onApplyPreset={onApplyPreset} currentMode="dark" />));
        const group = getPresetGroup('switch')!;
        expect(document.querySelectorAll('[data-option-tile]')).toHaveLength(group.featured.length);

        fireEvent.click(screen.getByRole('button', { name: 'Tátil' }));
        expect(onApplyPreset).toHaveBeenCalledWith(group.presets[0].design, true);
    });

    it('um grupo que o registro não conhece não desenha nada', () => {
        const { container } = render(<PresetGroupCatalog groupId="nao-existe" onApplyPreset={vi.fn()} currentMode="dark" />);
        expect(container).toBeEmptyDOMElement();
    });

    it('grupo com mais opções que as destacadas oferece o "Ver todas"', () => {
        sampleSwitch.off = true;
        try {
            render(<PresetGroupCatalog groupId="fontPairs" onApplyPreset={vi.fn()} currentMode="light" />);
            expect(screen.getByRole('button', { name: /Ver todas \(12\)/ })).toBeInTheDocument();
        } finally {
            sampleSwitch.off = false;
        }
    });
});
