import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useTabsOverflow, type SarakTabsOverflow } from '../useTabsOverflow';

const TAB_COUNT = 3;

const Probe = ({ mode }: { mode: SarakTabsOverflow }): React.ReactElement => {
    const state = useTabsOverflow(mode, TAB_COUNT);
    return (
        <div ref={state.wrapperRef} data-hidden={state.hiddenIndexes.size} data-start={String(state.moreAtStart)} data-end={String(state.moreAtEnd)}>
            <div ref={state.listRef} onScroll={state.onScroll} />
        </div>
    );
};

describe('useTabsOverflow', () => {
    it.each<SarakTabsOverflow>(['scroll', 'wrap', 'menu'])('sem medida de layout (%s) nada é escondido nem sinalizado', (mode) => {
        const { container } = render(<Probe mode={mode} />);
        const root = container.firstElementChild as HTMLElement;
        expect(root.dataset.hidden).toBe('0');
        expect(root.dataset.start).toBe('false');
        expect(root.dataset.end).toBe('false');
    });
});
