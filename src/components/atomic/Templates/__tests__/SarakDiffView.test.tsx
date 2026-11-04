import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SarakDiffView } from '../SarakDiffView';

describe('SarakDiffView', () => {
    it('em campos, escreve o tipo de cada mudança além da cor e esconde o que não mudou', () => {
        const { container } = render(
            <SarakDiffView
                fields={[
                    { label: 'Nome', before: 'Ana', after: 'Ana Maria' },
                    { label: 'Apelido', after: 'Aninha' },
                    { label: 'Telefone', before: '1111' },
                    { label: 'País', before: 'BR', after: 'BR' },
                ]}
            />,
        );

        expect(container.querySelector('[data-diff-field="changed"]')).toHaveTextContent('Alterado');
        expect(container.querySelector('[data-diff-field="added"]')).toHaveTextContent('Adicionado');
        expect(container.querySelector('[data-diff-field="removed"]')).toHaveTextContent('Removido');
        expect(container.querySelector('[data-diff-field="unchanged"]')).toBeNull();
        expect(screen.queryByText('País')).not.toBeInTheDocument();
        expect(screen.getAllByText('Antes')).toHaveLength(3);
        expect(screen.getAllByText('(vazio)')).toHaveLength(2);
    });

    it('showUnchanged traz de volta os campos iguais', () => {
        render(<SarakDiffView showUnchanged fields={[{ label: 'País', before: 'BR', after: 'BR' }]} />);

        expect(screen.getByText('País')).toBeInTheDocument();
        expect(screen.getByText('Sem alteração')).toBeInTheDocument();
    });

    it('sem diferenças, avisa em texto', () => {
        render(<SarakDiffView fields={[{ label: 'País', before: 'BR', after: 'BR' }]} />);

        expect(screen.getByRole('status')).toHaveTextContent('Sem diferenças.');
    });

    it('em texto, marca cada linha com símbolo e com palavra para leitor de tela', () => {
        render(<SarakDiffView before={'um\ndois\ntrês'} after={'um\nDOIS\ntrês\nquatro'} />);
        const lines = screen.getAllByRole('listitem');

        expect(lines).toHaveLength(5);
        expect(lines.map((line) => line.getAttribute('data-line'))).toEqual(['same', 'removed', 'added', 'same', 'added']);
        expect(within(lines[1]).getByText(/Removido/)).toHaveClass('sr-only');
        expect(within(lines[2]).getByText(/Adicionado/)).toHaveClass('sr-only');
        expect(lines[1]).toHaveTextContent('−');
        expect(lines[2]).toHaveTextContent('+');
    });

    it('em texto idêntico, avisa que não há diferença', () => {
        render(<SarakDiffView before="igual" after="igual" />);

        expect(screen.getByRole('status')).toHaveTextContent('Sem diferenças.');
    });
});
