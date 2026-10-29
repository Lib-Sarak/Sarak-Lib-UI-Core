import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SarakCard } from '../SarakCard';

const CARD_CSS = fs.readFileSync(path.resolve(__dirname, '../../../../styles/_card-defaults.css'), 'utf8');

describe('SarakCard — density', () => {
    it.each(['sm', 'lg'] as const)('density="%s" marca o cartão com o atributo que o CSS lê', (density) => {
        const { container } = render(<SarakCard density={density}>x</SarakCard>);
        expect((container.firstElementChild as HTMLElement).getAttribute('data-sx-card-density')).toBe(density);
    });

    it('o padrão md (e density="md") não ganha atributo: o cartão não muda', () => {
        const defaultCard = render(<SarakCard>x</SarakCard>).container.firstElementChild as HTMLElement;
        const md = render(<SarakCard density="md">x</SarakCard>).container.firstElementChild as HTMLElement;
        expect(defaultCard.hasAttribute('data-sx-card-density')).toBe(false);
        expect(md.hasAttribute('data-sx-card-density')).toBe(false);
        expect(defaultCard.className).toBe(md.className);
    });

    it('o CSS lê --sarak-card-padding-sm|lg e os deriva do md na raiz, com especificidade zero', () => {
        const root = CARD_CSS.match(/:where\(:root, \.sarak-design-scope\)\s*\{([^}]*)\}/)?.[1] ?? '';
        for (const size of ['sm', 'lg']) {
            expect(root).toContain(`--sarak-card-padding-${size}: calc(var(--sarak-card-padding-md`);
            const rule = CARD_CSS.match(new RegExp(`\\.sarak-card\\[data-sx-card-density="${size}"\\]\\s*\\{([^}]*)\\}`));
            expect(rule?.[1]).toContain(`padding: var(--sarak-card-padding-${size});`);
        }
    });
});
