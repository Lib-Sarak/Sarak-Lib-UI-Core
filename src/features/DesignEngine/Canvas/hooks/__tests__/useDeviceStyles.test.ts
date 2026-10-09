// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { useDeviceStyles } from '../useDeviceStyles';

describe('useDeviceStyles', () => {
    it.each([
        ['desktop', '100%'],
        ['tablet', '768px'],
        ['smartphone', '375px'],
    ])('mantém a largura física de %s em %s', (previewDevice, targetWidth) => {
        expect(useDeviceStyles(previewDevice).targetWidth).toBe(targetWidth);
    });

});
