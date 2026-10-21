/** CSS Variables públicas capturadas da geração real do Design Engine. */

import React from 'react';
import { renderToString } from 'react-dom/server';
import { register } from 'tsx/esm/api';

register();

const { useDesignVariables } = await import('../../src/core/Design/hooks/useDesignVariables.ts');
const { sarakGetAllDesignTokens, sarakGetDefaultDesignState } = await import('../../src/core/Design/master-map.ts');

const CSS_VAR_PATTERN = /(--sarak-[a-z0-9-]+)\s*:/g;

const getVariantColor = (tokens) =>
    tokens.find(
        (token) =>
            token.generateVariants &&
            token.type === 'color' &&
            typeof token.defaultValue === 'string' &&
            token.defaultValue !== 'transparent',
    )?.defaultValue;

const captureGeneratedVariables = (design) => {
    let generated;
    const CaptureVariables = () => {
        generated = useDesignVariables(design);
        return null;
    };

    renderToString(React.createElement(CaptureVariables));
    if (!generated) throw new Error('[guide] O Design Engine não gerou suas CSS Variables.');

    return generated;
};

const collectVariableNames = ({ variables, responsiveCSS }) => {
    const responsiveVariables = [...responsiveCSS.matchAll(CSS_VAR_PATTERN)].map((match) => match[1]);
    return [...new Set([...Object.keys(variables), ...responsiveVariables])]
        .filter((name) => name.startsWith('--sarak-'))
        .sort();
};

const generateEmittedSarakCssVars = () => {
    const tokens = sarakGetAllDesignTokens();
    const variantColor = getVariantColor(tokens);
    if (!variantColor) throw new Error('[guide] Não há token de cor apto a gerar variantes.');

    const variantColors = Object.fromEntries(
        tokens
            .filter((token) => token.generateVariants && token.type === 'color')
            .map((token) => [token.id, variantColor]),
    );
    const design = { ...sarakGetDefaultDesignState(), ...variantColors };

    return collectVariableNames(captureGeneratedVariables(design));
};

const EMITTED_SARAK_CSS_VARS = generateEmittedSarakCssVars();

export const collectEmittedSarakCssVars = () => [...EMITTED_SARAK_CSS_VARS];
