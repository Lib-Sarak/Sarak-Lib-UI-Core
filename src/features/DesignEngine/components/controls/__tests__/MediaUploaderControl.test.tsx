import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';
import { SarakUIProvider } from '../../../../../core/Provider/SarakUIProvider';
import { MediaUploaderControl } from '../MediaUploaderControl';
import { TypographySchema } from '../../../../../core/Design/schema/typography';

describe('MediaUploaderControl', () => {
    it('exibe rótulo com tamanho mínimo, caixa e espaçamento normais', () => {
        render(
            <SarakUIProvider>
                <MediaUploaderControl label="Imagem de fundo" value={null} onChange={() => undefined} />
            </SarakUIProvider>,
        );

        const label = screen.getByText('Imagem de fundo');
        expect(label).toHaveClass('normal-case', 'tracking-normal');
        expect(label.className).toContain('--sarak-type-scale-caption');

        const captionToken = TypographySchema.tokens.find(({ id }) => id === 'typeScaleCaption');
        expect(Number(captionToken?.defaultValue)).toBeGreaterThanOrEqual(12);
    });
});
