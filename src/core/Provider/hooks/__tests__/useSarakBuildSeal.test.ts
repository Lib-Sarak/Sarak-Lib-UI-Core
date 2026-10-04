import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SARAK_BUILD_INFO_ATTRIBUTE } from '../../buildSeal';
import { SARAK_MODE_ATTRIBUTE } from '../../scope';
import { useSarakBuildSeal } from '../useSarakBuildSeal';

const STYLE_TAG_ID = 'sarak-ui-core-styles';
const BUILD_INFO_DATA_ATTRIBUTE = 'data-sarak-build-info';

beforeEach(() => {
    document.getElementById(STYLE_TAG_ID)?.remove();
    document.documentElement.removeAttribute(SARAK_MODE_ATTRIBUTE);
});

afterEach(() => {
    document.getElementById(STYLE_TAG_ID)?.remove();
});

describe('useSarakBuildSeal', () => {
    it('carimba a folha de estilos da biblioteca no modo App', () => {
        renderHook(() => useSarakBuildSeal('app'));

        expect(document.getElementById(STYLE_TAG_ID)).toHaveAttribute(
            BUILD_INFO_DATA_ATTRIBUTE,
            SARAK_BUILD_INFO_ATTRIBUTE,
        );
    });

    it('não carimba o documento do host no modo Embarcado', () => {
        const styleElement = document.createElement('style');
        styleElement.id = STYLE_TAG_ID;
        document.head.appendChild(styleElement);

        renderHook(() => useSarakBuildSeal('embedded'));

        expect(styleElement).not.toHaveAttribute(BUILD_INFO_DATA_ATTRIBUTE);
    });
});
