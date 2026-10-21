import { describe, expect, it } from 'vitest';
import { compositeCardLayoutClassName } from '../compositeCardLayoutClassName';

describe('compositeCardLayoutClassName', () => {
    it('usa o token de espaçamento de cartões já existente', () => {
        expect(compositeCardLayoutClassName()).toContain('--sarak-card-padding-md');
    });
});
