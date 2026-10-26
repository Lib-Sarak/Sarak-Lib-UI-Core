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

    it('calcula a proporção do telefone com a altura escolhida no tema', () => {
        expect(useDeviceStyles('smartphone', { devicePhoneHeight: 900 }).deviceAspectRatio).toBe('375 / 900');
    });

    it('calcula a proporção do tablet com a altura escolhida no tema', () => {
        expect(useDeviceStyles('tablet', { deviceTabletHeight: 1100 }).deviceAspectRatio).toBe('768 / 1100');
    });

});
