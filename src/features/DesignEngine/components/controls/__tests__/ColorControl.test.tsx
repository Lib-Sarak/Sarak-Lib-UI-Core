import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { ColorControl } from '../ColorControl';
import { TypographySchema } from '../../../../../core/Design/schema/typography';

describe('ColorControl', () => {
    it('exibe rótulo com tamanho mínimo, caixa e espaçamento normais', () => {
        render(<ColorControl label="Cor de fundo" value="#ffffff" onChange={() => undefined} />);

        const label = screen.getByText('Cor de fundo');
        expect(label).toHaveClass('normal-case', 'tracking-normal');
        expect(label.className).toContain('--sarak-type-scale-caption');

        const captionToken = TypographySchema.tokens.find(({ id }) => id === 'typeScaleCaption');
        expect(Number(captionToken?.defaultValue)).toBeGreaterThanOrEqual(12);
    });
});
