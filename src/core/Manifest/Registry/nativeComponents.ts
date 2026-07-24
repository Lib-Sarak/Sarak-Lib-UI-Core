/**
 * Mapa Nativo de Componentes (Spec 22 — Regra 1)
 *
 * Conjunto oficial de átomos resolvíveis por `type` no Manifesto. As chaves deste
 * mapa derivam o tipo `ComponentType` (união de string-literais), garantindo
 * autocomplete e barrando `type` inválido em tempo de compilação.
 *
 * Os átomos de micro-layout (Spec 10) já existem em `components/atomic/Layouts/` —
 * aqui apenas os registramos (decisão da Onda 0: verificar e conformar, não reescrever).
 * Componentes pesados (DataGrid, PDFViewer, charts) entram aqui via `React.lazy`
 * quando suas specs (12/15) forem implementadas.
 */

import {
    SarakFlex,
    SarakGrid,
    SarakSplitPane,
    SarakTabs,
    SarakAccordion,
    SarakFormGroup,
} from '../../../components/atomic/Layouts';
import {
    SarakDataGrid,
    SarakDataTable,
    SarakSparkline,
    SarakTreeView,
    SarakKanban,
} from '../../../components/atomic/DataDisplay';
import { SarakSkeleton, SarakDataEmpty } from '../../../components/atomic/Feedback';
import { SarakModal, SarakDrawer } from '../../../components/atomic/Modals';
import { SarakTooltip, SarakContextMenu } from '../../../components/atomic/UX';
import {
    SarakInput,
    SarakSelect,
    SarakTextarea,
    SarakSwitch,
    SarakSlider,
    SarakRangeSlider,
    SarakMultiSelect,
    SarakUploader,
    SarakDatePicker,
    SarakTimePicker,
    SarakRichText,
} from '../../../components/atomic/Inputs';
import {
    SarakSpotlight,
    SarakStepper,
    SarakBreadcrumbs,
    SarakPagination,
    SarakShellNav,
    SarakLink,
} from '../../../components/atomic/Navigation';
import {
    SarakMarkdownRenderer,
    SarakLightbox,
    SarakPDFViewer,
} from '../../../components/atomic/Media';
import { SarakButton, SarakIconButton } from '../../../components/atomic/Buttons';
import { SocialButton, SarakTypography } from '../../../components/atomic/Atoms';
import { SarakIcon } from '../../../components/atomic/Icon/SarakIcon';
import { SarakSearch } from '../../../components/atomic/Inputs/SarakSearch';
import { ExpandableCard } from '../../../components/atomic/Cards/ExpandableCard';
import { SarakActionCard } from '../../../components/atomic/Cards/SarakActionCard';
import { SarakSearchCard } from '../../../components/atomic/Cards/SarakSearchCard';
import { SarakTitleCard } from '../../../components/atomic/Cards/SarakTitleCard';
import { SarakEmptyState, SarakBadge } from '../../../components/atomic/Feedback';
import FilterSelect from '../../../components/atomic/Templates/FilterSelect';
import HelpButton from '../../../components/atomic/Templates/HelpButton';
import {
    SarakTable,
    SarakCardGrid,
    SarakStats,
    SarakChart,
    SarakForm,
    SarakManagementGrid,
    SarakChat,
    SarakSecurityOrchestrator,
    SarakAuthScreen,
    SarakCatalogGrid,
    SarakExpandableMatrix,
    ImageCard,
    SarakPageTransition,
} from '../../../components/atomic/Templates';
import { SarakAnalyticalPage } from '../../../components/Layout/SarakAnalyticalPage';
import { SarakHidden } from '../../../components/Layout/SarakHidden';
import { lazy, type ComponentType } from 'react';

/**
 * Tipo largo usado só para os componentes cuja interface de Props não é reexportada
 * publicamente pelo módulo de origem — sem isso, o bundler de `.d.ts` (tsup) falha
 * (TS4023: "has or is using name 'XProps' ... but cannot be named") por não conseguir
 * nomear o tipo inferido no arquivo de declaração. Não afeta `NativeComponentType`
 * (deriva das CHAVES do objeto abaixo, nunca do tipo de valor).
 */
type AnyManifestComponent = ComponentType<Record<string, unknown>>;
const widen = (component: unknown): AnyManifestComponent => component as AnyManifestComponent;

/**
 * Painel do Design Engine (Spec 01) — o ÚNICO type nativo servido pela Camada 3
 * (`features/`). Entra via `React.lazy` (Regra 5): o Registry (Camada 1, ponto de
 * composição oficial — Spec 00 §2) só referencia o módulo de features por import
 * dinâmico, então o bloco pesado do DesignEngine não entra no caminho crítico do
 * bundle nem cria ciclo em runtime. O LeafNode o isola num `<Suspense>` local
 * (HEAVY_LAZY). Os ids legados do Discovery ('mx-customization'/'personalization')
 * continuam registrados em `src/index.ts` — o gate de paridade cobra essa equivalência.
 */
const CustomizationPanel = lazy(() =>
    import('../../../features/DesignEngine/Library/CustomizationPanel').then((mod) => ({
        default: mod.CustomizationPanel,
    })),
);

/**
 * Registro nativo. `as const` em conjunto com `satisfies` mantém a inferência das
 * chaves literais (para derivar `ComponentType`) sem afrouxar a tipagem dos valores.
 *
 * `SarakDataGrid` é o primeiro componente pesado registrado via `React.lazy`
 * (Regra 5): a virtualização (`@tanstack/react-virtual`) só carrega quando um grid
 * é renderizado. O Renderer já envolve a árvore em `<Suspense>`.
 */
