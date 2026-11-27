import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SarakDataTableFlowBody, SarakDataTableFlowHead, SarakDataTableFlowRow, SarakDataTableSheet } from '../SarakDataTableFlowParts';

describe('SarakDataTableFlowParts', () => {
    it('no fluxo a folha é <table> com cabeçalho, corpo e linhas nativos, todos apresentacionais e em bloco na tela', () => {
        const { container } = render(
            <SarakDataTableSheet flow style={{ width: '100%' }}>
                <SarakDataTableFlowHead><div role="row">cabeçalho</div></SarakDataTableFlowHead>
                <SarakDataTableFlowBody><SarakDataTableFlowRow><div role="row">linha</div></SarakDataTableFlowRow></SarakDataTableFlowBody>
            </SarakDataTableSheet>,
        );
        const table = container.firstElementChild as HTMLElement;
        expect(table.tagName).toBe('TABLE');
        expect(table.querySelector(':scope > thead[data-sarak-table-head] > tr > td [role="row"]')).not.toBeNull();
        expect(table.querySelector(':scope > tbody > tr[data-sarak-print-row] > td [role="row"]')).not.toBeNull();
        table.querySelectorAll('table, thead, tbody, tr, td').forEach((part) => {
            expect(part).toHaveAttribute('role', 'presentation');
            expect((part as HTMLElement).style.display, `${part.tagName.toLowerCase()} na tela`).toBe('block');
        });
        expect(table.style.display).toBe('block');
    });

    it('na janela virtual a folha é <div>', () => {
        const { container } = render(<SarakDataTableSheet flow={false} style={{ height: 10 }}><span>x</span></SarakDataTableSheet>);
        const sheet = container.firstElementChild as HTMLElement;
        expect(sheet.tagName).toBe('DIV');
        expect(sheet.style.height).toBe('10px');
    });
});
