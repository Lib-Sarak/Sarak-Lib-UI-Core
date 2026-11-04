import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { InsideAffix, useInsideAffixInset, type InsideAffixes } from '../insideAffix';

const AFFIXES: InsideAffixes = { prefix: 'R$', suffix: undefined, prefixId: 'p', suffixId: 's', hasLeftIcon: true, hasRightIcon: false };

const Probe = ({ affixes }: { affixes?: InsideAffixes }): React.ReactElement => {
    const inset = useInsideAffixInset(affixes);
    return <input aria-label="campo" style={inset.insetStyle} />;
};

describe('insideAffix', () => {
    it('reserva o padding só do lado que tem afixo, depois do ícone se houver', () => {
        render(<Probe affixes={AFFIXES} />);
        const input = screen.getByLabelText('campo');
        expect(input.style.paddingLeft).toContain('* 2.75');
        expect(input.style.paddingRight).toBe('');
    });

    it('sem afixos não mexe no padding', () => {
        render(<Probe />);
        expect(screen.getByLabelText('campo').getAttribute('style') ?? '').toBe('');
    });

    it('InsideAffix fica absoluto, sem capturar o ponteiro', () => {
        render(<InsideAffix id="a" side="right" inset="4px">/mês</InsideAffix>);
        const node = screen.getByText('/mês');
        expect(node.style.position).toBe('absolute');
        expect(node.style.pointerEvents).toBe('none');
    });
});
