import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SarakDeviceProvider } from '../../../../core/Provider/DeviceProvider';
import { SarakInput } from '../../Inputs/SarakInput';
import { SarakFormSection } from '../SarakFormSection';

const REQUESTED_MOBILE_COLUMNS = 4;
const REQUESTED_TABLET_COLUMNS = 2;
const REQUESTED_DESKTOP_COLUMNS = 3;

describe('SarakFormSection', () => {
    it('expõe o título como nome do grupo e liga a descrição ao fieldset', () => {
        render(
            <SarakFormSection title="Faturamento" description="Dados da nota">
                <SarakInput label="Valor" />
            </SarakFormSection>,
        );

        const group = screen.getByRole('group', { name: 'Faturamento' });
        expect(group).toHaveAccessibleDescription('Dados da nota');
        expect(group.querySelector('legend')).toHaveTextContent('Faturamento');
    });

    it('desabilita os campos e força uma coluna no celular', () => {
        render(
            <SarakDeviceProvider overrideDevice="smartphone">
                <SarakFormSection
                    title="Contato"
                    columns={{ mob: REQUESTED_MOBILE_COLUMNS, tab: REQUESTED_TABLET_COLUMNS, desk: REQUESTED_DESKTOP_COLUMNS }}
                    disabled
                >
                    <SarakInput label="E-mail" />
                </SarakFormSection>
            </SarakDeviceProvider>,
        );

        expect(screen.getByRole('textbox', { name: 'E-mail' })).toBeDisabled();
        expect(screen.getByTestId('sarak-form-section-fields')).toHaveStyle({ gridTemplateColumns: 'repeat(1, minmax(0, 1fr))' });
    });
});