export const NATIVE_COMPONENTS = {
    SarakFlex,
    SarakGrid,
    SarakSplitPane,
    SarakTabs,
    SarakAccordion,
    SarakFormGroup,
    SarakDataGrid,
    // Densidade de dados — Spec 12 / Onda 9. DataTable (colunar: pinned/resize/reorder)
    // é pesado → `React.lazy`; Sparkline (SVG in-house) e TreeView (reusa a matriz
    // recursiva) são leves → SEM lazy. Kanban fica para a Onda 10 (gate de dependência DnD).
    SarakDataTable,
    SarakSparkline,
    SarakTreeView,
    // Quadro Kanban (Spec 12, Regra 3 / Onda 10). DnD HTML5 nativo → zero-dep, SEM lazy.
    SarakKanban,
    // Feedback e Interações (Spec 13).
    SarakSkeleton,
    SarakDataEmpty,
    SarakModal,
    SarakDrawer,
    SarakTooltip,
    SarakContextMenu,
    // Formulários — inputs BASE (Spec 11-BASE / Onda 3). Leves: SEM React.lazy.
    // Consumidos pela malha model (Spec 32) + validation (Spec 29) via LeafNode.
    SarakInput,
    SarakSelect,
    SarakTextarea,
    SarakSwitch,
    SarakSlider,
    // Formulários — entrada avançada (Spec 11 / Onda 8). Leves: SEM React.lazy.
    // RangeSlider (duplo), MultiSelect (chips), Uploader (drag-and-drop via
    // react-dropzone), DatePicker (popover in-house + date-fns) e TimePicker.
    SarakRangeSlider,
    SarakMultiSelect,
    SarakUploader,
    SarakDatePicker,
    SarakTimePicker,
    // RichText WYSIWYG blindado (Spec 11, Regra 4 / Onda 10). contentEditable +
    // sanitizeHtml (Spec 40) → zero-dep, SEM lazy.
    SarakRichText,
    // Navegação contextual (Spec 14): Command Palette, Stepper, Breadcrumbs, Paginação.
    SarakSpotlight,
    SarakStepper,
    SarakBreadcrumbs,
    SarakPagination,
    // Átomo de link acessível (lacuna pré-Teste Real): href validado por allow-list
    // de esquema + marcação de link externo.
    SarakLink,
    // Navegação de shell guiada por dados (Spec 33): menu com grupos + estado ativo.
    // Par canônico no manifesto: `activeRoute: "{{$route}}"` + ação navigate `{{$event}}`.
    SarakShellNav: widen(SarakShellNav),
    // Renderizadores de mídia (Spec 15). Markdown + PDFViewer são PESADOS (react-markdown,
    // pdfjs-dist) → `React.lazy`; o LeafNode os envolve num <Suspense> localizado (HEAVY_LAZY).
    // Lightbox é leve (overlay in-house) → SEM lazy.
    SarakMarkdownRenderer,
    SarakLightbox,
    SarakPDFViewer,
    // Átomos fundamentais (Botão/Texto/Ícone/Busca) — antes exportados publicamente
    // ou existentes no código-fonte, mas nunca resolvíveis via `type` no manifesto.
    SarakButton,
    SarakIconButton,
    SocialButton: widen(SocialButton),
    SarakTypography,
    SarakIcon,
    SarakSearch: widen(SarakSearch),
    // Cards (Spec 03).
    ExpandableCard: widen(ExpandableCard),
    SarakActionCard: widen(SarakActionCard),
    SarakSearchCard: widen(SarakSearchCard),
    SarakTitleCard: widen(SarakTitleCard),
    // Feedback adicional (badges/empty states — Skeleton/DataEmpty já registrados acima).
    SarakEmptyState: widen(SarakEmptyState),
    SarakBadge,
    // Templates — "Moldes avançados sem lógica de negócio" (Spec 00), 100% orientados
    // a props/dados, portanto legitimamente resolvíveis via manifesto.
    FilterSelect: widen(FilterSelect),
    HelpButton,
    SarakTable: widen(SarakTable),
    SarakCardGrid: widen(SarakCardGrid),
    SarakStats: widen(SarakStats),
    SarakChart: widen(SarakChart),
    SarakForm: widen(SarakForm),
    SarakManagementGrid: widen(SarakManagementGrid),
    SarakChat: widen(SarakChat),
    SarakSecurityOrchestrator: widen(SarakSecurityOrchestrator),
    SarakAuthScreen,
    SarakCatalogGrid: widen(SarakCatalogGrid),
    SarakExpandableMatrix,
    ImageCard: widen(ImageCard),
    SarakPageTransition: widen(SarakPageTransition),
    // Fôrmas de página e utilitário de dispositivo (components/Layout). As regiões
    // ReactNode (navBar/mainContent/sidePanel) são alimentadas via `slots` do nó.
    SarakAnalyticalPage: widen(SarakAnalyticalPage),
    SarakHidden: widen(SarakHidden),
    // Painel do Design Engine (Spec 01) — Camada 3 via React.lazy (ver acima).
    CustomizationPanel,
} as const;

/** União dos `type` nativos oficiais — fonte do `ComponentType` (Spec 22, Regra 1). */
export type NativeComponentType = keyof typeof NATIVE_COMPONENTS;
