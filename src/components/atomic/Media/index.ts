/**
 * Renderizadores de Mídia (Spec 15).
 *
 * - `SarakMarkdownRenderer`: lazy (carrega `react-markdown`/`react-syntax-highlighter`
 *   sob demanda — renderize sob `<Suspense>`).
 * - `SarakLightbox`: leve, sem dependência nova.
 *
 * `SarakPDFViewer` (Spec 15, parte 2) entra na Onda 10 (gate de dependência: `pdfjs-dist`).
 */

export { SarakMarkdownRenderer } from './SarakMarkdownRenderer';
export type { SarakMarkdownRendererProps } from './SarakMarkdownRenderer';
export { SarakLightbox } from './SarakLightbox';
export type { LightboxImage, SarakLightboxProps } from './SarakLightbox';
