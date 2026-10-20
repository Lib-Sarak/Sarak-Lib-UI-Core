import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import * as ComponentModule from '../RecursiveMatrixNode';
import { RecursiveMatrixNode } from '../RecursiveMatrixNode';
import type { SarakMatrixManifest } from '../../SarakExpandableMatrix';
import type { SarakMatrixTreeNode } from '../matrixTree';

describe('RecursiveMatrixNode', () => {
    it('should be defined and export its contents without crashing', () => {
        expect(ComponentModule).toBeDefined();
        // TODO: Injetar testes de montagem profunda caso o componente cresça em complexidade
    });

    it.each([
        ['card', 'card'],
        ['row', 'card'],
        ['clean', 'card'],
        ['card', 'badge'],
    ] as const)('o espaçamento dos filhos usa matrixGap no layout %s/%s', (parentVariant, childVariant) => {
        const item: SarakMatrixTreeNode = {
            id: 'parent',
            name: 'Parent',
            children: [{ id: 'child', name: 'Child' }],
        };
        const manifest: SarakMatrixManifest = {
            levels: {
                0: { variant: parentVariant, hasExpand: true, defaultExpanded: true },
                1: { variant: childVariant },
            },
        };
        const { container } = render(
            <RecursiveMatrixNode
                item={item}
                parentId="root"
                level={0}
                activeMapping={() => false}
                onToggle={() => undefined}
                manifest={manifest}
            />,
        );
        const childList = container.querySelector('[style*="gap: var(--sarak-matrix-gap"]') as HTMLElement;

        expect(childList).not.toBeNull();
        expect(childList.style.gap).toBe('var(--sarak-matrix-gap, 12px)');
    });
});
