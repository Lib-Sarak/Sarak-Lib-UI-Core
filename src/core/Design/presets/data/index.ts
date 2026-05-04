import { DASHBOARD_TEMPLATES } from '../../../../constants/design-tokens';

export interface DataPreset {
    id: string;
    name: string;
    design: {
        dashboardTemplate: string;
    };
}

export const DATA_PRESETS: DataPreset[] = DASHBOARD_TEMPLATES.map(template => ({
    id: template.id,
    name: template.name,
    design: {
        dashboardTemplate: template.id
    }
}));
