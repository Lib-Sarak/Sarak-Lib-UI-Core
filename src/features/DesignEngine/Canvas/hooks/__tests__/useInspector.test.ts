// @vitest-environment node
import { describe, it, expect } from 'vitest';
import * as HookModule from '../useInspector';

describe('useInspector', () => {
    it('should export the hook correctly', () => {
        expect(HookModule).toBeDefined();
        // TODO: Escrever testes comportamentais para este hook
    });
});
