import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import SarakUIProvider from '../../../../../core/Provider/SarakUIProvider';
import { DecisionSectionList, DecisionTokenList, enhanceToken } from '../DecisionTokenList';

const token = (id: string, label: string) => ({ id, label, type: 'text' as const, defaultValue: '' });
const catalogMap = new Map([['headingFont', { name: 'Fonte dos títulos', description: 'A família do título.' }]]);
const common = { catalogMap, draft: {} as never, updateDraft: vi.fn(), previewDevice: 'desktop' };

describe('DecisionTokenList', () => {
    it('enhanceToken: o nome e a descrição do catálogo vencem os do schema; sem entrada, vale o schema', () => {
        expect(enhanceToken(token('headingFont', 'Fonte'), catalogMap)).toMatchObject({ label: 'Fonte dos títulos', description: 'A família do título.' });
        expect(enhanceToken(token('outro', 'Outro'), catalogMap)).toMatchObject({ label: 'Outro' });
    });

    it('cada token vira uma linha com o id, por onde a busca o encontra e o põe em foco', () => {
        render(<SarakUIProvider><DecisionTokenList tokens={[token('headingFont', 'Fonte'), token('outro', 'Outro')]} {...common} /></SarakUIProvider>);

        const rows = Array.from(document.querySelectorAll('[data-token-row]'));
        expect(rows.map((row) => row.getAttribute('data-token-row'))).toEqual(['headingFont', 'outro']);
        rows.forEach((row) => expect(row).toHaveAttribute('tabindex', '-1'));
    });

    it('as seções têm título e agrupam os controles delas', () => {
        render(
            <SarakUIProvider>
                <DecisionSectionList sections={[{ title: 'Geometria', tokens: [token('a', 'A')] }, { title: 'Efeitos', tokens: [token('b', 'B')] }]} {...common} />
            </SarakUIProvider>,
        );

        expect(screen.getByRole('region', { name: 'Geometria' }).querySelector('[data-token-row="a"]')).not.toBeNull();
        expect(screen.getByRole('region', { name: 'Efeitos' }).querySelector('[data-token-row="b"]')).not.toBeNull();
    });
});
