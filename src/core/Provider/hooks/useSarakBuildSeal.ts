import { useEffect } from 'react';
import { SARAK_CSS } from '../__sarakCss';
import { SARAK_BUILD_INFO_ATTRIBUTE } from '../buildSeal';
import { injectSarakStyles } from '../injectStyles';
import type { SarakUIMode } from '../types';

const STYLE_TAG_ID = 'sarak-ui-core-styles';
const BUILD_INFO_DATA_ATTRIBUTE = 'data-sarak-build-info';

export const useSarakBuildSeal = (mode: SarakUIMode): void => {
    useEffect(() => {
        if (mode === 'embedded' || typeof document === 'undefined') return;
        injectSarakStyles(SARAK_CSS);
        document.getElementById(STYLE_TAG_ID)
            ?.setAttribute(BUILD_INFO_DATA_ATTRIBUTE, SARAK_BUILD_INFO_ATTRIBUTE);
    }, [mode]);
};
