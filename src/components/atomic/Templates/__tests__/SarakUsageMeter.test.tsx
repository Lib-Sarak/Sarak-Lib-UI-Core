import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SarakUsageMeter } from '../SarakUsageMeter';

const LEVELS: Array<[number, string]> = [
    [50, 'Dentro do limite'],
    [80, 'Perto do limite'],
    [96, 'Limite quase esgotado'],
    [120, 'Limite excedido'],
];

describe('SarakUsageMeter', () => {
    it('mostra "X de Y", a unidade e a porcentagem', () => {
        render(<SarakUsageMeter label="Armazenamento" used={1500} limit={2000} unit="GB" />);

        expect(screen.getByText('1.500 GB de 2.000 GB (75%)')).toBeInTheDocument();
        expect(screen.getByRole('progressbar', { name: 'Armazenamento' })).toBeInTheDocument();
    });

    it.each(LEVELS)('com %s%% usado, escreve "%s", além da cor', (used, word) => {
        render(<SarakUsageMeter label="Chamadas" used={used} limit={100} />);

        expect(screen.getByRole('status')).toHaveTextContent(word);
    });

    it('os pontos de aviso e de crítico são configuráveis', () => {
        render(<SarakUsageMeter label="Chamadas" used={50} limit={100} warnAt={0.4} criticalAt={0.9} />);

        expect(screen.getByRole('status')).toHaveTextContent('Perto do limite');
    });

    it('limite zero sem uso não divide por zero e fica dentro do limite', () => {
        render(<SarakUsageMeter label="Chamadas" used={0} limit={0} />);

        expect(screen.getByRole('status')).toHaveTextContent('Dentro do limite');
    });

    it('limite zero com uso positivo é excesso, sem porcentagem infinita', () => {
        render(<SarakUsageMeter label="Chamadas" used={5} limit={0} />);

        expect(screen.getByRole('status')).toHaveTextContent('Limite excedido');
        expect(screen.getByText('5 de 0')).toBeInTheDocument();
        expect(document.body.textContent).not.toMatch(/Infinity|NaN/);
    });
});
