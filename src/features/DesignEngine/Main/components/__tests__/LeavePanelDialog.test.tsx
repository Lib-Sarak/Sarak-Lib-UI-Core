import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LeavePanelDialog } from '../LeavePanelDialog';

describe('LeavePanelDialog', () => {
    it('fechado, não mostra pergunta', () => {
        render(<LeavePanelDialog isOpen={false} onChoose={vi.fn()} />);

        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it.each([
        ['sarak-panel-leave-stay', 'stay'],
        ['sarak-panel-leave-apply', 'apply'],
        ['sarak-panel-leave-discard', 'discard'],
    ])('aberto, o botão %s entrega a escolha "%s"', async (testId, choice) => {
        const onChoose = vi.fn();
        render(<LeavePanelDialog isOpen onChoose={onChoose} />);

        await userEvent.setup().click(screen.getByTestId(testId));

        expect(onChoose).toHaveBeenCalledWith(choice);
    });

    it('Esc é ficar, nunca descartar', async () => {
        const onChoose = vi.fn();
        render(<LeavePanelDialog isOpen onChoose={onChoose} />);

        await userEvent.setup().keyboard('{Escape}');

        expect(onChoose).toHaveBeenCalledTimes(1);
        expect(onChoose).toHaveBeenCalledWith('stay');
    });
});
