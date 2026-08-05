/**
 * `CustomizationPanel` — fronteira lazy.
 *
 * O painel arrasta o Design Engine inteiro (abas, canvas de preview, controles de token).
 * Exportado eager, ele punia no boot todo consumidor que nunca abre o painel — a dívida
 * mais cara de [[03-superficie-publica]] §8, e a violação direta da regra §7 (*nada pesado
 * sai eager do barril*).
 *
 * `Suspense` é interno, no padrão do `SarakChartEngine`: quem renderiza
 * `<CustomizationPanel />` continua não precisando declarar `Suspense`, e o tipo público
 * segue sendo `React.FC` — a fronteira lazy não vaza para o contrato.
 */
import React, { lazy } from 'react';
import LazyEngineWrapper from '../../../../components/engines/LazyEngineWrapper';

const CustomizationPanelImpl = lazy(() => import('./CustomizationPanelImpl'));

export const CustomizationPanel: React.FC = () => (
    <LazyEngineWrapper>
        <CustomizationPanelImpl />
    </LazyEngineWrapper>
);

export default CustomizationPanel;
