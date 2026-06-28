import React, { useMemo } from 'react';
import { 
    MockChat, MockLogs, MockSettings, MockComponents, MockTypography, 
    MockAuth, MockMatrix, MockTable, MockText, MockCharts, MockForms, MockDocuments 
} from '../MockApps';
import { MockDashboard } from '../Mocks/DashboardMock';
import { SarakUIOptions } from '../../../../core/Provider/types';
import { SarakDesignState } from '../../../../core/Provider/types';
import { KitchenSinkPreview } from '../KitchenSinkPreview';

export const usePreviewApps = (tokens: Partial<SarakDesignState>, config: SarakUIOptions, previewAnimationStyle: string) => {
    return useMemo(() => {
        const dummyAnimation = { initial: {}, animate: {}, exit: {} };
        return {
            dashboard: <MockDashboard tokens={tokens} config={config} animationVariants={dummyAnimation} animationStyle={previewAnimationStyle} />,
            forms: <MockForms tokens={tokens} config={config} animationVariants={dummyAnimation} animationStyle={previewAnimationStyle} />,
            chat: <MockChat tokens={tokens} config={config} animationVariants={dummyAnimation} animationStyle={previewAnimationStyle} />,
            logs: <MockLogs tokens={tokens} config={config} animationVariants={dummyAnimation} animationStyle={previewAnimationStyle} />,
            settings: <MockSettings tokens={tokens} config={config} animationVariants={dummyAnimation} animationStyle={previewAnimationStyle} />,
            components: <MockComponents tokens={tokens} />,
            typography: <MockTypography tokens={tokens} />,
            auth: <MockAuth tokens={tokens} />,
            matrix: <MockMatrix tokens={tokens} config={config} animationVariants={dummyAnimation} animationStyle={previewAnimationStyle} />,
            tabela: <MockTable tokens={tokens} config={config} animationVariants={dummyAnimation} animationStyle={previewAnimationStyle} />,
            'caixas-texto': <MockText tokens={tokens} config={config} animationVariants={dummyAnimation} animationStyle={previewAnimationStyle} />,
            graficos: <MockCharts tokens={tokens} config={config} animationVariants={dummyAnimation} animationStyle={previewAnimationStyle} />,
            documentos: <MockDocuments tokens={tokens} config={config} animationVariants={dummyAnimation} animationStyle={previewAnimationStyle} />,
            'kitchen-sink': <KitchenSinkPreview />
        };
    }, [tokens, config, previewAnimationStyle]);
};
