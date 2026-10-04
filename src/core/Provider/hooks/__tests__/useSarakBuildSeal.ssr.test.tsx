/** @vitest-environment node */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { useSarakBuildSeal } from '../useSarakBuildSeal';

const BuildSealProbe = (): null => {
    useSarakBuildSeal('app');
    return null;
};

describe('useSarakBuildSeal no servidor', () => {
    it('renderiza sem acessar document', () => {
        expect(typeof document).toBe('undefined');
        expect(() => renderToStaticMarkup(<BuildSealProbe />)).not.toThrow();
    });
});
