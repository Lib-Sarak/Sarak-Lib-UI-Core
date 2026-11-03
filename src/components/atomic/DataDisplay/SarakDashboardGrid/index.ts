/**
 * SarakDashboardGrid — barrel. Carregado sob demanda: `react-grid-layout` (peer opcional) só entra quando um
 * painel é de fato renderizado. A matemática do layout fica FORA da fronteira lazy e continua exportada.
 */

export { SarakDashboardGrid } from './SarakDashboardGrid';
export type { SarakDashboardGridProps, SarakDashboardWidget } from './SarakDashboardGridImpl';
export type { SarakDashboardLayoutItem } from './dashboardLayout';
