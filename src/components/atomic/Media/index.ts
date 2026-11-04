/**
 * Renderizadores de Mídia (Spec 15).
 *
 * - `SarakMarkdownRenderer`: lazy (carrega `react-markdown`/`react-syntax-highlighter`
 *   sob demanda — renderize sob `<Suspense>`).
 * - `SarakLightbox`: leve, sem dependência nova.
 *
 * - `SarakPDFViewer`: lazy (carrega `pdfjs-dist` sob demanda — renderize sob `<Suspense>`).
 */

export { SarakMarkdownRenderer } from './SarakMarkdownRenderer';
export type { SarakMarkdownRendererProps } from './SarakMarkdownRenderer';
export { SarakLightbox } from './SarakLightbox';
export type { SarakLightboxImage, SarakLightboxProps } from './SarakLightbox';
export { SarakPDFViewer } from './SarakPDFViewer';
export type { SarakPDFViewerProps } from './SarakPDFViewer';
// Mapa de blocos (lazy; sem biblioteca de mapa, o provedor é do consumidor).
export * from './SarakMap';
export { SarakQRCode } from './SarakQRCode';
export type { SarakQRCodeProps } from './SarakQRCode';
// Carrossel de slides (sem dependência; sem rotação automática por padrão).
export * from './SarakCarousel';
