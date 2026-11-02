import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SarakDrawer } from '../../src/components/atomic/Modals/SarakDrawer';
import { SarakModal } from '../../src/components/atomic/Modals/SarakModal';
import { SarakOverlayProvider, useOverlay } from '../../src/components/atomic/Modals/SarakOverlayProvider';
import { SarakFlex } from '../../src/components/atomic/Layouts/SarakFlex';
import { SarakGrid } from '../../src/components/atomic/Layouts/SarakGrid';
import { SarakSegmentedControl } from '../../src/components/atomic/Templates/SarakSegmentedControl';
import { SarakUIProvider } from '../../src/core/Provider/SarakUIProvider';
import { useSarakPreferences } from '../../src/core/Provider/hooks/useSarakPreferences';

const searchParams = new URLSearchParams(window.location.search);
const scene = searchParams.get('cena') ?? 'grade';
const themeId = searchParams.get('tema') ?? 'sarak-sovereign';
const colorMode = searchParams.get('modo') === 'light' ? 'light' : 'dark';
const isEmbedded = searchParams.get('embarcado') === '1';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('plan-146-entry: #root ausente no harness.');

const cell = (id: string): React.ReactElement => (
    <div data-probe={id} style={{ minHeight: 24 }}>{id}</div>
);

const GridScene = (): React.ReactElement => (
    <div style={{ width: 600 }}>
        <SarakGrid data-probe="grade-gap" templateColumns="1fr 1fr" gap="spacing-md">{cell('g1')}{cell('g2')}{cell('g3')}{cell('g4')}</SarakGrid>
        <SarakGrid data-probe="grade-eixos" templateColumns="1fr 1fr" gap="spacing-md" rowGap="spacing-xl" columnGap="spacing-xs">{cell('e1')}{cell('e2')}{cell('e3')}{cell('e4')}</SarakGrid>
        <SarakGrid data-probe="grade-so-linha" templateColumns="1fr 1fr" gap="spacing-md" rowGap="spacing-xl">{cell('l1')}{cell('l2')}{cell('l3')}{cell('l4')}</SarakGrid>
        <SarakFlex data-probe="flex-gap" gap="spacing-md" direction="row">{cell('f1')}{cell('f2')}</SarakFlex>
        <SarakFlex data-probe="flex-eixos" gap="spacing-md" rowGap="spacing-xl" columnGap="spacing-xs" direction="row">{cell('x1')}{cell('x2')}</SarakFlex>
    </div>
);

const DrawerThenModal = (): React.ReactElement => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const overlay = useOverlay();
    return (
        <>
            <button data-probe="abre-gaveta" onClick={() => setDrawerOpen(true)}>Abrir gaveta</button>
            <SarakDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)}>
                <div style={{ padding: 24 }}>
                    <button data-probe="abre-modal" onClick={() => setModalOpen(true)}>Abrir modal</button>
                    <button data-probe="abre-confirmacao" onClick={() => { void overlay.confirm({ title: 'Confirmar?', message: 'Sobre a gaveta' }); }}>Confirmar</button>
                </div>
            </SarakDrawer>
            <SarakModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Modal sobre a gaveta"><p>Conteúdo</p><button data-probe="dentro-do-modal">Dentro</button></SarakModal>
        </>
    );
};

const ModalThenDrawer = (): React.ReactElement => {
    const [modalOpen, setModalOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    return (
        <>
            <button data-probe="abre-modal" onClick={() => setModalOpen(true)}>Abrir modal</button>
            <SarakModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Modal base">
                <button data-probe="abre-gaveta" onClick={() => setDrawerOpen(true)}>Abrir gaveta</button>
            </SarakModal>
            <SarakDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} size={400}>
                <div style={{ padding: 24 }}><button data-probe="dentro-da-gaveta">Dentro</button></div>
            </SarakDrawer>
        </>
    );
};

const SegmentedScene = (): React.ReactElement => (
    <div style={{ width: 600, padding: 24 }}>
        <SarakSegmentedControl ariaLabel="Visão" data-probe="segmentado" defaultValue="b" options={[{ value: 'a', label: 'Dia' }, { value: 'b', label: 'Semana' }, { value: 'c', label: 'Mês' }]} />
    </div>
);

const scenes: Record<string, React.ReactElement> = {
    grade: <GridScene />,
    'gaveta-e-modal': <DrawerThenModal />,
    'modal-e-gaveta': <ModalThenDrawer />,
    segmentado: <SegmentedScene />,
};

/** O modo entra como preferência, o mesmo caminho do `ShellThemeToggle` (specs/specs/09 §4.3). */
const PreferencesDriver = (): null => {
    const { updatePreferences } = useSarakPreferences();
    useEffect(() => { updatePreferences({ colorMode }); }, [updatePreferences]);
    return null;
};

createRoot(rootElement).render(
    <SarakUIProvider initialTheme={themeId} options={{ fonts: 'none', ...(isEmbedded ? { mode: 'embedded' as const } : {}) }}>
        <PreferencesDriver />
        <SarakOverlayProvider>{scenes[scene]}</SarakOverlayProvider>
    </SarakUIProvider>,
);
