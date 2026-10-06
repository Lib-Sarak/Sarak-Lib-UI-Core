import React from 'react';
import { expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import { SarakModal } from '../../Modals/SarakModal';
import { SarakMenuItem } from '../../Navigation/SarakMenuItem';
import { SarakTable } from '../../Templates/SarakTable';
import { SarakIcon, sarakRegisterIcons, type SarakRegisteredIconProps } from '../SarakIcon';

const ICON_TEST_STROKE_WIDTH = 3;
const DIRECT_ICON_SIZE = 20;

function ConsumerMark(props: SarakRegisteredIconProps): React.ReactElement {
    return <svg data-testid="consumer-mark" width={props.size} strokeWidth={props.strokeWidth} />;
}

it('usa iconFamily do Provider em SarakModal', () => {
    const { container } = render(
        <SarakUIProvider config={{ mode: 'dark', iconFamily: 'phosphor' }}>
            <SarakModal isOpen onClose={() => undefined} title="Amostra" />
        </SarakUIProvider>,
    );

    expect(container.querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 256 256');
});

it('usa iconFamily do Provider nos ícones de SarakTable', () => {
    const { container } = render(
        <SarakUIProvider config={{ mode: 'dark', iconFamily: 'phosphor' }}>
            <SarakTable data={[{ label: 'Amostra' }]} mapping={{ label: 'Rótulo' }} />
        </SarakUIProvider>,
    );
    const iconViewBoxes = Array.from(container.querySelectorAll('svg'))
        .map((icon) => icon.getAttribute('viewBox'));

    expect(iconViewBoxes.length).toBeGreaterThan(0);
    expect(iconViewBoxes.every((viewBox) => viewBox === '0 0 256 256')).toBe(true);
});

it('renderiza nomes registrados pelo consumidor', () => {
    const unregister = sarakRegisterIcons({ ConsumerMark });
    try {
        const { getByTestId } = render(
            <SarakUIProvider config={{ mode: 'dark' }}>
                <SarakIcon name="ConsumerMark" size={DIRECT_ICON_SIZE} />
            </SarakUIProvider>,
        );

        expect(getByTestId('consumer-mark').getAttribute('width')).toBe(String(DIRECT_ICON_SIZE));
    } finally {
        unregister();
    }
});

it('mantém o ícone renderizável sem SarakUIProvider', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    try {
        const { container } = render(<SarakIcon name="Check" />);

        expect(container.querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 24 24');
    } finally {
        warn.mockRestore();
    }
});

it('resolve um nome registrado como ícone de SarakMenuItem', () => {
    const { container } = render(
        <SarakUIProvider config={{ mode: 'dark' }}>
            <SarakMenuItem label="Início" icon="Check" />
        </SarakUIProvider>,
    );

    expect(container.querySelector('svg')).toBeInTheDocument();
});

it('renderiza um elemento fornecido diretamente pelo consumidor', () => {
    const { getByTestId } = render(
        <SarakUIProvider config={{ mode: 'dark', iconWeight: 'regular', iconStrokeWidth: ICON_TEST_STROKE_WIDTH }}>
            <SarakIcon icon={<svg data-testid="direct-mark" />} size={DIRECT_ICON_SIZE} />
        </SarakUIProvider>,
    );
    const icon = getByTestId('direct-mark');

    expect(icon.getAttribute('width')).toBe(String(DIRECT_ICON_SIZE));
    expect(icon.getAttribute('height')).toBe(String(DIRECT_ICON_SIZE));
    expect(icon.getAttribute('stroke-width')).toBe(String(ICON_TEST_STROKE_WIDTH));
});

it('aplica iconStrokeWidth do Provider ao ícone da família', () => {
    const { container } = render(
        <SarakUIProvider config={{ mode: 'dark', iconFamily: 'lucide', iconWeight: 'regular', iconStrokeWidth: ICON_TEST_STROKE_WIDTH }}>
            <SarakIcon name="Check" />
        </SarakUIProvider>,
    );

    expect(container.querySelector('svg')?.getAttribute('stroke-width'))
        .toBe(String(ICON_TEST_STROKE_WIDTH));
});
