import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DesignOverrideContext } from '../../../../core/Provider/context';
import { SarakMenuItem } from '../SarakMenuItem';
import { SarakShellSearchWidget } from '../SarakShellSearchWidget';
import {
    MENU_ITEM_LINE_HEIGHT,
    MENU_ITEM_TEXT_CLASS,
    VERTICAL_MENU_ITEM_CLASSES,
    nestedMenuItemIndent,
    verticalMenuItemHeight,
    verticalMenuItemSpacing,
} from '../menuItemMetrics';

const REM = 16;
const ICON = 18;
const toPx = (rem: string): number => parseFloat(rem) * REM;
const DENSITIES = ['compact', 'comfortable', 'spacious'] as const;

describe('menuItemMetrics — a fonte única da linha do menu vertical', () => {
    it.each([
        ['compact', 32],
        ['comfortable', 40],
        ['spacious', 44],
    ] as const)('a altura calculada em %s é %i px (linha de 20 px mais o respiro nos dois lados)', (density, expected) => {
        expect(Math.max(ICON, toPx(MENU_ITEM_LINE_HEIGHT)) + toPx(verticalMenuItemSpacing(density, 'py')) * 2).toBe(expected);
    });

    it('lê o passo de cada utilidade das próprias classes da densidade', () => {
        expect(verticalMenuItemSpacing('compact', 'gap')).toBe('0.5rem');
        expect(verticalMenuItemSpacing('comfortable', 'px')).toBe('0.75rem');
        expect(verticalMenuItemSpacing('spacious', 'py')).toBe('0.75rem');
        expect(nestedMenuItemIndent('comfortable')).toBe('calc(0.75rem + var(--sarak-sidebar-icon-size, 18px) + 0.75rem)');
    });

    it.each(DENSITIES)('em %s o item aplica as classes do módulo e a busca mede a altura derivada delas', (density) => {
        render(
            <DesignOverrideContext.Provider value={{ sidebarItemDensity: density } as never}>
                <SarakMenuItem label="Módulo" orientation="vertical" />
                <SarakShellSearchWidget menuItemHeight onClick={() => undefined} />
            </DesignOverrideContext.Provider>,
        );
        const classes = screen.getByRole('button', { name: 'Módulo' }).className.split(' ');
        for (const utility of [...VERTICAL_MENU_ITEM_CLASSES[density].split(' '), MENU_ITEM_TEXT_CLASS]) expect(classes).toContain(utility);
        expect(screen.getByRole('combobox').style.height).toBe(verticalMenuItemHeight(density));
    });

    it('a classe do chamador continua vencendo a métrica (R35)', () => {
        render(<SarakMenuItem label="Módulo" orientation="vertical" className="py-0 text-2xs" />);
        const classes = screen.getByRole('button', { name: 'Módulo' }).className.split(' ');
        expect(classes).toContain('py-0');
        expect(classes).not.toContain('py-2.5');
        expect(classes).toContain('text-2xs');
        expect(classes).not.toContain('text-sm');
    });
});
