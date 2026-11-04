/**
 * Cena de medição dos recursos avançados (rc.5): painel arrastável, mapa, assinatura, tour e carrossel.
 * `?modo=light|dark&largura=<px>&tile=1&autoplay=1`. O estado que o teste lê fica em `window.__plan155`.
 */
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
    SarakCarousel,
    SarakDashboardGrid,
    SarakMap,
    SarakSignaturePad,
    SarakTour,
    SarakUIProvider,
    useSarakPreferences,
    type SarakDashboardLayoutItem,
    type SarakSignatureValue,
} from '@sarak/lib-ui-core';

const params = new URLSearchParams(window.location.search);
const colorMode = params.get('modo') === 'light' ? 'light' : 'dark';
const width = Number(params.get('largura') ?? '900');
const withTiles = params.get('tile') === '1';
const autoPlay = params.get('autoplay') === '1';
const TILE_URL = 'https://tiles.invalid/{z}/{x}/{y}.png';

interface Probe {
    layout: SarakDashboardLayoutItem[];
    signature: SarakSignatureValue | null;
    tourClosed: string | null;
    markerClicks: string[];
}

declare global {
    interface Window { __plan155: Probe }
}
window.__plan155 = { layout: [], signature: null, tourClosed: null, markerClicks: [] };

const WIDGETS = [
    { id: 'vendas', title: 'Vendas', content: <p>R$ 10.000</p> },
    { id: 'estoque', title: 'Estoque', content: <p>320 itens</p> },
    { id: 'clientes', title: 'Clientes', content: <p>58 ativos</p> },
];
const INITIAL_LAYOUT: SarakDashboardLayoutItem[] = [
    { id: 'vendas', x: 0, y: 0, w: 4, h: 2 },
    { id: 'estoque', x: 4, y: 0, w: 4, h: 2 },
    { id: 'clientes', x: 0, y: 2, w: 8, h: 2 },
];
const SLIDES = ['um', 'dois', 'três'].map((name) => ({ id: name, content: <p style={{ margin: 0, padding: 16 }}>{name}</p> }));
const TOUR_STEPS = [
    { id: 'a', target: '#tour-alvo', title: 'Este é o alvo', content: 'Primeiro passo.' },
    { id: 'b', title: 'Sem alvo', content: 'Segundo passo.' },
];

const ModeDriver: React.FC = () => {
    const { updatePreferences } = useSarakPreferences();
    useEffect(() => { updatePreferences({ colorMode }); }, [updatePreferences]);
    return null;
};

const Dashboard: React.FC<{ readOnly?: boolean; probe: string }> = ({ readOnly = false, probe }) => {
    const [layout, setLayout] = useState(INITIAL_LAYOUT);
    return (
        <div data-probe={probe}>
            <SarakDashboardGrid
                widgets={WIDGETS}
                layout={layout}
                readOnly={readOnly}
                label={probe}
                onLayoutChange={(next) => { setLayout(next); window.__plan155.layout = next; }}
            />
        </div>
    );
};

const Tour: React.FC = () => {
    const [open, setOpen] = useState(false);
    return (
        <div data-probe="tour">
            <button id="tour-alvo" onClick={() => setOpen(true)}>Iniciar tour</button>
            <SarakTour steps={TOUR_STEPS} open={open} onClose={(reason) => { window.__plan155.tourClosed = reason; setOpen(false); }} />
        </div>
    );
};

const App: React.FC = () => (
    <SarakUIProvider options={{ fonts: 'none' }}>
        <ModeDriver />
        <div data-probe="container" style={{ width, padding: 16 }}>
            <Dashboard probe="dashboard" />
            <Dashboard probe="dashboard-readonly" readOnly />
            <div data-probe="map">
                <SarakMap
                    tileUrl={withTiles ? TILE_URL : undefined}
                    attribution="© Provedor de teste"
                    center={{ lat: -23.55, lng: -46.63 }}
                    zoom={10}
                    markers={[{ id: 'matriz', label: 'Matriz', lat: -23.55, lng: -46.63 }]}
                    onMarkerClick={(marker) => window.__plan155.markerClicks.push(marker.id)}
                    height={260}
                />
            </div>
            <div data-probe="signature">
                <SarakSignaturePad onChange={(value) => { window.__plan155.signature = value; }} width={400} height={160} />
            </div>
            <Tour />
            <div data-probe="carousel">
                <SarakCarousel slides={SLIDES} autoPlay={autoPlay} intervalMs={600} />
            </div>
        </div>
    </SarakUIProvider>
);

const container = document.getElementById('root');
if (!container) throw new Error('plan-155-entry: #root ausente no harness.');
createRoot(container).render(<App />);
