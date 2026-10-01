import { describe, expect, it } from 'vitest';
import { useSarakCardLayoutStyles } from '../useSarakCardLayoutStyles';

describe('useSarakCardLayoutStyles', () => {
    it('usa o token de espaçamento de cartões já existente', () => {
        expect(useSarakCardLayoutStyles()).toContain('--sarak-card-padding-md');
    });
});
