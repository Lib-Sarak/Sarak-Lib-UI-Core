import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import * as ComponentModule from '../SarakStats';
import { SarakStats } from '../SarakStats';

describe('SarakStats', () => {
    it('should be defined and export its contents without crashing', () => {
        expect(ComponentModule).toBeDefined();
        // TODO: Injetar testes de montagem profunda caso o componente cresça em complexidade
    });

    // plan-41: `statsGrid.className` traz `@min-[1024px]:grid-cols-4` (container query),
    // que só ativa com um ancestral `container-type`. jsdom não avalia container query —
    // este teste prova só que o wrapper `@container` foi PLANTADO como ancestral do
    // grid, não que a query casou (prova real só em browser, plan-40).
    it('planta um wrapper @container como ancestral do grid (não prova que a query casa — jsdom não avalia container query)', () => {
        const { container } = render(<SarakStats data={{ total: 3 }} />);

        const wrapper = container.firstElementChild as HTMLElement;
        expect(wrapper.className).toContain('@container');

        const grid = wrapper.firstElementChild as HTMLElement;
        expect(grid.className).toContain('grid');
        expect(grid.className).not.toContain('@container');
    });
});
