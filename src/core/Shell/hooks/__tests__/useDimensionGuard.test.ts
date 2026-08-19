// @vitest-environment node
import { describe, it, expect } from 'vitest';
import * as HookModule from '../useDimensionGuard';

describe('useDimensionGuard', () => {
    it('should export the hook correctly', () => {
        expect(HookModule).toBeDefined();
        // TODO: Escrever testes comportamentais para este hook
    });
});
